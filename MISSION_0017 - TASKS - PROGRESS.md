# MISSION_0017 — TASKS — PROGRESS
Missão: Indicação, Onboarding Simplificado e Bonificação UMS
Blueprint: governance/missions/0017/BLUEPRINT.md
Produto: meshwave65/newsite
Atualizado: 2026-11-04

| ID | Tarefa | Status | Instância | Artefato | Próxima ação |
|---|---|---|---|---|---|
| 17.1 | Reconciliar arquitetura, Auth, schema/RPCs, aquisição, referral e regra contábil; consolidar especificação técnica | PROGRESS | ChatGPT executor | SCP MISSION_0017; newsite baseline | Inspecionar componentes, migrations, funções, RLS/grants e requisito fiscal; checkpoint/OR |
| 17.2 | Implementar persistência de referral, link pessoal e configuração de percentual por indicador em página própria da Administração | STAGED | — | newsite + Supabase | Preferir tabela segregada; autorização admin, trilha e snapshot; decisão sobre vigência temporal permanece aberta |
| 17.3 | Implementar onboarding minimalista, exibir indicador e persistir atribuição | STAGED | — | newsite Auth/profile | Imutabilidade, bloquear autoindicação e contas já existentes |
| 17.4 | Integrar pós-cadastro/login à aquisição e mostrar base e bônus elegível | STAGED | — | newsite UI | Preservar requisitos de aquisição |
| 17.5 | Implementar os três eventos/transações UMS após validação, com débitos Genesis e ledger | STAGED | — | Supabase RPC/schema | Atomicidade, idempotência e integridade chain/ledger |
| 17.6 | Testar segurança, RLS/grants, estados pendente/rejeitado/validado, reconciliação, documentação e handoff | STAGED | — | newsite + SCP | Não usar créditos reais em produção para testes |

## Critérios transversais
- Cada usuário pode gerar/copiar seu link; o onboarding indica o nome do indicador e percentual vigente.
- Campos básicos: nome, email, senha, repetir senha. Outros campos somente se uma exigência real do fluxo for demonstrada.
- Uma atribuição por conta, imutável; sem autoindicação ou atribuição a contas existentes.
- Percentual é definido individualmente por indicador em página da Administração; persistência preferencial em tabela separada do perfil, com trilha/auditoria e acesso restrito. Temporalidade (temporária ou contínua) ainda será decidida; não assumir uma duração fixa. Percentual/regra aplicado fica em snapshot na aquisição.
- Elegibilidade: primeira aquisição cujo depósito é validado; pedido pendente/rejeitado não gera crédito.
- Após validação: aquisição-base para indicado, bônus ao indicado e bônus igual ao indicador. Cada crédito possui débito correspondente Genesis.
- Eventos e lançamentos são idempotentes e reconciliáveis; não duplicar em retry/concor­rência.
- Manter 1 MWN = 1.000 UMS, precisão até 6 casas e UX mobile-first limpa.

| 17.7 | Aplicar UI moderna consistente com a carteira MeshWave aos formulários de referral/onboarding/aquisição (mobile-first, validação e estados claros) | STAGED | — | newsite UI | Identificar componentes/tokens atuais; sem redesign fora do escopo |
| 17.8 | Criar material de divulgação imprimível com QR de indicação e QR educativo secundário sobre UMS/MWN | STAGED | — | newsite + conteúdo público | Confirmar página educativa/destino oficial; QR verificável; uso em locais somente com autorização |

| 17.9 | Implementar configuração administrativa individual do percentual de indicação, com persistência segregada do perfil e trilha de alterações | STAGED | — | Admin UI + Supabase | Estudar esquema e permissões; temporalidade será definida posteriormente |
