# `missions/` — espelho operacional do Supabase

Este diretório contém os espelhos das tarefas/missões operacionais registradas em `sofia.tasks` no projeto Supabase `ufylccbdjfzydbwhpmpp`.

**Snapshot de conciliação — 2026-11-25:** 54 registros operacionais no Supabase, maior ID `SCP-TASK-000062`; 52 arquivos de espelho no diretório. A diferença de 2 arquivos permanece pendente de conciliação. A MISSION_0033 e suas tarefas 000059–000062 já possuem espelhos publicados.

## Hierarquia atual

Raízes históricas: 2, 3, 7, 12, 16, 17, 18, 25, 27, 32, 36, 37, 38, 39, 43, 44, 45 e 46; a raiz 59 corresponde à MISSION_0033.

- Filhas de 3: 4, 5 e 6; filha de 7: 8; filhas de 6: 9, 10 e 11; filhas de 12: 13, 14 e 15.
- Filhas de 18: 19, 20 e 21; filhas de 17: 22, 23 e 24; filha de 25: 26.
- Filhas de 27: 29, 30 e 31; filhas de 37: 40, 41 e 42; filhas de 46: 47 e 48.
- Filhas de 59: 60, 61 e 62 — análises estrutural, operacional e estratégica.

## Contrato de sincronização

- Cada tarefa deve ter um arquivo `missions/SCP-TASK-XXXXXX.md`.
- O Supabase registra `missionKey`, `githubPath`, `githubSha`, `githubSyncStatus` e `githubSyncedAt`.
- Criação, fatoração e mudanças de estado devem atualizar o registro Supabase e o espelho GitHub.
- O espelhamento automático do serviço Render depende de `GITHUB_PAT`; sem essa variável, o serviço deve indicar `not_configured`. Uma sincronização manual via integração GitHub pode ser registrada como concluída somente depois de confirmar o commit e o arquivo correspondente.
- Alterações manuais no Markdown não executam nem alteram o estado operacional da missão.

Missões de governança, Blueprints, checkpoints e relatórios ficam em `governance/missions/`; não devem ser confundidos com a série operacional `SCP-TASK-*`. Consulte [`../MISSIONS_INDEX.md`](../MISSIONS_INDEX.md).
