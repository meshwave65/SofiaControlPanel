import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_API_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    flowType: "pkce",
    detectSessionInUrl: false,
  },
});

// Keep the current access token and bootstrap state in memory. Register this
// listener immediately after createClient so INITIAL_SESSION cannot be missed
// by React effects that subscribe later.
let currentAccessToken: string | null = null;
let authSessionReady = false;
let hasSupabaseSession = false;

supabase.auth.onAuthStateChange((_event, session) => {
  currentAccessToken = session?.access_token ?? null;
  hasSupabaseSession = Boolean(session?.access_token);
  authSessionReady = true;
});

export function getSupabaseAccessToken(): string | null {
  return currentAccessToken;
}

export function getSupabaseAuthSnapshot(): {
  ready: boolean;
  hasSession: boolean;
} {
  return {
    ready: authSessionReady,
    hasSession: hasSupabaseSession,
  };
}
