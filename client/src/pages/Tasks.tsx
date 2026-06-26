import { useState, useMemo } from "react";
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
import { Plus, Filter, Loader2, Search, Calendar, AlertCircle, Cpu } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const createTaskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  agentId: z.string().optional(),
  statusId: z.string().default("100"),
  priorityId: z.string().default("1"),
  dueDate: z.string().optional(),
});

type CreateTaskInput = z.infer<typeof createTaskSchema>;

const STATUS_MAP: Record<number, { label: string, color: string }> = {
  100: { label: "STAGED", color: "bg-slate-500/20 text-slate-400" },
  110: { label: "PROGRESS", color: "bg-blue-500/20 text-blue-400" },
  120: { label: "PAUSED", color: "bg-yellow-500/20 text-yellow-400" },
  130: { label: "DONE", color: "bg-green-500/20 text-green-400" },
  200: { label: "FAIL", color: "bg-red-500/20 text-red-400" },
};

const PRIORITY_MAP: Record<number, { label: string, color: string }> = {
  1: { label: "BAIXA", color: "text-slate-400" },
  2: { label: "MÉDIA", color: "text-blue-400" },
  3: { label: "ALTA", color: "text-orange-400" },
  4: { label: "CRÍTICA", color: "text-red-500" },
};

export default function Tasks() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Queries
  const tasksQuery = trpc.tasks.listAll.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  const agentsQuery = trpc.agents.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    if (!tasksQuery.data) return [];
    return tasksQuery.data.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || task.statusId.toString() === filterStatus;
      const matchesPriority = filterPriority === "all" || task.priorityId.toString() === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasksQuery.data, searchTerm, filterStatus, filterPriority]);

  // Mutations
  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Missão inicializada com sucesso!");
      tasksQuery.refetch();
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`Falha na inicialização: ${error.message}`);
    },
  });

  // Form
  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      statusId: "100",
      priorityId: "1",
      agentId: "",
      dueDate: "",
    },
  });

  const onSubmit = (data: CreateTaskInput) => {
    createTaskMutation.mutate({
      ...data,
      agentId: data.agentId ? parseInt(data.agentId) : undefined,
      statusId: parseInt(data.statusId),
      priorityId: parseInt(data.priorityId),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest">Acesso Negado // Requer Autenticação</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="technical-header px-6 py-8 border-b-2 border-foreground/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 uppercase tracking-tighter italic">Registro de Missões</h1>
            <p className="text-muted-foreground font-mono text-xs uppercase">
              Total em Arquivo: <span className="text-accent font-bold">{tasksQuery.data?.length || 0}</span> // Filtradas: <span className="text-accent font-bold">{filteredTasks.length}</span>
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-2 font-bold uppercase tracking-widest text-xs h-11 px-6 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]">
                <Plus className="w-4 h-4" /> Nova Missão
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-2 border-foreground/20 max-w-2xl">
              <DialogHeader className="border-b border-foreground/10 pb-4 mb-4">
                <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-accent" />
                  Definir Nova Missão
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Título da Missão</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: ANÁLISE DE MERCADO SETORIAL" {...field} className="cad-box font-mono uppercase" />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Objetivos Detalhados</FormLabel>
                        <FormControl>
                          <Input placeholder="Descreva os parâmetros da missão..." {...field} className="cad-box" />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="agentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Unidade Designada</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="cad-box font-mono">
                                <SelectValue placeholder="SELECIONAR UNIDADE" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {agentsQuery.data?.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id.toString()} className="font-mono text-xs uppercase">
                                  {agent.name} (ID: {agent.id})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priorityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Nível de Prioridade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="cad-box font-mono">
                                <SelectValue placeholder="DEFINIR PRIORIDADE" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1" className="font-mono text-xs uppercase">BAIXA</SelectItem>
                              <SelectItem value="2" className="font-mono text-xs uppercase">MÉDIA</SelectItem>
                              <SelectItem value="3" className="font-mono text-xs uppercase">ALTA</SelectItem>
                              <SelectItem value="4" className="font-mono text-xs uppercase">CRÍTICA</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-foreground/10">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="uppercase font-bold text-[10px] tracking-widest h-11 px-6">
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createTaskMutation.isPending}
                      className="bg-accent text-accent-foreground font-bold uppercase tracking-widest text-[10px] h-11 px-8"
                    >
                      {createTaskMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Confirmar Protocolo
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="px-6 py-4 border-b border-foreground/20 bg-foreground/5">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="BUSCAR POR TÍTULO OU DESCRIÇÃO..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 cad-box h-10 font-mono text-xs uppercase"
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <Filter className="w-3 h-3 text-accent" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 cad-box h-10 font-mono text-[10px] uppercase">
                <SelectValue placeholder="STATUS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">TODOS OS STATUS</SelectItem>
                <SelectItem value="100">STAGED</SelectItem>
                <SelectItem value="110">PROGRESS</SelectItem>
                <SelectItem value="120">PAUSED</SelectItem>
                <SelectItem value="130">DONE</SelectItem>
                <SelectItem value="200">FAIL</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40 cad-box h-10 font-mono text-[10px] uppercase">
                <SelectValue placeholder="PRIORIDADE" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">TODAS PRIORIDADES</SelectItem>
                <SelectItem value="1">BAIXA</SelectItem>
                <SelectItem value="2">MÉDIA</SelectItem>
                <SelectItem value="3">ALTA</SelectItem>
                <SelectItem value="4">CRÍTICA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabela de Missões */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <Card className="cad-card p-0 overflow-hidden border-2">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-foreground/5">
                  <TableRow className="border-b-2 border-foreground/20 hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-accent py-4 pl-6">ID</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-accent py-4">Protocolo de Missão</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-accent py-4">Unidade</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-accent py-4">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-accent py-4">Prioridade</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-accent py-4 text-right pr-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasksQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20">
                        <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-2" />
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Sincronizando Banco de Dados...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => {
                      const status = STATUS_MAP[task.statusId] || { label: `ID_${task.statusId}`, color: "bg-muted text-muted-foreground" };
                      const priority = PRIORITY_MAP[task.priorityId] || { label: "N/A", color: "text-muted-foreground" };
                      const assignedAgent = agentsQuery.data?.find(a => a.id === task.agentId);

                      return (
                        <TableRow key={task.id} className="border-b border-foreground/10 hover:bg-accent/[0.02] transition-colors group">
                          <TableCell className="font-mono text-accent text-xs pl-6">#{task.id.toString().padStart(4, '0')}</TableCell>
                          <TableCell className="py-4">
                            <div className="font-black text-xs uppercase tracking-tight group-hover:text-accent transition-colors">{task.title}</div>
                            {task.description && <div className="text-[10px] text-muted-foreground italic mt-0.5 truncate max-w-xs">{task.description}</div>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Cpu className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] font-bold uppercase tracking-tighter">{assignedAgent?.name || "NÃO ATRIBUÍDO"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${status.color} border-none text-[9px] font-black tracking-widest h-5 rounded-none`}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${priority.color}`}>
                              {priority.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button variant="outline" size="sm" className="h-7 text-[9px] font-bold uppercase border-foreground/20 hover:border-accent hover:text-accent">
                              Abrir Terminal
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Nenhum registro encontrado nos parâmetros atuais.</p>
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
