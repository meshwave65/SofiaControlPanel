export type TaskStartResult = {
  started?: boolean;
  factorized?: boolean;
  waitingForAgent?: boolean;
};

export type TaskStartFeedback = {
  kind: "success" | "waiting" | "unchanged";
  message: string;
};

export function getTaskStartFeedback(result?: TaskStartResult | null): TaskStartFeedback {
  if (result?.started) {
    return {
      kind: "success",
      message: result.factorized
        ? "Missão iniciada e fatorada em subtarefas."
        : "Missão iniciada.",
    };
  }

  if (result?.waitingForAgent) {
    return {
      kind: "waiting",
      message: "A missão continua em STAGED e aguarda um agente elegível; ainda não foi despachada.",
    };
  }

  return {
    kind: "unchanged",
    message: "A missão já não está em STAGED; nenhum reinício foi necessário.",
  };
}
