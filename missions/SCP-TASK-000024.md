# Análise Estratégica: Orquestração de contatos e reuniões MWC / SOFIA-SWE

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo é a fonte versionada de proveniência e contexto.

## Metadata

| Campo | Valor |
| --- | --- |
| missionKey | SCP-TASK-000024 |
| taskId | 24 |
| source | SofiaControlPanel interface |
| creator | user:1425 |
| creatorType | user |
| statusId | 5 |
| priorityId | 2 |
| parentTaskId | 17 |
| dueDate |  |
| mirroredAt | 2026-11-20T02:45:14.379Z |

## Description

[ESTRATÉGICA] Esta missão transfere para o SCP a coordenação de tarefas de relacionamento profissional para MWC e SOFIA/SWE. O SCP mantém a missão, a fila de tarefas e os Operational Reports. O repositório network continua sendo a fonte de verdade para identidade e mapeamento canônico de contatos, avaliações HH, índices de convergência, registros de reuniões, mensagens e materiais específicos dos projetos.

A missão não cria uma base paralela de pessoas. Cada contato conserva seu master_id e sua ficha única em network/contacts/. As avaliações devem permanecer independentes por projeto em network/projects/mwc/ e network/projects/sofia/. Não copiar biografias para o SCP.

## Synchronization contract

- Supabase task ID: `24`
- GitHub path: `missions/SCP-TASK-000024.md`
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam a missão automaticamente.
