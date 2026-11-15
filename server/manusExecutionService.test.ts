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
  findNewAssistantReply,
  stopManusTask,
  syncAgentCredits,
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


  it("lê total_credits no nível superior da resposta atual da Manus", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      ok: true,
      total_credits: 137,
      max_refresh_credits: 100,
      refresh_credits: 20,
      refresh_interval: 3600,
      request_id: "fixture-request",
    }), { status: 200 }));

    await expect(syncAgentCredits(7)).resolves.toBe(137);
    expect(dbMock.updateAgentCredits).toHaveBeenCalledWith(7, 137);
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

  it("só confirma pausa após task.stop e task.detail reportarem stopped sem jobs em background", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, task: { status: "running" } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, request_id: "stop-1" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ok: true,
        task: { status: "stopped", has_running_background_jobs: false },
      }), { status: 200 }));

    const result = await stopManusTask({
      id: 110,
      agentId: 7,
      manusTaskId: "fixture-manus-pause",
    } as any);

    expect(result).toEqual({ status: "stopped", hasRunningBackgroundJobs: false });
    expect(fetch).toHaveBeenNthCalledWith(2,
      "https://api.manus.ai/v2/task.stop",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ task_id: "fixture-manus-pause" }),
      }),
    );
  });

  it("não considera pausada uma tarefa stopped com jobs em background ativos", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, task: { status: "running" } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ok: true,
        task: { status: "stopped", has_running_background_jobs: true },
      }), { status: 200 }));

    await expect(stopManusTask({
      id: 111,
      agentId: 7,
      manusTaskId: "fixture-manus-background",
    } as any)).resolves.toEqual({ status: "stopped", hasRunningBackgroundJobs: true });
  });

  it("mantém manual_pause_pending enquanto a Manus reportar jobs em background", async () => {
    dbMock.getAllTasksGlobal.mockResolvedValue([{
      id: 112,
      agentId: 7,
      manusTaskId: "fixture-manus-pending",
      manusStatus: "manual_pause_pending",
    }]);
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      ok: true,
      task: { status: "stopped", has_running_background_jobs: true },
    }), { status: 200 }));

    const result = await syncRunningManusTasks();

    expect(result).toEqual([{ taskId: 112, manusStatus: "manual_pause_pending", creditsUsed: null }]);
    expect(dbMock.updateTaskExecution).toHaveBeenCalledWith(112, expect.objectContaining({
      manusStatus: "manual_pause_pending",
      completedAt: null,
    }));
    expect(dbMock.updateTaskStatus).not.toHaveBeenCalled();
  });

  it("finaliza manual_pause_pending como PAUSED quando não há jobs em background", async () => {
    dbMock.getAllTasksGlobal.mockResolvedValue([{
      id: 113,
      agentId: 7,
      manusTaskId: "fixture-manus-paused",
      manusStatus: "manual_pause_pending",
    }]);
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      ok: true,
      task: { status: "stopped", has_running_background_jobs: false },
    }), { status: 200 }));

    const result = await syncRunningManusTasks();

    expect(result).toEqual([{ taskId: 113, manusStatus: "stopped", creditsUsed: null }]);
    expect(dbMock.updateTaskStatus).toHaveBeenCalledWith(113, 4);
    expect(dbMock.updateTaskExecution).toHaveBeenCalledWith(113, expect.objectContaining({
      manusStatus: "stopped",
      completedAt: null,
    }));
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

  it("não trata resposta assistant antiga como retorno novo sem ID", () => {
    const before = [
      { type: "assistant_message", assistant_message: { content: "resposta anterior" } },
    ];
    const after = [
      { type: "assistant_message", assistant_message: { content: "resposta nova" } },
      ...before,
    ];
    expect(findNewAssistantReply(before, after)).toBe("resposta nova");
  });
});
