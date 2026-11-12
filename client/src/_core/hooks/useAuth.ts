import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

export function useAuth() {
  const utils = trpc.useUtils();
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  // The backend is the source of truth for the application user and role.
  // A Supabase browser session alone must not be treated as an authenticated
  // Control Panel session: the API must validate the token and resolve its
  // corresponding internal user first.
  const backendAuth = trpc.auth.me.useQuery(undefined, {
    enabled: sessionReady && hasSession,
    retry: false,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setHasSession(Boolean(session?.access_token));
      setSessionReady(true);
      // Defer invalidation until after the auth callback has returned. The
      // next request will then read the current access token in the tRPC link.
      queueMicrotask(() => {
        if (mounted) void utils.auth.me.invalidate();
      });
    });

    void supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error) {
        console.error("[Auth] Could not read Supabase session:", error);
      }
      setHasSession(Boolean(session?.access_token));
      setSessionReady(true);
    }).catch((error) => {
      if (!mounted) return;
      console.error("[Auth] Session initialization failed:", error);
      setHasSession(false);
      setSessionReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [utils]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setHasSession(false);
    await utils.auth.me.invalidate();
  }, [utils]);

  const refresh = useCallback(async () => {
    const result = await supabase.auth.refreshSession();
    setHasSession(Boolean(result.data.session?.access_token));
    await utils.auth.me.invalidate();
    return result;
  }, [utils]);

  const user = backendAuth.data ?? null;
  const loading = !sessionReady || (hasSession && backendAuth.isLoading);

  return {
    user,
    loading,
    error: backendAuth.error ?? null,
    isAuthenticated: Boolean(user),
    refresh,
    logout,
  };
}
