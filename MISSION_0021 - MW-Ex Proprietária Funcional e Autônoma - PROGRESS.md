# MISSION_0021 — MW-Ex Proprietária Funcional e Autônoma

> **Projeto:** SofiaControlPanel (SCP) / MeshWave  
> **Data de criação:** 2026-11-10  
> **Orquestrador:** SofiaControlPanel (SCP)  
> **Status:** PROGRESS — tarefas 21.1–21.4 e 21.6 concluídas; tarefas 21.5 e 21.7 abertas; 21.8 STAGED
> **Blueprint:** governance/missions/0021/BLUEPRINT.md

## Objetivo

Manter e evoluir a MW-Ex, exchange proprietária da MeshWave, já operacional em modalidade interna como MVP custodial. O acesso ocorre pela interface MeshWave, para usuários autenticados elegíveis como MeshWalkers. A MW-Ex possui saldo e ledger próprios em MWN, visualmente acoplados à experiência da carteira, mas autônomos e segregados da carteira interna de UMS.

O MVP em produção oferece consulta de saldo, conversões explícitas UMS↔MWN, transferências internas entre MeshWalkers elegíveis, histórico de operações, crédito administrativo após referência de depósito e validação, e reversões por lançamentos compensatórios. Cotações externas e indicadores somente leitura, validação operacional ampliada e integrações externas permanecem em evolução ou fora do escopo atual.

## Decisões de desenho registradas

- A carteira interna não será o caminho normal para comprar UMS. UMS Genesis é uma condição histórica transitória sujeita a auditoria; após auditoria, a regra informada pelo responsável é convertê-las/reclassificá-las como UMS comuns na carteira pessoal do fundador.
- Depois dessa transição, inclusive o fundador deverá transferir UMS pelo mesmo fluxo: converter UMS em MWN na MW-Ex, transferir MWN à carteira MW-Ex do destinatário e permitir que este mantenha MWN ou converta explicitamente o valor em UMS na própria carteira interna.
- A relação de referência informada é 1 MWN = 1.000 UMS. UMS potencial exibida é uma equivalência derivada, não saldo disponível antes de uma conversão registrada.
- Cotação de mercado, preço de referência e operação executada devem ser distinguidos. Sem fonte atual e verificável, a cotação/avaliação será marcada como indisponível ou explicitamente indicativa.

## Estado inicial e relacionamento com outras missões

A MW-Ex está operacional como MVP custodial interno em `newsite/main`. Os PRs #21 e #22 integraram a implementação; o commit de produção de referência é `cf1bb8d`, e a migration `20261110140000_mwex_mvp_ledger.sql` foi executada com sucesso. O MVP disponibiliza ledger MWN separado, conversões UMS↔MWN, transferências internas entre MeshWalkers elegíveis, crédito administrativo validado e reversões compensatórias. A rota `/mw-ex` é protegida por autenticação e a elegibilidade é verificada no servidor. A tarefa 21.4 foi encerrada como `DONE (MVP custodial)` no OR-20261110-0046. A MISSION_0021 segue em PROGRESS para concluir cotação externa read-only (21.5), validação operacional ampliada (21.7) e readiness/transição Genesis (21.8).

## Próxima ação

A tarefa 21.4 foi concluída em produção como MVP custodial, conforme OR-20261110-0046. O espelho privado `meshwave65/mwex-sandbox-mirror` e a branch `feat/mwex-local-persistent-test-ledger` permanecem evidência complementar de testes reproduzíveis em ambiente isolado; não substituem nem descrevem o backend de produção. O harness local usa ledger JSON temporário, tokens sintéticos e mutex apenas no mesmo processo, portanto seus limites multiprocesso continuam válidos para aquele experimento, não para a implantação principal. Próximas frentes: concluir 21.5 (cotações externas read-only) e 21.7 (validação operacional ampliada), mantendo 21.8 STAGED até auditoria/reconciliação Genesis. Os gates da 21.2 estão em `governance/missions/0021/MWEX_FUNCTIONAL_ECONOMIC_MODEL_21_2.md`; a implantação operacional está registrada no OR-20261110-0046.

## Artefatos

- governance/missions/0021/BLUEPRINT.md
- MISSION_0021 - TASKS - PROGRESS.md
- governance/operational_reports/OR-20261110-0003.md
- governance/missions/0021/MWEX_STATE_INVENTORY_21_1.md
- governance/missions/0021/MWEX_FUNCTIONAL_ECONOMIC_MODEL_21_2.md
- governance/operational_reports/OR-20261110-0036.md
- governance/operational_reports/OR-20261110-0037.md
- governance/missions/0021/MWEX_ISOLATION_BRIDGE_CONTRACT_21_3.md
- governance/operational_reports/OR-20261110-0038.md
- governance/operational_reports/OR-20261110-0039.md
- governance/operational_reports/OR-20261110-0040.md
- governance/operational_reports/OR-20261110-0041.md
- governance/operational_reports/OR-20261110-0042.md
- governance/operational_reports/OR-20261110-0043.md
- https://github.com/meshwave65/mwex-sandbox-mirror (espelho privado da sandbox, commit `7cc013c`)
- https://github.com/meshwave65/mwex-sandbox-mirror/tree/feat/mwex-local-persistent-test-ledger (harness local, commit `849633e`)
- governance/operational_reports/OR-20261110-0044.md
- governance/operational_reports/OR-20261110-0046.md
- `SOURCE_CHECKPOINT.json` no repositório espelho (origem, versões e hashes dos artefatos)


## Missão corretiva relacionada — MISSION_0023 (2026-11-12)

A ocorrência de segregação UMS/MWN e a regra de indivisibilidade MWN foram isoladas na MISSION_0023 — Integridade Operacional e Segregação de Ativos da MW-Ex. Ela complementa esta missão, sem substituí-la nem alterar o estado das tarefas 21.5, 21.7 ou 21.8. A MISSION_0023 possui Blueprint, README, quadro, progresso e ORs próprios. A tarefa 21.7 continua PROGRESS; sua validação deverá considerar os resultados da MISSION_0023. Rollout de produção continua dependente de autorização explícita.
