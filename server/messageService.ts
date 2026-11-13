import type { Message } from "./_core/llm";

export const OPERATOR_MESSAGE_MAX_LENGTH = 12_000;

type SofiaTask = {
  title: string;
  description?: string | null;
};

type StoredMessage = {
  content: string;
  isAssistant: boolean;
};

/** Normaliza o conteúdo antes da persistência e impede mensagens sem conteúdo útil. */
export function normalizeOperatorMessage(content: string) {
  const normalized = content.trim();
  if (!normalized) {
    throw new Error("A mensagem não pode ficar vazia.");
  }
  if (normalized.length > OPERATOR_MESSAGE_MAX_LENGTH) {
    throw new Error(`A mensagem excede o limite de ${OPERATOR_MESSAGE_MAX_LENGTH} caracteres.`);
  }
  return normalized;
}

/** Constrói uma conversa estável para a Sofia, preservando o limite operacional de contexto. */
export function buildSofiaConversation(task: SofiaTask, messages: StoredMessage[]): Message[] {
  const recentMessages = messages
    .filter((message) => message.content.trim())
    .slice(-30);

  return [
    {
      role: "system",
      content: `Você é Sofia, a IA operacional do SofiaControlPanel. Responda em português do Brasil, de forma objetiva e útil. A conversa pertence à missão "${task.title}". Descrição da missão: ${task.description || "não informada"}. Não alegue ter executado ações externas; diferencie claramente análise, proposta e ação efetivamente confirmada.`,
    },
    ...recentMessages.map((message) => ({
      role: message.isAssistant ? "assistant" as const : "user" as const,
      content: message.content,
    })),
  ];
}

/** Aceita resposta textual simples ou blocos de texto retornados pelo provedor LLM. */
export function extractTextContent(content: unknown) {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";

  return content
    .filter((part): part is { type?: string; text?: string } => typeof part === "object" && part !== null)
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text!.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}
