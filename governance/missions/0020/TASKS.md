# MISSION_0020 — Quadro de tarefas

**Estado da missão:** PROGRESS  
**Regra:** cada unidade material produz seu próprio Operational Report. O estado deve refletir evidência, não intenção.

| ID | Unidade | Estado | Referência | Saída / critério |
|---|---|---|---|---|
| 20.1 | Inventário funcional e diagnóstico inicial | DONE / histórico | ORs históricos da missão | Inventário e fronteiras iniciais de falha documentados; revalidar quando necessário. |
| 20.2 | Integração e execução externa | DONE / histórico parcial | MISSION_0016 e ORs históricos | Integração Manus existente; validação real ponta a ponta depende de autorização e ambiente de teste. |
| 20.3 | Unidade atribuída a Mateus | PRESERVADA — NÃO ALTERAR | Registro operacional próprio | Fora do escopo desta sequência; não modificar nem assumir. |
| 20.4 | Auditoria e restauração funcional do SCP | PROGRESS | OR-20261115-0043 a OR-20261115-0046, PR #15 | Evoluir o SCP como gestor soberano de missões; Messenger, ciclo de vida, coordenação pai/filhas, TR e autonomia em incrementos pequenos e verificáveis. |
| 20.4.1 | Diagnóstico do erro de resposta no Messenger | DIAGNÓSTICO CONCLUÍDO — remediação pendente | OR-20261117-0001, OR-20261117-0002 | Causa confirmada: `BUILT_IN_FORGE_API_KEY` estava vazia/ausente no processo Render; request não chegou à Forge. Remediação exige cadastrar segredo Forge autorizado e teste controlado, sem expor valor. |

## Regras de execução de 20.4

- Manter visão global e planejamento arquitetural coerente.
- Implementar apenas uma etapa funcional por vez; não entregar vários incrementos em lote.
- Mostrar resultado real na UI/comportamento para avaliação do responsável.
- Corrigir pontualmente antes de avançar.
- Cada decisão aprovada deve ser persistida em OR e refletida no progresso.
- Não registrar hipóteses como decisões aprovadas.
- Não fazer merge, deploy, restart, dispatch externo, chamadas reais Manus/LLM ou consumir créditos sem autorização específica.
- Não ampliar AC-023 ou integrações ARC/PGC estacionadas.
- Não alterar 20.3/Mateus.

## Estado do incremento Messenger

A aba de conversa central com a SOFIA foi implementada em `TaskDetail.tsx` no commit `9944dedebe02e92b267758bf13b311d3ee8baebf`. A consulta/gravação usa a missão-raiz inclusive em detalhes de tarefas-filhas. CI aprovado (TypeScript, testes, build e validações PostgreSQL/dispatch); QA visual autenticado e teste real do ciclo Manus ainda pendentes. Ver OR-20261115-0045 e OR-20261115-0046.

## Incrementos recentes

- Messenger central implementado em TaskDetail; CI aprovado. OR-0045 e OR-0046.
- Painel Execução e executor implementado em TaskDetail; CI aprovado. OR-0047.
- Pausa e retomada Manus implementadas com confirmação externa e estados pendentes; CI aprovado (77 testes). OR-0048.
- PR #15 está divergente e não mergeable (464 ahead / 22 behind; mergeable_state=dirty). O único arquivo sobreposto detectado no compare foi `governance/operational_reports/INDEX.csv`; o índice da branch agora preserva a união dos registros de ambos os lados, commit `462a7e1`, mas a PR ainda reporta `dirty`. Reconciliar o histórico formalmente antes de qualquer merge; não fazer force-push. OR-0049.

## Próximo incremento

Primeiro reconciliar a branch da PR #15 com main, identificando e resolvendo conflitos sem reset/force-push; executar CI completo novamente. Só depois retomar a auditoria de sincronização/observabilidade. Pausa/retomada passaram CI, mas teste real controlado e QA visual dependem de ambiente publicado/autorização. Não realizar chamadas reais ou deploy sem autorização específica.


## Diretriz de execução — OR-20261115-0050

- A partir desta decisão, implementar via PR para `main`, publicar no Render Free existente e corrigir com base no comportamento real; preview/browser externo não é gate.
- PR #15 é a PR existente. Não abrir PR duplicada. Auto-deploy continua OFF e a publicação será manual.
- Documentar cada etapa em OR/PROGRESS/TASKS, incluindo commit, merge, migrations, deploy e observação real.
- Migrations 0010–0013 ainda precisam ser conferidas no banco persistente realmente conectado ao Render; CI descartável não equivale a aplicação persistente. Não inferir projeto Supabase.
- Sem Browser Use pago, sem novo serviço, sem alteração do plano Free, sem task 20.3/Mateus e sem chamadas reais/consumo de créditos não autorizados.


### Publicação inicial — OR-20261115-0050
- PR #15 integrada por squash merge em `main`, commit `9e3f9bd3f7c09a7d2212bd7c1e30796cd020b78f`.
- Deploy manual no Render Free iniciado, ID `dep-dbsvo1rbc2fs73cn5v1g`, estado inicial `build_in_progress`.
- Não houve alteração do plano/serviço nem ativação de auto-deploy. Resultado funcional ainda não confirmado.


### Estado real da publicação — OR-20261115-0050
- Deploy Render Free concluído `live`; servidor iniciado na porta 10000 e Heartbeat ativo. Merge commit `9e3f9bd3f7c09a7d2212bd7c1e30796cd020b78f`.
- URL principal: https://sofia-cp.meshwave.com.br.
- Interface/Messenger ainda precisam de observação funcional pelo operador; não declarar aceite visual.
- Consulta Supabase falhou por autenticação do conector read-only (28P01). Migrations 0010–0013 persistentes não confirmadas.

### Piloto de reconciliação documental — SCP-TASK-000017

- **Estado:** TR retrospectivo produzido e submetido à validação humana.
- **OR:** OR-20261115-0053.
- **ORIGINAL_REQUEST:** documentId=1/versionId=1, PUBLISHED.
- **TR:** documentId=2/versionId=2, AWAITING_HUMAN_VALIDATION.
- **Arquivos:** `missions/SCP-TASK-000017.md` e `missions/SCP-TASK-000017-TR-v0.1.0-DRAFT.md`.
- **Próximo gate:** validação/correção explícita do TR; só depois derivar Blueprint mestre e reconciliar a unidade estratégica 24.
- **Preservação:** pai 17 PAUSED, filhas 22/23 DONE, filha 24 FAIL; nenhum dispatch, consumo de créditos ou alteração de estado nesta etapa.


## Continuidade de remediação — OR-20261117-0003

- 20.4.1 permanece **DIAGNÓSTICO CONCLUÍDO — REMEDIAÇÃO PENDENTE**.
- Render confirma o nome da variável `BUILT_IN_FORGE_API_KEY`, mas a credencial correta da Manus Forge não está disponível para leitura segura nesta sessão. Não usar `OPENAI_API_KEY` do Sandbox por suposição.
- Nenhuma missão nova foi criada. A UI autenticada do SCP exibiu 0 missões e não permitiu abrir a MISSION_0020 existente; registrar essa divergência como bloqueio, sem duplicar dados.
- Próximo critério de saída: credencial Forge segura disponível → atualização do segredo no Render → deploy manual autorizado → verificação de saúde → teste Messenger controlado autorizado → OR próprio com evidência.
