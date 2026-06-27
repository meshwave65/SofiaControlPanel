import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Settings, Edit, Trash2, Cpu, Terminal, Activity, History, ListTodo, Shield, Zap, AlertCircle, Key, Mail } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const agentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  version: z.string().default("1.0.0"),
  manusAccount: z.string().email("Email inválido").optional().or(z.literal("")),
  manusPassword: z.string().optional().or(z.literal("")),
  manusToken: z.string().optional().or(z.literal("")),
});

type AgentInput = z.infer<typeof agentSchema>;

export default function Agents() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Mock data para agentes
  const [agents, setAgents] = useState([
    { 
      id: 1, 
      name: "Sofia-Alpha", 
      description: "Unidade de análise estratégica primária", 
      version: "1.2.4", 
      status: "online", 
      lastHeartbeat: new Date().toISOString(),
      manusAccount: "sofia.alpha@manus.im",
      manusPassword: "••••••••",
      manusToken: "tk_sofia_alpha_prod_2024"
    },
    { 
      id: 2, 
      name: "Sofia-Beta", 
      description: "Processamento de dados em larga escala", 
      version: "1.1.0", 
      status: "online", 
      lastHeartbeat: new Date().toISOString(),
      manusAccount: "sofia.beta@manus.im",
      manusPassword: "••••••••",
      manusToken: "tk_sofia_beta_prod_2024"
    },
    { 
      id: 3, 
      name: "Sofia-Gamma", 
      description: "Interface de comunicação e suporte", 
      version: "1.0.5", 
      status: "offline", 
      lastHeartbeat: new Date(Date.now() - 3600000).toISOString(),
      manusAccount: "sofia.gamma@manus.im",
      manusPassword: "••••••••",
      manusToken: "tk_sofia_gamma_prod_2024"
    },
  ]);

  // Mock data para logs e tarefas
  const mockLogs = [
    { id: 1, action: "INITIALIZE", detail: "Sistema Sofia-Alpha carregado com sucesso", timestamp: new Date().toISOString() },
    { id: 2, action: "PROCESS", detail: "Análise de mercado setor-G7 concluída", timestamp: new Date(Date.now() - 600000).toISOString() },
    { id: 3, action: "HEARTBEAT", detail: "Sinal de vida recebido da unidade", timestamp: new Date(Date.now() - 300000).toISOString() },
  ];

  const mockTasks = [
    { id: 1, title: "Análise de Portfólio Q3", status: "Em Progresso", priority: "Alta" },
    { id: 2, title: "Scraping de Dados Competitivos", status: "Concluído", priority: "Média" },
  ];

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
      setAgents(agents.map(a => a.id === selectedAgent.id ? { ...a, ...data } : a));
      toast.success("Agente atualizado com sucesso!");
    } else {
      const newAgent = {
        id: agents.length + 1,
        ...data,
        status: "online",
        lastHeartbeat: new Date().toISOString()
      };
      setAgents([...agents, newAgent as any]);
      toast.success("Agente criado com sucesso!");
    }
    setIsOpen(false);
    form.reset();
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    form.reset({ name: "", description: "", version: "1.0.0", manusAccount: "", manusPassword: "", manusToken: "" });
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

  const handleDelete = () => {
    setAgents(agents.filter(a => a.id !== selectedAgent.id));
    toast.success("Agente excluído com sucesso!");
    setIsDeleteConfirmOpen(false);
    setIsDetailsOpen(false);
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
      <div className="technical-header px-8 py-10 border-b-4 border-accent bg-gradient-to-r from-background to-background/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-4 h-4 bg-accent animate-pulse"></div>
              <h1 className="text-5xl font-black uppercase tracking-tighter italic text-accent">UNIDADES SOFIA</h1>
            </div>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.3em] font-bold">
              SISTEMA DE CONTROLE CENTRAL // AGENTES ATIVOS: <span className="text-accent font-black text-sm">{agents.length}</span>
            </p>
          </div>
          <Button 
            onClick={handleOpenCreate}
            className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.5)] font-black uppercase tracking-[0.2em] text-sm h-14 px-8 border-2 border-accent"
          >
            <Plus className="w-5 h-5" /> Inicializar Unidade
          </Button>
        </div>
      </div>

      {/* Grid de Agentes */}
      <div className="px-8 py-12 bg-foreground/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent) => (
              <Card key={agent.id} className="cad-card relative overflow-hidden group border-4 hover:border-accent transition-all duration-300 bg-card/80 backdrop-blur-sm p-8 shadow-2xl">
                <div className={`absolute top-0 left-0 w-3 h-full ${agent.status === 'online' ? 'bg-green-500' : 'bg-red-500'} opacity-40 group-hover:opacity-100 transition-opacity`}></div>
                
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Cpu className="w-6 h-6 text-accent" />
                      <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">{agent.name}</h3>
                      <span className="text-[10px] bg-accent/20 px-3 py-1 rounded-none font-mono border-2 border-accent font-black">V{agent.version}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className={`w-3 h-3 rounded-none ${agent.status === 'online' ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.7)]' : 'bg-red-500'}`}></div>
                      <span className="text-[11px] text-muted-foreground uppercase font-black tracking-widest">{agent.status === 'online' ? 'OPERACIONAL' : 'OFFLINE'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono opacity-50 bg-foreground/10 px-3 py-1 rounded-none font-bold border border-foreground/20">ID: {agent.id.toString().padStart(4, '0')}</span>
                </div>

                <div className="bg-accent/5 p-5 rounded-none border-2 border-accent/20 mb-8 min-h-[70px]">
                  <p className="text-[12px] text-foreground/80 leading-relaxed italic font-bold">"{agent.description}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 bg-foreground/5 p-4 rounded-none border-2 border-foreground/10">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase text-muted-foreground font-black tracking-[0.2em] mb-2">Conta Manus</span>
                    <span className="text-[11px] font-mono text-accent font-black truncate">{agent.manusAccount}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase text-muted-foreground font-black tracking-[0.2em] mb-2">Token</span>
                    <span className="text-[11px] font-mono text-accent font-black truncate">{agent.manusToken?.substring(0, 15)}...</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2 h-12 font-black uppercase text-[11px] tracking-[0.15em] border-2 hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      setSelectedAgent(agent);
                      setIsDetailsOpen(true);
                    }}
                  >
                    <Settings className="w-4 h-4" /> Painel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-12 h-12 p-0 flex items-center justify-center border-2 border-foreground/30 hover:border-accent hover:text-accent hover:bg-accent/10"
                    onClick={() => handleOpenEdit(agent)}
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-card border-4 border-accent max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <div className="technical-header px-8 py-8 border-b-4 border-accent bg-gradient-to-r from-foreground/10 to-transparent flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-none ${selectedAgent?.status === 'online' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.7)]' : 'bg-red-500'}`}></div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                <Terminal className="w-8 h-8 text-accent" />
                Terminal Sofia: {selectedAgent?.name}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-11 text-[11px] font-black uppercase tracking-[0.15em] px-6 border-2 border-red-600"
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Deletar Unidade
              </Button>
              <div className="flex flex-col items-end font-mono text-[10px] text-muted-foreground font-bold uppercase">
                <span>STATUS: {selectedAgent?.status?.toUpperCase()}</span>
                <span>KERNEL-ID: #{selectedAgent?.id?.toString().padStart(4, '0')}</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-8 border-b-2 border-accent/30 bg-foreground/5">
              <TabsList className="bg-transparent h-16 gap-8">
                <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none px-0 font-black uppercase text-[11px] tracking-[0.2em]">Visão Geral</TabsTrigger>
                <TabsTrigger value="config" className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none px-0 font-black uppercase text-[11px] tracking-[0.2em]">Configuração Manus</TabsTrigger>
                <TabsTrigger value="missions" className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none px-0 font-black uppercase text-[11px] tracking-[0.2em]">Missões Ativas</TabsTrigger>
                <TabsTrigger value="logs" className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none px-0 font-black uppercase text-[11px] tracking-[0.2em]">Logs de Sistema</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden p-8">
              <ScrollArea className="h-full pr-4">
                <TabsContent value="overview" className="m-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="cad-card p-6 border-2 bg-foreground/5">
                      <div className="flex items-center gap-3 mb-4 text-accent">
                        <Shield className="w-6 h-6" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Segurança de Rede</h4>
                      </div>
                      <p className="text-3xl font-mono font-black text-accent">CRIPTOGRAFADO</p>
                      <p className="text-[10px] text-muted-foreground mt-3 uppercase font-bold">Protocolo TLS 1.3 Ativo</p>
                    </Card>
                    <Card className="cad-card p-6 border-2 bg-foreground/5">
                      <div className="flex items-center gap-3 mb-4 text-accent">
                        <Zap className="w-6 h-6" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Latência</h4>
                      </div>
                      <p className="text-3xl font-mono font-black text-accent">124ms</p>
                      <p className="text-[10px] text-muted-foreground mt-3 uppercase font-bold">Via Manus Cloud</p>
                    </Card>
                    <Card className="cad-card p-6 border-2 bg-foreground/5">
                      <div className="flex items-center gap-3 mb-4 text-accent">
                        <Activity className="w-6 h-6" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">CPU</h4>
                      </div>
                      <p className="text-3xl font-mono font-black text-accent">12.5%</p>
                      <p className="text-[10px] text-muted-foreground mt-3 uppercase font-bold">Otimizado</p>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="config" className="m-0 space-y-6">
                  <div className="bg-accent/10 border-4 border-accent p-6 rounded-none">
                    <h4 className="text-[12px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                      <Mail className="w-5 h-5 text-accent" /> Credenciais da Conta Manus
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground mb-2 block">E-mail da Conta</label>
                        <div className="bg-foreground/10 p-4 rounded-none border-2 border-accent/30 font-mono text-sm font-bold text-foreground">
                          {selectedAgent?.manusAccount}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground mb-2 block">Token de Acesso</label>
                        <div className="bg-foreground/10 p-4 rounded-none border-2 border-accent/30 font-mono text-sm font-bold text-accent">
                          {selectedAgent?.manusToken}
                        </div>
                      </div>
                      <div className="bg-yellow-500/10 border-2 border-yellow-500/50 p-4 rounded-none">
                        <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">⚠️ Credenciais Sincronizadas com Manus Cloud</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="missions" className="m-0">
                  <div className="space-y-4">
                    {mockTasks.map(task => (
                      <div key={task.id} className="bg-foreground/5 border-2 border-foreground/20 p-5 flex justify-between items-center group hover:border-accent/50 transition-all">
                        <div className="flex items-center gap-4">
                          <ListTodo className="w-5 h-5 text-accent" />
                          <div>
                            <p className="text-sm font-black uppercase tracking-tight">{task.title}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Prioridade: {task.priority}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-accent/10 text-accent px-4 py-2 rounded-none border-2 border-accent/30 font-black uppercase">{task.status}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="logs" className="m-0">
                  <div className="font-mono text-[11px] space-y-3 bg-foreground/5 p-4 rounded-none border-2 border-foreground/10">
                    {mockLogs.map(log => (
                      <div key={log.id} className="flex gap-4 p-3 border-b-2 border-foreground/10 hover:bg-foreground/10 transition-colors">
                        <span className="text-muted-foreground font-bold">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className="text-accent font-black uppercase">[{log.action}]</span>
                        <span className="text-foreground/80 font-bold">{log.detail}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </ScrollArea>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal de Criação/Edição */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-card border-4 border-accent max-w-3xl">
          <DialogHeader className="border-b-2 border-accent pb-6 mb-6">
            <DialogTitle className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4">
              <Cpu className="w-8 h-8 text-accent" />
              {isEditMode ? "Configurar Unidade" : "Inicializar Unidade"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 block">Identificador da Unidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: SOFIA-ALPHA" {...field} className="cad-box font-mono uppercase font-black text-sm h-12 border-2" />
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
                      <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 block">Versão de Kernel</FormLabel>
                      <FormControl>
                        <Input placeholder="1.0.0" {...field} className="cad-box font-mono font-black text-sm h-12 border-2" />
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
                    <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 block">Diretrizes Operacionais</FormLabel>
                    <FormControl>
                      <Input placeholder="Descreva a função principal desta unidade..." {...field} className="cad-box font-bold text-sm h-12 border-2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="border-t-2 border-accent pt-8 mt-8">
                <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-accent mb-6 flex items-center gap-3">
                  <Key className="w-5 h-5" /> Credenciais Manus
                </h4>
                <div className="grid grid-cols-1 gap-6 bg-accent/5 p-6 rounded-none border-2 border-accent/20">
                  <FormField
                    control={form.control}
                    name="manusAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
                          <Mail className="w-4 h-4 text-accent" /> E-mail Manus
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="agente@manus.im" {...field} className="cad-box font-mono font-black text-sm h-12 border-2" />
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
                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
                          <Key className="w-4 h-4 text-accent" /> Chave de Acesso
                        </FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="cad-box font-bold text-sm h-12 border-2" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="manusToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] mb-3 block flex items-center gap-2">
                          <Shield className="w-4 h-4 text-accent" /> Token de Acesso (Opcional)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="tk_sofia_prod_2024..." {...field} className="cad-box font-mono font-black text-sm h-12 border-2" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter className="gap-4 pt-8 border-t-2 border-accent">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="uppercase font-black text-[11px] tracking-[0.15em] h-12 px-8 border-2">
                  Abortar
                </Button>
                <Button type="submit" className="bg-accent text-accent-foreground font-black uppercase tracking-[0.15em] text-[11px] h-12 px-10 border-2 border-accent hover:bg-accent/90">
                  {isEditMode ? "Sincronizar Protocolo" : "Confirmar Inicialização"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Deleção */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="bg-card border-4 border-red-600 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter text-red-500 flex items-center gap-3">
              <AlertCircle className="w-8 h-8" />
              Aviso de Exclusão
            </DialogTitle>
          </DialogHeader>
          <div className="py-8">
            <p className="text-sm font-bold leading-relaxed">
              Você está prestes a desativar permanentemente a unidade <span className="text-red-500 font-black text-lg">{selectedAgent?.name}</span>. 
              Esta ação é irreversível e todos os logs locais serão perdidos.
            </p>
          </div>
          <DialogFooter className="gap-4">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} className="uppercase font-black text-[11px] tracking-[0.15em] border-2 h-11">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="uppercase font-black text-[11px] tracking-[0.15em] bg-red-600 border-2 border-red-600 h-11">
              Confirmar Desativação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
