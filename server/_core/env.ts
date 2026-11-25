const appEnvironment = process.env.SCP_ENVIRONMENT?.trim().toLowerCase() === "sandbox"
  ? "sandbox"
  : "scp";

const storageUrl =
  process.env.SUPABASE_STORAGE_URL ??
  process.env.SUPABASE_URL ??
  "";

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  // OWNER_OPEN_ID and email-based admin allowlists are legacy SCP-only controls.
  // Sandbox authorization is derived exclusively from central Auth app_metadata.
  ownerOpenId: appEnvironment === "sandbox" ? "" : (process.env.OWNER_OPEN_ID ?? ""),
  masterAdminEmails: Array.from(new Set([
    "meshwave65@gmail.com",
    ...(process.env.MASTER_ADMIN_EMAILS ?? "info@meshwave.com.br")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  ])),
  githubPat: process.env.GITHUB_PAT ?? "",
  githubOwner: process.env.GITHUB_OWNER ?? "meshwave65",
  githubRepo: process.env.GITHUB_REPO ?? "SofiaControlPanel",
  githubBranch: process.env.GITHUB_BRANCH ?? "main",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  llmProvider: process.env.LLM_PROVIDER ?? "forge",
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  groqModel: process.env.GROQ_MODEL ?? "openai/gpt-oss-120b",

  // Central identity provider. In Sandbox this points to the SCP Auth project.
  supabaseAuthUrl:
    process.env.SUPABASE_AUTH_URL ??
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    "",
  supabaseAuthAnonKey:
    process.env.SUPABASE_AUTH_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_API_KEY ??
    "",

  // Environment-local Storage. Sandbox must point this to the Sandbox project.
  supabaseStorageUrl: storageUrl,
  supabaseStorageKey:
    process.env.SUPABASE_STORAGE_SECRET_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_KEY ??
    "",

  // Backward-compatible alias for older server modules.
  supabaseUrl: storageUrl,
  appEnvironment,
};
