import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => ({
  getTaskById: vi.fn(),
  getTaskStatusIdByName: vi.fn(),
  getTasksByParentId: vi.fn(),
  updateTaskStatus: vi.fn(),
  createTask: vi.fn(),
  getOrCreateActivityEventType: vi.fn(),
  createActivityLog: vi.fn(),
}));

vi.mock("./db", () => dbMock);

import { SofiaOrchestrator } from "./sofiaOrchestrator";

describe("SofiaOrchestrator.processTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMock.getTaskStatusIdByName.mockImplementation(async (name: string) => name === "STAGED" ? 1 : 2);
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
