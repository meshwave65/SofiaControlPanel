import { describe, expect, it } from "vitest";
import { scoreConfidence } from "./confidenceScorer";

describe("scoreConfidence", () => {
  it("returns a bounded high score for a consistent operational profile", () => {
    const result = scoreConfidence({
      profileKnown: true, heartbeatRecent: true, agentOnline: true,
      assignmentMatch: true, successRate: 0.9, activityEvents: 4,
      connectionStatus: "connected",
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThan(80);
    expect(result.anomalies).toHaveLength(0);
  });

  it("marks missing operational signals without blocking anything", () => {
    const result = scoreConfidence({
      profileKnown: false, heartbeatRecent: false, agentOnline: false,
      assignmentMatch: false, successRate: 0, activityEvents: 0,
      connectionStatus: "not_configured",
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.anomalyCount).toBeGreaterThan(0);
    expect(result.signals.heartbeat_recent.anomaly).toBe(true);
  });
});
