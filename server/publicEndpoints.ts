import { Router } from "express";
import * as db from "./db";

/**
 * Endpoints Públicos para Agentes Externos
 * 
 * Estes endpoints permitem que agentes autônomos se comuniquem com o sistema
 * sem autenticação OAuth, usando apenas o agentId como identificador.
 * 
 * Todos os endpoints retornam JSON e devem ser chamados com Content-Type: application/json
 */

const router = Router();

/**
 * POST /api/public/heartbeat
 * 
 * Agente envia sinal de vida (heartbeat) para indicar que está online
 * 
 * Body:
 * {
 *   "agentId": number,
 *   "status": "online" | "offline" | "idle" | "paused" (opcional)
 * }
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "message": string,
 *   "timestamp": string (ISO 8601)
 * }
 * 
 * Exemplo:
 * curl -X POST http://localhost:3000/api/public/heartbeat \
 *   -H "Content-Type: application/json" \
 *   -d '{"agentId": 1, "status": "online"}'
 */
router.post("/heartbeat", async (req, res) => {
  try {
    const { agentId, status } = req.body;

    if (!agentId || typeof agentId !== "number") {
      return res.status(400).json({
        success: false,
        message: "agentId é obrigatório e deve ser um número",
      });
    }

    // Atualizar heartbeat do agente
    await db.updateAgentHeartbeat(agentId);

    // Se status foi fornecido, atualizar também
    if (status && ["online", "offline", "idle", "paused"].includes(status)) {
      await db.updateAgentStatus(agentId, status);
    }

    // Registrar atividade
    const eventType = await db.getOrCreateActivityEventType("heartbeat");
    await db.createActivityLog({
      agentId,
      eventTypeId: event.id,
      details: JSON.stringify({ 
        description: `Agente enviou heartbeat com status: ${status || "online"}`,
        status: status || "online", 
        timestamp: new Date().toISOString() 
      }),
    });

    res.json({
      success: true,
      message: "Heartbeat recebido com sucesso",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Public API] Heartbeat error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao processar heartbeat",
    });
  }
});

/**
 * POST /api/public/activity
 * 
 * Agente registra um evento de atividade
 * 
 * Body:
 * {
 *   "agentId": number,
 *   "taskId": number (opcional),
 *   "eventType": string (nome do tipo de evento),
 *   "description": string,
 *   "metadata": object (opcional)
 * }
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "message": string,
 *   "logId": number
 * }
 * 
 * Exemplo:
 * curl -X POST http://localhost:3000/api/public/activity \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "agentId": 1,
 *     "taskId": 5,
 *     "eventType": "task_completed",
 *     "description": "Tarefa processada com sucesso",
 *     "metadata": {"duration_ms": 1234, "items_processed": 100}
 *   }'
 */
router.post("/activity", async (req, res) => {
  try {
    const { agentId, taskId, eventType, description, metadata } = req.body;

    if (!agentId || !eventType) {
      return res.status(400).json({
        success: false,
        message: "agentId e eventType são obrigatórios",
      });
    }

    // Obter ou criar tipo de evento
    const event = await db.getOrCreateActivityEventType(eventType);

    // Criar log de atividade
    const result = await db.createActivityLog({
      agentId,
      taskId: taskId || undefined,
      eventTypeId: event.id,
      details: JSON.stringify({ description, ...metadata }),
    });

    res.json({
      success: true,
      message: "Atividade registrada com sucesso",
      logId: (result as any).insertId || result,
    });
  } catch (error) {
    console.error("[Public API] Activity error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao registrar atividade",
    });
  }
});

/**
 * POST /api/public/message
 * 
 * Agente envia uma mensagem para uma tarefa
 * 
 * Body:
 * {
 *   "agentId": number,
 *   "taskId": number,
 *   "messageType": string (nome do tipo, ex: "question", "update", "error"),
 *   "content": string,
 *   "parentMessageId": number (opcional, para threads)
 * }
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "message": string,
 *   "messageId": number
 * }
 * 
 * Exemplo:
 * curl -X POST http://localhost:3000/api/public/message \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "agentId": 1,
 *     "taskId": 5,
 *     "messageType": "update",
 *     "content": "Processamento 50% completo",
 *     "parentMessageId": 10
 *   }'
 */
router.post("/message", async (req, res) => {
  try {
    const { agentId, taskId, messageType, content, parentMessageId } = req.body;

    if (!agentId || !taskId || !messageType || !content) {
      return res.status(400).json({
        success: false,
        message: "agentId, taskId, messageType e content são obrigatórios",
      });
    }

    // Obter ou criar tipo de mensagem
    const type = await db.getOrCreateMessageType(messageType);

    // Criar mensagem
    const result = await db.createMessage({
      taskId,
      senderId: agentId,
      typeId: type.id,
      content,
      parentMessageId: parentMessageId || undefined,
    });

    res.json({
      success: true,
      message: "Mensagem enviada com sucesso",
      messageId: (result as any).insertId || result,
    });
  } catch (error) {
    console.error("[Public API] Message error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao enviar mensagem",
    });
  }
});

/**
 * GET /api/public/messages/:taskId
 * 
 * Agente recupera todas as mensagens de uma tarefa
 * 
 * Params:
 * - taskId: number
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "messages": Message[],
 *   "count": number
 * }
 * 
 * Exemplo:
 * curl http://localhost:3000/api/public/messages/5
 */
router.get("/messages/:taskId", async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);

    if (isNaN(taskId)) {
      return res.status(400).json({
        success: false,
        message: "taskId deve ser um número válido",
      });
    }

    const messages = await db.getMessagesByTaskId(taskId);

    res.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error("[Public API] Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao recuperar mensagens",
    });
  }
});

/**
 * GET /api/public/agent/:agentId
 * 
 * Recupera informações de um agente específico
 * 
 * Params:
 * - agentId: number
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "agent": Agent | null
 * }
 * 
 * Exemplo:
 * curl http://localhost:3000/api/public/agent/1
 */
router.get("/agent/:agentId", async (req, res) => {
  try {
    const agentId = parseInt(req.params.agentId);

    if (isNaN(agentId)) {
      return res.status(400).json({
        success: false,
        message: "agentId deve ser um número válido",
      });
    }

    const agent = await db.getAgentById(agentId);

    res.json({
      success: true,
      agent: agent || null,
    });
  } catch (error) {
    console.error("[Public API] Get agent error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao recuperar agente",
    });
  }
});

/**
 * GET /api/public/tasks/:agentId
 * 
 * Recupera todas as tarefas de um agente
 * 
 * Params:
 * - agentId: number
 * 
 * Response:
 * {
 *   "success": boolean,
 *   "tasks": Task[],
 *   "count": number
 * }
 * 
 * Exemplo:
 * curl http://localhost:3000/api/public/tasks/1
 */
router.get("/tasks/:agentId", async (req, res) => {
  try {
    const agentId = parseInt(req.params.agentId);

    if (isNaN(agentId)) {
      return res.status(400).json({
        success: false,
        message: "agentId deve ser um número válido",
      });
    }

    const tasks = await db.getTasksByAgentId(agentId);

    res.json({
      success: true,
      tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error("[Public API] Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao recuperar tarefas",
    });
  }
});

export default router;
