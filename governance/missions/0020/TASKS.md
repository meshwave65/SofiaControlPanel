# MISSION_0020 — Quadro de tarefas

**Estado da missão:** PROGRESS  
**Regra:** cada unidade material produz seu próprio Operational Report. O estado deve refletir evidência, não intenção.

| ID | Unidade | Estado | Referência | Saída / critério |
|---|---|---|---|---|
| 20.1 | Inventário funcional e diagnóstico inicial | DONE / histórico | ORs históricos da missão | Inventário e fronteiras iniciais de falha documentados; revalidar quando necessário. |
| 20.2 | Integração e execução externa | DONE / histórico parcial | MISSION_0016 e ORs históricos | Integração Manus existente; validação real ponta a ponta depende de autorização e ambiente de teste. |
| 20.3 | Unidade atribuída a Mateus | PRESERVADA — NÃO ALTERAR | Registro operacional próprio | Fora do escopo desta sequência; não modificar nem assumir. |
| 20.4 | Auditoria e restauração funcional do SCP | PROGRESS | OR-20261115-0043 a OR-20261115-0046, PR #15 | Evoluir o SCP como gestor soberano de missões; Messenger, ciclo de vida, coordenação pai/filhas, TR e autonomia em incrementos pequenos e verificáveis. |

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
