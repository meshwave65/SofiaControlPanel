import { describe, expect, it } from "vitest";
import { isCentralAdmin, isEnvironmentAuthorized } from "./environmentAccess";

describe("central MeshWave environment authorization", () => {
  it("restricts sandbox-class identities to Sandbox only", () => {
    const metadata = { meshwave_user_type: "sandbox", meshwave_environments: ["sandbox"] };
    expect(isEnvironmentAuthorized(metadata, "sandbox")).toBe(true);
    expect(isEnvironmentAuthorized(metadata, "scp")).toBe(false);
  });

  it("allows normal users only in explicitly listed environments", () => {
    const scpOnly = { meshwave_user_type: "normal_user", meshwave_environments: ["scp"] };
    const both = { meshwave_user_type: "normal_user", meshwave_environments: ["scp", "sandbox"] };
    expect(isEnvironmentAuthorized(scpOnly, "scp")).toBe(true);
    expect(isEnvironmentAuthorized(scpOnly, "sandbox")).toBe(false);
    expect(isEnvironmentAuthorized(both, "scp")).toBe(true);
    expect(isEnvironmentAuthorized(both, "sandbox")).toBe(true);
  });

  it("requires explicit environment scope for administrators", () => {
    const metadata = { meshwave_user_type: "admin", meshwave_environments: ["scp"] };
    expect(isCentralAdmin(metadata)).toBe(true);
    expect(isEnvironmentAuthorized(metadata, "scp")).toBe(true);
    expect(isEnvironmentAuthorized(metadata, "sandbox")).toBe(false);
  });

  it("keeps unclassified legacy identities SCP-only during migration", () => {
    expect(isEnvironmentAuthorized({}, "scp")).toBe(true);
    expect(isEnvironmentAuthorized({}, "sandbox")).toBe(false);
  });

  it("does not trust user_metadata-shaped or unknown classifications", () => {
    expect(isEnvironmentAuthorized({ name: "admin" }, "sandbox")).toBe(false);
    expect(isEnvironmentAuthorized({ meshwave_user_type: "owner" }, "scp")).toBe(false);
  });
});
