# MISSION_0021 — MW-Ex Proprietária Funcional e Autônoma

> **Projeto:** SofiaControlPanel (SCP) / MeshWave  
> **Data de criação:** 2026-11-10  
> **Orquestrador:** SofiaControlPanel (SCP)  
> **Status:** PROGRESS — tarefas 21.1 e 21.2 concluídas; próxima 21.3
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

As tarefas 21.1 e 21.2 foram concluídas documentalmente por ChatGPT. A próxima etapa autônoma é a tarefa 21.3: especificar isolamento MeshWalker-only, carteiras/ledgers segregados e contrato da ponte UMS↔MWN em modo de especificação, sem operação financeira real, migração de saldo ou deploy de produção. Os gates e decisões pendentes da 21.2 estão em `governance/missions/0021/MWEX_FUNCTIONAL_ECONOMIC_MODEL_21_2.md`.

## Artefatos

- governance/missions/0021/BLUEPRINT.md
- MISSION_0021 - TASKS - PROGRESS.md
- governance/operational_reports/OR-20261110-0003.md
- governance/missions/0021/MWEX_STATE_INVENTORY_21_1.md
- governance/missions/0021/MWEX_FUNCTIONAL_ECONOMIC_MODEL_21_2.md
- governance/operational_reports/OR-20261110-0036.md
- governance/operational_reports/OR-20261110-0037.md
