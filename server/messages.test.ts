import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => ({
  getTaskById: vi.fn(),
  getMessageTypeById: vi.fn(),
  getMessageByIdForTask: vi.fn(),
  createMessage: vi.fn(),
  getMessagesByTaskId: vi.fn(),
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
