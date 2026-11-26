export type AppEnvironment = "scp" | "sandbox";

type Metadata = Record<string, unknown>;

function asMetadata(value: unknown): Metadata {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Metadata
    : {};
}

function allowedEnvironments(metadata: Metadata): string[] {
  const value = metadata.meshwave_environments;
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

/**
 * Authorization is based only on trusted Supabase app_metadata.
 * user_metadata is deliberately not accepted because users can edit it.
 * Unclassified legacy identities remain SCP-only during migration.
 */
export function isEnvironmentAuthorized(
  appMetadata: unknown,
  environment: AppEnvironment,
): boolean {
  const metadata = asMetadata(appMetadata);
  const userType = metadata.meshwave_user_type;

  if (userType === "sandbox") {
    return environment === "sandbox";
  }

  if (userType === "normal_user" || userType === "admin") {
    return allowedEnvironments(metadata).includes(environment);
  }

  if (userType === undefined || userType === null || userType === "") {
    return environment === "scp";
  }

  return false;
}

export function isCentralAdmin(appMetadata: unknown): boolean {
  return asMetadata(appMetadata).meshwave_user_type === "admin";
}
