# CHECKPOINT — ARC-009 — Provisionamento Supabase e gate de segurança

**Checkpoint:** ARC-009
**Data:** 2026-10-31
**Missão:** `MISSION_0010`
**Projeto Supabase:** `meshwave65's Project` (`ufylccbdjfzydbwhpmpp`)
**Migration aplicada:** `20261031133650_create_arc_pgc_persistence`
**SCP referência:** `be12d11`
**Estado:** `BLOCKED` por decisão de RLS; o MVP continua funcional somente em `shadow mode` e não deve ser exposto via cliente até as políticas serem definidas.

## Objetivo

Usar o conector Supabase autorizado para transformar a persistência ARC/PGC estática em persistência real, sem criar bucket desnecessário e sem reabrir as etapas ARC-001–ARC-008.

## Executado com sucesso

- Projeto único autorizado identificado: `ufylccbdjfzydbwhpmpp`.
- Schema `sofia` confirmado com as tabelas base `tasks`, `agents`, `users`, `activityLogs` e demais relações necessárias.
- Migration aplicada via Supabase MCP `apply_migration`.
- Criadas as tabelas:
  - `sofia.arcPolicies`;
  - `sofia.arcAssessments`;
  - `sofia.arcEvidence`.
- FKs e índices ARC criados.
- Migration registrada no Supabase como `20261031133650 / create_arc_pgc_persistence`.
- Política mínima criada:
  - `id=1`;
  - `name=arc_default_shadow`;
  - `enabled=true`;
  - `prior=0.500000`;
  - `allowThreshold=0.850000`;
  - `reviewThreshold=0.550000`;
  - `version=0.1.0`.
- Nenhum bucket foi criado: avaliações, evidências e metadata usam PostgreSQL/JSONB.

## Bloqueio de segurança

O advisor Supabase confirmou `rls_disabled` nas três tabelas ARC. A situação atual permite exposição potencial a roles `anon`/`authenticated` conforme a configuração de exposição do schema. O advisor forneceu esta remediação mínima:

```sql
ALTER TABLE "sofia"."arcAssessments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sofia"."arcEvidence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sofia"."arcPolicies" ENABLE ROW LEVEL SECURITY;
```

Essas instruções **não foram aplicadas**. Habilitar RLS sem políticas pode bloquear o acesso legítimo. A próxima ação exige definir e revisar políticas para:

- leitura de assessments/evidence apenas por owner da tarefa ou admin;
- inserção/atualização apenas pelo serviço server-side autorizado;
- leitura da política sem expor thresholds indevidamente, se necessário;
- nenhum acesso anônimo.

Não ativar `assisted` ou `enforced` enquanto esse gate estiver aberto.

## Continuidade exata

1. Definir políticas RLS compatíveis com o modelo de ownership do SCP.
2. Aplicar RLS e policies em migration separada, após revisão explícita.
3. Verificar advisors e consultas de leitura/escrita com roles adequadas.
4. Executar fluxo end-to-end autenticado.
5. Atualizar ARC-009 para `DONE` somente após essas verificações.

A MISSION_0010 permanece consolidada; ARC-009 é um follow-up de ambiente e segurança, não uma reabertura do MVP.
