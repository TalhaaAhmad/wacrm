-- ============================================================
-- Per-user Meta App Secret on whatsapp_config.
--
-- Moves the app secret (used for webhook HMAC verification) out of the
-- global META_APP_SECRET env var and into per-account configuration, so
-- each user can set it from Settings → WhatsApp alongside their other
-- credentials.
--
-- Nullable: existing rows (and deployments that still rely on the env
-- var) keep working — the webhook handler falls back to META_APP_SECRET
-- when this column is null. Stored encrypted (AES-256-GCM) exactly like
-- access_token / verify_token; never in plaintext.
--
-- Idempotent — safe to run multiple times.
-- ============================================================
ALTER TABLE whatsapp_config
  ADD COLUMN IF NOT EXISTS app_secret TEXT;
