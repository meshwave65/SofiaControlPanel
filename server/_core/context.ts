import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createClient } from "@supabase/supabase-js";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { sdk } from "./sdk";
import { ENV } from "./env";

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

function safeAuthDiagnosticError(error: unknown) {
  if (!error || typeof error !== "object") {
    return { name: "UnknownError", message: "Unknown authentication error" };
  }
  const item = error as { name?: unknown; message?: unknown; status?: unknown; code?: unknown };
  return {
    name: typeof item.name === "string" ? item.name.slice(0, 80) : "AuthError",
    status: typeof item.status === "number" ? item.status : null,
    code: typeof item.code === "string" ? item.code.slice(0, 100) : null,
  };
}

async function authenticateSupabaseToken(
  accessToken: string,
  correlationId: string | null
): Promise<User> {
  const { data, error } =
    await getSupabaseAuthClient().auth.getUser(accessToken);
  if (error || !data.user) {
    if (correlationId) {
      console.warn("[AuthDiagnostic]", JSON.stringify({
        stage: "supabase.getUser.rejected",
        correlationId,
        error: error ? safeAuthDiagnosticError(error) : { message: "Supabase returned no user" },
        timestamp: new Date().toISOString(),
      }));
    }
    throw new Error("Invalid Supabase access token");
  }

  if (correlationId) {
    console.info("[AuthDiagnostic]", JSON.stringify({
      stage: "supabase.getUser.accepted",
      correlationId,
      timestamp: new Date().toISOString(),
    }));
  }

  const identity = data.user;
  const metadata = identity.user_metadata ?? {};
  const displayName =
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.name === "string" && metadata.name) ||
    identity.email ||
    null;

  try {
    // The SCP database is the canonical source for account existence and role.
    const centralUser = await db.getCentralSCPUserByOpenId(identity.id);
    if (!centralUser) {
      if (correlationId) {
        console.error("[AuthDiagnostic]", JSON.stringify({
          stage: "central_scp.user_not_found",
          correlationId,
          timestamp: new Date().toISOString(),
        }));
      }
      throw new Error("Authenticated identity is not registered in the central SCP user database");
    }

    // Keep a local Sandbox user row only as an operational FK reference.
    await db.upsertUser({
      openId: identity.id,
      name: centralUser.name ?? displayName,
      email: centralUser.email ?? identity.email ?? null,
      loginMethod: centralUser.loginMethod ?? "supabase",
      lastSignedIn: new Date(),
    });

    const sandboxUser = await db.getUserByOpenId(identity.id);
    if (!sandboxUser) {
      if (correlationId) {
        console.error("[AuthDiagnostic]", JSON.stringify({
          stage: "sandbox.user_shadow_not_found",
          correlationId,
          timestamp: new Date().toISOString(),
        }));
      }
      throw new Error("Central identity was found but the Sandbox operational user record could not be created");
    }

    const normalizedEmail = String(centralUser.email ?? identity.email ?? "").trim().toLowerCase();
    const isMasterAdmin = Boolean(normalizedEmail && ENV.masterAdminEmails.includes(normalizedEmail));
    const centralRole = centralUser.role === "admin" || isMasterAdmin ? "admin" : "user";
    if (correlationId) {
      console.info("[AuthDiagnostic]", JSON.stringify({
        stage: "central_scp.user_resolved",
        correlationId,
        timestamp: new Date().toISOString(),
      }));
    }
    return {
      ...sandboxUser,
      name: centralUser.name ?? sandboxUser.name,
      email: centralUser.email ?? sandboxUser.email,
      role: centralRole,
    };
  } catch (dbError) {
    if (correlationId) {
      console.error("[AuthDiagnostic]", JSON.stringify({
        stage: "database.user_resolution_failed",
        correlationId,
        error: safeAuthDiagnosticError(dbError),
        timestamp: new Date().toISOString(),
      }));
    }
    throw dbError;
  }
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  const rawCorrelationId = opts.req.headers["x-scp-auth-diagnostic"];
  const correlationId = typeof rawCorrelationId === "string" && /^[a-zA-Z0-9-]{1,80}$/.test(rawCorrelationId)
    ? rawCorrelationId
    : null;

  try {
    const authorization = opts.req.headers.authorization;
    if (authorization) {
      const match = authorization.match(/^Bearer\s+(.+)$/i);
      if (!match) throw new Error("Malformed Authorization header");
      user = await authenticateSupabaseToken(match[1], correlationId);
    } else {
      const cookies = parseCookieHeader(opts.req.headers.cookie ?? "");
      if (cookies[COOKIE_NAME]) {
        user = await sdk.authenticateRequest(opts.req);
      } else if (correlationId) {
        console.warn("[AuthDiagnostic]", JSON.stringify({
          stage: "request.no_auth_credential",
          correlationId,
          timestamp: new Date().toISOString(),
        }));
      }
    }
  } catch (error) {
    // Public procedures remain available, but protected procedures fail closed.
    // Do not persist arbitrary provider/database error messages in backend logs.
    console.warn("[Auth] Request authentication failed");
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
