# Sincronizar missões no Supabase e no GitHub

> Espelho operacional provisório do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo é a fonte versionada de proveniência e contexto.

## Metadata

| Campo | Valor |
| --- | --- |
| missionKey | SCP-TASK-000016 |
| taskId | 16 |
| source | Solicitação da Missão Sofia #16 |
| mirrorState | provisional-github-only |
| statusId | não verificado — acesso ao Supabase indisponível nesta execução |
| priorityId | não verificado — acesso ao Supabase indisponível nesta execução |
| parentTaskId | não verificado — acesso ao Supabase indisponível nesta execução |
| githubPath | missions/SCP-TASK-000016.md |

## Objetivo

Sincronizar as missões e sub-missões entre o Supabase e o diretório `missions` do GitHub, eliminando o descompasso entre as duas fontes.

## Escopo

1. Auditar o conjunto de missões existente no Supabase.
2. Auditar o conjunto de arquivos existente em `missions/` no GitHub.
3. Comparar identificadores estáveis, conteúdo, estado, prioridade e relações pai-filho.
4. Corrigir divergências de forma rastreável, preservando a fonte executável e os vínculos das sub-missões.
5. Produzir evidências, limitações e próximos passos.

## Estado desta execução

O arquivo foi criado no GitHub como espelho provisório a partir da solicitação recebida. O backfill e a confirmação dos campos executáveis no Supabase permanecem pendentes porque a sessão não possui `DATABASE_URL`, credencial server-side do Supabase nem sessão autenticada no painel publicado.

Não foram inventados status, prioridade, relação pai-filho ou sub-missões. Nenhuma sub-missão foi confirmada nesta execução.

## Synchronization contract

- Supabase task ID: `16`
- GitHub path: `missions/SCP-TASK-000016.md`
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam a missão automaticamente.
- O campo `mirrorState` deve ser substituído por `synced` somente após backfill/validação no Supabase e confirmação da hierarquia de sub-missões.
