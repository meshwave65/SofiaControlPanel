export type ArcDecision = "ALLOW" | "REVIEW" | "DENY";

export type ArcEvidence = {
  key: string;
  value: number;
  reliability: number;
  likelihoodRatio: number;
  source: string;
  observedAt: Date;
  metadata?: Record<string, string | number | boolean>;
};

export type ArcPolicyInput = {
  prior: number;
  allowThreshold: number;
  reviewThreshold: number;
};

export type ArcShadowInput = {
  taskId: number;
  taskAgentId: number | null;
  agent: { id: number; status: string; lastHeartbeat: Date | null } | null;
  completedTasks: number;
  observedTasks: number;
  activityEvents: number;
  observedAt?: Date;
};

function probability(name: string, value: number) {
  if (!Number.isFinite(value) || value <= 0 || value >= 1) {
    throw new Error(`${name} deve estar estritamente entre 0 e 1.`);
  }
}

function bounded(value: number) {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

function infer(prior: number, evidence: ArcEvidence[], policy: ArcPolicyInput) {
  probability("prior", prior);
  probability("allowThreshold", policy.allowThreshold);
  probability("reviewThreshold", policy.reviewThreshold);
  if (policy.allowThreshold <= policy.reviewThreshold) throw new Error("Limiares ARC inválidos");
  let logOdds = Math.log(prior / (1 - prior));
  for (const item of evidence) {
    if (item.likelihoodRatio <= 0 || item.reliability < 0 || item.reliability > 1) throw new Error(`Evidência ARC inválida: ${item.key}`);
    logOdds += Math.log(item.likelihoodRatio) * item.reliability;
  }
  const posterior = logOdds >= 0
    ? 1 / (1 + Math.exp(-logOdds))
    : Math.exp(logOdds) / (1 + Math.exp(logOdds));
  const decision: ArcDecision = posterior >= policy.allowThreshold ? "ALLOW" : posterior >= policy.reviewThreshold ? "REVIEW" : "DENY";
  return { posterior, decision };
}

export function evaluateArcShadow(input: ArcShadowInput, policy: ArcPolicyInput) {
  const observedAt = input.observedAt ?? new Date();
  const heartbeatRecent = Boolean(input.agent?.lastHeartbeat && observedAt.getTime() - input.agent.lastHeartbeat.getTime() >= 0 && observedAt.getTime() - input.agent.lastHeartbeat.getTime() <= 5 * 60 * 1000);
  const assignmentMatch = Boolean(input.agent && input.taskAgentId === input.agent.id);
  const successRate = input.observedTasks > 0 ? bounded(input.completedTasks / input.observedTasks) : 0;
  const evidence: ArcEvidence[] = [
    { key: "heartbeat_recent", value: heartbeatRecent ? 1 : 0, reliability: 0.9, likelihoodRatio: heartbeatRecent ? 3 : 0.5, source: "agents.lastHeartbeat", observedAt },
    { key: "agent_online", value: input.agent?.status === "online" ? 1 : 0, reliability: 0.8, likelihoodRatio: input.agent?.status === "online" ? 2 : 0.6, source: "agents.status", observedAt },
    { key: "task_assignment_match", value: assignmentMatch ? 1 : 0, reliability: 0.9, likelihoodRatio: assignmentMatch ? 2.5 : 0.4, source: "tasks.agentId", observedAt },
    { key: "recent_success_history", value: successRate, reliability: 0.6, likelihoodRatio: successRate >= 0.5 ? 1.8 : 0.75, source: "tasks.completedAt", observedAt, metadata: { completedTasks: input.completedTasks, observedTasks: input.observedTasks } },
    { key: "activity_consistency", value: assignmentMatch && input.activityEvents > 0 ? 1 : 0, reliability: 0.5, likelihoodRatio: assignmentMatch && input.activityEvents > 0 ? 1.5 : 0.8, source: "activityLogs", observedAt, metadata: { activityEvents: input.activityEvents } },
  ];
  const result = infer(policy.prior, evidence, policy);
  return {
    taskId: input.taskId,
    agentId: input.agent?.id ?? null,
    prior: policy.prior,
    posterior: result.posterior,
    decision: result.decision,
    mode: "shadow" as const,
    evidence,
    explanation: `Avaliação heurística ARC em shadow: ${result.decision}. Sinais calculados de heartbeat, status, atribuição, histórico de conclusão e atividade. Não é autenticação forte nem prova de presença.`,
    createdAt: observedAt,
  };
}
