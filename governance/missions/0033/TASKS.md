# MISSION_0033 — Quadro de trabalho

**Estado geral:** PROGRESS  
**Prioridade:** ALTA  
**Modo:** missão de sistema, execução autônoma.

| WP | Tarefa | Estado | Saída |
|---|---|---|---|
| 33.1 | Inventário estrutural completo | PROGRESS | INVENTORY.md + DDL/dependências |
| 33.2 | Classificação de schemas e tabelas | PROGRESS | SCOPE-MATRIX.md (primeira versão publicada) |
| 33.3 | Pesquisa técnica e estratégia de migração | PROGRESS | MIGRATION-STRATEGY.md |
| 33.4 | Pacote de migrations e rollback | STAGED | migrations versionadas |
| 33.5 | Aplicação estrutural no Sandbox correto | STAGED | projeto detstgxofjnnggxluqtl |
| 33.6 | Catálogo de agentes sem segredos | STAGED | catálogo vs. instância efêmera |
| 33.7 | Identidade, sessões, RLS e expurgo | PROGRESS | SANDBOX-SESSION-LIFECYCLE.md |
| 33.8 | Validação de compatibilidade e isolamento | STAGED | testes positivos/negativos |
| 33.9 | Fechamento e FOR | STAGED | FOR e checkpoint final |

## Despacho operacional do SCP

| Tarefa | Agente | Estado | Papel |
|---|---|---|---|
| [SCP-TASK-000059](../../missions/SCP-TASK-000059.md) | DINELSON | PROGRESS | Coordenação/inventário |
| [SCP-TASK-000060](../../missions/SCP-TASK-000060.md) | FILIPE | PROGRESS | Análise estrutural |
| [SCP-TASK-000061](../../missions/SCP-TASK-000061.md) | MATEUS | PROGRESS | Análise operacional |
| [SCP-TASK-000062](../../missions/SCP-TASK-000062.md) | DINECY | PROGRESS | Análise estratégica |

As tarefas filhas já existem e não devem ser duplicadas. Consolidar suas entregas na missão pai.

## Regras de execução

- Origem ufylccbdjfzydbwhpmpp somente leitura.
- Destino correto: projeto Supabase `sandbox`, ref detstgxofjnnggxluqtl, conexão Primary.
- rqvjsjfypuojuaetxkig é outro projeto e está fora do escopo.
- Não copiar registros operacionais, usuários ou credenciais.
- Agentes instanciados e todos os recursos experimentais devem pertencer a uma sessão com TTL e expurgo.
- Não remover FKs para contornar diferenças de identidade.
- RLS deny-by-default até autenticação central e autorização estarem demonstradas.
- Toda unidade concluída exige OR persistido no Supabase e GitHub.
- Prosseguir autonomamente após concluir, pausar ou bloquear uma unidade; continuar com tarefas independentes seguras.
