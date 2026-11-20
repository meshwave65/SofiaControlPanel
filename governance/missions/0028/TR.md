# TR v1 — Restabelecimento da confiabilidade operacional e integridade do SCP

**Missão:** MISSION_0028
**Tarefa-raiz:** SCP-TASK-000051
**Origem:** operador humano administrador #1425
**Estado:** VALIDATED — aprovação expressa em 20/11/2026
**Execução:** autorizada autonomamente, observados os limites abaixo.

## Objetivo
Recuperar confiabilidade, segurança, coerência documental e capacidade de execução do SCP. Trabalhar somente no projeto Supabase operacional identificado, schema `sofia`, repositório `meshwave65/SofiaControlPanel` e serviço Render oficial. Revalidar toda a baseline antes de agir.

## Baseline a revalidar
A auditoria de 20/11/2026 encontrou 27 registros de governança e 43 tarefas (24 DONE, 7 PROGRESS, 6 STAGED, 4 PAUSED, 2 FAIL), 43/43 tarefas com `githubSyncStatus=synced`; erros recorrentes `invalid api key` no caminho de atualização de créditos de agentes; falhas históricas de inicialização Render, apesar de deploy posterior bem-sucedido; achado anterior de RLS desabilitado/permissões amplas em `public.profiles` da MW-Ex; divergências documentais nas MISSION_0002, 0010 e 0026; SCP-TASK-000024 e 000029 em FAIL; PRs/rollouts pendentes nas MISSION_0020 e 0023; missões/tarefas STAGED/PAUSED sem elegibilidade totalmente esclarecida. Esses dados são baseline histórica, não estado garantido atual. Não inferir causas sem evidência.

## Escopo e critérios de aceite

### E1 — Autenticação do runtime (P0)
Rastrear a chamada de atualização de créditos, identificar serviço, variável e credencial rejeitada; verificar diferenças de ambiente e carregamento; corrigir somente a causa comprovada; testar os agentes/caminhos afetados. Não imprimir, registrar, commitar ou expor segredos.
**Aceite:** causa comprovada, correção testada, logs sem segredos e nenhum crédito/saldo alterado manualmente.

### E2 — Segurança e privacidade MW-Ex (P0)
Revalidar RLS, grants, policies, views, funções e caminhos de acesso de `public.profiles` e tabelas relacionadas. Determinar modelo legítimo de acesso/menor privilégio; corrigir exposição confirmada; testar anon, authenticated e proprietário; verificar isolamento de CPF/NIF e demais dados pessoais.
**Aceite:** controles aderentes ao modelo comprovado e testes positivos/negativos aprovados.
**Limite:** não apagar, exportar, divulgar ou alterar dados pessoais. Se o modelo de propriedade não puder ser provado, conter acesso inseguro e registrar bloqueio em vez de inventar regra. Alterações devem ser testadas e reversíveis quando possível.

### E3 — Conciliação documental (P1)
Reconsultar banco e documentos canônicos; comparar status, IDs, dependências, evidências, TR/Blueprint/OR/FOR e espelhos, começando por MISSION_0002, 0010 e 0026. Distinguir divergência real, documento histórico e snapshot antigo. Corrigir apenas inconsistências comprovadas, preservando proveniência e histórico.
**Aceite:** matriz de divergências, decisões rastreáveis e sincronização confirmada.

### E4 — Tarefas FAIL (P1)
Investigar SCP-TASK-000024 e 000029: logs, tentativas, agente, dependências, mensagens e artefatos. Determinar causa, impacto e recuperação segura. Reexecutar somente com idempotência comprovada; caso contrário, manter FAIL/PAUSED e registrar diagnóstico.
**Aceite:** causa/evidência para cada falha e teste ou recuperação comprovada; nenhuma repetição cega.

### E5 — PRs e rollouts (P2)
Revalidar PR #15 e #17 da MISSION_0020, PR #24 da MISSION_0023 e produção. Inspecionar diffs, CI, dependências, migrations e regressões. Integrar em fatias pequenas; publicar somente após testes, revisão do diff e confirmação do ambiente.
**Aceite:** PRs integradas ou bloqueios justificados, deploy validado quando elegível e smoke tests registrados.

### E6 — Fila STAGED/PAUSED (P2)
Revisar dependências, aprovações e elegibilidade; separar bloqueio real, espera legítima, estado desatualizado e falha de orquestração. Priorizar o que bloqueia confiabilidade/segurança/execução do SCP. Não iniciar escopos independentes apenas por constarem do inventário.
**Aceite:** fila priorizada, justificativa de bloqueios e despacho somente de trabalho elegível.

### E7 — Verificação integrada
Executar testes automatizados/funcionais; verificar runtime, autenticação, sincronização, segurança e saúde operacional; persistir ORs por etapa e FOR final; sincronizar Supabase e GitHub.
**Aceite:** checklist concluído ou cada item remanescente bloqueado com causa e próximo responsável.

## Autorização e limites
O responsável autoriza execução autônoma de diagnóstico, leitura, análise, edição de código/documentação, testes, commits/PRs e deploys necessários dentro deste escopo, desde que fundamentados, testados e reversíveis quando possível.

Não estão autorizados: movimentar fundos/tokens/créditos financeiros ou alterar saldos/ledger; transações externas, compras, contratações ou despesas; apagar dados de produção, histórico, missões, documentos ou contas; divulgar segredos, credenciais ou dados pessoais; ampliar permissões sem modelo demonstrado; alterar projetos/repositórios/ambientes não comprovadamente oficiais; reabrir missões concluídas ou modificar estados históricos sem evidência.

Gates humanos exigidos por outras missões — inclusive financeiros, segurança, publicação externa ou escopos fora deste TR — permanecem válidos. Esta autorização não os substitui.

## Método
Revalidar o estado atual; separar fatos, hipóteses, diagnóstico e decisão; não inferir arquivos/logs/policies; consultar documentação oficial e soluções existentes antes de mudanças estruturais; funcionalidade e segurança primeiro, otimização depois, beleza por último; evitar refatorações fora do escopo; manter sincronização Supabase/GitHub; vincular tarefas-filhas à raiz e herdar contexto documental.

## Resultado esperado
SCP confiável, falha de autenticação tratada com evidência, dados pessoais protegidos, estados/documentos reconciliados, tarefas FAIL diagnosticadas, rollouts tratados com segurança, fila coerente e FOR auditável.