# Análise Estratégica: Restaurar interação real entre operador e Sofia no painel de mensagens

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo é a fonte versionada de proveniência e contexto.

## Metadata

| Campo | Valor |
| --- | --- |
| missionKey | SCP-TASK-000021 |
| taskId | 21 |
| source | SofiaControlPanel interface |
| creator | user:152 |
| creatorType | user |
| statusId | 4 |
| priorityId | 4 |
| parentTaskId | 18 |
| dueDate |  |
| mirroredAt | 2026-11-20T02:45:14.379Z |

## Description

[ESTRATÉGICA] Corrigir o SofiaControlPanel para que mensagens enviadas pelo operador sejam persistidas, encaminhadas ao serviço de IA, respondidas pela Sofia e exibidas na interface web. A entrega deve incluir validação, persistência do schema e espelho GitHub/Supabase conforme o contrato operacional do SCP.

## Synchronization contract

- Supabase task ID: `21`
- GitHub path: `missions/SCP-TASK-000021.md`
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam a missão automaticamente.
