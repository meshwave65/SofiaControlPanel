import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createClient } from "@supabase/supabase-js";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { sdk } from "./sdk";
import { ENV } from "./env";
import { isCentralAdmin, isEnvironmentAuthorized } from "./environmentAccess";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

let supabaseAuthClient: ReturnType<typeof createClient> | null = null;

function getSupabaseAuthClient() {
  if (supabaseAuthClient) return supabaseAuthClient;

  const url = ENV.supabaseAuthUrl;
  const apiKey = ENV.supabaseAuthAnonKey;
  if (!url || !apiKey) {
    throw new Error(
      "SUPABASE_AUTH_URL and SUPABASE_AUTH_ANON_KEY must be configured to validate central Supabase sessions",
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
  correlationId: string | null,
): Promise<User> {
  const { data, error } = await getSupabaseAuthClient().auth.getUser(accessToken);
  if (error || !data.user) {
    if (correlationId) {
      console.warn("[AuthDiagnostic]", JSON.stringify({
        stage: "supabase.getUser.rejected",
        correlationId,
        error: error ? safeAuthDiagnosticError(error) : { message: "Supabase returned no user" },
        timestamp: new Date().toISOString(),
      }));
    }
    throw new Error("Invalid central Supabase access token");
  }

  const identity = data.user;
  if (!isEnvironmentAuthorized(identity.app_metadata, ENV.appEnvironment)) {
    if (correlationId) {
      console.warn("[AuthDiagnostic]", JSON.stringify({
        stage: "environment_access.denied",
        correlationId,
        environment: ENV.appEnvironment,
        timestamp: new Date().toISOString(),
      }));
    }
    throw new Error("Identity is not authorized for this environment");
  }

  if (correlationId) {
    console.info("[AuthDiagnostic]", JSON.stringify({
      stage: "supabase.getUser.accepted",
      correlationId,
      environment: ENV.appEnvironment,
      timestamp: new Date().toISOString(),
    }));
  }

  const metadata = identity.user_metadata ?? {};
  const displayName =
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.name === "string" && metadata.name) ||
    identity.email ||
    null;
  const centralAdmin = isCentralAdmin(identity.app_metadata);

  try {
    await db.upsertUser({
      openId: identity.id,
      name: displayName,
      // Email is not an authorization key; do not project it into Sandbox.
      // This also prevents the legacy email allowlist from granting Sandbox admin.
      email: ENV.appEnvironment === "sandbox" ? null : (identity.email ?? null),
      loginMethod: "supabase",
      role: centralAdmin ? "admin" : "user",
      lastSignedIn: new Date(),
    });

    const user = await db.getUserByOpenId(identity.id);
    if (!user) {
      if (correlationId) {
        console.error("[AuthDiagnostic]", JSON.stringify({
          stage: "database.user_not_found",
          correlationId,
          timestamp: new Date().toISOString(),
        }));
      }
      throw new Error("Authenticated central identity could not be loaded from the environment database");
    }

    const normalizedEmail = user.email?.trim().toLowerCase();
    const legacyMasterAdmin =
      ENV.appEnvironment === "scp" &&
      Boolean(normalizedEmail && ENV.masterAdminEmails.includes(normalizedEmail));
    if (correlationId) {
      console.info("[AuthDiagnostic]", JSON.stringify({
        stage: "database.user_resolved",
        correlationId,
        timestamp: new Date().toISOString(),
      }));
    }
    return centralAdmin || legacyMasterAdmin ? { ...user, role: "admin" } : user;
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
  opts: CreateExpressContextOptions,
): Promise<TrpcContext> {
  let user: User | null = null;
  const rawCorrelationId = opts.req.headers["x-scp-auth-diagnostic"];
  const correlationId =
    typeof rawCorrelationId === "string" && /^[a-zA-Z0-9-]{1,80}$/.test(rawCorrelationId)
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
      if (cookies[COOKIE_NAME] && ENV.appEnvironment === "scp") {
        // Legacy Manus cookie remains SCP-only; Sandbox accepts central Auth Bearer tokens only.
        user = await sdk.authenticateRequest(opts.req);
      } else if (cookies[COOKIE_NAME] && correlationId) {
        console.warn("[AuthDiagnostic]", JSON.stringify({
          stage: "legacy_cookie.rejected_for_environment",
          correlationId,
          environment: ENV.appEnvironment,
          timestamp: new Date().toISOString(),
        }));
      } else if (correlationId) {
        console.warn("[AuthDiagnostic]", JSON.stringify({
          stage: "request.no_auth_credential",
          correlationId,
          timestamp: new Date().toISOString(),
        }));
      }
    }
  } catch (error) {
    console.warn("[Auth] Request authentication failed");
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
