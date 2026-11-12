import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => ({
  getManusCredentialsForAgent: vi.fn(),
  updateTaskExecution: vi.fn(),
  getAllTasksGlobal: vi.fn(),
  updateAgentCredits: vi.fn(),
  getTaskStatusIdByName: vi.fn(),
  updateTaskStatus: vi.fn(),
}));

vi.mock("./db", () => dbMock);

import {
  createManusTask,
  syncRunningManusTasks,
} from "./manusExecutionService";

describe("manusExecutionService — fluxo controlado de execução", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMock.getManusCredentialsForAgent.mockResolvedValue({ manusToken: "fixture-token" });
    dbMock.updateTaskExecution.mockResolvedValue(undefined);
    dbMock.updateAgentCredits.mockResolvedValue(undefined);
    dbMock.updateTaskStatus.mockResolvedValue(undefined);
    dbMock.getTaskStatusIdByName.mockImplementation(async (name: string) => {
      if (name === "DONE") return 3;
      if (name === "PAUSED") return 4;
      if (name === "FAIL") return 5;
      return 2;
    });
    vi.stubGlobal("fetch", vi.fn());
  });

  it("cria execução Manus mockada e persiste o ID/status local", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, task_id: "fixture-manus-1" }), { status: 200 }));

    const result = await createManusTask({
      id: 101,
      agentId: 7,
      title: "Missão fixture",
      description: "Executar somente em ambiente controlado.",
    } as any);

    expect(result).toEqual({ manusTaskId: "fixture-manus-1", status: "running" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.manus.ai/v2/task.create",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-manus-api-key": "fixture-token" }),
      }),
    );
    expect(dbMock.updateTaskExecution).toHaveBeenCalledWith(101, {
      manusTaskId: "fixture-manus-1",
      manusStatus: "running",
    });
  });

  it("converte stopped em DONE após polling e reconcilia créditos", async () => {
    dbMock.getAllTasksGlobal.mockResolvedValue([{
      id: 101,
      agentId: 7,
      manusTaskId: "fixture-manus-1",
      manusStatus: "running",
    }]);
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, task: { status: "stopped", credit_usage: 12 } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, data: { total_credits: 88 } }), { status: 200 }));

    const result = await syncRunningManusTasks();

    expect(result).toEqual([{ taskId: 101, manusStatus: "stopped", creditsUsed: 12 }]);
    expect(dbMock.updateAgentCredits).toHaveBeenCalledWith(7, 88);
    expect(dbMock.updateTaskExecution).toHaveBeenCalledWith(101, expect.objectContaining({
      manusStatus: "stopped",
      creditsUsed: 12,
      completedAt: expect.any(Date),
    }));
    expect(dbMock.updateTaskStatus).toHaveBeenCalledWith(101, 3);
  });

  it("converte stopped sem créditos em waiting_credit/PAUSED, sem concluir a missão", async () => {
    dbMock.getAllTasksGlobal.mockResolvedValue([{
      id: 102,
      agentId: 7,
      manusTaskId: "fixture-manus-2",
      manusStatus: "running",
    }]);
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, task: { status: "stopped", credit_usage: 20 } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, data: { total_credits: 0 } }), { status: 200 }));

    const result = await syncRunningManusTasks();

    expect(result).toEqual([{ taskId: 102, manusStatus: "waiting_credit", creditsUsed: 20 }]);
    expect(dbMock.updateTaskExecution).toHaveBeenCalledWith(102, expect.objectContaining({
      manusStatus: "waiting_credit",
      creditsUsed: 20,
      completedAt: null,
    }));
    expect(dbMock.updateTaskStatus).toHaveBeenCalledWith(102, 4);
  });

  it("não fabrica execução quando a resposta mockada não contém task_id", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, task: {} }), { status: 200 }));

    await expect(createManusTask({ id: 103, agentId: 7, title: "Sem ID" } as any))
      .rejects.toThrow("A API Manus não retornou task_id.");
    expect(dbMock.updateTaskExecution).not.toHaveBeenCalled();
  });
});
