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
import { Plus, Pause, Play, X, Zap, Shield, Activity, Settings, Cpu, Terminal } from "lucide-react";
import { toast } from "sonner";

const createAgentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  version: z.string().default("1.0.0"),
  manusAccount: z.string().email("Email inválido").optional().or(z.literal("")),
  manusPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
  manusToken: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
});

type CreateAgentInput = z.infer<typeof createAgentSchema>;

export default function Agents() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Queries
  const agentsQuery = trpc.agents.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

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
  const form = useForm<CreateAgentInput>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: "",
      description: "",
      version: "1.0.0",
      manusAccount: "",
      manusPassword: "",
      manusToken: "",
    },
  });

  const onSubmit = (data: CreateAgentInput) => {
    createAgentMutation.mutate(data);
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
            <h1 className="text-4xl font-bold mb-2">Gerenciamento de Agentes</h1>
            <p className="text-muted-foreground">
              Total de agentes: <span className="text-accent font-semibold">{agentsQuery.data?.length || 0}</span>
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-2 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]">
                <Plus className="w-4 h-4" /> Configurar Agente de Controle
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-2 border-foreground/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Cpu className="w-6 h-6 text-accent" />
                  Nova Unidade de Controle Sofia
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
                          <FormLabel className="flex items-center gap-2">
                            <Terminal className="w-4 h-4" /> Identificador da Unidade
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: SOFIA-CTRL-01" {...field} className="bg-input border-foreground/30 font-mono" />
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
                          <FormLabel>Versão do Kernel</FormLabel>
                          <FormControl>
                            <Input placeholder="1.0.0" {...field} className="bg-input border-foreground/30" />
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
                        <FormLabel>Diretrizes Operacionais (Descrição)</FormLabel>
                        <FormControl>
                          <Input placeholder="Defina o propósito principal desta unidade..." {...field} className="bg-input border-foreground/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
                    <div className="flex items-center gap-2 mb-4 text-accent">
                      <Shield className="w-5 h-5" />
                      <h4 className="text-sm font-bold uppercase tracking-wider">Protocolo de Autenticação Manus</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="manusAccount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Conta Vinculada (Email)</FormLabel>
                            <FormControl>
                              <Input placeholder="email@manus.im" {...field} className="bg-input border-foreground/30" />
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
                            <FormLabel className="text-xs">Chave de Acesso (Senha)</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} className="bg-input border-foreground/30" />
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
                            <FormLabel className="text-xs">Token de Sessão Persistente (Opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Insira o token para bypass de login manual..." {...field} className="bg-input border-foreground/30 font-mono text-xs" />
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
                      className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-lg font-bold"
                      disabled={createAgentMutation.isPending}
                    >
                      {createAgentMutation.isPending ? "Inicializando Kernel..." : "Ativar Unidade de Controle"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsOpen(false)}
                      className="h-12 border-foreground/30"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {agentsQuery.isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando agentes...</p>
            </div>
          ) : agentsQuery.data && agentsQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agentsQuery.data.map((agent) => (
                <Card key={agent.id} className="cad-card relative overflow-hidden group border-2 hover:border-accent/50 transition-all duration-300 bg-card/50 backdrop-blur-sm">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex justify-between items-start mb-4 pl-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-foreground tracking-tighter uppercase italic">{agent.name}</h3>
                        <span className="text-[10px] bg-foreground/10 px-1.5 py-0.5 rounded font-mono">v{agent.version || "1.0.0"}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Activity className="w-3 h-3 text-accent animate-pulse" />
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Unidade Ativa</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`status-indicator ${agent.status} scale-125 shadow-[0_0_10px_rgba(var(--status-rgb),0.5)]`}></div>
                      <span className="text-[9px] font-mono opacity-50">ID: {agent.id.toString().padStart(4, '0')}</span>
                    </div>
                  </div>

                  {agent.description && (
                    <div className="bg-foreground/5 p-3 rounded border border-foreground/10 mb-4 ml-2">
                      <p className="text-xs text-foreground/80 leading-relaxed italic">"{agent.description}"</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-4 ml-2">
                    <div className="bg-accent/5 p-2 rounded flex flex-col">
                      <span className="text-[9px] uppercase text-muted-foreground font-bold">Uptime</span>
                      <span className="text-xs font-mono text-accent">99.9%</span>
                    </div>
                    <div className="bg-accent/5 p-2 rounded flex flex-col">
                      <span className="text-[9px] uppercase text-muted-foreground font-bold">Carga</span>
                      <span className="text-xs font-mono text-accent">2.4%</span>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center gap-2 ml-2">
                    <Zap className="w-3 h-3 text-accent" />
                    <span className="text-[10px] text-muted-foreground font-mono">
                      HB: {agent.lastHeartbeat ? new Date(agent.lastHeartbeat).toLocaleTimeString() : "PENDING"}
                    </span>
                  </div>

                  <div className="flex gap-2 ml-2">
                    {agent.status === "online" || agent.status === "idle" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 flex items-center justify-center gap-1 h-9 font-bold uppercase text-[10px]"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: agent.id,
                            status: "paused",
                          })
                        }
                      >
                        <Pause className="w-3 h-3" /> Pausar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 flex items-center justify-center gap-1 h-9 font-bold uppercase text-[10px]"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: agent.id,
                            status: "online",
                          })
                        }
                      >
                        <Play className="w-3 h-3" /> Retomar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-9 h-9 p-0 flex items-center justify-center hover:bg-accent hover:text-accent-foreground"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-9 h-9 p-0 flex items-center justify-center"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: agent.id,
                          status: "offline",
                        })
                      }
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum agente criado ainda.</p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Criar Primeiro Agente
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
