import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Pause, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Página de Gerenciamento de Agentes
 * Exibe listagem em cards no estilo CAD, modal de criação e botões de ação
 */
export default function Agents() {
  const { user, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", config: "" });

  // Queries e mutations
  const agentsQuery = trpc.agents.list.useQuery(undefined, { enabled: !!user });
  const createMutation = trpc.agents.create.useMutation();
  const updateStatusMutation = trpc.agents.updateStatus.useMutation();
  const deleteMutation = trpc.agents.delete.useMutation();

  const agents = agentsQuery.data || [];
  const isLoading = agentsQuery.isLoading || createMutation.isPending;

  const handleCreateAgent = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome do agente é obrigatório");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
        config: formData.config,
      });

      setFormData({ name: "", description: "", config: "" });
      setIsOpen(false);
      agentsQuery.refetch();
      toast.success("Agente criado com sucesso");
    } catch (error) {
      toast.error("Erro ao criar agente");
    }
  };

  const handleToggleStatus = async (agentId: number, currentStatus: string) => {
    const newStatus = currentStatus === "paused" ? "offline" : "paused";
    try {
      await updateStatusMutation.mutateAsync({ id: agentId, status: newStatus });
      agentsQuery.refetch();
      toast.success(`Agente ${newStatus === "paused" ? "pausado" : "retomado"}`);
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleDeleteAgent = async (agentId: number) => {
    if (!confirm("Tem certeza que deseja deletar este agente?")) return;

    try {
      await deleteMutation.mutateAsync({ id: agentId });
      agentsQuery.refetch();
      toast.success("Agente deletado com sucesso");
    } catch (error) {
      toast.error("Erro ao deletar agente");
    }
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
            <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Agentes</h1>
            <p className="text-muted-foreground">Crie, monitore e controle agentes autônomos</p>
          </div>

          {/* Dialog de Criação */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="w-4 h-4" />
                Novo Agente
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-accent/30">
              <DialogHeader>
                <DialogTitle className="text-accent">Criar Novo Agente</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Configure os detalhes do novo agente autônomo
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-foreground">
                    Nome do Agente
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Agent-Alpha"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-background border-accent/30 text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-foreground">
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Descrição do agente e suas responsabilidades"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-background border-accent/30 text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="config" className="text-foreground">
                    Configuração (JSON)
                  </Label>
                  <Textarea
                    id="config"
                    placeholder='{"timeout": 30000, "retries": 3}'
                    value={formData.config}
                    onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                    className="bg-background border-accent/30 text-foreground font-mono text-sm"
                  />
                </div>

                <Button
                  onClick={handleCreateAgent}
                  disabled={isLoading}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Criar Agente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grid de Agentes */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : agents.length === 0 ? (
          <Card className="cad-card">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">Nenhum agente registrado. Crie um novo agente para começar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div key={agent.id} className="agent-card">
                {/* Status Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className={`status-indicator ${agent.status}`} />
                  <span className="text-xs font-medium text-muted-foreground uppercase">{agent.status}</span>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{agent.description || "Sem descrição"}</p>
                  </div>

                  {/* Metadata */}
                  <div className="grid-separator" />

                  <div className="text-xs space-y-1">
                    <p className="text-muted-foreground">
                      <span className="font-medium">ID:</span> {agent.id}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Criado:</span> {new Date(agent.createdAt).toLocaleDateString()}
                    </p>
                    {agent.lastHeartbeat && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Último Heartbeat:</span> {new Date(agent.lastHeartbeat).toLocaleTimeString()}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid-separator" />

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(agent.id, agent.status)}
                      className="flex-1 gap-1 border-accent/30 hover:bg-accent/10"
                    >
                      {agent.status === "paused" ? (
                        <>
                          <Play className="w-3 h-3" />
                          Retomar
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3" />
                          Pausar
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="flex-1 gap-1 border-destructive/30 hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                      Deletar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {agents.length > 0 && (
          <Card className="cad-card">
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-500">{agents.filter((a) => a.status === "online").length}</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-500">{agents.filter((a) => a.status === "offline").length}</p>
                  <p className="text-xs text-muted-foreground">Offline</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-500">{agents.filter((a) => a.status === "idle").length}</p>
                  <p className="text-xs text-muted-foreground">Idle</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-500">{agents.filter((a) => a.status === "paused").length}</p>
                  <p className="text-xs text-muted-foreground">Pausados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
