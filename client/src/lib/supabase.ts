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

// Keep the current access token in memory. Auth events include INITIAL_SESSION,
// SIGNED_IN, TOKEN_REFRESHED and SIGNED_OUT, so API transport never needs to
// re-enter Supabase's session lock while a request is being prepared.
let currentAccessToken: string | null = null;

supabase.auth.onAuthStateChange((_event, session) => {
  currentAccessToken = session?.access_token ?? null;
});

export function getSupabaseAccessToken(): string | null {
  return currentAccessToken;
}
