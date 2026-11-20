# Blueprint — MISSION_0028
## Restabelecimento da confiabilidade operacional e integridade do SCP

**TR:** SCP-TASK-000051 / v1 — VALIDATED
**Estado:** READY para execução, com gates internos preservados.

| Etapa | Entrega | Critério de aceite | Prioridade |
|---|---|---|---|
| WP28.1 | Revalidar baseline | Banco, GitHub, Render e logs atuais com timestamps | P0 |
| WP28.2 | Corrigir autenticação | Causa da API key comprovada; teste de atualização de créditos aprovado; segredo protegido | P0 |
| WP28.3 | Corrigir exposição MW-Ex | Modelo de acesso demonstrado; RLS/grants seguros; testes anon/auth/owner | P0 |
| WP28.4 | Conciliar MISSION_0002/0010/0026 | Matriz e correções rastreáveis | P1 |
| WP28.5 | Diagnosticar SCP-TASK-000024/000029 | Causa raiz e decisão segura de recuperação | P1 |
| WP28.6 | Revisar PRs/rollouts 0020/0023 | Diffs, CI, migrations, integração/deploy elegíveis e smoke tests | P2 |
| WP28.7 | Revisar STAGED/PAUSED | Fila priorizada, gates preservados e bloqueios explicados | P2 |
| WP28.8 | Verificação integrada/FOR | Testes, evidências, pendências e sincronização final | Final |

## Dependências
WP28.1 antecede alterações. WP28.2 e WP28.3 podem avançar em paralelo após a revalidação. WP28.4 e WP28.5 podem avançar em paralelo. WP28.6 depende de revisão de diff, CI e pré-condições de migrations. WP28.7 depende da consolidação dos estados. WP28.8 depende da conclusão ou bloqueio formal das etapas anteriores.

## Execução
O responsável autorizou execução autônoma. Despachar unidades pequenas, registrar progresso/evidências no SCP e manter espelho GitHub. Se não houver agente elegível ou o despacho falhar, registrar OR com erro observado; não declarar execução iniciada sem confirmação externa.

## Restrições
Sem movimentação financeira, alteração de ledger/saldos, exclusão de dados, exposição de segredos/dados pessoais ou bypass de aprovações humanas externas.

## Encerramento
Marcar DONE somente após testes de aceitação e FOR publicado. Em bloqueio externo, manter PROGRESS/PAUSED conforme estado real e registrar evidência.