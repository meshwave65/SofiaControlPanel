import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createClient } from "@supabase/supabase-js";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

let supabaseAuthClient: ReturnType<typeof createClient> | null = null;

function getSupabaseAuthClient() {
  if (supabaseAuthClient) return supabaseAuthClient;

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const apiKey =
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_API_KEY;
  if (!url || !apiKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_ANON_KEY must be configured to validate Supabase sessions"
    );
  }

  supabaseAuthClient = createClient(url, apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
  return supabaseAuthClient;
}

async function authenticateSupabaseToken(accessToken: string): Promise<User> {
  const { data, error } =
    await getSupabaseAuthClient().auth.getUser(accessToken);
  if (error || !data.user) {
    throw new Error("Invalid Supabase access token");
  }

  const identity = data.user;
  const metadata = identity.user_metadata ?? {};
  const displayName =
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.name === "string" && metadata.name) ||
    identity.email ||
    null;

  await db.upsertUser({
    openId: identity.id,
    name: displayName,
    email: identity.email ?? null,
    loginMethod: "supabase",
    lastSignedIn: new Date(),
  });

  const user = await db.getUserByOpenId(identity.id);
  if (!user) {
    throw new Error(
      "Authenticated Supabase user could not be loaded from the database"
    );
  }
  return user;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const authorization = opts.req.headers.authorization;
    if (authorization) {
      const match = authorization.match(/^Bearer\s+(.+)$/i);
      if (!match) throw new Error("Malformed Authorization header");
      user = await authenticateSupabaseToken(match[1]);
    } else {
      const cookies = parseCookieHeader(opts.req.headers.cookie ?? "");
      if (cookies[COOKIE_NAME]) {
        user = await sdk.authenticateRequest(opts.req);
      }
    }
  } catch (error) {
    // Public procedures remain available, but protected procedures fail closed.
    console.warn(
      "[Auth] Request authentication failed:",
      error instanceof Error ? error.message : error
    );
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
