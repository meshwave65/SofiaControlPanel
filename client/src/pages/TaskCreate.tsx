import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Loader2, ChevronLeft, CheckCircle } from "lucide-react";

export default function TaskCreate() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    statusId: "100",
    priorityId: "2",
    agentId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const createTaskMutation = trpc.tasks.create.useMutation();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createTaskMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        statusId: parseInt(formData.statusId),
        priorityId: parseInt(formData.priorityId),
        agentId: formData.agentId ? parseInt(formData.agentId) : undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/tasks");
      }, 1500);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      alert("Erro ao criar tarefa. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Card className="cad-card max-w-md">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">Tarefa Criada!</h2>
              <p className="text-sm text-muted-foreground">Redirecionando para a lista de tarefas...</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/tasks")}
              className="text-accent hover:text-accent/80"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Criar Nova Tarefa</h1>
          </div>

          {/* Form */}
          <Card className="cad-card">
            <CardHeader>
              <CardTitle>Detalhes da Tarefa</CardTitle>
              <CardDescription>Preencha os campos abaixo para criar uma nova tarefa</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título */}
                <div>
                  <Label htmlFor="title" className="text-foreground">
                    Título *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Corrija o problema de busca no AppAndroidSWE"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                    className="mt-2 bg-input border-foreground/30"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <Label htmlFor="description" className="text-foreground">
                    Descrição *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva a tarefa em detalhes. Inclua contexto, requisitos e qualquer informação importante."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    required
                    className="mt-2 bg-input border-foreground/30 min-h-32"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Dica: Quanto mais detalhado, melhor a fatoração e execução da tarefa.
                  </p>
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="status" className="text-foreground">
                    Status Inicial
                  </Label>
                  <Select value={formData.statusId} onValueChange={(value) => handleChange("statusId", value)}>
                    <SelectTrigger className="mt-2 bg-input border-foreground/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">STAGED (Aguardando)</SelectItem>
                      <SelectItem value="110">PROGRESS (Em Progresso)</SelectItem>
                      <SelectItem value="120">PAUSED (Pausada)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Prioridade */}
                <div>
                  <Label htmlFor="priority" className="text-foreground">
                    Prioridade
                  </Label>
                  <Select value={formData.priorityId} onValueChange={(value) => handleChange("priorityId", value)}>
                    <SelectTrigger className="mt-2 bg-input border-foreground/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Baixa</SelectItem>
                      <SelectItem value="2">Média</SelectItem>
                      <SelectItem value="3">Alta</SelectItem>
                      <SelectItem value="4">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Agente (opcional) */}
                <div>
                  <Label htmlFor="agent" className="text-foreground">
                    Agente (Opcional)
                  </Label>
                  <Input
                    id="agent"
                    type="number"
                    placeholder="ID do agente responsável"
                    value={formData.agentId}
                    onChange={(e) => handleChange("agentId", e.target.value)}
                    className="mt-2 bg-input border-foreground/30"
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/tasks")}
                    className="border-foreground/30"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.title || !formData.description}
                    className="bg-accent hover:bg-accent/80 text-foreground flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Tarefa"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className="cad-card mt-6 bg-accent/10 border-accent/30">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-accent mb-2">ℹ️ Como funciona</h3>
              <ul className="text-sm text-foreground space-y-1">
                <li>✓ Crie uma tarefa com descrição detalhada</li>
                <li>✓ O sistema irá fatorizar a tarefa em subtarefas</li>
                <li>✓ Agentes irão executar cada subtarefa</li>
                <li>✓ Resultados serão consolidados automaticamente</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
