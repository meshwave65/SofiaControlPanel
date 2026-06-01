import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function Messages() {
  const { isAuthenticated, user } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Queries
  const messagesQuery = trpc.messages.getByTask.useQuery(
    { taskId: selectedTaskId || 0 },
    { enabled: isAuthenticated && selectedTaskId !== null, refetchInterval: autoRefresh ? 3000 : false }
  );

  // Mutations
  const sendMessageMutation = trpc.messages.create.useMutation({
    onSuccess: () => {
      toast.success("Mensagem enviada!");
      setMessageContent("");
      messagesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao enviar mensagem: ${error.message}`);
    },
  });

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedTaskId) {
      toast.error("Preencha a mensagem e selecione uma tarefa");
      return;
    }

    sendMessageMutation.mutate({
      taskId: selectedTaskId,
      typeId: 1,
      content: messageContent,
    });
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
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Sistema de Mensagens</h1>
          <p className="text-muted-foreground">
            Comunicação em tempo real com threads de conversas
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Tarefas */}
          <div className="lg:col-span-1">
            <Card className="cad-card">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Tarefas</h3>
              <div className="space-y-2">
                <Button
                  variant={selectedTaskId === null ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedTaskId(null)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Todas as Tarefas
                </Button>
                <div className="text-sm text-muted-foreground p-2">
                  Selecione uma tarefa para visualizar mensagens
                </div>
              </div>
            </Card>

            {/* Configurações */}
            <Card className="cad-card mt-4">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Configurações</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">Auto-atualizar (3s)</span>
                </label>
              </div>
            </Card>
          </div>

          {/* Main - Chat */}
          <div className="lg:col-span-3">
            <Card className="cad-card h-[600px] flex flex-col">
              {selectedTaskId === null ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione uma tarefa para visualizar mensagens</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Mensagens */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4 border-b border-foreground/20 pb-4">
                    {messagesQuery.isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Carregando mensagens...
                      </div>
                    ) : messagesQuery.data && messagesQuery.data.length > 0 ? (
                      messagesQuery.data.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-sm ${
                              message.senderId === user?.id
                                ? "bg-accent text-accent-foreground"
                                : "bg-muted text-muted-foreground border border-foreground/20"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma mensagem nesta tarefa
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      className="bg-input border-foreground/30 resize-none"
                      rows={3}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendMessageMutation.isPending}
                      className="bg-accent text-accent-foreground hover:bg-accent/90 self-end"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
