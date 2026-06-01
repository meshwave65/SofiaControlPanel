import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Trash2, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

/**
 * Página de Gerenciamento de Tarefas
 * Exibe tabela com filtros por status, prioridade e agente, com paginação
 */
export default function Tasks() {
  const { user, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [formData, setFormData] = useState({
    agentId: "",
    title: "",
    description: "",
    statusId: "1",
    priorityId: "1",
    dueDate: "",
  });

  // Queries
  const tasksQuery = trpc.tasks.listAll.useQuery(undefined, { enabled: !!user });
  const agentsQuery = trpc.agents.list.useQuery(undefined, { enabled: !!user });
  const statusesQuery = trpc.lookups.getAllTaskStatuses.useQuery();
  const prioritiesQuery = trpc.lookups.getAllTaskPriorities.useQuery();

  // Mutations
  const createMutation = trpc.tasks.create.useMutation();
  const updateStatusMutation = trpc.tasks.updateStatus.useMutation();
  const deleteMutation = trpc.tasks.delete.useMutation();

  const tasks = tasksQuery.data || [];
  const agents = agentsQuery.data || [];
  const statuses = statusesQuery.data || [];
  const priorities = prioritiesQuery.data || [];

  // Filtrar tarefas
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filterStatus !== "all" && task.statusId !== parseInt(filterStatus)) return false;
      if (filterPriority !== "all" && task.priorityId !== parseInt(filterPriority)) return false;
      if (filterAgent !== "all" && task.agentId !== parseInt(filterAgent)) return false;
      return true;
    });
  }, [tasks, filterStatus, filterPriority, filterAgent]);

  // Paginação
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreateTask = async () => {
    if (!formData.title.trim() || !formData.agentId) {
      toast.error("Título e agente são obrigatórios");
      return;
    }

    try {
      await createMutation.mutateAsync({
        agentId: parseInt(formData.agentId),
        title: formData.title,
        description: formData.description,
        statusId: parseInt(formData.statusId),
        priorityId: parseInt(formData.priorityId),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      });

      setFormData({
        agentId: "",
        title: "",
        description: "",
        statusId: "1",
        priorityId: "1",
        dueDate: "",
      });
      setIsOpen(false);
      tasksQuery.refetch();
      toast.success("Tarefa criada com sucesso");
    } catch (error) {
      toast.error("Erro ao criar tarefa");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Tem certeza que deseja deletar esta tarefa?")) return;

    try {
      await deleteMutation.mutateAsync({ id: taskId });
      tasksQuery.refetch();
      toast.success("Tarefa deletada com sucesso");
    } catch (error) {
      toast.error("Erro ao deletar tarefa");
    }
  };

  const getStatusColor = (statusId: number) => {
    const status = statuses.find((s) => s.id === statusId);
    return status?.color || "#6b7280";
  };

  const getPriorityLabel = (priorityId: number) => {
    const priority = priorities.find((p) => p.id === priorityId);
    return priority?.name || "Desconhecida";
  };

  const getAgentName = (agentId: number) => {
    const agent = agents.find((a) => a.id === agentId);
    return agent?.name || `Agent #${agentId}`;
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="technical-header flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Tarefas</h1>
            <p className="text-muted-foreground">Crie, monitore e organize tarefas de agentes</p>
          </div>

          {/* Dialog de Criação */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="w-4 h-4" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-accent/30 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-accent">Criar Nova Tarefa</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Configure os detalhes da nova tarefa
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="agent" className="text-foreground">
                    Agente
                  </Label>
                  <Select value={formData.agentId} onValueChange={(v) => setFormData({ ...formData, agentId: v })}>
                    <SelectTrigger className="bg-background border-accent/30 text-foreground">
                      <SelectValue placeholder="Selecione um agente" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-accent/30">
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id.toString()}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title" className="text-foreground">
                    Título
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Processar dados"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-background border-accent/30 text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-foreground">
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva a tarefa"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-background border-accent/30 text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status" className="text-foreground">
                      Status
                    </Label>
                    <Select value={formData.statusId} onValueChange={(v) => setFormData({ ...formData, statusId: v })}>
                      <SelectTrigger className="bg-background border-accent/30 text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-accent/30">
                        {statuses.map((status) => (
                          <SelectItem key={status.id} value={status.id.toString()}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority" className="text-foreground">
                      Prioridade
                    </Label>
                    <Select value={formData.priorityId} onValueChange={(v) => setFormData({ ...formData, priorityId: v })}>
                      <SelectTrigger className="bg-background border-accent/30 text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-accent/30">
                        {priorities.map((priority) => (
                          <SelectItem key={priority.id} value={priority.id.toString()}>
                            {priority.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="dueDate" className="text-foreground">
                    Data de Vencimento
                  </Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="bg-background border-accent/30 text-foreground"
                  />
                </div>

                <Button
                  onClick={handleCreateTask}
                  disabled={createMutation.isPending}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Criar Tarefa
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card className="cad-card">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-foreground mb-2 block">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-background border-accent/30 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-accent/30">
                    <SelectItem value="all">Todos</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id.toString()}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-foreground mb-2 block">Prioridade</Label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="bg-background border-accent/30 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-accent/30">
                    <SelectItem value="all">Todas</SelectItem>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.id} value={priority.id.toString()}>
                        {priority.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-foreground mb-2 block">Agente</Label>
                <Select value={filterAgent} onValueChange={setFilterAgent}>
                  <SelectTrigger className="bg-background border-accent/30 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-accent/30">
                    <SelectItem value="all">Todos</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Tarefas */}
        <Card className="cad-card">
          <CardHeader>
            <CardTitle>Tarefas ({filteredTasks.length})</CardTitle>
            <CardDescription>Página {currentPage} de {totalPages || 1}</CardDescription>
          </CardHeader>
          <CardContent>
            {paginatedTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma tarefa encontrada</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-accent/20 hover:bg-transparent">
                        <TableHead className="text-accent">ID</TableHead>
                        <TableHead className="text-accent">Título</TableHead>
                        <TableHead className="text-accent">Agente</TableHead>
                        <TableHead className="text-accent">Status</TableHead>
                        <TableHead className="text-accent">Prioridade</TableHead>
                        <TableHead className="text-accent">Criado</TableHead>
                        <TableHead className="text-accent text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTasks.map((task) => (
                        <TableRow key={task.id} className="task-row border-accent/20">
                          <TableCell className="text-foreground">#{task.id}</TableCell>
                          <TableCell className="text-foreground font-medium">{task.title}</TableCell>
                          <TableCell className="text-muted-foreground">{getAgentName(task.agentId)}</TableCell>
                          <TableCell>
                            <span
                              className="px-2 py-1 rounded-sm text-xs font-medium text-white"
                              style={{ backgroundColor: getStatusColor(task.statusId) }}
                            >
                              {statuses.find((s) => s.id === task.statusId)?.name || "Desconhecido"}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{getPriorityLabel(task.priorityId)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-accent/20">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredTasks.length)} de {filteredTasks.length}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="border-accent/30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="border-accent/30"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
