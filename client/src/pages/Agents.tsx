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
import { Plus, Settings, Edit, Trash2, Cpu, Terminal, Activity, History, ListTodo, Shield, Zap, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const agentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  version: z.string().default("1.0.0"),
  manusAccount: z.string().email("Email inválido").optional().or(z.literal("")),
  manusPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
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
    { id: 1, name: "Sofia-Alpha", description: "Unidade de análise estratégica primária", version: "1.2.4", status: "online", lastHeartbeat: new Date().toISOString() },
    { id: 2, name: "Sofia-Beta", description: "Processamento de dados em larga escala", version: "1.1.0", status: "online", lastHeartbeat: new Date().toISOString() },
    { id: 3, name: "Sofia-Gamma", description: "Interface de comunicação e suporte", version: "1.0.5", status: "offline", lastHeartbeat: new Date(Date.now() - 3600000).toISOString() },
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
    form.reset({ name: "", description: "", version: "1.0.0", manusAccount: "", manusPassword: "" });
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
      <div className="technical-header px-6 py-8 border-b-2 border-foreground/30 bg-foreground/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">Unidades Sofia</h1>
            <p className="text-muted-foreground font-mono text-xs uppercase">
              SISTEMA DE CONTROLE CENTRAL // AGENTES ATIVOS: <span className="text-accent font-bold">{agents.length}</span>
            </p>
          </div>
          <Button 
            onClick={handleOpenCreate}
            className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-2 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] font-black uppercase tracking-widest text-xs h-12 px-6"
          >
            <Plus className="w-4 h-4" /> Inicializar Nova Unidade
          </Button>
        </div>
      </div>

      {/* Grid de Agentes */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="cad-card relative overflow-hidden group border-2 hover:border-accent transition-all duration-300 bg-card/50 backdrop-blur-sm p-6">
                <div className={`absolute top-0 left-0 w-2 h-full ${agent.status === 'online' ? 'bg-green-500' : 'bg-red-500'} opacity-30 group-hover:opacity-100 transition-opacity`}></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">{agent.name}</h3>
                      <span className="text-[9px] bg-foreground/10 px-2 py-1 rounded font-mono border border-foreground/20 font-bold">V{agent.version}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{agent.status === 'online' ? 'Operacional' : 'Offline'}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono opacity-40 bg-foreground/5 px-2 py-1 rounded font-bold">ID: {agent.id.toString().padStart(4, '0')}</span>
                </div>

                <div className="bg-foreground/5 p-4 rounded border border-foreground/10 mb-6 min-h-[60px]">
                  <p className="text-[11px] text-foreground/70 leading-relaxed italic font-bold">"{agent.description}"</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-accent/5 p-3 rounded flex flex-col border border-accent/10">
                    <span className="text-[8px] uppercase text-muted-foreground font-black tracking-tighter mb-1">Último Sinal</span>
                    <span className="text-[10px] font-mono text-accent font-black truncate uppercase">Ativo Agora</span>
                  </div>
                  <div className="bg-accent/5 p-3 rounded flex flex-col border border-accent/10">
                    <span className="text-[8px] uppercase text-muted-foreground font-black tracking-tighter mb-1">Protocolo</span>
                    <span className="text-[10px] font-mono text-accent font-black uppercase">Standard</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2 h-11 font-black uppercase text-[10px] tracking-widest border-2"
                    onClick={() => {
                      setSelectedAgent(agent);
                      setIsDetailsOpen(true);
                    }}
                  >
                    <Settings className="w-3 h-3" /> Painel de Controle
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-11 h-11 p-0 flex items-center justify-center border-2 border-foreground/20 hover:border-accent hover:text-accent"
                    onClick={() => handleOpenEdit(agent)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-card border-2 border-foreground/20 max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <div className="technical-header px-6 py-6 border-b-2 border-foreground/20 bg-foreground/5 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${selectedAgent?.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                <Terminal className="w-8 h-8 text-accent" />
                Terminal Sofia: {selectedAgent?.name}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-10 text-[10px] font-black uppercase tracking-widest px-4"
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Deletar Unidade
              </Button>
              <div className="flex flex-col items-end font-mono text-[10px] text-muted-foreground font-bold">
                <span>STATUS: {selectedAgent?.status?.toUpperCase()}</span>
                <span>KERNEL-ID: #{selectedAgent?.id?.toString().padStart(4, '0')}</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 border-b border-foreground/10 bg-foreground/5">
              <TabsList className="bg-transparent h-14 gap-8">
                <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none px-0 font-black uppercase text-[10px] tracking-[0.2em]">Visão Geral</TabsTrigger>
                <TabsTrigger value="missions" className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none px-0 font-black uppercase text-[10px] tracking-[0.2em]">Missões Ativas</TabsTrigger>
                <TabsTrigger value="logs" className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none px-0 font-black uppercase text-[10px] tracking-[0.2em]">Logs de Sistema</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden p-6">
              <ScrollArea className="h-full pr-4">
                <TabsContent value="overview" className="m-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="cad-card p-6 border-2">
                      <div className="flex items-center gap-3 mb-4 text-accent">
                        <Shield className="w-5 h-5" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Segurança de Rede</h4>
                      </div>
                      <p className="text-2xl font-mono font-black">CRIPTOGRAFADO</p>
                      <p className="text-[9px] text-muted-foreground mt-2 uppercase font-bold">Protocolo TLS 1.3 Ativo</p>
                    </Card>
                    <Card className="cad-card p-6 border-2">
                      <div className="flex items-center gap-3 mb-4 text-accent">
                        <Zap className="w-5 h-5" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Latência de Resposta</h4>
                      </div>
                      <p className="text-2xl font-mono font-black">124ms</p>
                      <p className="text-[9px] text-muted-foreground mt-2 uppercase font-bold">Estável via Manus Cloud</p>
                    </Card>
                    <Card className="cad-card p-6 border-2">
                      <div className="flex items-center gap-3 mb-4 text-accent">
                        <Activity className="w-5 h-5" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Uso de CPU</h4>
                      </div>
                      <p className="text-2xl font-mono font-black">12.5%</p>
                      <p className="text-[9px] text-muted-foreground mt-2 uppercase font-bold">Otimizado para Background</p>
                    </Card>
                  </div>
                  
                  <div className="bg-foreground/5 border-2 border-foreground/10 p-6 rounded">
                    <h4 className="text-xs font-black uppercase tracking-widest mb-4 border-b border-foreground/10 pb-2">Manifesto da Unidade</h4>
                    <p className="text-sm leading-relaxed font-bold text-foreground/80 italic">
                      Esta unidade Sofia está configurada para operar como um agente autônomo de alto desempenho. 
                      Suas capacidades incluem processamento de linguagem natural avançado, execução de scripts complexos 
                      e integração direta com o ecossistema Manus.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="missions" className="m-0">
                  <div className="space-y-4">
                    {mockTasks.map(task => (
                      <div key={task.id} className="bg-foreground/5 border-2 border-foreground/10 p-4 flex justify-between items-center group hover:border-accent/30 transition-all">
                        <div className="flex items-center gap-4">
                          <ListTodo className="w-5 h-5 text-accent" />
                          <div>
                            <p className="text-sm font-black uppercase tracking-tight">{task.title}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Prioridade: {task.priority}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-accent/10 text-accent px-3 py-1 rounded border border-accent/20 font-black uppercase">{task.status}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="logs" className="m-0">
                  <div className="font-mono text-[11px] space-y-2">
                    {mockLogs.map(log => (
                      <div key={log.id} className="flex gap-4 p-2 border-b border-foreground/5 hover:bg-foreground/5 transition-colors">
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
        <DialogContent className="bg-card border-2 border-foreground/20 max-w-2xl">
          <DialogHeader className="border-b border-foreground/10 pb-4 mb-4">
            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <Cpu className="w-8 h-8 text-accent" />
              {isEditMode ? "Configurar Unidade" : "Inicializar Unidade"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest">Identificador da Unidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: SOFIA-ALPHA" {...field} className="cad-box font-mono uppercase font-bold" />
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest">Versão de Kernel</FormLabel>
                      <FormControl>
                        <Input placeholder="1.0.0" {...field} className="cad-box font-mono font-bold" />
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
                      <Input placeholder="Descreva a função principal desta unidade..." {...field} className="cad-box font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="border-t border-foreground/10 pt-6 mt-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Credenciais Manus (Opcional)
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="manusAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest">E-mail Manus</FormLabel>
                        <FormControl>
                          <Input placeholder="agente@manus.im" {...field} className="cad-box font-mono font-bold" />
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
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest">Chave de Acesso</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="cad-box font-bold" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter className="gap-3 pt-6 border-t border-foreground/10">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="uppercase font-black text-[10px] tracking-widest h-12 px-8 border-2">
                  Abortar
                </Button>
                <Button type="submit" className="bg-accent text-accent-foreground font-black uppercase tracking-widest text-[10px] h-12 px-10">
                  {isEditMode ? "Sincronizar Protocolo" : "Confirmar Inicialização"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Deleção */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="bg-card border-2 border-red-500/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-red-500 flex items-center gap-3">
              <AlertCircle className="w-8 h-8" />
              Aviso de Exclusão
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-sm font-bold leading-relaxed">
              Você está prestes a desativar permanentemente a unidade <span className="text-red-500 font-black">{selectedAgent?.name}</span>. 
              Esta ação é irreversível e todos os logs locais serão perdidos.
            </p>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} className="uppercase font-black text-[10px] tracking-widest border-2">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="uppercase font-black text-[10px] tracking-widest bg-red-600">
              Confirmar Desativação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
