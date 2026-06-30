import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Loader2, ChevronLeft, Zap, FileText, AlertCircle } from "lucide-react";

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const taskId = parseInt(id || "0");

  const taskQuery = trpc.tasks.getById.useQuery({ id: taskId });
  const messagesQuery = trpc.messages.getByTask.useQuery({ taskId });
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [isFactorizing, setIsFactorizing] = useState(false);
  const [isConsolidating, setIsConsolidating] = useState(false);

  const factorizeTaskMutation = trpc.tasks.factorize.useMutation();
  const consolidateTaskMutation = trpc.tasks.consolidate.useMutation();
  const updateStatusMutation = trpc.tasks.updateStatus.useMutation();

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
      // Recarregar dados
      await messagesQuery.refetch();
    } catch (error) {
      console.error("Erro ao consolidar:", error);
    } finally {
      setIsConsolidating(false);
    }
  };

  const getStatusBadge = (statusId: number) => {
    const statusMap: Record<number, { label: string; color: string }> = {
      100: { label: "STAGED", color: "bg-yellow-500/20 text-yellow-500" },
      110: { label: "PROGRESS", color: "bg-blue-500/20 text-blue-500" },
      120: { label: "PAUSED", color: "bg-orange-500/20 text-orange-500" },
      130: { label: "DONE", color: "bg-green-500/20 text-green-500" },
      200: { label: "FAIL", color: "bg-red-500/20 text-red-500" },
    };
    const status = statusMap[statusId] || { label: `Status ${statusId}`, color: "bg-gray-500/20 text-gray-500" };
    return <Badge className={status.color}>{status.label}</Badge>;
  };

  const getPriorityLabel = (priorityId: number) => {
    const priorityMap: Record<number, string> = {
      1: "Baixa",
      2: "Média",
      3: "Alta",
      4: "Crítica",
    };
    return priorityMap[priorityId] || `Prioridade ${priorityId}`;
  };

  if (taskQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
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

  const consolidatedReport = messages.find(m => m.typeId === 3); // ConsolidatedReport type
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
              {consolidatedReport ? (
                <Card className="cad-card">
                  <CardHeader>
                    <CardTitle>Relatório Consolidado</CardTitle>
                    <CardDescription>{new Date(consolidatedReport.createdAt).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{consolidatedReport.content}</p>
                    </div>
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
