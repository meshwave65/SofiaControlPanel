# sincronzar missões no supabase e no github

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo é a fonte versionada de proveniência e contexto.

## Metadata

| Campo | Valor |
| --- | --- |
| missionKey | SCP-TASK-000016 |
| taskId | 16 |
| source | SofiaControlPanel interface |
| creator | info@meshwave.com.br |
| creatorType | user |
| status | PROGRESS |
| statusId | 2 |
| priority | Crítica |
| priorityId | 4 |
| parentTaskId |  |
| githubPath | missions/SCP-TASK-000016.md |
| mirroredAt | 2026-11-13T00:13:07.521843Z |

## Description

Existe um discincronismo entre as missões no supabase e em github (diretorio missions), e isto é um problrma... estes dois locais tem de ser espelados em termoos de missões e sub missoes

## Synchronization contract

- Supabase task ID: `16`
- GitHub path: `missions/SCP-TASK-000016.md`
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam a missão automaticamente.
