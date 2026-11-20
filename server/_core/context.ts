import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createClient } from "@supabase/supabase-js";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { sdk } from "./sdk";
import { ENV } from "./env";
export type TrpcContext = { req: CreateExpressContextOptions["req"]; res: CreateExpressContextOptions["res"]; user: User | null };
let supabaseAuthClient: ReturnType<typeof createClient> | null = null;
function getSupabaseAuthClient() {
  if (supabaseAuthClient) return supabaseAuthClient;
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const apiKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_API_KEY;
  if (!url || !apiKey) throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be configured to validate Supabase sessions");
  supabaseAuthClient = createClient(url, apiKey, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
  return supabaseAuthClient;
}
function safeAuthError(error: unknown) {
  if (!error || typeof error !== "object") return { name: "UnknownError", message: "Unknown authentication error" };
  const item = error as { name?: unknown; message?: unknown; status?: unknown; code?: unknown };
  const message = typeof item.message === "string" ? item.message.replace(/Bearer\s+[^\s]+/gi, "Bearer [redacted]").replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]").slice(0, 300) : "Authentication failed";
  return { name: typeof item.name === "string" ? item.name.slice(0, 80) : "AuthError", status: typeof item.status === "number" ? item.status : null, code: typeof item.code === "string" ? item.code.slice(0, 100) : null, message };
}
async function authenticateSupabaseToken(accessToken: string, correlationId: string | null): Promise<User> {
  const result = await getSupabaseAuthClient().auth.getUser(accessToken);
  if (result.error || !result.data.user) {
    console.warn("[AuthDiagnostic]", JSON.stringify({ stage: "supabase.getUser.rejected", correlationId, error: result.error ? safeAuthError(result.error) : { message: "Supabase returned no user" }, timestamp: new Date().toISOString() }));
    throw new Error("Invalid Supabase access token");
  }
  const identity = result.data.user;
  const metadata = identity.user_metadata ?? {};
  const displayName = (typeof metadata.full_name === "string" && metadata.full_name) || (typeof metadata.name === "string" && metadata.name) || identity.email || null;
  try {
    await db.upsertUser({ openId: identity.id, name: displayName, email: identity.email ?? null, loginMethod: "supabase", lastSignedIn: new Date() });
    const user = await db.getUserByOpenId(identity.id);
    if (!user) {
      console.error("[AuthDiagnostic]", JSON.stringify({ stage: "database.user_not_found", correlationId, timestamp: new Date().toISOString() }));
      throw new Error("Authenticated Supabase user could not be loaded from the database");
    }
    const normalizedEmail = user.email?.trim().toLowerCase();
    const isMasterAdmin = Boolean(normalizedEmail && ENV.masterAdminEmails.includes(normalizedEmail));
    console.info("[AuthDiagnostic]", JSON.stringify({ stage: "database.user_resolved", correlationId, timestamp: new Date().toISOString() }));
    return isMasterAdmin ? { ...user, role: "admin" } : user;
  } catch (error) {
    if (error instanceof Error && error.message === "Authenticated Supabase user could not be loaded from the database") throw error;
    console.error("[AuthDiagnostic]", JSON.stringify({ stage: "database.user_resolution_failed", correlationId, error: safeAuthError(error), timestamp: new Date().toISOString() }));
    throw error;
  }
}
export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  const rawId = opts.req.headers["x-scp-auth-diagnostic"];
  const correlationId = typeof rawId === "string" && /^[a-zA-Z0-9-]{1,80}$/.test(rawId) ? rawId : null;
  try {
    const authorization = opts.req.headers.authorization;
    if (authorization) {
      const match = authorization.match(/^Bearer\s+(.+)$/i);
      if (!match) throw new Error("Malformed Authorization header");
      user = await authenticateSupabaseToken(match[1], correlationId);
    } else {
      const cookies = parseCookieHeader(opts.req.headers.cookie ?? "");
      if (cookies[COOKIE_NAME]) user = await sdk.authenticateRequest(opts.req);
      else if (correlationId) console.warn("[AuthDiagnostic]", JSON.stringify({ stage: "request.no_auth_credential", correlationId, timestamp: new Date().toISOString() }));
    }
  } catch (error) {
    console.warn("[Auth] Request authentication failed:", error instanceof Error ? error.message : "Unknown error");
    user = null;
  }
  return { req: opts.req, res: opts.res, user };
}
