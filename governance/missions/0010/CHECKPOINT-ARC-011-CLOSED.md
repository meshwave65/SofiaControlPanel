# CHECKPOINT — ARC-011 — Fechamento

**Data:** 2026-11-12
**Estado:** `DONE` — shadow-only
**Agente:** Manus ARC-PGC Agent
**Blueprint:** `governance/missions/0010/BLUEPRINT-ARC-011.md`
**Commits de implementação:** `d40daa9`, `91b1048`
**Commit deste checkpoint/OR:** publicado após validação

## Resultado

ARC-011 foi concluída no `SofiaControlPanel`. O fluxo de avaliação ARC agora persiste um evento operacional, cria/atualiza um perfil simples do agente como proxy inicial de equipamento e cria um snapshot histórico com score de confiança entre 0 e 100, posterior, decisão, sinais e contagem de anomalias.

## Artefatos

- `drizzle/schema.ts`
- `drizzle/0007_arc_telemetry_confidence.sql`
- `server/confidenceScorer.ts`
- `server/confidenceScorer.test.ts`
- `server/db.ts`
- `server/routers.ts`
- `client/src/pages/TaskDetail.tsx`
- `governance/operational_reports/OR-20261112-0065.md`

## API e UI

A procedure protegida `arc.listConfidenceSnapshots` consulta o histórico somente após `canAccessTask`, preservando ownership/admin. O `TaskDetail` exibe a confiança atual e barras históricas, com aviso de que o sinal é informativo e não bloqueia acesso. Reabrir uma tarefa continua sem nova avaliação automática quando já existe assessment; a avaliação explícita cria novos pontos históricos.

## Banco e segurança

A migration `arc_011_telemetry_confidence` foi aplicada no Supabase `ufylccbdjfzydbwhpmpp`. Foram confirmadas as tabelas `sofia.arcAccessEvents`, `sofia.arcDeviceProfiles` e `sofia.arcConfidenceSnapshots`, RLS habilitado nas três e policies `*_server_only` com `qual=false` e `with_check=false`. Nenhum bucket foi criado ou reutilizado.

## Validações

- `git diff --check`: aprovado.
- `pnpm check`: aprovado.
- `pnpm test -- --run`: 5 arquivos e 17 testes aprovados.
- `pnpm build`: frontend Vite e bundle server aprovados.
- Validação Supabase MCP: migration aplicada; tabelas, RLS e policies confirmados.

## Limites e próximo gate

Não foram adicionados GPS, IP, geohash, fingerprint real, configuração de hardware, bloqueio, `assisted` ou `enforced`. O score é heurístico e não calibrado. Não foi realizado smoke test em navegador autenticado nem teste de integração com banco no repositório; ambos permanecem itens de validação posterior antes de qualquer mudança de modo.

## Continuidade

Qualquer localização, horários atípicos, configuração real de dispositivo ou mudança para `assisted`/`enforced` exige nova tarefa formal, revisão de privacidade e decisão explícita. O OR `OR-20261112-0065` está `SUBMITTED` com `oracle_status: PENDING`.
