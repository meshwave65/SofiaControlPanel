---
or_id: "OR-20261104-0002"
task_id: "MISSION_0017-17.1-referral-onboarding-reconciliation"
skill_name: "operational-task-lifecycle|supabase"
skill_version: "0.2.0-DRAFT|0.1.2"
skill_commit: "newsite/main baseline; SCP branch mission/0017-referral-onboarding-ums"
agent: "ChatGPT"
environment: "GitHub connector and Supabase read-only tools"
status: "SUBMITTED"
oracle_status: "PENDING"
proposal_status: "NONE"
created_at: "2026-11-04T22:30:00-03:00"
---

# OperationalReport — OR-20261104-0002

## Objective
Continuar 17.1 reconciliando a especificação anterior de indicação com o estado real do banco, fluxo de aquisição e segurança.

## Inputs, outputs, tools
- Inputs: newsite/main, documento docs/eventos/indicacao-e-origem-ums.md (03/11), documentação UMS, tabelas e funções Supabase.
- Outputs: checkpoint complementar da tarefa 17.1 e este OR indexado no SCP.
- Tools: GitHub read; Supabase list_projects, list_tables e execute_sql exclusivamente read-only.

## Execution summary
1. Encontrou a especificação anterior docs/eventos/indicacao-e-origem-ums.md, que já define percentual inicial de 10% configurável e os três créditos distintos.
2. Reconciliou a origem de histórico: crédito-base do indicado origin=NULL; bônus do indicado origin=ID do indicador; bônus do indicador origin=ID Genesis. O documento separa referrer_id (atribuição) de origin (origem contábil).
3. Confirmou via Supabase que mwc_meshwalker_profiles exige country_code, tax_id_type e tax_id; a aquisição tem FK para esse perfil e o RPC create_ums_acquisition recusa sem perfil fiscal. O formulário atual da carteira coleta os dados fiscais na etapa de aquisição, não no signup.
4. Confirmou que mw_account_ledger atualmente possui event_id, entry_role, user_id, wallet_address, asset, amount_delta e transaction_hash, sem coluna origin. A origem pode precisar de persistência em payload/evento ou de alteração de schema, a decidir após verificar os consumidores.
5. Consultou policies das tabelas da carteira: owner/admin scoped SELECT em ledger e carteira; public SELECT em blocos, transações e metadata; policies owner/admin em aquisições/eventos e perfil fiscal.
6. O Supabase list_tables diagnosticou 29 tabelas public com RLS desabilitado, incluindo profiles e tabelas operacionais. Não aplicou remediation; a habilitação indiscriminada sem policies pode bloquear funcionalidades.
7. A tarefa 17.1 permanece PROGRESS; não alterou código de produto, banco, policies, ledger, saldo ou blockchain.

## Problems and workarounds
- Descoberta tardia de especificação anterior: preservar o arquivo preexistente como fonte da regra e reconciliar o blueprint da missão; não duplicar como requisito novo.
- Perfil fiscal obrigatório em aquisição: planejar coleta mínima no ponto da aquisição, mantendo signup enxuto; nenhuma validação foi removida.
- Risco RLS crítico e transversal: registrar para tratamento separado e aguardar desenho/aprovação antes de qualquer alteração.

## Evidence and uncertainty
Verificado no documento anterior: 10% inicial e configurável, 3 eventos com origin distintos, somente após aquisição confirmada, prevenção de duplicidade.
Verificado no banco: tabelas/perfis fiscais e políticas consultadas; RLS-disabled diagnostic report. Não foram consultados dados pessoais de usuários.
Ainda não confirmado: mecanismo seguro de persistência de origin em cada evento, atomicidade dos três append em um único RPC, desenho exato de configuração/autoridade do percentual e comportamento do fluxo de confirmação após extensão.

## Improvement proposals
- P-004: Tratar o documento de 03/11 como requisito precedente e vinculá-lo ao blueprint MISSION_0017. Benefício: continuidade sem contradizer decisão já tomada. Risco: divergência se documento for substituído. Priority P0; compatível.
- P-005: Avaliar origin no payload blockchain versus coluna dedicada no ledger, considerando extrato e auditoria. Benefício: origem rastreável. Risco: mudanças em schema/consumidores. Priority P0; compatibilidade pendente.
- P-006: Abrir ação separada para remediação gradual do achado de 29 tabelas RLS-off, com políticas por tabela e testes; não usar ALTER indiscriminado. Benefício: reduzir exposição. Risco: interrupção de acesso caso policy incompleta. Priority P0; requires human review.

## Privacy, safety, and scope review
Somente metadados de schema/policies e definições de função foram consultados; nenhum registro pessoal, saldo, comprovante ou credencial foi lido. Nenhuma mutação executada. O risco RLS é crítico e deve ser apresentado ao responsável.

## Oracle handoff
Revisar o documento precedente e a especificação atual; confirmar modelo de origin e atomicidade; validar o plano de coleta fiscal mínima. Considerar o achado RLS como risco transversal separado e não aplicar policies sem plano aprovado.
