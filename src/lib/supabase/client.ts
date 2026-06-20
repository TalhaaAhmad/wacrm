import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton instance — one client shared across the whole browser session.
// Creating multiple clients causes auth-lock contention ("Lock was released
// because another request stole it") and intermittent fetch failures.
let browserClient: SupabaseClient | undefined

export function createClient() {
  if (browserClient) return browserClient

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Push the user's JWT onto the realtime socket as soon as the client is
  // created. supabase-js only does this automatically on SIGNED_IN /
  // TOKEN_REFRESHED — NOT on INITIAL_SESSION, which is what fires when
  // @supabase/ssr restores the session from the cookie on page load. Every
  // realtime table here is RLS-protected (auth.uid() = user_id), and
  // postgres_changes enforces RLS per-subscriber, so an unauthenticated
  // socket receives nothing. setAuth() with no token reads the current
  // session; it re-pushes the token to any already-joined channels, so
  // this single call covers every channel on the shared socket (inbox
  // messages/conversations, per-conversation reactions, unread counts).
  // Fire-and-forget: the awaited call in useRealtime guarantees ordering
  // for the main inbox channel.
  void browserClient.realtime.setAuth()

  return browserClient
}
