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

## Auditoria de conformidade documental — OR-20261115-0052

- Inventário inicial publicado em `governance/missions/0020/RECONCILIATION_INVENTORY_2026-11-15.md`.
- Foram auditadas as missões de governança MISSION_0009–0024 e os registros operacionais SCP-TASK-000016–000026.
- O catálogo documental do Supabase contém ORIGINAL_REQUEST, TR, BLUEPRINT, OR, FOR e ACTION_PLAN; FR não consta como tipo oficial.
- A consulta read-only encontrou zero instâncias/versões documentais para as tarefas operacionais 2–26. O catálogo existe, mas os documentos não estão vinculados às tarefas.
- O backfill de TR/Blueprint/FOR deve ser retrospectivo, preservar proveniência e não alterar automaticamente status ou reexecutar missões concluídas.
- Próxima etapa: confirmar a nomenclatura “FR” e validar o piloto SCP-TASK-000017/000024. A tarefa 17 permanece PAUSED e a 24 FAIL; nenhum dispatch foi realizado.
- Nenhum status técnico, dado operacional, schema, migration ou deploy foi alterado nesta auditoria.

## Piloto de backfill — SCP-TASK-000017 — OR-20261115-0053

- Reconstruída e persistida a solicitação ORIGINAL_REQUEST (documentId=1, versionId=1, PUBLISHED) e o TR retrospectivo v0.1.0 (documentId=2, versionId=2, AWAITING_HUMAN_VALIDATION) no catálogo documental Supabase.
- TR publicado em `missions/SCP-TASK-000017-TR-v0.1.0-DRAFT.md`; espelho operacional criado em `missions/SCP-TASK-000017.md`.
- Confirmado vínculo de contexto com MISSION_0009, sem misturar os namespaces. A correção de escopo de 2026-10-28 mantém MISSION_0009 em SOFIA/SWE e MWN na MISSION_0011.
- O TR identifica a motivação original como não localizada, separa fatos de interpretação e preserva a filha 24 como FAIL sem resultado estratégico comprovado.
- O pai continua PAUSED; filhas 22/23 DONE e 24 FAIL. Nenhum status, Agent Task ID, execução Manus ou crédito foi alterado.
- Próxima etapa: revisão/correção e validação explícita do TR pelo responsável. Não criar Blueprint nem liberar dispatch antes disso.


## Incidente Messenger — 2026-11-17 — OR-20261117-0001

- **Relato do operador:** mensagem às 02:26:43 (-03:00) recebeu o fallback “A mensagem foi registrada, mas a Sofia não conseguiu processá-la agora. Verifique a configuração do serviço de IA e tente novamente.”
- **Código em `main` (`0e1989d`):** `messages.create` persiste a entrada, chama `invokeLLM` e captura várias exceções em um `catch` abrangente que persiste exatamente o fallback com `responseStatus=failed`.
- **Configuração/diagnóstico:** `server/_core/env.ts` lê `BUILT_IN_FORGE_API_KEY`; a exceção do `llm.ts` por chave vazia cita incorretamente `OPENAI_API_KEY`. A ausência da chave não foi comprovada.
- **Modelo:** `server/_core/llm.ts` fixa `gemini-2.5-flash`; não há seleção dinâmica nem fallback. A documentação oficial lista aposentadoria em 20/10/2026 para Gemini Enterprise Agent Platform, mas a ficha distingue essa plataforma da Gemini API, cujo cronograma oficial anuncia redirecionamento de chamadas desse modelo para `gemini-3.5-flash-lite` somente a partir de 01/12/2026. O endpoint do SCP é Manus Forge; nenhuma evidência pública consultada confirma que a Forge use o mesmo cronograma/alias. Detalhes e fontes em OR-20261117-0001.
- **Limite de runtime:** conector Render desabilitado; SHA implantado e logs sanitizados de 05:26–05:27 UTC não foram verificados. A aposentadoria do modelo é uma hipótese relevante, ainda não causa-raiz confirmada.
- **Teste local:** `pnpm test -- server/messages.test.ts` não iniciou porque `node_modules`/Vitest não estão instalados; nenhum pacote foi instalado.
- **Limites:** sem mudança de código, configuração, banco ou produção; sem mensagem extra, chamada LLM/Manus, deploy ou restart.
- **Próximo passo:** com acesso autorizado ao Render, verificar SHA/logs e status/resposta do provider naquele minuto; confirmar o contrato atual de aliases da Forge; então escolher correção mínima e adicionar teste de regressão, sem deploy antes de aprovação específica.


## Atualização do incidente Messenger — OR-20261117-0002

- **Causa imediata confirmada:** às 05:26:43.290 UTC o Render registrou `OPENAI_API_KEY is not configured` para task 28. O deployment `dep-dbt2s361egvs73f8tid0`, SHA `2311b7096cfc1d63252ea553a62e8ad5f3d1a2fd`, contém a leitura de `BUILT_IN_FORGE_API_KEY` e o guard que lança essa exceção quando a variável está vazia/ausente. O nome no texto da exceção está errado.
- **Conclusão:** `assertApiKey()` roda antes do `fetch`; essa mensagem não chegou à Manus Forge nem ao Gemini. A hipótese de descontinuação `gemini-2.5-flash` não causa este incidente específico, embora permaneça como assunto de migração distinto.
- **Confirmação no Supabase:** para `sofia.messages`, `taskId=28`, intervalo de 90 segundos, query limitada a 10 linhas, o registro 16 (operador) e registro 17 (assistant, filho do 16) aparecem às 05:26:43.029 e 05:26:43.314 UTC; conteúdo corresponde ao incidente. Nenhuma identidade de remetente foi consultada.
- **Estado de remediação:** não foi consultado/alterado qualquer valor secreto ou variável atual. A presença no instante do incidente está confirmada pelo guard; não se sabe se a configuração mudou depois. Cadastrar `BUILT_IN_FORGE_API_KEY` exige a credencial Forge correta e autorização explícita para alterar produção. Sem deploy, restart ou teste real nesta unidade.
- **Próximo passo:** após remediação autorizada, verificar startup/saúde e, mediante autorização específica, executar uma mensagem controlada. Corrigir em código a mensagem de erro que atualmente cita `OPENAI_API_KEY` e adicionar teste unitário separado.


## Continuidade operacional — OR-20261117-0003

- Render MCP confirmou o workspace MeshWave e o serviço `SofiaControlPanel-web` (`srv-db7qpead0e5s73erdepg`), com `autoDeploy=off` e plano Free.
- A variável `BUILT_IN_FORGE_API_KEY` aparece cadastrada no Environment do Render, mas o valor secreto não foi lido, copiado ou alterado. A credencial `OPENAI_API_KEY` do Sandbox não é tratada como substituta.
- O SCP foi aberto em modo autenticado e a lista de Missões exibiu 0 registros; nenhuma missão nova foi criada, conforme instrução do operador. A divergência entre a UI e os artefatos/histórico de task 28 permanece bloqueio de persistência pelo próprio SCP.
- **Estado:** remediação de 20.4.1 bloqueada até a credencial Forge correta estar disponível por canal seguro. Sem alteração Render, deploy, restart, chamada LLM/Manus, dispatch, mensagem controlada ou migration. Ver OR-20261117-0003.


## Correção local de diagnóstico Forge — OR-20261117-0004

- Criada a subunidade 20.4.2 antes da edição, separada da remediação operacional 20.4.1, que permanece bloqueada pela indisponibilidade segura da credencial Forge.
- Teste red-green em `server/_core/llm.test.ts`: antes da correção, esperava `BUILT_IN_FORGE_API_KEY is not configured` e reproduziu `OPENAI_API_KEY is not configured`; depois da correção verifica a mensagem certa e confirma que `fetch` não é chamado quando a chave está vazia.
- `server/_core/llm.ts` atualizado apenas na mensagem do guard; não houve alteração no endpoint, modelo, fallback ao usuário ou fluxo de produção.
- Validações locais: `pnpm test` — 11 arquivos/78 testes aprovados; `pnpm check` e `pnpm build` aprovados.
- Commit `34abb9654170970a18ac9f7b158b0def3f5da897`; branch `fix/mission-0020-forge-key-error-message`; PR #17 aberta para `main`. Os checks remotos de TypeScript/testes/build e PostgreSQL migrations/dispatch boundary concluíram SUCCESS; PR permanece OPEN e CLEAN, sem decisão de revisão ou merge. Não houve deploy.
- Nenhuma chave/segredo lido ou alterado; nenhuma chamada Forge/LLM/Manus, mensagem, dispatch, escrita DB, restart ou deploy. Próximo passo: CI/revisão da PR e, separadamente, obtenção segura da credencial Forge para retomar 20.4.1.
- OR: `OR-20261117-0004.md` (SUBMITTED; Oracle PENDING; proposal PROPOSED).
