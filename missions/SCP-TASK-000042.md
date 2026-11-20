# Análise Estratégica: Desambiguação do banco de dados — prefixo SCO_ versus SCP e identificação das tabelas canônicas

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo é a fonte versionada de proveniência e contexto.

## Metadata

| Campo | Valor |
| --- | --- |
| missionKey | SCP-TASK-000042 |
| taskId | 42 |
| source | SofiaControlPanel interface |
| creator | user:1425 |
| creatorType | user |
| statusId | 4 |
| priorityId | 3 |
| parentTaskId | 37 |
| dueDate |  |
| mirroredAt | 2026-11-20T02:45:14.379Z |

## Description

[ESTRATÉGICA] Investigar a origem e o significado das tabelas com prefixo sco_ no banco. O usuário esclarece que referências anteriores a SCO foram erros de digitação de SCP (teclas O/P adjacentes), não solicitação de renomeação nem mudança conceitual. Auditar catálogo completo de tabelas e schemas, colunas, constraints, chaves estrangeiras, views, triggers, funções, migrations e referências no código. Comparar tabelas sco_ com possíveis equivalentes sem prefixo, identificar duplicidade, legado, uso ativo, dados e dependências. Produzir matriz de desambiguação com evidências e recomendação por tabela: canônica, legado, duplicada, órfã ou inconclusiva. Não renomear, excluir, migrar, alterar dados, schemas ou código nesta missão. Não presumir que toda tabela sco_ é erro: estabelecer evidência técnica e pedir validação antes de qualquer mudança. Objetivo é eliminar ambiguidade documental e estrutural, preservando o banco.

## Synchronization contract

- Supabase task ID: `42`
- GitHub path: `missions/SCP-TASK-000042.md`
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam a missão automaticamente.
