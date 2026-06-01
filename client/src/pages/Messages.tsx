import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Página de Mensagens
 * Interface de chat/threads com polling automático e notificações
 */
export default function Messages() {
  const { user, loading: authLoading } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [messageContent, setMessageContent] = useState("");
  const [messageTypeId, setMessageTypeId] = useState<string>("1");
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Queries
  const tasksQuery = trpc.tasks.listAll.useQuery(undefined, { enabled: !!user });
  const messageTypesQuery = trpc.lookups.getAllMessageTypes.useQuery();
  const messagesQuery = trpc.messages.getByTask.useQuery(
    { taskId: parseInt(selectedTaskId) },
    { enabled: !!user && !!selectedTaskId, refetchInterval: 3000 }
  );

  // Mutations
  const createMessageMutation = trpc.messages.create.useMutation();
  const markAsReadMutation = trpc.messages.markAsRead.useMutation();
  const deleteMessageMutation = trpc.messages.delete.useMutation();

  const tasks = tasksQuery.data || [];
  const messageTypes = messageTypesQuery.data || [];
  const messages = messagesQuery.data || [];

  // Auto-mark unread messages as read
  useEffect(() => {
    messages.forEach((msg) => {
      if (!msg.isRead) {
        markAsReadMutation.mutate({ id: msg.id });
      }
    });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedTaskId) {
      toast.error("Selecione uma tarefa e digite uma mensagem");
      return;
    }

    try {
      await createMessageMutation.mutateAsync({
        taskId: parseInt(selectedTaskId),
        typeId: parseInt(messageTypeId),
        content: messageContent,
      });

      setMessageContent("");
      messagesQuery.refetch();
      toast.success("Mensagem enviada");
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm("Tem certeza que deseja deletar esta mensagem?")) return;

    try {
      await deleteMessageMutation.mutateAsync({ id: messageId });
      messagesQuery.refetch();
      toast.success("Mensagem deletada");
    } catch (error) {
      toast.error("Erro ao deletar mensagem");
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
        <div className="technical-header">
          <h1 className="text-3xl font-bold text-foreground">Mensagens e Comunicação</h1>
          <p className="text-muted-foreground">Chat em tempo real com threads de tarefas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Seletor de Tarefa */}
          <Card className="cad-card lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Tarefas</CardTitle>
              <CardDescription>Selecione uma tarefa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma tarefa disponível</p>
                ) : (
                  tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id.toString())}
                      className={`w-full text-left px-3 py-2 rounded-sm border transition-colors ${
                        selectedTaskId === task.id.toString()
                          ? "bg-accent/20 border-accent text-accent"
                          : "border-accent/20 text-foreground hover:bg-accent/10"
                      }`}
                    >
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground truncate">#{task.id}</p>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="cad-card lg:col-span-3">
            <CardHeader>
              <CardTitle>
                {selectedTaskId
                  ? `Conversa - ${tasks.find((t) => t.id === parseInt(selectedTaskId))?.title || "Tarefa"}`
                  : "Selecione uma tarefa para começar"}
              </CardTitle>
              <CardDescription>{messages.length} mensagens</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedTaskId ? (
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                  <p>Selecione uma tarefa na lista ao lado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mensagens */}
                  <div className="h-96 overflow-y-auto space-y-3 border border-accent/20 rounded-sm p-4 bg-background">
                    {messages.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Nenhuma mensagem nesta tarefa</p>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`message-bubble flex justify-between items-start gap-3 ${
                            msg.senderId === user?.id ? "bg-accent/10 ml-8" : "mr-8"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-accent mb-1">
                              {msg.senderId === user?.id ? "Você" : `User #${msg.senderId}`}
                            </p>
                            <p className="text-sm text-foreground break-words">{msg.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          {msg.senderId === user?.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="text-destructive hover:bg-destructive/10 flex-shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Formulário de Envio */}
                  <div className="grid-separator" />

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="messageType" className="text-foreground text-sm">
                        Tipo de Mensagem
                      </Label>
                      <Select value={messageTypeId} onValueChange={setMessageTypeId}>
                        <SelectTrigger className="bg-background border-accent/30 text-foreground mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-accent/30">
                          {messageTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-foreground text-sm">
                        Mensagem
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Digite sua mensagem..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="bg-background border-accent/30 text-foreground mt-1 resize-none"
                        rows={3}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.ctrlKey) {
                            handleSendMessage();
                          }
                        }}
                      />
                    </div>

                    <Button
                      onClick={handleSendMessage}
                      disabled={createMessageMutation.isPending || !messageContent.trim()}
                      className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      {createMessageMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Enviar (Ctrl+Enter)
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        {selectedTaskId && (
          <Card className="cad-card">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-accent">{messages.length}</p>
                  <p className="text-xs text-muted-foreground">Total de Mensagens</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">
                    {messages.filter((m) => m.senderId === user?.id).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Suas Mensagens</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-500">
                    {messages.filter((m) => !m.isRead).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Não Lidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
