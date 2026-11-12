import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

export function useAuth() {
  const utils = trpc.useUtils();
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  // Only the backend-resolved internal user can authorize panel access.
  // A browser Supabase session is not an application user by itself.
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
      queueMicrotask(() => {
        if (mounted) void utils.auth.me.invalidate();
      });
    });

    void supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error) console.error("[Auth] Could not read Supabase session:", error);
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
    window.location.replace("/");
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
