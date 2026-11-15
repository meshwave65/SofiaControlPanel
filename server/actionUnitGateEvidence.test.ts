import { describe, expect, it } from "vitest";
import { deriveDependencyEvidence } from "./actionUnitGateEvidence";

const missionTaskId = 100;
const ownerId = 7;

describe("ACTION_PLAN dependency evidence", () => {
  it("verifies only persisted DONE direct-child tasks owned by the mission owner", () => {
    const result = deriveDependencyEvidence(["T01"], [{
      unitId: "T01",
      operationalTaskId: 201,
      taskOwnerId: ownerId,
      parentTaskId: missionTaskId,
      taskStatus: "DONE",
    }], missionTaskId, ownerId);

    expect(result.decision).toBe("VERIFIED");
    expect(result.dependencies[0]).toMatchObject({ unitId: "T01", verified: true, reason: "verified" });
  });

  it("blocks a dependency that has not been materialized", () => {
    const result = deriveDependencyEvidence(["T01"], [{
      unitId: "T01",
      operationalTaskId: null,
      taskOwnerId: null,
      parentTaskId: null,
      taskStatus: null,
    }], missionTaskId, ownerId);

    expect(result.decision).toBe("BLOCKED");
    expect(result.dependencies[0]?.reason).toBe("dependency_not_materialized");
  });

  it("blocks tasks that are not DONE", () => {
    const result = deriveDependencyEvidence(["T01"], [{
      unitId: "T01",
      operationalTaskId: 201,
      taskOwnerId: ownerId,
      parentTaskId: missionTaskId,
      taskStatus: "PAUSED",
    }], missionTaskId, ownerId);

    expect(result.decision).toBe("BLOCKED");
    expect(result.dependencies[0]?.reason).toBe("dependency_task_not_done");
  });

  it("blocks a linked task outside the exact mission ownership boundary", () => {
    const result = deriveDependencyEvidence(["T01"], [{
      unitId: "T01",
      operationalTaskId: 201,
      taskOwnerId: ownerId + 1,
      parentTaskId: missionTaskId + 1,
      taskStatus: "DONE",
    }], missionTaskId, ownerId);

    expect(result.decision).toBe("BLOCKED");
    expect(result.dependencies[0]?.reason).toBe("dependency_task_scope_mismatch");
  });

  it("treats an empty dependency list as verified without requiring a predecessor", () => {
    const result = deriveDependencyEvidence([], [], missionTaskId, ownerId);
    expect(result.decision).toBe("VERIFIED");
    expect(result.dependencies).toEqual([]);
  });

  it("blocks when a declared dependency has no persisted Txx record", () => {
    const result = deriveDependencyEvidence(["T99"], [], missionTaskId, ownerId);
    expect(result.decision).toBe("BLOCKED");
    expect(result.dependencies[0]?.reason).toBe("dependency_unit_not_registered");
  });
});
