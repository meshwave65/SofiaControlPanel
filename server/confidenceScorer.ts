export type ConfidenceInput = {
  profileKnown: boolean;
  heartbeatRecent: boolean;
  agentOnline: boolean;
  assignmentMatch: boolean;
  successRate: number;
  activityEvents: number;
  connectionStatus: string | null;
};

export type ConfidenceSignal = {
  observed: boolean | number | string | null;
  contribution: number;
  anomaly: boolean;
};

export type ConfidenceResult = {
  score: number;
  anomalyCount: number;
  signals: Record<string, ConfidenceSignal>;
  anomalies: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function boundedRate(value: number) {
  return Number.isFinite(value) ? clamp(value, 0, 1) : 0;
}

/** Score heurístico inicial; não é autenticação nem modelo calibrado. */
export function scoreConfidence(input: ConfidenceInput): ConfidenceResult {
  const successRate = boundedRate(input.successRate);
  const connectionStable = input.connectionStatus === "connected" || input.connectionStatus === "configured";
  const activityPresent = input.activityEvents > 0;
  const signals: Record<string, ConfidenceSignal> = {
    known_agent_profile: { observed: input.profileKnown, contribution: input.profileKnown ? 10 : -5, anomaly: !input.profileKnown },
    heartbeat_recent: { observed: input.heartbeatRecent, contribution: input.heartbeatRecent ? 15 : -10, anomaly: !input.heartbeatRecent },
    agent_online: { observed: input.agentOnline, contribution: input.agentOnline ? 10 : -8, anomaly: !input.agentOnline },
    task_assignment_match: { observed: input.assignmentMatch, contribution: input.assignmentMatch ? 10 : -10, anomaly: !input.assignmentMatch },
    connection_stable: { observed: input.connectionStatus, contribution: connectionStable ? 10 : -5, anomaly: !connectionStable },
    success_history: { observed: successRate, contribution: Math.round(successRate * 10), anomaly: input.successRate < 0.5 },
    activity_present: { observed: input.activityEvents, contribution: activityPresent ? 5 : -3, anomaly: !activityPresent },
  };
  const score = clamp(50 + Object.values(signals).reduce((total, signal) => total + signal.contribution, 0));
  const anomalies = Object.entries(signals).filter(([, signal]) => signal.anomaly).map(([key]) => key);
  return { score, anomalyCount: anomalies.length, signals, anomalies };
}
