# Definir a tarefa de implementação do gestor de missões do SCP

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo preserva proveniência, estado sincronizado e contexto.

## Metadata

| Campo | Valor |
| --- | --- |
| missionKey | SCP-TASK-000026 |
| taskId | 26 |
| source | SofiaControlPanel operational queue |
| creator | user:1425 |
| creatorType | user |
| status | STAGED |
| statusId | 1 |
| priority | Alta |
| priorityId | 3 |
| parentTaskId | 25 |
| githubPath | missions/SCP-TASK-000026.md |
| githubSyncStatus | pending |
| mirroredAt | 2026-11-13T13:08:37Z |

## Description

Dependência obrigatória: iniciar somente depois da conclusão da missão-pai de análise. Ler o resultado e as evidências da análise antes de redigir a especificação; se a análise estiver bloqueada, preservar o bloqueio e não inventar capacidades.

Definir uma tarefa de implementação autocontida e pronta para execução do gestor de missões no SCP. Especificar: (1) escopo MVP e fases, priorizados; (2) requisitos funcionais e modelo de estados/eventos para detectar pausas, identificar causas com evidência, preservar checkpoint/contexto e permitir retomada/reatribuição; (3) integrações por provedor somente para capacidades confirmadas e fallback manual quando não houver API oficial; (4) dados persistidos e trilha auditável, idempotência e prevenção de duplicidade; (5) seleção de agente alternativo com critérios de capacidade/créditos confirmados sem expor segredos; (6) permissões e isolamento por workspace; (7) salvaguardas para uso pago, publicação, exclusão e outras ações externas; (8) dependências, riscos, decisões pendentes, fora de escopo e critérios de aceite verificáveis.

Entregável: especificação da tarefa de implementação, baseada na análise-pai, sem executar a implementação, alterar código/dados/configuração ou criar outra missão. Recomendar se a implementação está pronta para ser iniciada ou depende de decisões/gates humanos.

## Synchronization contract

- Supabase project: `ufylccbdjfzydbwhpmpp`
- Supabase schema/table: `sofia.tasks`
- Supabase task ID: `26`
- `missionKey`: `SCP-TASK-000026`
- Parent task: `25` (`SCP-TASK-000025`)
- GitHub repository: `meshwave65/SofiaControlPanel`
- GitHub path: `missions/SCP-TASK-000026.md`
- O estado executável é mantido no Supabase; este arquivo é o espelho versionado e o registro de proveniência.
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam nem atualizam automaticamente a tarefa.
