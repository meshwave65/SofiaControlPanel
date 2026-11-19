import { describe, expect, it } from "vitest";
import { isDispatchRetryCandidate } from "./heartbeat";

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
