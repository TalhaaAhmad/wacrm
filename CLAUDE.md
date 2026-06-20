# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> **Next.js 16 (App Router) with breaking changes** — per AGENTS.md, read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code. APIs may differ from training data (e.g. `cookies()` is async, awaited in `src/lib/supabase/server.ts`).

## What this is

`wacrm` — a self-hostable WhatsApp CRM **template** (fork → customise → deploy, not a SaaS). Shared inbox on the official WhatsApp Business API (Meta Cloud API), contacts/tags/custom-fields, broadcasts with delivery tracking, no-code automations/flows, and a Shopify order-notification integration. Stack: Next.js 16 + React 19 + TypeScript + Tailwind v4 + Supabase (Postgres + Auth + Storage + RLS).

## Commands

```bash
npm run dev          # dev server (http://localhost:3000)
npm run build        # production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm test             # vitest run (one-shot)
npm run test:watch   # vitest watch
npm run format       # prettier --write .
```

Run a single test file: `npx vitest run src/lib/whatsapp/encryption.test.ts`. Tests are co-located as `*.test.ts` next to the unit under test. CI (`.github/workflows/ci.yml`) runs lint → typecheck → test → build on every PR/push to `main`; all four must pass.

Required env vars (read at module load, so missing ones break build/tests): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ENCRYPTION_KEY` (64 hex chars = 32 bytes for AES-256). `META_APP_SECRET` is now an **optional fallback** — the Meta App Secret is configured per-account in Settings → WhatsApp (stored encrypted as `whatsapp_config.app_secret`) and the webhook only falls back to the env var when a row has no secret set. See CI env block for placeholder shapes.

## Architecture

**Auth & request flow.** `src/middleware.ts` runs on every non-static route: refreshes the Supabase session cookie, redirects unauthenticated users away from protected pages (`/dashboard`, `/inbox`, `/contacts`, `/broadcasts`, `/settings`), and 401s unauthenticated `/api/whatsapp/*` calls **except** webhooks. Route groups: `src/app/(auth)/*` (login/signup/forgot-password) and `src/app/(dashboard)/*` (the app shell).

**Two Supabase client patterns — pick the right one:**
- `src/lib/supabase/server.ts` `createClient()` — anon key + user cookies, **RLS-enforced**. Use in Server Components and any API route acting on behalf of the logged-in user.
- `src/lib/supabase/client.ts` — browser client for Client Components (realtime subscriptions, optimistic UI).
- `createClient` from `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY` — **bypasses RLS**. Used only in webhook handlers (`src/app/api/whatsapp/webhook`, `src/app/api/shopify/webhook`) where there is no user session. Lazy-initialized to avoid build-time crashes on missing env. Be deliberate: service-role queries must filter by `user_id` themselves since RLS won't.

**Every table is RLS-scoped by `auth.uid() = user_id`.** Data is single-tenant-per-user (each account owns its own contacts, conversations, config). Schema lives in `supabase/migrations/NNN_*.sql`, applied in numeric order; migrations are written **idempotent** (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`). When adding columns/constraints, add a new numbered migration — don't edit old ones — and keep the matching TypeScript types in `src/types/index.ts` in sync.

**WhatsApp / Meta Cloud API** (`src/lib/whatsapp/`):
- `meta-api.ts` — all Meta send helpers. **Every function takes a single named-options object, never positional args** (deliberate: positional caused repeated swapped-arg bugs — see file header). Covers text, template, reaction, interactive button/list (with Meta limits validated *before* the network call), and the two-step media proxy (`getMediaUrl` → `downloadMedia`).
- `encryption.ts` — access/verify tokens are encrypted at rest with **AES-256-GCM**. `decrypt()` auto-detects legacy CBC (one colon) vs current GCM (two colons); call sites self-heal legacy rows by re-encrypting with `encrypt()` after a successful decrypt (`isLegacyFormat` gate — see `send/route.ts` and `webhook/route.ts`).
- `webhook-signature.ts` — inbound webhooks are HMAC-verified over the **raw request bytes** against a caller-supplied secret. The POST handler reads `request.text()` (not `.json()`) so the signed bytes aren't re-encoded; invalid signatures return 401. The secret is resolved **per-account**: the handler parses the (untrusted) payload to read `phone_number_id`, looks up that config's encrypted `app_secret`, and falls back to the `META_APP_SECRET` env var if none is stored. Parsing-before-verifying is safe because nothing in the payload is acted on until the signature passes. Verification fails closed when no secret is available.
- `phone-utils.ts` — phone normalization/E.164 validation and **variant retry**: sends retry across phone-number variants on Meta's "recipient not in allowed list" error, then persist the working format back to the contact.

**Inbound webhook** (`src/app/api/whatsapp/webhook/route.ts`): GET verifies the subscribe challenge against any config's decrypted `verify_token`; POST verifies the signature, acks Meta within their timeout, then processes **asynchronously** (`processWebhook(...).catch(...)`). Status updates follow a strict forward-only ladder `pending → sent → delivered → read → replied` (`isValidStatusTransition`) — replays must never regress, and `failed` is only valid from pre-delivered states. Reactions are *not* messages — they upsert/delete `message_reactions` keyed by `(message_id, actor_type, actor_id)`.

**Realtime.** `messages`/`conversations` (migration 001), `message_reactions` (009), and `flow_runs` (010) are in the `supabase_realtime` publication. The inbox subscribes via `src/hooks/use-realtime.ts`. **Gotcha:** every realtime table is RLS-protected, and postgres_changes enforces RLS using the socket's JWT — but supabase-js only auto-authenticates the socket on `SIGNED_IN`/`TOKEN_REFRESHED`, *not* on `INITIAL_SESSION` (the cookie-restore that fires on page load with `@supabase/ssr`). So the socket must be explicitly authenticated via `supabase.realtime.setAuth()` (done in `src/lib/supabase/client.ts` and awaited before subscribe in `use-realtime.ts`); without it, an anon socket silently receives zero events and inbound messages only appear after a manual refetch.

**Rate limiting** (`src/lib/rate-limit.ts`): in-memory fixed-window counter, per-user keys scoped per route (`send:${userId}` etc.). Single-process only — documented to swap for Redis/Upstash if scaling beyond one instance.

**Broadcasts.** 4-step wizard (`src/components/broadcasts/step1..4`). Per-recipient rows in `broadcast_recipients` carry `whatsapp_message_id`; the webhook mirrors Meta status events onto them, and a DB aggregate trigger (migration 005) re-derives the parent broadcast's sent/delivered/read/replied/failed counts.

**Shopify integration** (`src/app/api/shopify/*`, migration 013/014): per-store webhook endpoint `webhook/[storeId]`, HMAC-verified, maps order events (`order_created`/`order_fulfilled`) to WhatsApp templates via configurable variable mappings; results logged to `shopify_webhook_logs`.

**Frontend.** Tailwind v4 (config-less, `@import` in CSS). UI primitives in `src/components/ui/*` are shadcn-style built on `@base-ui/react`; `cn()` (`src/lib/utils.ts`) merges classes. Feature components grouped by domain (`inbox/`, `contacts/`, `broadcasts/`, `settings/`, `dashboard/`). Theming via `src/lib/themes.ts` + `use-theme.tsx`; auth context in `use-auth.tsx`.

## Security headers

`next.config.ts` sets HSTS, nosniff, X-Frame-Options DENY, Permissions-Policy, and a CSP. The CSP currently ships as **`Content-Security-Policy-Report-Only`** (non-blocking) — flip the key to `Content-Security-Policy` to enforce once confident. Meta API calls are all server-side, so `graph.facebook.com` is deliberately absent from `connect-src`. Note the Cache-Control rules exist to fix a Hostinger CDN stale-HTML issue — read the comment before changing them.
