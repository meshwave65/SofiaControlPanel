# Termo de Referência — MISSION_0033

**Versão:** 1.0.0  
**Estado:** VALIDATED — validação/autorização sistêmica  
**Origem:** solicitação humana convertida explicitamente em missão de sistema em 2026-11-25.  
**Missão:** MISSION_0033 — Espelhamento estrutural seguro do SCP no Sandbox.

## 1. Objetivo

Inventariar, classificar, preparar, implementar e validar um espelhamento estrutural controlado do banco SCP no projeto Sandbox independente, garantindo compatibilidade estrutural sem replicar dados operacionais ou privados.

## 2. Identificação dos ambientes

| Papel | Projeto | Ref | Conexão |
|---|---|---|---|
| Origem SCP | MeshWave65 | `ufylccbdjfzydbwhpmpp` | MeshWave65 |
| Destino Sandbox | sandbox | `detstgxofjnnggxluqtl` | Primary |

Repositório canônico: `meshwave65/SofiaControlPanel`.

## 3. Requisitos obrigatórios

1. Espelhar, de forma versionada e reproduzível, tabelas, colunas, tipos, defaults, constraints, chaves primárias/estrangeiras, índices, enums, funções, triggers, views e políticas necessárias ao funcionamento do escopo SCP aprovado pela própria missão.
2. Não copiar registros operacionais de usuários, tarefas/missões, mensagens, documentos, checkpoints, handoffs, artefatos ou dados de negócio da origem.
3. Não copiar credenciais, API keys, tokens, senhas, endpoints privados ou valores secretos de configurações de agentes.
4. Disponibilizar no Sandbox o catálogo de agentes originários do SCP por sincronização dinâmica de metadados autorizados. Agentes de origem são somente leitura no Sandbox.
5. Reproduzir o esquema visual/lógico dos campos de configuração dos agentes, mas fornecer apenas metadados de esquema; valores secretos não podem chegar ao cliente nem ao backend Sandbox.
6. Permitir agentes experimentais criados no Sandbox, com configuração editável e vazia inicialmente; seus registros e operações devem ser descartáveis ao encerrar a sessão.
7. Preservar isolamento entre usuários no Sandbox por RLS e ownership. Acesso administrativo operacional não equivale a acesso irrestrito a conteúdo privado.
8. Separar metadados operacionais de administração de conteúdo privado de missões e documentos.
9. Manter a origem SCP intacta. Alterações de implementação devem ocorrer no Sandbox, salvo leituras necessárias à auditoria.
10. Registrar cada etapa, evidência, decisão técnica, impedimento e teste em artefatos persistentes no Supabase e no GitHub.

## 4. Escopo de classificação

- **Núcleo SCP:** schema `sofia`, a ser mapeado integralmente e reproduzido estruturalmente com revisão de dependências.
- **Schemas auxiliares e `public`:** classificar tabela a tabela. Incluir somente estruturas comprovadamente necessárias ao SCP/Sandbox. Excluir módulos financeiros, legados, placeholders e aplicações alheias.
- **Schemas gerenciados:** `auth`, `storage`, `realtime`, `vault`, `extensions`, `supabase_functions`, `drizzle` e equivalentes não devem ser copiados indiscriminadamente. Avaliar apenas componentes necessários e suportados.
- **Storage:** buckets e objetos não são presumidos como parte do diff de schema; avaliar políticas/configuração separadamente, sem copiar objetos da origem.

## 5. Segurança e privacidade

- Nunca enviar segredos ao navegador para mascaramento posterior.
- Não clonar valores de configuração de agentes, mesmo que mascarados na interface.
- Não copiar dados de usuários ou conteúdo de missões reais.
- Não replicar políticas RLS permissivas ou ausentes sem revisão. O inventário inicial identificou 30 tabelas de `public` com RLS desabilitado; isso é um achado de auditoria, não uma configuração a reproduzir.
- Aplicar least privilege, grants mínimos e testes positivos/negativos de isolamento.
- Não executar comandos destrutivos, truncar tabelas ou sobrescrever objetos existentes no Sandbox sem validação de impacto e backup/rollback.
- Nenhuma operação de escrita na origem.

## 6. Plano de trabalho

1. Consolidar inventário detalhado de schemas, objetos e dependências.
2. Definir matriz INCLUIR / ADAPTAR / EXCLUIR / REQUER INVESTIGAÇÃO.
3. Auditar documentação oficial Supabase e limitações de migrations/diffs.
4. Preparar migrations versionadas, revisáveis e reproduzíveis.
5. Implementar a estrutura no Sandbox em etapas pequenas.
6. Implementar catálogo de agentes sem segredos e isolamento de configurações.
7. Validar schema, RLS, grants, triggers, funções e fluxos.
8. Executar testes de não-vazamento e não-cópia de dados.
9. Registrar ORs, checkpoint final e FOR com limitações e recomendações.

## 7. Critérios de aceite

- Schema Sandbox compatível com o escopo SCP classificado e documentado.
- Nenhum dado operacional ou segredo da origem copiado.
- Catálogo de agentes atualizado por mecanismo dinâmico ou procedimento manual documentado, sem segredos.
- Agentes locais Sandbox isolados e descartáveis.
- Testes RLS comprovam isolamento entre usuários.
- Migrations reproduzíveis, ordenadas e com rollback documentado.
- Origem sem alterações.
- Artefatos e evidências persistidos em Supabase e GitHub.

## 8. Limites de autorização

A autorização sistêmica dispensa aprovação humana para as atividades previstas neste TR. Ela não permite ampliar escopo silenciosamente, acessar dados privados sem necessidade, revelar segredos, efetuar alterações na origem ou realizar ações destrutivas sem proteção técnica. Dúvidas de classificação devem ser resolvidas por evidência, documentação e testes; quando não houver base suficiente, registrar como pendência e não inventar uma decisão.
