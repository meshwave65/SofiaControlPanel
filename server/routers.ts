import { createHash } from "node:crypto";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { SofiaOrchestrator } from "./sofiaOrchestrator";
import { TRPCError } from "@trpc/server";
import { getConsolidatedTaskReport, uploadConsolidatedTaskReport } from "./controlPanelStorage";
import { resumeManusTask, sendManusMessageAndWait, stopManusTask, syncAgentCredits } from "./manusExecutionService";
import { mirrorTaskToGitHub } from "./githubMissionMirror";
import { invokeLLM } from "./_core/llm";
import { buildSofiaConversation, buildSofiaGeneralConversation, extractTextContent, normalizeOperatorMessage, OPERATOR_MESSAGE_MAX_LENGTH, SOFIA_MESSAGE_TOOLS, SOFIA_GENERAL_MESSAGE_TOOLS } from "./messageService";
import { validateMissionBlueprintContent } from "./missionBlueprint";
import { validateActionPlan, ActionPlanSchema } from "./actionPlan";
import { evaluateExecutionGate } from "./executionGovernance";
import { refreshActionUnitDependencyEvidence } from "./actionUnitGateEvidence";
import { ENV } from "./_core/env";
import { closeSandboxSession } from "./sandboxSession";

async function generateInitialMissionTR(title: string, description?: string | null): Promise<string> {
  const response = await invokeLLM({
    messages: [
      { role: "system", content: [
        "Você é SOFIA, responsável por compreender missões.",
        "Produza a primeira versão de um TR em português, legível e conciso.",
        "É uma interpretação inicial, não um relatório de execução: nenhum trabalho foi realizado ainda.",
        "Não invente motivação, decisões, fatos, resultados, prazos, recursos ou critérios ausentes.",
        "Separe declaração original, fatos documentados, interpretação da SOFIA, hipóteses e informações desconhecidas.",
        "Quando a motivação não estiver expressa, declare que não foi informada; não a deduza como fato.",
        "Inclua origem humana, objetivo compreendido, escopo conhecido, lacunas, critérios apenas se informados e próximos passos propostos.",
        "A validação humana ainda não ocorreu."
      ].join("\n") },
      { role: "user", content: "Título da missão: " + title + "\n\nDescrição original:\n" + (description?.trim() || "Não foi fornecida descrição adicional.") }
    ],
    maxTokens: 5000,
  });
  const content = extractTextContent(response.choices?.[0]?.message?.content);
  if (!content.trim()) throw new Error("A SOFIA não retornou conteúdo para o TR inicial.");
  return content.trim();
}


async function createMissionFromGeneralMessage(input: {
  content: string;
  operator: { id: number; name?: string | null; email?: string | null };
}) {
  const lines = input.content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const firstLine = lines[0] ?? input.content.trim();
  const strippedFirstLine = firstLine.replace(/^(?:criar\s+miss[aã]o|t[ií]tulo|miss[aã]o)\s*[:\-]\s*/i, "").trim();
  const titleCandidate = strippedFirstLine && !/^(?:criar\s+miss[aã]o|nova\s+miss[aã]o)$/i.test(strippedFirstLine)
    ? strippedFirstLine
    : (lines[1] ?? input.content.trim().split(/[.!?]\s/)[0]);
  const title = (titleCandidate || "Nova missão").slice(0, 255);
  const description = input.content.trim();

  const documentTypes = await db.getMissionDocumentTypes();
  const activeTypeKeys = new Set(documentTypes.map((documentType) => documentType.typeKey));
  const missingRequiredTypes = ["ORIGINAL_REQUEST", "TR", "BLUEPRINT"].filter((typeKey) => !activeTypeKeys.has(typeKey));
  if (missingRequiredTypes.length > 0) {
    throw new Error("Tipos documentais obrigatórios inativos ou ausentes: " + missingRequiredTypes.join(", "));
  }

  const pausedStatusId = await db.getTaskStatusIdByName("PAUSED");
  const lookups = await db.getLookups();
  const defaultPriority = lookups.priorities.find((priority) => priority.name.toLowerCase() === "baixa")
    ?? [...lookups.priorities].sort((a, b) => a.level - b.level)[0];
  if (!defaultPriority) throw new Error("Nenhuma prioridade está configurada para a nova missão.");

  let trGenerationError: string | null = null;
  let trContent: string;
  let trState = "AWAITING_HUMAN_VALIDATION";
  try {
    trContent = await generateInitialMissionTR(title, description);
  } catch (error) {
    trGenerationError = error instanceof Error ? error.message : "Falha ao gerar o TR inicial.";
    trState = "DRAFT";
    trContent = [
      "# TR inicial — " + title, "",
      "**Estado:** DRAFT — geração cognitiva pendente; validação indisponível.",
      "**Origem:** solicitação humana registrada no documento Solicitação original.", "",
      "## Informações disponíveis",
      "- Título declarado: " + title,
      "- Descrição declarada: " + description, "",
      "## Limite de conhecimento",
      "A interpretação da SOFIA não foi concluída. Nenhuma motivação, decisão, escopo adicional ou resultado foi presumido."
    ].join("\n");
  }

  const originalContent = [
    "# Solicitação original — " + title, "",
    "**Origem:** operador humano (usuário #" + input.operator.id + ")",
    "**Registrada em:** " + new Date().toISOString(), "",
    "## Descrição original", description
  ].join("\n");

  let created: Awaited<ReturnType<typeof db.createMissionWithInitialDocuments>>;
  try {
    created = await db.createMissionWithInitialDocuments({
      task: {
        createdBy: input.operator.id,
        title,
        description,
        statusId: pausedStatusId,
        priorityId: defaultPriority.id,
        manusStatus: "awaiting_tr_validation",
      },
      originalRequest: {
        content: originalContent,
        state: "PUBLISHED",
        authorType: "HUMAN",
        authorUserId: input.operator.id,
        provenance: { origin: "HUMAN", source: "messages.createGeneral", originalMessageType: "CreateTask" },
        changeSummary: "Solicitação original preservada a partir da conversa geral",
      },
      tr: {
        content: trContent,
        state: trState,
        authorType: "SOFIA",
        provenance: { origin: "HUMAN", source: "messages.createGeneral", originalMessageType: "CreateTask" },
        changeSummary: "Primeira compreensão da missão pela SOFIA; aguardando validação humana",
        publishedAt: trState === "AWAITING_HUMAN_VALIDATION" ? new Date() : null,
      },
    });
  } catch (error) {
    console.error("[Messages] Atomic mission/document creation failed:", error);
    throw new Error("A missão e seus documentos iniciais não puderam ser persistidos. Nenhuma missão parcial foi criada.");
  }

  try {
    const mirror = await mirrorTaskToGitHub({
      ...created,
      createdBy: input.operator.id,
      creatorType: "user",
      creatorName: input.operator.name ?? null,
      creatorEmail: input.operator.email ?? null,
    });
    await db.updateTaskGitHubSync(created.id, {
      missionKey: mirror.missionKey,
      githubPath: mirror.path,
      githubSha: mirror.sha,
      githubSyncStatus: mirror.status,
      githubSyncError: mirror.error ?? null,
    });
    return {
      ...created,
      missionKey: mirror.missionKey,
      githubPath: mirror.path,
      githubSyncStatus: mirror.status,
      trState,
      trGenerationError,
      priorityName: defaultPriority.name,
    };
  } catch (error) {
    console.error("[Messages] Mission created but GitHub mirror failed:", error);
    return {
      ...created,
      trState,
      trGenerationError,
      githubSyncStatus: "pending",
      githubSyncError: error instanceof Error ? error.message : "Falha na sincronização com GitHub.",
      priorityName: defaultPriority.name,
    };
  }
}

async function generateLegacyMissionTR(input: {
  title: string;
  description: string | null;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  completedAt: Date | string | null;
  hasExternalExecution: boolean;
}): Promise<string> {
  const response = await invokeLLM({
    messages: [
      { role: "system", content: [
        "Você é SOFIA e está reconstruindo o TR de uma missão legada que foi criada antes do catálogo documental.",
        "Identifique explicitamente o documento como RECONSTRUÇÃO HISTÓRICA, não como registro contemporâneo original.",
        "Use somente os campos e fatos fornecidos. Não invente motivação, decisões, etapas, resultados, evidências, prazos ou aprovações.",
        "Se a motivação original não estiver registrada na descrição, escreva: 'A motivação original não foi localizada nos registros disponíveis para esta reconstrução.'",
        "Separe: solicitação preservada; fatos verificáveis nos campos da tarefa; interpretação atual da SOFIA; hipóteses; lacunas; estado técnico atual.",
        "O status técnico não comprova entregas. Não descreva resultados como realizados sem evidência explícita.",
        "Não afirme que houve validação humana do TR. Aponte que esta reconstrução precisa ser revisada pelo operador quando a missão ainda não tiver execução externa.",
        "Escreva em português, com títulos claros e concisão operacional."
      ].join("\n") },
      { role: "user", content: "Dados persistidos da missão legada:\n" + JSON.stringify(input, null, 2) }
    ],
    maxTokens: 5000,
  });
  const generated = extractTextContent(response.choices?.[0]?.message?.content);
  if (!generated.trim()) throw new Error("A SOFIA não retornou conteúdo para a reconstrução do TR.");
  return [
    "# TR — Reconstrução histórica — " + input.title,
    "",
    "**Natureza do documento:** reconstrução posterior a partir dos registros disponíveis; não é um registro original contemporâneo.",
    "",
    generated.trim(),
  ].join("\n");
}

async function generateFinalMissionFOR(input: {
  task: Record<string, unknown>;
  childTasks: Array<Record<string, unknown>>;
  documents: Array<Record<string, unknown>>;
  messages: Array<Record<string, unknown>>;
  consolidatedReport: string | null;
}): Promise<string> {
  const response = await invokeLLM({
    messages: [
      { role: "system", content: [
        "Você é SOFIA e deve produzir o FOR — Relatório Operacional Final da missão.",
        "O FOR consolida o aprendizado operacional no encerramento; não é um TR nem um log bruto.",
        "Use exclusivamente as evidências fornecidas. Nunca transforme objetivo, plano, tentativa ou status DONE em prova de entrega.",
        "Separe resultados comprovados, ações tentadas, falhas/bloqueios, decisões registradas, pendências e informações não localizadas.",
        "Quando não houver evidência suficiente, declare explicitamente que o resultado não foi comprovado nos registros consultados.",
        "Identifique a origem documental e as versões usadas. Não atribua ao operador declarações que não constem nas mensagens ou solicitação original.",
        "Não invente métricas, economia, desempenho, autoria, datas ou causas.",
        "Escreva em português, com resumo executivo, objetivo, execução observada, resultados com evidências, desvios e falhas, pendências, lições aprendidas e fontes consultadas."
      ].join("\n") },
      { role: "user", content: "Registros disponíveis para consolidação do FOR:\n" + JSON.stringify(input, null, 2).slice(0, 50000) }
    ],
    maxTokens: 7000,
  });
  const generated = extractTextContent(response.choices?.[0]?.message?.content);
  if (!generated.trim()) throw new Error("A SOFIA não retornou conteúdo para o FOR.");
  return generated.trim();
}

async function generateInitialMissionBlueprint(title: string, trVersion: number, trContent: string): Promise<string> {
  const response = await invokeLLM({
    messages: [
      { role: "system", content: [
        "Você é SOFIA e deve transformar o TR validado em um Blueprint operacional.",
        "O Blueprint é prescritivo e destinado aos executores; não reescreva o TR como narrativa.",
        "Não amplie objetivo, escopo, entregáveis, permissões, orçamento, recursos ou prazos além do que está explícito no TR.",
        "Não invente credenciais, ferramentas autorizadas, agentes, custos, limites ou dependências.",
        "Quando faltar informação necessária, marque como BLOQUEIO/PENDÊNCIA e não presuma autorização.",
        "Inclua exatamente estes títulos de seção: Objetivo operacional; Escopo executável; Exclusões e premissas; Etapas e unidades de trabalho; Dependências e paralelismo; Perfil/capacidade do executor; Entradas e contexto autorizado; Restrições e riscos; Critérios objetivos de aceite; Evidências exigidas; Validação e consolidação; Contingência; Bloqueios e gates pendentes.",
        "Cada unidade de trabalho deve ter resultado esperado, pré-condições, entradas, passos, dependências, critério de aceite e evidência.",
        "Se o TR não permite decomposição segura, explique os bloqueios e não invente tarefas.",
        "Na seção Bloqueios e gates pendentes, escreva em uma linha isolada, sem bullet nem negrito, exatamente 'BLOQUEIOS NÃO RESOLVIDOS: NENHUM' somente se não houver bloqueio de escopo; caso contrário, enumere cada bloqueio explicitamente.",
        "READY significa somente que a estrutura do plano foi gerada e vinculada; não dispensa verificações de risco, orçamento, credenciais ou elegibilidade do executor."
      ].join("\n") },
      { role: "user", content: "Missão: " + title + "\nVersão do TR de origem: " + trVersion + "\n\nTR validado:\n" + trContent }
    ],
    maxTokens: 7000,
  });
  const content = extractTextContent(response.choices?.[0]?.message?.content);
  return validateMissionBlueprintContent(content);
}

async function persistMissionBlueprint(input: {
  taskId: number;
  ownerId: number;
  canViewAll: boolean;
  title: string;
  trVersionId: number;
  trVersionNumber: number;
  trContent: string;
}) {
  const documents = await db.getMissionDocumentsForTask(input.taskId, input.ownerId, input.canViewAll);
  const existing = documents.find((document) => document.typeKey === "BLUEPRINT" && document.documentKey === "BLUEPRINT");
  if (
    existing?.latestVersion
    && ["READY", "ACTIVE"].includes(existing.latestVersion.state)
    && existing.latestVersion.sourceDocumentVersionId === input.trVersionId
  ) {
    return existing.latestVersion;
  }

  const generatedContent = await generateInitialMissionBlueprint(input.title, input.trVersionNumber, input.trContent);
  const content = [
    "# Blueprint — " + input.title,
    "",
    "**Versão exata do TR de origem:** v" + input.trVersionNumber,
    "**Registro da versão TR:** #" + input.trVersionId,
    "**Estado documental:** READY — estrutura gerada e vinculada; gates adicionais permanecem aplicáveis.",
    "",
    generatedContent,
  ].join("\n");
  const version = {
    content,
    state: "READY",
    authorType: "SOFIA" as const,
    sourceDocumentVersionId: input.trVersionId,
    provenance: {
      origin: "HUMAN",
      source: "validated_TR",
      sourceTRVersionId: input.trVersionId,
      sourceTRVersionNumber: input.trVersionNumber,
    },
    changeSummary: "Blueprint gerado pela SOFIA a partir do TR validado v" + input.trVersionNumber,
    publishedAt: new Date(),
  };

  if (existing) {
    return db.createMissionDocumentRevision({
      taskId: input.taskId,
      documentId: existing.id,
      ownerId: input.ownerId,
      canViewAll: input.canViewAll,
      version,
    });
  }

  const created = await db.createMissionDocumentWithVersion({
    taskId: input.taskId,
    ownerId: input.ownerId,
    canViewAll: input.canViewAll,
    typeKey: "BLUEPRINT",
    documentKey: "BLUEPRINT",
    title: "Blueprint — " + input.title,
    version,
  });
  return created.version;
}

export const appRouter = router({
  system: systemRouter,
  sandboxSession: router({
    close: protectedProcedure.mutation(async ({ ctx }) => {
      if (ENV.appEnvironment !== "sandbox" || !ctx.sandboxSessionId) {
        return { closed: false };
      }
      await closeSandboxSession(ctx.sandboxSessionId, ctx.user.id);
      return { closed: true };
    }),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================
  // AGENTS ROUTER
  // ============================================
  agents: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getAgentsByOwnerId(ctx.user.id, ctx.user.role === "admin");
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        version: z.string().optional(),
        manusAccount: z.string().optional(),
        manusPassword: z.string().optional(),
        manusToken: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createAgent({
          ownerId: ctx.user.id,
          name: input.name,
          description: input.description,
          version: input.version,
          manusAccount: input.manusAccount,
          manusPassword: input.manusPassword,
          manusToken: input.manusToken,
        });
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        return db.getAgentByIdForOwner(input.id, ctx.user.id, ctx.user.role === "admin");
      }),

    validateManusConnection: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        let credentials: Awaited<ReturnType<typeof db.getManusCredentialsForAgentForOwner>>;
        try {
          credentials = await db.getManusCredentialsForAgentForOwner(input.id, ctx.user.id, ctx.user.role === "admin");
        } catch (error) {
          console.error("[Manus] Credential retrieval failed:", error instanceof Error ? error.message : "unknown error");
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Não foi possível recuperar a credencial armazenada. Verifique CREDENTIAL_ENCRYPTION_KEY.",
          });
        }

        if (!credentials) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agente não encontrado." });
        }
        if (!credentials.manusToken) {
          return {
            ok: false,
            authenticated: false,
            identityMatches: null,
            error: "missing_credential",
            message: "Este agente não possui API key Manus armazenada.",
          };
        }

        let response: Response;
        try {
          response = await fetch("https://api.manus.ai/v2/user.me", {
            method: "GET",
            headers: { "x-manus-api-key": credentials.manusToken },
            signal: AbortSignal.timeout(15000),
          });
        } catch {
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message: "Não foi possível conectar à API da Manus.",
          });
        }

        if (response.status === 401 || response.status === 403) {
          return {
            ok: false,
            authenticated: false,
            identityMatches: null,
            httpStatus: response.status,
            error: "authentication_failed",
            message: "A Manus rejeitou a API key armazenada.",
          };
        }

        if (!response.ok) {
          return {
            ok: false,
            authenticated: false,
            identityMatches: null,
            httpStatus: response.status,
            error: "manus_api_error",
            message: `A API Manus retornou HTTP ${response.status}.`,
          };
        }

        let identity: { ok?: boolean; email?: string; name?: string; user_id?: string };
        try {
          identity = await response.json() as typeof identity;
        } catch {
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message: "A resposta da API Manus não contém JSON válido.",
          });
        }

        if (identity.ok !== true) {
          return {
            ok: false,
            authenticated: false,
            identityMatches: null,
            error: "unexpected_manus_response",
            message: "A Manus não confirmou a autenticação.",
          };
        }

        const expectedEmail = credentials.manusAccount?.trim().toLowerCase();
        const actualEmail = identity.email?.trim().toLowerCase();
        const identityMatches = expectedEmail && actualEmail ? expectedEmail === actualEmail : null;

        return {
          ok: identityMatches !== false,
          authenticated: true,
          identityMatches,
          account: {
            email: identity.email ?? null,
            name: identity.name ?? null,
            userId: identity.user_id ?? null,
          },
          expectedAccount: credentials.manusAccount ?? null,
          message: identityMatches === false
            ? "A API key é válida, mas pertence a uma conta diferente da cadastrada no agente."
            : identityMatches === true
              ? "API key válida e conta correspondente ao agente."
              : "API key válida; não foi possível comparar o e-mail da conta.",
        };
      }),

    refreshCredits: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const agent = await db.getAgentByIdForOwner(input.id, ctx.user.id, ctx.user.role === "admin");
        if (!agent && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agente não encontrado." });
        }
        try {
          const creditsRemaining = await syncAgentCredits(input.id);
          return { ok: true, creditsRemaining };
        } catch (error) {
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message: error instanceof Error ? error.message : "Não foi possível atualizar os créditos.",
            cause: error,
          });
        }
      }),

    refreshAllCredits: protectedProcedure.mutation(async ({ ctx }) => {
      const agents = await db.getAgentsByOwnerId(ctx.user.id, ctx.user.role === "admin");
      const configuredAgents = agents.filter((agent) => agent.hasCredential);

      const results = await Promise.all(configuredAgents.map(async (agent) => {
        try {
          const creditsRemaining = await syncAgentCredits(agent.id);
          return { agentId: agent.id, name: agent.name, ok: true as const, creditsRemaining };
        } catch (error) {
          return {
            agentId: agent.id,
            name: agent.name,
            ok: false as const,
            error: error instanceof Error ? error.message : "Falha ao consultar saldo Manus.",
          };
        }
      }));

      return {
        total: configuredAgents.length,
        updated: results.filter((result) => result.ok).length,
        failed: results.filter((result) => !result.ok).length,
        results,
      };
    }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["online", "offline", "idle", "paused"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const agent = await db.getAgentByIdForOwner(input.id, ctx.user.id, ctx.user.role === "admin");
        if (!agent && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agente não encontrado." });
        }
        return db.updateAgentStatus(input.id, input.status);
      }),

    heartbeat: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.updateAgentHeartbeat(input.id);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        version: z.string().optional(),
        manusAccount: z.string().optional(),
        manusPassword: z.string().optional(),
        manusToken: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateAgent(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteAgent(input.id);
      }),
  }),

  // ============================================
  // TASKS ROUTER
  // ============================================
  tasks: router({
    documents: router({
      list: protectedProcedure.input(z.object({ taskId: z.number().int().positive() })).query(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
        const missionRootId = await db.getMissionRootTaskId(input.taskId);
        if (missionRootId == null) throw new TRPCError({ code: "NOT_FOUND", message: "Missão principal não encontrada." });
        return db.getMissionDocumentsForTask(missionRootId, ctx.user.id, ctx.user.role === "admin");
      }),
      initializeLegacyTR: protectedProcedure.input(z.object({ taskId: z.number().int().positive() }))
        .mutation(async ({ input, ctx }) => {
          const requestedTask = await db.getTaskById(input.taskId);
          if (!requestedTask || (requestedTask.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
          }
          const missionRootId = await db.getMissionRootTaskId(input.taskId);
          if (missionRootId == null || missionRootId !== input.taskId) {
            throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A reconstrução documental deve ser iniciada na missão principal, não em uma tarefa-filha." });
          }
          const mission = await db.getTaskById(missionRootId);
          if (!mission) throw new TRPCError({ code: "NOT_FOUND", message: "Missão principal não encontrada." });
          const canViewAll = ctx.user.role === "admin";
          const documents = await db.getMissionDocumentsForTask(missionRootId, ctx.user.id, canViewAll);
          const existingTR = documents.find((document) => document.typeKey === "TR" && document.documentKey === "TR");
          if (existingTR) return { documentId: existingTR.id, alreadyExists: true, state: existingTR.latestVersion?.state ?? null };

          const authorType = mission.creatorType === "system" ? "SOFIA" as const : "HUMAN" as const;
          if (!documents.some((document) => document.typeKey === "ORIGINAL_REQUEST" && document.documentKey === "ORIGINAL_REQUEST")) {
            const originalContent = [
              "# Solicitação preservada — " + mission.title,
              "",
              "**Natureza:** snapshot reconstruído dos campos históricos ainda disponíveis; não substitui uma solicitação original arquivada.",
              "**Motivação original:** não localizada fora dos campos abaixo.",
              "",
              "## Campos preservados",
              "- Título: " + mission.title,
              "- Descrição: " + (mission.description?.trim() || "Não informada."),
              "- Criada em: " + String(mission.createdAt),
              "- Criador registrado: " + (mission.creatorType === "system" ? "SOFIA" : "operador humano"),
            ].join("\n");
            await db.createMissionDocumentWithVersion({
              taskId: missionRootId,
              ownerId: ctx.user.id,
              canViewAll,
              typeKey: "ORIGINAL_REQUEST",
              documentKey: "ORIGINAL_REQUEST",
              title: "Solicitação preservada — " + mission.title,
              version: {
                content: originalContent,
                state: "PUBLISHED",
                authorType,
                authorUserId: authorType === "HUMAN" ? mission.createdBy : null,
                authorAgentId: null,
                provenance: { origin: "LEGACY_BACKFILL", source: "persisted_task_fields", reconstruction: true },
                changeSummary: "Snapshot posterior dos campos históricos disponíveis; motivação original não presumida.",
                publishedAt: new Date(),
              },
            });
          }

          const statusName = (await db.getTaskStatusNameById(mission.statusId))?.toUpperCase() ?? "UNKNOWN";
          const trContent = await generateLegacyMissionTR({
            title: mission.title,
            description: mission.description ?? null,
            status: statusName,
            createdAt: mission.createdAt,
            updatedAt: mission.updatedAt,
            completedAt: mission.completedAt ?? null,
            hasExternalExecution: Boolean(mission.manusTaskId),
          });
          const trState = mission.manusTaskId
            ? statusName === "DONE" ? "CLOSED" : "ACTIVE"
            : statusName === "DONE" ? "CLOSED"
              : statusName === "PROGRESS" ? "ACTIVE"
                : ["PAUSED", "STAGED"].includes(statusName) ? "AWAITING_HUMAN_VALIDATION" : "DRAFT";
          const created = await db.createMissionDocumentWithVersion({
            taskId: missionRootId,
            ownerId: ctx.user.id,
            canViewAll,
            typeKey: "TR",
            documentKey: "TR",
            title: "TR — " + mission.title,
            version: {
              content: trContent,
              state: trState,
              authorType: "SOFIA",
              provenance: {
                origin: "LEGACY_BACKFILL",
                source: "persisted_task_fields",
                reconstruction: true,
                statusAtReconstruction: statusName,
                externalExecutionExists: Boolean(mission.manusTaskId),
              },
              changeSummary: "Reconstrução histórica do TR a partir dos campos persistidos; sem presumir motivação ou resultados.",
              publishedAt: new Date(),
            },
          });
          return { documentId: created.document.id, alreadyExists: false, state: trState };
        }),
      generateFOR: protectedProcedure.input(z.object({ taskId: z.number().int().positive() }))
        .mutation(async ({ input, ctx }) => {
          const requestedTask = await db.getTaskById(input.taskId);
          if (!requestedTask || (requestedTask.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
          }
          const missionRootId = await db.getMissionRootTaskId(input.taskId);
          if (missionRootId == null || missionRootId !== input.taskId) {
            throw new TRPCError({ code: "PRECONDITION_FAILED", message: "O FOR deve ser gerado na missão principal." });
          }
          const mission = await db.getTaskById(missionRootId);
          if (!mission) throw new TRPCError({ code: "NOT_FOUND", message: "Missão principal não encontrada." });
          const statusName = (await db.getTaskStatusNameById(mission.statusId))?.toUpperCase();
          if (statusName !== "DONE") {
            throw new TRPCError({ code: "PRECONDITION_FAILED", message: "O FOR só pode ser consolidado após o encerramento da missão (DONE)." });
          }
          const canViewAll = ctx.user.role === "admin";
          const documents = await db.getMissionDocumentsForTask(missionRootId, ctx.user.id, canViewAll);
          const existingFOR = documents.find((document) => document.typeKey === "FOR" && document.documentKey === "FOR");
          if (existingFOR) return { documentId: existingFOR.id, alreadyExists: true };

          const sourceDocuments = await Promise.all(documents.filter((document) => document.latestVersion).map(async (document) => {
            const latest = await db.getMissionDocumentVersionForTask(
              missionRootId, document.id, document.latestVersion!.version, ctx.user.id, canViewAll,
            );
            return latest ? {
              type: document.typeKey,
              title: document.title,
              version: latest.version.version,
              state: latest.version.state,
              content: latest.version.content,
              sourceDocumentVersionId: latest.version.sourceDocumentVersionId,
            } : null;
          }));
          const childTasks = await db.getTasksByParentId(missionRootId);
          const childSummaries = await Promise.all(childTasks.map(async (child) => ({
            id: child.id,
            title: child.title,
            description: child.description,
            status: (await db.getTaskStatusNameById(child.statusId))?.toUpperCase() ?? "UNKNOWN",
            manusStatus: child.manusStatus,
            hasExternalExecution: Boolean(child.manusTaskId),
            completedAt: child.completedAt,
          })));
          const relatedTaskIds = [missionRootId, ...childTasks.map((child) => child.id)];
          const messages = (await Promise.all(relatedTaskIds.map((taskId) => db.getMessagesByTaskId(taskId, 50))))
            .flat()
            .slice(-100)
            .map((message) => ({ createdAt: message.createdAt, senderId: message.senderId, isAssistant: message.isAssistant, content: message.content }));
          let consolidatedReport: string | null = null;
          try {
            const report = await getConsolidatedTaskReport(missionRootId, ctx.sandboxSessionId);
            consolidatedReport = typeof report === "string" ? report : report == null ? null : JSON.stringify(report);
          } catch {
            consolidatedReport = null;
          }
          const forContent = await generateFinalMissionFOR({
            task: {
              id: mission.id,
              title: mission.title,
              description: mission.description,
              status: statusName,
              createdAt: mission.createdAt,
              completedAt: mission.completedAt,
              manusStatus: mission.manusStatus,
              hasExternalExecution: Boolean(mission.manusTaskId),
            },
            childTasks: childSummaries,
            documents: sourceDocuments.filter((document) => document !== null),
            messages,
            consolidatedReport,
          });
          const created = await db.createMissionDocumentWithVersion({
            taskId: missionRootId,
            ownerId: ctx.user.id,
            canViewAll,
            typeKey: "FOR",
            documentKey: "FOR",
            title: "FOR — " + mission.title,
            version: {
              content: forContent,
              state: "CLOSED",
              authorType: "SOFIA",
              provenance: {
                origin: "MISSION_CLOSURE",
                source: "operator_requested_final_consolidation",
                sourceDocumentIds: documents.map((document) => document.id),
                childTaskIds: childTasks.map((child) => child.id),
              },
              changeSummary: "Relatório operacional final gerado a partir dos registros e evidências disponíveis.",
              publishedAt: new Date(),
            },
          });
          return { documentId: created.document.id, alreadyExists: false };
        }),
      getVersion: protectedProcedure.input(z.object({ taskId: z.number().int().positive(), documentId: z.number().int().positive(), version: z.number().int().positive() }))
        .query(async ({ input, ctx }) => {
          const task = await db.getTaskById(input.taskId);
          if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
          const missionRootId = await db.getMissionRootTaskId(input.taskId);
          if (missionRootId == null) throw new TRPCError({ code: "NOT_FOUND", message: "Missão principal não encontrada." });
          const result = await db.getMissionDocumentVersionForTask(missionRootId, input.documentId, input.version, ctx.user.id, ctx.user.role === "admin");
          if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "Versão documental não encontrada." });
          return result;
        }),
      history: protectedProcedure.input(z.object({ taskId: z.number().int().positive(), documentId: z.number().int().positive() }))
        .query(async ({ input, ctx }) => {
          const task = await db.getTaskById(input.taskId);
          if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
          const missionRootId = await db.getMissionRootTaskId(input.taskId);
          if (missionRootId == null) throw new TRPCError({ code: "NOT_FOUND", message: "Missão principal não encontrada." });
          return db.listMissionDocumentVersionsForTask(missionRootId, input.documentId, ctx.user.id, ctx.user.role === "admin");
        }),
      listActionPlanUnits: protectedProcedure
        .input(z.object({ taskId: z.number().int().positive() }))
        .query(async ({ input, ctx }) => {
          const requestedTask = await db.getTaskById(input.taskId);
          if (!requestedTask || requestedTask.createdBy !== ctx.user.id) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
          }
          const missionRootId = await db.getMissionRootTaskId(input.taskId);
          if (missionRootId == null) throw new TRPCError({ code: "NOT_FOUND", message: "Missão principal não encontrada." });
          return db.listMissionActionPlanUnits(missionRootId, ctx.user.id);
        }),
      registerActionPlanUnits: protectedProcedure
        .input(z.object({
          taskId: z.number().int().positive(),
          documentId: z.number().int().positive(),
          expectedVersion: z.number().int().positive(),
          expectedContentHash: z.string().regex(/^[a-f0-9]{64}$/),
        }))
        .mutation(async ({ input, ctx }) => {
          const requestedTask = await db.getTaskById(input.taskId);
          if (!requestedTask || requestedTask.createdBy !== ctx.user.id) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
          }
          const missionRootId = await db.getMissionRootTaskId(input.taskId);
          if (missionRootId == null) throw new TRPCError({ code: "NOT_FOUND", message: "Missão principal não encontrada." });
          try {
            return await db.registerMissionActionPlanUnits({
              missionTaskId: missionRootId,
              ownerId: ctx.user.id,
              documentId: input.documentId,
              expectedVersion: input.expectedVersion,
              expectedContentHash: input.expectedContentHash,
            });
          } catch (error) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: error instanceof Error ? error.message : "Não foi possível registrar as unidades do plano.",
              cause: error,
            });
          }
        }),
      approveActionPlanUnit: protectedProcedure
        .input(z.object({
          taskId: z.number().int().positive(),
          unitId: z.string().regex(/^T[0-9]{2}$/),
          expectedVersion: z.number().int().positive(),
          expectedContentHash: z.string().regex(/^[a-f0-9]{64}$/),
        }))
        .mutation(async ({ input, ctx }) => {
          const requestedTask = await db.getTaskById(input.taskId);
          if (!requestedTask || requestedTask.createdBy !== ctx.user.id) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
          }
          const missionRootId = await db.getMissionRootTaskId(input.taskId);
          if (missionRootId == null) throw new TRPCError({ code: "NOT_FOUND", message: "Missão principal não encontrada." });
          try {
            return await db.approveMissionActionPlanUnit({
              missionTaskId: missionRootId,
              ownerId: ctx.user.id,
              unitId: input.unitId,
              expectedVersion: input.expectedVersion,
              expectedContentHash: input.expectedContentHash,
            });
          } catch (error) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: error instanceof Error ? error.message : "Não foi possível aprovar esta unidade.",
              cause: error,
            });
          }
        }),
      materializeApprovedActionPlanUnits: protectedProcedure
        .input(z.object({ taskId: z.number().int().positive() }))
        .mutation(async ({ input, ctx }) => {
          const requestedTask = await db.getTaskById(input.taskId);
          if (!requestedTask || requestedTask.createdBy !== ctx.user.id) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
          }
          const missionRootId = await db.getMissionRootTaskId(input.taskId);
          if (missionRootId == null) throw new TRPCError({ code: "NOT_FOUND", message: "Missão principal não encontrada." });
          try {
            return await db.materializeApprovedMissionActionPlanUnits({
              missionTaskId: missionRootId,
              ownerId: ctx.user.id,
            });
          } catch (error) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: error instanceof Error ? error.message : "Não foi possível materializar as unidades aprovadas.",
              cause: error,
            });
          }
        }),
      evaluateActionPlanUnit: protectedProcedure
        .input(z.object({
          taskId: z.number().int().positive(),
          unitId: z.string().regex(/^T[0-9]{2}$/),
        }))
        .mutation(async ({ input, ctx }) => {
          const requestedTask = await db.getTaskById(input.taskId);
          if (!requestedTask || requestedTask.createdBy !== ctx.user.id) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
          }
          const missionRootId = await db.getMissionRootTaskId(input.taskId);
          if (missionRootId == null) throw new TRPCError({ code: "NOT_FOUND", message: "Missão principal não encontrada." });
          const mission = await db.getTaskById(missionRootId);
          if (!mission || mission.createdBy !== ctx.user.id) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Somente o proprietário da missão pode avaliar a governança do plano." });
          }

          const documents = await db.getMissionDocumentsForTask(missionRootId, ctx.user.id, false);
          const actionPlanDocument = documents.find((document) =>
            document.typeKey === "ACTION_PLAN" && document.documentKey === "ACTION_PLAN"
          );
          if (!actionPlanDocument?.latestVersion) {
            throw new TRPCError({ code: "NOT_FOUND", message: "A missão ainda não possui plano de ação." });
          }

          const planVersionResult = await db.getMissionDocumentVersionForTask(
            missionRootId,
            actionPlanDocument.id,
            actionPlanDocument.latestVersion.version,
            ctx.user.id,
            false,
          );
          if (!planVersionResult) throw new TRPCError({ code: "NOT_FOUND", message: "Versão atual do plano não encontrada." });

          const actualPlanHash = createHash("sha256")
            .update(planVersionResult.version.content, "utf8")
            .digest("hex");
          if (!planVersionResult.version.contentHash
            || actualPlanHash !== planVersionResult.version.contentHash) {
            throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A integridade SHA-256 da versão aprovada não confere; pré-avaliação bloqueada." });
          }

          let plan;
          try {
            plan = ActionPlanSchema.parse(JSON.parse(planVersionResult.version.content));
          } catch {
            throw new TRPCError({ code: "PRECONDITION_FAILED", message: "O conteúdo da versão atual do plano não corresponde ao contrato estruturado." });
          }
          const unit = plan.tasks.find((item) => item.id === input.unitId);
          if (!unit) throw new TRPCError({ code: "NOT_FOUND", message: "Unidade não encontrada na versão atual do plano." });

          const blueprintDocument = documents.find((document) =>
            document.typeKey === "BLUEPRINT" && document.documentKey === "BLUEPRINT"
          );
          let sourceVersionsCurrent = false;
          if (blueprintDocument?.latestVersion
            && blueprintDocument.latestVersion.id === planVersionResult.version.sourceDocumentVersionId
            && ["READY", "ACTIVE"].includes(blueprintDocument.latestVersion.state)) {
            const blueprintResult = await db.getMissionDocumentVersionForTask(
              missionRootId,
              blueprintDocument.id,
              blueprintDocument.latestVersion.version,
              ctx.user.id,
              false,
            );
            const trDocument = documents.find((document) =>
              document.typeKey === "TR" && document.documentKey === "TR"
            );
            if (blueprintResult && trDocument?.latestVersion
              && ["VALIDATED", "ACTIVE", "REORIENTED"].includes(trDocument.latestVersion.state)
              && blueprintResult.version.sourceDocumentVersionId === trDocument.latestVersion.id) {
              sourceVersionsCurrent = true;
            }
          }

          const registeredUnits = actionPlanDocument.latestVersion.state === "APPROVED"
            ? await db.listMissionActionPlanUnits(missionRootId, ctx.user.id)
            : [];
          const registeredUnit = registeredUnits.find((candidate) => candidate.unitId === unit.id);
          const dependencyEvidence = registeredUnit
            ? await refreshActionUnitDependencyEvidence({
              missionTaskId: missionRootId,
              ownerId: ctx.user.id,
              actionPlanDocumentId: actionPlanDocument.id,
              actionPlanVersionId: planVersionResult.version.id,
              actionPlanVersionNumber: planVersionResult.version.version,
              actionPlanContentHash: actualPlanHash,
              unitId: unit.id,
            })
            : {
              evidenceId: null,
              decision: unit.dependsOn.length === 0 ? "VERIFIED" as const : "BLOCKED" as const,
              dependencies: unit.dependsOn.map((dependencyId) => ({
                unitId: dependencyId,
                operationalTaskId: null,
                taskStatus: null,
                verified: false,
                reason: "action_unit_not_registered",
              })),
              unitApproved: false,
              idempotencyKey: null,
            };

          const gate = evaluateExecutionGate({
            planApproved: actionPlanDocument.latestVersion.state === "APPROVED",
            sourceVersionsCurrent,
            dependenciesCompleted: dependencyEvidence.decision === "VERIFIED",
            riskClass: null,
            maximumAllowedRisk: null,
            estimatedCredits: unit.estimatedCredits,
            availableBudgetCredits: null,
            budgetEstimateVerified: false,
            permissionGranted: false,
            agentEligible: false,
            idempotencyKey: dependencyEvidence.idempotencyKey,
            executionAdapterAvailable: false,
            explicitUnitApproval: dependencyEvidence.unitApproved,
          });

          return {
            missionId: missionRootId,
            actionPlanDocumentId: actionPlanDocument.id,
            actionPlanVersion: planVersionResult.version.version,
            actionPlanContentHash: planVersionResult.version.contentHash,
            unit: {
              id: unit.id,
              title: unit.title,
              proposedAgentId: unit.proposedAgentId,
              dependsOn: unit.dependsOn,
              estimatedCredits: unit.estimatedCredits,
            },
            gate,
            dependencyEvidence,
            limitations: [
              "A avaliação é somente leitura e não cria autorização nem execução.",
              "Dependências do plano ainda não possuem vínculo persistido com tarefas operacionais; dependências não vazias permanecem bloqueadas.",
              "Classificação/limite de risco, orçamento autorizado, permissão por unidade, elegibilidade do executor-filho, idempotência persistida e adaptador de execução por unidade ainda não estão implementados.",
              "O snapshot de elegibilidade da missão-pai não é reutilizado como prova de elegibilidade de uma futura tarefa-filha.",
              "A aprovação do plano inteiro não equivale à aprovação individual desta unidade.",
            ],
          };
        }),
      generateActionPlan: protectedProcedure
        .input(z.object({ taskId: z.number().int().positive() }))
        .mutation(async ({ input, ctx }) => {
          const requestedTask = await db.getTaskById(input.taskId);
          if (!requestedTask || (requestedTask.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
          }
          const missionRootId = await db.getMissionRootTaskId(input.taskId);
          if (missionRootId == null) throw new TRPCError({ code: "NOT_FOUND", message: "Missão principal não encontrada." });
          const mission = await db.getTaskById(missionRootId);
          if (!mission || mission.createdBy !== ctx.user.id) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Somente o proprietário da missão pode propor seu plano de ação." });
          }

          const documents = await db.getMissionDocumentsForTask(missionRootId, ctx.user.id, false);
          const tr = documents.find((document) => document.typeKey === "TR" && document.documentKey === "TR");
          const blueprint = documents.find((document) => document.typeKey === "BLUEPRINT" && document.documentKey === "BLUEPRINT");
          if (!tr?.latestVersion || !["VALIDATED", "ACTIVE", "REORIENTED"].includes(tr.latestVersion.state)
            || !blueprint?.latestVersion || !["READY", "ACTIVE"].includes(blueprint.latestVersion.state)
            || blueprint.latestVersion.sourceDocumentVersionId !== tr.latestVersion.id) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "O plano de ação exige TR vigente validado e Blueprint READY/ACTIVE vinculado àquela versão exata.",
            });
          }

          const trRecord = await db.getMissionDocumentVersionForTask(
            missionRootId, tr.id, tr.latestVersion.version, ctx.user.id, false,
          );
          const blueprintRecord = await db.getMissionDocumentVersionForTask(
            missionRootId, blueprint.id, blueprint.latestVersion.version, ctx.user.id, false,
          );
          if (!trRecord || !blueprintRecord) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Versão-fonte do TR ou Blueprint não encontrada." });
          }

          const eligibility = await db.inspectTaskAgentEligibility(missionRootId, mission.createdBy);
          const eligibleAgents = (eligibility?.candidates ?? [])
            .filter((candidate: any) => candidate.eligible)
            .map((candidate: any) => ({
              agentId: candidate.agentId,
              name: candidate.name,
              creditsSnapshot: candidate.creditsRemaining,
              creditsUpdatedAt: candidate.creditsUpdatedAt,
            }));

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: [
                  "Você é SOFIA e deve propor um plano de ação estruturado, em JSON puro, sem Markdown ou cercas de código.",
                  "O plano deve respeitar estritamente o TR validado e o Blueprint fornecidos. Não amplie escopo nem invente fatos, dependências, prazos, ferramentas, permissões ou recursos.",
                  "Divida o trabalho em unidades pequenas, com IDs T01, T02 etc., dependências explícitas e critérios objetivos de aceite.",
                  "Só proponha proposedAgentId dentre os agentes elegíveis fornecidos; se nenhum for adequado, use null e explique em agentRationale.",
                  "Não existe neste sistema um modelo de preço/crédito verificado por tarefa: estimatedCredits deve ser null em todas as tarefas e creditEstimateBasis deve declarar essa limitação. Não confunda saldo disponível do agente com custo estimado.",
                  "Registre riscos e reversibilidade por tarefa e globalmente. approvalRequired deve ser true. Não execute, reserve, despache, altere status ou atribua agentes.",
                  "Retorne exatamente as propriedades do schema: schemaVersion, objective, expectedOutcome, tasks, globalRisks, reversibility, approvalRequired, approvalReason. Cada tarefa: id, title, description, dependsOn, proposedAgentId, agentRationale, estimatedCredits, creditEstimateBasis, acceptanceCriteria, risks, reversibility.",
                ].join("\n"),
              },
              {
                role: "user",
                content: "Missão: " + mission.title
                  + "\n\nTR validado (versão " + tr.latestVersion.version + "):\n" + trRecord.version.content
                  + "\n\nBlueprint vigente (versão " + blueprint.latestVersion.version + "):\n" + blueprintRecord.version.content
                  + "\n\nAgentes elegíveis no snapshot (não reservados):\n" + JSON.stringify(eligibleAgents),
              },
            ],
            toolChoice: "none",
            maxTokens: 6000,
          });
          const raw = extractTextContent(response.choices?.[0]?.message?.content);
          let parsed: unknown;
          try {
            parsed = JSON.parse(raw);
          } catch {
            throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A SOFIA não retornou um plano JSON válido; nenhuma proposta foi persistida." });
          }
          let plan;
          try {
            plan = validateActionPlan(parsed, eligibleAgents.map((agent: any) => agent.agentId));
          } catch (error) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: error instanceof Error ? error.message : "Plano estruturado inválido.",
              cause: error,
            });
          }

          const content = JSON.stringify(plan, null, 2);
          const contentHash = createHash("sha256").update(content, "utf8").digest("hex");
          const existing = documents.find((document) => document.typeKey === "ACTION_PLAN" && document.documentKey === "ACTION_PLAN");
          const version = {
            content,
            state: "PROPOSED",
            authorType: "SOFIA" as const,
            sourceDocumentVersionId: blueprintRecord.version.id,
            provenance: {
              source: "validated_TR_and_READY_BLUEPRINT",
              sourceTRVersionId: trRecord.version.id,
              sourceTRVersionNumber: trRecord.version.version,
              sourceBlueprintVersionId: blueprintRecord.version.id,
              sourceBlueprintVersionNumber: blueprintRecord.version.version,
              eligibilityObservedAt: eligibility?.observedAt ?? null,
              eligibleAgentIds: eligibleAgents.map((agent: any) => agent.agentId),
            },
            changeSummary: "Plano estruturado proposto pela SOFIA a partir do TR e Blueprint vigentes",
            contentHash,
            publishedAt: new Date(),
          };

          if (existing) {
            const createdVersion = await db.createMissionDocumentRevision({
              taskId: missionRootId,
              documentId: existing.id,
              ownerId: ctx.user.id,
              canViewAll: false,
              version,
            });
            return { documentId: existing.id, version: createdVersion };
          }

          const created = await db.createMissionDocumentWithVersion({
            taskId: missionRootId,
            ownerId: ctx.user.id,
            canViewAll: false,
            typeKey: "ACTION_PLAN",
            documentKey: "ACTION_PLAN",
            title: "Plano de ação — " + mission.title,
            version,
          });
          return { documentId: created.document.id, version: created.version };
        }),
      approveActionPlan: protectedProcedure
        .input(z.object({
          taskId: z.number().int().positive(),
          documentId: z.number().int().positive(),
          expectedVersion: z.number().int().positive(),
          expectedContentHash: z.string().regex(/^[a-f0-9]{64}$/),
        }))
        .mutation(async ({ input, ctx }) => {
          const task = await db.getTaskById(input.taskId);
          if (!task || task.createdBy !== ctx.user.id) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Somente o proprietário da missão pode aprovar o plano." });
          }
          const missionRootId = await db.getMissionRootTaskId(input.taskId);
          if (missionRootId == null) throw new TRPCError({ code: "NOT_FOUND", message: "Missão principal não encontrada." });
          try {
            return await db.approveMissionActionPlanVersion({
              taskId: missionRootId,
              documentId: input.documentId,
              ownerId: ctx.user.id,
              expectedVersion: input.expectedVersion,
              expectedContentHash: input.expectedContentHash,
            });
          } catch (error) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: error instanceof Error ? error.message : "Não foi possível aprovar a versão apresentada.",
              cause: error,
            });
          }
        }),
      reviseInitialTR: protectedProcedure.input(z.object({ taskId: z.number().int().positive(), content: z.string().trim().min(1).max(50000) }))
        .mutation(async ({ input, ctx }) => {
          const task = await db.getTaskById(input.taskId);
          if (!task || task.createdBy !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND", message: "Somente o operador que criou a missão pode corrigir ou validar seu TR." });
          if (task.parentTaskId != null) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "O TR pertence à missão principal; tarefas-filhas não podem alterá-lo." });
          if (task.manusTaskId) {
            throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A revisão do TR só é permitida antes da primeira execução externa." });
          }
          const docs = await db.getMissionDocumentsForTask(input.taskId, ctx.user.id, false);
          const tr = docs.find((document) => document.typeKey === "TR" && document.documentKey === "TR");
          const currentStatusName = (await db.getTaskStatusNameById(task.statusId))?.toUpperCase();
          const canReorientBeforeExecution = tr?.latestVersion?.state === "VALIDATED"
            && ["PAUSED", "STAGED"].includes(currentStatusName ?? "")
            && !task.manusTaskId;
          if (!tr?.latestVersion || (!["DRAFT", "AWAITING_HUMAN_VALIDATION"].includes(tr.latestVersion.state) && !canReorientBeforeExecution)) {
            throw new TRPCError({ code: "PRECONDITION_FAILED", message: "O TR só pode ser corrigido antes da primeira execução; após validação, a reorientação exige missão ainda PAUSED e sem execução externa." });
          }
          try {
            return await db.reorientMissionTRBeforeExecution({
              taskId: input.taskId,
              documentId: tr.id,
              ownerId: ctx.user.id,
              content: input.content,
            });
          } catch (error) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: error instanceof Error ? error.message : "Não foi possível reorientar o TR antes da execução.",
              cause: error,
            });
          }
        }),
      regenerateInitialTR: protectedProcedure.input(z.object({ taskId: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || task.createdBy !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND", message: "Somente o operador que criou a missão pode corrigir ou validar seu TR." });
        const pausedStatusId = await db.getTaskStatusIdByName("PAUSED");
        const stagedStatusId = await db.getTaskStatusIdByName("STAGED");
        if (![pausedStatusId, stagedStatusId].includes(task.statusId) || task.manusTaskId) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A regeneração do TR exige missão PAUSED ou STAGED ainda sem execução externa." });
        }
        if (task.parentTaskId != null) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "O TR pertence à missão principal; tarefas-filhas não podem alterá-lo." });
        const docs = await db.getMissionDocumentsForTask(input.taskId, ctx.user.id, false);
        const tr = docs.find((document) => document.typeKey === "TR" && document.documentKey === "TR");
        if (!tr?.latestVersion || tr.latestVersion.state !== "DRAFT") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A regeneração só é permitida enquanto o TR inicial estiver em DRAFT." });
        }
        const content = await generateInitialMissionTR(task.title, task.description);
        return db.createMissionDocumentRevision({
          taskId: input.taskId, documentId: tr.id, ownerId: ctx.user.id, canViewAll: false,
          version: {
            content, state: "AWAITING_HUMAN_VALIDATION", authorType: "SOFIA",
            provenance: { origin: "HUMAN", source: "operator_requested_regeneration", supersedesVersion: tr.latestVersion.version },
            changeSummary: "SOFIA regenerou o TR inicial após falha anterior",
            publishedAt: new Date(),
          },
        });
      }),
      validateTR: protectedProcedure.input(z.object({ taskId: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || task.createdBy !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND", message: "Somente o operador que criou a missão pode corrigir ou validar seu TR." });
        const pausedStatusId = await db.getTaskStatusIdByName("PAUSED");
        const stagedStatusId = await db.getTaskStatusIdByName("STAGED");
        if (![pausedStatusId, stagedStatusId].includes(task.statusId) || task.manusTaskId) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A validação do TR exige missão PAUSED ou STAGED ainda sem execução externa." });
        }
        if (task.parentTaskId != null) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "O TR pertence à missão principal; tarefas-filhas não podem alterá-lo." });
        const docs = await db.getMissionDocumentsForTask(input.taskId, ctx.user.id, false);
        const tr = docs.find((document) => document.typeKey === "TR" && document.documentKey === "TR");
        if (!tr?.latestVersion || tr.latestVersion.state !== "AWAITING_HUMAN_VALIDATION") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Não existe uma versão do TR aguardando validação." });
        const current = await db.getMissionDocumentVersionForTask(input.taskId, tr.id, tr.latestVersion.version, ctx.user.id, false);
        if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "Conteúdo do TR não encontrado." });
        const validated = await db.createMissionDocumentRevision({
          taskId: input.taskId, documentId: tr.id, ownerId: ctx.user.id, canViewAll: false,
          version: {
            content: current.version.content, state: "VALIDATED", authorType: "HUMAN", authorUserId: ctx.user.id,
            provenance: { origin: "HUMAN", action: "explicit_tr_validation", validatedVersion: tr.latestVersion.version },
            changeSummary: "Validação explícita pelo operador da versão " + tr.latestVersion.version,
            publishedAt: new Date(),
          },
        });
        try {
          await persistMissionBlueprint({
            taskId: input.taskId, ownerId: ctx.user.id, canViewAll: false,
            title: task.title, trVersionId: validated.id, trVersionNumber: validated.version,
            trContent: current.version.content,
          });
        } catch (error) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "TR validado, mas o Blueprint não foi gerado. A missão permanece PAUSED; tente gerar o Blueprint novamente. " + (error instanceof Error ? error.message : ""),
            cause: error,
          });
        }
        if (!(await db.hasExecutionReadyMissionDocuments(input.taskId))) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "O Blueprint não passou pela verificação de vínculo com a versão vigente do TR." });
        }
        await db.updateTaskStatus(input.taskId, stagedStatusId);
        return { validatedVersion: validated.version, statusId: stagedStatusId };
      }),
      generateBlueprint: protectedProcedure.input(z.object({ taskId: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || task.createdBy !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND", message: "Somente o operador que criou a missão pode liberar seu plano de trabalho." });
        const pausedStatusId = await db.getTaskStatusIdByName("PAUSED");
        const stagedStatusId = await db.getTaskStatusIdByName("STAGED");
        if (![pausedStatusId, stagedStatusId].includes(task.statusId) || task.manusTaskId) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A geração/retenção do Blueprint exige missão PAUSED ou STAGED ainda sem execução externa." });
        }
        if (task.parentTaskId != null) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "O Blueprint pertence à missão principal." });
        const docs = await db.getMissionDocumentsForTask(input.taskId, ctx.user.id, false);
        const tr = docs.find((document) => document.typeKey === "TR" && document.documentKey === "TR");
        if (!tr?.latestVersion || !["VALIDATED", "ACTIVE", "REORIENTED"].includes(tr.latestVersion.state)) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "O TR precisa estar validado antes da geração do Blueprint." });
        }
        const current = await db.getMissionDocumentVersionForTask(input.taskId, tr.id, tr.latestVersion.version, ctx.user.id, false);
        if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "Conteúdo do TR validado não encontrado." });
        const blueprint = await persistMissionBlueprint({
          taskId: input.taskId, ownerId: ctx.user.id, canViewAll: false,
          title: task.title, trVersionId: current.version.id, trVersionNumber: current.version.version,
          trContent: current.version.content,
        });
        if (!(await db.hasExecutionReadyMissionDocuments(input.taskId))) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Blueprint não está READY ou não referencia a versão vigente do TR." });
        }
        await db.updateTaskStatus(input.taskId, stagedStatusId);
        return { blueprintVersion: blueprint.version, statusId: stagedStatusId };
      }),
    }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getAllTasks(ctx.user.id, ctx.user.role === "admin");
    }),

    listAll: protectedProcedure.query(async ({ ctx }) => {
      return db.getAllTasks(ctx.user.id, ctx.user.role === "admin");
    }),

    create: protectedProcedure
      .input(z.object({
        agentId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        statusId: z.number(),
        priorityId: z.number(),
        parentTaskId: z.number().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (input.parentTaskId !== undefined) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Tarefas-filhas são criadas pelo orquestrador a partir da missão principal, não pelo formulário de nova missão." });
        }
        // Verify the document catalog before creating the task row. Without migration
        // 0010, creating the mission first would leave an orphan task with no ORIGINAL_REQUEST/TR.
        let activeDocumentTypes: Awaited<ReturnType<typeof db.getMissionDocumentTypes>>;
        try {
          activeDocumentTypes = await db.getMissionDocumentTypes();
        } catch (error) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "O catálogo documental da missão não está disponível. A migration 0010 precisa ser aplicada antes de criar missões.",
            cause: error,
          });
        }
        const activeTypeKeys = new Set(activeDocumentTypes.map((documentType) => documentType.typeKey));
        const missingRequiredTypes = ["ORIGINAL_REQUEST", "TR", "BLUEPRINT"].filter((typeKey) => !activeTypeKeys.has(typeKey));
        if (missingRequiredTypes.length > 0) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Tipos documentais obrigatórios inativos ou ausentes: " + missingRequiredTypes.join(", "),
          });
        }

        // Human-origin missions stay PAUSED until the initial TR is validated.
        const pausedStatusId = await db.getTaskStatusIdByName("PAUSED");
        if (!pausedStatusId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "O status PAUSED não está configurado; criação segura bloqueada." });

        let trGenerationError: string | null = null;
        let trContent: string;
        let trState = "AWAITING_HUMAN_VALIDATION";
        try {
          trContent = await generateInitialMissionTR(input.title, input.description);
        } catch (error) {
          trGenerationError = error instanceof Error ? error.message : "Falha ao gerar o TR inicial.";
          trState = "DRAFT";
          trContent = [
            "# TR inicial — " + input.title, "",
            "**Estado:** DRAFT — geração cognitiva pendente; validação indisponível.",
            "**Origem:** solicitação humana registrada no documento Solicitação original.", "",
            "## Informações disponíveis",
            "- Título declarado: " + input.title,
            "- Descrição declarada: " + (input.description?.trim() || "Não informada."), "",
            "## Limite de conhecimento",
            "A interpretação da SOFIA não foi concluída. Nenhuma motivação, decisão, escopo adicional ou resultado foi presumido."
          ].join("\n");
        }

        const originalContent = [
          "# Solicitação original — " + input.title, "",
          "**Origem:** operador humano (usuário #" + ctx.user.id + ")",
          "**Registrada em:** " + new Date().toISOString(), "",
          "## Descrição original", input.description?.trim() || "Nenhuma descrição adicional foi fornecida."
        ].join("\n");

        let created: Awaited<ReturnType<typeof db.createMissionWithInitialDocuments>>;
        try {
          created = await db.createMissionWithInitialDocuments({
            task: {
              agentId: input.agentId,
              createdBy: ctx.user.id,
              title: input.title,
              description: input.description,
              statusId: pausedStatusId,
              priorityId: input.priorityId,
              dueDate: input.dueDate,
              manusStatus: "awaiting_tr_validation",
            },
            originalRequest: {
              content: originalContent,
              state: "PUBLISHED",
              authorType: "HUMAN",
              authorUserId: ctx.user.id,
              provenance: { origin: "HUMAN", source: "tasks.create" },
              changeSummary: "Snapshot imutável da solicitação original",
            },
            tr: {
              content: trContent,
              state: trState,
              authorType: "SOFIA",
              provenance: { origin: "HUMAN", source: "tasks.create", originalRequestDocumentKey: "ORIGINAL_REQUEST" },
              changeSummary: "Primeira compreensão da missão pela SOFIA; aguardando validação humana",
              publishedAt: trState === "AWAITING_HUMAN_VALIDATION" ? new Date() : null,
            },
          });
        } catch (error) {
          console.error("[Tasks] Atomic mission/document creation failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "A missão e seus documentos iniciais não puderam ser persistidos. Nenhuma missão parcial foi criada.",
            cause: error,
          });
        }

        // GitHub mirroring is deliberately outside the DB transaction and occurs
        // only after the mission + mandatory source documents are safely persisted.
        const mirror = await mirrorTaskToGitHub({
          ...created,
          createdBy: ctx.user.id,
          creatorType: "user",
          creatorName: ctx.user.name,
          creatorEmail: ctx.user.email,
        });
        await db.updateTaskGitHubSync(created.id, {
          missionKey: mirror.missionKey,
          githubPath: mirror.path,
          githubSha: mirror.sha,
          githubSyncStatus: mirror.status,
          githubSyncError: mirror.error ?? null,
        });

        return {
          ...created,
          missionKey: mirror.missionKey,
          githubPath: mirror.path,
          githubSyncStatus: mirror.status,
          trState,
          trGenerationError,
        };
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.id);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
        }
        return task;
      }),

    getByAgent: protectedProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ input, ctx }) => {
        return db.getTasksByAgentIdForOwner(input.agentId, ctx.user.id, ctx.user.role === "admin");
      }),

    getChildren: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .query(async ({ input, ctx }) => {
        const parent = await db.getTaskById(input.taskId);
        if (!parent || (parent.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
        }
        return db.getTasksByParentId(input.taskId);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        statusId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.id);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
        }
        const requestedStatus = (await db.getTaskStatusNameById(input.statusId))?.toUpperCase();
        const currentStatus = (await db.getTaskStatusNameById(task.statusId))?.toUpperCase();
        if (requestedStatus === "PROGRESS" && currentStatus !== "PROGRESS") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A transição para PROGRESS é exclusiva dos fluxos internos de claim atômico e retomada; a procedure genérica não pode promovê-la." });
        }
        if (requestedStatus === "STAGED" && !(await db.hasExecutionReadyMissionDocuments(input.id))) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A missão não pode entrar em STAGED sem TR validado e Blueprint READY vinculado à versão vigente." });
        }
        if (
          requestedStatus === "PAUSED"
          && currentStatus === "PROGRESS"
          && task.manusTaskId
          && !["stopped", "waiting_credit"].includes((task.manusStatus ?? "").toLowerCase())
        ) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "A execução externa ainda não está pausada. Use a operação de pausa, que confirma o estado na Manus antes de alterar o estado local.",
          });
        }
        const result = await db.updateTaskStatus(input.id, input.statusId);
        if (task.missionKey) {
          const mirror = await mirrorTaskToGitHub({
            ...task,
            statusId: input.statusId,
          });
          await db.updateTaskGitHubSync(input.id, {
            missionKey: mirror.missionKey,
            githubPath: mirror.path,
            githubSha: mirror.sha,
            githubSyncStatus: mirror.status,
            githubSyncError: mirror.error ?? null,
          });
        }
        return result;
      }),

    pauseExecution: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
        }
        const currentStatus = (await db.getTaskStatusNameById(task.statusId))?.toUpperCase();
        if (currentStatus !== "PROGRESS") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Somente uma tarefa em PROGRESS pode solicitar pausa da execução externa." });
        }
        if (!task.agentId || !task.manusTaskId) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A tarefa não possui executor e execução Manus atribuídos." });
        }

        let pauseResult: Awaited<ReturnType<typeof stopManusTask>>;
        try {
          pauseResult = await stopManusTask(task, task.manusStatus === "manual_pause_pending");
        } catch (error) {
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message: error instanceof Error ? error.message : "Não foi possível confirmar a pausa na Manus.",
            cause: error,
          });
        }

        const pauseConfirmed = pauseResult.hasRunningBackgroundJobs === false;
        if (pauseConfirmed) {
          const pausedStatusId = await db.getTaskStatusIdByName("PAUSED");
          await db.updateTaskExecution(task.id, { manusStatus: "stopped", completedAt: null });
          await db.updateTaskStatus(task.id, pausedStatusId);
          if (task.missionKey) {
            const mirror = await mirrorTaskToGitHub({ ...task, statusId: pausedStatusId });
            await db.updateTaskGitHubSync(task.id, {
              missionKey: mirror.missionKey,
              githubPath: mirror.path,
              githubSha: mirror.sha,
              githubSyncStatus: mirror.status,
              githubSyncError: mirror.error ?? null,
            });
          }
        } else {
          await db.updateTaskExecution(task.id, { manusStatus: "manual_pause_pending", completedAt: null });
        }

        try {
          const eventType = await db.getOrCreateActivityEventType(
            pauseConfirmed ? "task_execution_paused" : "task_execution_pause_pending",
          );
          await db.createActivityLog({
            agentId: task.agentId,
            taskId: task.id,
            eventTypeId: eventType.id,
            details: pauseConfirmed
              ? "Execução Manus confirmada como stopped, sem processos em segundo plano ativos. Estado local alterado para PAUSED."
              : "Solicitação de pausa enviada. A Manus informou processos em segundo plano ativos ou não confirmou esse campo; a tarefa permanece PROGRESS até confirmação segura.",
          });
        } catch (error) {
          console.warn("[Tasks] Could not record execution pause activity:", error);
        }

        return {
          paused: pauseConfirmed,
          pending: !pauseConfirmed,
          externalStatus: pauseResult.status,
          hasRunningBackgroundJobs: pauseResult.hasRunningBackgroundJobs,
        };
      }),

    resumeExecution: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
        }
        const currentStatus = (await db.getTaskStatusNameById(task.statusId))?.toUpperCase();
        if (currentStatus !== "PAUSED") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Somente uma tarefa em PAUSED pode solicitar retomada." });
        }
        if (!task.agentId || !task.manusTaskId) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A tarefa não possui executor e execução Manus para retomar." });
        }

        let resumeResult: Awaited<ReturnType<typeof resumeManusTask>>;
        try {
          resumeResult = await resumeManusTask(task);
        } catch (error) {
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message: error instanceof Error ? error.message : "Não foi possível confirmar a retomada na Manus.",
            cause: error,
          });
        }

        if (resumeResult.resumed) {
          const progressStatusId = await db.getTaskStatusIdByName("PROGRESS");
          await db.updateTaskExecution(task.id, { manusStatus: "running", completedAt: null });
          await db.updateTaskStatus(task.id, progressStatusId);
          if (task.missionKey) {
            const mirror = await mirrorTaskToGitHub({ ...task, statusId: progressStatusId });
            await db.updateTaskGitHubSync(task.id, {
              missionKey: mirror.missionKey,
              githubPath: mirror.path,
              githubSha: mirror.sha,
              githubSyncStatus: mirror.status,
              githubSyncError: mirror.error ?? null,
            });
          }
        } else {
          await db.updateTaskExecution(task.id, { manusStatus: "manual_resume_pending", completedAt: null });
        }

        try {
          const eventType = await db.getOrCreateActivityEventType(
            resumeResult.resumed ? "task_execution_resumed" : "task_execution_resume_pending",
          );
          await db.createActivityLog({
            agentId: task.agentId,
            taskId: task.id,
            eventTypeId: eventType.id,
            details: resumeResult.resumed
              ? "Retomada confirmada pela Manus; estado local alterado para PROGRESS."
              : `Instrução de retomada aceita, mas o estado externo ainda é ${resumeResult.status}; a tarefa permanece PAUSED até confirmação.`,
          });
        } catch (error) {
          console.warn("[Tasks] Could not record execution resume activity:", error);
        }

        return {
          resumed: resumeResult.resumed,
          pending: !resumeResult.resumed,
          externalStatus: resumeResult.status,
        };
      }),

    factorize: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada." });
        }
        return SofiaOrchestrator.factorizeTask(task);
      }),

    start: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada." });
        }

        try {
          return await SofiaOrchestrator.startTask(input.taskId);
        } catch (error) {
          console.error(`[Tasks] Failed to start task ${input.taskId}:`, error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Não foi possível iniciar a missão.",
            cause: error,
          });
        }
      }),

    consolidate: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada." });
        }

        const report = await SofiaOrchestrator.consolidateResults(input.taskId);
        return uploadConsolidatedTaskReport(input.taskId, report, ctx.sandboxSessionId);
      }),

    getConsolidatedReport: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .query(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada." });
        }
        return getConsolidatedTaskReport(input.taskId, ctx.sandboxSessionId);
      }),
  }),

  // ============================================
  // MESSAGES ROUTER
  // ============================================
  messages: router({
    types: protectedProcedure.query(async () => db.getAllMessageTypes()),

    getGeneral: protectedProcedure.query(async ({ ctx }) =>
      ctx.user.role === "admin" ? db.getAllGeneralMessages(500) : db.getMessagesByOwner(ctx.user.id, null, 200)
    ),

    createGeneral: protectedProcedure
      .input(z.object({
        parentMessageId: z.number().int().positive().optional(),
        typeId: z.number().int().positive(),
        content: z.string().trim().min(1).max(OPERATOR_MESSAGE_MAX_LENGTH),
      }))
      .mutation(async ({ input, ctx }) => {
        const messageType = await db.getMessageTypeById(input.typeId);
        if (!messageType) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Tipo de interação inválido." });
        }
        if (messageType.name.toLowerCase() === "reply" && input.parentMessageId === undefined) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Uma resposta precisa estar vinculada à mensagem original." });
        }

        if (input.parentMessageId !== undefined) {
          const parent = await db.getMessageByIdForOwner(input.parentMessageId, ctx.user.id);
          if (!parent || parent.taskId !== null) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "A mensagem original não pertence à conversa geral desta conta." });
          }
        }

        const content = normalizeOperatorMessage(input.content);
        const message = await db.createMessage({
          taskId: null,
          senderId: ctx.user.id,
          parentMessageId: input.parentMessageId,
          typeId: input.typeId,
          content,
        });
        let assistantContent: string;
        let responseStatus: "replied" | "failed" = "replied";
        let createdMission: Awaited<ReturnType<typeof createMissionFromGeneralMessage>> | null = null;
        const normalizedTypeName = messageType.name.toLowerCase().replace(/[\s_-]/g, "");

        if (normalizedTypeName === "createtask") {
          try {
            createdMission = await createMissionFromGeneralMessage({
              content,
              operator: { id: ctx.user.id, name: ctx.user.name, email: ctx.user.email },
            });
            assistantContent = [
              "Missão criada e registrada com sucesso.",
              "ID: #" + createdMission.id,
              "Chave: " + (createdMission.missionKey ?? "pendente"),
              "Estado inicial: PAUSED — aguardando validação do TR.",
              "Prioridade inicial: " + createdMission.priorityName + ".",
              createdMission.trGenerationError
                ? "A geração do TR ficou pendente: " + createdMission.trGenerationError
                : "O TR inicial foi gerado e aguarda sua validação.",
              "A solicitação original permanece preservada nesta conversa geral.",
            ].join("\n");
          } catch (error) {
            console.error("[Messages] Mission creation from general conversation failed:", error);
            assistantContent = "A solicitação foi registrada na conversa geral, mas a missão não foi criada. " +
              (error instanceof Error ? error.message : "Ocorreu um erro inesperado.");
            responseStatus = "failed";
          }
        } else {
          const previousMessages = await db.getMessagesByOwner(ctx.user.id, null, 30);
          try {
          const response = await invokeLLM({
            messages: buildSofiaGeneralConversation(previousMessages),
            tools: SOFIA_GENERAL_MESSAGE_TOOLS,
            toolChoice: "auto",
            maxTokens: 2500,
          });
          const assistantTurn = response.choices?.[0]?.message;
          const overviewCall = assistantTurn?.tool_calls?.find(
            (call) => call.function.name === "inspect_task_overview"
          );

          if (overviewCall) {
            const accountTasks = await db.getAllTasks(ctx.user.id, ctx.user.role === "admin");
            const taskSnapshots = await Promise.all(accountTasks.map(async (task) => ({
              id: task.id,
              title: task.title,
              status: await db.getTaskStatusNameById(task.statusId),
              parentTaskId: task.parentTaskId,
            })));
            const countByStatus = (items: typeof taskSnapshots) => items.reduce((counts: Record<string, number>, task) => {
              const status = task.status ?? "UNKNOWN";
              counts[status] = (counts[status] ?? 0) + 1;
              return counts;
            }, {});
            const missionSnapshots = taskSnapshots.filter((task) => task.parentTaskId === null);
            const snapshot = {
              source: "database_read_only_task_overview",
              observedAt: new Date().toISOString(),
              totalMissions: missionSnapshots.length,
              missionStatusCounts: countByStatus(missionSnapshots),
              totalTasks: taskSnapshots.length,
              taskStatusCounts: countByStatus(taskSnapshots),
              tasks: taskSnapshots,
              scope: ctx.user.role === "admin" ? "all accounts" : "authenticated account only",
            };
            const followUp = await invokeLLM({
              messages: [
                ...buildSofiaGeneralConversation(previousMessages),
                {
                  role: "user",
                  content: "Resultado da consulta somente leitura inspect_task_overview. Responda usando exclusivamente os dados deste snapshot; não afirme que houve alteração:\\n" + JSON.stringify(snapshot),
                },
              ],
              toolChoice: "none",
              maxTokens: 2500,
            });
            assistantContent = extractTextContent(followUp.choices?.[0]?.message?.content);
          } else {
            assistantContent = extractTextContent(assistantTurn?.content);
          }
          if (!assistantContent) {
            assistantContent = "Recebi sua interação, mas não consegui produzir uma resposta textual.";
            responseStatus = "failed";
          }
        } catch (error) {
          console.error("[Messages] General Sofia response failed:", error);
          assistantContent = "A interação foi registrada, mas a Sofia não conseguiu responder agora. Tente novamente mais tarde.";
          responseStatus = "failed";
          }
        }

        const allTypes = await db.getAllMessageTypes();
        const replyType = allTypes.find((type) => type.name.toLowerCase() === "reply");
        const reply = await db.createMessage({
          taskId: null,
          senderId: ctx.user.id,
          parentMessageId: message.id,
          typeId: replyType?.id ?? input.typeId,
          content: assistantContent,
          isAssistant: true,
        });

        return { message, reply, responseStatus, createdMission };
      }),

    create: protectedProcedure
      .input(z.object({
        taskId: z.number().int().positive(),
        parentMessageId: z.number().int().positive().optional(),
        typeId: z.number().int().positive(),
        content: z.string().trim().min(1).max(OPERATOR_MESSAGE_MAX_LENGTH),
      }))
      .mutation(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
        }

        const messageType = await db.getMessageTypeById(input.typeId);
        if (!messageType) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Tipo de mensagem inválido." });
        }
        if (messageType.name.toLowerCase() === "createtask") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Solicitações de criação de missão devem ser registradas na conversa geral, sem taskId." });
        }
        if (messageType.name.toLowerCase() === "reply" && input.parentMessageId === undefined) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Uma resposta precisa estar vinculada à mensagem original." });
        }
        if (input.parentMessageId !== undefined) {
          const parentMessage = await db.getMessageByIdForTask(input.parentMessageId, input.taskId);
          const ownedParent = await db.getMessageByIdForOwner(input.parentMessageId, ctx.user.id);
          if (!parentMessage || !ownedParent) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "A mensagem pai não pertence à missão selecionada." });
          }
        }

        const content = normalizeOperatorMessage(input.content);
        const operatorMessage = await db.createMessage({
          taskId: input.taskId,
          senderId: ctx.user.id,
          parentMessageId: input.parentMessageId,
          typeId: input.typeId,
          content,
        });
        const previousMessages = await db.getMessagesByOwner(ctx.user.id, input.taskId, 30);

        let assistantContent: string;
        let responseStatus: "replied" | "pending" | "failed" = "replied";
        try {
          const response = await invokeLLM({
            messages: buildSofiaConversation(task, previousMessages),
            tools: SOFIA_MESSAGE_TOOLS,
            toolChoice: "auto",
          });
          const assistantTurn = response.choices?.[0]?.message;
          const inspectCall = assistantTurn?.tool_calls?.find(
            (call) => call.function.name === "inspect_current_mission"
          );
          const eligibilityCall = assistantTurn?.tool_calls?.find(
            (call) => call.function.name === "inspect_agent_eligibility"
          );
          const forwardCall = assistantTurn?.tool_calls?.find(
            (call) => call.function.name === "forward_operator_instruction_to_assigned_agent"
          );

          const requestedOperations = [inspectCall, eligibilityCall, forwardCall].filter(Boolean);
          if (requestedOperations.length > 1) {
            throw new Error("A Sofia solicitou operações incompatíveis na mesma resposta.");
          }

          if (inspectCall) {
            const missionRootId = await db.getMissionRootTaskId(input.taskId);
            const missionRoot = missionRootId ? await db.getTaskById(missionRootId) : null;
            if (!missionRoot || (missionRoot.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
              throw new TRPCError({ code: "NOT_FOUND", message: "Missão principal não encontrada ou sem permissão de acesso." });
            }

            const childTasks = await db.getTasksByParentId(missionRoot.id);
            const relatedTasks = [
              missionRoot,
              ...childTasks.filter((child) => child.createdBy === missionRoot.createdBy),
            ];
            const [taskSnapshots, availableAgentRecords, executionReady] = await Promise.all([
              Promise.all(relatedTasks.map(async (relatedTask) => ({
                missionId: missionRoot.id,
                taskId: relatedTask.id,
                title: relatedTask.title,
                parentTaskId: relatedTask.parentTaskId,
                status: await db.getTaskStatusNameById(relatedTask.statusId),
                agentId: relatedTask.agentId,
                agentPinned: relatedTask.agentPinned,
                agentTaskId: relatedTask.manusTaskId,
                agentTaskStatus: relatedTask.manusStatus,
                creditsUsed: relatedTask.creditsUsed,
                completedAt: relatedTask.completedAt?.toISOString?.() ?? null,
              }))),
              db.getAgentsByOwnerId(missionRoot.createdBy, ctx.user.role === "admin"),
              db.hasExecutionReadyMissionDocuments(missionRoot.id),
            ]);

            const assignedAgentIds = new Set(taskSnapshots.map((item) => item.agentId).filter((id): id is number => typeof id === "number"));
            const observedAt = new Date();
            const assignedAgents = availableAgentRecords
              .filter((agent) => agent.ownerId === missionRoot.createdBy && assignedAgentIds.has(agent.id))
              .map((agent) => {
                const creditsUpdatedAt = agent.creditsUpdatedAt instanceof Date
                  ? agent.creditsUpdatedAt
                  : agent.creditsUpdatedAt ? new Date(agent.creditsUpdatedAt) : null;
                const creditAgeMs = creditsUpdatedAt ? observedAt.getTime() - creditsUpdatedAt.getTime() : null;
                return {
                  agentId: agent.id,
                  name: agent.name,
                  status: agent.status,
                  connectionStatus: agent.connectionStatus,
                  version: agent.version,
                  lastHeartbeat: agent.lastHeartbeat instanceof Date ? agent.lastHeartbeat.toISOString() : agent.lastHeartbeat ?? null,
                  creditsRemaining: agent.creditsRemaining,
                  creditsUpdatedAt: creditsUpdatedAt?.toISOString() ?? null,
                  creditSnapshotFresh: creditAgeMs !== null && creditAgeMs >= 0 && creditAgeMs <= 60_000,
                };
              });

            const missionSnapshot = {
              source: "database_read_only_snapshot",
              observedAt: observedAt.toISOString(),
              mission: {
                missionId: missionRoot.id,
                title: missionRoot.title,
                description: missionRoot.description,
                status: await db.getTaskStatusNameById(missionRoot.statusId),
                createdAt: missionRoot.createdAt?.toISOString?.() ?? null,
                updatedAt: missionRoot.updatedAt?.toISOString?.() ?? null,
                executionDocumentsReady: executionReady,
              },
              tasks: taskSnapshots,
              assignedAgents,
              interpretationLimits: [
                "Créditos são o último snapshot persistido, não uma consulta em tempo real à Manus.",
                "Status online/conectado não significa elegibilidade para nova atribuição.",
                "Esta consulta não altera missão, agente, prioridade, execução ou créditos.",
                "Somente a missão aberta, sua raiz e suas tarefas-filhas diretas foram consultadas.",
              ],
            };

            const followUp = await invokeLLM({
              messages: [
                ...buildSofiaConversation(task, previousMessages),
                {
                  role: "user",
                  content: "Resultado da ferramenta somente leitura inspect_current_mission. Use estes dados como fonte factual; não infira elegibilidade ou ações não executadas:\\n" + JSON.stringify(missionSnapshot),
                },
              ],
              toolChoice: "none",
              maxTokens: 2500,
            });
            assistantContent = extractTextContent(followUp.choices?.[0]?.message?.content)
              || "Consultei os dados da missão, mas não consegui produzir uma síntese textual.";
            if (assistantContent.startsWith("Consultei os dados")) responseStatus = "failed";
          } else if (eligibilityCall) {
            const eligibilitySnapshot = await db.inspectTaskAgentEligibility(input.taskId, task.createdBy);
            if (!eligibilitySnapshot) {
              throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada para consulta de elegibilidade." });
            }

            const eligibleAgents = eligibilitySnapshot.candidates.filter((candidate: any) => candidate.eligible);
            const snapshot = {
              source: "database_read_only_agent_eligibility_snapshot",
              ...eligibilitySnapshot,
              eligibleAgentCount: eligibleAgents.length,
              eligibleAgentIdsInClaimOrder: eligibleAgents.map((candidate: any) => candidate.agentId),
              warning: "Elegibilidade é um snapshot; somente o claim transacional pode reservar o agente. Não houve reserva nesta consulta.",
            };

            const followUp = await invokeLLM({
              messages: [
                ...buildSofiaConversation(task, previousMessages),
                {
                  role: "user",
                  content: "Resultado da ferramenta somente leitura inspect_agent_eligibility. Explique os critérios e os motivos de inelegibilidade usando exclusivamente os dados abaixo. Não afirme que um agente foi reservado ou que a elegibilidade está garantida no futuro:\\n" + JSON.stringify(snapshot),
                },
              ],
              toolChoice: "none",
              maxTokens: 2500,
            });
            assistantContent = extractTextContent(followUp.choices?.[0]?.message?.content)
              || "Consultei os critérios de elegibilidade, mas não consegui produzir uma síntese textual.";
            if (assistantContent.startsWith("Consultei os critérios")) responseStatus = "failed";
          } else if (forwardCall) {
            let toolArgs: { message?: string; taskId?: number };
            try {
              toolArgs = JSON.parse(forwardCall.function.arguments) as { message?: string; taskId?: number };
            } catch {
              throw new Error("A Sofia retornou argumentos inválidos para o encaminhamento.");
            }

            const forwardedMessage = toolArgs.message?.trim();
            if (!forwardedMessage || forwardedMessage.length > OPERATOR_MESSAGE_MAX_LENGTH) {
              throw new Error("A Sofia produziu uma instrução vazia ou acima do limite permitido.");
            }

            // A missão pode estar sendo executada por uma tarefa-filha. O SCP
            // continua dono da missão e resolve o executor temporário ativo.
            const missionRootId = await db.getMissionRootTaskId(input.taskId);
            const missionRoot = missionRootId ? await db.getTaskById(missionRootId) : null;
            if (!missionRoot || (missionRoot.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
              throw new TRPCError({ code: "NOT_FOUND", message: "Missão principal não encontrada ou sem permissão de acesso." });
            }

            const childTasks = await db.getTasksByParentId(missionRoot.id);
            const relatedTasks = [
              missionRoot,
              ...childTasks.filter((child) => child.createdBy === missionRoot.createdBy),
            ];
            const executionCandidates = (await Promise.all(relatedTasks.map(async (candidate) => ({
              task: candidate,
              status: (await db.getTaskStatusNameById(candidate.statusId))?.toUpperCase() ?? null,
            })))).filter(({ task: candidate, status }) =>
              status === "PROGRESS"
              && candidate.agentId != null
              && Boolean(candidate.manusTaskId)
              && !["stopped", "error", "completed"].includes((candidate.manusStatus ?? "").toLowerCase())
            );

            const executionTask = toolArgs.taskId
              ? executionCandidates.find(({ task: candidate }) => candidate.id === toolArgs.taskId)?.task
              : executionCandidates.length === 1
                ? executionCandidates[0].task
                : null;

            if (!executionTask) {
              if (executionCandidates.length > 1) {
                assistantContent = "Há mais de uma execução ativa nesta missão. Para evitar encaminhar a instrução ao executor errado, indique a etapa/tarefa de destino. Execuções ativas: "
                  + executionCandidates.map(({ task: candidate }) => `#${candidate.id} — ${candidate.title}`).join("; ") + ".";
              } else {
                assistantContent = "Não localizei uma execução externa ativa e atribuída nesta missão. A mensagem não foi encaminhada.";
              }
              responseStatus = "failed";
            } else if (!(await db.hasExecutionReadyMissionDocuments(missionRoot.id))) {
              assistantContent = "A instrução não foi enviada: a missão ainda não possui TR validado e Blueprint READY vinculado à versão vigente.";
              responseStatus = "failed";
            } else {
              const externalReply = await sendManusMessageAndWait(executionTask, forwardedMessage);
              assistantContent = externalReply
                ? `Instrução encaminhada à tarefa #${executionTask.id} — ${executionTask.title}. Resposta recebida:\n\n${externalReply}`
                : `A instrução foi enviada à execução #${executionTask.id}, mas não foi possível confirmar uma resposta dentro da janela de consulta. Isso não comprova leitura ou processamento.`;
              if (!externalReply) responseStatus = "pending";
            }
          } else {
            const generatedContent = extractTextContent(assistantTurn?.content);
            assistantContent = generatedContent
              ? generatedContent
              : "Recebi a mensagem, mas a Sofia não produziu uma resposta textual.";
            if (!generatedContent) responseStatus = "failed";
          }
        } catch (error) {
          console.error(`[Messages] Sofia response failed for task ${input.taskId}:`, error);
          assistantContent = "A mensagem foi registrada, mas a Sofia não conseguiu processá-la agora. Verifique a configuração do serviço de IA e tente novamente.";
          responseStatus = "failed";
        }

        const assistantMessage = await db.createMessage({
          taskId: input.taskId,
          senderId: ctx.user.id,
          parentMessageId: operatorMessage?.id,
          typeId: (await db.getAllMessageTypes()).find((type) => type.name.toLowerCase() === "reply")?.id ?? input.typeId,
          content: assistantContent,
          isAssistant: true,
        });

        return { message: operatorMessage, reply: assistantMessage, responseStatus };
      }),

    getByTask: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada ou sem permissão de acesso." });
        }
        return ctx.user.role === "admin" ? db.getMessagesByTaskId(input.taskId) : db.getMessagesByOwner(ctx.user.id, input.taskId);
      }),

    getByParentId: protectedProcedure
      .input(z.object({ parentMessageId: z.number() }))
      .query(async ({ input, ctx }) => {
        const parent = await db.getMessageByIdForOwner(input.parentMessageId, ctx.user.id);
        if (!parent && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Mensagem não encontrada ou sem permissão." });
        }
        return ctx.user.role === "admin"
          ? db.getMessagesByParentId(input.parentMessageId)
          : db.getMessagesByParentIdForOwner(input.parentMessageId, ctx.user.id);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const message = await db.getMessageByIdForOwner(input.id, ctx.user.id);
        if (!message && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Mensagem não encontrada ou sem permissão." });
        }
        return db.markMessageAsRead(input.id);
      }),
  }),

  // ============================================
  // ACTIVITY LOGS ROUTER
  // ============================================
  activityLogs: router({
    create: publicProcedure
      .input(z.object({
        agentId: z.number(),
        taskId: z.number().optional(),
        eventTypeId: z.number(),
        details: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createActivityLog(input);
      }),

    getByAgent: protectedProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ input, ctx }) => {
        return db.getActivityLogsByAgentIdForOwner(input.agentId, ctx.user.id, ctx.user.role === "admin");
      }),

    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return db.getRecentActivityLogs(input.limit);
      }),
  }),

  // ============================================
  // CONTEXT REPORTS ROUTER
  // ============================================
  contextReports: router({
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        creditsUsed: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createContextReport({
          ownerId: ctx.user.id,
          title: input.title,
          content: input.content,
          creditsUsed: input.creditsUsed,
        });
      }),

    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input, ctx }) => {
        return db.getRecentContextReports(ctx.user.id, input.limit);
      }),

    updateGitHub: adminProcedure
      .input(z.object({
        id: z.number(),
        gitHubUrl: z.string().url(),
      }))
      .mutation(async ({ input }) => {
        return db.updateContextReportGitHub(input.id, input.gitHubUrl);
      }),
  }),

  // ============================================
  // ARC / PGC ROUTER
  // ============================================
  arc: router({
    ensureAssessment: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada." });
        }
        const assessment = await db.ensureArcAssessment(input.taskId);
        if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada." });
        return assessment;
      }),

    evaluateTask: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada." });
        }
        const assessment = await db.evaluateTaskInShadow(input.taskId);
        if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada." });
        return assessment;
      }),

    getAssessment: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .query(async ({ input, ctx }) => {
        const assessment = await db.getArcAssessmentByTask(input.taskId, ctx.user.id, ctx.user.role === "admin");
        if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Avaliação não encontrada." });
        return { ...assessment, evidence: assessment.evidence.map(({ metadata: _metadata, ...item }) => item) };
      }),

    listAssessments: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive(), limit: z.number().int().min(1).max(100).default(20) }))
      .query(async ({ input, ctx }) => {
        const assessments = await db.listArcAssessmentsByTask(input.taskId, ctx.user.id, ctx.user.role === "admin", input.limit);
        return assessments.map((assessment) => ({
          ...assessment,
          evidence: assessment.evidence.map(({ metadata: _metadata, ...item }) => item),
        }));
      }),

    listConfidenceSnapshots: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive(), limit: z.number().int().min(1).max(100).default(30) }))
      .query(async ({ input, ctx }) => {
        return db.listArcConfidenceSnapshotsByTask(input.taskId, ctx.user.id, ctx.user.role === "admin", input.limit);
      }),
  }),

  // ============================================
  // STATS & LOOKUPS
  // ============================================
  stats: router({
    getDashboard: protectedProcedure.query(async ({ ctx }) => {
      return db.getDashboardStats(ctx.user.id);
    }),
  }),

  lookups: router({
    listAll: protectedProcedure.query(async () => {
      return db.getLookups();
    }),
  }),

  // ============================================
  // EXTERNAL AGENTS ENDPOINTS
  // ============================================
  externalAgents: router({
    listStaged: publicProcedure
      .input(z.object({ agentId: z.number().int().positive() }))
      .query(async ({ input }) => {
        return db.getStagedTasksByAgentId(
          input.agentId,
          await db.getTaskStatusIdByName("STAGED")
        );
      }),

    createQuestion: publicProcedure
      .input(z.object({
        taskId: z.number(),
        agentId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        return db.createMessage({
          taskId: input.taskId,
          senderId: input.agentId,
          typeId: 1,
          content: input.content,
        });
      }),

    getAnswers: publicProcedure
      .input(z.object({ parentMessageId: z.number() }))
      .query(async ({ input }) => {
        return db.getMessagesByParentId(input.parentMessageId);
      }),

    logActivity: publicProcedure
      .input(z.object({
        agentId: z.number(),
        taskId: z.number().optional(),
        eventTypeId: z.number(),
        details: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createActivityLog(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
