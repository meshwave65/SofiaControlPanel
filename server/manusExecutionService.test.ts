import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => ({
  getManusCredentialsForAgent: vi.fn(),
  updateAgentCredits: vi.fn(),
  getAllTasksGlobal: vi.fn(),
  getTaskStatusIdByName: vi.fn(),
  updateTaskExecution: vi.fn(),
  updateTaskStatus: vi.fn(),
}));

vi.mock("./db", () => dbMock);

import {
  syncAgentCredits,
  syncRunningManusTasks,
} from "./manusExecutionService";

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    json: async () => payload,
  };
}

describe("Manus execution service contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMock.getManusCredentialsForAgent.mockResolvedValue({
      manusToken: "fixture-only-token",
    });
    dbMock.updateAgentCredits.mockResolvedValue(undefined);
    dbMock.getTaskStatusIdByName.mockImplementation(async (name: string) =>
      name === "DONE" ? 4 : null
    );
    dbMock.updateTaskExecution.mockResolvedValue(undefined);
    dbMock.updateTaskStatus.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects a successful credits response that lacks numeric data.total_credits", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ ok: true, data: {} }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(syncAgentCredits(6)).rejects.toThrow(
      "A API Manus não retornou total_credits válido."
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(dbMock.updateAgentCredits).not.toHaveBeenCalled();
  });

  it("polls a stopped Manus task and persists the completed state without external access", async () => {
    dbMock.getAllTasksGlobal.mockResolvedValue([
      {
        id: 91,
        agentId: 6,
        manusTaskId: "fixture-task-id",
        manusStatus: "running",
      },
    ]);
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/task.detail?")) {
        return jsonResponse({
          ok: true,
          task: { status: "stopped", credit_usage: 3 },
        });
      }
      if (url.endsWith("/usage.availableCredits")) {
        return jsonResponse({ ok: true, data: { total_credits: 12 } });
      }
      throw new Error("Unexpected mocked URL");
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncRunningManusTasks();

    expect(result).toEqual([
      { taskId: 91, manusStatus: "stopped", creditsUsed: 3 },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(dbMock.updateAgentCredits).toHaveBeenCalledWith(6, 12);
    expect(dbMock.updateTaskExecution).toHaveBeenCalledWith(
      91,
      expect.objectContaining({
        manusStatus: "stopped",
        creditsUsed: 3,
        completedAt: expect.any(Date),
      })
    );
    expect(dbMock.updateTaskStatus).toHaveBeenCalledWith(91, 4);
  });
});
