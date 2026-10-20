import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useAuth() {
  const utils = trpc.useUtils();
  const backendAuth = trpc.auth.me.useQuery(undefined, { retry: false });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      void utils.auth.me.invalidate();
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email,
          email: session.user.email,
          role: "user",
          token: session.access_token,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email,
          email: session.user.email,
          role: "user",
          token: session.access_token,
        });
      }
      void utils.auth.me.invalidate();
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [utils]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    utils.auth.me.invalidate();
  }, [utils]);

  const state = useMemo(
    () => ({
      user: backendAuth.data ?? user,
      loading,
      error: null,
      isAuthenticated: Boolean(user || backendAuth.data),
    }),
    [user, loading, backendAuth.data]
  );

  return {
    ...state,
    refresh: () => supabase.auth.refreshSession(),
    logout,
  };
}
