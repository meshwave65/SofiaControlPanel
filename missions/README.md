# `missions/` — espelho operacional do Supabase

Este diretório contém os espelhos das tarefas/missões operacionais registradas em `sofia.tasks` no projeto Supabase `ufylccbdjfzydbwhpmpp`.

**Snapshot de conciliação — 2026-11-20:** 43 registros operacionais no Supabase, com chaves até `SCP-TASK-000048`, e 43 arquivos de espelho neste diretório. O Supabase continua sendo a fonte executável; cada arquivo preserva proveniência, contexto e referência cruzada por `missionKey` e `githubPath`.

## Hierarquia atual

Raízes: 2, 3, 7, 12, 16, 17, 18, 25, 27, 32, 36, 37, 38, 39, 43, 44, 45 e 46.

- Filhas de 3: 4, 5 e 6; filha de 7: 8; filhas de 6: 9, 10 e 11; filhas de 12: 13, 14 e 15.
- Filhas de 18: 19, 20 e 21; filhas de 17: 22, 23 e 24; filha de 25: 26.
- Filhas de 27: 29, 30 e 31; filhas de 37: 40, 41 e 42; filhas de 46: 47 e 48.

## Contrato de sincronização

- Cada tarefa deve ter um arquivo `missions/SCP-TASK-XXXXXX.md`.
- O Supabase registra `missionKey`, `githubPath`, `githubSha`, `githubSyncStatus` e `githubSyncedAt`.
- Criação, fatoração e mudanças de estado devem atualizar o registro Supabase e o espelho GitHub.
- O espelhamento automático do serviço Render depende de `GITHUB_PAT`; sem essa variável, o estado deve permanecer explicitamente `not_configured`, nunca ser apresentado como sincronizado.
- Alterações manuais no Markdown não executam nem alteram o estado operacional da missão.

Missões de governança, Blueprints, checkpoints e relatórios ficam em `governance/missions/`; não devem ser confundidos com a série operacional `SCP-TASK-*`. Consulte [`../MISSIONS_INDEX.md`](../MISSIONS_INDEX.md).
