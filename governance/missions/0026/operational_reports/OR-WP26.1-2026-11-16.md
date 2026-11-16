# OR — WP26.1 — Baseline e inventário MeshWave

**Data da revisão:** 2026-11-16  
**Executor:** análise manual assistida por ChatGPT, ferramentas gratuitas  
**Estado:** PARTIAL — baseline live corrigido; inventário de módulos e governança ainda requer fechamento  
**Missão:** MISSION_0026  
**Projeto Supabase de referência:** MeshWave65 — `ufylccbdjfzydbwhpmpp`

## 1. Escopo e método

Esta revisão corrige a versão inicial do OR, que tratou a fotografia documental de 24/10 como se fosse o estado operacional atual e indicou incorretamente que a leitura do banco MWN estava bloqueada.

A fonte operacional consultada diretamente foi o projeto Supabase **MeshWave65** (`ufylccbdjfzydbwhpmpp`), usando consultas SQL read-only nas tabelas `public.mw_chain_metadata`, `public.mw_blocks`, `public.mw_transactions`, `public.mw_account_ledger`, `public.mwex_transactions` e `public.mwex_ledger_entries`. O projeto MWC não foi usado como referência.

Nenhum dado, schema, policy, grant, código, contrato, carteira, chave, saldo, ordem ou configuração foi alterado. Nenhuma transação, migração, POC executável ou deploy foi realizado.

## 2. Evidência operacional direta — Supabase MeshWave65

### 2.1 Cadeia registrada

Consulta direta de `mw_chain_metadata`:

- `chain_id`: `meshwave-genesis-v1`
- `chain_name`: `MeshWave Genesis Ledger`
- `network`: `pilot`
- `schema_version`: 1
- `latest_block_number`: 76
- `latest_block_hash`: `adc64112a09acb3af96728f48fc8b281b8a98b71d8f96944c0f84c8dc20054df`
- `updated_at`: 2026-11-14 15:39:15.914972 UTC
- metadata: `canonical=false`, `consensus=single-operator`

Consulta direta de contagem e intervalo em `mw_blocks`:

- 77 blocos, numerados de 0 a 76.
- Primeiro registro: 2026-10-24 07:38:03.799158 UTC.
- Último registro: 2026-11-14 15:39:15.914972 UTC.
- Todos os 77 blocos pertencem a `meshwave-genesis-v1`.

Consulta direta de `mw_transactions`:

- 77 transações.
- 77 com status `confirmed`.
- Todas associadas a um bloco existente; nenhuma sem `block_id` e nenhuma referência órfã.
- Tipos encontrados: `GENESIS_UMS_ALLOCATION` (1), `LEGACY_MWN_TO_UMS_RECONVERSION` (17), `MWC_ACQUISITION_TRANSFER` (17), `MWEX_MWN_TO_UMS` (10), `MWEX_UMS_TO_MWN` (14), `UMS_ACQUISITION_CREDIT` (17), `UMS_MWC_CONVERSION` (1).

### 2.2 Verificações estruturais read-only

Foram verificadas as sequências de numeração e as referências de hash entre blocos:

- Lacunas/desvios na sequência 0–76: 0.
- Divergências entre `previous_hash` e o hash do bloco anterior: 0.
- Transações sem bloco: 0.
- Transações apontando para bloco inexistente: 0.

Esses resultados comprovam consistência estrutural básica das referências armazenadas no momento da consulta. **Não equivalem a auditoria criptográfica independente**: não foi recalculado externamente o hash de cada bloco a partir do payload, nem validada de forma independente a construção da raiz de Merkle, assinaturas ou autorização de produção.

### 2.3 Ledgers e MW-Ex

Contagens consultadas diretamente:

| Tabela | Registros |
|---|---:|
| `mw_account_ledger` | 129 |
| `mwex_transactions` | 29 |
| `mwex_ledger_entries` | 34 |

Essas tabelas têm funções e granularidades próprias. Não devem ser somadas às 77 transações da cadeia nem tratadas como 77 operações adicionais. A reconciliação semântica entre eventos da cadeia, lançamentos de conta e lançamentos MW-Ex permanece como atividade de análise, não como conclusão desta contagem.

### 2.4 Interpretação correta do estado da cadeia

O banco contém uma cadeia encadeada de 77 blocos e 77 transações confirmadas, com atividade registrada até 14/11/2026. Portanto, a afirmação anterior de que o estado atual tinha apenas dois blocos está **corrigida e supersedida**.

Ao mesmo tempo, o próprio metadata classifica a rede como `pilot`, `canonical=false` e `consensus=single-operator`. A evidência sustenta uma cadeia/ledger operacional em ambiente piloto, sob produção de bloco de operador único. Não sustenta afirmar que exista consenso distribuído, rede P2P de validadores ou blockchain descentralizada.

A fotografia de dois blocos do documento `PILOT_STATE_2026-10-24.md` é histórica e não descreve o estado atual posterior. Ela deve ser usada apenas para reconstruir a evolução.

## 3. Evidências de repositórios e aplicações

### 3.1 Repositório meshwave-blockchain

Repositório: https://github.com/meshwave65/meshwave-blockchain  
Commit anteriormente inspecionado na branch `main`: `f6785f54bdbd7d8c016f21f2989797beed207ac2`, 2026-10-24.

Arquivos inspecionados: `README.md`, `docs/PILOT_STATE_2026-10-24.md`, `src/meshwave_chain/core/chain.py`, `src/meshwave_chain/core/pilot_ledger.py`, `src/meshwave_chain/storage/sqlite_store.py`, `tests/unit/test_pilot_ledger.py`.

O código documenta encadeamento por SHA-256 e verificação de hash/parent hash. O módulo de ledger o identifica como piloto de operador único; o armazenamento SQLite é destinado ao desenvolvimento local. A fotografia documental de dois blocos não deve ser extrapolada para o banco MeshWave65 atual, que foi consultado diretamente nesta revisão.

Não foram localizados, na inspeção anterior desse repositório, cliente EVM, contratos Solidity, rede P2P ou mecanismo de consenso distribuído. Isso é uma constatação limitada aos arquivos/branch inspecionados, não uma prova universal de inexistência em todos os repositórios.

### 3.2 Aplicação MW-Ex e carteiras

Repositório: https://github.com/meshwave65/newsite  
Commit anteriormente inspecionado: `c8973f7701ea056a39477f708fe18590a05fbe32`, 2026-11-16 01:08 UTC. Deployment Vercel Hobby observado como READY.

A inspeção anterior encontrou código de carteira/ledger MW-Ex, transferência interna de MWN e conversões UMS↔MWN por funções/RPCs específicas. A interface de compra/venda possuía ticket de revisão local; isso, isoladamente, não comprovava submissão e liquidação de ordens pelo motor. A consulta atual confirma existência de registros em `mwex_transactions` e `mwex_ledger_entries`, mas a contagem não comprova, por si só, que o motor completo de mercado esteja habilitado ou que todas as operações estejam em produção. A inspeção funcional e das flags atuais deve ser aprofundada antes de classificar compra/venda.

### 3.3 PoUW

Repositório: https://github.com/meshwave65/Foundation_MeshWave  
Commit anteriormente inspecionado: `55431c0f9b5729624f46dd391b1132688a8fb045`, 2026-11-13.

A documentação conceitual descreve PoUW como contribuição útil mais ampla que execução computacional, podendo incluir processamento, armazenamento, rede e contribuições financeiras ao desenvolvimento. Critérios de elegibilidade, evidência, mensuração, remuneração, antifraude e contestação ainda requerem especificação. Documentação conceitual não comprova implementação de um motor PoUW.

## 4. Replicação distribuída para proteção e recuperação

O responsável esclareceu que existe uma iniciativa/missão anterior concebida para desenvolver um programa instalado voluntariamente em smartphones e computadores dos MeshWalkers, inicialmente com a finalidade de manter réplicas da blockchain MeshWave, detectar corrupção e permitir recuperação.

A finalidade descrita é **redundância, preservação e recuperação de dados**, não criar consenso distribuído ou transformar os MeshWalkers em validadores de bloco. A pesquisa textual inicial nos repositórios acessíveis não localizou ainda o documento dessa missão; sua identificação e recuperação permanecem pendentes.

Esse requisito deve ser considerado como requisito de disponibilidade, integridade e recuperação na comparação arquitetural. Não deve ser confundido com consenso, execução EVM ou produção de blocos, nem convertido em escopo de implementação desta missão.

## 5. Matriz de maturidade — revisão

| Componente | Estado sustentado pelas evidências atuais | Limite |
|---|---|---|
| Cadeia MeshWave no Supabase MeshWave65 | 77 blocos e 77 transações confirmadas; sequência e referências parent-hash estruturalmente consistentes | Metadata declara pilot, canonical=false e single-operator; sem consenso distribuído comprovado |
| Ledger de contas | 129 lançamentos em `mw_account_ledger` | Requer reconciliação semântica com transações e saldos |
| MW-Ex | 29 transações e 34 lançamentos no ledger MW-Ex | Contagem não prova mercado completo habilitado nem liquidação end-to-end |
| P2P/validadores/consenso distribuído | Não comprovado nas evidências consultadas | Ausência no conjunto inspecionado não prova inexistência em todo o ecossistema |
| EVM/Solidity/contratos | Não localizado nas branches principais anteriormente inspecionadas | Requer confirmação em inventário completo de repositórios |
| Carteiras e conversão UMS↔MWN | Implementação presente no código e registros live nas tabelas consultadas | Fluxo ponta a ponta e regras atuais precisam de reconciliação |
| Compra/venda MW-Ex | Registros transacionais existem; motor completo não classificado | Verificar flags, RPCs, ordens e liquidação |
| PoUW | Conceito/documentação | Motor de validação e recompensa não comprovado |
| Réplicas MeshWalker para recuperação | Iniciativa conceitual/missão anterior relatada pelo responsável | Documento original e estado de execução ainda não localizados |

## 6. Conclusão revisada do WP26.1

O baseline atual **não é uma cadeia de dois blocos**. O projeto Supabase correto, MeshWave65 (`ufylccbdjfzydbwhpmpp`), contém uma cadeia de 77 blocos e 77 transações confirmadas, com registros até 14/11/2026. As verificações read-only realizadas não encontraram lacunas de numeração, divergências de referência ao hash anterior ou transações órfãs.

A classificação prudente é: **ledger/cadeia MeshWave em ambiente piloto, com produção de blocos de operador único e consistência estrutural básica observada**. Não há evidência suficiente, nesta revisão, para classificá-la como rede descentralizada com consenso distribuído.

Para a MISSION_0026, a comparação Ethereum/EVM deve partir desse estado real: há uma cadeia/ledger existente que precisa ser compreendida e protegida; não se deve presumir que a MeshWave já tenha uma rede de validadores ou execução EVM. A replicação MeshWalker é uma iniciativa distinta de proteção/recuperação e deve ser considerada como requisito arquitetural, sem ser confundida com consenso.

## 7. Pendências para fechar WP26.1

1. Reconciliar, em leitura somente, os eventos da cadeia com `mw_account_ledger`, `mwex_transactions` e `mwex_ledger_entries`, sem somar contagens de granularidades distintas.
2. Inspecionar as flags atuais de ativos, RPCs de ordens e caminho de liquidação MW-Ex para classificar corretamente compra/venda.
3. Completar inventário de repositórios e deployments relacionados à execução, rede e armazenamento da cadeia, delimitando explicitamente o que foi pesquisado.
4. Localizar a missão/documento original do programa de replicação MeshWalker e registrar sua finalidade, requisitos e estado.
5. Reconciliar a divergência PAUSED/STAGED de `SCP-TASK-000027` em etapa própria, sem alterar o status ou disparar agente pago.

## 8. Integridade da execução

- Ferramentas: GitHub, Vercel Hobby e Supabase MeshWave65 em consultas read-only.
- Serviços pagos/créditos externos: nenhum utilizado.
- Alterações em código, dados financeiros, banco, contratos, chaves, saldos, ordens ou produção: nenhuma.
- POC, transação, migração ou deploy: nenhum.
