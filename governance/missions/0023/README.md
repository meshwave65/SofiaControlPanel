# MISSION_0023 — Integridade Operacional e Segregação de Ativos da MW-Ex

Leia este README e o BLUEPRINT.md antes de retomar a missão em outro chat, agente ou sessão.

## Origem

Esta missão complementa a MISSION_0021, que criou a MW-Ex custodial. Durante o uso real, foi identificada uma falha de interface e de enforcement: conversões e transferências compartilhavam controles de quantidade, e o backend ainda aceitava frações de MWN em determinados caminhos.

A MISSION_0021 permanece PROGRESS. A MISSION_0023 não a substitui, não reabre seu escopo geral e não altera o estado das tarefas 21.5, 21.7 ou 21.8. Ela isola a frente corretiva com critérios de aceite e OR próprios.

## Regra central

- UMS é saldo da carteira interna.
- MWN é saldo da carteira MW-Ex.
- Conversão/reconversão é um bloco próprio e explícito, com campos independentes e ambos os saldos atuais visíveis.
- Transferência entre usuários é outro bloco, exclusivamente MWN, exibindo apenas saldo MWN e aceitando inteiros positivos até esse saldo.
- Não existe transferência UMS entre usuários, conversão implícita no bloco de transferência ou fração de MWN.

## Estado persistente em 2026-11-12

- A transferência auditada de 462 MWN foi concluída com débito de 462 e crédito de 462. Não houve crédito de 4,62.
- O código corretivo está sendo preparado na PR #24 de meshwave65/newsite, branch fix/mwex-auditable-statements.
- A PR #24 depende da PR #23 e deve seguir a ordem de rollout descrita no Blueprint.
- A UI já foi separada em campos independentes; o RPC mwex_get_wallet retorna balance_ums e balance_mwn no contrato da migration preparada.
- A migration foi reforçada para validar transferência, reconversão e crédito administrativo como inteiros e adicionar restrições de armazenamento sobre ledger e transações.
- A migration não foi aplicada ao Supabase de produção. Nenhuma transferência, saldo, dado financeiro ou deployment de produção foi alterado nesta missão.
- O deployment Vercel do commit mais recente d8be351e0967781358bbbad42e51e6e6f497bf87 está READY (preview: https://newsite-oxg7s4yy5-meshwaves-projects.vercel.app/). Isso confirma build do projeto frontend, não valida sintaxe/aplicação da migration SQL nem operação end-to-end. A validação visual continua pendente porque o preview exige autenticação SSO.
- A PR #24 permanece aberta; nenhum merge foi executado.

## Como retomar

1. Ler o BLUEPRINT.md e TASKS.md.
2. Conferir o progresso em PROGRESS.md e os ORs desta missão.
3. Reconciliar PR #23 e PR #24 no GitHub; não presumir que estados anteriores permanecem atuais.
4. Conferir o estado de build/deploy do commit mais recente.
5. Validar a migration por inspeção e testes seguros; não aplicá-la em produção sem autorização explícita.
6. Concluir tarefas 23.2–23.5 e produzir OR próprio para cada unidade.
7. O rollout 23.6 permanece bloqueado até autorização explícita do responsável.

## Limites

Não realizar transações reais para testar. Não ajustar saldos nem reescrever históricos. Não aplicar migration, mergear PRs ou publicar em produção sem autorização. Não ampliar o escopo para tokenomics, preço ou arquitetura não relacionados à integridade da MW-Ex.
