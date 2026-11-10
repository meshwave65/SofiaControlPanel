# MISSION_0021 — MW-Ex Proprietária Funcional e Autônoma

> **Projeto:** SofiaControlPanel (SCP) / MeshWave  
> **Data de criação:** 2026-11-10  
> **Orquestrador:** SofiaControlPanel (SCP)  
> **Status:** PROGRESS — tarefa 21.1 assumida por ChatGPT  
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

A tela atual de MW-Ex em newsite é uma prévia marcada “Em breve”; contém candidatos MWN, BTC, ETH, Ibovespa, S&P 500 e IPCA, mas isso não demonstra cotação ou operação funcional. A MISSION_0018, tarefa 18.4, concluiu escopo/readiness documental; a MISSION_0021 cobre implementação funcional e validação técnica. A MISSION_0020 permanece PROGRESS; a MISSION_0021 agora está em PROGRESS para executar exclusivamente a tarefa 21.1, sem reivindicar prioridade sobre trabalho em andamento da MISSION_0020.

## Próxima ação

Tarefa 21.1 assumida em 2026-11-10 por ChatGPT. O primeiro passo é reconciliar o estado remoto e começar pelo inventário dos fluxos atuais e pela resolução dos gates de modelo de preço, liquidez, conversão e auditoria Genesis. Nenhuma operação financeira real, migração de saldo ou deploy de produção é autorizada por esta definição de missão.

## Artefatos

- governance/missions/0021/BLUEPRINT.md
- MISSION_0021 - TASKS - STAGED.md
- governance/operational_reports/OR-20261110-0003.md