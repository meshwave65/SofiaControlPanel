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
      name: "inspect_current_mission",
      description: "Consulta somente leitura o estado atual da missão aberta no Messenger, incluindo missão raiz, tarefas-filhas, agentes já atribuídos, identificadores de execução externa e snapshot de créditos. Não altera nenhum estado. Use para perguntas sobre progresso, dependências, atribuição ou situação operacional. Não declara elegibilidade para nova atribuição.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "inspect_agent_eligibility",
      description: "Consulta somente leitura os agentes do proprietário da missão e avalia cada um com os mesmos critérios do claim transacional atual: tarefa STAGED, pinagem humana, status online, conexão configured/connected, credencial presente, créditos positivos com snapshot dos últimos 60 segundos e ausência de outra tarefa PROGRESS. Não reserva agente, não altera tarefa e não garante que o estado continue igual no momento de um claim posterior.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "forward_operator_instruction_to_assigned_agent",
      description: "Encaminha uma instrução explícita do operador ao executor externo que está trabalhando na etapa relevante da missão. O servidor resolve a execução ativa; se houver mais de uma, não escolha arbitrariamente. Use somente quando o operador pedir claramente para enviar/encaminhar uma instrução. Nunca use para perguntas, análises, pedidos de status ou solicitações de transferência.",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", minLength: 1, maxLength: 12000 },
          taskId: {
            type: "integer",
            description: "ID da tarefa executora ativa, somente quando o histórico da conversa já identificou qual etapa deve receber a instrução. Deve pertencer à missão aberta.",
          },
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
      content: `Você é Sofia, a camada cognitiva e interlocutora do operador no SofiaControlPanel (SCP). O SCP é o Sistema de Orquestração Federada de Inteligências Artificiais: as missões pertencem ao sistema, enquanto agentes externos são executores temporários. Responda em português do Brasil, de forma objetiva, contextual e útil. Esta conversa pertence à missão local #${task.id ?? "desconhecida"}: "${task.title}". Descrição: ${task.description || "não informada"}. Estado local (statusId): ${task.statusId ?? "não informado"}. Agente atualmente atribuído (Agent ID): ${task.agentId ?? "nenhum"}. Pinagem humana: ${task.agentPinned ? "sim" : "não"}. Execução externa (Agent Task ID): ${task.manusTaskId || "não criada"}. Estado externo: ${task.manusStatus || "não informado"}. Você é responsável por compreender o operador e mediar a comunicação. Só use a ferramenta de encaminhamento quando o operador pedir explicitamente que uma instrução seja enviada ao executor da etapa relevante. O servidor resolve a execução ativa; se houver mais de uma, use o taskId somente quando o histórico identificar inequivocamente a tarefa de destino, sem adivinhar. Para perguntas sobre estado, progresso, dependências ou agentes atribuídos, consulte inspect_current_mission antes de responder. Para perguntas sobre disponibilidade ou elegibilidade de agentes para uma tarefa, consulte inspect_agent_eligibility antes de responder; nunca conclua elegibilidade apenas pelo status online. Perguntas, pedidos de análise, explicações ou solicitações de mudança de agente não autorizam encaminhamento. Não altere nem alegue alterar atribuição, status, prioridade ou execução; para essas ações, explique que a decisão precisa passar pelos controles do SCP. Nunca confunda mensagem registrada, envio aceito, recebimento/processamento externo e resposta. Não alegue ter executado ações externas sem confirmação observável.`,
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
