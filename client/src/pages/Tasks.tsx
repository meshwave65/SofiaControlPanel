
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Filter, Search, Calendar, AlertCircle, Cpu, CheckCircle2, Clock, PlayCircle, PauseCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";

const createTaskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional().default(""),
  agentId: z.string().optional().default(""),
  statusId: z.string().default("100"),
  priorityId: z.string().default("1"),
  dueDate: z.string().optional().default(""),
});

type CreateTaskInput = z.infer<typeof createTaskSchema>;

const STATUS_MAP: Record<string, { label: string, color: string, icon: any }> = {
  "100": { label: "STAGED", color: "border-slate-500/50 text-slate-400", icon: Clock },
  "110": { label: "PROGRESS", color: "border-blue-500/50 text-blue-400", icon: PlayCircle },
  "120": { label: "PAUSED", color: "border-yellow-500/50 text-yellow-400", icon: PauseCircle },
  "130": { label: "DONE", color: "border-green-500/50 text-green-400", icon: CheckCircle2 },
  "200": { label: "FAIL", color: "border-red-500/50 text-red-400", icon: XCircle },
};

const PRIORITY_MAP: Record<string, { label: string, color: string }> = {
  "1": { label: "BAIXA", color: "text-slate-400" },
  "2": { label: "MÉDIA", color: "text-blue-400" },
  "3": { label: "ALTA", color: "text-orange-400" },
  "4": { label: "CRÍTICA", color: "text-red-500" },
};

export default function Tasks() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Mock data para tarefas
  const [tasks, setTasks] = useState([
    { id: 1, title: "Análise de Portfólio Q3", description: "Avaliar ativos de tecnologia e saúde", agentId: 1, agentName: "Sofia-Alpha", statusId: "110", priorityId: "3", createdAt: new Date().toISOString() },
    { id: 2, title: "Scraping de Dados Competitivos", description: "Extrair preços de 15 concorrentes", agentId: 2, agentName: "Sofia-Beta", statusId: "130", priorityId: "2", createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, title: "Monitoramento de Sentiment Analysis", description: "Analisar Twitter para menções à marca", agentId: 1, agentName: "Sofia-Alpha", statusId: "100", priorityId: "4", createdAt: new Date(Date.now() - 43200000).toISOString() },
  ]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || task.statusId === filterStatus;
      const matchesPriority = filterPriority === "all" || task.priorityId === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, filterStatus, filterPriority]);

  const form = useForm<any>({
    resolver: zodResolver(createTaskSchema) as any,
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
    const newTask = {
      id: tasks.length + 1,
      ...data,
      agentName: data.agentId ? "Sofia-Alpha" : "Não Atribuído", // Mock assignment
      createdAt: new Date().toISOString(),
    };
    setTasks([newTask as any, ...tasks]);
    toast.success("Missão inicializada com sucesso!");
    setIsOpen(false);
    form.reset();
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
      <div className="technical-header px-6 py-8 border-b-2 border-foreground/30 bg-foreground/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">Registro de Missões</h1>
            <p className="text-muted-foreground font-mono text-xs uppercase">
              Total em Arquivo: <span className="text-accent font-bold">{tasks.length}</span> // Filtradas: <span className="text-accent font-bold">{filteredTasks.length}</span>
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-2 font-black uppercase tracking-widest text-xs h-12 px-8 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]">
                <Plus className="w-4 h-4" /> Nova Missão
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-2 border-foreground/20 max-w-2xl">
              <DialogHeader className="border-b border-foreground/10 pb-4 mb-4">
                <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-accent" />
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
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest">Título da Missão</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: ANÁLISE DE MERCADO SETORIAL" {...field} className="cad-box font-mono uppercase font-bold" />
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
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest">Objetivos Detalhados</FormLabel>
                        <FormControl>
                          <Input placeholder="Descreva os parâmetros da missão..." {...field} className="cad-box font-bold" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="agentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest">Unidade Designada</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="cad-box font-mono font-bold">
                                <SelectValue placeholder="SELECIONAR UNIDADE" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1" className="font-mono text-xs uppercase font-bold">SOFIA-ALPHA (ID: 0001)</SelectItem>
                              <SelectItem value="2" className="font-mono text-xs uppercase font-bold">SOFIA-BETA (ID: 0002)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priorityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest">Nível de Prioridade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="cad-box font-mono font-bold">
                                <SelectValue placeholder="DEFINIR PRIORIDADE" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1" className="font-mono text-xs uppercase font-bold">BAIXA</SelectItem>
                              <SelectItem value="2" className="font-mono text-xs uppercase font-bold">MÉDIA</SelectItem>
                              <SelectItem value="3" className="font-mono text-xs uppercase font-bold">ALTA</SelectItem>
                              <SelectItem value="4" className="font-mono text-xs uppercase font-bold">CRÍTICA</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter className="gap-3 pt-6 border-t border-foreground/10">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="uppercase font-black text-[10px] tracking-widest h-12 px-8 border-2">
                      Abortar
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-accent text-accent-foreground font-black uppercase tracking-widest text-[10px] h-12 px-10"
                    >
                      Confirmar Protocolo
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="px-6 py-4 border-b border-foreground/20 bg-foreground/5">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-6 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="BUSCAR POR TÍTULO OU DESCRIÇÃO..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 cad-box h-12 font-mono text-xs uppercase font-black"
            />
          </div>
          
          <div className="flex gap-4 items-center">
            <Filter className="w-4 h-4 text-accent" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48 cad-box h-12 font-mono text-[10px] uppercase font-black">
                <SelectValue placeholder="STATUS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-black uppercase text-[10px]">TODOS OS STATUS</SelectItem>
                {Object.entries(STATUS_MAP).map(([id, info]) => (
                  <SelectItem key={id} value={id} className="font-black uppercase text-[10px]">{info.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-48 cad-box h-12 font-mono text-[10px] uppercase font-black">
                <SelectValue placeholder="PRIORIDADE" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-black uppercase text-[10px]">TODAS PRIORIDADES</SelectItem>
                {Object.entries(PRIORITY_MAP).map(([id, info]) => (
                  <SelectItem key={id} value={id} className="font-black uppercase text-[10px]">{info.label}</SelectItem>
                ))}
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
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-accent py-6 pl-8">ID</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-accent py-6">Protocolo de Missão</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-accent py-6">Unidade</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-accent py-6">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-accent py-6">Prioridade</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-accent py-6 text-right pr-8">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => {
                      const status = STATUS_MAP[task.statusId] || STATUS_MAP["100"];
                      const priority = PRIORITY_MAP[task.priorityId] || PRIORITY_MAP["1"];
                      const StatusIcon = status.icon;

                      return (
                        <TableRow key={task.id} className="border-b border-foreground/10 hover:bg-foreground/5 transition-colors group">
                          <TableCell className="font-mono text-[10px] py-6 pl-8 font-black opacity-50">#{task.id.toString().padStart(4, '0')}</TableCell>
                          <TableCell className="py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-black uppercase tracking-tight group-hover:text-accent transition-colors">{task.title}</span>
                              <span className="text-[10px] text-muted-foreground font-bold truncate max-w-[300px] mt-1 italic">"{task.description}"</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="flex items-center gap-2">
                              <Cpu className="w-3 h-3 text-accent" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{task.agentName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <Badge variant="outline" className={`flex items-center gap-2 w-fit px-3 py-1 border-2 font-black text-[9px] ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-6">
                            <span className={`text-[10px] font-black tracking-widest ${priority.color}`}>{priority.label}</span>
                          </TableCell>
                          <TableCell className="py-6 text-right pr-8">
                            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest hover:text-accent hover:bg-accent/10">
                              Gerenciar
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-black">Nenhuma missão encontrada nos registros.</p>
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
