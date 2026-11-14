import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { SofiaOrchestrator } from "./sofiaOrchestrator";
import { TRPCError } from "@trpc/server";
import { getConsolidatedTaskReport, uploadConsolidatedTaskReport } from "./controlPanelStorage";
import { sendManusMessageAndWait, syncAgentCredits } from "./manusExecutionService";
import { mirrorTaskToGitHub } from "./githubMissionMirror";
import { invokeLLM } from "./_core/llm";
import { buildSofiaConversation, extractTextContent, normalizeOperatorMessage, OPERATOR_MESSAGE_MAX_LENGTH, SOFIA_MESSAGE_TOOLS } from "./messageService";
import { validateMissionBlueprintContent } from "./missionBlueprint";

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
      reviseInitialTR: protectedProcedure.input(z.object({ taskId: z.number().int().positive(), content: z.string().trim().min(1).max(50000) }))
        .mutation(async ({ input, ctx }) => {
          const task = await db.getTaskById(input.taskId);
          if (!task || task.createdBy !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND", message: "Somente o operador que criou a missão pode corrigir ou validar seu TR." });
          if (task.parentTaskId != null) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "O TR pertence à missão principal; tarefas-filhas não podem alterá-lo." });
          if (task.manusTaskId || task.manusStatus !== "awaiting_tr_validation") {
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
        if (task.statusId !== pausedStatusId || task.manusTaskId || task.manusStatus !== "awaiting_tr_validation") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A regeneração do TR só pode ocorrer enquanto a missão estiver no gate inicial de validação." });
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
        if (task.statusId !== pausedStatusId || task.manusTaskId || task.manusStatus !== "awaiting_tr_validation") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A validação inicial do TR só pode liberar uma missão ainda no gate inicial de validação." });
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
        const stagedStatusId = await db.getTaskStatusIdByName("STAGED");
        await db.updateTaskStatus(input.taskId, stagedStatusId);
        return { validatedVersion: validated.version, statusId: stagedStatusId };
      }),
      generateBlueprint: protectedProcedure.input(z.object({ taskId: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || task.createdBy !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND", message: "Somente o operador que criou a missão pode liberar seu plano de trabalho." });
        const pausedStatusId = await db.getTaskStatusIdByName("PAUSED");
        if (task.statusId !== pausedStatusId || task.manusTaskId || task.manusStatus !== "awaiting_tr_validation") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A geração/retenção do Blueprint só pode liberar uma missão ainda no gate inicial de validação." });
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
        const stagedStatusId = await db.getTaskStatusIdByName("STAGED");
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
        return uploadConsolidatedTaskReport(input.taskId, report);
      }),

    getConsolidatedReport: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .query(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada." });
        }
        return getConsolidatedTaskReport(input.taskId);
      }),
  }),

  // ============================================
  // MESSAGES ROUTER
  // ============================================
  messages: router({
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
        if (input.parentMessageId !== undefined) {
          const parentMessage = await db.getMessageByIdForTask(input.parentMessageId, input.taskId);
          if (!parentMessage) {
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
        const previousMessages = await db.getMessagesByTaskId(input.taskId, 30);

        let assistantContent: string;
        let responseStatus: "replied" | "pending" | "failed" = "replied";
        try {
          const response = await invokeLLM({
            messages: buildSofiaConversation(task, previousMessages),
            tools: SOFIA_MESSAGE_TOOLS,
            toolChoice: "auto",
          });
          const assistantTurn = response.choices?.[0]?.message;
          const forwardCall = assistantTurn?.tool_calls?.find(
            (call) => call.function.name === "forward_operator_instruction_to_assigned_agent"
          );

          if (forwardCall) {
            let toolArgs: { message?: string };
            try {
              toolArgs = JSON.parse(forwardCall.function.arguments) as { message?: string };
            } catch {
              throw new Error("A Sofia retornou argumentos inválidos para o encaminhamento.");
            }

            const forwardedMessage = toolArgs.message?.trim();
            if (!forwardedMessage || forwardedMessage.length > OPERATOR_MESSAGE_MAX_LENGTH) {
              throw new Error("A Sofia produziu uma instrução vazia ou acima do limite permitido.");
            }
            if (!task.agentId || !task.manusTaskId) {
              assistantContent = "Entendi que você deseja encaminhar uma instrução, mas esta missão não possui agente atribuído e execução externa identificada. Não enviei a mensagem.";
              responseStatus = "failed";
            } else if (!(await db.hasExecutionReadyMissionDocuments(input.taskId))) {
              assistantContent = "A instrução não foi enviada: a missão ainda não possui TR validado e Blueprint READY vinculado à versão vigente.";
              responseStatus = "failed";
            } else {
              const externalReply = await sendManusMessageAndWait(task, forwardedMessage);
              assistantContent = externalReply
                ? `A instrução foi encaminhada à execução externa associada a esta missão. Resposta recebida:\n\n${externalReply}`
                : "A solicitação de envio foi encaminhada à integração Manus, mas não foi possível confirmar uma resposta da execução dentro da janela de consulta. Isso não comprova leitura ou processamento.";
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
          typeId: input.typeId,
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
        return db.getMessagesByTaskId(input.taskId);
      }),

    getByParentId: publicProcedure
      .input(z.object({ parentMessageId: z.number() }))
      .query(async ({ input }) => {
        return db.getMessagesByParentId(input.parentMessageId);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
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
