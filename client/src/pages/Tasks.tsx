import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/lib/trpc";
import { Plus, Filter } from "lucide-react";
import { toast } from "sonner";

const createTaskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  agentId: z.number().optional(),
  statusId: z.number().default(1),
  priorityId: z.number().default(1),
  dueDate: z.string().optional(),
});

type CreateTaskInput = z.infer<typeof createTaskSchema>;

export default function Tasks() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Queries
  const tasksQuery = trpc.tasks.listAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const agentsQuery = trpc.agents.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mutations
  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Tarefa criada com sucesso!");
      tasksQuery.refetch();
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`Erro ao criar tarefa: ${error.message}`);
    },
  });

  const updateStatusMutation = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status da tarefa atualizado!");
      tasksQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar tarefa: ${error.message}`);
    },
  });

  // Form
  const form = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      statusId: 1,
      priorityId: 1,
      agentId: undefined,
      dueDate: "",
    },
  });

  const onSubmit = (data: any) => {
    createTaskMutation.mutate({
      ...data,
      statusId: parseInt(data.statusId.toString()),
      priorityId: parseInt(data.priorityId.toString()),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Você precisa estar autenticado para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="technical-header px-6 py-8 border-b-2 border-foreground/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Gerenciamento de Tarefas</h1>
            <p className="text-muted-foreground">
              Total de tarefas: <span className="text-accent font-semibold">{tasksQuery.isLoading ? "..." : tasksQuery.data?.length || 0}</span>
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-2 border-foreground/20">
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título da Tarefa</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Processar dados" {...field} className="bg-input border-foreground/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input placeholder="Descrição da tarefa" {...field} className="bg-input border-foreground/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Atribuir a Agente</FormLabel>
                        <FormControl>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <SelectTrigger className="bg-input border-foreground/30">
                              <SelectValue placeholder="Selecione um agente" />
                            </SelectTrigger>
                            <SelectContent>
                              {agentsQuery.data?.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id.toString()}>
                                  {agent.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priorityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridade</FormLabel>
                        <FormControl>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <SelectTrigger className="bg-input border-foreground/30">
                              <SelectValue placeholder="Selecione a prioridade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Baixa</SelectItem>
                              <SelectItem value="2">Média</SelectItem>
                              <SelectItem value="3">Alta</SelectItem>
                              <SelectItem value="4">Crítica</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Criar Tarefa
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-6 py-4 border-b border-foreground/20">
        <div className="max-w-7xl mx-auto flex gap-4 items-center">
          <Filter className="w-4 h-4 text-accent" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-input border-foreground/30">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="staged">Staged</SelectItem>
              <SelectItem value="progress">Em Progresso</SelectItem>
              <SelectItem value="done">Concluído</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40 bg-input border-foreground/30">
              <SelectValue placeholder="Filtrar por prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Prioridades</SelectItem>
              <SelectItem value="1">Baixa</SelectItem>
              <SelectItem value="2">Média</SelectItem>
              <SelectItem value="3">Alta</SelectItem>
              <SelectItem value="4">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <Card className="cad-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-foreground/20">
                    <TableHead className="text-accent">ID</TableHead>
                    <TableHead className="text-accent">Título</TableHead>
                    <TableHead className="text-accent">Agente</TableHead>
                    <TableHead className="text-accent">Status</TableHead>
                    <TableHead className="text-accent">Prioridade</TableHead>
                    <TableHead className="text-accent">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasksQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Carregando tarefas...
                      </TableCell>
                    </TableRow>
                  ) : tasksQuery.data && tasksQuery.data.length > 0 ? (
                    tasksQuery.data.map((task) => (
                      <TableRow key={task.id} className="border-b border-foreground/10 hover:bg-foreground/5 transition-colors">
                        <TableCell className="font-mono text-accent">#{task.id}</TableCell>
                        <TableCell>
                          <div className="font-semibold">{task.title}</div>
                          {task.description && <div className="text-xs text-muted-foreground truncate max-w-xs">{task.description}</div>}
                        </TableCell>
                        <TableCell>{task.agentId ? `Agente #${task.agentId}` : "Não atribuído"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            task.statusId === 130 ? "bg-green-500/20 text-green-500" :
                            task.statusId === 110 ? "bg-blue-500/20 text-blue-500" :
                            task.statusId === 200 ? "bg-red-500/20 text-red-500" :
                            "bg-accent/20 text-accent"
                          }`}>
                            {task.statusId === 100 ? "STAGED" : 
                             task.statusId === 110 ? "PROGRESS" :
                             task.statusId === 120 ? "PAUSED" :
                             task.statusId === 130 ? "DONE" :
                             task.statusId === 200 ? "FAIL" : `Status ${task.statusId}`}
                          </span>
                        </TableCell>
                        <TableCell>
                          {task.priorityId === 1 ? "Baixa" : 
                           task.priorityId === 2 ? "Média" : 
                           task.priorityId === 3 ? "Alta" : "Crítica"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80">
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="border-b border-foreground/10">
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhuma tarefa criada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
