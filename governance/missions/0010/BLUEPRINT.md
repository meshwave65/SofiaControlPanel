# Blueprint da Missão 0010 — Desenvolvimento do ARC/PGC

**Missão:** `MISSION_0010`
**Estado:** `PROGRESS`
**Orquestrador:** SofiaControlPanel (SCP)
**Repositório canônico do produto:** [`meshwave65/SofiaARC-PGC`](https://github.com/meshwave65/SofiaARC-PGC), branch `main`
**Sistema-alvo:** [`meshwave65/SofiaControlPanel`](https://github.com/meshwave65/SofiaControlPanel), branch `main`
**Checkpoint inicial:** `SofiaARC-PGC/CHECKPOINT.md`, commit `5d1ed3c`
**Blueprint do produto:** `SofiaARC-PGC/BLUEPRINT.md`, commit `a3b084f`
**Operational Report de setup:** `OR-20261028-0003`, commit SCP `8a34083`

## 1. Gatilho de retomada

A instrução curta abaixo é suficiente para localizar esta missão:

> **Assuma ARC/PGC a partir do painel do SCP.**

Ao receber essa instrução, o agente deve procurar `MISSION_0010 - Desenvolvimento do ARC PGC - PROGRESS.md` e `MISSION_0010 - TASKS - PROGRESS.md` na raiz do SCP, ler este blueprint e então sincronizar o repositório `meshwave65/SofiaARC-PGC`. O checkpoint remoto mais recente em `origin/main` é a autoridade de continuidade.

Sinônimos aceitos para busca textual: `ARC/PGC`, `ARC-PGC`, `SofiaARC-PGC`, `assuma ARC`, `inferência Bayesiana ARC`.

## 2. Objetivo

Desenvolver um módulo rudimentar, funcional e auditável de ARC/PGC com inferência Bayesiana explicável, integrado gradualmente ao SofiaControlPanel e inicialmente executado em `shadow mode`.

A missão não autoriza alegar autenticação criptográfica, prova de presença física, anonimato, resistência a ataques ou calibração estatística sem mecanismos e evidências específicas.

## 3. Repositórios e autoridade

- O SCP mantém a missão, as tarefas, os Operational Reports e o handoff.
- O repositório `SofiaARC-PGC` mantém o blueprint do produto, código, testes e checkpoints técnicos.
- O `SofiaControlPanel` continua sendo o sistema de integração, mas não deve ser alterado antes da etapa ARC-004, salvo documentação/OR.
- Nunca criar um fork ou segundo repositório sem registrar uma decisão no SCP.

## 4. Regras de continuidade

1. Sincronizar ambos os repositórios antes de trabalhar.
2. Ler o último `CHECKPOINT*.md` remoto do `SofiaARC-PGC`.
3. Identificar a única tarefa `STAGED` ou `PROGRESS` atribuída no arquivo de tarefas.
4. Se houver tarefa `PROGRESS` atribuída a outro agente, não duplicá-la; ler o checkpoint remoto e continuar somente a próxima ação indicada.
5. Trabalhar em uma etapa por vez.
6. Publicar primeiro o código/documento da etapa e imediatamente depois seu checkpoint, em commits separados.
7. Atualizar o arquivo de tarefas e o OR no SCP em commits rastreáveis.
8. Confirmar `origin/main` após cada push.
9. Se o estado for ambíguo, parar e registrar bloqueio; não inferir próxima etapa por numeração.

## 5. Fases

- **ARC-001:** blueprint, repositório, checkpoint inicial e OR — concluída.
- **ARC-002:** motor Bayesiano puro, tipos e testes — em execução pelo primeiro agente.
- **ARC-003:** coletor ARC e avaliador PGC.
- **ARC-004:** persistência e migrations no SofiaControlPanel.
- **ARC-005:** API tRPC.
- **ARC-006:** integração do orquestrador em `shadow mode`.
- **ARC-007:** UI mínima.
- **ARC-008:** validação final, handoff e decisão sobre `assisted`.

Nenhuma fase posterior pode ser iniciada antes do checkpoint e dos critérios de aceite da fase anterior.

## 6. Critérios de aceite da missão

- Cada fase possui código/documentação, validação, commit remoto e checkpoint.
- O checkpoint permite que um agente novo retome sem consultar esta conversa.
- O SCP contém uma tarefa formal, status, responsável/instância, próximo passo e OR correspondente.
- O motor e a integração distinguem avaliação heurística de autenticação forte.
- O modo padrão permanece `shadow` até decisão explícita posterior.
