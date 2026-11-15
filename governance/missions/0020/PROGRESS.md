# MISSION_0020 — Progresso

**Estado:** PROGRESS  
**Última atualização:** 2026-11-15

## Situação consolidada

A missão foi reorientada para restaurar o SCP como gestor soberano das missões e interface de comando/interlocução do operador. O agente externo executa etapas temporárias; não é dono da missão nem da continuidade.

A decisão metodológica mais recente estabelece visão global e planejamento integrado, com implementação paulatina: uma etapa funcional por vez, resultado real visível, avaliação do responsável, correções pontuais e avanço sequencial. Não se deve trabalhar às cegas nem agrupar diversas etapas em um lote grande.

## Decisões persistidas

- OR-20261115-0043: reorientação do SCP, papel do Messenger, TR como Transactional Report, fronteiras de ARC/PGC, auditoria funcional e limites operacionais.
- OR-20261115-0044: operar em modo missão com decisões persistidas; visão global com implementação incremental; reduzir risco por pequenos incrementos verificáveis; continuidade independente de chat.
- OR-20261115-0045: primeiro incremento da conversa central com a SOFIA na UI TaskDetail; histórico vinculado à missão-raiz, com consulta periódica e envio pelo contrato existente.

## Estado técnico conhecido

- PR #15: https://github.com/meshwave65/SofiaControlPanel/pull/15
- Branch: `feat/sofia-cognitive-control-plane`.
- Estado da PR após CI do head `2fee6b7`: OPEN, não mergeada, `mergeable_state=dirty`; compare com main diverged, 464 commits ahead e 22 behind. Não fazer merge ou force-push antes de reconciliar conflitos. Ver OR-20261115-0049.
- Auditoria de sobreposição: único arquivo alterado nos dois lados do merge-base foi `governance/operational_reports/INDEX.csv`. A versão da branch foi atualizada para a união exata dos registros de main e branch (202 chaves compostas, sem registros conflitantes ou perdidos); main não tem linhas ausentes nessa versão. A PR ainda aparece `dirty`, portanto uma reconciliação formal do histórico continua necessária. A atualização do índice está no commit `462a7e1`.
- Roteamento de mensagens da missão-raiz para executor ativo em tarefa-filha está implementado na branch e possui workflow anterior aprovado conforme OR-0043.
- Commit `fabaff376cfbe7889752dc57ec3d7785e959d0aa` atualiza rótulos e descrição do TR na UI.
- Commit `9944dedebe02e92b267758bf13b311d3ee8baebf` adiciona a aba Messenger ao detalhe da missão. A consulta e a gravação usam sempre o ID da missão-raiz, mesmo a partir de tarefa-filha.
- CI do commit `9944dedebe02e92b267758bf13b311d3ee8baebf`: aprovado no run #43723491191 (TypeScript, testes, build e validações PostgreSQL/dispatch). Ver OR-20261115-0046. QA visual autenticado e teste real controlado do ciclo Manus ainda pendentes.
- PR #15 permanece OPEN e não mergeada. Nenhuma alteração foi publicada em produção.

## Incrementos recentes

- Messenger central: UI implementada e CI aprovado; ligação de código para retorno do executor à conversa central rastreada. Ver OR-0045 e OR-0046.
- Painel Execução e executor: UI implementada e CI aprovado; estado local e estado externo apresentados separadamente, com consulta do perfil público do agente sem credenciais. Ver OR-0047.
- Pausa e retomada Manus: mutations protegidas, confirmação por task.detail, reconciliação de estados pendentes e controles explícitos na UI. CI aprovado: 10 arquivos/77 testes, TypeScript, build e validação PostgreSQL/dispatch. Ver OR-0048.

## Próxima ação

Prosseguir a auditoria do ciclo de vida da missão com inspeção dos contratos e limites reais. Escolher uma única operação funcional para restaurar. Não simular pausa/retomada externa alterando apenas status local. QA visual e teste real controlado continuam dependentes de ambiente/autorização.

## Bloqueios e limites

- Não alterar produção, fazer merge/deploy/restart ou realizar chamadas externas/consumir créditos sem autorização específica.
- Não tocar em 20.3/Mateus.
- Não expandir AC-023 nem ARC/PGC como gates/fontes de execução.
- Testes unitários com mocks não comprovam entrega real a Manus/agente.


## Diretriz operacional vigente — OR-20261115-0050

O operador determinou implementação pela PR destinada a `main`, publicação incremental no Render Free já existente e correção baseada no comportamento real. Não exigir Browser Use, preview pago ou QA visual como pré-condição. PR #15 é a PR existente; não abrir outra. Auto-deploy permanece desligado, com publicação manual após merge.

O head `214c4d8` inclui proteção para que um eventual PR Preview não execute bootstrap/DDL no banco compartilhado. O CI do head ainda estava em execução no momento do OR; o head anterior havia passado CI. Nenhuma alteração de Render ou publicação foi feita até o registro inicial.

Atenção operacional: as migrations 0010–0013 passaram em PostgreSQL descartável, mas não há comprovação de aplicação ao banco persistente. `scripts/ensure-database.mjs` não executa essas migrations. Identificar o projeto Supabase associado ao Render antes de aplicar DDL; não escolher por inferência.

A cada etapa, persistir OR/PROGRESS/TASKS, distinguir CI de schema persistente/deploy/funcionalidade observada, não criar serviço pago, não contratar Browser Use, não tocar 20.3/Mateus e não executar chamadas externas/consumir créditos sem autorização própria.


## PR #15 integrada — publicação iniciada

PR #15 foi integrada em `main` por squash merge. Commit: `9e3f9bd3f7c09a7d2212bd7c1e30796cd020b78f`. Deploy manual do serviço Render Free iniciado com ID `dep-dbsvo1rbc2fs73cn5v1g`; estado inicial `build_in_progress`. Auto-deploy permanece desligado. O resultado do deploy e o comportamento em produção ainda não foram confirmados. Ver OR-20261115-0050.


## Estado após publicação

Deploy Render Free `dep-dbsvo1rbc2fs73cn5v1g` está `live` no merge commit `9e3f9bd3f7c09a7d2212bd7c1e30796cd020b78f`. Startup confirmou schema/colunas de execução, trigger 0003, ajuste 0008, servidor na porta 10000 e Heartbeat. URL principal: https://sofia-cp.meshwave.com.br.

Ainda não há validação visual/autenticada nem confirmação funcional do Messenger. A consulta de tabelas Supabase falhou com erro de autenticação do conector read-only (28P01); migrations 0010–0013 persistentes continuam sem confirmação. Não foi aplicada migration por essa tentativa.
