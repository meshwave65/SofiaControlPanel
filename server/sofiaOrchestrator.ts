import * as db from "./db";
import { Task } from "../drizzle/schema";

/**
 * Sofia Orchestrator v1.0
 * Lógica central para orquestração de agentes e decomposição de tarefas.
 */

// Status das tarefas conforme setup_sofia_db.sql
const STATUS_STAGED = 100;
const STATUS_PROGRESS = 110;
const STATUS_DONE = 130;
const STATUS_FAIL = 200;

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
        statusId: STATUS_STAGED,
        priorityId: task.priorityId,
        parentTaskId: task.id
      });
      
      const insertId = (result as any)[0]?.insertId;
      if (insertId) {
        subtaskIds.append(insertId);
        
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

    let report = `# Relatório Consolidado - Tarefa ${parentTaskId}\n\n`;
    report += `**Data:** ${new Date().toLocaleString()}\n\n`;

    for (const subtask of subtasks) {
      report += `## ${subtask.title} (ID: ${subtask.id})\n`;
      report += `**Status:** ${subtask.statusId === STATUS_DONE ? "✅ Concluída" : "❌ Falhou"}\n\n`;
      
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
    if (!task) return;

    if (task.statusId === STATUS_STAGED) {
      if (this.shouldFactorize(task)) {
        await this.factorizeTask(task);
        // Em um sistema real, aqui poderíamos mudar para um status intermediário
        // ou aguardar as subtarefas.
      } else {
        // Mover para progresso se não for fatorar
        await db.updateTaskStatus(taskId, STATUS_PROGRESS);
      }
    }
  }
}

// Adicionar método ao db.ts para buscar por parentTaskId se não existir
// Nota: O db.ts já tem acesso ao schema, então podemos estendê-lo lá.
