# MISSION_0020 — TASKS — PROGRESS

**Missão:** 0020 — Diagnóstico e Restauração Integral das Funcionalidades do SCP  
**Projeto:** SofiaControlPanel  
**Data de criação:** 2026-11-09 04:58 (-03:00)  
**Blueprint:** `governance/missions/0020/BLUEPRINT.md`

| ID | Tarefa | Status | Instância | Critério/saída |
|---|---|---|---|---|
| 20.1 | Inventariar funcionalidades, contratos e evidências do runtime; localizar a primeira fronteira de falha | DONE | Manus (sandbox) | Matriz baseline de módulos/ações e hipótese testável; logs/config apenas pertinentes e sanitizados; nenhuma causa conjecturada como fato |
| 20.2 | Reproduzir falha de missão em ambiente local/de teste e fechar causa-raiz do ciclo de execução | DONE | Manus (sandbox) — 2026-11-11/12 | Harness controlado reproduz claim/despacho, criação Manus mockada, polling, persistência, espera por agente inelegível, falha explícita e estados DONE/PAUSED/FAIL; smoke test externo permanece bloqueado por credenciais/autorização ausentes |
| 20.3 | Corrigir causas-raiz confirmadas no fluxo de execução e adicionar regressões | PROGRESS | Agente Mateus | Correções pequenas e atribuídas, testes falhando antes/passando depois, idempotência/concorrência/erros cobertos sem chamada real não autorizada |
| 20.4 | Auditar fluxos operacionais de missões e Messenger; classificar lacunas de UI/API/serviços/runtime e definir correções prioritárias | PROGRESS | ChatGPT/GPT-6 — diagnóstico e auditoria funcional | Matriz de evidências para criar/iniciar/retomar/pausar/transferir/fatorizar/consolidar missões e enviar/receber mensagens; distinguir lacuna de produto, falha de configuração e falha de runtime; sem duplicar MISSION_0019 |
| 20.5 | Executar validação integrada e, somente se autorizado, smoke test externo de baixo impacto | STAGED | — | `pnpm check`, `pnpm test`, `pnpm build`, integração repetível; gate externo comprovado ou explicitamente bloqueado |
| 20.6 | Documentar operação/observabilidade, revisar cruzadamente e preparar handoff final | STAGED | — | Checklist sem segredos, procedimento reproduzível, limites e dependências registrados; todos os ORs e índices reconciliados |

## Regras de execução

- A missão permanece `STAGED` até uma instância assumir formalmente. Antes de qualquer edição, reconciliar branch, `origin/main`, árvore, tarefas/locks e dependências, e atualizar missão/quadro conforme `GOVERNANCE.md`.
- Uma instância assume uma tarefa por vez; não editar em paralelo os mesmos arquivos sem coordenação e lock.
- Tarefas 20.1–20.2 precedem correção. Se a análise identificar trabalhos independentes, decompor e atribuir antes de editar. Reordenar só com justificativa registrada.
- Usar testes e ambientes descartáveis por padrão. Chamada real Manus, consumo de crédito, alteração de dados ou deploy exigem autorização específica e ambiente aprovado.
- Não assumir nem duplicar tarefas da MISSION_0019; dependências/interseções devem ser documentadas e coordenadas.
- Cada tarefa concluída, parcial, bloqueada ou malsucedida requer Operational Report próprio, atualização do quadro e handoff conforme `AGENTS.md`.


## Checkpoint 20.3 — assunção formal (2026-11-12)
- **Instância:** Agente Mateus.
- **Status:** PROGRESS.
- **Escopo assumido:** corrigir somente causas-raiz confirmadas no fluxo de execução e adicionar regressões reproduzíveis.
- **Guardrails:** sem chamada real à API Manus, consumo de créditos, alteração de produção ou deploy; não duplicar a MISSION_0019.
- **Base de entrada:** MISSION_0020 / tarefa 20.2 concluída com harness controlado; smoke test externo permanece bloqueado por credenciais/autorização ausentes.
- **Próximo passo:** revisar o diff e os testes associados ao fluxo de claim/despacho antes de editar qualquer código.


## Checkpoint 20.4 — assunção e ampliação do diagnóstico (2026-11-14)
- **Instância:** ChatGPT/GPT-6.
- **Status:** PROGRESS.
- **Escopo assumido:** auditoria funcional dos fluxos de gestão de missões e Messenger, com rastreamento UI → tRPC/API → serviços → persistência → retorno visual; classificação das capacidades presentes, ausentes, condicionais e não comprovadas em produção.
- **Contexto:** o responsável relata que não consegue iniciar, transferir, pausar ou fatorizar missões pela interface e que o Messenger não envia/recebe mensagens com a conta. A MISSION_0020 já cobre a restauração integral do SCP; a tarefa 20.4 é a unidade apropriada e independente da tarefa 20.3, que permanece atribuída a Agente Mateus.
- **Primeira evidência estática:** a UI de Tasks só abre o detalhe; o detalhe expõe iniciar/fatorizar/consolidar, mas não há fluxo de pausa nem transferência manual; o botão de iniciar depende de `status` e `manusTaskId`; o Messenger declara `Link Ativo` sem checagem e alterna entre serviço LLM interno e tarefa Manus conforme os identificadores da missão. Isso ainda não comprova o comportamento do deploy/runtime.
- **Guardrails:** nenhuma chamada Manus, consumo de créditos, escrita no banco de produção, alteração de credenciais ou deploy; validar com testes/ambiente controlado e manter qualquer smoke test externo condicionado à autorização e ambiente aprovados.

### Checkpoint 20.4 — Render e reconciliação produção/main (2026-11-14)
- **Render:** serviço SofiaControlPanel-web não suspenso; deploy live é rollback para 255a016, com auto-deploy desligado.
- **Divergência:** main está 146 commits à frente do commit live. A produção não contém a revisão atual da auditoria.
- **Causa confirmada no Messenger live:** no commit publicado, messages.create somente persiste a mensagem do operador; não aciona Manus/LLM nem cria resposta. Em main, existe implementação que encaminha para a tarefa Manus associada ou LLM interno, persiste a resposta e retorna replied/pending/failed; ainda não está implantada.
- **UI Messenger:** Link Ativo permanece hardcoded; Sincronizado não representa handshake real.
- **Missões:** TaskDetail mantém o bloqueio de iniciar quando PROGRESS já possui manusTaskId e não permite PAUSED; não há evidência de pausa/transferência manual adicionada em main.
- **Runtime:** processo, heartbeat e DB iniciaram/verificaram em 14/11; exits com código 1 em 12/11 seguem sem causa isolada.
- **Próxima etapa:** reconciliar intenção do rollback, revisar deltas de release e logs de erro; não fazer deploy/restart, dispatch de missão, envio de mensagem ou chamada Manus/LLM sem gate específico.
- **OR:** OR-20261114-0017 atualizado com evidências de Render e causa do Messenger live.
### Checkpoint 20.4 — incidente de lock no prestart (2026-11-14)
- Render registrou sete falhas do ensure-database entre 20:25:30 e 20:37:00 UTC em 12/11; todas falharam em Verify tasks.agentPinned com PostgreSQL lock timeout.
- Script prestart define lock_timeout=15s e executa ALTER TABLE ... ADD COLUMN IF NOT EXISTS para tasks.agentPinned; o comportamento persiste no código atual. O lock holder não foi identificado.
- Classificação: timeout DDL no startup = causa imediata confirmada; sessão bloqueadora = desconhecida; startup em 14/11 passou posteriormente.
- Nenhuma consulta ao banco, escrita, DDL, restart ou deploy foi executado.
- **Precisão sobre pausa:** tasks.updateStatus genérico existe e aceita statusId; não equivale a pause/resume operacional, pois não define transições nem coordena execução externa. A UI não oferece ação de pausa. Transferência manual segue sem fluxo identificado.
### Checkpoint 20.4 — feedback UI e limites de testes
- Factorize é idempotente no orchestrator e a UI refaz consultas, mas não confirma sucesso visualmente; consolidate registra falha apenas no console.
- messages.test.ts cobre o ramo de resposta LLM interna, não o ramo Manus; sendManusMessageAndWait não tem teste integrado de ciclo before/send/poll/after.
- Testes atuais são mocks e não substituem validação de banco, trigger, runtime ou conta externa.
### Matriz preliminar 20.4
- **FAIL:** Messenger live sem despacho/resposta; retomada manual com manusTaskId existente; pausa operacional dedicada; transferência manual; indicador de conexão não real.
- **BLOCKED:** listagem/criação/início STAGED/fatorização/consolidação em runtime autenticado; rota Messenger de main ainda não implantada; identidade externa esperada não definida.
- **Evidência estática:** factorizeTask idempotente; start/claim/dispatch e consolidate têm código presente. Testes atuais são mockados e não substituem integração.

### Checkpoint 20.4 — motivo do rollback ainda não rastreado (2026-11-14)
- Render confirmou rollback manual em 13/11 00:53:36 UTC para o deploy de `255a016`; o deploy imediatamente anterior era `fef7880`, cujo diff é documental, sem mudança em código de aplicação.
- O evento não registra justificativa. A falha de prestart em `496dd00` ocorreu antes e não pode ser declarada causa do rollback.
- Distância atual entre live e main: 167 commits (146 no checkpoint anterior), número móvel que inclui documentação; comparar arquivos de aplicação separadamente.
- Estado: alvo do rollback conhecido; motivação operacional desconhecida. Não implantar main até revisar deltas de código e critérios de release.
- Nenhuma ação mutável ou chamada externa foi executada.


### Checkpoint 20.4 — revisão de código da resposta Messenger
- `messages.create` em main tem validações e rota de resposta; usa tarefa Manus vinculada ao agente quando `agentId` e `manusTaskId` existem, caso contrário usa LLM interno.
- Polling Manus: snapshot anterior, envio, até 8 leituras em intervalos de 1,5s; sem resposta observada, persiste estado/placeholder pending.
- Teste de rota cobre LLM interno, não o ramo Manus; ciclo completo de envio/polling não tem teste integrado. Identidade destino é a conta/token Manus configurada no agente da missão, não sessão pessoal arbitrária.
- A UI melhorou o feedback, mas Link Ativo e Sincronizado ainda não provam conectividade.
- Main não corrige retomada PROGRESS com manusTaskId, pausa operacional ou transferência manual; o código de lifecycle consultado permanece essencialmente igual ao live.
- ensure-database mantém lock_timeout 15s; main não está liberada como release completa por esta auditoria.


### Checkpoint 20.4 — fatorização e dispatch automático (2026-11-14)
- Risco estático: missão pai é marcada PROGRESS/reserva agente antes de criar subtarefas; filhos herdam agente e a regra de elegibilidade exclui agentes já ocupados em outra missão PROGRESS. Um filho também pode bloquear os demais ao assumir PROGRESS. Validar trigger SQL real e semântica antes de corrigir.
- Testes existentes não validam dispatch de todas as filhas com regras reais de ocupação; acrescentar casos de um/múltiplos agentes e retry parcial.
- Consolidação ainda não fornece toast de sucesso/erro no handler UI.
- Nenhuma execução ou alteração de produto/produção realizada.


### Checkpoint 20.4 — trigger e reserva de agentes aprofundados (2026-11-14)
- Fonte do trigger localizada: `drizzle/0003_automatic_task_dispatch.sql`; instalação declarada em `scripts/ensure-database.mjs`. `net.http_post` dispara requisições assíncronas por filha STAGED. Catálogo do DB de produção não consultado; instalação ativa não comprovada.
- Confirmado estaticamente: pai passa a PROGRESS e reserva agente antes da fatorização; filhos herdam `agentId`/`agentPinned`; claim exclui agente ocupado em outra tarefa PROGRESS. Pai com agente fixado bloqueia as filhas que herdam o pin; pai automático com um único agente também retém o único agente. Com múltiplos agentes, filhos automáticos podem ser distribuídos entre agentes livres via SKIP LOCKED.
- Heartbeat reprocessa tarefas em espera a cada 30s, mas não libera reserva do pai. Retorno `executionStarted` usa número de IDs de subtarefas, não confirmação de dispatch efetivo.
- Testes de regressão pendentes: pinned/automatico com um agente; múltiplas filhas e múltiplos agentes; concorrência SKIP LOCKED; retry após liberação válida; semântica do pai e sinalizador executionStarted.
- Não tocar na tarefa 20.3/Mateus. Nenhuma alteração de produto/DB ou chamada externa executada.


### Decisão do responsável — contrato de atribuição e fatorização (2026-11-14)
- Missões pertencem ao SCP; agentes não são proprietários. `agentId` é atribuição operacional/temporária.
- Sem pinagem explícita, o SCP pode reatribuir a missão a outro agente elegível quando houver impedimento, especialmente falta de créditos. Pinagem humana é exceção e não pode ser ignorada silenciosamente.
- Na fatorização padrão sem pinagem, o agente que iniciou assume uma tarefa executável e as demais são distribuídas a outros agentes disponíveis.
- Pai/filhas é hierarquia estrutural para rastreabilidade e consolidação; pai sem trabalho próprio não reserva agente nem bloqueia claims.
- Pendência antes da implementação: definir se a pinagem humana em missão fatorizada se aplica a todas as subtarefas ou apenas a uma tarefa. Também não estão definidos fairness/prioridade/limites de concorrência.
- Referência: OR-20261114-0018; contexto arqueológico AC-008. Nenhuma implementação de produto nesta etapa.
