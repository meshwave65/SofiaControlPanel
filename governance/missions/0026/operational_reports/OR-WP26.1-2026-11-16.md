# OR — WP26.1 — Baseline e inventário MeshWave

**Data da revisão:** 2026-11-16  
**Executor:** análise manual assistida por ChatGPT, ferramentas gratuitas  
**Estado:** PARTIAL — baseline operacional e reconciliações principais confirmados; inventário completo do ecossistema ainda em fechamento  
**Missão:** MISSION_0026  
**Projeto Supabase de referência:** MeshWave65 — ufylccbdjfzydbwhpmpp

## 1. Escopo e método

Esta revisão substitui os números anteriores (77 blocos/77 transações), que eram corretos para uma consulta anterior, mas já não representam o estado live mais recente. O estado foi novamente consultado diretamente no projeto Supabase MeshWave65, em modo read-only.

Foram consultadas as tabelas mw_chain_metadata, mw_blocks, mw_transactions, mw_account_ledger, mwex_transactions, mwex_ledger_entries, mwex_assets, mwex_orders, mwex_order_fills, mwex_business_configs e mwex_fiat_acquisitions, além das definições de funções RPC relevantes.

Nenhum dado, schema, policy, grant, código, contrato, carteira, chave, saldo, ordem ou configuração foi alterado. Nenhuma transação, migração, POC executável ou deploy foi realizado.

## 2. Evidência operacional — cadeia MeshWave

Consulta live de mw_chain_metadata:

- chain_id: meshwave-genesis-v1
- chain_name: MeshWave Genesis Ledger
- network: pilot
- schema_version: 1
- latest_block_number: 79
- latest_block_hash: d6124531cf2316c3a23229e51d1950af571da1175ba3faa803d7c62088c1307b
- Metadata: canonical=false, consensus=single-operator

Consulta live das tabelas:

- 80 blocos, numerados de 0 a 79.
- 80 transações, todas confirmed, com hash distinto e bloco associado.
- Sequência 0–79 sem lacunas ou desvios.
- Nenhuma divergência entre previous_hash e o hash do bloco anterior.
- O bloco gênese usa o hash zero como referência anterior.
- Nenhuma transação sem bloco ou apontando para bloco inexistente.

Esses dados demonstram consistência estrutural básica das referências armazenadas. **Não equivalem a auditoria criptográfica independente**: não foram recalculados externamente todos os hashes a partir dos payloads, nem auditadas independentemente a raiz de Merkle, assinaturas, autorização do produtor ou resistência a adulteração.

A classificação sustentada continua sendo: **ledger/cadeia operacional em piloto, com produção de blocos de operador único**. Não há evidência de consenso distribuído, rede P2P de validadores ou blockchain descentralizada.

## 3. Reconciliação da cadeia com o ledger de contas

Estado live:

| Estrutura | Registros |
|---|---:|
| mw_transactions | 80 |
| mw_account_ledger | 135 |
| Hashes distintos em mw_transactions | 80 |
| Hashes distintos em mw_account_ledger | 80 |
| IDs de evento distintos no ledger de contas | 80 |

A verificação por hash confirmou que **as 80 transações da cadeia encontram correspondência no ledger de contas**. Os 135 lançamentos representam múltiplas pernas/lançamentos contábeis para os mesmos 80 eventos; não são 135 transações independentes. Não foram encontrados hashes ausentes, transações órfãs ou hashes adicionais sem correspondência na cadeia.

Esta é uma reconciliação estrutural por identificadores. Ainda não constitui auditoria contábil integral de saldos, regras econômicas, legitimidade de cada operação ou equivalência de valores.

## 4. Reconciliação do ledger MW-Ex

Estado live:

| Estrutura | Registros |
|---|---:|
| mwex_transactions | 29 |
| mwex_ledger_entries | 34 |

As 29 transações MW-Ex possuem lançamentos correspondentes. Não foram encontrados lançamentos órfãos. Distribuição: 24 transações com um lançamento e 5 transferências com dois lançamentos (débito/crédito).

Os tipos existentes são MWN_TO_UMS, UMS_TO_MWN e MWN_TRANSFER, todos com status COMPLETED. Isso comprova uso do ledger de conversão/transferência interna; não comprova negociação externa ou operação de mercado.

## 5. MW-Ex — capacidade de compra/venda versus operação efetiva

A inspeção foi aprofundada diretamente no banco, sem depender apenas da interface ou de documentos históricos.

### 5.1 Flags atuais

O cadastro live de ativos declara:

- MWN: is_active=true, can_buy=true, can_sell=true.
- BTC e ETH: inativos para operação; disponíveis apenas como referência.
- Índices e indicadores macro: não negociáveis.

Portanto, MWN está habilitado para seleção em compra e venda. Isso, isoladamente, não significa que exista mercado ativo, matching automático ou liquidação executada.

### 5.2 Motor de ordens e liquidação

Existem no banco funções específicas para:

- criar rascunho de ordem (mwex_create_order_draft);
- submeter ordem e reservar saldo (mwex_submit_order);
- criar execução entre ordem de compra e venda (mwex_create_fill);
- liquidar execução (mwex_settle_fill);
- cancelar ordens, expirar ordens e gerir reservas.

A implementação atual, contudo, tem limites operacionais explícitos:

- Configuração matching.mode=MANUAL_REVIEW: matching não automatizado.
- market_orders.enabled=false: ordens a mercado desabilitadas; a função de submissão também rejeita mercado sem provedor de preço configurado.
- Taxas desabilitadas (fees.enabled=false, bps=0).
- Criação de fill e liquidação exigem atuação administrativa.
- payment_confirmation.mode=MANUAL_ADMIN e webhook_enabled=false: confirmação de pagamento fiduciário manual, sem webhook habilitado.
- Há uma aquisição fiduciária registrada como confirmed, mas isso não comprova integração automática com provedor.
- Zero ordens e zero fills nas tabelas live no momento da consulta; o histórico de status de ordens também está vazio.

Conclusão: MW-Ex possui uma estrutura de carteira/ledger e um fluxo de ordens com reserva, matching administrativo e liquidação administrativa implementados no banco. Não há evidência de operação efetiva do mercado de compra/venda, de matching automatizado, de provedor de preço ou de liquidação de ordens já executada. Classificar como **infraestrutura transacional em estágio de preparação/manual review**, não como exchange operacional.

### 5.3 Observação de segurança

A verificação de privilégios indicou EXECUTE disponível para anon em algumas RPCs SECURITY DEFINER de ordens/liquidação e confirmação fiduciária. As funções inspecionadas contêm verificações de autenticação, elegibilidade ou papel administrativo, conforme a operação. Nenhuma exploração foi realizada e nenhum privilégio foi alterado. Recomenda-se revisão de menor privilégio, incluindo eventual revogação de EXECUTE de PUBLIC/anon quando não necessário, antes de qualquer abertura operacional.

## 6. Repositórios e arquitetura já inspecionados

### 6.1 meshwave-blockchain

Repositório: https://github.com/meshwave65/meshwave-blockchain  
Commit anteriormente inspecionado: f6785f54bdbd7d8c016f21f2989797beed207ac2.

Os arquivos inspecionados documentam encadeamento SHA-256 e ledger piloto de operador único; SQLite é usado no scaffold local. Não foram localizados, no conjunto de arquivos/branch inspecionado, cliente EVM, contratos Solidity, rede P2P ou consenso distribuído. Esta constatação é limitada ao conjunto examinado.

### 6.2 newsite / MW-Ex

Repositório: https://github.com/meshwave65/newsite  
Commit anteriormente inspecionado: c8973f7701ea056a39477f708fe18590a05fbe32; deployment Vercel Hobby observado como READY.

As migrações e funções live mostram ledger MWN separado, conversões UMS↔MWN, transferências internas, cadastro de ativos, reservas e estrutura de ordens/fills/liquidação. Os controles atuais mantêm matching e confirmação fiduciária em modo manual, e não há ordens/fills no banco.

### 6.3 Foundation_MeshWave / PoUW

Repositório: https://github.com/meshwave65/Foundation_MeshWave  
Commit anteriormente inspecionado: 55431c0f9b5729624f46dd391b1132688a8fb045.

A documentação conceitual trata PoUW como contribuição útil mais ampla que computação, incluindo potencialmente processamento, armazenamento, rede e contribuições financeiras. Critérios de elegibilidade, evidência, mensuração, remuneração, antifraude e contestação ainda requerem especificação. Documento conceitual não comprova motor PoUW implementado.

## 7. Replicação MeshWalker — fora do caminho crítico

O responsável esclareceu a existência de uma ideia/missão anterior para manter réplicas da blockchain em dispositivos voluntários de MeshWalkers, com detecção de corrupção e recuperação.

Essa proposta é de redundância, preservação e recuperação de dados; não é consenso nem validação de blocos. **A busca pelo documento original deixa de ser pendência e não bloqueia a MISSION_0026.** A ideia só deverá voltar à análise se, depois de definir o papel de Ethereum e os dados que permanecerão fora da blockchain, surgir uma necessidade concreta de armazenamento distribuído que Ethereum não resolva.

## 8. Conclusão revisada do WP26.1

O baseline live do projeto correto, Supabase MeshWave65, é de **80 blocos e 80 transações confirmadas**, com sequência e referências de hash estruturalmente consistentes. As 80 transações têm correspondência por hash nos 135 lançamentos do ledger de contas. As 29 transações MW-Ex têm correspondência nos 34 lançamentos do ledger MW-Ex, sem órfãos.

MW-Ex não deve ser descrita apenas como um ticket de compra/venda de interface: há funções de criação/submissão de ordens, reserva, matching administrativo, fill e liquidação. Mas também não deve ser descrita como exchange em funcionamento: matching está em revisão manual, mercado a preço está desabilitado, confirmação fiduciária é manual, e não existem ordens ou fills registrados.

O baseline é suficiente para iniciar o mapeamento de equivalências e gaps com Ethereum/EVM, mantendo como limites a ausência de auditoria criptográfica independente e a necessidade de completar o inventário global de repositórios e deployments.

## 9. Pendências remanescentes

1. Completar o inventário delimitado de repositórios, deployments e componentes de execução/rede/armazenamento.
2. Fazer reconciliação econômica/contábil mais profunda apenas se necessária para mapear responsabilidades e migração; a reconciliação estrutural de IDs/hashes foi concluída.
3. Reconciliar o estado PAUSED de SCP-TASK-000027 com a documentação STAGED e o espelho GitHub, sem alterar status ou disparar agente pago.
4. Iniciar WP26.4 — matriz de equivalências e gaps MeshWave × Ethereum/EVM — com base neste baseline live.

## 10. Integridade da execução

- Ferramentas: GitHub e Supabase MeshWave65 em consultas read-only; Vercel Hobby para evidência de deployment já consultada.
- Serviços pagos/créditos externos: nenhum utilizado.
- Alterações em código, banco, dados financeiros, contratos, chaves, saldos, ordens, configurações ou produção: nenhuma.
- POC, transação, migração ou deploy: nenhum.
