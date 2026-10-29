# MISSION_0010 — TASKS — PROGRESS

**Repositório canônico:** `https://github.com/meshwave65/SofiaARC-PGC`
**Blueprint:** `governance/missions/0010/BLUEPRINT.md`
**Último checkpoint técnico confirmado:** `5d1ed3c`
**Atualizado em:** 2026-10-28

| ID | Tarefa | Status | Instância | Repositório/artefato | Próxima ação |
|---|---|---|---|---|---|
| ARC-001 | Criar repositório, blueprint, checkpoint inicial e OR de setup | DONE | Manus ARC-PGC Agent | `SofiaARC-PGC` — commits `a3b084f`, `5d1ed3c`; SCP OR `8a34083` | Nenhuma; marco de setup concluído |
| ARC-002 | Implementar motor Bayesiano puro, tipos e testes | PROGRESS | Manus ARC-PGC Agent | `SofiaARC-PGC` — checkpoint `5d1ed3c` | Implementar log-odds, confiabilidade, thresholds e testes; publicar código e checkpoint em commits separados |
| ARC-003 | Implementar coletor ARC e avaliador PGC | STAGED | — | `SofiaARC-PGC` | Aguardar checkpoint de conclusão ARC-002 |
| ARC-004 | Adicionar persistência e migrations no SofiaControlPanel | STAGED | — | `SofiaControlPanel` + `SofiaARC-PGC` | Aguardar ARC-003 |
| ARC-005 | Adicionar API tRPC protegida | STAGED | — | `SofiaControlPanel` | Aguardar ARC-004 |
| ARC-006 | Integrar no orquestrador em shadow mode | STAGED | — | `SofiaControlPanel` | Aguardar ARC-005 |
| ARC-007 | Criar UI mínima de avaliação na tarefa | STAGED | — | `SofiaControlPanel` | Aguardar ARC-006 |
| ARC-008 | Validar, fechar MVP e emitir handoff final | STAGED | — | Ambos | Aguardar ARC-007 |

## Regra de assunção

Um agente sucessor deve assumir somente uma linha `STAGED` ou continuar uma linha `PROGRESS` que esteja atribuída a ele. Antes de qualquer alteração, deve confirmar o último commit remoto do repositório canônico e ler o checkpoint correspondente. Se ARC-002 continuar `PROGRESS` atribuída a outra instância, não duplicar trabalho: consultar o checkpoint remoto e aguardar a próxima tarefa liberada.

## Critérios de fechamento de cada tarefa

A tarefa só pode ser marcada `DONE` depois que o artefato da etapa e seu checkpoint forem publicados em `origin/main`, os testes/validações forem registrados e um Operational Report correspondente estiver publicado no SofiaControlPanel com `oracle_status: PENDING`.
