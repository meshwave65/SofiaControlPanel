import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      setHasSession(Boolean(session?.access_token));
      setSessionReady(true);

      // Never reuse protected query results across different Supabase sessions.
      // SIGNED_IN/SIGNED_OUT are identity boundaries; token refreshes are not.
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        queryClient.clear();
      }

      queueMicrotask(() => {
        if (mounted && session?.access_token) {
          void utils.auth.me.invalidate();
        }
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient, utils]);

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
    hasSession,
    isAuthenticated: Boolean(user),
    refresh,
    logout,
  };
}
