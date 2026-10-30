# Checkpoint MISSION_0013 — 13.1 e 13.2 — 2026-10-29

## Decisão de escopo

O responsável esclareceu que a missão deve contactar investidores em troca de equity ou do ativo real de criptomoeda MWN. A captação orgânica já implementada é independente. O kit de apoiadores voluntários não é base desta missão.

## Execução

1. Lidos AGENTS.md e GOVERNANCE.md do SCP, blueprint MISSION_0011, registro/queue MISSION_0012, registry de skills e template oficial de OR.
2. Lidos os registros canônicos de identidade MWN, crosswalk MWC/MWN e blueprint normativo no repositório network.
3. Lidos README, documentação, código de simulação, persistência, painel MWBlockchain e migrações do repositório mwc-ums-sim.
4. Consultado em modo somente leitura o projeto Supabase `mwn`; listadas tabelas/migrações e executadas consultas agregadas, sem leitura de dados pessoais ou alteração de schema/dados.
5. Publicados dossiê factual e matriz de lacunas equity/MWN.

## Evidência de aquisição e ledger

- Chain id `meshwave-genesis-v1`, network `pilot`, latest block 9, 10 blocos, 10 transações, 19 entradas de ledger e 8 carteiras.
- 8 transações `MWC_ACQUISITION_TRANSFER`, 1 `GENESIS_UMS_ALLOCATION`, 1 `UMS_MWC_CONVERSION`; todas `confirmed`.
- 9 solicitações de aquisição: 8 validadas, 1 rejeitada, nenhuma pendente; 8 validadas com hash de transação.
- Soma agregada das aquisições validadas: R$ 13,02 e 602,63827817 unidades MWC.
- Preços internos habilitados: R$ 0,021605 e EUR 0,00382918 por unidade MWC; não são cotação de mercado.
- Atividade observada até 2026-10-26. Consulta executada em 2026-10-29.

## Limites e gaps

- O banco e parte do código continuam usando MWC, apesar da instrução de nomenclatura MWN.
- O ledger observado é rotulado `pilot`; não foi demonstrado consenso descentralizado, rede pública, exchange ou liquidez externa.
- O README do simulador declara que a simulação econômica não representa operação financeira real; seu blockchain visual é derivado do estado da simulação. Não confundir esse módulo com o ledger piloto `meshwave-genesis-v1`.
- O diretório `projects/mwn` permanece `BLUEPRINT_PENDING`.
- Não foram localizados entidade jurídica, cap table, percentual de equity, valuation, instrumento ou direitos oferecidos.
- Nenhum pagamento foi testado e nenhuma transação foi criada nesta execução.
- Não houve contato externo.

## Estado

13.1 DONE; 13.2 DONE. Próxima unidade elegível: 13.3 — segmentação e pesquisa pública de investidores. 13.4/13.5 seguem dependentes de tese e materiais aprováveis. 13.6 permanece bloqueada até autorização humana específica para abordagem.

## Commits dos artefatos

- Blueprint ajustado: `0f40fb1c45f0a2cc3b4500deeaf12ce500fa5e94`
- Dossiê factual: `ab13382e84cfd441343a356d421e2cd21a733a89`
- Matriz de lacunas: `7db6aadcc1549f31f74c9684671d357997056b3f`
