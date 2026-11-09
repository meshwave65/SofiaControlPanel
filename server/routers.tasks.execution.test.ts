import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => ({
  getTaskById: vi.fn(),
  getManusCredentialsForAgent: vi.fn(),
  getTaskStatusIdByName: vi.fn(),
  getTasksByParentId: vi.fn(),
  updateTaskStatus: vi.fn(),
  claimStagedTaskWithAvailableAgent: vi.fn(),
  getAgentsByOwnerId: vi.fn(),
  recordAgentCreditSyncError: vi.fn(),
  updateAgentCredits: vi.fn(),
  updateTaskExecution: vi.fn(),
}));

vi.mock("./db", () => dbMock);
vi.mock("./controlPanelStorage", () => ({
  getConsolidatedTaskReport: vi.fn(),
  uploadConsolidatedTaskReport: vi.fn(),
}));

import { appRouter } from "./routers";

const stagedTask = {
  id: 30,
  title: "Missão de teste",
  description: "Verificar a fronteira de claim com mocks.",
  statusId: 1,
  priorityId: 1,
  createdBy: 5,
  agentId: null,
  agentPinned: false,
  parentTaskId: null,
  manusTaskId: null,
};

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    json: async () => payload,
  };
}

describe("tRPC tasks.start execution path", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMock.getTaskById.mockResolvedValue(stagedTask);
    dbMock.getManusCredentialsForAgent.mockResolvedValue({
      manusToken: "fixture-only-token",
    });
    dbMock.getTaskStatusIdByName.mockImplementation(async (name: string) => {
      if (name === "STAGED") return 1;
      if (name === "PROGRESS") return 2;
      if (name === "FAIL") return 5;
      return null;
    });
    dbMock.getAgentsByOwnerId.mockResolvedValue([
      {
        id: 6,
        hasCredential: true,
        status: "online",
        creditsUpdatedAt: new Date(Date.now() - 120_000),
      },
    ]);
    dbMock.recordAgentCreditSyncError.mockResolvedValue(undefined);
    dbMock.updateAgentCredits.mockResolvedValue(undefined);
    dbMock.updateTaskExecution.mockResolvedValue(undefined);
    dbMock.claimStagedTaskWithAvailableAgent.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a waiting state and never dispatches externally when no fresh credit balance is available", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ ok: true, data: {} }));
    vi.stubGlobal("fetch", fetchMock);
    const caller = appRouter.createCaller({
      user: { id: 5, role: "user" },
    } as any);

    const result = await caller.tasks.start({ taskId: 30 });

    expect(result).toMatchObject({
      started: false,
      executionStarted: false,
      waitingForAgent: true,
      task: { id: 30, statusId: 1 },
    });
    expect(dbMock.recordAgentCreditSyncError).toHaveBeenCalledWith(
      6,
      "A API Manus não retornou total_credits válido."
    );
    expect(dbMock.claimStagedTaskWithAvailableAgent).toHaveBeenCalledWith(
      30,
      1,
      2
    );
    expect(dbMock.updateTaskExecution).toHaveBeenCalledWith(30, {
      manusStatus: "waiting_for_available_agent",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/usage.availableCredits"
    );
    expect(dbMock.updateAgentCredits).not.toHaveBeenCalled();
  });
});
