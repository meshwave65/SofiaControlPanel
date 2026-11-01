import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => ({
  getTaskById: vi.fn(),
  getTaskStatusIdByName: vi.fn(),
  getTasksByParentId: vi.fn(),
  updateTaskStatus: vi.fn(),
  claimStagedTask: vi.fn(),
  updateTaskExecution: vi.fn(),
  createTask: vi.fn(),
  getOrCreateActivityEventType: vi.fn(),
  createActivityLog: vi.fn(),
}));

const manusMock = vi.hoisted(() => ({
  createManusTask: vi.fn(),
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
  });

  it("atomically claims a staged task and creates one Manus execution", async () => {
    dbMock.getTaskById.mockResolvedValueOnce(stagedTask);
    dbMock.claimStagedTask.mockResolvedValueOnce(claimedTask);
    manusMock.createManusTask.mockResolvedValueOnce({ manusTaskId: "manus-123", status: "running" });

    const result = await SofiaOrchestrator.startTask(30);

    expect(dbMock.claimStagedTask).toHaveBeenCalledWith(30, 1, 2);
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
    dbMock.claimStagedTask.mockResolvedValueOnce(null);

    const result = await SofiaOrchestrator.startTask(30);

    expect(result).toMatchObject({ started: false, executionStarted: false });
    expect(manusMock.createManusTask).not.toHaveBeenCalled();
  });
});
