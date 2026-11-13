# `missions/` — espelho operacional do Supabase

Este diretório contém somente os espelhos das tarefas/missões operacionais registradas em `sofia.tasks` no Supabase do projeto `ufylccbdjfzydbwhpmpp`.

Atualmente existem 15 arquivos, de `SCP-TASK-000002.md` a `SCP-TASK-000016.md`. Eles correspondem a 15 registros do Supabase, não à série documental `MISSION_0001`–`MISSION_0023`.

## Hierarquia atual

As tarefas-raiz são 2, 3, 7, 12 e 16. As tarefas 4, 5 e 6 são filhas de 3; 8 é filha de 7; 9, 10 e 11 são filhas de 6; 13, 14 e 15 são filhas de 12.

O Supabase é a fonte executável. Cada arquivo deve preservar `taskId`, `missionKey`, `parentTaskId`, status, prioridade, descrição e o caminho GitHub. Alterações de execução devem ser feitas no painel/Supabase e então espelhadas no arquivo. Editar Markdown manualmente não executa uma missão.

Missões de governança, blueprints, checkpoints, progresso e relatórios não devem ser colocados aqui. Eles ficam em `governance/missions/`. Consulte [`../MISSIONS_INDEX.md`](../MISSIONS_INDEX.md) para a visão completa e a distinção entre os namespaces.
