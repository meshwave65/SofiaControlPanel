# Blueprint — MISSION_0033

**Versão:** 1.0.0  
**Estado:** READY  
**Derivado de:** TR-v1.0.0-VALIDATED.md  
**Modo:** execução autônoma de missão de sistema.

## Princípios de implementação

- Inventariar antes de alterar.
- Pesquisar documentação oficial, padrões e soluções existentes antes de desenvolver mecanismos próprios.
- Preservar o banco de origem; executar alterações somente no Sandbox.
- Não fazer dump/restore indiscriminado.
- Não usar dados reais para validar funcionalidades que podem ser testadas com fixtures sintéticas.
- Versionar migrations e validar cada etapa.
- Separar estrutura, dados de catálogo autorizados e dados operacionais proibidos.
- Priorizar funcionamento e segurança; otimização e apresentação ficam depois.
- Se a automação falhar, executar manualmente a etapa equivalente, documentando comandos, evidências e resultado.

## Work packages

### WP33.1 — Inventário estrutural completo
- Mapear schemas, tabelas, colunas, tipos, enums, defaults, constraints, índices, sequences, views, funções, triggers, policies, grants e extensões.
- Mapear dependências entre objetos e extensões.
- Registrar estimativas de linhas sem extrair conteúdo operacional.
**Saída:** INVENTORY.md + matriz de objetos.

### WP33.2 — Classificação de escopo
- Classificar cada schema/tabela: INCLUIR, ADAPTAR, EXCLUIR ou INVESTIGAR.
- Identificar núcleo SCP, dependências de aplicação e componentes não relacionados.
- Tratar separadamente schemas gerenciados pelo Supabase e Storage.
**Saída:** SCOPE-MATRIX.md.

### WP33.3 — Pesquisa técnica e estratégia de migração
- Consultar documentação oficial atual do Supabase sobre CLI, migrations, db diff/pull, declarative schemas, RLS e extensões.
- Avaliar limitações e estratégia segura de bootstrap do Sandbox.
- Definir migrações incrementais, idempotência, validação e rollback.
**Saída:** MIGRATION-STRATEGY.md com fontes e decisão.

### WP33.4 — Blueprint detalhado e pacote de migrations
- Produzir migrations revisáveis para o escopo aprovado pela classificação interna.
- Separar tipos/roles, schema, funções, triggers, RLS e grants na ordem de dependência.
- Não transportar dados operacionais.
**Saída:** pacote versionado de migrations e plano de rollback.

### WP33.5 — Aplicação estrutural no Sandbox
- Aplicar migrations em etapas.
- Validar objetos após cada etapa.
- Registrar hash, resultado e divergências.
**Saída:** estrutura Sandbox implantada e relatório de execução.

### WP33.6 — Catálogo de agentes seguro
- Definir contrato mínimo de sincronização do catálogo.
- Expor somente metadados autorizados e schema dos campos de configuração.
- Nunca transportar valores secretos.
- Bloquear edição de agentes de origem.
- Permitir criação experimental local com valores vazios e descarte de sessão.
**Saída:** contrato e teste de sincronização.

### WP33.7 — RLS, ownership e privacidade
- Definir RLS/grants para isolamento por usuário.
- Separar metadados operacionais de conteúdo privado.
- Testar acessos permitidos e negados com identidades sintéticas.
**Saída:** matriz de políticas e evidências de testes.

### WP33.8 — Validação de compatibilidade
- Comparar schema esperado e schema real.
- Testar constraints, funções, triggers e fluxos mínimos.
- Testar ausência de dados operacionais e segredos.
- Verificar que a origem permaneceu inalterada.
**Saída:** relatório de conformidade e divergências.

### WP33.9 — Fechamento
- Consolidar ORs e checkpoint.
- Atualizar README, TASKS, PROGRESS e índice de missões.
- Produzir FOR com resultado, limitações e próximos passos.
**Saída:** FOR e pacote final de evidências.

## Dependências e gates

| Ordem | WP | Dependência | Gate |
|---|---|---|---|
| 1 | 33.1 | TR + Blueprint | inventário verificável |
| 2 | 33.2 | 33.1 | matriz de escopo |
| 3 | 33.3 | 33.1–33.2 | estratégia documentada |
| 4 | 33.4 | 33.3 | migrations revisadas |
| 5 | 33.5 | 33.4 | aplicação validada no Sandbox |
| 6 | 33.6 | 33.1–33.5 | catálogo sem segredos |
| 7 | 33.7 | 33.1–33.6 | isolamento comprovado |
| 8 | 33.8 | 33.5–33.7 | conformidade demonstrada |
| 9 | 33.9 | 33.8 | fechamento documental |

Os gates são critérios técnicos de qualidade e segurança, não solicitações de aprovação humana.

## Rollback

Cada migration deve ser pequena, rastreável e acompanhada de estratégia de reversão. Se uma etapa falhar, interromper apenas a unidade afetada, preservar logs e estado anterior e corrigir antes de prosseguir. Não apagar ou reconstruir o projeto Sandbox inteiro como atalho.
