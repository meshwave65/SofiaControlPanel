# CHECKPOINT — ARC-009-RLS-DRAFT — Proposta server-only

**Data:** 2026-11-03
**Estado:** `WAITING_APPROVAL`
**Base:** `CHECKPOINT-ARC-009.md`
**Projeto alvo:** `ufylccbdjfzydbwhpmpp`
**Arquivo proposto:** `drizzle/0004_arc_server_only_rls.sql`

## Evidências novas

- SCP usa autenticação própria baseada em `sofia.users.openId` e IDs inteiros; não há mapeamento confiável para `auth.uid()`.
- Backend usa Drizzle/Postgres com `DATABASE_URL` e o acesso administrativo testado opera como `postgres`.
- `has_table_privilege` confirmou `anon=false`, `authenticated=false` e `postgres=true` para SELECT em `sofia.arcPolicies`.
- As tabelas ARC continuam sem policies e sem RLS aplicado; nenhuma alteração externa foi feita nesta retomada.

## Proposta

Aplicar `drizzle/0004_arc_server_only_rls.sql`, que:

1. habilita RLS nas três tabelas ARC;
2. revoga acesso de `PUBLIC`, `anon` e `authenticated`;
3. cria uma policy deny-all explícita para clientes;
4. preserva o acesso do owner `postgres` sem `FORCE ROW LEVEL SECURITY`.

A proposta não usa `auth.uid()`, não cria bucket, não altera tabelas base e não ativa `assisted`/`enforced`.

## Gate

A aplicação no Supabase exige aprovação explícita do proprietário porque altera controle de acesso. Após aprovação, aplicar como migration separada, verificar policies/RLS/advisors e executar um teste de leitura/escrita pelo backend. Sem aprovação, manter ARC-009 bloqueada.
