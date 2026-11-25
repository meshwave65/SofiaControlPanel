# CHECKPOINT-0001 — MISSION_0033

**Data:** 2026-11-25  
**Estado:** PROGRESS  
**Etapa:** abertura + inventário preliminar.

## Fatos confirmados
- Origem: `ufylccbdjfzydbwhpmpp` (conexão MeshWave65).
- Destino: `detstgxofjnnggxluqtl` (conexão Primary).
- Origem: 138 tabelas distribuídas em 10 schemas.
- Schema `sofia`: 25 tabelas, RLS habilitado em todas, 22 políticas e 12 eventos de trigger.
- Destino: 41 tabelas de infraestrutura/gerenciadas, sem tabelas de aplicação do SCP.
- `sofia.agents` possui campos que armazenam credenciais; nenhum valor deve ser replicado.
- Foram identificadas 30 tabelas de `public` com RLS desabilitado.

## Não realizado
- Nenhuma alteração estrutural no Sandbox.
- Nenhuma escrita na origem.
- Nenhuma cópia de dados.
- Nenhuma cópia de segredos.

## Riscos e pendências
- Classificar schemas auxiliares e tabelas de `public`.
- Mapear funções, triggers, views, índices, constraints, enums e dependências externas.
- Determinar quais políticas e grants são necessários e seguros no Sandbox.
- Avaliar separadamente Storage e schemas gerenciados.

## Próximo passo
WP33.1 — inventário detalhado de objetos e dependências.
