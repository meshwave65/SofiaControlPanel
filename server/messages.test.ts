import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => ({
  getTaskById: vi.fn(),
  getMessageTypeById: vi.fn(),
  getMessageByIdForTask: vi.fn(),
  createMessage: vi.fn(),
  getMessagesByTaskId: vi.fn(),
  hasExecutionReadyMissionDocuments: vi.fn(),
  getMissionRootTaskId: vi.fn(),
  getTasksByParentId: vi.fn(),
  getTaskStatusNameById: vi.fn(),
  getAgentsByOwnerId: vi.fn(),
}));
const invokeLLMMock = vi.hoisted(() => vi.fn());
const sendManusMessageAndWaitMock = vi.hoisted(() => vi.fn());

vi.mock("./db", () => dbMock);
vi.mock("./_core/llm", () => ({ invokeLLM: invokeLLMMock }));
vi.mock("./manusExecutionService", () => ({
  sendManusMessageAndWait: sendManusMessageAndWaitMock,
  syncAgentCredits: vi.fn(),
}));

import { appRouter } from "./routers";

const context = {
  req: {} as any,
  res: {} as any,
  user: { id: 152, role: "user", name: "Operador fixture", email: "fixture@example.test" } as any,
};

describe("messages.create — persistência e resposta Sofia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMock.hasExecutionReadyMissionDocuments.mockResolvedValue(true);
    dbMock.getMissionRootTaskId.mockResolvedValue(19);
    dbMock.getTasksByParentId.mockResolvedValue([]);
    dbMock.getTaskStatusNameById.mockResolvedValue("PROGRESS");
    dbMock.getAgentsByOwnerId.mockResolvedValue([]);
    dbMock.getTaskById.mockResolvedValue({
      id: 19,
      createdBy: 152,
      title: "Missão fixture",
      description: "Validar comunicação",
      agentId: null,
      manusTaskId: null,
    });
    dbMock.getMessageTypeById.mockResolvedValue({ id: 1, name: "Instruction" });
    dbMock.getMessageByIdForTask.mockResolvedValue({ id: 50, taskId: 19, isAssistant: true });
    dbMock.getMessagesByTaskId.mockResolvedValue([
      { id: 100, taskId: 19, content: "confirmar canal", isAssistant: false },
    ]);
    dbMock.createMessage
      .mockResolvedValueOnce({ id: 100, taskId: 19, content: "confirmar canal", isAssistant: false })
      .mockResolvedValueOnce({ id: 101, taskId: 19, parentMessageId: 100, content: "Canal confirmado.", isAssistant: true });
    invokeLLMMock.mockResolvedValue({
      choices: [{ message: { role: "assistant", content: "Canal confirmado." } }],
    });
  });

  it("persiste o operador, envia o histórico à IA e persiste a resposta como filha", async () => {
    const result = await appRouter.createCaller(context).messages.create({
      taskId: 19,
      typeId: 1,
      content: "  confirmar canal  ",
    });

    expect(dbMock.createMessage).toHaveBeenNthCalledWith(1, expect.objectContaining({
      taskId: 19,
      senderId: 152,
      content: "confirmar canal",
    }));
    expect(invokeLLMMock).toHaveBeenCalledWith(expect.objectContaining({
      messages: expect.arrayContaining([
        expect.objectContaining({ role: "user", content: "confirmar canal" }),
      ]),
    }));
    expect(dbMock.createMessage).toHaveBeenNthCalledWith(2, expect.objectContaining({
      taskId: 19,
      parentMessageId: 100,
      content: "Canal confirmado.",
      isAssistant: true,
    }));
    expect(result.responseStatus).toBe("replied");
    expect(result.reply).toMatchObject({ id: 101, isAssistant: true });
  });

  it("mantém a Sofia como mediadora antes de encaminhar uma instrução explícita ao agente", async () => {
    dbMock.getTaskById.mockResolvedValue({
      id: 19,
      createdBy: 152,
      title: "Missão fixture",
      description: "Validar comunicação",
      agentId: 7,
      manusTaskId: "manus-task-19",
      agentPinned: false,
      manusStatus: "running",
    });
    invokeLLMMock.mockResolvedValue({
      choices: [{
        message: {
          role: "assistant",
          content: null,
          tool_calls: [{
            id: "call-forward-1",
            type: "function",
            function: {
              name: "forward_operator_instruction_to_assigned_agent",
              arguments: JSON.stringify({ message: "Continue a análise a partir do checkpoint." }),
            },
          }],
        },
      }],
    });
    sendManusMessageAndWaitMock.mockResolvedValue("Checkpoint retomado.");

    const result = await appRouter.createCaller(context).messages.create({
      taskId: 19,
      typeId: 1,
      content: "Envie ao agente: continue a análise a partir do checkpoint.",
    });

    expect(invokeLLMMock).toHaveBeenCalledWith(expect.objectContaining({
      tools: expect.arrayContaining([
        expect.objectContaining({
          function: expect.objectContaining({ name: "forward_operator_instruction_to_assigned_agent" }),
        }),
      ]),
      toolChoice: "auto",
    }));
    expect(sendManusMessageAndWaitMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 19, agentId: 7, manusTaskId: "manus-task-19" }),
      "Continue a análise a partir do checkpoint."
    );
    expect(result.responseStatus).toBe("replied");
    expect(dbMock.createMessage).toHaveBeenNthCalledWith(2, expect.objectContaining({
      content: expect.stringContaining("Checkpoint retomado."),
      isAssistant: true,
    }));
  });

  it("responde perguntas pela Sofia sem encaminhá-las automaticamente ao agente", async () => {
    dbMock.getTaskById.mockResolvedValue({
      id: 19,
      createdBy: 152,
      title: "Missão fixture",
      description: "Validar comunicação",
      agentId: 7,
      manusTaskId: "manus-task-19",
      agentPinned: false,
      manusStatus: "running",
    });
    invokeLLMMock.mockResolvedValue({
      choices: [{ message: { role: "assistant", content: "A missão está em execução." } }],
    });

    await appRouter.createCaller(context).messages.create({
      taskId: 19,
      typeId: 1,
      content: "Qual é a situação da missão?",
    });

    expect(sendManusMessageAndWaitMock).not.toHaveBeenCalled();
  });

  it("consulta estado, tarefas-filhas e agentes atribuídos sem executar ações ou expor credenciais", async () => {
    dbMock.getTaskById.mockResolvedValue({
      id: 19,
      createdBy: 152,
      title: "Missão fixture",
      description: "Validar comunicação",
      statusId: 2,
      agentId: 7,
      manusTaskId: "manus-task-19",
      agentPinned: false,
      manusStatus: "running",
      createdAt: new Date("2026-11-14T10:00:00.000Z"),
      updatedAt: new Date("2026-11-14T11:00:00.000Z"),
    });
    dbMock.getTasksByParentId.mockResolvedValue([
      {
        id: 20,
        createdBy: 152,
        title: "Filha válida",
        parentTaskId: 19,
        statusId: 3,
        agentId: 8,
        agentPinned: false,
        manusTaskId: "manus-child-20",
        manusStatus: "completed",
        creditsUsed: 12,
        completedAt: new Date("2026-11-14T12:00:00.000Z"),
      },
      {
        id: 21,
        createdBy: 999,
        title: "Registro de outro proprietário",
        parentTaskId: 19,
        statusId: 3,
        agentId: 99,
      },
    ]);
    dbMock.getTaskStatusNameById
      .mockResolvedValueOnce("PROGRESS")
      .mockResolvedValueOnce("DONE");
    dbMock.getAgentsByOwnerId.mockResolvedValue([
      {
        id: 7,
        ownerId: 152,
        name: "Agente principal",
        status: "online",
        connectionStatus: "connected",
        version: "1.0",
        lastHeartbeat: new Date("2026-11-14T12:00:00.000Z"),
        creditsRemaining: "80.00",
        creditsUpdatedAt: new Date(),
        manusToken: "MUST_NOT_LEAK",
      },
      {
        id: 8,
        ownerId: 152,
        name: "Agente filho",
        status: "offline",
        connectionStatus: "configured",
        creditsRemaining: "20.00",
        creditsUpdatedAt: null,
      },
      {
        id: 99,
        ownerId: 999,
        name: "Agente de outro proprietário",
        status: "online",
        manusToken: "FOREIGN_SECRET",
      },
    ]);
    invokeLLMMock
      .mockResolvedValueOnce({
        choices: [{
          message: {
            role: "assistant",
            content: null,
            tool_calls: [{
              id: "call-inspect-1",
              type: "function",
              function: { name: "inspect_current_mission", arguments: "{}" },
            }],
          },
        }],
      })
      .mockResolvedValueOnce({
        choices: [{ message: { role: "assistant", content: "A missão está em PROGRESS e possui uma filha concluída." } }],
      });

    const result = await appRouter.createCaller(context).messages.create({
      taskId: 19,
      typeId: 1,
      content: "Qual é o estado da missão e das subtarefas?",
    });

    expect(dbMock.getMissionRootTaskId).toHaveBeenCalledWith(19);
    expect(dbMock.getAgentsByOwnerId).toHaveBeenCalledWith(152, false);
    expect(invokeLLMMock).toHaveBeenCalledTimes(2);
    const followUpMessages = invokeLLMMock.mock.calls[1][0].messages;
    const toolContext = followUpMessages[followUpMessages.length - 1].content;
    expect(toolContext).toContain('"missionId":19');
    expect(toolContext).toContain('"taskId":20');
    expect(toolContext).not.toContain("Registro de outro proprietário");
    expect(toolContext).not.toContain("MUST_NOT_LEAK");
    expect(toolContext).not.toContain("FOREIGN_SECRET");
    expect(sendManusMessageAndWaitMock).not.toHaveBeenCalled();
    expect(result.responseStatus).toBe("replied");
    expect(result.reply).toMatchObject({
      content: "A missão está em PROGRESS e possui uma filha concluída.",
      isAssistant: true,
    });
  });

  it("bloqueia encaminhamento quando a missão não tem execução externa identificada", async () => {
    invokeLLMMock.mockResolvedValue({
      choices: [{
        message: {
          role: "assistant",
          content: null,
          tool_calls: [{
            id: "call-forward-2",
            type: "function",
            function: {
              name: "forward_operator_instruction_to_assigned_agent",
              arguments: JSON.stringify({ message: "Continue." }),
            },
          }],
        },
      }],
    });

    const result = await appRouter.createCaller(context).messages.create({
      taskId: 19,
      typeId: 1,
      content: "Encaminhe ao agente: continue.",
    });

    expect(sendManusMessageAndWaitMock).not.toHaveBeenCalled();
    expect(result.responseStatus).toBe("failed");
    expect(dbMock.createMessage).toHaveBeenNthCalledWith(2, expect.objectContaining({
      content: expect.stringContaining("não possui agente atribuído"),
      isAssistant: true,
    }));
  });

  it("recusa mensagem pai de outra missão antes de persistir ou chamar a IA", async () => {
    dbMock.getMessageByIdForTask.mockResolvedValue(null);

    await expect(appRouter.createCaller(context).messages.create({
      taskId: 19,
      parentMessageId: 999,
      typeId: 1,
      content: "não deve ser persistida",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });

    expect(dbMock.createMessage).not.toHaveBeenCalled();
    expect(invokeLLMMock).not.toHaveBeenCalled();
  });
});
