import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, ChevronLeft, Zap, FileText, AlertCircle, Download, ShieldCheck, RefreshCw, Info, Play } from "lucide-react";
import { toast } from "sonner";

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const parsedTaskId = Number(id);
  const taskId = Number.isInteger(parsedTaskId) && parsedTaskId > 0 ? parsedTaskId : 0;
  const canLoadTask = isAuthenticated && taskId > 0;

  // Não iniciar consultas protegidas antes de a sessão estar resolvida.
  // Sem retry automático: falhas devem ser exibidas, não parecer carregamento infinito.
  const taskQuery = trpc.tasks.getById.useQuery(
    { id: taskId },
    { enabled: canLoadTask, retry: false, refetchOnWindowFocus: false },
  );
  const assignedAgentId = taskQuery.data?.agentId ?? null;
  const assignedAgentQuery = trpc.agents.getById.useQuery(
    { id: assignedAgentId ?? 0 },
    {
      enabled: canLoadTask && assignedAgentId !== null,
      retry: false,
    },
  );
  const messagesQuery = trpc.messages.getByTask.useQuery(
    { taskId },
    { enabled: canLoadTask && Boolean(taskQuery.data), retry: false },
  );
  // A conversa pertence à missão-raiz, mesmo quando o operador abre uma tarefa-filha.
  const missionRootTaskId = taskQuery.data?.parentTaskId ?? taskId;
  const missionMessagesQuery = trpc.messages.getByTask.useQuery(
    { taskId: missionRootTaskId },
    {
      enabled: canLoadTask && Boolean(taskQuery.data),
      retry: false,
      refetchInterval: 5000,
    },
  );
  const [messageContent, setMessageContent] = useState("");
  const createMissionMessageMutation = trpc.messages.create.useMutation();
  const pauseExecutionMutation = trpc.tasks.pauseExecution.useMutation({
    onSuccess: async (result) => {
      await taskQuery.refetch();
      if (result.paused) {
        toast.success("Execução externa pausada e confirmada pela Manus.");
      } else {
        toast.warning("Pausa solicitada, mas ainda há processos em segundo plano ativos ou sem confirmação. A missão permanece em PROGRESS.");
      }
    },
    onError: (error) => toast.error(error.message || "Não foi possível pausar a execução."),
  });
  const resumeExecutionMutation = trpc.tasks.resumeExecution.useMutation({
    onSuccess: async (result) => {
      await taskQuery.refetch();
      if (result.resumed) {
        toast.success("Retomada confirmada pela Manus.");
      } else {
        toast.warning("A instrução de retomada foi enviada, mas a Manus ainda não confirmou running. A tarefa permanece PAUSED.");
      }
    },
    onError: (error) => toast.error(error.message || "Não foi possível retomar a execução."),
  });
  const lookupsQuery = trpc.lookups.listAll.useQuery(
    undefined,
    { enabled: canLoadTask && Boolean(taskQuery.data), retry: false },
  );
  const statuses = lookupsQuery.data?.statuses ?? [];
  const priorities = lookupsQuery.data?.priorities ?? [];
  const subtasksQuery = trpc.tasks.getChildren.useQuery(
    { taskId },
    {
      enabled: canLoadTask && Boolean(taskQuery.data) && !taskQuery.data?.parentTaskId,
      retry: false,
    },
  );
  const subtasks = subtasksQuery.data ?? [];
  const [isStarting, setIsStarting] = useState(false);
  const [isFactorizing, setIsFactorizing] = useState(false);
  const [isConsolidating, setIsConsolidating] = useState(false);

  const factorizeTaskMutation = trpc.tasks.factorize.useMutation();
  const startTaskMutation = trpc.tasks.start.useMutation();
  const consolidateTaskMutation = trpc.tasks.consolidate.useMutation();
  const updateStatusMutation = trpc.tasks.updateStatus.useMutation();
  const arcAssessmentQuery = trpc.arc.getAssessment.useQuery(
    { taskId },
    { enabled: canLoadTask && Boolean(taskQuery.data), retry: false },
  );
  const arcConfidenceQuery = trpc.arc.listConfidenceSnapshots.useQuery(
    { taskId, limit: 30 },
    { enabled: canLoadTask && Boolean(taskQuery.data), retry: false },
  );
  const evaluateArcMutation = trpc.arc.evaluateTask.useMutation({
    onSuccess: () => Promise.all([arcAssessmentQuery.refetch(), arcConfidenceQuery.refetch()]),
  });
  const ensureArcAssessmentMutation = trpc.arc.ensureAssessment.useMutation({
    onSuccess: () => Promise.all([arcAssessmentQuery.refetch(), arcConfidenceQuery.refetch()]),
    onError: (error) => toast.error(error.message || "Não foi possível gerar o relatório ARC."),
  });
  const autoEnsureArcTaskRef = useRef<number | null>(null);
  const consolidatedReportQuery = trpc.tasks.getConsolidatedReport.useQuery(
    { taskId },
    { enabled: canLoadTask && Boolean(taskQuery.data), retry: false },
  );
  const documentsQuery = trpc.tasks.documents.list.useQuery(
    { taskId },
    { enabled: canLoadTask && Boolean(taskQuery.data), retry: false },
  );
  const initializeLegacyTRMutation = trpc.tasks.documents.initializeLegacyTR.useMutation({
    onSuccess: async (result) => {
      setSelectedDocumentId(result.documentId);
      setSelectedVersionNumber(null);
      await documentsQuery.refetch();
      toast.success(result.alreadyExists ? "O TR desta missão já estava persistido." : "TR reconstruído a partir dos registros disponíveis. Revise antes de validar.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível reconstruir o TR."),
  });
  const generateFORMutation = trpc.tasks.documents.generateFOR.useMutation({
    onSuccess: async (result) => {
      setSelectedDocumentId(result.documentId);
      setSelectedVersionNumber(null);
      await documentsQuery.refetch();
      toast.success(result.alreadyExists ? "O FOR desta missão já estava persistido." : "FOR gerado a partir dos registros e evidências disponíveis.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível gerar o FOR."),
  });
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [selectedVersionNumber, setSelectedVersionNumber] = useState<number | null>(null);
  const [selectedActionUnitId, setSelectedActionUnitId] = useState<string | null>(null);
  const [trCorrection, setTrCorrection] = useState("");
  const documents = documentsQuery.data ?? [];
  const selectedDocument = documents.find((document) => document.id === selectedDocumentId)
    ?? documents.find((document) => document.typeKey === "TR" && document.documentKey === "TR")
    ?? null;
  const selectedVersion = selectedVersionNumber ?? selectedDocument?.latestVersion?.version ?? 0;
  const trDocument = documents.find((document) => document.typeKey === "TR" && document.documentKey === "TR");
  const blueprintDocument = documents.find((document) => document.typeKey === "BLUEPRINT" && document.documentKey === "BLUEPRINT");
  const blueprintReady = Boolean(
    trDocument?.latestVersion
    && ["VALIDATED", "ACTIVE", "REORIENTED"].includes(trDocument.latestVersion.state)
    && blueprintDocument?.latestVersion
    && ["READY", "ACTIVE"].includes(blueprintDocument.latestVersion.state)
    && blueprintDocument.latestVersion.sourceDocumentVersionId === trDocument.latestVersion.id
  );
  const documentHistoryQuery = trpc.tasks.documents.history.useQuery(
    { taskId, documentId: selectedDocument?.id ?? 0 },
    { enabled: canLoadTask && Boolean(selectedDocument?.id), retry: false },
  );
  const selectedDocumentVersionQuery = trpc.tasks.documents.getVersion.useQuery(
    {
      taskId,
      documentId: selectedDocument?.id ?? 0,
      version: selectedVersion,
    },
    { enabled: canLoadTask && Boolean(selectedDocument?.latestVersion) && selectedVersion > 0, retry: false },
  );
  const actionPlanUnits = (() => {
    if (selectedDocument?.typeKey !== "ACTION_PLAN") return [];
    try {
      const parsed = JSON.parse(selectedDocumentVersionQuery.data?.version.content ?? "{}");
      return Array.isArray(parsed.tasks) ? parsed.tasks : [];
    } catch {
      return [];
    }
  })();
  const activeActionUnitId = selectedActionUnitId ?? actionPlanUnits[0]?.id ?? "T01";
  const actionUnitGateMutation = trpc.tasks.documents.evaluateActionPlanUnit.useMutation();
  const actionPlanUnitRecordsQuery = trpc.tasks.documents.listActionPlanUnits.useQuery(
    { taskId },
    {
      enabled: canLoadTask
        && selectedDocument?.typeKey === "ACTION_PLAN"
        && selectedDocument.latestVersion?.state === "APPROVED"
        && selectedVersion === selectedDocument.latestVersion.version,
      retry: false,
    },
  );
  const registerActionPlanUnitsMutation = trpc.tasks.documents.registerActionPlanUnits.useMutation({
    onSuccess: async () => {
      await actionPlanUnitRecordsQuery.refetch();
      toast.success("Unidades registradas. Cada uma aguarda aprovação individual; nenhuma tarefa foi criada.");
    },
    onError: (error) => toast.error(error.message),
  });
  const approveActionPlanUnitMutation = trpc.tasks.documents.approveActionPlanUnit.useMutation({
    onSuccess: async () => {
      await actionPlanUnitRecordsQuery.refetch();
      toast.success("Aprovação individual registrada. Isso não libera execução nem dispatch.");
    },
    onError: (error) => toast.error(error.message),
  });

  const materializeActionPlanUnitsMutation = trpc.tasks.documents.materializeApprovedActionPlanUnits.useMutation({
    onSuccess: async (result) => {
      await Promise.all([actionPlanUnitRecordsQuery.refetch(), subtasksQuery.refetch()]);
      const createdCount = result.units.filter((unit) => unit.created).length;
      toast.success(`${createdCount} tarefa(s) materializada(s) em PAUSED. Nenhum agente foi atribuído e nenhum dispatch ocorreu.`);
    },
    onError: (error) => toast.error(error.message),
  });

  const reviseInitialTRMutation = trpc.tasks.documents.reviseInitialTR.useMutation({
    onSuccess: async () => {
      setSelectedVersionNumber(null);
      await documentsQuery.refetch();
      toast.success("Correção registrada em nova versão do TR.");
    },
    onError: (error) => toast.error(error.message),
  });
  const regenerateInitialTRMutation = trpc.tasks.documents.regenerateInitialTR.useMutation({
    onSuccess: async () => {
      setSelectedVersionNumber(null);
      await documentsQuery.refetch();
      toast.success("Nova versão inicial do TR gerada pela SOFIA.");
    },
    onError: (error) => toast.error(error.message),
  });
  const validateTRMutation = trpc.tasks.documents.validateTR.useMutation({
    onSuccess: async () => {
      setSelectedVersionNumber(null);
      await Promise.all([documentsQuery.refetch(), taskQuery.refetch()]);
      toast.success("TR validado, Blueprint gerado e missão liberada para STAGED.");
    },
    onError: async (error) => {
      setSelectedVersionNumber(null);
      await Promise.all([documentsQuery.refetch(), taskQuery.refetch()]);
      toast.error(error.message);
    },
  });
  const generateBlueprintMutation = trpc.tasks.documents.generateBlueprint.useMutation({
    onSuccess: async () => {
      setSelectedVersionNumber(null);
      await Promise.all([documentsQuery.refetch(), taskQuery.refetch()]);
      toast.success("Blueprint READY, vinculado à versão vigente do TR. Missão liberada.");
    },
    onError: async (error) => {
      setSelectedVersionNumber(null);
      await Promise.all([documentsQuery.refetch(), taskQuery.refetch()]);
      toast.error(error.message);
    },
  });

  const generateActionPlanMutation = trpc.tasks.documents.generateActionPlan.useMutation({
    onSuccess: async (result) => {
      setSelectedDocumentId(result.documentId);
      setSelectedVersionNumber(null);
      await documentsQuery.refetch();
      toast.success("Plano de ação estruturado proposto e versionado. Nenhuma execução foi iniciada.");
    },
    onError: (error) => toast.error(error.message),
  });
  const approveActionPlanMutation = trpc.tasks.documents.approveActionPlan.useMutation({
    onSuccess: async () => {
      setSelectedVersionNumber(null);
      await documentsQuery.refetch();
      toast.success("Aprovação humana registrada para esta versão exata. Nenhuma execução foi iniciada.");
    },
    onError: (error) => toast.error(error.message),
  });

  const task = taskQuery.data;
  const messages = messagesQuery.data || [];
  const missionMessages = (missionMessagesQuery.data || []).filter((message) => message.typeId === 1);

  const handleSendMissionMessage = async () => {
    const content = messageContent.trim();
    if (!content || !missionRootTaskId || createMissionMessageMutation.isPending) return;

    try {
      const result = await createMissionMessageMutation.mutateAsync({
        taskId: missionRootTaskId,
        typeId: 1,
        content,
      });
      setMessageContent("");
      await missionMessagesQuery.refetch();
      if (result.responseStatus === "replied") {
        toast.success("SOFIA respondeu no Messenger da missão.");
      } else if (result.responseStatus === "pending") {
        toast.info("Mensagem registrada. A resposta externa ainda está pendente.");
      } else {
        toast.warning("Mensagem registrada, mas a SOFIA não conseguiu concluir a resposta.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar a mensagem.");
    }
  };

  useEffect(() => {
    setSelectedVersionNumber(null);
    setSelectedActionUnitId(null);
  }, [selectedDocument?.id]);

  useEffect(() => {
    const content = selectedDocumentVersionQuery.data?.version.content;
    if (typeof content === "string") setTrCorrection(content);
  }, [selectedDocumentVersionQuery.data?.version.id]);

  useEffect(() => {
    const assessmentNotFound = arcAssessmentQuery.isError
      && arcAssessmentQuery.error?.data?.code === "NOT_FOUND";
    if (!canLoadTask || !taskQuery.data || arcAssessmentQuery.isLoading || !assessmentNotFound) return;
    if (autoEnsureArcTaskRef.current === taskId || ensureArcAssessmentMutation.isPending) return;

    autoEnsureArcTaskRef.current = taskId;
    ensureArcAssessmentMutation.mutate({ taskId });
  }, [
    canLoadTask,
    taskId,
    taskQuery.data,
    arcAssessmentQuery.isLoading,
    arcAssessmentQuery.isError,
    arcAssessmentQuery.error,
    ensureArcAssessmentMutation.isPending,
  ]);

  const handleFactorize = async () => {
    setIsFactorizing(true);
    try {
      await factorizeTaskMutation.mutateAsync({ taskId });
      // Recarregar dados
      await Promise.all([taskQuery.refetch(), messagesQuery.refetch(), subtasksQuery.refetch()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível fatorizar a missão.");
    } finally {
      setIsFactorizing(false);
    }
  };

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const result = await startTaskMutation.mutateAsync({ taskId });
      await Promise.all([taskQuery.refetch(), messagesQuery.refetch(), subtasksQuery.refetch(), consolidatedReportQuery.refetch()]);
      if (result?.started) {
        toast.success(result.factorized ? "Missão iniciada e fatorada em subtarefas." : "Missão iniciada.");
      } else if (result?.waitingForAgent) {
        toast.info("A missão continua em STAGED, mas não há agente elegível com créditos disponíveis e atualizados. Verifique a conexão e o saldo dos agentes.");
      } else {
        toast.info("A missão já não está em STAGED; nenhum reinício foi necessário.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível iniciar a missão.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleConsolidate = async () => {
    setIsConsolidating(true);
    try {
      await consolidateTaskMutation.mutateAsync({ taskId });
      await consolidatedReportQuery.refetch();
    } catch (error) {
      console.error("Erro ao consolidar:", error);
    } finally {
      setIsConsolidating(false);
    }
  };

  const handleArcEvaluation = async () => {
    await evaluateArcMutation.mutateAsync({ taskId });
  };

  const getStatusBadge = (statusId: number) => {
    const statusName = statuses.find((status) => status.id === statusId)?.name || `Status ${statusId}`;
    const colorMap: Record<string, string> = {
      STAGED: "bg-yellow-500/20 text-yellow-500",
      PROGRESS: "bg-blue-500/20 text-blue-500",
      PAUSED: "bg-orange-500/20 text-orange-500",
      DONE: "bg-green-500/20 text-green-500",
      FAIL: "bg-red-500/20 text-red-500",
    };
    const normalizedName = statusName.toUpperCase();
    return <Badge className={colorMap[normalizedName] || "bg-gray-500/20 text-gray-500"}>{normalizedName}</Badge>;
  };

  const getPriorityLabel = (priorityId: number) => {
    return priorities.find((priority) => priority.id === priorityId)?.name || `Prioridade ${priorityId}`;
  };

  const getArcDecisionClass = (decision?: string) => {
    if (decision === "ALLOW") return "bg-green-500/20 text-green-500 border-green-500/30";
    if (decision === "DENY") return "bg-red-500/20 text-red-500 border-red-500/30";
    return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
  };

  if (authLoading || (canLoadTask && taskQuery.isLoading)) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-live="polite">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <span className="sr-only">Carregando missão...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="px-6 py-8">
          <Card className="cad-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <p>Sessão não autenticada. Entre novamente para consultar esta missão.</p>
              </div>
              <Button className="mt-4" onClick={() => navigate("/")}>Ir para o início</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!taskId) {
    return (
      <DashboardLayout>
        <div className="px-6 py-8">
          <Card className="cad-card">
            <CardContent className="pt-6">
              <p className="text-red-500">Identificador de missão inválido.</p>
              <Button className="mt-4" onClick={() => navigate("/tasks")}>Voltar às missões</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (taskQuery.isError) {
    return (
      <DashboardLayout>
        <div className="px-6 py-8">
          <Card className="cad-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertCircle className="w-5 h-5" /> Falha ao carregar missão
              </CardTitle>
              <CardDescription>{taskQuery.error.message}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button onClick={() => void taskQuery.refetch()} disabled={taskQuery.isFetching}>
                {taskQuery.isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tentar novamente
              </Button>
              <Button variant="outline" onClick={() => navigate("/tasks")}>Voltar às missões</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout>
        <div className="px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="cad-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                  <p>Tarefa não encontrada</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const operationalReports = messages.filter(m => m.typeId === 2); // OperationalReport type
  const currentStatusName = statuses.find((status) => status.id === task.statusId)?.name.toUpperCase();
  const externalStatusLabels: Record<string, string> = {
    running: "Em execução",
    completed: "Concluída",
    stopped: "Interrompida",
    error: "Erro",
    awaiting_tr_validation: "Aguardando validação do TR",
    waiting_for_available_agent: "Aguardando agente elegível",
    waiting_for_pinned_agent: "Aguardando agente fixado",
    manual_pause_pending: "Pausa solicitada — aguardando processos em segundo plano",
    manual_resume_pending: "Retomada solicitada — aguardando confirmação externa",
  };
  const externalStatusLabel = task.manusStatus
    ? externalStatusLabels[task.manusStatus.toLowerCase()] ?? task.manusStatus.replace(/_/g, " ")
    : task.manusTaskId ? "Estado não informado" : "Não iniciada";
  const canStartExecution = currentStatusName === "STAGED" && !task.manusTaskId;
  const canReorientTR = ["PAUSED", "STAGED"].includes(currentStatusName ?? "") && !task.manusTaskId && task.parentTaskId == null;
  const canFactorize = task.parentTaskId == null && ["STAGED", "PROGRESS"].includes(currentStatusName ?? "") && blueprintReady;

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/tasks")}
                className="text-accent hover:text-accent/80"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{task.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">ID: #{task.id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(task.statusId)}
              <Badge variant="outline">{getPriorityLabel(task.priorityId)}</Badge>
            </div>
          </div>

          {/* Main Content */}
          {/* Mission document viewer — TR is the default human-facing view. */}
          <Card className="cad-card mb-6">
            <CardHeader className="border-b border-foreground/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {selectedDocument?.typeKey === "TR" ? "TR — Termo de Referência" : "Documentos da missão"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {selectedDocument?.typeKey === "TR"
                      ? "Esta é a leitura estruturada da SOFIA sobre o pedido: objetivo, motivação, escopo e resultado esperado. Não é apenas a descrição original."
                      : "Contexto, planejamento e registros da missão em um único visualizador."}
                    {task.parentTaskId != null && " Este documento é herdado da missão principal."}
                  </CardDescription>
                </div>
                <div className="w-full sm:max-w-sm">
                  <label htmlFor="mission-document-select" className="mb-1 block text-xs text-muted-foreground">Documento</label>
                  <select
                    id="mission-document-select"
                    className="cad-box w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={selectedDocument?.id ?? ""}
                    onChange={(event) => {
                      setSelectedDocumentId(event.target.value ? Number(event.target.value) : null);
                      setSelectedVersionNumber(null);
                    }}
                    disabled={documentsQuery.isLoading || documents.length === 0}
                  >
                    {documents.length === 0 && <option value="">Nenhum documento disponível</option>}
                    {documents.map((document) => (
                      <option key={document.id} value={document.id}>
                        {document.typeLabel} — {document.title}
                      </option>
                    ))}
                  </select>
                  {currentStatusName === "DONE" && !documents.some((document) => document.typeKey === "FOR") && task.parentTaskId == null && (
                    <Button
                      className="mt-2 w-full"
                      variant="outline"
                      onClick={() => generateFORMutation.mutate({ taskId })}
                      disabled={generateFORMutation.isPending}
                    >
                      {generateFORMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Gerar FOR — Relatório final
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {documentsQuery.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Carregando documentos...</div>
              ) : documentsQuery.isError ? (
                <div className="rounded-md border border-red-500/30 p-4 text-sm text-red-500">
                  Não foi possível carregar o catálogo documental. {documentsQuery.error.message}
                </div>
              ) : !selectedDocument ? (
                <div className="rounded-md border border-dashed p-5 text-sm text-muted-foreground space-y-3">
                  <p>O TR ainda não está persistido para esta missão. Se ela foi criada antes do catálogo documental, a SOFIA pode reconstruí-lo usando apenas os campos e registros disponíveis, identificando lacunas e sem inventar a motivação original ou resultados.</p>
                  {task.parentTaskId == null ? (
                    <Button
                      variant="outline"
                      onClick={() => initializeLegacyTRMutation.mutate({ taskId })}
                      disabled={initializeLegacyTRMutation.isPending}
                    >
                      {initializeLegacyTRMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Reconstruir TR desta missão
                    </Button>
                  ) : (
                    <p>Abra a missão principal para iniciar a reconstrução documental.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{selectedDocument.typeKey}</Badge>
                    {selectedDocument.latestVersion ? (
                      <>
                        <Badge variant="secondary">v{selectedVersion}</Badge>
                        <Badge variant="outline">{selectedDocumentVersionQuery.data?.version.state ?? selectedDocument.latestVersion.state}</Badge>
                        <span>Atualizado em {new Date(selectedDocumentVersionQuery.data?.version.createdAt ?? selectedDocument.latestVersion.createdAt).toLocaleString()}</span>
                        {documentHistoryQuery.data && documentHistoryQuery.data.length > 1 && (
                          <label className="ml-auto flex items-center gap-2">
                            <span>Histórico</span>
                            <select
                              className="rounded-md border bg-background px-2 py-1 text-xs"
                              value={selectedVersion}
                              onChange={(event) => setSelectedVersionNumber(Number(event.target.value))}
                            >
                              {documentHistoryQuery.data.map((version) => (
                                <option key={version.id} value={version.version}>v{version.version} — {version.state}</option>
                              ))}
                            </select>
                          </label>
                        )}
                      </>
                    ) : <Badge variant="outline">Sem versão publicada</Badge>}
                  </div>
                  {selectedDocumentVersionQuery.isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Carregando versão...</div>
                  ) : selectedDocumentVersionQuery.isError ? (
                    <p className="text-sm text-red-500">{selectedDocumentVersionQuery.error.message}</p>
                  ) : (
                    <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap break-words rounded-md border bg-muted/20 p-4 font-sans text-sm leading-6 text-foreground">
                      {selectedDocumentVersionQuery.data?.version.content ?? "Conteúdo não disponível."}
                    </pre>
                  )}
                  {blueprintReady && selectedDocument.typeKey !== "ACTION_PLAN" && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => generateActionPlanMutation.mutate({ taskId })}
                        disabled={generateActionPlanMutation.isPending}
                      >
                        {generateActionPlanMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Propor plano de ação estruturado
                      </Button>
                    </div>
                  )}
                  {selectedDocument.typeKey === "ACTION_PLAN"
                    && selectedVersion === selectedDocument.latestVersion?.version
                    && selectedDocument.latestVersion?.state === "PROPOSED" && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
                      <div>
                        <p className="text-sm font-semibold">Aprovação humana necessária</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          A aprovação ficará vinculada ao hash e à versão exibida. Ela não inicia tarefas, reserva agentes ou autoriza consumo de créditos.
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          const version = selectedDocumentVersionQuery.data?.version;
                          if (!version?.contentHash) {
                            toast.error("Hash da versão indisponível. Recarregue o documento antes de aprovar.");
                            return;
                          }
                          approveActionPlanMutation.mutate({
                            taskId,
                            documentId: selectedDocument.id,
                            expectedVersion: version.version,
                            expectedContentHash: version.contentHash,
                          });
                        }}
                        disabled={approveActionPlanMutation.isPending || !selectedDocumentVersionQuery.data?.version.contentHash}
                      >
                        {approveActionPlanMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Aprovar esta versão
                      </Button>
                    </div>
                  )}
                  {selectedDocument.typeKey === "ACTION_PLAN" && selectedDocument.latestVersion?.state === "APPROVED" && (
                    <div className="rounded-md border border-green-500/30 p-3 text-sm text-green-600">
                      Aprovação humana registrada. O plano permanece sem execução; cada ação operacional exige seu próprio gate governado.
                    </div>
                  )}

                  {selectedDocument.typeKey === "ACTION_PLAN"
                    && selectedDocument.latestVersion?.state === "APPROVED"
                    && selectedVersion === selectedDocument.latestVersion.version && actionPlanUnits.length > 0 && (
                    <div className="space-y-3 rounded-md border p-4">
                      <div>
                        <p className="text-sm font-semibold">Governança individual das unidades</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Registre as unidades deste plano aprovado e aprove cada uma separadamente. A aprovação confirma o escopo; não autoriza execução, reserva de agente, crédito ou dispatch.
                        </p>
                      </div>
                      {actionPlanUnitRecordsQuery.isLoading && (
                        <p className="text-xs text-muted-foreground">Carregando registros de governança...</p>
                      )}
                      {actionPlanUnitRecordsQuery.isError && (
                        <p className="text-sm text-destructive">{actionPlanUnitRecordsQuery.error.message}</p>
                      )}
                      {actionPlanUnitRecordsQuery.data?.length === 0 && (
                        <Button
                          size="sm"
                          onClick={() => {
                            const version = selectedDocumentVersionQuery.data?.version;
                            if (!version?.contentHash || !selectedDocument?.id) {
                              toast.error("Versão/hash indisponível. Recarregue o plano antes de registrar.");
                              return;
                            }
                            registerActionPlanUnitsMutation.mutate({
                              taskId,
                              documentId: selectedDocument.id,
                              expectedVersion: version.version,
                              expectedContentHash: version.contentHash,
                            });
                          }}
                          disabled={registerActionPlanUnitsMutation.isPending || !selectedDocumentVersionQuery.data?.version.contentHash}
                        >
                          {registerActionPlanUnitsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Registrar unidades para aprovação
                        </Button>
                      )}
                      {actionPlanUnitRecordsQuery.data?.some((record: any) => record.state === "APPROVED" && !record.operationalTaskId) && (
                        <div className="space-y-2 rounded-md border border-amber-500/30 p-3">
                          <p className="text-xs text-muted-foreground">
                            A materialização cria somente tarefas-filhas PAUSED, sem agente e sem autorização de execução. Os gates de dependências, risco, orçamento, permissões, executor e adaptador continuam obrigatórios.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => materializeActionPlanUnitsMutation.mutate({ taskId })}
                            disabled={materializeActionPlanUnitsMutation.isPending}
                          >
                            {materializeActionPlanUnitsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Materializar unidades aprovadas em PAUSED
                          </Button>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {actionPlanUnits.map((unit: any) => (
                          <Button
                            key={unit.id}
                            size="sm"
                            variant={activeActionUnitId === unit.id ? "default" : "outline"}
                            onClick={() => setSelectedActionUnitId(unit.id)}
                          >
                            {unit.id}
                            {actionPlanUnitRecordsQuery.data?.find((record: any) => record.unitId === unit.id)?.state
                              ? " · " + actionPlanUnitRecordsQuery.data.find((record: any) => record.unitId === unit.id)?.state
                              : ""}
                          </Button>
                        ))}
                      </div>
                      {(() => {
                        const record = actionPlanUnitRecordsQuery.data?.find((item: any) => item.unitId === activeActionUnitId);
                        const version = selectedDocumentVersionQuery.data?.version;
                        if (!record) return null;
                        return (
                          <div className="rounded-md border p-3 space-y-2">
                            <p className="text-sm font-medium">{record.unitId} — {record.unitTitle}</p>
                            <p className="text-xs text-muted-foreground">Estado de governança: {record.state}</p>
                            {record.operationalTaskId && (
                              <p className="text-xs text-muted-foreground">
                                Tarefa operacional: #{record.operationalTaskId} — criada em PAUSED, sem executor e sem dispatch.
                              </p>
                            )}
                            {record.state === "AWAITING_APPROVAL" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (!version?.contentHash) {
                                    toast.error("Hash da versão indisponível. Recarregue o plano.");
                                    return;
                                  }
                                  approveActionPlanUnitMutation.mutate({
                                    taskId,
                                    unitId: record.unitId,
                                    expectedVersion: version.version,
                                    expectedContentHash: version.contentHash,
                                  });
                                }}
                                disabled={approveActionPlanUnitMutation.isPending || !version?.contentHash}
                              >
                                {approveActionPlanUnitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Aprovar unidade {record.unitId}
                              </Button>
                            )}
                            {record.state === "APPROVED" && (
                              <p className="text-xs text-green-600">Aprovação individual registrada; os demais gates de execução continuam obrigatórios.</p>
                            )}
                          </div>
                        );
                      })()}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => actionUnitGateMutation.mutate({ taskId, unitId: activeActionUnitId })}
                        disabled={actionUnitGateMutation.isPending}
                      >
                        {actionUnitGateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Avaliar pré-condições da unidade
                      </Button>
                      {actionUnitGateMutation.isPending && <p className="text-xs text-muted-foreground">Avaliando pré-condições...</p>}
                      {actionUnitGateMutation.isError && (
                        <p className="text-sm text-destructive">{actionUnitGateMutation.error.message}</p>
                      )}
                      {actionUnitGateMutation.data && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">
                            {actionUnitGateMutation.data.unit.id} — {actionUnitGateMutation.data.unit.title}
                          </p>
                          <p className="text-xs font-semibold text-destructive">
                            Decisão: {actionUnitGateMutation.data.gate.decision}
                          </p>
                          <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                            {actionUnitGateMutation.data.gate.blockers.map((blocker: any) => (
                              <li key={blocker.code}><strong>{blocker.code}</strong>: {blocker.detail}</li>
                            ))}
                          </ul>
                          <p className="text-xs text-muted-foreground">
                            Esta avaliação não constitui autorização. A aprovação individual e o gate de dispatch permanecem etapas separadas.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedDocument.typeKey === "TR" && selectedDocument.latestVersion?.state === "DRAFT" && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
                      <p className="text-sm text-amber-600">A interpretação da SOFIA ainda não foi gerada. Este registro provisório não está pronto para aprovação. Gere o TR para habilitar a revisão e a aprovação do operador.</p>
                      <Button
                        variant="outline"
                        onClick={() => regenerateInitialTRMutation.mutate({ taskId })}
                        disabled={regenerateInitialTRMutation.isPending}
                      >
                        {regenerateInitialTRMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Tentar gerar TR novamente
                      </Button>
                    </div>
                  )}
                  {selectedDocument.typeKey === "TR" && selectedVersion === selectedDocument.latestVersion?.version && canReorientTR && (
                    ["DRAFT", "AWAITING_HUMAN_VALIDATION"].includes(selectedDocument.latestVersion?.state ?? "")
                    || selectedDocument.latestVersion?.state === "VALIDATED"
                  ) && (
                    <div className="space-y-3 rounded-md border p-4">
                      <div>
                        <p className="text-sm font-semibold">Revisão do operador</p>
                        <p className="mt-1 text-xs text-muted-foreground">Edite o entendimento da SOFIA. Salvar cria uma nova versão e mantém a anterior no histórico. Se o TR já foi validado, a reorientação invalida o Blueprint anterior e exige nova validação antes da execução.</p>
                      </div>
                      <Textarea
                        value={trCorrection}
                        onChange={(event) => setTrCorrection(event.target.value)}
                        rows={10}
                        className="font-mono text-xs leading-5"
                        disabled={selectedDocument.latestVersion?.state === "DRAFT"}
                      />
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => reviseInitialTRMutation.mutate({ taskId, content: trCorrection })}
                          disabled={!["AWAITING_HUMAN_VALIDATION", "VALIDATED"].includes(selectedDocument.latestVersion?.state ?? "") || (selectedDocument.latestVersion?.state === "VALIDATED" && !canReorientTR) || reviseInitialTRMutation.isPending || !trCorrection.trim()}
                        >
                          {reviseInitialTRMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {selectedDocument.latestVersion?.state === "VALIDATED" ? "Reorientar TR" : "Salvar correção"}
                        </Button>
                        <Button
                          onClick={() => validateTRMutation.mutate({ taskId })}
                          disabled={selectedDocument.latestVersion?.state !== "AWAITING_HUMAN_VALIDATION" || validateTRMutation.isPending}
                        >
                          {validateTRMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Aprovar TR e gerar Blueprint
                        </Button>
                      </div>
                    </div>
                  )}
                  {selectedDocument.typeKey === "TR" && selectedVersion === selectedDocument.latestVersion?.version && selectedDocument.latestVersion?.state === "VALIDATED" && !blueprintReady && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
                      <p className="text-sm text-amber-600">TR validado. A missão continua PAUSED até a SOFIA gerar um Blueprint READY vinculado a esta versão exata do TR.</p>
                      <Button
                        variant="outline"
                        onClick={() => generateBlueprintMutation.mutate({ taskId })}
                        disabled={generateBlueprintMutation.isPending}
                      >
                        {generateBlueprintMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Gerar Blueprint e liberar
                      </Button>
                    </div>
                  )}
                  {selectedDocument.typeKey === "TR" && ["VALIDATED", "ACTIVE", "REORIENTED"].includes(selectedDocument.latestVersion?.state ?? "") && blueprintReady && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-green-500/30 p-3">
                      <p className="text-sm text-green-600">TR validado e Blueprint READY vinculado à versão vigente.</p>
                      {currentStatusName === "PAUSED" && !task.manusTaskId && (
                        <Button
                          onClick={() => generateBlueprintMutation.mutate({ taskId })}
                          disabled={generateBlueprintMutation.isPending}
                        >
                          {generateBlueprintMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Liberar missão para execução
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Descrição e Ações */}
            <div className="lg:col-span-2">
              <Card className="cad-card">
                <CardHeader>
                  <CardTitle className="text-lg">Solicitação original</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{task.description || "Sem descrição"}</p>
                </CardContent>
              </Card>

              {/* Visão operacional separa estado local da missão e execução externa. */}
              <Card className="cad-card mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Execução e executor</CardTitle>
                  <CardDescription>
                    Estado da execução externa e atribuição atual. A situação do executor não substitui o estado da missão.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Executor atribuído</p>
                    <p className="text-sm font-medium">
                      {assignedAgentQuery.isLoading
                        ? "Carregando executor..."
                        : assignedAgentQuery.data?.name ?? (task.agentId ? `Agente #${task.agentId}` : "Nenhum executor atribuído")}
                    </p>
                    {task.agentId != null && (
                      <p className="text-xs text-muted-foreground">
                        {task.agentPinned ? "Atribuição fixada manualmente" : "Atribuição não fixada"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Estado do executor</p>
                    <p className="text-sm font-medium">
                      {assignedAgentQuery.data?.status ?? (task.agentId ? "Não disponível" : "—")}
                    </p>
                    {assignedAgentQuery.data?.connectionStatus && (
                      <p className="text-xs text-muted-foreground">
                        Conexão: {assignedAgentQuery.data.connectionStatus}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Execução externa (Manus)</p>
                    <Badge variant="outline">{externalStatusLabel}</Badge>
                    {task.manusStatus === "manual_pause_pending" && (
                      <p className="text-xs text-amber-600">
                        O estado local só mudará para PAUSED quando a Manus confirmar que não há jobs em segundo plano.
                      </p>
                    )}
                    {task.manusTaskId && (
                      <p className="break-all text-xs text-muted-foreground">ID: {task.manusTaskId}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Créditos consumidos</p>
                    <p className="text-sm font-medium tabular-nums">{task.creditsUsed ?? 0}</p>
                  </div>
                  {assignedAgentQuery.isError && (
                    <p className="text-xs text-amber-600 sm:col-span-2 lg:col-span-3">
                      Não foi possível carregar os dados públicos do executor. Os dados da missão continuam disponíveis.
                    </p>
                  )}
                  {task.manusTaskId && currentStatusName === "PROGRESS" && ["running", "manual_pause_pending"].includes((task.manusStatus ?? "").toLowerCase()) && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 sm:col-span-2 lg:col-span-3">
                      <p className="text-xs text-muted-foreground">
                        A pausa interrompe a execução externa. Se houver processos em segundo plano, a missão permanecerá em PROGRESS até a confirmação.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={pauseExecutionMutation.isPending}
                        onClick={() => {
                          const message = task.manusStatus === "manual_pause_pending"
                            ? "Verificar novamente e, se a execução tiver retomado, solicitar sua interrupção?"
                            : "Interromper a execução externa desta tarefa na Manus?";
                          if (window.confirm(message)) {
                            pauseExecutionMutation.mutate({ taskId });
                          }
                        }}
                      >
                        {pauseExecutionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {task.manusStatus === "manual_pause_pending" ? "Verificar pausa" : "Pausar execução"}
                      </Button>
                    </div>
                  )}
                  {task.manusTaskId && currentStatusName === "PAUSED" && ["stopped", "manual_resume_pending"].includes((task.manusStatus ?? "").toLowerCase()) && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 sm:col-span-2 lg:col-span-3">
                      <p className="text-xs text-muted-foreground">
                        A retomada envia uma instrução à execução Manus e só altera o estado local para PROGRESS após confirmação externa.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        disabled={resumeExecutionMutation.isPending}
                        onClick={() => {
                          const message = task.manusStatus === "manual_resume_pending"
                            ? "Tentar novamente a retomada desta execução na Manus?"
                            : "Retomar esta execução na Manus a partir do último ponto concluído?";
                          if (window.confirm(message)) {
                            resumeExecutionMutation.mutate({ taskId });
                          }
                        }}
                      >
                        {resumeExecutionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {task.manusStatus === "manual_resume_pending" ? "Tentar retomada" : "Retomar execução"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ações */}
              <Card className="cad-card mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Ações</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-3">
                  <Button
                    onClick={handleStart}
                    disabled={isStarting || !canStartExecution}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isStarting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {isStarting ? "Iniciando..." : "Iniciar missão"}
                  </Button>
                  <Button
                    onClick={handleFactorize}
                    disabled={isFactorizing || !canFactorize}
                    title={!canFactorize ? "A fatoração deve ser feita na missão principal." : undefined}
                    className="bg-accent hover:bg-accent/80 text-foreground"
                  >
                    {isFactorizing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Fatorando...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Fatorizar Tarefa
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleConsolidate}
                    disabled={isConsolidating}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isConsolidating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Consolidando...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Consolidar Resultados
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {task.manusStatus === "waiting_for_available_agent" && (
                <Card className="cad-card mt-4 border-amber-500/50">
                  <CardContent className="pt-5 text-sm">
                    <p className="font-semibold text-amber-500">Missão aguardando agente elegível</p>
                    <p className="mt-2 text-muted-foreground">
                      A missão permanece em STAGED. A atribuição automática depende de um agente online,
                      com credencial válida e saldo de créditos confirmado nos últimos 60 segundos.
                      Nenhuma execução foi enviada à Manus.
                    </p>
                  </CardContent>
                </Card>
              )}
              {task.manusStatus === "waiting_for_pinned_agent" && (
                <Card className="cad-card mt-4 border-amber-500/50">
                  <CardContent className="pt-5 text-sm">
                    <p className="font-semibold text-amber-500">Missão aguardando o agente selecionado</p>
                    <p className="mt-2 text-muted-foreground">
                      O agente fixado não está elegível neste momento. A missão permanece em STAGED
                      e não será transferida automaticamente para outro agente.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* ARC / PGC — avaliação contextual em shadow mode */}
              <Card className="cad-card mt-6 border-accent/30">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-accent" />
                        Relatório ARC/PGC
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Relatório contextual heurístico da tarefa e do agente, em shadow mode.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="shrink-0">SHADOW</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {arcAssessmentQuery.isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Carregando avaliação...
                    </div>
                  ) : arcAssessmentQuery.data ? (
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-lg border p-3">
                          <p className="text-xs text-muted-foreground">Posterior</p>
                          <p className="mt-1 text-xl font-semibold">
                            {(Number(arcAssessmentQuery.data.posterior) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="rounded-lg border p-3">
                          <p className="text-xs text-muted-foreground">Decisão</p>
                          <Badge className={`mt-2 ${getArcDecisionClass(arcAssessmentQuery.data.decision)}`}>
                            {arcAssessmentQuery.data.decision}
                          </Badge>
                        </div>
                        <div className="rounded-lg border p-3">
                          <p className="text-xs text-muted-foreground">Modo</p>
                          <p className="mt-1 text-sm font-medium uppercase">{arcAssessmentQuery.data.mode}</p>
                        </div>
                        <div className="rounded-lg border p-3">
                          <p className="text-xs text-muted-foreground">Prior</p>
                          <p className="mt-1 text-xl font-semibold">
                            {(Number(arcAssessmentQuery.data.prior) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg border p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ranking de confiança</p>
                            <p className="mt-1 text-sm text-muted-foreground">Sinal operacional agregado, sem bloqueio de acesso.</p>
                          </div>
                          {arcConfidenceQuery.data?.[0] && (
                            <span className="text-2xl font-bold text-accent">{Number(arcConfidenceQuery.data[0].score).toFixed(0)}<span className="text-sm font-normal text-muted-foreground">/100</span></span>
                          )}
                        </div>
                        {arcConfidenceQuery.data && arcConfidenceQuery.data.length > 0 ? (
                          <div className="flex h-20 items-end gap-1" aria-label="Histórico de confiança">
                            {[...arcConfidenceQuery.data].reverse().map((snapshot) => {
                              const score = Math.max(0, Math.min(100, Number(snapshot.score)));
                              return (
                                <div key={snapshot.id} className="group flex h-full flex-1 flex-col justify-end" title={`${score.toFixed(0)}/100 — ${new Date(snapshot.observedAt).toLocaleString()}`}>
                                  <div className="w-full rounded-t bg-accent/80 transition-all group-hover:bg-accent" style={{ height: `${Math.max(score, 4)}%` }} />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">O primeiro snapshot será criado ao gerar uma nova avaliação.</p>
                        )}
                      </div>

                      <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                        <div className="flex gap-2">
                          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          <p>{arcAssessmentQuery.data.explanation}</p>
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidências observadas</p>
                        <div className="overflow-x-auto rounded-lg border">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-muted/40 text-muted-foreground">
                              <tr>
                                <th className="px-3 py-2 font-medium">Sinal</th>
                                <th className="px-3 py-2 font-medium">Valor</th>
                                <th className="px-3 py-2 font-medium">Confiabilidade</th>
                                <th className="px-3 py-2 font-medium">Origem</th>
                              </tr>
                            </thead>
                            <tbody>
                              {arcAssessmentQuery.data.evidence.map((evidence) => (
                                <tr key={`${evidence.key}-${evidence.observedAt}`} className="border-t">
                                  <td className="px-3 py-2 font-medium">{evidence.key}</td>
                                  <td className="px-3 py-2">{Number(evidence.value).toFixed(2)}</td>
                                  <td className="px-3 py-2">{(Number(evidence.reliability) * 100).toFixed(0)}%</td>
                                  <td className="px-3 py-2 text-muted-foreground">{evidence.source}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-muted-foreground">
                          Avaliação criada em {new Date(arcAssessmentQuery.data.createdAt).toLocaleString()}.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleArcEvaluation}
                          disabled={evaluateArcMutation.isPending}
                        >
                          {evaluateArcMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          Reavaliar
                        </Button>
                      </div>
                    </div>
                  ) : ensureArcAssessmentMutation.isPending ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando relatório ARC automaticamente...
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-3">
                      <p className="text-sm text-muted-foreground">
                        Ainda não existe um relatório ARC persistido para esta tarefa.
                      </p>
                      <Button
                        onClick={handleArcEvaluation}
                        disabled={evaluateArcMutation.isPending}
                        className="bg-accent hover:bg-accent/80 text-foreground"
                      >
                        {evaluateArcMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="mr-2 h-4 w-4" />
                        )}
                        Avaliar tarefa
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Info Lateral */}
            <div>
              <Card className="cad-card">
                <CardHeader>
                  <CardTitle className="text-sm">Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Criada em</p>
                    <p className="text-sm font-medium">{new Date(task.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Última atualização</p>
                    <p className="text-sm font-medium">{new Date(task.updatedAt).toLocaleString()}</p>
                  </div>
                  {task.dueDate && (
                    <div>
                      <p className="text-xs text-muted-foreground">Data de vencimento</p>
                      <p className="text-sm font-medium">{new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {task.completedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Concluída em</p>
                      <p className="text-sm font-medium">{new Date(task.completedAt).toLocaleString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs para Subtarefas e Relatórios */}
          <Tabs defaultValue="subtasks" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="subtasks">Subtarefas ({subtasks.length})</TabsTrigger>
              <TabsTrigger value="messenger">Messenger</TabsTrigger>
              <TabsTrigger value="reports">Relatórios ({messages.length})</TabsTrigger>
              <TabsTrigger value="consolidated">Consolidado</TabsTrigger>
            </TabsList>

            {/* Messenger central da missão: mensagens sempre ficam vinculadas à raiz. */}
            <TabsContent value="messenger" className="mt-6">
              <Card className="cad-card">
                <CardHeader className="border-b border-foreground/10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle>Conversa com a SOFIA</CardTitle>
                      <CardDescription>
                        Canal central da missão #{missionRootTaskId}. A SOFIA responde aqui e só encaminha instruções ao executor quando você solicitar explicitamente.
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void missionMessagesQuery.refetch()}
                      disabled={missionMessagesQuery.isFetching}
                    >
                      {missionMessagesQuery.isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Atualizar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  {missionMessagesQuery.isError ? (
                    <div className="rounded-md border border-destructive/30 p-4 text-sm text-destructive">
                      Não foi possível carregar a conversa. {missionMessagesQuery.error.message}
                    </div>
                  ) : missionMessagesQuery.isLoading ? (
                    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />Carregando conversa...
                    </div>
                  ) : missionMessages.length === 0 ? (
                    <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                      Ainda não há mensagens nesta missão. Envie uma pergunta ou orientação para iniciar a conversa com a SOFIA.
                    </div>
                  ) : (
                    <div className="max-h-[520px] space-y-4 overflow-y-auto rounded-md border bg-muted/10 p-4">
                      {missionMessages.map((message) => (
                        <div key={message.id} className={`flex ${message.isAssistant ? "justify-start" : "justify-end"}`}>
                          <div className={`max-w-[90%] rounded-lg border px-4 py-3 sm:max-w-[80%] ${
                            message.isAssistant
                              ? "border-foreground/10 bg-card"
                              : "border-accent/30 bg-accent/10"
                          }`}>
                            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <strong className="text-foreground">{message.isAssistant ? "SOFIA" : "Você"}</strong>
                              <span>{new Date(message.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3 border-t border-foreground/10 pt-4">
                    <Textarea
                      value={messageContent}
                      onChange={(event) => setMessageContent(event.target.value)}
                      placeholder="Pergunte à SOFIA sobre a missão ou registre uma orientação..."
                      rows={4}
                      maxLength={12000}
                      disabled={createMissionMessageMutation.isPending}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        Até 12.000 caracteres. Perguntas não são encaminhadas ao agente; o encaminhamento exige pedido explícito.
                      </p>
                      <Button
                        type="button"
                        onClick={() => void handleSendMissionMessage()}
                        disabled={!messageContent.trim() || createMissionMessageMutation.isPending}
                      >
                        {createMissionMessageMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar mensagem
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subtarefas */}
            <TabsContent value="subtasks" className="mt-6">
              {subtasks.length > 0 ? (
                <div className="space-y-3">
                  {subtasks.map((subtask) => (
                    <Card key={subtask.id} className="cad-card hover:bg-foreground/5 cursor-pointer transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{subtask.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{subtask.description}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {getStatusBadge(subtask.statusId)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="cad-card">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    Nenhuma subtarefa criada. Clique em "Fatorizar Tarefa" para decompor.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Relatórios */}
            <TabsContent value="reports" className="mt-6">
              {messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <Card key={msg.id} className="cad-card">
                      <CardHeader>
                        <CardTitle className="text-sm">Mensagem #{msg.id}</CardTitle>
                        <CardDescription>{new Date(msg.createdAt).toLocaleString()}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                          {msg.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="cad-card">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    Nenhum relatório disponível
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Consolidado */}
            <TabsContent value="consolidated" className="mt-6">
              {consolidatedReportQuery.isLoading ? (
                <Card className="cad-card">
                  <CardContent className="pt-6 flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Carregando do Supabase Storage...
                  </CardContent>
                </Card>
              ) : consolidatedReportQuery.data ? (
                <Card className="cad-card">
                  <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle>Relatório Consolidado</CardTitle>
                      <CardDescription>Arquivo privado no Supabase Storage</CardDescription>
                    </div>
                    <a
                      href={consolidatedReportQuery.data.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-foreground/5"
                    >
                      <Download className="w-4 h-4" />
                      Baixar .md
                    </a>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{consolidatedReportQuery.data.content}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : consolidatedReportQuery.isError ? (
                <Card className="cad-card">
                  <CardContent className="pt-6 text-center text-red-500">
                    Não foi possível carregar o relatório do Supabase Storage. Verifique a configuração server-side.
                  </CardContent>
                </Card>
              ) : (
                <Card className="cad-card">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    Nenhum relatório consolidado. Clique em "Consolidar Resultados" após as subtarefas serem concluídas.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
