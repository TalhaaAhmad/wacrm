"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message, Conversation } from "@/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface RealtimeEvent<T> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: Partial<T>;
}

interface UseRealtimeOptions {
  channelName: string;
  onMessageEvent?: (event: RealtimeEvent<Message>) => void;
  onConversationEvent?: (event: RealtimeEvent<Conversation>) => void;
  enabled?: boolean;
}

export function useRealtime({
  channelName,
  onMessageEvent,
  onConversationEvent,
  enabled = true,
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Store latest callbacks in refs to avoid re-subscribing when the
  // parent re-renders with fresh closures. Assigned inside an effect
  // so the mutation doesn't happen during render (React 19's refs
  // rule) — subscribers only read `.current` inside async Realtime
  // callbacks, which always run after the render that updates it.
  const onMessageRef = useRef(onMessageEvent);
  const onConversationRef = useRef(onConversationEvent);
  useEffect(() => {
    onMessageRef.current = onMessageEvent;
    onConversationRef.current = onConversationEvent;
  });

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    (async () => {
      // Authenticate the realtime socket with the user's JWT BEFORE
      // subscribing. `messages` and `conversations` are RLS-protected
      // (auth.uid() = user_id), and Realtime's postgres_changes enforces
      // RLS per-subscriber using the socket's token — an unauthenticated
      // (anon) socket has no auth.uid(), so every event is silently
      // dropped and inbound messages never arrive live.
      //
      // supabase-js only auto-sets this token on SIGNED_IN / TOKEN_REFRESHED,
      // NOT on INITIAL_SESSION — which is what fires when @supabase/ssr
      // restores the session from the cookie on a fresh page load. So
      // without this explicit call, realtime works right after login but
      // breaks on every reload until the next token refresh. setAuth() with
      // no argument pulls the current token from the session.
      await supabase.realtime.setAuth();
      if (cancelled) return;

      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages" },
          (payload) => {
            onMessageRef.current?.({
              eventType: payload.eventType as RealtimeEvent<Message>["eventType"],
              new: payload.new as Message,
              old: payload.old as Partial<Message>,
            });
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "conversations" },
          (payload) => {
            onConversationRef.current?.({
              eventType: payload.eventType as RealtimeEvent<Conversation>["eventType"],
              new: payload.new as Conversation,
              old: payload.old as Partial<Conversation>,
            });
          }
        )
        .subscribe((status) => {
          setIsConnected(status === "SUBSCRIBED");
        });

      channelRef.current = channel;
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
      channelRef.current = null;
      setIsConnected(false);
    };
  }, [channelName, enabled]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      const supabase = createClient();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsConnected(false);
    }
  }, []);

  return { isConnected, unsubscribe };
}
