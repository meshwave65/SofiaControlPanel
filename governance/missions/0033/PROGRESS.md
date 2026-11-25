# MISSION_0033 — Progresso

## 2026-11-25 — Abertura e checkpoint inicial

- Missão registrada como missão de sistema, com execução autônoma autorizada pelo operador.
- Origem confirmada: Supabase MeshWave65, projeto `ufylccbdjfzydbwhpmpp`.
- Destino confirmado: Supabase sandbox, projeto `detstgxofjnnggxluqtl`.
- Repositório canônico identificado: `meshwave65/SofiaControlPanel`.
- Inventário preliminar: 138 tabelas em 10 schemas na origem; Sandbox ainda sem tabelas de aplicação.
- Schema `sofia`: 25 tabelas, RLS habilitado em todas, 22 políticas e 12 eventos de trigger.
- Schema `public`: 30 tabelas com RLS desabilitado identificadas no levantamento de segurança; não replicar permissões sem revisão.
- Catálogo `sofia.agents` contém campos de credenciais (`manusAccount`, `manusPassword`, `manusToken`); esses valores são proibidos no Sandbox.
- Nenhuma migration aplicada. Nenhum dado operacional copiado. Nenhuma alteração realizada na origem.

## Próxima execução

Concluir WP33.1 com inventário de objetos e dependências; em seguida produzir matriz de escopo WP33.2.
