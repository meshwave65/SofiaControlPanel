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