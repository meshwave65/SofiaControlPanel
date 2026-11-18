import { describe, expect, it } from "vitest";
import { getTaskStartFeedback } from "./taskStartFeedback";

describe("getTaskStartFeedback", () => {
  it("confirma quando a missão inicia", () => {
    expect(getTaskStartFeedback({ started: true })).toEqual({
      kind: "success",
      message: "Missão iniciada.",
    });
  });

  it("confirma quando a missão é iniciada e fatorada", () => {
    expect(getTaskStartFeedback({ started: true, factorized: true })).toEqual({
      kind: "success",
      message: "Missão iniciada e fatorada em subtarefas.",
    });
  });

  it("explica que a missão continua STAGED quando aguarda agente elegível", () => {
    expect(getTaskStartFeedback({ started: false, waitingForAgent: true })).toEqual({
      kind: "waiting",
      message: "A missão continua em STAGED e aguarda um agente elegível; ainda não foi despachada.",
    });
  });

  it("mantém o feedback de não reinício para estados não aguardando", () => {
    expect(getTaskStartFeedback({ started: false, waitingForAgent: false })).toEqual({
      kind: "unchanged",
      message: "A missão já não está em STAGED; nenhum reinício foi necessário.",
    });
  });
});
