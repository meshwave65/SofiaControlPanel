export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  masterAdminEmails: [...new Set([
    "meshwave65@gmail.com",
    ...(process.env.MASTER_ADMIN_EMAILS ?? "info@meshwave.com.br")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  ])],
  githubPat: process.env.GITHUB_PAT ?? "",
  githubOwner: process.env.GITHUB_OWNER ?? "meshwave65",
  githubRepo: process.env.GITHUB_REPO ?? "SofiaControlPanel",
  githubBranch: process.env.GITHUB_BRANCH ?? "main",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseStorageKey:
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_KEY ??
    "",
};
