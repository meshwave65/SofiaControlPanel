import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => ({
  getTaskById: vi.fn(),
  getTaskStatusIdByName: vi.fn(),
  getTasksByParentId: vi.fn(),
  updateTaskStatus: vi.fn(),
  claimStagedTask: vi.fn(),
  claimStagedTaskWithAvailableAgent: vi.fn(),
  getAgentsByOwnerId: vi.fn(),
  recordAgentCreditSyncError: vi.fn(),
  updateTaskExecution: vi.fn(),
  createTask: vi.fn(),
  getOrCreateActivityEventType: vi.fn(),
  createActivityLog: vi.fn(),
}));

const manusMock = vi.hoisted(() => ({
  createManusTask: vi.fn(),
  syncAgentCredits: vi.fn(),
}));

vi.mock("./db", () => dbMock);
vi.mock("./manusExecutionService", () => manusMock);

import { SofiaOrchestrator } from "./sofiaOrchestrator";

describe("SofiaOrchestrator.processTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMock.getTaskStatusIdByName.mockImplementation(async (name: string) => {
      if (name === "STAGED") return 1;
      if (name === "PROGRESS") return 2;
      if (name === "FAIL") return 5;
      return 2;
    });
    dbMock.getTasksByParentId.mockResolvedValue([]);
    dbMock.updateTaskStatus.mockResolvedValue(undefined);
    dbMock.getOrCreateActivityEventType.mockResolvedValue({ id: 7 });
    dbMock.createActivityLog.mockResolvedValue(undefined);
  });

  it("moves a staged complex mission to progress after creating subtasks", async () => {
    const stagedTask = {
      id: 10,
      title: "Análise operacional completa",
      description: "Executar uma análise detalhada em várias etapas.",
      statusId: 1,
      priorityId: 1,
      createdBy: 5,
      agentId: 3,
    };
    const startedTask = { ...stagedTask, statusId: 2 };
    dbMock.getTaskById
      .mockResolvedValueOnce(stagedTask)
      .mockResolvedValueOnce(startedTask);
    dbMock.createTask
      .mockResolvedValueOnce([{ id: 11 }])
      .mockResolvedValueOnce([{ id: 12 }])
      .mockResolvedValueOnce([{ id: 13 }]);

    const result = await SofiaOrchestrator.processTask(10);

    expect(result).toEqual({
      task: startedTask,
      started: true,
      factorized: true,
      subtaskIds: [11, 12, 13],
    });
    expect(dbMock.updateTaskStatus).toHaveBeenCalledWith(10, 2);
    expect(dbMock.createTask).toHaveBeenCalledTimes(3);
  });

  it("does not restart a mission that is already in progress", async () => {
    const progressTask = {
      id: 20,
      title: "Tarefa já iniciada",
      description: "Executar.",
      statusId: 2,
      priorityId: 1,
      createdBy: 5,
      agentId: null,
    };
    dbMock.getTaskById.mockResolvedValueOnce(progressTask);

    const result = await SofiaOrchestrator.processTask(20);

    expect(result).toEqual({ task: progressTask, started: false, factorized: false, subtaskIds: [] });
    expect(dbMock.updateTaskStatus).not.toHaveBeenCalled();
    expect(dbMock.createTask).not.toHaveBeenCalled();
  });
});

describe("SofiaOrchestrator.startTask", () => {
  const stagedTask = {
    id: 30,
    title: "Missão de teste",
    description: "Executar uma verificação simples.",
    statusId: 1,
    priorityId: 1,
    createdBy: 5,
    agentId: 6,
    parentTaskId: null,
    manusTaskId: null,
  };
  const claimedTask = { ...stagedTask, statusId: 2 };

  beforeEach(() => {
    vi.clearAllMocks();
    dbMock.getTaskStatusIdByName.mockImplementation(async (name: string) => {
      if (name === "STAGED") return 1;
      if (name === "PROGRESS") return 2;
      if (name === "FAIL") return 5;
      return 2;
    });
    dbMock.getTasksByParentId.mockResolvedValue([]);
    dbMock.getOrCreateActivityEventType.mockResolvedValue({ id: 7 });
    dbMock.createActivityLog.mockResolvedValue(undefined);
    dbMock.updateTaskExecution.mockResolvedValue(undefined);
    dbMock.updateTaskStatus.mockResolvedValue(undefined);
    dbMock.getAgentsByOwnerId.mockResolvedValue([{ id: 6, hasCredential: true, status: "online", creditsUpdatedAt: new Date() }]);
    manusMock.syncAgentCredits.mockResolvedValue(100);
  });

  it("atomically claims a staged task and creates one Manus execution", async () => {
    dbMock.getTaskById.mockResolvedValueOnce(stagedTask);
    dbMock.claimStagedTaskWithAvailableAgent.mockResolvedValueOnce(claimedTask);
    manusMock.createManusTask.mockResolvedValueOnce({ manusTaskId: "manus-123", status: "running" });

    const result = await SofiaOrchestrator.startTask(30);

    expect(dbMock.claimStagedTaskWithAvailableAgent).toHaveBeenCalledWith(30, 1, 2);
    expect(manusMock.createManusTask).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      started: true,
      executionStarted: true,
      externalTaskIds: ["manus-123"],
    });
  });

  it("does not create a second execution when another dispatcher already claimed the task", async () => {
    dbMock.getTaskById
      .mockResolvedValueOnce(stagedTask)
      .mockResolvedValueOnce(claimedTask);
    dbMock.claimStagedTaskWithAvailableAgent.mockResolvedValueOnce(null);

    const result = await SofiaOrchestrator.startTask(30);

    expect(result).toMatchObject({ started: false, executionStarted: false });
    expect(manusMock.createManusTask).not.toHaveBeenCalled();
  });

  it("keeps the mission staged and records an explicit wait when no agent is eligible", async () => {
    dbMock.getTaskById
      .mockResolvedValueOnce(stagedTask)
      .mockResolvedValueOnce({ ...stagedTask, manusStatus: "waiting_for_available_agent" });
    dbMock.claimStagedTaskWithAvailableAgent.mockResolvedValueOnce(null);

    const result = await SofiaOrchestrator.startTask(30);

    expect(result).toMatchObject({
      started: false,
      executionStarted: false,
      waitingForAgent: true,
      task: { manusStatus: "waiting_for_available_agent" },
    });
    expect(dbMock.updateTaskExecution).toHaveBeenCalledWith(30, {
      manusStatus: "waiting_for_available_agent",
    });
    expect(manusMock.createManusTask).not.toHaveBeenCalled();
  });

  it("persists dispatch_failed/FAIL and an activity event when the external adapter errors", async () => {
    dbMock.getTaskById.mockResolvedValueOnce(stagedTask);
    dbMock.claimStagedTaskWithAvailableAgent.mockResolvedValueOnce(claimedTask);
    manusMock.createManusTask.mockRejectedValueOnce(new Error("fixture Manus timeout"));

    await expect(SofiaOrchestrator.startTask(30)).rejects.toThrow("fixture Manus timeout");

    expect(dbMock.updateTaskExecution).toHaveBeenCalledWith(30, expect.objectContaining({
      manusStatus: "dispatch_failed",
      completedAt: expect.any(Date),
    }));
    expect(dbMock.updateTaskStatus).toHaveBeenCalledWith(30, 5);
    expect(dbMock.createActivityLog).toHaveBeenCalledWith(expect.objectContaining({
      taskId: 30,
      details: "fixture Manus timeout",
    }));
  });
});

describe("SofiaOrchestrator.factorizeTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMock.getTasksByParentId.mockResolvedValue([]);
    dbMock.getTaskStatusIdByName.mockResolvedValue(1);
    dbMock.getOrCreateActivityEventType.mockResolvedValue({ id: 5 });
    dbMock.createActivityLog.mockResolvedValue(undefined);
  });

  it("factorizes an unassigned task and records activity with a null agent", async () => {
    dbMock.createTask
      .mockResolvedValueOnce([{ id: 81 }])
      .mockResolvedValueOnce([{ id: 82 }])
      .mockResolvedValueOnce([{ id: 83 }]);

    const ids = await SofiaOrchestrator.factorizeTask({
      id: 7,
      title: "PoUW-01",
      description: "Análise detalhada em múltiplas etapas.",
      createdBy: 152,
      agentId: null,
      agentPinned: false,
      priorityId: 1,
    });

    expect(ids).toEqual([81, 82, 83]);
    expect(dbMock.createActivityLog).toHaveBeenCalledTimes(3);
    expect(dbMock.createActivityLog).toHaveBeenCalledWith(expect.objectContaining({
      agentId: null,
      taskId: 7,
    }));
  });

  it("resumes a partial factorization without duplicating existing subtasks", async () => {
    dbMock.getTasksByParentId.mockResolvedValueOnce([
      { id: 8, title: "Análise Estrutural: PoUW-01" },
    ]);
    dbMock.createTask
      .mockResolvedValueOnce([{ id: 82 }])
      .mockResolvedValueOnce([{ id: 83 }]);

    const ids = await SofiaOrchestrator.factorizeTask({
      id: 7,
      title: "PoUW-01",
      description: "Análise detalhada em múltiplas etapas.",
      createdBy: 152,
      agentId: null,
      agentPinned: false,
      priorityId: 1,
    });

    expect(ids).toEqual([8, 82, 83]);
    expect(dbMock.createTask).toHaveBeenCalledTimes(2);
    expect(dbMock.createActivityLog).toHaveBeenCalledTimes(2);
  });
});


describe("SofiaOrchestrator factorization depth", () => {
  it("does not recursively factorize a task that already has a parent", async () => {
    const subtask = {
      id: 6,
      title: "Análise Estratégica: ASSUMIR MISSIONS MATEUS",
      description: "[ESTRATÉGICA] Análise detalhada em múltiplas etapas.",
      parentTaskId: 3,
    };

    expect(SofiaOrchestrator.shouldFactorize(subtask)).toBe(false);
    await expect(SofiaOrchestrator.factorizeTask(subtask)).rejects.toThrow(
      "Esta tarefa já é uma subtarefa. A fatoração deve ser feita na missão principal.",
    );
    expect(dbMock.createTask).not.toHaveBeenCalled();
  });
});
