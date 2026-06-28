import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/lib/trpc";
import { Plus, Pause, Play, X, Zap, Shield, Activity, Settings, Cpu, Terminal, Info, History, Server, HardDrive, Loader2, CheckCircle2, AlertCircle, ListTodo, ExternalLink, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const agentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  version: z.string().default("1.0.0").regex(/^\d+\.\d+\.\d+$/, "Versão deve estar no formato X.Y.Z"),
  manusAccount: z.string().email("Email inválido").optional().or(z.literal("")),
  manusPassword: z.string().min(0).optional(),
  manusToken: z.string().optional(),
});

type AgentInput = z.infer<typeof agentSchema>;

export default function Agents() {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Queries
  const agentsQuery = trpc.agents.list.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 10000,
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
      toast.success("✓ Unidade Sofia inicializada com sucesso!");
      agentsQuery.refetch();
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`✗ Erro ao criar agente: ${error.message}`);
    },
  });

  const updateAgentMutation = trpc.agents.update.useMutation({
    onSuccess: () => {
      toast.success("✓ Configurações da unidade atualizadas!");
      agentsQuery.refetch();
      setIsOpen(false);
      setIsEditMode(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`✗ Erro ao atualizar agente: ${error.message}`);
    },
  });

  const deleteAgentMutation = trpc.agents.delete.useMutation({
    onSuccess: () => {
      toast.success("✓ Unidade desativada permanentemente!");
      agentsQuery.refetch();
      setIsDeleteConfirmOpen(false);
      setIsDetailsOpen(false);
    },
    onError: (error) => {
      toast.error(`✗ Erro ao excluir agente: ${error.message}`);
    },
  });

  const updateStatusMutation = trpc.agents.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("✓ Status atualizado!");
      agentsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`✗ Erro ao atualizar status: ${error.message}`);
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
    if (isEditMode && selectedAgent) {
      updateAgentMutation.mutate({ id: selectedAgent.id, ...data });
    } else {
      createAgentMutation.mutate(data);
    }
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

  const handleOpenEdit = (agent: any) => {
    setIsEditMode(true);
    setSelectedAgent(agent);
    form.reset({
      name: agent.name,
      description: agent.description || "",
      version: agent.version || "1.0.0",
      manusAccount: agent.manusAccount || "",
      manusPassword: "",
      manusToken: agent.manusToken || "",
    });
    setIsOpen(true);
  };

  const calculateLastHeartbeat = (lastHeartbeat: string | null) => {
    if (!lastHeartbeat) return "Nunca";
    try {
      return formatDistanceToNow(new Date(lastHeartbeat), { addSuffix: true, locale: ptBR });
    } catch (e) {
      return "Indisponível";
    }
  };

  const isOnline = (agent: any) => {
    if (!agent.lastHeartbeat) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(agent.lastHeartbeat) > fiveMinutesAgo;
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
            <h1 className="text-4xl font-bold mb-2 uppercase tracking-tighter italic">Unidades Sofia</h1>
            <p className="text-muted-foreground font-mono text-xs">
              SISTEMA DE CONTROLE CENTRAL // AGENTES ATIVOS: <span className="text-accent font-bold">{agentsQuery.data?.length || 0}</span> // OPERADOR: <span className="text-accent font-bold">{user?.name || "DESCONHECIDO"}</span>
            </p>
          </div>
          <Button 
            onClick={handleOpenCreate}
            className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-2 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] font-bold uppercase tracking-widest text-xs h-11 px-6"
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
              {agentsQuery.data.map((agent) => {
                const online = isOnline(agent);
                return (
                  <Card key={agent.id} className="cad-card relative overflow-hidden group border-2 hover:border-accent/50 transition-all duration-300 bg-card/50 backdrop-blur-sm p-5">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${online ? 'bg-green-500' : 'bg-accent'} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                    
                    <div className="flex justify-between items-start mb-5 pl-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-foreground tracking-tighter uppercase italic">{agent.name}</h3>
                          <span className="text-[9px] bg-foreground/10 px-1.5 py-0.5 rounded font-mono border border-foreground/20">v{agent.version || "1.0.0"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{online ? 'Unidade Operacional' : 'Unidade Offline'}</span>
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
                        <span className="text-[8px] uppercase text-muted-foreground font-bold tracking-tighter">Último Sinal</span>
                        <span className="text-[10px] font-mono text-accent font-bold truncate">{calculateLastHeartbeat(agent.lastHeartbeat)}</span>
                      </div>
                      <div className="bg-accent/5 p-2.5 rounded flex flex-col border border-accent/10">
                        <span className="text-[8px] uppercase text-muted-foreground font-bold tracking-tighter">Status Interno</span>
                        <span className="text-sm font-mono text-accent font-bold uppercase">{agent.status}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-2 h-10 font-black uppercase text-[10px] tracking-widest"
                        onClick={() => {
                          setSelectedAgent(agent);
                          setIsDetailsOpen(true);
                        }}
                      >
                        <Settings className="w-3 h-3" /> Painel
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-10 h-10 p-0 flex items-center justify-center border-2 border-foreground/20 hover:border-accent hover:text-accent"
                        onClick={() => handleOpenEdit(agent)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
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
              <div className={`w-3 h-3 rounded-full ${isOnline(selectedAgent || {}) ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                <Terminal className="w-6 h-6 text-accent" />
                Terminal Sofia: {selectedAgent?.name}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-8 text-[10px] font-bold uppercase"
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                <Trash2 className="w-3 h-3 mr-2" /> Deletar Unidade
              </Button>
              <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
                <span>STATUS: {selectedAgent?.status?.toUpperCase()}</span>
                <span>ID: #{selectedAgent?.id?.toString().padStart(4, '0')}</span>
              </div>
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

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-6">
                <TabsContent value="overview" className="m-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-4 bg-foreground/5 border-foreground/10 flex flex-col gap-1">
                      <span className="text-[9px] uppercase text-muted-foreground font-bold">Último Heartbeat</span>
                      <span className="text-xl font-mono text-accent font-black">{calculateLastHeartbeat(selectedAgent?.lastHeartbeat)}</span>
                    </Card>
                    <Card className="p-4 bg-foreground/5 border-foreground/10 flex flex-col gap-1">
                      <span className="text-[9px] uppercase text-muted-foreground font-bold">Tarefas Atribuídas</span>
                      <span className="text-2xl font-mono text-accent font-black">{tasksQuery.data?.length || 0}</span>
                    </Card>
                    <Card className="p-4 bg-foreground/5 border-foreground/10 flex flex-col gap-1">
                      <span className="text-[9px] uppercase text-muted-foreground font-bold">Status de Conexão</span>
                      <span className="text-2xl font-mono text-accent font-black uppercase">{isOnline(selectedAgent || {}) ? 'Estável' : 'Perdida'}</span>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4 text-accent" /> Telemetria do Sistema
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-foreground/10 rounded bg-foreground/5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold uppercase">Carga de Processamento</span>
                          <span className="text-[10px] font-mono">42%</span>
                        </div>
                        <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
                          <div className="h-full bg-accent w-[42%]"></div>
                        </div>
                      </div>
                      <div className="p-4 border border-foreground/10 rounded bg-foreground/5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold uppercase">Uso de Memória</span>
                          <span className="text-[10px] font-mono">2.4GB / 8GB</span>
                        </div>
                        <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
                          <div className="h-full bg-accent w-[30%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="missions" className="m-0">
                  {tasksQuery.isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent" /></div>
                  ) : tasksQuery.data && tasksQuery.data.length > 0 ? (
                    <div className="space-y-3">
                      {tasksQuery.data.map((task) => (
                        <div key={task.id} className="p-4 border border-foreground/10 rounded bg-foreground/5 flex justify-between items-center">
                          <div>
                            <h5 className="text-sm font-bold uppercase tracking-tight">{task.title}</h5>
                            <p className="text-[10px] text-muted-foreground font-mono">ID: #{task.id.toString().padStart(5, '0')} // STATUS: {task.statusId}</p>
                          </div>
                          <Button variant="outline" size="sm" className="h-7 text-[9px] font-bold uppercase">Detalhes</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground font-mono text-xs uppercase">Nenhuma missão atribuída a esta unidade.</div>
                  )}
                </TabsContent>

                <TabsContent value="logs" className="m-0">
                  {logsQuery.isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent" /></div>
                  ) : logsQuery.data && logsQuery.data.length > 0 ? (
                    <div className="space-y-2 font-mono text-[10px]">
                      {logsQuery.data.map((log) => (
                        <div key={log.id} className="p-2 border-l-2 border-accent bg-foreground/5 flex gap-4">
                          <span className="text-muted-foreground">[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                          <span className="text-accent font-bold uppercase">EVENT_{log.eventTypeId}:</span>
                          <span className="flex-1">{log.details || "Nenhum detalhe fornecido"}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground font-mono text-xs uppercase">Nenhum log de atividade registrado.</div>
                  )}
                </TabsContent>

                <TabsContent value="config" className="m-0 space-y-6">
                  <div className="p-6 border-2 border-dashed border-accent/20 bg-accent/5 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-6 h-6 text-accent" />
                      <h4 className="text-sm font-black uppercase tracking-widest">Credenciais de Acesso Manus</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold text-muted-foreground">Account ID</label>
                        <div className="p-3 bg-card border border-foreground/10 font-mono text-xs rounded truncate">
                          {selectedAgent?.manusAccount || "NÃO CONFIGURADO"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold text-muted-foreground">Access Token</label>
                        <div className="p-3 bg-card border border-foreground/10 font-mono text-xs rounded truncate">
                          {selectedAgent?.manusToken ? "••••••••••••••••" : "NÃO CONFIGURADO"}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal de Criação/Edição - MELHORADO */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-card border-2 border-foreground/20 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-foreground/10 pb-4 mb-4 sticky top-0 bg-card z-10">
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-2">
              <Cpu className="w-6 h-6 text-accent" />
              {isEditMode ? "Atualizar Configurações da Unidade Sofia" : "Inicializar Nova Unidade Sofia"}
            </DialogTitle>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-2">
              {isEditMode ? `Editando: ${selectedAgent?.name}` : "Configure os parâmetros da nova unidade"}
            </p>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-6">
              {/* Seção 1: Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                  <Info className="w-4 h-4" /> Informações Básicas da Unidade
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Identificador da Unidade *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: SOFIA-01, AGENT-ALPHA" 
                            {...field} 
                            className="cad-box font-mono uppercase" 
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Versão do Kernel *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="1.0.0" 
                            {...field} 
                            className="cad-box font-mono" 
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Diretriz Operacional (Descrição)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Breve descrição do propósito desta unidade (ex: Análise de dados, Automação, etc...)" 
                          {...field} 
                          className="cad-box" 
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Seção 2: Integração Manus AI */}
              <div className="space-y-4 p-4 border-2 border-dashed border-accent/30 bg-accent/5 rounded-lg">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Integração Manus AI (Opcional)
                </h3>
                <p className="text-[9px] text-muted-foreground font-mono">Configure as credenciais para conectar esta unidade à plataforma Manus AI e ativar recursos avançados.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="manusAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest">E-mail da Conta Manus</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="usuario@manus.im" 
                            {...field} 
                            className="cad-box font-mono" 
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="manusPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Senha da Conta</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••" 
                              {...field} 
                              className="cad-box font-mono pr-10" 
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="manusToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Token de Acesso API</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showToken ? "text" : "password"}
                            placeholder="sk-..." 
                            {...field} 
                            className="cad-box font-mono pr-10" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                          >
                            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-3 pt-4 border-t border-foreground/10">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)} 
                  className="uppercase font-bold text-[10px] tracking-widest h-11 px-6"
                >
                  Abortar Operação
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAgentMutation.isPending || updateAgentMutation.isPending}
                  className="bg-accent text-accent-foreground font-bold uppercase tracking-widest text-[10px] h-11 px-8 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]"
                >
                  {(createAgentMutation.isPending || updateAgentMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEditMode ? "Confirmar Atualização" : "Confirmar Inicialização"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="bg-card border-2 border-destructive/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-destructive flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Confirmar Desativação Permanente
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            Esta ação irá deletar permanentemente a unidade <span className="font-bold text-foreground">"{selectedAgent?.name}"</span> e todos os seus registros associados. Esta operação não pode ser desfeita.
          </p>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} className="uppercase font-bold text-[10px]">
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteAgentMutation.mutate({ id: selectedAgent.id })}
              disabled={deleteAgentMutation.isPending}
              className="uppercase font-bold text-[10px]"
            >
              {deleteAgentMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
