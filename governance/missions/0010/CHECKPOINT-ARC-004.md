# CHECKPOINT — ARC-004 — Persistência e migrations ARC/PGC

**Checkpoint:** ARC-004
**Blueprint:** `governance/missions/0010/BLUEPRINT.md` v0.1.0
**Data:** 2026-10-29
**Repositório:** `https://github.com/meshwave65/SofiaControlPanel`
**Branch:** `main`
**Commit de schema/migration:** `44659ed`
**Repositório complementar:** `https://github.com/meshwave65/SofiaARC-PGC`
**Checkpoint ARC-003 confirmado:** `SofiaARC-PGC@35f6486`
**Estado:** ARC-004 concluída; ARC-005 liberada após atualização do quadro SCP e publicação do OR

## Objetivo da unidade

Adicionar a persistência mínima do ARC/PGC ao namespace PostgreSQL `sofia`, sem criar API tRPC, UI, integração com o orquestrador ou mudança de modo `shadow`.

## Artefatos publicados

- `drizzle/schema.ts`: tabelas Drizzle `arcPolicies`, `arcAssessments` e `arcEvidence`, tipos de inserção/seleção, FKs, relações e índices.
- `drizzle/0001_fixed_eternity.sql`: migration PostgreSQL gerada pelo Drizzle.
- `drizzle/meta/0001_snapshot.json` e `drizzle/meta/_journal.json`: metadados da migration.

## Modelo persistido

`arcPolicies` armazena nome único, prior, thresholds heurísticos, habilitação, versão e timestamps. `arcAssessments` armazena tarefa, agente opcional, política, prior, posterior, decisão, modo, explicação e criação. Não há `updatedAt` em avaliações; o desenho trata cada avaliação publicada como imutável. `arcEvidence` armazena evidência normalizada, confiabilidade, likelihood ratio, origem, momento observado e metadata JSONB vinculada à avaliação.

As relações usam `tasks`, `agents` e `arcPolicies` como referências da avaliação. A exclusão de tarefa/política é restrita quando há avaliação; a exclusão de agente torna `agentId` nulo; a exclusão de avaliação remove suas evidências. Índices foram criados para tarefa, agente, política, avaliação, chave e data observada/criada.

## Validação

Executado com sucesso:

- `pnpm exec tsx -e 'import("./drizzle/schema.ts")'` — import do schema aprovado;
- `DATABASE_URL=postgresql://placeholder... pnpm drizzle-kit check` — migration/schema consistentes;
- `pnpm drizzle-kit generate` — gerou `drizzle/0001_fixed_eternity.sql`;
- `git diff --check` — sem erros;
- commit `44659ed` confirmado em `origin/main`.

A migration foi gerada e validada estaticamente com uma URL placeholder. Não foi executada contra um banco real nesta unidade, porque `DATABASE_URL` real não estava autorizado/disponível no ambiente. Não afirmar que as tabelas já existem no Supabase/produção até uma execução autorizada de `db:push`/migration e verificação independente.

## Limitações preservadas

- Não foram adicionados helpers de banco, procedures tRPC, UI ou integração do orquestrador.
- Nenhuma avaliação foi persistida em banco real.
- Nenhuma credencial, senha, token ou dado pessoal foi incluído.
- O modo `shadow` permanece o padrão conceitual; não há bloqueio automático de tarefas.
- A validação dos limites numéricos e dos valores de decisão ainda deverá ser aplicada pelo serviço/API na etapa ARC-005; este schema registra os valores, mas não substitui a validação de domínio.

## Próxima etapa exata

### ARC-005 — API tRPC protegida

O próximo agente deve:

1. Confirmar `44659ed` no `SofiaControlPanel@origin/main` e `35f6486` no `SofiaARC-PGC@origin/main`.
2. Ler o blueprint, este checkpoint e a tarefa ARC-005.
3. Implementar apenas procedures protegidas para avaliar, consultar e listar assessments, usando o contrato ARC-PGC e as tabelas ARC-004.
4. Validar ownership/admin como nas rotas existentes, manter `shadow` como padrão e não expor metadados sensíveis.
5. Não integrar o orquestrador nem criar UI nesta etapa.
6. Publicar código/testes e checkpoint em commits separados.
7. Atualizar o quadro de tarefas e publicar OR próprio com `oracle_status: PENDING`.
