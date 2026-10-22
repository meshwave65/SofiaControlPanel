# Mapa relacional completo do Supabase — SOFIA

**Projeto:** `meshwave65's Project` (`ufylccbdjfzydbwhpmpp`)
**Verificado em:** 21/10/2026 22:45 (UTC−03:00)
**Fonte:** inventário detalhado `list_tables` (`verbose=true`) nos schemas `public` e `sofia`. Nenhum dado de linha foi consultado.

## Cobertura

- **46 tabelas**: `public`: 35, `sofia`: 11.
- **40 constraints FK distintas**, deduplicadas pelo nome; a resposta do Supabase inclui algumas constraints em ambas as tabelas relacionadas.
- `public.profiles.id → auth.users.id` cruza para `auth`, fora dos dois schemas inventariados, e está incluída no catálogo de relações.
- As contagens de linhas são metadados aproximados do inventário, não leitura nem exportação de registros.

## Tabelas, PKs e FKs de saída

Cada FK aparece uma vez na tabela de origem e no catálogo completo abaixo. `RLS` informa se Row Level Security está habilitado.

### `public`

| Tabela | PK | Linhas* | RLS | FKs de saída |
|---|---|---:|:---:|---|
| `public.appsofia_artifacts` | `id` | 0 | **não** | `public.appsofia_artifacts.task_id → public.appsofia_tasks.id` (`fk_artifact_task`) |
| `public.appsofia_downloader_queue` | `id` | 0 | **não** | — |
| `public.appsofia_tasks` | `id` | 1086 | sim | — |
| `public.Artifacts` | `artifact_id` | 0 | **não** | `public.Artifacts.message_id → public.messages.message_id` (`Artifacts_message_id_fkey`); `public.Artifacts.task_id → public.tasks.task_id` (`Artifacts_task_id_fkey`) |
| `public.clients` | `client_id` | 4 | sim | `public.clients.invite_code → public.invites_dev.code` (`clients_invite_code_fkey`) |
| `public.clients_dev` | `id` | 0 | **não** | — |
| `public.communities` | `id` | 0 | **não** | — |
| `public.devices` | `id` | 0 | **não** | `public.devices.profile_id → public.profiles.id` (`devices_profile_id_fkey`) |
| `public.invites_dev` | `code` | 0 | **não** | — |
| `public.message_types` | `type_id` | 0 | **não** | — |
| `public.messages` | `message_id` | 0 | **não** | `public.messages.parent_message_id → public.messages.message_id` (`fk_messages_parent_id`) |
| `public.metadata_types` | `metadata_type_id` | 0 | **não** | — |
| `public.metadata_values` | `metadata_value_id` | 0 | **não** | `public.metadata_values.metadata_type_id → public.metadata_types.metadata_type_id` (`fk_metadata_type`) |
| `public.modules` | `module_id` | 0 | **não** | `public.modules.segment_id → public.segments.segment_id` (`fk_modules_segment_id`) |
| `public.mw_blocks` | `id` | 0 | sim | `public.mw_blocks.chain_id → public.mw_chain_metadata.chain_id` (`mw_blocks_chain_id_fkey`) |
| `public.mw_chain_metadata` | `chain_id` | 0 | sim | — |
| `public.mw_state_snapshots` | `id` | 0 | sim | `public.mw_state_snapshots.chain_id → public.mw_chain_metadata.chain_id` (`mw_state_snapshots_chain_id_fkey`) |
| `public.mw_transactions` | `id` | 0 | sim | `public.mw_transactions.block_id → public.mw_blocks.id` (`mw_transactions_block_id_fkey`); `public.mw_transactions.chain_id → public.mw_chain_metadata.chain_id` (`mw_transactions_chain_id_fkey`) |
| `public.persona_skills` | `persona_id`, `skill_id` | 0 | **não** | `public.persona_skills.persona_id → public.personas.persona_id` (`fk_persona_skills_persona_id`); `public.persona_skills.skill_id → public.skills.skill_id` (`fk_persona_skills_skill_id`) |
| `public.personas` | `persona_id` | 0 | **não** | — |
| `public.profile_communities` | `profile_id`, `community_id` | 0 | **não** | `public.profile_communities.community_id → public.communities.id` (`profile_communities_community_id_fkey`); `public.profile_communities.profile_id → public.profiles.id` (`profile_communities_profile_id_fkey`) |
| `public.profiles` | `id` | 0 | **não** | `public.profiles.id → auth.users.id` (`profiles_id_fkey`) |
| `public.segments` | `segment_id` | 0 | **não** | — |
| `public.skills` | `skill_id` | 0 | **não** | — |
| `public.task_blocks` | `block_id` | 0 | **não** | `public.task_blocks.task_id → public.tasks.task_id` (`task_blocks_task_id_fkey`) |
| `public.task_history` | `history_id` | 0 | **não** | `public.task_history.task_id → public.tasks.task_id` (`task_history_task_id_fkey`) |
| `public.task_priorities` | `priority_id` | 0 | **não** | — |
| `public.task_statuses` | `status_id` | 0 | **não** | — |
| `public.task_titles` | `task_id` | 0 | **não** | `public.task_titles.task_id → public.tasks.task_id` (`task_titles_task_id_fkey`) |
| `public.tasks` | `task_id` | 0 | **não** | `public.tasks.client_id → public.clients.client_id` (`tasks_client_id_fkey`); `public.tasks.conversation_root_id → public.tasks.task_id` (`tasks_conversation_root_id_fkey`); `public.tasks.parent_task_id → public.tasks.task_id` (`tasks_parent_task_id_fkey`); `public.tasks.priority_id → public.task_priorities.priority_id` (`tasks_priority_id_fkey`); `public.tasks.status_id → public.task_statuses.status_id` (`tasks_status_id_fkey`) |
| `public.ums_transactions` | `id` | 0 | **não** | `public.ums_transactions.profile_id → public.profiles.id` (`ums_transactions_profile_id_fkey`) |
| `public.user_agents` | `id` | 12 | **não** | — |
| `public.user_origin_providers` | `id` | 2 | **não** | — |
| `public.whitepaper_artifacts` | `id` | 0 | **não** | — |
| `public.workspace_configs` | `id` | 0 | **não** | — |

### `sofia`

| Tabela | PK | Linhas* | RLS | FKs de saída |
|---|---|---:|:---:|---|
| `sofia.activityEventTypes` | `id` | 4 | sim | — |
| `sofia.activityLogs` | `id` | 0 | sim | `sofia.activityLogs.agentId → sofia.agents.id` (`activityLogs_agentId_fkey`); `sofia.activityLogs.eventTypeId → sofia.activityEventTypes.id` (`activityLogs_eventTypeId_fkey`); `sofia.activityLogs.taskId → sofia.tasks.id` (`activityLogs_taskId_fkey`) |
| `sofia.agents` | `id` | 2 | sim | `sofia.agents.ownerId → sofia.users.id` (`agents_ownerId_fkey`) |
| `sofia.contextReports` | `id` | 0 | sim | `sofia.contextReports.ownerId → sofia.users.id` (`contextReports_ownerId_fkey`) |
| `sofia.messages` | `id` | 0 | sim | `sofia.messages.parentMessageId → sofia.messages.id` (`messages_parentMessageId_fkey`); `sofia.messages.senderId → sofia.users.id` (`messages_senderId_fkey`); `sofia.messages.taskId → sofia.tasks.id` (`messages_taskId_fkey`); `sofia.messages.typeId → sofia.messageTypes.id` (`messages_typeId_fkey`) |
| `sofia.messageTypes` | `id` | 3 | sim | — |
| `sofia.scheduledTasks` | `id` | 0 | sim | — |
| `sofia.taskPriorities` | `id` | 4 | sim | — |
| `sofia.tasks` | `id` | 0 | sim | `sofia.tasks.agentId → sofia.agents.id` (`tasks_agentId_fkey`); `sofia.tasks.createdBy → sofia.users.id` (`tasks_createdBy_fkey`); `sofia.tasks.parentTaskId → sofia.tasks.id` (`tasks_parentTaskId_fkey`); `sofia.tasks.priorityId → sofia.taskPriorities.id` (`tasks_priorityId_fkey`); `sofia.tasks.statusId → sofia.taskStatuses.id` (`tasks_statusId_fkey`) |
| `sofia.taskStatuses` | `id` | 5 | sim | — |
| `sofia.users` | `id` | 1 | sim | — |

## Catálogo completo de FKs

| Constraint | Origem | Destino |
|---|---|---|
| `Artifacts_message_id_fkey` | `public.Artifacts.message_id` | `public.messages.message_id` |
| `Artifacts_task_id_fkey` | `public.Artifacts.task_id` | `public.tasks.task_id` |
| `activityLogs_agentId_fkey` | `sofia.activityLogs.agentId` | `sofia.agents.id` |
| `activityLogs_eventTypeId_fkey` | `sofia.activityLogs.eventTypeId` | `sofia.activityEventTypes.id` |
| `activityLogs_taskId_fkey` | `sofia.activityLogs.taskId` | `sofia.tasks.id` |
| `agents_ownerId_fkey` | `sofia.agents.ownerId` | `sofia.users.id` |
| `clients_invite_code_fkey` | `public.clients.invite_code` | `public.invites_dev.code` |
| `contextReports_ownerId_fkey` | `sofia.contextReports.ownerId` | `sofia.users.id` |
| `devices_profile_id_fkey` | `public.devices.profile_id` | `public.profiles.id` |
| `fk_artifact_task` | `public.appsofia_artifacts.task_id` | `public.appsofia_tasks.id` |
| `fk_messages_parent_id` | `public.messages.parent_message_id` | `public.messages.message_id` |
| `fk_metadata_type` | `public.metadata_values.metadata_type_id` | `public.metadata_types.metadata_type_id` |
| `fk_modules_segment_id` | `public.modules.segment_id` | `public.segments.segment_id` |
| `fk_persona_skills_persona_id` | `public.persona_skills.persona_id` | `public.personas.persona_id` |
| `fk_persona_skills_skill_id` | `public.persona_skills.skill_id` | `public.skills.skill_id` |
| `messages_parentMessageId_fkey` | `sofia.messages.parentMessageId` | `sofia.messages.id` |
| `messages_senderId_fkey` | `sofia.messages.senderId` | `sofia.users.id` |
| `messages_taskId_fkey` | `sofia.messages.taskId` | `sofia.tasks.id` |
| `messages_typeId_fkey` | `sofia.messages.typeId` | `sofia.messageTypes.id` |
| `mw_blocks_chain_id_fkey` | `public.mw_blocks.chain_id` | `public.mw_chain_metadata.chain_id` |
| `mw_state_snapshots_chain_id_fkey` | `public.mw_state_snapshots.chain_id` | `public.mw_chain_metadata.chain_id` |
| `mw_transactions_block_id_fkey` | `public.mw_transactions.block_id` | `public.mw_blocks.id` |
| `mw_transactions_chain_id_fkey` | `public.mw_transactions.chain_id` | `public.mw_chain_metadata.chain_id` |
| `profile_communities_community_id_fkey` | `public.profile_communities.community_id` | `public.communities.id` |
| `profile_communities_profile_id_fkey` | `public.profile_communities.profile_id` | `public.profiles.id` |
| `profiles_id_fkey` | `public.profiles.id` | `auth.users.id` |
| `task_blocks_task_id_fkey` | `public.task_blocks.task_id` | `public.tasks.task_id` |
| `task_history_task_id_fkey` | `public.task_history.task_id` | `public.tasks.task_id` |
| `task_titles_task_id_fkey` | `public.task_titles.task_id` | `public.tasks.task_id` |
| `tasks_agentId_fkey` | `sofia.tasks.agentId` | `sofia.agents.id` |
| `tasks_client_id_fkey` | `public.tasks.client_id` | `public.clients.client_id` |
| `tasks_conversation_root_id_fkey` | `public.tasks.conversation_root_id` | `public.tasks.task_id` |
| `tasks_createdBy_fkey` | `sofia.tasks.createdBy` | `sofia.users.id` |
| `tasks_parentTaskId_fkey` | `sofia.tasks.parentTaskId` | `sofia.tasks.id` |
| `tasks_parent_task_id_fkey` | `public.tasks.parent_task_id` | `public.tasks.task_id` |
| `tasks_priorityId_fkey` | `sofia.tasks.priorityId` | `sofia.taskPriorities.id` |
| `tasks_priority_id_fkey` | `public.tasks.priority_id` | `public.task_priorities.priority_id` |
| `tasks_statusId_fkey` | `sofia.tasks.statusId` | `sofia.taskStatuses.id` |
| `tasks_status_id_fkey` | `public.tasks.status_id` | `public.task_statuses.status_id` |
| `ums_transactions_profile_id_fkey` | `public.ums_transactions.profile_id` | `public.profiles.id` |

## Divergências e observações

- Existem dois modelos separados de tarefas, sem FKs cruzadas: `public.tasks` aponta para `public.task_statuses`, `public.task_priorities`, `public.clients` e a si mesma; `sofia.tasks` aponta para `sofia.taskStatuses`, `sofia.taskPriorities`, `sofia.agents`, `sofia.users` e a si mesma.
- `public.messages.task_id` não tem FK para `public.tasks.task_id`; `public.messages.message_type_id` não tem FK para `public.message_types.type_id`. Em `sofia.messages`, as FKs para tarefa, autor, tipo e mensagem pai existem.
- Lookups do engine `public.task_statuses`, `public.task_priorities` e `public.message_types` aparecem vazios; `public.tasks` também tem zero linhas. Lookups `sofia.taskStatuses`, `sofia.taskPriorities` e `sofia.messageTypes` aparecem com 5, 4 e 3 linhas, respectivamente.
- `public.task_history.old_status` e `new_status` são snapshots textuais sem FK; `public.appsofia_tasks.status` também é textual e não usa `public.task_statuses`.
- `public.Artifacts` referencia `public.tasks` e `public.messages`. `public.appsofia_artifacts.task_id` aponta para `public.appsofia_tasks.id`, que é um terceiro modelo separado.

## Alerta crítico de segurança

O retorno também alerta que **29 tabelas públicas estão com RLS desabilitado**: `profiles`, `communities`, `profile_communities`, `devices`, `ums_transactions`, `personas`, `messages`, `metadata_types`, `metadata_values`, `segments`, `modules`, `skills`, `persona_skills`, `whitepaper_artifacts`, `invites_dev`, `clients_dev`, `user_agents`, `user_origin_providers`, `appsofia_downloader_queue`, `message_types`, `task_statuses`, `task_priorities`, `tasks`, `Artifacts`, `task_titles`, `task_blocks`, `task_history`, `workspace_configs` e `appsofia_artifacts`. O advisory indica exposição potencial aos papéis `anon` e `authenticated`; `workspace_configs` contém campos destinados a credenciais/chaves.

**Não habilitei RLS nem apliquei SQL.** Habilitar sem políticas pode interromper acesso legítimo; políticas adequadas precisam ser definidas por tabela. [Documentação de RLS do Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security).

*Contagem aproximada de linhas conforme metadados do catálogo.*
