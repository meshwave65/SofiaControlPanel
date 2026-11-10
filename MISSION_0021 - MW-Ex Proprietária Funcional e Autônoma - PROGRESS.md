# MISSION_0021 — MW-Ex Proprietária Funcional e Autônoma

> **Projeto:** SofiaControlPanel (SCP) / MeshWave  
> **Data de criação:** 2026-11-10  
> **Orquestrador:** SofiaControlPanel (SCP)  
> **Status:** PROGRESS — tarefas 21.1–21.3 e 21.6 concluídas; tarefas 21.4, 21.5 e 21.7 abertas; 21.8 STAGED
> **Blueprint:** governance/missions/0021/BLUEPRINT.md

## Objetivo

Tornar a MW-Ex uma exchange proprietária, funcional e simples, acessível somente pela interface MeshWave a usuários autenticados elegíveis como MeshWalkers. A MW-Ex terá saldo e razão próprios em MWN, será visualmente acoplada à experiência da carteira MWN, mas permanecerá autônoma e segregada da carteira interna de UMS.

A primeira versão deve oferecer os fluxos explícitos de conversão e transferência MWN↔UMS definidos no Blueprint, saldo MWN, equivalência potencial em UMS, valor de mercado com fonte verificável e indicadores/cotações externas selecionados. Não inclui acesso público, exchange externa, depósitos/saques fiduciários nem uma plataforma ampla de trading.

## Decisões de desenho registradas

- A carteira interna não será o caminho normal para comprar UMS. UMS Genesis é uma condição histórica transitória sujeita a auditoria; após auditoria, a regra informada pelo responsável é convertê-las/reclassificá-las como UMS comuns na carteira pessoal do fundador.
- Depois dessa transição, inclusive o fundador deverá transferir UMS pelo mesmo fluxo: converter UMS em MWN na MW-Ex, transferir MWN à carteira MW-Ex do destinatário e permitir que este mantenha MWN ou converta explicitamente o valor em UMS na própria carteira interna.
- A relação de referência informada é 1 MWN = 1.000 UMS. UMS potencial exibida é uma equivalência derivada, não saldo disponível antes de uma conversão registrada.
- Cotação de mercado, preço de referência e operação executada devem ser distinguidos. Sem fonte atual e verificável, a cotação/avaliação será marcada como indisponível ou explicitamente indicativa.

## Estado inicial e relacionamento com outras missões

A tela atual de MW-Ex em newsite é uma prévia marcada “Em breve”; contém candidatos MWN, BTC, ETH, Ibovespa, S&P 500 e IPCA, mas isso não demonstra cotação ou operação funcional. A MISSION_0018, tarefa 18.4, concluiu escopo/readiness documental; a MISSION_0021 cobre implementação funcional e validação técnica. A MISSION_0020 permanece PROGRESS; a MISSION_0021 está em PROGRESS para executar as tarefas documentais e técnicas desta missão, sem reivindicar prioridade sobre trabalho em andamento da MISSION_0020.

## Próxima ação

As tarefas 21.1–21.3 foram concluídas documentalmente e a 21.6 concluiu a interface sandbox. O checkpoint remoto mais recente é a validação sandbox 21.7 (OR-20261110-0042); seu handoff identifica persistência server-side de teste como próximo pré-requisito, correspondente à tarefa 21.4 ainda aberta. Por instrução explícita do responsável, 21.4 foi reassumida por Manus (sandbox); 21.5 e 21.7 permanecem atribuídas e inalteradas. Para continuidade entre instâncias, foi criado o espelho privado `https://github.com/meshwave65/mwex-sandbox-mirror` no commit `7cc013c`; os passos reproduzíveis estão no README e `SOURCE_CHECKPOINT.json`. Próximo passo: desenvolver a persistência/testes isolados nesse espelho. Nenhum Supabase ou ambiente de produção foi acessado. Os gates da 21.2 estão em `governance/missions/0021/MWEX_FUNCTIONAL_ECONOMIC_MODEL_21_2.md`.

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
- `SOURCE_CHECKPOINT.json` no repositório espelho (origem, versões e hashes dos artefatos)
