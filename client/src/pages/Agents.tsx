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
import { Plus, Pause, Play, X, Zap } from "lucide-react";
import { toast } from "sonner";

const createAgentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  version: z.string().optional(),
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
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Novo Agente
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-2 border-foreground/20">
              <DialogHeader>
                <DialogTitle>Criar Novo Agente</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Agente</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Agent-001" {...field} className="bg-input border-foreground/30" />
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
                          <Input placeholder="Descrição do agente" {...field} className="bg-input border-foreground/30" />
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
                        <FormLabel>Versão</FormLabel>
                        <FormControl>
                          <Input placeholder="1.0.0" {...field} className="bg-input border-foreground/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Criar Agente
                  </Button>
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
                <Card key={agent.id} className="cad-card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">v{agent.version || "1.0.0"}</p>
                    </div>
                    <div className={`status-indicator ${agent.status}`}></div>
                  </div>

                  {agent.description && (
                    <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
                  )}

                  <div className="mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="text-xs text-muted-foreground">
                      Último heartbeat: {agent.lastHeartbeat ? new Date(agent.lastHeartbeat).toLocaleString() : "Nunca"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {agent.status === "online" || agent.status === "idle" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-1"
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
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-1"
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
                      variant="destructive"
                      className="flex items-center justify-center gap-1"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: agent.id,
                          status: "offline",
                        })
                      }
                    >
                      <X className="w-3 h-3" /> Encerrar
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
