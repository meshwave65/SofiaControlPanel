import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, ChevronLeft, Zap, FileText, AlertCircle, Download, ShieldCheck, RefreshCw, Info } from "lucide-react";

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
  const messagesQuery = trpc.messages.getByTask.useQuery(
    { taskId },
    { enabled: canLoadTask && Boolean(taskQuery.data), retry: false },
  );
  const lookupsQuery = trpc.lookups.listAll.useQuery(
    undefined,
    { enabled: canLoadTask && Boolean(taskQuery.data), retry: false },
  );
  const statuses = lookupsQuery.data?.statuses ?? [];
  const priorities = lookupsQuery.data?.priorities ?? [];
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [isFactorizing, setIsFactorizing] = useState(false);
  const [isConsolidating, setIsConsolidating] = useState(false);

  const factorizeTaskMutation = trpc.tasks.factorize.useMutation();
  const consolidateTaskMutation = trpc.tasks.consolidate.useMutation();
  const updateStatusMutation = trpc.tasks.updateStatus.useMutation();
  const arcAssessmentQuery = trpc.arc.getAssessment.useQuery(
    { taskId },
    { enabled: canLoadTask && Boolean(taskQuery.data), retry: false },
  );
  const evaluateArcMutation = trpc.arc.evaluateTask.useMutation({
    onSuccess: () => arcAssessmentQuery.refetch(),
  });
  const consolidatedReportQuery = trpc.tasks.getConsolidatedReport.useQuery(
    { taskId },
    { enabled: canLoadTask && Boolean(taskQuery.data), retry: false },
  );

  const task = taskQuery.data;
  const messages = messagesQuery.data || [];

  // Buscar subtarefas se a tarefa tiver parentTaskId = null (é uma tarefa gênesis)
  useEffect(() => {
    if (task && !task.parentTaskId) {
      // Buscar subtarefas via API
      fetch(`/api/public/subtasks/${taskId}`)
        .then(res => res.json())
        .then(data => setSubtasks(data.tasks || []))
        .catch(err => console.error("Erro ao buscar subtarefas:", err));
    }
  }, [task, taskId]);

  const handleFactorize = async () => {
    setIsFactorizing(true);
    try {
      await factorizeTaskMutation.mutateAsync({ taskId });
      // Recarregar dados
      await taskQuery.refetch();
      await messagesQuery.refetch();
    } catch (error) {
      console.error("Erro ao fatorizar:", error);
    } finally {
      setIsFactorizing(false);
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Descrição e Ações */}
            <div className="lg:col-span-2">
              <Card className="cad-card">
                <CardHeader>
                  <CardTitle className="text-lg">Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{task.description || "Sem descrição"}</p>
                </CardContent>
              </Card>

              {/* Ações */}
              <Card className="cad-card mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Ações</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-3">
                  <Button
                    onClick={handleFactorize}
                    disabled={isFactorizing}
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

              {/* ARC / PGC — avaliação contextual em shadow mode */}
              <Card className="cad-card mt-6 border-accent/30">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-accent" />
                        Avaliação ARC/PGC
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Sinais contextuais heurísticos da tarefa e do agente.
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
                  ) : (
                    <div className="flex flex-col items-start gap-3">
                      <p className="text-sm text-muted-foreground">
                        Ainda não existe uma avaliação persistida para esta tarefa.
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="subtasks">Subtarefas ({subtasks.length})</TabsTrigger>
              <TabsTrigger value="reports">Relatórios ({messages.length})</TabsTrigger>
              <TabsTrigger value="consolidated">Consolidado</TabsTrigger>
            </TabsList>

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
