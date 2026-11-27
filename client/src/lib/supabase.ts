import { createClient } from "@supabase/supabase-js";

// Authentication is centralized in the SCP Supabase project.
// Sandbox operational data continues to use its own DATABASE_URL on the backend.
const supabaseUrl = "https://ufylccbdjfzydbwhpmpp.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY for the SCP Supabase project.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    flowType: "pkce",
    detectSessionInUrl: false,
  },
});
