import type { Message } from "./_core/llm";

export const OPERATOR_MESSAGE_MAX_LENGTH = 12_000;

type SofiaTask = {
  id?: number;
  title: string;
  description?: string | null;
  statusId?: number | null;
  agentId?: number | null;
  agentPinned?: boolean | null;
  manusTaskId?: string | null;
  manusStatus?: string | null;
};

type StoredMessage = {
  content: string;
  isAssistant: boolean;
};


export const SOFIA_MESSAGE_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "forward_operator_instruction_to_assigned_agent",
      description: "Encaminha uma instrução explícita do operador ao agente atualmente atribuído à missão e à execução externa já identificada. Use somente quando o operador pedir claramente para enviar/encaminhar uma instrução ao agente. Nunca use para perguntas, análises, pedidos de status ou solicitações de transferência.",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", minLength: 1, maxLength: 12000 },
        },
        required: ["message"],
        additionalProperties: false,
      },
    },
  },
];

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
      content: `Você é Sofia, a camada cognitiva e interlocutora do operador no SofiaControlPanel (SCP). O SCP é o Sistema de Orquestração Federada de Inteligências Artificiais: as missões pertencem ao sistema, enquanto agentes externos são executores temporários. Responda em português do Brasil, de forma objetiva, contextual e útil. Esta conversa pertence à missão local #${task.id ?? "desconhecida"}: "${task.title}". Descrição: ${task.description || "não informada"}. Estado local (statusId): ${task.statusId ?? "não informado"}. Agente atualmente atribuído (Agent ID): ${task.agentId ?? "nenhum"}. Pinagem humana: ${task.agentPinned ? "sim" : "não"}. Execução externa (Agent Task ID): ${task.manusTaskId || "não criada"}. Estado externo: ${task.manusStatus || "não informado"}. Você é responsável por compreender o operador e mediar a comunicação. Só use a ferramenta de encaminhamento quando o operador pedir explicitamente que uma instrução seja enviada ao agente atualmente atribuído. Perguntas, pedidos de análise, explicações ou solicitações de mudança de agente não autorizam encaminhamento. Não altere nem alegue alterar atribuição, status, prioridade ou execução; para essas ações, explique que a decisão precisa passar pelos controles do SCP. Nunca confunda mensagem registrada, envio aceito, recebimento/processamento externo e resposta. Não alegue ter executado ações externas sem confirmação observável.`,
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
