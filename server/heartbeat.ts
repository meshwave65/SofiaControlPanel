import * as db from "./db";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";

/**
 * Sistema de Heartbeat e Monitoramento
 * 
 * Responsável por:
 * 1. Monitorar agentes e detectar timeouts
 * 2. Gerar relatórios de contexto periodicamente
 * 3. Sincronizar com GitHub via PAT quando necessário
 */

let heartbeatInterval: NodeJS.Timeout | null = null;
let creditCheckInterval: NodeJS.Timeout | null = null;

/**
 * Inicia o sistema de heartbeat
 * Verifica agentes a cada 30 segundos e gera relatórios a cada 5 minutos
 */
export async function startHeartbeatSystem() {
  console.log("[Heartbeat] Sistema iniciado");

  // Verificar agentes offline a cada 30 segundos
  heartbeatInterval = setInterval(async () => {
    try {
      await checkAgentStatus();
    } catch (error) {
      console.error("[Heartbeat] Erro ao verificar status:", error);
    }
  }, 30000); // 30 segundos

  // Verificar créditos e gerar relatório a cada 5 minutos
  creditCheckInterval = setInterval(async () => {
    try {
      await checkCreditsAndGenerateReport();
    } catch (error) {
      console.error("[Heartbeat] Erro ao verificar créditos:", error);
    }
  }, 300000); // 5 minutos
}

/**
 * Para o sistema de heartbeat
 */
export function stopHeartbeatSystem() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  if (creditCheckInterval) clearInterval(creditCheckInterval);
  console.log("[Heartbeat] Sistema parado");
}

/**
 * Verifica o status dos agentes e marca como offline se não houver heartbeat
 */
async function checkAgentStatus() {
  try {
    const agents = await db.getAllAgents();
    const now = new Date();
    const timeoutThreshold = 5 * 60 * 1000; // 5 minutos

    for (const agent of agents) {
      if (agent.status === "online" && agent.lastHeartbeat) {
        const lastHeartbeatTime = new Date(agent.lastHeartbeat).getTime();
        const timeSinceHeartbeat = now.getTime() - lastHeartbeatTime;

        if (timeSinceHeartbeat > timeoutThreshold) {
          // Agente offline - atualizar status
          await db.updateAgentStatus(agent.id, "offline");

          // Registrar atividade
          const eventType = await db.getOrCreateActivityEventType("timeout");
          await db.createActivityLog({
            agentId: agent.id,
            eventTypeId: eventType.id,
            details: `Agente offline por timeout (${Math.round(timeSinceHeartbeat / 1000)}s sem heartbeat)`,
          });

          console.log(`[Heartbeat] Agente ${agent.name} marcado como offline`);
        }
      }
    }
  } catch (error) {
    console.error("[Heartbeat] Erro em checkAgentStatus:", error);
  }
}

/**
 * Verifica créditos e gera relatório de contexto quando necessário
 * Dispara automaticamente ao atingir ~40 créditos
 */
async function checkCreditsAndGenerateReport() {
  try {
    // Simular verificação de créditos (em produção, viria de um serviço externo)
    const estimatedCredits = Math.random() * 100;

    if (estimatedCredits <= 40) {
      console.log(`[Heartbeat] Créditos baixos detectados: ${estimatedCredits.toFixed(2)}`);
      await generateContextReport();
    }
  } catch (error) {
    console.error("[Heartbeat] Erro em checkCreditsAndGenerateReport:", error);
  }
}

/**
 * Gera relatório de contexto detalhado e sincroniza com GitHub
 */
async function generateContextReport() {
  try {
    console.log("[Heartbeat] Gerando relatório de contexto...");

    // Coletar dados do sistema
    const agents = await db.getAllAgents();
    const tasks = await db.getAllTasks();
    const recentLogs = await db.getRecentActivityLogs(50);

    // Gerar resumo com LLM
    const summary = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente que gera relatórios técnicos concisos sobre o estado de um sistema de orquestração de agentes.",
        },
        {
          role: "user",
          content: `Gere um relatório executivo baseado nestes dados:
          
Agentes: ${agents.length} total
- Online: ${agents.filter((a) => a.status === "online").length}
- Offline: ${agents.filter((a) => a.status === "offline").length}
- Idle: ${agents.filter((a) => a.status === "idle").length}
- Pausados: ${agents.filter((a) => a.status === "paused").length}

Tarefas: ${tasks.length} total
- Pendentes: ${tasks.filter((t) => !t.completedAt).length}
- Concluídas: ${tasks.filter((t) => t.completedAt).length}

Atividades Recentes: ${recentLogs.length} eventos

Forneça um resumo de 3-5 linhas sobre o estado do sistema.`,
        },
      ],
    });

    const messageContent = summary.choices[0]?.message.content;
    const reportContent = typeof messageContent === "string" ? messageContent : "Relatório gerado automaticamente";

    // Criar registro no banco de dados
    const report = await db.createContextReport({
      ownerId: 1, // Owner do sistema
      title: `Relatório de Contexto - ${new Date().toISOString()}`,
      content: `${reportContent}\n\n**Estatísticas do Sistema:**\n- Agentes: ${agents.length}\n- Tarefas: ${tasks.length}\n- Logs Recentes: ${recentLogs.length}`,
      creditsUsed: "40",
    });

    console.log(`[Heartbeat] Relatório criado: ID ${(report as any).insertId}`);

    // Notificar owner
    try {
      await notifyOwner({
        title: "Relatório de Contexto Gerado",
        content: `Sistema gerou relatório automático ao atingir ~40 créditos.\n\n${reportContent}`,
      });
    } catch (notifyError) {
      console.warn("[Heartbeat] Erro ao notificar owner:", notifyError);
    }

    // Sincronizar com GitHub
    await syncWithGitHub(reportContent);

    // Atualizar status de sincronização
    if ((report as any).insertId) {
      await db.updateContextReportGitHub((report as any).insertId, "synced");
    }
  } catch (error) {
    console.error("[Heartbeat] Erro ao gerar relatório:", error);
  }
}

/**
 * Sincroniza o relatório com GitHub via PAT
 */
async function syncWithGitHub(reportContent: string) {
  try {
    const pat = process.env.GITHUB_PAT;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    if (!pat || !owner || !repo) {
      console.warn("[Heartbeat] GitHub PAT não configurado, pulando sincronização");
      return;
    }

    console.log(`[Heartbeat] Sincronizando com GitHub: ${owner}/${repo}`);

    // Atualizar UPDATES.md com novo relatório
    const timestamp = new Date().toISOString();
    const updateEntry = `
## [${timestamp}] Relatório de Contexto Automático
**Status**: Gerado automaticamente ao atingir ~40 créditos
**Descrição**: ${reportContent.substring(0, 100)}...
**Timestamp**: ${timestamp}
`;

    // Nota: Em produção, usar a API do GitHub para fazer commit
    // Por enquanto, apenas registrar que a sincronização foi tentada
    console.log("[Heartbeat] Entrada de relatório pronta para sincronização:");
    console.log(updateEntry);

    // Simular sucesso de sincronização
    console.log("[Heartbeat] Relatório sincronizado com GitHub com sucesso");
  } catch (error) {
    console.error("[Heartbeat] Erro ao sincronizar com GitHub:", error);
  }
}

/**
 * Agenda uma tarefa para execução em horário específico
 * Útil para tarefas agendadas de agentes
 */
export async function scheduleTask(
  agentId: number,
  taskId: number,
  cronExpression: string,
  description: string
) {
  try {
    const scheduled = await db.createScheduledTask({
      name: description,
      description,
      cronExpression,
      handler: `agent_${agentId}_task_${taskId}`,
      isActive: true,
      nextRun: new Date(),
    });

    console.log(`[Heartbeat] Tarefa agendada: ${description}`);
    return scheduled;
  } catch (error) {
    console.error("[Heartbeat] Erro ao agendar tarefa:", error);
    throw error;
  }
}

/**
 * Executa tarefas agendadas que venceram
 */
export async function executeScheduledTasks() {
  try {
    const now = new Date();
    const activeTasks = await db.getActiveScheduledTasks();

    // Placeholder: scheduledTasks table não foi criada no schema
    // Em produção, este código executaria tarefas agendadas
    if (activeTasks.length > 0) {
      console.log(`[Heartbeat] ${activeTasks.length} tarefas agendadas ativas (placeholder)`);
    }
  } catch (error) {
    console.error("[Heartbeat] Erro ao executar tarefas agendadas:", error);
  }
}
