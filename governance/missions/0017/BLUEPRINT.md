# Blueprint — MISSION_0017: Indicação, Onboarding Simplificado e Bonificação UMS

Estado: PROGRESS — versão inicial, baseada na instrução do responsável e no baseline técnico lido em 2026-11-04.
Coordenação: meshwave65/SofiaControlPanel
Produto: meshwave65/newsite; main é baseline, alterações em branch dedicada.

## 1. Objetivo
Cada MeshWalker gera seu link de indicação. O link abre onboarding simples, que exibe indicador e bônus percentual. Após cadastro e autenticação, a pessoa é encaminhada diretamente à aquisição, informa valor/moeda e continua no fluxo de pagamento existente.

## 2. Experiência
Onboarding: “Este link foi indicado por: {nome completo}”; “Com este link, sua primeira aquisição terá uma bonificação de {X}%”. Campos: nome, email, senha, repetir senha, botão cadastrar. Sem username, telefone, CPF/NIF ou campos extras, salvo requisito de negócio/fiscal comprovado. Se aquisição exigir perfil fiscal, descobrir o mínimo necessário e coletar no ponto correto; não relaxar guardrails.
Após signup/login, direcionar ao fluxo de aquisição e mostrar quantidade base e bônus estimado.

## 3. Atribuição e elegibilidade
- Link pessoal único por MeshWalker e referral persistido server-authoritatively.
- Uma conta indicada pode ter somente um indicador; atribuição imutável após criação.
- Bloquear autoindicação e vinculação de contas existentes como novos indicados.
- Percentual configurável; onboarding exibe a regra vigente. Snapshot percentual/regra no pedido elegível impede retroatividade.
- Elegibilidade é a primeira aquisição cujo depósito seja validado. Pedido pendente/rejeitado não bonifica; primeiro depósito validado consome elegibilidade.
- Base: quantidade efetiva UMS da aquisição confirmada. Bônus de cada lado = base × percentual, arredondado segundo regra UMS de até 6 casas decimais.

## 4. Blockchain e ledger
Somente após validação por agente autorizado, operação atômica registra três eventos/transações UMS:
1. Genesis debita a aquisição-base; carteira do indicado recebe.
2. Genesis debita bônus; carteira do indicado recebe.
3. Genesis debita o mesmo bônus; carteira do indicador recebe.
Total de saída Genesis = base + dois bônus. Eventos, ledger debit/credit, transação, referral e aquisição devem ser reconciliáveis. IDs determinísticos/constraints, locking e idempotência impedem duplicidade. Nenhum lançamento antes de validar depósito. Preservar proibição de transferências peer-to-peer e append-only chain.

## 5. Supabase e segurança
Inspecionar o schema vigente antes de escolher tabelas/campos/migrations/RPCs. Cobrir referral/code, configuração percentual e auditoria, snapshot da regra, elegibilidade e ligação dos eventos. RLS/grants mínimos; revisar funções SECURITY DEFINER, search_path, auth.uid(), autorização admin e EXECUTE. Não aplicar migrations no banco de produção sem autorização e validação.

## 6. Escopo/UX
Mobile-first e UI financeira enxuta. Reutilizar Auth e aquisição atuais quando corretos. Não refatorar fora do pedido nem remover a rota /simple sem avaliação de compatibilidade. Não representar cadeia single-operator como descentralizada.

## 7. Aceite
Link próprio e onboarding com indicador/percentual; atribuição persistida; pós-login para aquisição; percentual configurável aplicado somente na primeira aquisição validada; três créditos e três débitos Genesis em eventos distintos; nenhuma entrada em pendente/rejeitado; retries/concor­rência sem duplicar; validação de ledger/chain; revisão de RLS/grants; testes/build e docs; OR por etapa.

## 8. Gates identificados
O RPC create_ums_acquisition verificado no baseline exige mwc_meshwalker_profiles, em tensão com cadastro de 4 campos. Determinar necessidade e coleta mínima. Confirmar se configuração percentual será global administrável (hipótese inicial) ou individual/campanha. Confirmar UX de moeda/limites e atomicidade de três eventos. Nenhum lançamento real ou deploy sem aprovação.
