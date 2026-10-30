import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Coins, RefreshCw, AlertCircle, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatCredits(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "NÃO DISPONÍVEL";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
}

function formatUpdatedAt(value: string | Date | null) {
  if (!value) return "Sem consulta bem-sucedida";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true, locale: ptBR });
  } catch {
    return "Data indisponível";
  }
}

export default function AgentCredits() {
  const creditsQuery = trpc.agents.listCredits.useQuery(undefined, {
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
  const agents = creditsQuery.data ?? [];
  const available = agents.filter((agent) => agent.sourceStatus === "ok" && agent.creditsRemaining !== null);
  const unavailable = agents.length - available.length;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-2 py-4 sm:px-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Coins className="h-7 w-7 text-primary" /> Créditos dos Agentes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saldos consultados diretamente nas contas Manus associadas aos agentes.
          </p>
        </div>
        <Button variant="outline" onClick={() => void creditsQuery.refetch()} disabled={creditsQuery.isFetching}>
          {creditsQuery.isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Atualizar agora
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Agentes cadastrados</CardDescription><CardTitle className="text-3xl">{agents.length}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Consultas bem-sucedidas</CardDescription><CardTitle className="text-3xl text-green-600">{available.length}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Indisponíveis / com erro</CardDescription><CardTitle className="text-3xl">{unavailable}</CardTitle></CardHeader>
        </Card>
      </div>

      {creditsQuery.isLoading ? (
        <Card><CardContent className="flex items-center justify-center gap-3 py-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Consultando contas Manus...</CardContent></Card>
      ) : creditsQuery.isError ? (
        <Card><CardContent className="flex items-center gap-3 py-10 text-destructive"><AlertCircle className="h-5 w-5" /> {creditsQuery.error.message}</CardContent></Card>
      ) : agents.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum agente cadastrado.</CardContent></Card>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(140px,0.8fr)_minmax(150px,1fr)] gap-3 bg-muted/60 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
            <span>Agente</span><span>Conta Manus</span><span>Créditos restantes</span><span>Consulta / situação</span>
          </div>
          {agents.map((agent) => (
            <div key={agent.id} className="grid grid-cols-1 gap-2 border-t px-4 py-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(140px,0.8fr)_minmax(150px,1fr)] sm:items-center sm:gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{agent.name}</p>
                <p className="text-xs text-muted-foreground">Agente #{agent.id}</p>
              </div>
              <div className="min-w-0 break-all text-sm">{agent.manusAccount || "Conta não identificada"}</div>
              <div className={`font-mono text-sm font-bold ${agent.sourceStatus === "ok" && (agent.creditsRemaining ?? 0) > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                {formatCredits(agent.creditsRemaining)}
              </div>
              <div className="flex flex-col items-start gap-1">
                {agent.sourceStatus === "ok" ? (
                  <Badge variant="outline" className="gap-1 border-green-600/40 text-green-700"><CheckCircle2 className="h-3 w-3" /> Atualizado</Badge>
                ) : (
                  <Badge variant="outline" className="gap-1"><ShieldAlert className="h-3 w-3" /> {agent.sourceStatus === "not_configured" ? "Sem credencial" : agent.sourceStatus === "authentication_error" ? "Falha de autenticação" : "Consulta indisponível"}</Badge>
                )}
                <span className="text-xs text-muted-foreground">{agent.message || formatUpdatedAt(agent.creditsUpdatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Atualização automática a cada minuto. Em caso de falha, o saldo não é presumido: a tela informa indisponibilidade e mantém o horário da última consulta bem-sucedida.
      </p>
    </div>
  );
}
