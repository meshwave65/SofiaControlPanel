export type RiskClass = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ExecutionGateFacts = {
  planApproved: boolean;
  sourceVersionsCurrent: boolean;
  dependenciesCompleted: boolean | null;
  riskClass: RiskClass | null;
  maximumAllowedRisk: RiskClass | null;
  estimatedCredits: number | null;
  availableBudgetCredits: number | null;
  budgetEstimateVerified: boolean;
  permissionGranted: boolean;
  agentEligible: boolean;
  idempotencyKey: string | null;
  executionAdapterAvailable: boolean;
  explicitUnitApproval: boolean;
};

export type ExecutionGateResult = {
  decision: "BLOCKED" | "AWAITING_UNIT_APPROVAL" | "READY_FOR_SEPARATE_DISPATCH_GATE";
  blockers: Array<{ code: string; detail: string }>;
  evaluatedAt: string;
  dispatchPerformed: false;
};

/**
 * Deterministic, fail-closed preflight for one approved action-plan unit.
 * This function never dispatches, reserves agents, or mutates task state.
 */
export function evaluateExecutionGate(facts: ExecutionGateFacts): ExecutionGateResult {
  const blockers: ExecutionGateResult["blockers"] = [];
  const riskOrder: Record<RiskClass, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
  };

  if (!facts.planApproved) blockers.push({ code: "PLAN_NOT_APPROVED", detail: "O plano integral não possui aprovação humana vigente." });
  if (!facts.sourceVersionsCurrent) blockers.push({ code: "SOURCE_VERSIONS_STALE", detail: "TR/Blueprint de origem não foram comprovados como versões vigentes." });

  if (facts.dependenciesCompleted === null) {
    blockers.push({ code: "DEPENDENCIES_UNVERIFIED", detail: "Não existe vínculo persistido entre dependências do plano e unidades operacionais concluídas." });
  } else if (!facts.dependenciesCompleted) {
    blockers.push({ code: "DEPENDENCIES_PENDING", detail: "Uma ou mais dependências ainda não foram concluídas." });
  }

  if (facts.riskClass === null || facts.maximumAllowedRisk === null) {
    blockers.push({ code: "RISK_POLICY_UNCONFIGURED", detail: "Classificação de risco e limite de política não estão configurados/verificados." });
  } else if (riskOrder[facts.riskClass] > riskOrder[facts.maximumAllowedRisk]) {
    blockers.push({ code: "RISK_LIMIT_EXCEEDED", detail: "A classificação de risco excede o limite permitido pela política." });
  }

  if (!facts.budgetEstimateVerified || facts.estimatedCredits === null || facts.availableBudgetCredits === null) {
    blockers.push({ code: "BUDGET_UNVERIFIED", detail: "Estimativa verificada por unidade e orçamento autorizado disponível não existem." });
  } else if (facts.estimatedCredits < 0 || facts.availableBudgetCredits < 0
    || facts.estimatedCredits > facts.availableBudgetCredits) {
    blockers.push({ code: "BUDGET_EXCEEDED", detail: "O orçamento disponível não cobre o consumo estimado da unidade." });
  }

  if (!facts.permissionGranted) blockers.push({ code: "PERMISSION_NOT_GRANTED", detail: "Não há concessão de permissão explícita para esta ação e unidade." });
  if (!facts.agentEligible) blockers.push({ code: "AGENT_NOT_VERIFIED", detail: "O executor proposto não foi confirmado elegível para esta unidade no momento da avaliação." });
  if (!facts.idempotencyKey?.trim()) blockers.push({ code: "IDEMPOTENCY_NOT_CONFIGURED", detail: "Não existe chave de idempotência persistida para impedir execução duplicada." });
  if (!facts.executionAdapterAvailable) blockers.push({ code: "EXECUTION_ADAPTER_UNAVAILABLE", detail: "Não existe adaptador validado para traduzir esta unidade estruturada em uma execução controlada." });

  if (blockers.length > 0) {
    return { decision: "BLOCKED", blockers, evaluatedAt: new Date().toISOString(), dispatchPerformed: false };
  }
  if (!facts.explicitUnitApproval) {
    return {
      decision: "AWAITING_UNIT_APPROVAL",
      blockers: [{ code: "UNIT_APPROVAL_REQUIRED", detail: "A aprovação do plano integral não substitui a confirmação explícita desta unidade." }],
      evaluatedAt: new Date().toISOString(),
      dispatchPerformed: false,
    };
  }
  return {
    decision: "READY_FOR_SEPARATE_DISPATCH_GATE",
    blockers: [],
    evaluatedAt: new Date().toISOString(),
    dispatchPerformed: false,
  };
}
