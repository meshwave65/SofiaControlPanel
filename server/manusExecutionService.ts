import { createHash } from "node:crypto";
import * as db from "./db";
import { validateMissionBlueprintContent } from "./missionBlueprint";
import { mirrorMissionToGitHub } from "./githubMissionMirror";

const MANUS_API_BASE = "https://api.manus.ai/v2";
const REQUEST_TIMEOUT_MS = 30_000;

type ManusTaskResponse = {
  ok?: boolean;
  task_id?: string;
  task?: {
    id?: string;
    status?: string;
    credit_usage?: number;
    has_running_background_jobs?: boolean;
  };
  error?: { code?: string; message?: string };
};

type LocalTask = Awaited<ReturnType<typeof db.getTaskById>>;
export type ManusMessageEvent = { id?: string; type?: string; created_at?: string; assistant_message?: { content?: string | Array<{ type?: string; text?: string }> } };
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

  const missionRootId = await db.getMissionRootTaskId(task.id);
  const missionDocs = missionRootId == null
    ? []
    : await db.getMissionDocumentsForTask(missionRootId, task.createdBy, false);
  const missionContext = await Promise.all(missionDocs.map(async (document: any) => {
    if (!document.latestVersion) {
      return { type: document.typeKey, key: document.documentKey, version: null, state: null, content: null };
    }
    const stored = await db.getMissionDocumentVersionForTask(
      missionRootId!,
      document.id,
      document.latestVersion.version,
      task.createdBy,
      false,
    );
    return {
      type: document.typeKey,
      key: document.documentKey,
      version: document.latestVersion.version,
      state: document.latestVersion.state,
      content: stored?.version?.content?.slice(0, 16000) ?? null,
    };
  }));

  const workflowInstructions = [
    "PROTOCOLO OBRIGATÓRIO DE MISSÃO SOFIA:",
    "1. Sua primeira ação é conferir o inventário documental recebido, as versões e a vinculação do TR. Registre no checklist se é NOVA MISSÃO ou CONTINUIDADE.",
    "2. Em uma nova missão, não invente BP, OR ou FOR anteriores. O TR aprovado e o FR draft são a base inicial. Prepare o BP a partir do TR e emita o primeiro CHECKPOINT e HANDOFF antes de iniciar as etapas.",
    "3. O BP é criado pelo agente executor após a delegação. Depois de criado, não altere BP nem TR durante a execução.",
    "4. Execute sequencialmente todas as etapas do BP. Antes de cada etapa, revise TR, BP, FR, FOR e o OR da etapa anterior; confirme o objetivo e os critérios de aceite da etapa atual.",
    "5. Ao concluir cada etapa, produza um OR próprio daquela etapa, atualize o FR com a evolução e os resultados, atualize o FOR com problemas, soluções e aprendizados operacionais, e grave CHECKPOINT e HANDOFF para a próxima etapa.",
    "6. Continue para a etapa seguinte sem aguardar aprovação adicional. Não encerre a missão enquanto houver etapa pendente.",
    "7. FR é informativo: objetivo, desenvolvimento, resultados e conclusão da missão. FOR é operacional: consolida os ORs, problemas, soluções e aprendizados. Não misture essas finalidades.",
    "8. TR e BP não devem ser revisados pelo fluxo de execução. Atualize os demais artefatos pertinentes.",
    "9. Após cada etapa, emita um bloco SOFIA_MISSION_UPDATE com JSON válido, sem cercas Markdown, contendo os documentos criados/atualizados. No bloco final, inclua execution_complete=true, plan_step_ids e completed_step_ids somente quando todas as etapas estiverem concluídas; nesse bloco final, FR e FOR devem estar em state PUBLISHED.",
    "10. Cada documento deve conter type (BLUEPRINT, FR, OR, FOR, CHECKPOINT ou HANDOFF), documentKey estável, title, state e content. Use OR-<stepId> e HANDOFF-<stepId> como documentKeys de cada etapa; CHECKPOINT, FR e FOR usam chaves estáveis. Para o BP inicial, use documentKey BLUEPRINT e state READY. Nunca inclua TR ou ORIGINAL_REQUEST na lista de atualizações.",
    "Formato exato: <SOFIA_MISSION_UPDATE>{\"documents\":[{\"type\":\"BLUEPRINT\",\"documentKey\":\"BLUEPRINT\",\"title\":\"BP — ...\",\"state\":\"READY\",\"content\":\"...\"}],\"current_step_id\":\"S01\",\"plan_step_ids\":[\"S01\"],\"completed_step_ids\":[],\"execution_complete\":false}</SOFIA_MISSION_UPDATE>",
  ].join("\n");

  const prompt = [
    `Missão Sofia #${task.id}: ${task.title}`,
    task.description ? `\nSolicitação e escopo:\n${task.description}` : "",
    "\nINVENTÁRIO DOCUMENTAL VIGENTE (fonte para conferência de versões):\n" + JSON.stringify(missionContext),
    "\n" + workflowInstructions,
    continuationContext ? `\nCheckpoint e histórico da execução anterior:\n${continuationContext}\nContinue do ponto registrado, sem repetir trabalho concluído.` : "",
    "\nAo concluir, deixe os artefatos atualizados e apresente uma síntese objetiva com resultado, evidências, limitações e próximos passos.",
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

async function getManusTaskDetail(task: NonNullable<LocalTask>, token: string) {
  if (!task.manusTaskId) throw new Error("A tarefa não possui ID de execução Manus.");
  const response = await manusRequest<ManusTaskResponse>(
    token,
    `/task.detail?task_id=${encodeURIComponent(task.manusTaskId)}`,
    { method: "GET" },
  );
  if (!response.task?.status) throw new Error("A Manus não retornou o estado atual da execução.");
  return response.task;
}

/**
 * Interrompe a execução externa e confirma o estado via task.detail.
 * A pausa só é considerada concluída quando stopped e has_running_background_jobs=false.
 */
export async function stopManusTask(task: NonNullable<LocalTask>, allowAlreadyStopped = false) {
  if (!task.agentId || !task.manusTaskId) throw new Error("A tarefa não possui executor e execução Manus atribuídos.");
  const credentials = await db.getManusCredentialsForAgent(task.agentId);
  if (!credentials?.manusToken) throw new Error("O agente não possui uma API key Manus configurada.");

  const before = await getManusTaskDetail(task, credentials.manusToken);
  if (before.status === "stopped" && allowAlreadyStopped) {
    return {
      status: "stopped" as const,
      hasRunningBackgroundJobs: typeof before.has_running_background_jobs === "boolean"
        ? before.has_running_background_jobs
        : null,
    };
  }
  if (before.status !== "running") {
    throw new Error(`A execução Manus não está em estado running (estado atual: ${before.status}). Atualize a missão antes de tentar pausar.`);
  }

  await manusRequest<ManusTaskResponse>(credentials.manusToken, "/task.stop", {
    method: "POST",
    body: JSON.stringify({ task_id: task.manusTaskId }),
  });

  const after = await getManusTaskDetail(task, credentials.manusToken);
  if (after.status !== "stopped") {
    throw new Error(`A Manus aceitou a solicitação, mas o estado confirmado ainda é ${after.status}. A missão local não foi marcada como pausada.`);
  }

  return {
    status: "stopped" as const,
    hasRunningBackgroundJobs: typeof after.has_running_background_jobs === "boolean"
      ? after.has_running_background_jobs
      : null,
  };
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

/**
 * Retoma uma execução previamente interrompida pelo operador.
 * Só envia task.sendMessage se task.detail confirmar stopped sem jobs em background.
 */
export async function resumeManusTask(task: NonNullable<LocalTask>) {
  if (!task.agentId || !task.manusTaskId) throw new Error("A tarefa não possui executor e execução Manus atribuídos.");
  const credentials = await db.getManusCredentialsForAgent(task.agentId);
  if (!credentials?.manusToken) throw new Error("O agente não possui uma API key Manus configurada.");

  const before = await getManusTaskDetail(task, credentials.manusToken);
  if (before.status === "running") {
    return { resumed: true, status: "running" as const };
  }
  if (before.status !== "stopped") {
    throw new Error(`A execução Manus não está stopped (estado atual: ${before.status}). Atualize a missão antes de tentar retomar.`);
  }
  if (before.has_running_background_jobs !== false) {
    throw new Error("A Manus não confirmou que os processos em segundo plano terminaram. A retomada foi bloqueada.");
  }

  await manusRequest<ManusTaskResponse>(credentials.manusToken, "/task.sendMessage", {
    method: "POST",
    body: JSON.stringify({
      task_id: task.manusTaskId,
      message: {
        content: [{
          type: "text",
          text: "Retome a execução desta tarefa a partir do último ponto concluído. Preserve o trabalho já realizado, não o repita e continue seguindo o escopo e as instruções originais.",
          visibility: "visible",
        }],
      },
    }),
  });

  const after = await getManusTaskDetail(task, credentials.manusToken);
  if (after.status === "error") {
    throw new Error("A Manus retornou erro ao retomar a execução.");
  }
  return {
    resumed: after.status === "running",
    status: after.status,
  };
}

async function listManusMessages(task: NonNullable<LocalTask>) {
  if (!task.agentId || !task.manusTaskId) return [];
  const credentials = await db.getManusCredentialsForAgent(task.agentId);
  if (!credentials?.manusToken) return [];
  const response = await manusRequest<ManusMessagesResponse>(
    credentials.manusToken,
    `/task.listMessages?task_id=${encodeURIComponent(task.manusTaskId)}&order=desc&limit=20`,
    { method: "GET" },
  );
  return response.messages || [];
}

function assistantText(message: ManusMessageEvent) {
  const content = message.assistant_message?.content;
  if (typeof content === "string") return content.trim();
  return (content || [])
    .filter((part) => part.type === "text" && part.text)
    .map((part) => part.text)
    .join("\n")
    .trim();
}

type MissionAgentUpdateResult = {
  updatedDocuments: number;
  executionComplete: boolean;
  completionRequested: boolean;
  githubSyncComplete: boolean;
};

const AGENT_WRITABLE_DOCUMENT_TYPES = new Set(["BLUEPRINT", "FR", "OR", "FOR", "CHECKPOINT", "HANDOFF"]);
const DOCUMENT_STATES = new Set(["DRAFT", "READY", "ACTIVE", "PUBLISHED"]);

async function persistMissionAgentUpdates(task: NonNullable<LocalTask>): Promise<MissionAgentUpdateResult> {
  if (!task.agentId) return { updatedDocuments: 0, executionComplete: false, completionRequested: false, githubSyncComplete: false };
  const messages = await listManusMessages(task);
  const missionRootId = await db.getMissionRootTaskId(task.id);
  if (missionRootId == null) throw new Error("Não foi possível resolver a missão raiz para persistir os artefatos do agente.");

  let documents = await db.getMissionDocumentsForTask(missionRootId, task.createdBy, false);
  const trDocument = documents.find((document: any) => document.typeKey === "TR" && document.documentKey === "TR");
  if (!trDocument?.latestVersion) throw new Error("TR vigente não encontrado para vincular os artefatos do agente.");
  const trVersion = await db.getMissionDocumentVersionForTask(
    missionRootId,
    trDocument.id,
    trDocument.latestVersion.version,
    task.createdBy,
    false,
  );
  if (!trVersion) throw new Error("Conteúdo da versão vigente do TR não está disponível.");

  let updatedDocuments = 0;
  let completionCandidate: any = null;
  const orderedMessages = [...messages].reverse();

  for (const message of orderedMessages) {
    if (message.type !== "assistant_message") continue;
    const messageText = assistantText(message);
    if (!messageText) continue;
    const blocks = [...messageText.matchAll(/<SOFIA_MISSION_UPDATE>([\s\S]*?)<\/SOFIA_MISSION_UPDATE>/g)];
    for (const block of blocks) {
      let payload: any;
      try {
        payload = JSON.parse(block[1]);
      } catch (error) {
        console.warn(`[Manus] Bloco SOFIA_MISSION_UPDATE inválido na missão ${task.id}; ignorado.`);
        continue;
      }
      if (typeof payload.execution_complete === "boolean") completionCandidate = payload;
      if (!Array.isArray(payload.documents)) continue;

      for (const item of payload.documents) {
        const typeKey = typeof item?.type === "string" ? item.type.toUpperCase() : "";
        const documentKey = typeof item?.documentKey === "string" ? item.documentKey.trim() : "";
        const title = typeof item?.title === "string" && item.title.trim()
          ? item.title.trim().slice(0, 255)
          : `${typeKey} — ${task.title}`;
        let content = typeof item?.content === "string" ? item.content.trim() : "";
        if (typeKey === "BLUEPRINT") {
          try {
            content = validateMissionBlueprintContent(content);
          } catch (error) {
            console.warn(`[Manus] BP inválido para a missão ${task.id}; não será persistido:`, error instanceof Error ? error.message : error);
            continue;
          }
        }
        if (!AGENT_WRITABLE_DOCUMENT_TYPES.has(typeKey) || !documentKey || !content || documentKey.length > 128) continue;
        if (typeKey === "OR" && !documentKey.startsWith("OR-")) continue;
        if (typeKey === "BLUEPRINT" && documentKey !== "BLUEPRINT") continue;
        if (typeKey === "FR" && documentKey !== "FR") continue;
        if (typeKey === "FOR" && documentKey !== "FOR") continue;
        if (typeKey === "CHECKPOINT" && documentKey !== "CHECKPOINT") continue;
        if (content.length > 100_000) continue;

        const existing = documents.find((document: any) => document.documentKey === documentKey);
        // BP is created by the assigned agent once. The execution lifecycle never revises BP or TR.
        if (typeKey === "BLUEPRINT" && existing) continue;
        const requestedState = String(item.state || "").toUpperCase();
        const state = typeKey === "BLUEPRINT" || typeKey === "OR" || typeKey === "CHECKPOINT" || typeKey === "HANDOFF"
          ? (typeKey === "BLUEPRINT" ? "READY" : "PUBLISHED")
          : DOCUMENT_STATES.has(requestedState) ? requestedState : "DRAFT";
        const contentHash = createHash("sha256").update(content, "utf8").digest("hex");
        if (existing?.latestVersion) {
          const latest = await db.getMissionDocumentVersionForTask(
            missionRootId,
            existing.id,
            existing.latestVersion.version,
            task.createdBy,
            false,
          );
          const previousHash = latest?.version?.contentHash
            || (latest?.version?.content
              ? createHash("sha256").update(latest.version.content, "utf8").digest("hex")
              : null);
          if (previousHash === contentHash) continue;
        }

        const versionInput = {
          content,
          state,
          authorType: "AGENT" as const,
          authorAgentId: task.agentId,
          sourceDocumentVersionId: typeKey === "BLUEPRINT" || typeKey === "FR" ? trVersion.version.id : null,
          provenance: {
            origin: "MANUS_AGENT",
            taskId: task.id,
            manusTaskId: task.manusTaskId,
            sourceTRVersion: trDocument.latestVersion.version,
            stepId: payload.current_step_id ?? null,
            messageId: message.id ?? null,
          },
          changeSummary: typeof item.changeSummary === "string" && item.changeSummary.trim()
            ? item.changeSummary.trim()
            : `Atualização de ${typeKey} pelo agente executor`,
          contentHash,
          publishedAt: ["READY", "ACTIVE", "PUBLISHED"].includes(state) ? new Date() : null,
        };

        if (existing) {
          const createdVersion = await db.createMissionDocumentRevision({
            taskId: missionRootId,
            documentId: existing.id,
            ownerId: task.createdBy,
            canViewAll: false,
            version: versionInput,
          });
          existing.latestVersion = {
            id: createdVersion.id,
            version: createdVersion.version,
            state: createdVersion.state,
            authorType: createdVersion.authorType,
            createdAt: createdVersion.createdAt,
            publishedAt: createdVersion.publishedAt,
            sourceDocumentVersionId: createdVersion.sourceDocumentVersionId,
            changeSummary: createdVersion.changeSummary,
          };
        } else {
          const created = await db.createMissionDocumentWithVersion({
            taskId: missionRootId,
            ownerId: task.createdBy,
            canViewAll: false,
            typeKey,
            documentKey,
            title,
            version: versionInput,
          });
          documents.push({
            id: created.document.id,
            taskId: missionRootId,
            documentKey,
            title,
            typeKey,
            latestVersion: {
              id: created.version.id,
              version: created.version.version,
              state: created.version.state,
              authorType: created.version.authorType,
              createdAt: created.version.createdAt,
              publishedAt: created.version.publishedAt,
              sourceDocumentVersionId: created.version.sourceDocumentVersionId,
              changeSummary: created.version.changeSummary,
            },
          });
        }
        updatedDocuments += 1;
      }
    }
  }

  const mirror = await mirrorMissionToGitHub(task.id);
  const githubSyncComplete = mirror.status === "synced";
  if (!githubSyncComplete) {
    console.warn(`[Manus] Espelhamento GitHub pendente para a missão ${task.id}:`, mirror.error ?? mirror.status);
  }

  if (!completionCandidate || completionCandidate.execution_complete !== true) {
    return { updatedDocuments, executionComplete: false, completionRequested: false, githubSyncComplete };
  }

  const planStepIds = Array.isArray(completionCandidate.plan_step_ids)
    ? completionCandidate.plan_step_ids.map((value: unknown) => String(value))
    : [];
  const completedStepIds = Array.isArray(completionCandidate.completed_step_ids)
    ? completionCandidate.completed_step_ids.map((value: unknown) => String(value))
    : [];
  const documentKeys = new Set(documents.map((document: any) => document.documentKey));
  const allStepsComplete = planStepIds.length > 0
    && planStepIds.every((stepId: string) => completedStepIds.includes(stepId)
      && documentKeys.has(`OR-${stepId}`)
      && documentKeys.has(`HANDOFF-${stepId}`));
  const latestByKey = new Map(documents.map((document: any) => [document.documentKey, document]));
  const requiredArtifactsExist = ["BLUEPRINT", "FR", "FOR", "CHECKPOINT"].every((key) => documentKeys.has(key))
    && latestByKey.get("BLUEPRINT")?.latestVersion?.state === "READY"
    && ["ACTIVE", "PUBLISHED"].includes(latestByKey.get("FR")?.latestVersion?.state)
    && ["ACTIVE", "PUBLISHED"].includes(latestByKey.get("FOR")?.latestVersion?.state);
  return {
    updatedDocuments,
    executionComplete: allStepsComplete && requiredArtifactsExist && githubSyncComplete,
    completionRequested: true,
    githubSyncComplete,
  };
}

function assistantSignature(message: ManusMessageEvent, text: string) {
  return message.id ? `id:${message.id}` : `content:${text}`;
}

/** Retorna somente uma resposta assistant que não existia no snapshot anterior. */
export function findNewAssistantReply(before: ManusMessageEvent[], after: ManusMessageEvent[]) {
  const previousCounts = new Map<string, number>();
  for (const message of before) {
    if (message.type !== "assistant_message") continue;
    const text = assistantText(message);
    if (!text) continue;
    const signature = assistantSignature(message, text);
    previousCounts.set(signature, (previousCounts.get(signature) || 0) + 1);
  }

  for (const message of after) {
    if (message.type !== "assistant_message") continue;
    const text = assistantText(message);
    if (!text) continue;
    const signature = assistantSignature(message, text);
    const previousCount = previousCounts.get(signature) || 0;
    if (previousCount > 0) {
      previousCounts.set(signature, previousCount - 1);
      continue;
    }
    return text;
  }
  return null;
}

/** Encaminha uma mensagem do SCP para a tarefa Manus e aguarda uma resposta nova. */
export async function sendManusMessageAndWait(task: NonNullable<LocalTask>, text: string) {
  const before = await listManusMessages(task);
  await sendManusMessage(task, text);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const messages = await listManusMessages(task);
    const answer = findNewAssistantReply(before, messages);
    if (answer) return answer;
  }

  return null;
}

export async function getManusCheckpoint(task: NonNullable<LocalTask>) {
  return (await listManusMessages(task))
    .filter((item) => item.type === "assistant_message" && item.assistant_message?.content)
    .map((item) => assistantText(item))
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

async function updateTaskStatusAndMirror(taskId: number, statusId: number) {
  await db.updateTaskStatus(taskId, statusId);
  try {
    await mirrorMissionToGitHub(taskId);
  } catch (error) {
    console.warn(`[Manus] Não foi possível espelhar a mudança de status da missão ${taskId} no GitHub:`, error instanceof Error ? error.message : error);
  }
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

  if (task.manusStatus === "manual_resume_pending") {
    if (normalizedStatus === "running") {
      const progressStatusId = await db.getTaskStatusIdByName("PROGRESS");
      await db.updateTaskExecution(task.id, {
        manusStatus: "running",
        completedAt: null,
      });
      await updateTaskStatusAndMirror(task.id, progressStatusId);
      return { taskId: task.id, manusStatus: "running", creditsUsed: externalTask.credit_usage ?? null };
    }
    if (normalizedStatus === "error") {
      const failStatusId = await db.getTaskStatusIdByName("FAIL");
      await db.updateTaskExecution(task.id, {
        manusStatus: "error",
        completedAt: new Date(),
      });
      await updateTaskStatusAndMirror(task.id, failStatusId);
      return { taskId: task.id, manusStatus: "error", creditsUsed: externalTask.credit_usage ?? null };
    }
    await db.updateTaskExecution(task.id, {
      manusStatus: "manual_resume_pending",
      creditsUsed: typeof externalTask.credit_usage === "number" ? externalTask.credit_usage : undefined,
      completedAt: null,
    });
    return { taskId: task.id, manusStatus: "manual_resume_pending", creditsUsed: externalTask.credit_usage ?? null };
  }

  // Uma pausa solicitada pelo operador não pode ser confundida com conclusão.
  // Só finaliza em PAUSED quando a Manus confirma stopped e nenhum job em background.
  if (task.manusStatus === "manual_pause_pending") {
    if (normalizedStatus === "stopped" && externalTask.has_running_background_jobs === false) {
      const pausedStatusId = await db.getTaskStatusIdByName("PAUSED");
      await db.updateTaskExecution(task.id, {
        manusStatus: "stopped",
        creditsUsed: typeof externalTask.credit_usage === "number" ? externalTask.credit_usage : undefined,
        completedAt: null,
      });
      await updateTaskStatusAndMirror(task.id, pausedStatusId);
      return { taskId: task.id, manusStatus: "stopped", creditsUsed: externalTask.credit_usage ?? null };
    }
    if (normalizedStatus === "error") {
      const failStatusId = await db.getTaskStatusIdByName("FAIL");
      await db.updateTaskExecution(task.id, {
        manusStatus: "error",
        completedAt: new Date(),
      });
      await updateTaskStatusAndMirror(task.id, failStatusId);
      return { taskId: task.id, manusStatus: "error", creditsUsed: externalTask.credit_usage ?? null };
    }
    await db.updateTaskExecution(task.id, {
      manusStatus: "manual_pause_pending",
      creditsUsed: typeof externalTask.credit_usage === "number" ? externalTask.credit_usage : undefined,
      completedAt: null,
    });
    return { taskId: task.id, manusStatus: "manual_pause_pending", creditsUsed: externalTask.credit_usage ?? null };
  }

  let agentUpdate: MissionAgentUpdateResult = {
    updatedDocuments: 0,
    executionComplete: false,
    completionRequested: false,
    githubSyncComplete: false,
  };
  try {
    agentUpdate = await persistMissionAgentUpdates(task);
    if (agentUpdate.updatedDocuments > 0) {
      console.log(`[Manus] ${agentUpdate.updatedDocuments} artefato(s) persistido(s) para a missão ${task.id}.`);
    }
  } catch (error) {
    console.warn(`[Manus] Não foi possível persistir os artefatos da missão ${task.id}:`, error instanceof Error ? error.message : error);
  }

  let isDone = false;
  let isFailed = false;
  let waitingForCredits = false;
  if (normalizedStatus === "stopped" || normalizedStatus === "error") {
    // Terminal externo sozinho não prova conclusão; também pode indicar esgotamento de créditos.
    if (externalTask.has_running_background_jobs !== false) return null;

    if (agentUpdate.executionComplete) {
      isDone = true;
    } else {
      let knownCredits: number | null = null;
      try {
        knownCredits = await syncAgentCredits(task.agentId);
      } catch (error) {
        const currentAgent = await db.getAgentById(task.agentId).catch(() => null);
        knownCredits = currentAgent?.creditsRemaining == null ? null : Number(currentAgent.creditsRemaining);
        console.warn(`[Manus] Consulta de créditos indisponível para a missão ${task.id}; usando apenas o último saldo conhecido.`, error instanceof Error ? error.message : error);
      }

      if (knownCredits === null || !Number.isFinite(knownCredits)) {
        await db.updateTaskExecution(task.id, {
          manusStatus: "completion_check_pending",
          creditsUsed: typeof externalTask.credit_usage === "number" ? externalTask.credit_usage : undefined,
          completedAt: null,
        });
        await updateTaskStatusAndMirror(task.id, await db.getTaskStatusIdByName("PAUSED"));
        return { taskId: task.id, manusStatus: "completion_check_pending", creditsUsed: externalTask.credit_usage ?? null };
      }

      if (knownCredits <= 0) {
        waitingForCredits = true;
      } else if (normalizedStatus === "error") {
        isFailed = true;
      } else if (!agentUpdate.githubSyncComplete) {
        await db.updateTaskExecution(task.id, {
          manusStatus: "github_sync_pending",
          creditsUsed: typeof externalTask.credit_usage === "number" ? externalTask.credit_usage : undefined,
          completedAt: null,
        });
        await updateTaskStatusAndMirror(task.id, await db.getTaskStatusIdByName("PAUSED"));
        return { taskId: task.id, manusStatus: "github_sync_pending", creditsUsed: externalTask.credit_usage ?? null };
      } else {
        // A Manus parou, mas o agente não confirmou que todas as etapas do BP terminaram.
        // Preserva o estado e não classifica a missão como DONE.
        await db.updateTaskExecution(task.id, {
          manusStatus: "execution_interrupted",
          creditsUsed: typeof externalTask.credit_usage === "number" ? externalTask.credit_usage : undefined,
          completedAt: null,
        });
        await updateTaskStatusAndMirror(task.id, await db.getTaskStatusIdByName("PAUSED"));
        return { taskId: task.id, manusStatus: "execution_interrupted", creditsUsed: externalTask.credit_usage ?? null };
      }
    }
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
    await updateTaskStatusAndMirror(task.id, doneStatusId || failStatusId || pausedStatusId!);
  }

  return { taskId: task.id, manusStatus: waitingForCredits ? "waiting_credit" : normalizedStatus, creditsUsed: externalTask.credit_usage ?? null };
}

export async function syncRunningManusTasks() {
  const tasks = (await db.getAllTasksGlobal()).filter((task) =>
    task.manusTaskId
    && task.manusStatus !== "stopped"
    && task.manusStatus !== "error"
    && task.manusStatus !== "waiting_credit"
    && task.manusStatus !== "execution_interrupted"
  );
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
