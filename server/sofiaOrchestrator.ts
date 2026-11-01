import * as db from "./db";
import { Task } from "../drizzle/schema";
import { createManusTask } from "./manusExecutionService";

/**
 * Sofia Orchestrator v1.0
 * Lógica central para orquestração de agentes e decomposição de tarefas.
 */

// Nomes estáveis do lookup; os IDs são gerados pelo banco e devem ser consultados.
const STATUS_STAGED = "STAGED";
const STATUS_PROGRESS = "PROGRESS";
const STATUS_DONE = "DONE";

export class SofiaOrchestrator {
  /**
   * Determina se uma tarefa deve ser fatorada (decomposta).
   */
  static shouldFactorize(task: any): boolean {
    if (!task.description) return false;
    
    const descLower = task.description.toLowerCase();
    const keywords = [
      "análise detalhada",
      "várias partes",
      "múltiplas etapas",
      "estrutural",
      "operacional",
      "estratégico",
      "completo",
      "abrangente",
      "recursivo",
      "decomposição",
      "fatoração"
    ];
    
    return keywords.some(kw => descLower.includes(kw));
  }

  /**
   * Fatoriza uma tarefa em subtarefas.
   */
  static async factorizeTask(task: any): Promise<number[]> {
    console.log(`[Orchestrator] Fatorando tarefa ${task.id}: ${task.title}`);
    
    const subtaskIds: number[] = [];
    const dimensions = [
      { title: "Análise Estrutural", suffix: "[ESTRUTURAL]" },
      { title: "Análise Operacional", suffix: "[OPERACIONAL]" },
      { title: "Análise Estratégica", suffix: "[ESTRATÉGICA]" }
    ];

    for (const dim of dimensions) {
      const result = await db.createTask({
        createdBy: task.createdBy,
        agentId: task.agentId,
        title: `${dim.title}: ${task.title}`,
        description: `${dim.suffix} ${task.description}`,
        statusId: await db.getTaskStatusIdByName(STATUS_STAGED),
        priorityId: task.priorityId,
        parentTaskId: task.id
      });
      
      const insertId = (result as any)[0]?.id;
      if (insertId) {
        subtaskIds.push(insertId);
        
        // Criar log de atividade
        const eventType = await db.getOrCreateActivityEventType("task_factorization");
        await db.createActivityLog({
          agentId: task.agentId || 0,
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

    const existingSubtasks = await db.getTasksByParentId(taskId);
    let subtaskIds: number[] = [];
    const factorized = this.shouldFactorize(task) && existingSubtasks.length === 0;

    if (factorized) {
      subtaskIds = await this.factorizeTask(task);
    }

    await db.updateTaskStatus(taskId, await db.getTaskStatusIdByName(STATUS_PROGRESS));
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
  static async startTask(taskId: number) {
    const task = await db.getTaskById(taskId);
    if (!task) return null;
    if (!task.agentId) throw new Error("A missão precisa de um agente responsável antes da execução.");

    const stagedStatusId = await db.getTaskStatusIdByName(STATUS_STAGED);
    const progressStatusId = await db.getTaskStatusIdByName(STATUS_PROGRESS);
    const claimedTask = await db.claimStagedTask(taskId, stagedStatusId, progressStatusId);

    // Duplicate webhook/manual requests become harmless: only the STAGED -> PROGRESS
    // transition can reserve the mission.
    if (!claimedTask) {
      const currentTask = await db.getTaskById(taskId);
      return {
        task: currentTask,
        started: false,
        factorized: false,
        subtaskIds: [],
        executionStarted: Boolean(currentTask?.manusTaskId),
        externalTaskIds: currentTask?.manusTaskId ? [currentTask.manusTaskId] : [],
      };
    }

    const existingSubtasks = await db.getTasksByParentId(taskId);
    const factorized = this.shouldFactorize(claimedTask) && existingSubtasks.length === 0;

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
        const externalTaskIds = childResults.flatMap((result: any) => result?.externalTaskIds ?? []);
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
        const eventType = await db.getOrCreateActivityEventType("task_execution_failed");
        await db.createActivityLog({
          agentId: claimedTask.agentId,
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
