# Ponto de entrada — ARC/PGC

Quando o usuário disser:

> **Assuma ARC/PGC a partir do painel do SCP.**

o agente deve localizar e ler, nesta ordem:

1. `MISSION_0010 - Desenvolvimento do ARC PGC - PROGRESS.md`;
2. `MISSION_0010 - TASKS - PROGRESS.md`;
3. `governance/missions/0010/BLUEPRINT.md`;
4. o último checkpoint publicado em `https://github.com/meshwave65/SofiaARC-PGC`;
5. `governance/missions/0010/CONSOLIDACAO-ESTADOS-E-CONTINUIDADE.md`.

O repositório canônico de código e checkpoints é:

`https://github.com/meshwave65/SofiaARC-PGC`

O sistema de integração e Operational Reports é:

`https://github.com/meshwave65/SofiaControlPanel`

Não iniciar trabalho pela conversa anterior. Confirmar `origin/main`, branch, status, commits e a linha `PROGRESS`/`STAGED` no arquivo de tarefas. Executar somente a próxima ação registrada no checkpoint remoto. Publicar código/documentação e checkpoint em commits separados; depois atualizar a tarefa e produzir o Operational Report no SCP.

O estado atual da missão é `CONSOLIDATED`: ARC-001–ARC-008 concluídas para uso controlado em `shadow mode`. O checkpoint SCP remoto de consolidação é `456900a`. O próximo agente não deve reabrir etapas anteriores; deve assumir somente uma nova tarefa formal de validação de ambiente, se registrada como elegível.
