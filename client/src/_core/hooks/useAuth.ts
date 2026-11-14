import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const AUTH_LOADING_TIMEOUT_MS = 15000;

export function useAuth() {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<Error | null>(null);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  // Only the backend-resolved internal user can authorize panel access.
  // A browser Supabase session is not an application user by itself.
  const backendAuth = trpc.auth.me.useQuery(undefined, {
    enabled: sessionReady && hasSession,
    retry: false,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    let mounted = true;
    let authEventReceived = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      authEventReceived = true;
      setBootstrapError(null);
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

    // Explicitly resolve the persisted session as a fallback to INITIAL_SESSION.
    // This prevents the dashboard from remaining on its skeleton if the auth
    // event is delayed or missed during browser startup.
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted || authEventReceived) return;

      if (error) {
        setBootstrapError(error);
      } else {
        setHasSession(Boolean(data.session?.access_token));
      }
      setSessionReady(true);
    }).catch((error: unknown) => {
      if (!mounted || authEventReceived) return;
      setBootstrapError(
        error instanceof Error
          ? error
          : new Error("Não foi possível inicializar a sessão de autenticação.")
      );
      setSessionReady(true);
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

  const authLoading = !sessionReady || (hasSession && backendAuth.isLoading);

  useEffect(() => {
    if (!authLoading) {
      setLoadingTimedOut(false);
      return;
    }

    const timeout = window.setTimeout(
      () => setLoadingTimedOut(true),
      AUTH_LOADING_TIMEOUT_MS
    );
    return () => window.clearTimeout(timeout);
  }, [authLoading]);

  const user = backendAuth.data ?? null;
  const loading = authLoading && !loadingTimedOut;
  const error =
    backendAuth.error ??
    bootstrapError ??
    (loadingTimedOut
      ? new Error(
          "A inicialização da autenticação excedeu 15 segundos. Recarregue a página; se persistir, verifique a conexão com o serviço de autenticação."
        )
      : null);

  return {
    user,
    loading,
    error,
    hasSession,
    isAuthenticated: Boolean(user),
    refresh,
    logout,
  };
}
