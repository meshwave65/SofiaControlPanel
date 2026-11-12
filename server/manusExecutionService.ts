import * as db from "./db";

const MANUS_API_BASE = "https://api.manus.ai/v2";
const REQUEST_TIMEOUT_MS = 30_000;

type ManusTaskResponse = {
  ok?: boolean;
  task_id?: string;
  task?: {
    id?: string;
    status?: string;
    credit_usage?: number;
  };
  error?: { code?: string; message?: string };
};

type LocalTask = Awaited<ReturnType<typeof db.getTaskById>>;
type ManusMessageEvent = { type?: string; assistant_message?: { content?: string } };
type ManusMessagesResponse = ManusTaskResponse & { messages?: ManusMessageEvent[] };

function apiError(response: Response, payload: ManusTaskResponse) {
  const message = payload.error?.message || `Manus API retornou HTTP ${response.status}`;
  return new Error(message);
}

async function manusRequest<T extends ManusTaskResponse>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${MANUS_API_BASE}${path}`, {
    ...init,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      "x-manus-api-key": token,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({})) as T;
  if (!response.ok || payload.ok === false) throw apiError(response, payload);
  return payload;
}

export async function createManusTask(task: NonNullable<LocalTask>, continuationContext?: string) {
  if (!task.agentId) throw new Error("A missão precisa de um agente responsável antes da execução.");

  const credentials = await db.getManusCredentialsForAgent(task.agentId);
  if (!credentials?.manusToken) {
    throw new Error("O agente não possui uma API key Manus configurada.");
  }

  const prompt = [
    `Missão Sofia #${task.id}: ${task.title}`,
    task.description ? `\nInstruções:\n${task.description}` : "",
    continuationContext ? `\nCheckpoint da execução anterior:\n${continuationContext}\nContinue desse ponto sem repetir o trabalho já concluído.` : "",
    "\nAo concluir, produza um relatório objetivo com resultado, evidências, limitações e próximos passos.",
  ].join("\n");

  const response = await manusRequest<ManusTaskResponse>(credentials.manusToken, "/task.create", {
    method: "POST",
    body: JSON.stringify({
      title: task.title,
      message: {
        content: [{ type: "text", text: prompt, visibility: "visible" }],
      },
      interactive_mode: false,
      agent_profile: "standard",
      share_visibility: "private",
    }),
  });

  const manusTaskId = response.task_id;
  if (!manusTaskId) throw new Error("A API Manus não retornou task_id.");

  await db.updateTaskExecution(task.id, {
    manusTaskId,
    manusStatus: "running",
  });

  return { manusTaskId, status: "running" as const };
}

export async function sendManusMessage(task: NonNullable<LocalTask>, text: string) {
  if (!task.agentId || !task.manusTaskId) throw new Error("A missão não possui execução Manus para retomar.");
  const credentials = await db.getManusCredentialsForAgent(task.agentId);
  if (!credentials?.manusToken) throw new Error("O agente não possui uma API key Manus configurada.");
  return manusRequest<ManusTaskResponse>(credentials.manusToken, "/task.sendMessage", {
    method: "POST",
    body: JSON.stringify({ task_id: task.manusTaskId, message: { content: [{ type: "text", text, visibility: "visible" }] } }),
  });
}

export async function getManusCheckpoint(task: NonNullable<LocalTask>) {
  if (!task.agentId || !task.manusTaskId) return "";
  const credentials = await db.getManusCredentialsForAgent(task.agentId);
  if (!credentials?.manusToken) return "";
  const response = await manusRequest<ManusMessagesResponse>(credentials.manusToken, `/task.listMessages?task_id=${encodeURIComponent(task.manusTaskId)}&order=desc&limit=20`, { method: "GET" });
  return (response.messages || [])
    .filter((item) => item.type === "assistant_message" && item.assistant_message?.content)
    .map((item) => item.assistant_message!.content!)
    .join("\n\n")
    .slice(0, 18000);
}

export async function syncAgentCredits(agentId: number) {
  const credentials = await db.getManusCredentialsForAgent(agentId);
  if (!credentials?.manusToken) {
    throw new Error("O agente não possui uma API key Manus configurada.");
  }

  const response = await manusRequest<ManusTaskResponse & {
    request_id?: string;
    total_credits?: unknown;
    data?: unknown;
  }>(
    credentials.manusToken,
    "/usage.availableCredits",
    { method: "GET" },
  );
  const data = response.data;
  const dataObject = data && typeof data === "object" && !Array.isArray(data)
    ? data as Record<string, unknown>
    : null;
  // Manus currently returns total_credits at the top level. Accept the
  // nested data shape as a backward-compatible variant.
  const credits = response.total_credits ?? dataObject?.total_credits;
  if (typeof credits !== "number" || !Number.isFinite(credits)) {
    const topLevelKeys = Object.keys(response).sort().join(", ") || "(nenhuma)";
    const dataType = Array.isArray(data) ? "array" : data === null ? "null" : typeof data;
    const dataKeys = dataObject ? Object.keys(dataObject).sort().join(", ") || "(nenhuma)" : "(indisponível)";
    const creditsType = credits === null ? "null" : typeof credits;
    const requestId = response.request_id || "(não informado)";
    throw new Error(
      `Resposta de créditos Manus sem total_credits numérico. request_id=${requestId}; top_level_keys=[${topLevelKeys}]; data_type=${dataType}; data_keys=[${dataKeys}]; total_credits_type=${creditsType}.`,
    );
  }

  await db.updateAgentCredits(agentId, credits);
  return credits;
}

export async function syncAllAgentCredits() {
  const agents = await db.getAllAgentsGlobal();
  const results: Array<{ agentId: number; ok: boolean; creditsRemaining?: number; error?: string }> = [];

  for (const agent of agents) {
    try {
      const creditsRemaining = await syncAgentCredits(agent.id);
      results.push({ agentId: agent.id, ok: true, creditsRemaining });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ agentId: agent.id, ok: false, error: message });
      console.warn(`[Manus] Não foi possível atualizar créditos do agente ${agent.id}: ${message}`);
    }
  }

  return results;
}

async function syncRunningTask(task: NonNullable<LocalTask>) {
  if (!task.agentId || !task.manusTaskId) return null;
  const credentials = await db.getManusCredentialsForAgent(task.agentId);
  if (!credentials?.manusToken) return null;

  const response = await manusRequest<ManusTaskResponse>(
    credentials.manusToken,
    `/task.detail?task_id=${encodeURIComponent(task.manusTaskId)}`,
    { method: "GET" },
  );
  const externalTask = response.task;
  if (!externalTask?.status) return null;

  const normalizedStatus = externalTask.status.toLowerCase();
  let isDone = normalizedStatus === "stopped";
  const isFailed = normalizedStatus === "error";
  let waitingForCredits = false;
  if (isDone) {
    try {
      const credits = await syncAgentCredits(task.agentId);
      waitingForCredits = credits <= 0;
      isDone = !waitingForCredits;
    } catch { /* retry on the next heartbeat */ }
  }
  const doneStatusId = isDone ? await db.getTaskStatusIdByName("DONE") : null;
  const pausedStatusId = waitingForCredits ? await db.getTaskStatusIdByName("PAUSED") : null;
  const failStatusId = isFailed ? await db.getTaskStatusIdByName("FAIL") : null;

  await db.updateTaskExecution(task.id, {
    manusStatus: waitingForCredits ? "waiting_credit" : normalizedStatus,
    creditsUsed: typeof externalTask.credit_usage === "number" ? externalTask.credit_usage : undefined,
    completedAt: isDone || isFailed ? new Date() : waitingForCredits ? null : undefined,
  });
  if (doneStatusId || failStatusId || pausedStatusId) {
    await db.updateTaskStatus(task.id, doneStatusId || failStatusId || pausedStatusId!);
  }

  return { taskId: task.id, manusStatus: waitingForCredits ? "waiting_credit" : normalizedStatus, creditsUsed: externalTask.credit_usage ?? null };
}

export async function syncRunningManusTasks() {
  const tasks = (await db.getAllTasksGlobal()).filter((task) => task.manusTaskId && task.manusStatus !== "stopped" && task.manusStatus !== "error");
  const results = [];

  for (const task of tasks) {
    try {
      const result = await syncRunningTask(task);
      if (result) results.push(result);
    } catch (error) {
      console.warn(`[Manus] Falha ao sincronizar tarefa local ${task.id}:`, error instanceof Error ? error.message : error);
    }
  }

  return results;
}
