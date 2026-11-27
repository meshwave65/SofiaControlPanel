import * as db from "./db";
import { Task } from "../drizzle/schema";
import { createManusTask, getManusCheckpoint, sendManusMessage, syncAgentCredits } from "./manusExecutionService";
import { mirrorTaskToGitHub } from "./githubMissionMirror";

/**
 * Sofia Orchestrator v1.0
 * Lógica central para orquestração de agentes e decomposição de tarefas.
 */

// Nomes estáveis do lookup; os IDs são gerados pelo banco e devem ser consultados.
const STATUS_STAGED = "STAGED";
const STATUS_PROGRESS = "PROGRESS";
const STATUS_DONE = "DONE";

async function syncTaskMirror(taskId: number) {
  try {
    const task = await db.getTaskById(taskId);
    if (!task) return;
    const mirror = await mirrorTaskToGitHub(task);
    await db.updateTaskGitHubSync(taskId, {
      missionKey: mirror.missionKey,
      githubPath: mirror.path,
      githubSha: mirror.sha,
      githubSyncStatus: mirror.status,
      githubSyncError: mirror.error ?? null,
    });
  } catch (error) {
    console.error(`[Orchestrator] GitHub mirror failed for task ${taskId}:`, error);
  }
}


type AgentEligibilityPool = {
  refreshedAt: number;
  totalAgents: number;
  eligibleAgentIds: number[];
};

const AGENT_POOL_REFRESH_MS = 60_000;
const agentEligibilityPools = new Map<number, AgentEligibilityPool>();
let agentPoolRefreshPromise: Promise<void> | null = null;

export class SofiaOrchestrator {
  static async refreshAgentEligibilityPool() {
    if (agentPoolRefreshPromise) return agentPoolRefreshPromise;
    agentPoolRefreshPromise = (async () => {
      const [agents, tasks] = await Promise.all([
        db.getAllAgentsGlobal(),
        db.getAllTasksGlobal(),
      ]);
      const progressStatusId = await db.getTaskStatusIdByName(STATUS_PROGRESS);
      const busyAgentIds = new Set<number>(
        tasks
          .filter((task: any) => task.statusId === progressStatusId && task.agentId != null)
          .map((task: any) => Number(task.agentId)),
      );
      const byOwner = new Map<number, any[]>();
      for (const agent of agents as any[]) {
        const ownerId = Number(agent.ownerId);
        const ownerAgents = byOwner.get(ownerId) ?? [];
        ownerAgents.push(agent);
        byOwner.set(ownerId, ownerAgents);
      }

      const refreshedAt = Date.now();
      agentEligibilityPools.clear();
      for (const [ownerId, ownerAgents] of byOwner) {
        const eligible = ownerAgents.filter((agent: any) => {
          const credits = agent.creditsRemaining == null ? null : Number(agent.creditsRemaining);
          return agent.status === "online"
            && ["configured", "connected"].includes(agent.connectionStatus)
            && agent.hasCredential === true
            && agent.centralSourceAvailable !== false
            && credits !== null
            && Number.isFinite(credits)
            && credits > 0
            && !busyAgentIds.has(Number(agent.id));
        });
        eligible.sort((left: any, right: any) => {
          const creditDelta = Number(right.creditsRemaining) - Number(left.creditsRemaining);
          if (creditDelta !== 0) return creditDelta;
          const leftUpdated = left.creditsUpdatedAt ? new Date(left.creditsUpdatedAt).getTime() : Number.NEGATIVE_INFINITY;
          const rightUpdated = right.creditsUpdatedAt ? new Date(right.creditsUpdatedAt).getTime() : Number.NEGATIVE_INFINITY;
          return leftUpdated - rightUpdated || Number(left.id) - Number(right.id);
        });
        agentEligibilityPools.set(ownerId, {
          refreshedAt,
          totalAgents: ownerAgents.length,
          eligibleAgentIds: eligible.map((agent: any) => Number(agent.id)),
        });
      }
      console.log(`[AgentPool] Inventário atualizado: ${agents.length} agentes; ${Array.from(agentEligibilityPools.values()).reduce((sum, item) => sum + item.eligibleAgentIds.length, 0)} elegíveis.`);
    })().finally(() => {
      agentPoolRefreshPromise = null;
    });
    return agentPoolRefreshPromise;
  }

  static async getEligibleAgentIds(ownerId: number) {
    const current = agentEligibilityPools.get(ownerId);
    if (!current || Date.now() - current.refreshedAt >= AGENT_POOL_REFRESH_MS) {
      await this.refreshAgentEligibilityPool();
    }
    return [...(agentEligibilityPools.get(ownerId)?.eligibleAgentIds ?? [])];
  }

  static markAgentUnavailable(agentId: number | null | undefined) {
    if (agentId == null) return;
    for (const pool of agentEligibilityPools.values()) {
      pool.eligibleAgentIds = pool.eligibleAgentIds.filter((id) => id !== Number(agentId));
    }
  }

  static async resumeCreditBlockedTasks() {
    const waiting = (await db.getAllTasksGlobal()).filter((task) => task.manusStatus === "waiting_credit" && task.agentId);
    const progressStatusId = await db.getTaskStatusIdByName(STATUS_PROGRESS);
    const results: Array<{ taskId: number; action: string; agentId: number }> = [];
    for (const task of waiting) {
      if (!(await db.hasExecutionReadyMissionDocuments(task.id))) {
        console.warn(`[Orchestrator] Retomada bloqueada para missão ${task.id}: TR/Blueprint não estão elegíveis.`);
        continue;
      }
      const agents = await db.getAllAgentsGlobal();
      const current = agents.find((agent) => agent.id === task.agentId);
      if (!current) continue;
      let currentCredits: number | null = current.creditsRemaining == null ? null : Number(current.creditsRemaining);
      try {
        currentCredits = await syncAgentCredits(current.id);
      } catch (error) {
        // Preserve the last known balance. Unknown is not treated as positive or exhausted.
        console.warn(`[Orchestrator] Consulta de créditos indisponível para o agente atual ${current.id}; mantendo o último saldo conhecido.`);
      }
      if (currentCredits !== null && currentCredits > 0 && task.manusTaskId) {
        await sendManusMessage(task, "Os créditos foram restaurados. Continue a missão a partir do último checkpoint, sem repetir o trabalho concluído.");
        await db.updateTaskExecution(task.id, { manusStatus: "running", completedAt: null });
        await db.updateTaskStatus(task.id, progressStatusId);
        await syncTaskMirror(task.id);
        results.push({ taskId: task.id, action: task.agentPinned ? "resumed_pinned_agent" : "resumed_agent", agentId: current.id });
        continue;
      }
      if (currentCredits === null || currentCredits > 0) continue;

      // A exaustão libera a missão para transferência, mesmo quando havia agente fixado.
      const allTasks = await db.getAllTasksGlobal();
      const activeAgentIds = new Set(allTasks
        .filter((item) => item.statusId === progressStatusId && item.agentId && item.id !== task.id)
        .map((item) => item.agentId));
      const replacements = agents.filter((agent) =>
        agent.id !== current.id
        && agent.ownerId === task.createdBy
        && agent.status === "online"
        && ["configured", "connected"].includes(agent.connectionStatus)
        && agent.hasCredential === true
        && agent.centralSourceAvailable !== false
        && !activeAgentIds.has(agent.id)
      );
      const checkpoint = await getManusCheckpoint(task).catch(() => "");
      let transferred = false;
      for (const replacement of replacements) {
        let replacementCredits: number | null = replacement.creditsRemaining == null ? null : Number(replacement.creditsRemaining);
        try {
          replacementCredits = await syncAgentCredits(replacement.id);
        } catch {
          // A falha de consulta não apaga um saldo positivo já conhecido.
        }
        if (replacementCredits === null || replacementCredits <= 0) continue;

        await db.reassignTaskAgent(task.id, replacement.id);
        try {
          await createManusTask({ ...task, agentId: replacement.id }, checkpoint);
          await db.updateTaskStatus(task.id, progressStatusId);
          await syncTaskMirror(task.id);
          this.markAgentUnavailable(current.id);
          this.markAgentUnavailable(replacement.id);
          results.push({ taskId: task.id, action: "transferred_after_credit_exhaustion", agentId: replacement.id });
          transferred = true;
          break;
        } catch (error) {
          // Try the next eligible agent; leave the mission paused if none can start it.
          await db.reassignTaskAgent(task.id, current.id);
          console.warn(`[Orchestrator] Agente substituto ${replacement.id} não conseguiu assumir a missão ${task.id}:`, error instanceof Error ? error.message : error);
        }
      }
      if (!transferred) {
        console.warn(`[Orchestrator] Missão ${task.id} permanece aguardando um agente substituto com saldo e credencial disponíveis.`);
      }
    }
    return results;
  }
  /**
   * Determina se uma tarefa deve ser fatorada (decomposta).
   */
  static shouldFactorize(_task: any): boolean {
    // Mission decomposition is driven by the approved TR and agent-authored BP,
    // never by description keywords or heuristic dimensions.
    return false;
  }

  /**
   * Fatoriza uma tarefa em subtarefas.
   */
  static hasFactorizationSubtasks(task: any, subtasks: any[]): boolean {
    const dimensionTitles = ["Análise Estrutural", "Análise Operacional", "Análise Estratégica"];
    return subtasks.some((subtask) =>
      dimensionTitles.some((title) => subtask.title === `${title}: ${task.title}`)
    );
  }

  /**
   * Fatoriza uma tarefa em subtarefas. A operação é idempotente para permitir
   * retomar uma fatoração interrompida sem duplicar subtarefas já persistidas.
   */
  static async factorizeTask(task: any): Promise<number[]> {
    if (!(await db.hasExecutionReadyMissionDocuments(task.id))) {
      throw new Error("Fatoração bloqueada: a missão principal exige TR validado.");
    }
    if (task.parentTaskId != null) {
      throw new Error("Esta tarefa já é uma subtarefa. A fatoração deve ser feita na missão principal.");
    }
    const currentStatusName = (await db.getTaskStatusNameById(task.statusId))?.toUpperCase();
    if (currentStatusName !== STATUS_STAGED && currentStatusName !== STATUS_PROGRESS) {
      throw new Error("Fatoração bloqueada: a missão principal precisa estar STAGED ou PROGRESS; PAUSED não libera unidades de execução.");
    }
    console.log(`[Orchestrator] Fatorando tarefa ${task.id}: ${task.title}`);

    const subtaskIds: number[] = [];
    const existingSubtasks = await db.getTasksByParentId(task.id);
    const dimensions = [
      { title: "Análise Estrutural", suffix: "[ESTRUTURAL]" },
      { title: "Análise Operacional", suffix: "[OPERACIONAL]" },
      { title: "Análise Estratégica", suffix: "[ESTRATÉGICA]" }
    ];

    for (const dim of dimensions) {
      const subtaskTitle = `${dim.title}: ${task.title}`;
      const existing = existingSubtasks.find((subtask) => subtask.title === subtaskTitle);
      if (existing) {
        subtaskIds.push(existing.id);
        continue;
      }

      const result = await db.createTask({
        createdBy: task.createdBy,
        creatorType: task.creatorType === "system" ? "system" : "user",
        // Child execution units inherit the validated mission scope, not the
        // parent's temporary executor lease or an explicit pin on that executor.
        title: subtaskTitle,
        description: `${dim.suffix} ${task.description}`,
        statusId: await db.getTaskStatusIdByName(STATUS_STAGED),
        priorityId: task.priorityId,
        parentTaskId: task.id
      });

      const insertId = (result as any)[0]?.id;
      if (insertId) {
        await syncTaskMirror(insertId);
        subtaskIds.push(insertId);
        const eventType = await db.getOrCreateActivityEventType("task_factorization");
        await db.createActivityLog({
          agentId: task.agentId ?? null,
          taskId: task.id,
          eventTypeId: eventType.id,
          details: `Subtarefa criada: ${dim.title} (ID: ${insertId})`
        });
      }
    }

    return subtaskIds;
  }

  /**
   * Consolida os resultados das subtarefas.
   */
  static async consolidateResults(parentTaskId: number): Promise<string> {
    const dbInstance = await db.getDb();
    if (!dbInstance) throw new Error("Database not available");

    // Buscar subtarefas
    const subtasks = await db.getTasksByParentId(parentTaskId);
    if (!subtasks || subtasks.length === 0) return "Nenhuma subtarefa encontrada para consolidação.";
    const doneStatusId = await db.getTaskStatusIdByName(STATUS_DONE);

    let report = `# Relatório Consolidado - Tarefa ${parentTaskId}\n\n`;
    report += `**Data:** ${new Date().toLocaleString()}\n\n`;

    for (const subtask of subtasks) {
      report += `## ${subtask.title} (ID: ${subtask.id})\n`;
      report += `**Status:** ${subtask.statusId === doneStatusId ? "✅ Concluída" : "❌ Falhou"}\n\n`;
      
      // Buscar mensagens/relatórios da subtarefa
      const messages = await db.getMessagesByTaskId(subtask.id);
      const lastReport = messages.find(m => m.content.includes("Report") || m.content.length > 200);
      
      if (lastReport) {
        report += `### Resultado\n${lastReport.content}\n\n`;
      } else {
        report += `### Resultado\n${subtask.description || "Sem detalhes adicionais."}\n\n`;
      }
      
      report += "---\n\n";
    }

    return report;
  }

  /**
   * Processa o ciclo de vida de uma tarefa.
   */
  static async processTask(taskId: number) {
    const task = await db.getTaskById(taskId);
    if (!task) return null;

    const stagedStatusId = await db.getTaskStatusIdByName(STATUS_STAGED);
    if (task.statusId !== stagedStatusId) {
      return { task, started: false, factorized: false, subtaskIds: [] };
    }
    if (!(await db.hasExecutionReadyMissionDocuments(taskId))) {
      throw new Error("Execução bloqueada: a missão exige TR validado e Blueprint READY vinculado à versão vigente.");
    }

    const existingSubtasks = await db.getTasksByParentId(taskId);
    let subtaskIds: number[] = [];
    const factorized = this.shouldFactorize(task) && (existingSubtasks.length === 0 || this.hasFactorizationSubtasks(task, existingSubtasks));

    if (factorized) {
      subtaskIds = await this.factorizeTask(task);
    }

    await db.updateTaskStatus(taskId, await db.getTaskStatusIdByName(STATUS_PROGRESS));
    await syncTaskMirror(taskId);
    const updatedTask = await db.getTaskById(taskId);

    return {
      task: updatedTask,
      started: true,
      factorized,
      subtaskIds,
    };
  }

  /**
   * Inicia a missão local e cria a execução correspondente na API Manus.
   */
  static async startTask(taskId: number, dispatchKey?: string): Promise<any> {
    void dispatchKey;
    const task = await db.getTaskById(taskId);
    if (!task) return null;

    const stagedStatusId = await db.getTaskStatusIdByName(STATUS_STAGED);
    if (task.statusId !== stagedStatusId) {
      return {
        task,
        started: false,
        factorized: false,
        subtaskIds: [],
        executionStarted: Boolean(task.manusTaskId),
        externalTaskIds: task.manusTaskId ? [task.manusTaskId] : [],
      };
    }
    // A validação do TR autoriza a delegação; o agente prepara o BP após assumir a missão.
    if (!(await db.hasExecutionReadyMissionDocuments(taskId))) {
      throw new Error("Execução bloqueada: a missão exige TR validado e Blueprint READY. Subtarefas herdam os documentos da missão principal.");
    }
    const progressStatusId = await db.getTaskStatusIdByName(STATUS_PROGRESS);

    // The pool is refreshed every 60 seconds; each mission uses its current
    // eligible IDs and the database performs the final atomic availability check.
    const eligibleAgentIds = await this.getEligibleAgentIds(task.createdBy);
    const claimedTask = await db.claimStagedTaskWithAvailableAgent(
      taskId,
      stagedStatusId,
      progressStatusId,
      eligibleAgentIds,
    );
    if (claimedTask) {
      this.markAgentUnavailable(claimedTask.agentId);
      await syncTaskMirror(taskId);
    }

    if (!claimedTask) {
      // The atomic claim returns null both when no agent is eligible and when
      // another dispatcher has already moved the task out of STAGED. Re-read
      // before writing a wait state so we never overwrite another dispatcher's claim.
      const latestTask = await db.getTaskById(taskId);
      if (!latestTask) return null;
      if (latestTask.statusId !== stagedStatusId) {
        return {
          task: latestTask,
          started: false,
          factorized: false,
          subtaskIds: [],
          executionStarted: Boolean(latestTask.manusTaskId),
          externalTaskIds: latestTask.manusTaskId ? [latestTask.manusTaskId] : [],
        };
      }

      // No eligible agent: keep the mission STAGED. Heartbeat retries when credits/status change.
      const waitingStatus = latestTask.agentPinned ? "waiting_for_pinned_agent" : "waiting_for_available_agent";
      await db.updateTaskExecution(taskId, { manusStatus: waitingStatus });
      return {
        task: { ...latestTask, manusStatus: waitingStatus },
        started: false,
        factorized: false,
        subtaskIds: [],
        executionStarted: false,
        externalTaskIds: [],
        waitingForAgent: true,
      };
    }

    const existingSubtasks = await db.getTasksByParentId(taskId);
    const factorized = this.shouldFactorize(claimedTask) && (existingSubtasks.length === 0 || this.hasFactorizationSubtasks(claimedTask, existingSubtasks));

    try {
      if (factorized) {
        // Each new STAGED subtask is dispatched by the database trigger after insert.
        const subtaskIds = await this.factorizeTask(claimedTask);
        return {
          task: claimedTask,
          started: true,
          factorized: true,
          subtaskIds,
          executionStarted: subtaskIds.length > 0,
          externalTaskIds: [],
        };
      }

      if (existingSubtasks.length > 0) {
        // Backward compatibility: dispatch subtasks created before automatic dispatch
        // was installed. Newly created subtasks are dispatched by their INSERT trigger.
        const childResults = [];
        for (const subtask of existingSubtasks) {
          if (subtask.statusId !== stagedStatusId) continue;
          childResults.push(await this.startTask(subtask.id));
        }
        const externalTaskIds: string[] = childResults.flatMap((result: any) => result?.externalTaskIds ?? []);
        return {
          task: claimedTask,
          started: true,
          factorized: false,
          subtaskIds: existingSubtasks.map((item) => item.id),
          executionStarted: externalTaskIds.length > 0 || childResults.some((result: any) => result?.executionStarted),
          externalTaskIds,
        };
      }

      const execution = await createManusTask(claimedTask);
      return {
        task: claimedTask,
        started: true,
        factorized: false,
        subtaskIds: [],
        executionStarted: true,
        externalTaskIds: [execution.manusTaskId],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      try {
        await db.updateTaskExecution(taskId, {
          manusStatus: "dispatch_failed",
          completedAt: new Date(),
        });
        await db.updateTaskStatus(taskId, await db.getTaskStatusIdByName("FAIL"));
        await syncTaskMirror(taskId);
        const eventType = await db.getOrCreateActivityEventType("task_execution_failed");
        await db.createActivityLog({
          agentId: task.agentId ?? null,
          taskId,
          eventTypeId: eventType.id,
          details: message,
        });
      } catch (recordError) {
        console.error(`[Orchestrator] Could not persist dispatch failure for task ${taskId}:`, recordError);
      }
      throw error;
    }
  }
}

// Adicionar método ao db.ts para buscar por parentTaskId se não existir
// Nota: O db.ts já tem acesso ao schema, então podemos estendê-lo lá.
