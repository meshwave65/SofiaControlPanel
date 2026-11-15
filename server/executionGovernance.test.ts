import { describe, expect, it } from "vitest";
import { evaluateExecutionGate, type ExecutionGateFacts } from "./executionGovernance";

const readyFacts: ExecutionGateFacts = {
  planApproved: true,
  sourceVersionsCurrent: true,
  dependenciesCompleted: true,
  riskClass: "LOW",
  maximumAllowedRisk: "MEDIUM",
  estimatedCredits: 2,
  availableBudgetCredits: 5,
  budgetEstimateVerified: true,
  permissionGranted: true,
  agentEligible: true,
  idempotencyKey: "mission-44:T01:approved-plan-v3",
  executionAdapterAvailable: true,
  explicitUnitApproval: false,
};

describe("deterministic action-unit execution gate", () => {
  it("fails closed when governance evidence is unknown", () => {
    const result = evaluateExecutionGate({
      ...readyFacts,
      dependenciesCompleted: null,
      riskClass: null,
      maximumAllowedRisk: null,
      estimatedCredits: null,
      availableBudgetCredits: null,
      budgetEstimateVerified: false,
      permissionGranted: false,
      agentEligible: false,
      idempotencyKey: null,
      executionAdapterAvailable: false,
    });
    expect(result.decision).toBe("BLOCKED");
    expect(result.blockers.map((item) => item.code)).toEqual(expect.arrayContaining([
      "DEPENDENCIES_UNVERIFIED",
      "RISK_POLICY_UNCONFIGURED",
      "BUDGET_UNVERIFIED",
      "PERMISSION_NOT_GRANTED",
      "AGENT_NOT_VERIFIED",
      "IDEMPOTENCY_NOT_CONFIGURED",
      "EXECUTION_ADAPTER_UNAVAILABLE",
    ]));
    expect(result.dispatchPerformed).toBe(false);
  });

  it("blocks when a dependency is incomplete or risk exceeds policy", () => {
    const result = evaluateExecutionGate({
      ...readyFacts,
      dependenciesCompleted: false,
      riskClass: "CRITICAL",
      maximumAllowedRisk: "HIGH",
    });
    expect(result.decision).toBe("BLOCKED");
    expect(result.blockers.map((item) => item.code)).toEqual(expect.arrayContaining([
      "DEPENDENCIES_PENDING",
      "RISK_LIMIT_EXCEEDED",
    ]));
  });

  it("blocks a budget overrun", () => {
    const result = evaluateExecutionGate({
      ...readyFacts,
      estimatedCredits: 6,
      availableBudgetCredits: 5,
    });
    expect(result.blockers.map((item) => item.code)).toContain("BUDGET_EXCEEDED");
  });

  it("requires a separate explicit approval for each unit after all other gates pass", () => {
    const result = evaluateExecutionGate(readyFacts);
    expect(result.decision).toBe("AWAITING_UNIT_APPROVAL");
    expect(result.blockers[0]?.code).toBe("UNIT_APPROVAL_REQUIRED");
    expect(result.dispatchPerformed).toBe(false);
  });

  it("never dispatches even when every preflight fact and unit approval is present", () => {
    const result = evaluateExecutionGate({ ...readyFacts, explicitUnitApproval: true });
    expect(result.decision).toBe("READY_FOR_SEPARATE_DISPATCH_GATE");
    expect(result.dispatchPerformed).toBe(false);
  });
});
