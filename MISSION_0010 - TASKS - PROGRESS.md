# MISSION_0010 — TASKS — PROGRESS

**Repositório canônico:** `https://github.com/meshwave65/SofiaARC-PGC`
**Blueprint:** `governance/missions/0010/BLUEPRINT.md`
**Último checkpoint técnico confirmado:** `456900a`
**Atualizado em:** 2026-10-31

| ID | Tarefa | Status | Instância | Repositório/artefato | Próxima ação |
|---|---|---|---|---|---|
| ARC-001 | Criar repositório, blueprint, checkpoint inicial e OR de setup | DONE | Manus ARC-PGC Agent | `SofiaARC-PGC` — commits `a3b084f`, `5d1ed3c`; SCP OR `8a34083` | Nenhuma; marco de setup concluído |
| ARC-002 | Implementar motor Bayesiano puro, tipos e testes | DONE | Manus ARC-PGC Agent | `SofiaARC-PGC` — código `0be1805`, higiene `86a3294`, checkpoint `84d21bf` | Concluída; 8 testes passaram e TypeScript foi validado |
| ARC-003 | Implementar coletor ARC e avaliador PGC | DONE | Manus AI (sandbox:Tq8FCw5EEQC8s4y2kvJrrc) | `SofiaARC-PGC` — código `d9df1aa`, checkpoint `35f6486` | 5 sinais em memória, shadow mode, 4 testes novos; 12 testes totais passaram; OR-20261029-0005 |
| ARC-004 | Adicionar persistência e migrations no SofiaControlPanel | DONE | Manus AI (sandbox:Tq8FCw5EEQC8s4y2kvJrrc) | `SofiaControlPanel` — schema/migration `44659ed`, checkpoint `governance/missions/0010/CHECKPOINT-ARC-004.md` | 3 tabelas, FKs, relações e índices; migration gerada/validada estaticamente; execução em banco real pendente; OR-20261029-0006 |
| ARC-005 | Adicionar API tRPC protegida | DONE | Manus AI (sandbox:Tq8FCw5EEQC8s4y2kvJrrc) | `SofiaControlPanel` — código `e635492`, checkpoint `bd64b82`, OR-20261029-0007 | API `arc.evaluateTask`, `arc.getAssessment`, `arc.listAssessments`; ownership/admin; shadow default; integração do avaliador permanece ARC-006 |
| ARC-006 | Integrar no orquestrador em shadow mode | DONE | Manus AI (sandbox:Tq8FCw5EEQC8s4y2kvJrrc) | `SofiaControlPanel` — código `3ba580c`, checkpoint `CHECKPOINT-ARC-006.md`, OR-20261029-0008 | Avaliação real usa task/agente/activity, policy habilitada e Bayes heurístico; não bloqueia tarefas; banco real/migration ainda pendentes |
| ARC-007 | Criar UI mínima de avaliação na tarefa | DONE | Manus ARC-PGC Agent | `SofiaControlPanel` — UI `d759954`, checkpoint `cce90ae`, OR-20261030-0003 | Concluída; posterior, decisão, modo e evidências sem metadata sensível; check/test/build aprovados |
| ARC-008 | Validar, fechar MVP e emitir handoff final | DONE | Manus ARC-PGC Agent | `SofiaControlPanel` — checkpoint `456900a`, OR-20261031-0001 | MVP consolidado para uso controlado em shadow; PostgreSQL/autenticação real são gates de uma nova tarefa formal |

## Regra de assunção

Um agente sucessor deve assumir somente uma linha `STAGED` ou continuar uma linha `PROGRESS` que esteja atribuída a ele. Antes de qualquer alteração, deve confirmar o último commit remoto do repositório canônico e ler o checkpoint correspondente. Se ARC-002 continuar `PROGRESS` atribuída a outra instância, não duplicar trabalho: consultar o checkpoint remoto e aguardar a próxima tarefa liberada.

## Critérios de fechamento de cada tarefa

A tarefa só pode ser marcada `DONE` depois que o artefato da etapa e seu checkpoint forem publicados em `origin/main`, os testes/validações forem registrados e um Operational Report correspondente estiver publicado no SofiaControlPanel com `oracle_status: PENDING`.
