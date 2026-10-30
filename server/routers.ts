import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { SofiaOrchestrator } from "./sofiaOrchestrator";
import { TRPCError } from "@trpc/server";
import { getConsolidatedTaskReport, uploadConsolidatedTaskReport } from "./controlPanelStorage";

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
      return db.getAgentsByOwnerId(ctx.user.id);
    }),

    listCredits: protectedProcedure.query(async ({ ctx }) => {
      const agents = await db.getAgentsByOwnerId(ctx.user.id);
      return Promise.all(agents.map(async (agent) => {
        const base = {
          id: agent.id,
          name: agent.name,
          manusAccount: agent.manusAccount ?? null,
          creditsUpdatedAt: agent.creditsUpdatedAt ?? null,
        };

        let credentials: Awaited<ReturnType<typeof db.getManusCredentialsForAgentForOwner>>;
        try {
          credentials = await db.getManusCredentialsForAgentForOwner(agent.id, ctx.user.id);
        } catch {
          return { ...base, creditsRemaining: null, sourceStatus: "error" as const, message: "Falha ao recuperar a credencial armazenada." };
        }

        if (!credentials?.manusToken) {
          return { ...base, creditsRemaining: null, sourceStatus: "not_configured" as const, message: "API key Manus não configurada." };
        }

        try {
          const response = await fetch("https://api.manus.ai/v2/usage.availableCredits", {
            method: "GET",
            headers: { "x-manus-api-key": credentials.manusToken },
            signal: AbortSignal.timeout(15000),
          });
          const payload = await response.json().catch(() => null) as {
            ok?: boolean;
            total_credits?: number | string;
            error?: { code?: string; message?: string };
          } | null;

          if (!response.ok || payload?.ok !== true) {
            const message = payload?.error?.message || `A Manus retornou HTTP ${response.status}.`;
            return { ...base, creditsRemaining: null, sourceStatus: response.status === 401 || response.status === 403 ? "authentication_error" as const : "error" as const, message };
          }

          const rawCredits = payload.total_credits;
          const credits = typeof rawCredits === "number" ? rawCredits : Number(rawCredits);
          if (rawCredits === undefined || rawCredits === null || !Number.isFinite(credits)) {
            return { ...base, creditsRemaining: null, sourceStatus: "invalid_response" as const, message: "A resposta Manus não trouxe total_credits válido." };
          }

          await db.updateAgentCredits(agent.id, credits.toFixed(2));
          return { ...base, creditsRemaining: credits, creditsUpdatedAt: new Date(), sourceStatus: "ok" as const, message: null };
        } catch (error) {
          return { ...base, creditsRemaining: null, sourceStatus: "error" as const, message: error instanceof Error ? error.message : "Falha ao consultar a Manus." };
        }
      }));
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
        return db.getAgentByIdForOwner(input.id, ctx.user.id);
      }),

    validateManusConnection: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        let credentials: Awaited<ReturnType<typeof db.getManusCredentialsForAgentForOwner>>;
        try {
          credentials = await db.getManusCredentialsForAgentForOwner(input.id, ctx.user.id);
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

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["online", "offline", "idle", "paused"]),
      }))
      .mutation(async ({ input }) => {
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
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getAllTasks(ctx.user.id);
    }),

    listAll: protectedProcedure.query(async ({ ctx }) => {
      return db.getAllTasks(ctx.user.id);
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
        return db.createTask({
          agentId: input.agentId,
          createdBy: ctx.user.id,
          title: input.title,
          description: input.description,
          statusId: input.statusId,
          priorityId: input.priorityId,
          parentTaskId: input.parentTaskId,
          dueDate: input.dueDate,
        });
      }),

    dispatchToManus: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada." });
        }
        if (task.externalTaskId) {
          throw new TRPCError({ code: "CONFLICT", message: "Esta missão já possui uma execução Manus vinculada." });
        }

        const stagedId = await db.getTaskStatusIdByName("STAGED");
        if (task.statusId !== stagedId) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Somente missões STAGED podem ser enviadas." });
        }

        const configuredAgents = task.agentId
          ? [await db.getAgentByIdForOwner(task.agentId, ctx.user.id)].filter(Boolean) as NonNullable<Awaited<ReturnType<typeof db.getAgentByIdForOwner>>>[]
          : await db.getAgentsByOwnerId(ctx.user.id);

        if (configuredAgents.length === 0) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Nenhum agente disponível foi cadastrado." });
        }

        const candidates: Array<{ id: number; token: string; credits: number | null }> = [];
        for (const agent of configuredAgents) {
          const credentials = await db.getManusCredentialsForAgentForOwner(agent.id, ctx.user.id);
          if (!credentials?.manusToken) {
            if (task.agentId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "O agente escolhido não possui API key Manus configurada." });
            continue;
          }

          if (task.agentId) {
            candidates.push({ id: agent.id, token: credentials.manusToken, credits: null });
            continue;
          }

          try {
            const creditResponse = await fetch("https://api.manus.ai/v2/usage.availableCredits", {
              headers: { "x-manus-api-key": credentials.manusToken },
              signal: AbortSignal.timeout(15000),
            });
            const creditPayload = await creditResponse.json().catch(() => null) as { ok?: boolean; total_credits?: number | string } | null;
            const balance = Number(creditPayload?.total_credits);
            if (creditResponse.ok && creditPayload?.ok === true && Number.isFinite(balance) && balance > 0) {
              candidates.push({ id: agent.id, token: credentials.manusToken, credits: balance });
            }
          } catch (error) {
            console.warn(`[Manus] Não foi possível consultar créditos do agente ${agent.id} para seleção automática:`, error);
          }
        }

        if (!task.agentId) candidates.sort((a, b) => (b.credits ?? 0) - (a.credits ?? 0));
        if (candidates.length === 0) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: task.agentId ? "Credencial Manus indisponível para o agente escolhido." : "Nenhum agente possui créditos Manus disponíveis e consulta válida." });
        }

        let lastError = "A Manus não aceitou a criação da tarefa.";
        for (const candidate of candidates) {
          try {
            const response = await fetch("https://api.manus.ai/v2/task.create", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-manus-api-key": candidate.token,
              },
              body: JSON.stringify({
                title: task.title,
                message: {
                  content: [{
                    type: "text",
                    text: [task.title, task.description || ""].filter(Boolean).join("\n\n"),
                    visibility: "visible",
                  }],
                },
                locale: "pt-BR",
                agent_profile: "standard",
                share_visibility: "private",
              }),
              signal: AbortSignal.timeout(30000),
            });
            const payload = await response.json().catch(() => null) as {
              ok?: boolean;
              task_id?: string;
              error?: { code?: string; message?: string };
            } | null;

            if (!response.ok || payload?.ok !== true || !payload.task_id) {
              const code = payload?.error?.code || "";
              lastError = payload?.error?.message || `A Manus retornou HTTP ${response.status}.`;
              const insufficientCredits = /credit|quota|balance|insufficient/i.test(`${code} ${lastError}`);
              if (!task.agentId && insufficientCredits) continue;
              throw new TRPCError({
                code: response.status === 401 || response.status === 403 ? "UNAUTHORIZED" : "BAD_GATEWAY",
                message: lastError,
              });
            }

            await db.updateTaskExternalId(task.id, payload.task_id, candidate.id);
            await db.updateTaskStatus(task.id, await db.getTaskStatusIdByName("PROGRESS"));
            return {
              ok: true,
              agentId: candidate.id,
              externalTaskId: payload.task_id,
            };
          } catch (error) {
            if (error instanceof TRPCError) throw error;
            lastError = error instanceof Error ? error.message : lastError;
            if (task.agentId) break;
          }
        }

        throw new TRPCError({ code: "BAD_GATEWAY", message: lastError });
      }),

    getManusExecution: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive() }))
      .query(async ({ input, ctx }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task || (task.createdBy !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Missão não encontrada." });
        }
        if (!task.externalTaskId || !task.agentId) return null;

        const credentials = await db.getManusCredentialsForAgentForOwner(task.agentId, ctx.user.id);
        if (!credentials?.manusToken) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A credencial Manus do agente vinculado não está disponível." });
        }

        const headers = { "x-manus-api-key": credentials.manusToken };
        const [detailResponse, messagesResponse] = await Promise.all([
          fetch(`https://api.manus.ai/v2/task.detail?task_id=${encodeURIComponent(task.externalTaskId)}`, { headers, signal: AbortSignal.timeout(15000) }),
          fetch(`https://api.manus.ai/v2/task.listMessages?task_id=${encodeURIComponent(task.externalTaskId)}&order=asc&limit=100`, { headers, signal: AbortSignal.timeout(15000) }),
        ]);
        const detailPayload = await detailResponse.json().catch(() => null) as { ok?: boolean; task?: { status?: string; has_running_background_jobs?: boolean; task_url?: string } ; error?: { message?: string } } | null;
        const messagesPayload = await messagesResponse.json().catch(() => null) as { ok?: boolean; messages?: Array<Record<string, any>>; error?: { message?: string } } | null;

        if (!detailResponse.ok || detailPayload?.ok !== true || !detailPayload.task) {
          throw new TRPCError({ code: "BAD_GATEWAY", message: detailPayload?.error?.message || `Falha ao consultar execução Manus (HTTP ${detailResponse.status}).` });
        }
        if (!messagesResponse.ok || messagesPayload?.ok !== true) {
          throw new TRPCError({ code: "BAD_GATEWAY", message: messagesPayload?.error?.message || `Falha ao consultar mensagens Manus (HTTP ${messagesResponse.status}).` });
        }

        const remoteStatus = detailPayload.task.status || "unknown";
        if (remoteStatus === "error") {
          await db.updateTaskStatus(task.id, await db.getTaskStatusIdByName("FAIL"));
        } else if (remoteStatus === "stopped" && !detailPayload.task.has_running_background_jobs) {
          await db.updateTaskStatus(task.id, await db.getTaskStatusIdByName("DONE"));
        }

        return {
          externalTaskId: task.externalTaskId,
          taskUrl: detailPayload.task.task_url || null,
          status: remoteStatus,
          hasRunningBackgroundJobs: Boolean(detailPayload.task.has_running_background_jobs),
          messages: (messagesPayload.messages || []).map((event) => ({
            id: event.id,
            type: event.type,
            timestamp: event.timestamp,
            content: event.assistant_message?.content
              || event.user_message?.content
              || event.error_message?.content
              || event.status_update?.description
              || event.status_update?.brief
              || event.explanation?.content
              || event.structured_output_result?.value
              || (event.type === "status_update" ? `Status: ${event.status_update?.agent_status || "atualizando"}` : ""),
            attachments: event.assistant_message?.attachments || [],
          })),
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
        return db.getTasksByAgentIdForOwner(input.agentId, ctx.user.id);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        statusId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return db.updateTaskStatus(input.id, input.statusId);
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
        taskId: z.number(),
        parentMessageId: z.number().optional(),
        typeId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createMessage({
          taskId: input.taskId,
          senderId: ctx.user.id,
          parentMessageId: input.parentMessageId,
          typeId: input.typeId,
          content: input.content,
        });
      }),

    getByTask: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => {
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
        return db.getActivityLogsByAgentIdForOwner(input.agentId, ctx.user.id);
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
