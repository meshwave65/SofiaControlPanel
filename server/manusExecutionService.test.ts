import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => ({
  getManusCredentialsForAgent: vi.fn(),
  updateAgentCredits: vi.fn(),
  getAllAgentsGlobal: vi.fn(),
  getAllTasksGlobal: vi.fn(),
  getTaskStatusIdByName: vi.fn(),
  updateTaskExecution: vi.fn(),
  updateTaskStatus: vi.fn(),
}));

vi.mock("./db", () => dbMock);

import {
  syncAllAgentCredits,
  syncAgentCredits,
  syncRunningManusTasks,
} from "./manusExecutionService";

function jsonResponse(payload: unknown, status = 200, ok = true) {
  return {
    ok,
    status,
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

    await expect(syncAgentCredits(6)).rejects.toMatchObject({
      code: "response_invalid",
      message: "response_invalid",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(dbMock.updateAgentCredits).not.toHaveBeenCalled();
  });

  it("returns and logs only a stable error code when the provider error contains arbitrary text", async () => {
    const sensitiveProviderText = "provider payload must never be logged: secret-value";
    dbMock.getAllAgentsGlobal.mockResolvedValue([{ id: 6 }]);
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      ok: false,
      error: { message: sensitiveProviderText },
    }, 403, false));
    vi.stubGlobal("fetch", fetchMock);
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);

    try {
      await expect(syncAllAgentCredits()).resolves.toEqual([
        { agentId: 6, ok: false, error: "request_failed" },
      ]);
      expect(errorLog).toHaveBeenCalledTimes(1);
      expect(String(errorLog.mock.calls[0][0])).not.toContain(sensitiveProviderText);
      expect(String(errorLog.mock.calls[0][0])).toContain("manus_credit_sync_failed");
      expect(String(errorLog.mock.calls[0][0])).toContain('"httpStatus":403');
    } finally {
      errorLog.mockRestore();
    }
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
