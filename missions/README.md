# `missions/` — espelho operacional do Supabase

Este diretório contém somente os espelhos das tarefas/missões operacionais registradas em `sofia.tasks` no Supabase do projeto `ufylccbdjfzydbwhpmpp`.

No snapshot de 2026-11-13 existem 18 arquivos operacionais, entre os IDs 2 e 22; as lacunas são 17, 20 e 21. O espelho `SCP-TASK-000022.md` foi acrescentado nesta data. Esses arquivos correspondem a registros operacionais do Supabase, não à série documental `MISSION_0001`–`MISSION_00023`; a presença ou ausência de um espelho não altera a fonte executável.

## Hierarquia atual

As tarefas-raiz documentadas são 2, 3, 7, 12 e 16. As tarefas 4, 5 e 6 são filhas de 3; 8 é filha de 7; 9, 10 e 11 são filhas de 6; 13, 14 e 15 são filhas de 12; a tarefa 22 é filha de 17 (cujo espelho permanece uma lacuna histórica).

O Supabase é a fonte executável. Cada arquivo deve preservar `taskId`, `missionKey`, `parentTaskId`, status, prioridade, descrição e o caminho GitHub. Alterações de execução devem ser feitas no painel/Supabase e então espelhadas no arquivo. Editar Markdown manualmente não executa uma missão.

Missões de governança, blueprints, checkpoints, progresso e relatórios não devem ser colocados aqui. Eles ficam em `governance/missions/`. Consulte [`../MISSIONS_INDEX.md`](../MISSIONS_INDEX.md) para a visão completa e a distinção entre os namespaces.
