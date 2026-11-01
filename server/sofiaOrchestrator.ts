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
    const localResult = task.statusId === stagedStatusId
      ? await this.processTask(taskId)
      : {
        task,
        started: !task.manusTaskId,
        factorized: false,
        subtaskIds: [],
      };
    if (!localResult) return null;
    if (!localResult.started) {
      return { ...localResult, executionStarted: Boolean(task.manusTaskId), externalTaskIds: task.manusTaskId ? [task.manusTaskId] : [] };
    }

    const existingSubtasks = await db.getTasksByParentId(taskId);
    const targetTaskIds = localResult.factorized
      ? localResult.subtaskIds
      : existingSubtasks.filter((subtask) => !subtask.manusTaskId).map((subtask) => subtask.id);
    if (targetTaskIds.length === 0 && !task.manusTaskId) targetTaskIds.push(taskId);
    const externalTaskIds: string[] = [];
    for (const targetTaskId of targetTaskIds) {
      const target = await db.getTaskById(targetTaskId);
      if (!target) continue;
      const execution = await createManusTask(target);
      externalTaskIds.push(execution.manusTaskId);
      await db.updateTaskStatus(targetTaskId, await db.getTaskStatusIdByName(STATUS_PROGRESS));
    }

    return {
      ...localResult,
      executionStarted: externalTaskIds.length > 0,
      externalTaskIds,
    };
  }
}

// Adicionar método ao db.ts para buscar por parentTaskId se não existir
// Nota: O db.ts já tem acesso ao schema, então podemos estendê-lo lá.
