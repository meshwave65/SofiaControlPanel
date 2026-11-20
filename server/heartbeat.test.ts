import { describe, expect, it } from "vitest";
import { isDispatchRetryCandidate, isGitHubMirrorRetryCandidate } from "./heartbeat";

describe("dispatch retry eligibility", () => {
  it("retries a persisted dispatch_pending marker", () => {
    expect(isDispatchRetryCandidate("dispatch_pending")).toBe(true);
  });

  it("continues retrying tasks waiting for an available or pinned agent", () => {
    expect(isDispatchRetryCandidate("waiting_for_available_agent")).toBe(true);
    expect(isDispatchRetryCandidate("waiting_for_pinned_agent")).toBe(true);
  });

  it("does not retry unrelated or terminal execution states", () => {
    expect(isDispatchRetryCandidate(null)).toBe(false);
    expect(isDispatchRetryCandidate(undefined)).toBe(false);
    expect(isDispatchRetryCandidate("running")).toBe(false);
    expect(isDispatchRetryCandidate("dispatch_failed")).toBe(false);
  });
});


describe("GitHub mission mirror retry eligibility", () => {
  const now = new Date("2026-11-20T03:00:00.000Z").getTime();

  it("retries an unsynced mission after the cooldown when a PAT is available", () => {
    expect(isGitHubMirrorRetryCandidate({
      id: 46,
      missionKey: "SCP-TASK-000046",
      githubSyncStatus: "failed",
      updatedAt: new Date(now - 61_000),
    }, now, true)).toBe(true);
  });

  it("does not retry a fully synchronized mission", () => {
    expect(isGitHubMirrorRetryCandidate({
      id: 46,
      missionKey: "SCP-TASK-000046",
      githubPath: "missions/SCP-TASK-000046.md",
      githubSha: "abc123",
      githubSyncStatus: "synced",
      updatedAt: new Date(now - 120_000),
    }, now, true)).toBe(false);
  });

  it("respects the retry cooldown", () => {
    expect(isGitHubMirrorRetryCandidate({
      id: 46,
      missionKey: "SCP-TASK-000046",
      githubSyncStatus: "failed",
      updatedAt: new Date(now - 30_000),
    }, now, true)).toBe(false);
  });

  it("does not retry until GITHUB_PAT is configured", () => {
    expect(isGitHubMirrorRetryCandidate({
      id: 46,
      missionKey: "SCP-TASK-000046",
      githubSyncStatus: "not_configured",
      updatedAt: new Date(now - 120_000),
    }, now, false)).toBe(false);
  });
});
