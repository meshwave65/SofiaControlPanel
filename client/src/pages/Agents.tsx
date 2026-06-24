import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/lib/trpc";
import { Plus, Pause, Play, X, Zap, Shield, Activity, Settings, Cpu, Terminal, Info, History, Server, HardDrive, Loader2, CheckCircle2, AlertCircle, ListTodo, ExternalLink } from "lucide-center";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const agentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  version: z.string().default("1.0.0"),
  manusAccount: z.string().email("Email inválido").optional().or(z.literal("")),
  manusPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
  manusToken: z.string().optional(),
});

type AgentInput = z.infer<typeof agentSchema>;

export default function Agents() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Queries
  const agentsQuery = trpc.agents.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const logsQuery = trpc.activityLogs.getByAgent.useQuery(
    { agentId: selectedAgent?.id || 0 },
    { enabled: !!selectedAgent && isDetailsOpen, refetchInterval: 5000 }
  );

  const tasksQuery = trpc.tasks.getByAgent.useQuery(
    { agentId: selectedAgent?.id || 0 },
    { enabled: !!selectedAgent && isDetailsOpen, refetchInterval: 10000 }
  );

  // Mutations
  const createAgentMutation = trpc.agents.create.useMutation({
    onSuccess: () => {
      toast.success("Agente criado com sucesso!");
      agentsQuery.refetch();
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`Erro ao criar agente: ${error.message}`);
    },
  });

  const updateStatusMutation = trpc.agents.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      agentsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    },
  });

  // Form
  const form = useForm<AgentInput>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: "",
      description: "",
      version: "1.0.0",
      manusAccount: "",
      manusPassword: "",
      manusToken: "",
    },
  });

  const onSubmit = (data: AgentInput) => {
    createAgentMutation.mutate(data);
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    form.reset({
      name: "",
      description: "",
      version: "1.0.0",
      manusAccount: "",
      manusPassword: "",
      manusToken: "",
    });
    setIsOpen(true);
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
            <h1 className="text-4xl font-bold mb-2 uppercase tracking-tighter italic">Unidades Sofia</h1>
            <p className="text-muted-foreground font-mono text-xs">
              SISTEMA DE CONTROLE CENTRAL // AGENTES ATIVOS: <span className="text-accent font-bold">{agentsQuery.data?.length || 0}</span>
            </p>
          </div>
          <Button 
            onClick={handleOpenCreate}
            className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-2 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] font-bold uppercase tracking-widest text-xs h-11"
          >
            <Plus className="w-4 h-4" /> Inicializar Nova Unidade
          </Button>
        </div>
      </div>

      {/* Grid de Agentes */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {agentsQuery.isLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground animate-pulse font-mono uppercase text-xs tracking-widest">Escaneando rede de agentes...</p>
            </div>
          ) : agentsQuery.data && agentsQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agentsQuery.data.map((agent) => (
                <Card key={agent.id} className="cad-card relative overflow-hidden group border-2 hover:border-accent/50 transition-all duration-300 bg-card/50 backdrop-blur-sm p-5">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-accent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex justify-between items-start mb-5 pl-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-foreground tracking-tighter uppercase italic">{agent.name}</h3>
                        <span className="text-[9px] bg-foreground/10 px-1.5 py-0.5 rounded font-mono border border-foreground/20">v{agent.version || "1.0.0"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{agent.status === 'online' ? 'Unidade Operacional' : 'Unidade Offline'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[9px] font-mono opacity-40 bg-foreground/5 px-2 py-1 rounded">KERNEL-ID: {agent.id.toString().padStart(4, '0')}</span>
                    </div>
                  </div>

                  {agent.description && (
                    <div className="bg-foreground/5 p-3 rounded border border-foreground/10 mb-5 ml-2">
                      <p className="text-[11px] text-foreground/70 leading-relaxed italic font-medium">"{agent.description}"</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-5 ml-2">
                    <div className="bg-accent/5 p-2.5 rounded flex flex-col border border-accent/10">
                      <span className="text-[8px] uppercase text-muted-foreground font-bold tracking-tighter">Estabilidade</span>
                      <span className="text-sm font-mono text-accent font-bold">{agent.status === 'online' ? '99.9%' : '0.0%'}</span>
                    </div>
                    <div className="bg-accent/5 p-2.5 rounded flex flex-col border border-accent/10">
                      <span className="text-[8px] uppercase text-muted-foreground font-bold tracking-tighter">Missões Ativas</span>
                      <span className="text-sm font-mono text-accent font-bold">0</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-2">
                    {agent.status === "online" || agent.status === "idle" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 flex items-center justify-center gap-2 h-10 font-black uppercase text-[10px] tracking-widest"
                        onClick={() => updateStatusMutation.mutate({ id: agent.id, status: "paused" })}
                      >
                        <Pause className="w-3 h-3" /> Pausar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 flex items-center justify-center gap-2 h-10 font-black uppercase text-[10px] tracking-widest bg-green-500/20 text-green-500 hover:bg-green-500/30"
                        onClick={() => updateStatusMutation.mutate({ id: agent.id, status: "online" })}
                      >
                        <Play className="w-3 h-3" /> Retomar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-10 h-10 p-0 flex items-center justify-center border-2 border-foreground/20 hover:border-accent hover:text-accent"
                      onClick={() => {
                        setSelectedAgent(agent);
                        setIsDetailsOpen(true);
                      }}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-20 border-2 border-dashed border-foreground/20 bg-card/30">
              <Cpu className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold uppercase tracking-tighter mb-2">Nenhuma Unidade Detectada</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">Inicialize uma nova unidade de controle Sofia para começar a gerenciar missões e agentes autônomos.</p>
              <Button onClick={handleOpenCreate} className="bg-accent text-accent-foreground font-bold uppercase tracking-widest">
                <Plus className="w-4 h-4 mr-2" /> Ativar Primeira Unidade
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Detalhes e Controle */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-card border-2 border-foreground/20 max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <div className="technical-header px-6 py-5 border-b-2 border-foreground/20 bg-foreground/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${selectedAgent?.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                <Terminal className="w-6 h-6 text-accent" />
                Terminal Sofia: {selectedAgent?.name}
              </h2>
            </div>
            <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
              <span>STATUS: {selectedAgent?.status?.toUpperCase()}</span>
              <span>ID: #{selectedAgent?.id?.toString().padStart(4, '0')}</span>
            </div>
          </div>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 border-b border-foreground/10 bg-foreground/5">
              <TabsList className="bg-transparent h-12 gap-6">
                <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none px-0 font-bold uppercase text-[10px] tracking-widest">Visão Geral</TabsTrigger>
                <TabsTrigger value="missions" className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none px-0 font-bold uppercase text-[10px] tracking-widest">Missões & Tarefas</TabsTrigger>
                <TabsTrigger value="logs" className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none px-0 font-bold uppercase text-[10px] tracking-widest">Logs de Atividade</TabsTrigger>
                <TabsTrigger value="config" className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent rounded-none px-0 font-bold uppercase text-[10px] tracking-widest">Configuração Manus</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <TabsContent value="overview" className="m-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-4 bg-foreground/5 border-foreground/10 flex flex-col gap-1">
                    <span className="text-[9px] uppercase text-muted-foreground font-bold">Uptime Operacional</span>
                    <span className="text-2xl font-mono text-accent font-black">99.98%</span>
                    <div className="h-1 w-full bg-foreground/10 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-accent w-[99.98%]"></div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-foreground/5 border-foreground/10 flex flex-col gap-1">
                    <span className="text-[9px] uppercase text-muted-foreground font-bold">Consenso de IA</span>
                    <span className="text-2xl font-mono text-accent font-black">HIGH</span>
                    <div className="h-1 w-full bg-foreground/10 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-accent w-[85%]"></div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-foreground/5 border-foreground/10 flex flex-col gap-1">
                    <span className="text-[9px] uppercase text-muted-foreground font-bold">Latência de Resposta</span>
                    <span className="text-2xl font-mono text-accent font-black">124ms</span>
                    <div className="h-1 w-full bg-foreground/10 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-accent w-[15%]"></div>
                    </div>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-accent" /> Telemetria do Sistema
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span>Processamento (CPU)</span>
                        <span>{selectedAgent?.status === 'online' ? '18%' : '0%'}</span>
                      </div>
                      <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                        <div className="h-full bg-accent transition-all duration-1000" style={{ width: selectedAgent?.status === 'online' ? '18%' : '0%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span>Memória Alocada (RAM)</span>
                        <span>{selectedAgent?.status === 'online' ? '42%' : '0%'}</span>
                      </div>
                      <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                        <div className="h-full bg-accent transition-all duration-1000" style={{ width: selectedAgent?.status === 'online' ? '42%' : '0%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="missions" className="m-0 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-accent" /> Fila de Missões Atribuídas
                  </h4>
                  <Button size="sm" variant="outline" className="h-7 text-[9px] font-bold uppercase tracking-tighter">
                    <Plus className="w-3 h-3 mr-1" /> Nova Missão
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {tasksQuery.isLoading ? (
                    <div className="py-10 text-center">
                      <Loader2 className="w-6 h-6 text-accent animate-spin mx-auto mb-2" />
                      <span className="text-[10px] font-mono uppercase opacity-50">Sincronizando tarefas...</span>
                    </div>
                  ) : tasksQuery.data && tasksQuery.data.length > 0 ? (
                    tasksQuery.data.map((task) => (
                      <Card key={task.id} className="p-4 bg-foreground/5 border-foreground/10 hover:border-accent/30 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded bg-accent/10 flex items-center justify-center text-accent font-mono text-xs font-bold`}>
                              #{task.id}
                            </div>
                            <div>
                              <h5 className="text-sm font-bold uppercase tracking-tight">{task.title}</h5>
                              <p className="text-[10px] text-muted-foreground font-mono">{task.description || "Sem descrição operacional"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                              task.statusId === 130 ? 'bg-green-500/10 text-green-500 border-green-500/30' : 
                              task.statusId === 110 ? 'bg-blue-500/10 text-blue-500 border-blue-500/30 animate-pulse' :
                              'bg-accent/10 text-accent border-accent/30'
                            }`}>
                              {task.statusId === 130 ? 'COMPLETO' : task.statusId === 110 ? 'EM CURSO' : 'STAGED'}
                            </span>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-accent/20">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="py-10 text-center border-2 border-dashed border-foreground/10 rounded-lg">
                      <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest">Nenhuma missão em curso para esta unidade</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="m-0 h-full flex flex-col">
                <div className="bg-black/60 p-5 rounded-lg border border-foreground/10 font-mono text-[11px] flex-1 flex flex-col min-h-[400px]">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold uppercase text-accent flex items-center gap-2 font-sans tracking-widest">
                      <History className="w-4 h-4" /> Log de Eventos do Kernel
                    </h4>
                    <span className="text-[9px] text-muted-foreground animate-pulse">SISTEMA EM ESCUTA...</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-3">
                    {logsQuery.isLoading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3">
                        <Loader2 className="w-8 h-8 text-accent animate-spin" />
                        <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-widest">Estabelecendo túnel seguro...</p>
                      </div>
                    ) : logsQuery.data && logsQuery.data.length > 0 ? (
                      logsQuery.data.map((log: any) => (
                        <div key={log.id} className="border-l-2 border-accent/40 pl-4 py-1.5 hover:bg-accent/5 transition-colors group">
                          <div className="flex justify-between mb-1">
                            <span className="text-accent/70 font-bold">[{new Date(log.createdAt).toLocaleString()}]</span>
                            <span className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity">EVT-ID: {log.id}</span>
                          </div>
                          <span className="text-foreground/90 leading-relaxed">{log.details || 'Evento de sistema registrado pela unidade central'}</span>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-2 opacity-50">
                        <div className="text-green-500">[{new Date().toISOString()}] KERNEL-BOOT: INICIANDO SEQUÊNCIA DE CARREGAMENTO...</div>
                        <div className="text-green-500">[{new Date().toISOString()}] NETWORK-UP: CONEXÃO ESTABELECIDA COM SUCESSO.</div>
                        <div className="text-green-500">[{new Date().toISOString()}] AUTH-OK: CREDENCIAIS MANUS VALIDADA.</div>
                        <div className="text-muted-foreground italic mt-6 font-sans">Aguardando telemetria adicional da unidade...</div>
                      </div>
                    )}
                  </div>
                  <div className="mt-5 pt-4 border-t border-foreground/10 flex gap-3">
                    <div className="relative flex-1">
                      <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-accent/50" />
                      <Input 
                        placeholder="Enviar comando direto ao kernel..." 
                        className="h-10 bg-transparent border-accent/20 pl-9 text-[11px] focus-visible:ring-accent font-mono"
                      />
                    </div>
                    <Button className="h-10 px-6 bg-accent text-accent-foreground text-xs font-black uppercase tracking-widest hover:bg-accent/80 shadow-[0_0_10px_rgba(var(--accent-rgb),0.2)]">Executar</Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="config" className="m-0 space-y-6">
                <div className="bg-accent/5 p-6 rounded-lg border border-accent/20">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-accent" />
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-accent">Protocolo de Autenticação Manus</h4>
                      <p className="text-[10px] text-muted-foreground font-mono">GERENCIAMENTO DE CREDENCIAIS DA UNIDADE</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Conta Vinculada (Email)</label>
                      <Input 
                        value={selectedAgent?.manusAccount || ""} 
                        readOnly
                        className="bg-foreground/5 border-foreground/20 font-mono text-xs h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status do Token</label>
                      <div className="h-11 flex items-center px-4 bg-foreground/5 border border-foreground/20 rounded-md font-mono text-xs text-accent">
                        {selectedAgent?.manusToken ? "● TOKEN ATIVO E VALIDADO" : "○ NENHUM TOKEN CONFIGURADO"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-accent/20 flex justify-end gap-3">
                    <Button variant="outline" className="font-bold uppercase text-[10px] tracking-widest h-10 border-foreground/20">Resetar Unidade</Button>
                    <Button className="bg-accent text-accent-foreground font-black uppercase text-[10px] tracking-widest h-10 px-6">Atualizar Credenciais</Button>
                  </div>
                </div>

                <Card className="p-5 border-yellow-500/30 bg-yellow-500/5">
                  <div className="flex gap-4">
                    <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0" />
                    <div>
                      <h5 className="text-xs font-black uppercase text-yellow-500 mb-1">Aviso de Segurança</h5>
                      <p className="text-[11px] text-foreground/70 leading-relaxed">As credenciais desta unidade são criptografadas e utilizadas apenas para comunicação direta com a infraestrutura Manus. Nunca compartilhe o token de sessão ou a chave de acesso.</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal de Criação (Reutilizado) */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-card border-2 border-foreground/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 uppercase italic tracking-tighter">
              <Cpu className="w-6 h-6 text-accent" />
              {isEditMode ? "Atualizar Unidade Sofia" : "Nova Unidade de Controle Sofia"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Terminal className="w-3 h-3" /> Identificador
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: SOFIA-CTRL-01" {...field} className="bg-input border-foreground/30 font-mono h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest">Versão do Kernel</FormLabel>
                      <FormControl>
                        <Input placeholder="1.0.0" {...field} className="bg-input border-foreground/30 h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest">Diretrizes Operacionais</FormLabel>
                    <FormControl>
                      <Input placeholder="Defina o propósito principal desta unidade..." {...field} className="bg-input border-foreground/30 h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-accent/5 p-5 rounded-lg border border-accent/20">
                <div className="flex items-center gap-2 mb-4 text-accent">
                  <Shield className="w-5 h-5" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Protocolo de Autenticação Manus</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="manusAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[9px] font-bold uppercase opacity-70">Conta (Email)</FormLabel>
                        <FormControl>
                          <Input placeholder="email@manus.im" {...field} className="bg-input border-foreground/30 h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="manusPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[9px] font-bold uppercase opacity-70">Chave (Senha)</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="bg-input border-foreground/30 h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="manusToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[9px] font-bold uppercase opacity-70">Token de Sessão (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Insira o token para bypass de login..." {...field} className="bg-input border-foreground/30 font-mono text-[10px] h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Button 
                  type="submit" 
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-sm font-black uppercase tracking-widest"
                  disabled={createAgentMutation.isPending}
                >
                  {createAgentMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Inicializando Kernel...</span>
                    </div>
                  ) : (
                    isEditMode ? "Atualizar Unidade" : "Ativar Unidade de Controle"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  className="h-12 border-foreground/30 font-bold uppercase tracking-widest text-[10px] px-6"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
