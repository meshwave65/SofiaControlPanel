# CHECKPOINT — ARC-009-RLS-CLOSED — Gate RLS concluído

**Data:** 2026-11-03
**Estado:** `DONE`
**Commit de código/migration:** `3d9488e`
**Projeto Supabase:** `ufylccbdjfzydbwhpmpp`
**Migration aplicada:** `20261104000020 / arc_server_only_rls`
**Migration de persistência anterior:** `20261031133650 / create_arc_pgc_persistence`

## Aplicação

A migration aprovada `drizzle/0004_arc_server_only_rls.sql` foi aplicada via `apply_migration` sem alterar tabelas base ou criar bucket.

- RLS habilitado em `sofia.arcPolicies`.
- RLS habilitado em `sofia.arcAssessments`.
- RLS habilitado em `sofia.arcEvidence`.
- `FORCE ROW LEVEL SECURITY=false` nas três tabelas, preservando o owner server-side `postgres`.
- Grants revogados para `PUBLIC`, `anon` e `authenticated`.
- Policies `*_server_only` deny-all criadas para as três tabelas.

## Validações

- `pg_policies` retornou as três policies com `roles={public}`, `cmd=ALL`, `qual=false` e `with_check=false`.
- `has_table_privilege`: `anon=false`, `authenticated=false`, `postgres=true` para SELECT em `arcPolicies`.
- Consulta server-side como `postgres` funcionou: `policy_count=1`, `assessment_count=0`, `evidence_count=0`.
- Advisors não reportam mais RLS desabilitado nas tabelas ARC; permanecem achados preexistentes fora do escopo ARC-009.
- `git diff --check` passou.
- `pnpm check` / TypeScript passou.

## Limites preservados

- O sistema segue somente em `shadow mode`.
- `assisted` e `enforced` não foram ativados.
- Nenhum teste foi feito com cliente anônimo/autenticado, pois o desenho aprovado é server-only.
- O linter ainda mostra achados preexistentes em outras tabelas/functions do projeto; eles não foram alterados nesta unidade.

## Continuidade

ARC-009 está concluída. Não reabrir ARC-001–ARC-009. Qualquer exposição futura a cliente Supabase exigirá nova tarefa, policies de ownership baseadas em um modelo de identidade compatível e revisão explícita.
