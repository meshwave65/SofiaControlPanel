# OR — WP26.1 — Baseline e inventário MeshWave

**Data:** 2026-11-16  
**Executor:** análise manual assistida por ChatGPT, usando apenas ferramentas gratuitas  
**Estado:** PARTIAL — inventário documental concluído; verificação de dados live bloqueada  
**Missão:** MISSION_0026  
**Commit-base dos documentos da missão:** branch `main`

## 1. Escopo executado

Inspeção dos repositórios diretamente relacionados a blockchain, MWN, UMS, MW-Ex, ledger e PoUW; verificação da implantação atual do frontend MW-Ex; consulta read-only às fontes de governança e tentativa de confirmação do banco operacional.

Nenhum código, contrato, token, carteira, chave, saldo, ordem, schema ou configuração financeira foi alterado. Nenhuma transação, POC ou deploy foi realizado.

## 2. Evidências observadas

### 2.1 Blockchain MeshWave

Repositório: [meshwave-blockchain](https://github.com/meshwave65/meshwave-blockchain)  
Commit mais recente na branch `main`: [f6785f5](https://github.com/meshwave65/meshwave-blockchain/commit/f6785f54bdbd7d8c016f21f2989797beed207ac2), 2026-10-24.

Arquivos inspecionados:
- `README.md`
- `docs/PILOT_STATE_2026-10-24.md`
- `src/meshwave_chain/core/chain.py`
- `src/meshwave_chain/core/pilot_ledger.py`
- `src/meshwave_chain/storage/sqlite_store.py`
- `tests/unit/test_pilot_ledger.py`

Achados:
- A documentação do piloto descreve um ledger custodial de operador único, com dois blocos e duas transações na fotografia de 2026-10-24.
- `chain.py` implementa blocos encadeados por SHA-256 e verificação de hash/parent hash. Isso demonstra integridade de encadeamento no código, não consenso distribuído.
- `pilot_ledger.py` declara expressamente que é um ledger piloto de operador único, não consenso distribuído.
- `sqlite_store.py` declara ser armazenamento para desenvolvimento local, não armazenamento de consenso de produção.
- Não foram localizados contratos Solidity, implementação EVM, rede P2P, cliente de execução/consenso, validadores ou mecanismo de finalização distribuída no repositório inspecionado.
- **Gap de regra econômica:** a função `transfer_event` aceita `UMS` e `MWC` como ativos transferíveis entre contas. Os testes inspecionados verificam saldo insuficiente e idempotência, mas não testam a proibição de transferência direta de UMS. Isso é uma lacuna do scaffold local; não prova que o ledger operacional permita a mesma operação.

Classificação: **piloto/protótipo**, não blockchain distribuída de produção comprovada.

### 2.2 Aplicação MW-Ex e carteiras

Repositório: [newsite](https://github.com/meshwave65/newsite)  
Commit `main`: [c8973f7](https://github.com/meshwave65/newsite/commit/c8973f7701ea056a39477f708fe18590a05fbe32), 2026-11-16 01:08 UTC.

Implantação Vercel verificada:
- Projeto `newsite`, plano da equipe: Hobby.
- Deployment: [READY](https://vercel.com/meshwaves-projects/newsite/Z1VRGFXvyB1bg11HB1QGxjWC2kE4).
- Commit implantado: `c8973f7701ea056a39477f708fe18590a05fbe32`.

Arquivos e migrações inspecionados:
- `src/pages/MwEx.jsx`
- `src/pages/MeshwalkerWallet.jsx`
- `supabase/migrations/20261110140000_mwex_mvp_ledger.sql`
- `supabase/migrations/20261112170000_mwex_auditable_statements.sql`
- `supabase/migrations/20261114112135_mwex_asset_operation_flags.sql`
- `supabase/migrations/20261114112643_mwex_block_draft_orders_when_disabled.sql`

Achados:
- O código contém carteira/ledger MW-Ex, transferência interna de MWN e conversões UMS↔MWN por funções/RPCs específicas.
- O fluxo de transferência MWN usa consulta controlada de destinatário, idempotência e registros de ledger.
- A tela de compra/venda contém ticket de revisão local, mas o próprio código informa que ainda não envia ordem ao motor, não reserva saldo e não liquida operação. Portanto, a interface não comprova mercado operacional.
- A migração `mwex_assets` cria cadastro central de ativos com flags independentes de ativo, compra e venda. O seed inicial deixa os ativos inativos e sem compra/venda; MWN é a referência padrão, não uma autorização automática de negociação.
- Os triggers de ordem/fill encontrados nessa migração verificam MWN explicitamente. Não foi localizada, na sequência de migrações versionadas da branch `main`, a criação das tabelas `mwex_orders`/`mwex_order_fills` nem uma RPC de submissão de ordens. A origem dessas estruturas precisa ser reconciliada antes de afirmar que o motor está operacional.
- Permanecem nomes legados `MWC` em tabelas/campos e referências do código, enquanto a interface atual usa MWN. Tratar isso como dívida de nomenclatura/migração, não presumir que sejam dois ativos distintos.

Classificação:
- Carteiras e ledger interno: **produção parcial**, conforme código e deployment.
- Transferência MWN e conversão UMS↔MWN: **implementação presente no código atual**; execução live e saldos não foram revalidados nesta consulta.
- Compra/venda de ativos: **interface presente, motor não comprovado**.

### 2.3 Banco operacional MWN

O projeto Supabase `vkjurxxrlchnytnkkrvq` aparece na listagem de projetos como saudável. Entretanto, a tentativa de leitura de tabelas/linhas por conexão read-only falhou por autenticação do conector. Portanto:
- não foi possível confirmar o conteúdo atual de `mwex_assets`;
- não foi possível confirmar se MWN está atualmente ativo e habilitado para compra/venda no banco;
- não foram consultados saldos, ordens ou transações de usuários.

**Não inferir estado live a partir dos seeds das migrações.**

### 2.4 PoUW e documentação conceitual

Repositório: [Foundation_MeshWave](https://github.com/meshwave65/Foundation_MeshWave)  
Commit mais recente na branch `main`: [55431c0](https://github.com/meshwave65/Foundation_MeshWave/commit/55431c0f9b5729624f46dd391b1132688a8fb045), 2026-11-13.

O documento conceitual `BCE/temas/economia-ums-mwn-pouw-liquidez-distribuida.md` e o checkpoint `BCE/sessoes/2026-11-01_pouw-contribuicoes-e-genesis-ums.md` descrevem PoUW como contribuição útil mais ampla que trabalho computacional, incluindo contribuições financeiras ao desenvolvimento. Os documentos deixam critérios de elegibilidade, evidência, mensuração, remuneração, antifraude e contestação para especificação posterior. Eles **não comprovam implementação**.

Classificação: **conceito/modelagem documental**; implementação de motor PoUW não localizada nesta inspeção.

### 2.5 Governança da MISSION_0026 e tarefa SCP

Consulta read-only ao projeto Supabase do SCP:
- Missão de governança: `MISSION_0026`, estado `PROGRESS`.
- Tarefa operacional `SCP-TASK-000027`, ID interno 28, prioridade Crítica.
- Estado real no banco: `PAUSED`.
- `agentId = null`.
- `githubSyncStatus = pending`.
- Caminho declarado: `missions/SCP-TASK-000027.md`.
- O arquivo de espelho `missions/SCP-TASK-000027.md` não existe na branch `main` do repositório SCP.

Há divergência: `README.md`/`PROGRESS.md` dizem que a tarefa está `STAGED`, mas o registro atual do banco está `PAUSED`. Nenhuma alteração de status foi feita para evitar eventual disparo automático de agente/consumo de créditos.

## 3. Matriz de maturidade

| Componente | Classificação observada | Evidência / limite |
|---|---|---|
| Blockchain/ledger encadeado | Piloto/protótipo | Dois blocos documentados em 24/10; operador único |
| Consenso/validadores/P2P | Não localizado | Nenhuma implementação comprovada no repositório inspecionado |
| EVM/Solidity/contratos | Não localizado | Nenhum contrato ou runtime EVM em `main` dos repositórios inspecionados |
| UMS/MWN — carteira e ledger | Produção parcial | Código e deployment da aplicação; live DB não revalidado |
| Conversão UMS↔MWN | Implementação presente | RPC/migrações versionadas; operação live não revalidada |
| Transferência MWN | Implementação presente | Fluxo de transferência no código atual |
| MW-Ex compra/venda | Não comprovado operacional | Ticket local; motor de ordens não localizado na branch `main` |
| PoUW | Conceito | Documentação conceitual; motor de validação/recompensa não localizado |
| Infraestrutura de blockchain | Não comprovada | Deployment Vercel é da aplicação, não de nós blockchain |

## 4. Conclusão do WP26.1

O estado observado não sustenta classificar a MeshWave como uma blockchain distribuída de produção. O que está comprovado no material inspecionado é uma aplicação financeira com ledger/contabilidade em banco, fluxos de transferência/conversão MWN e um piloto separado de encadeamento de hashes com operador único.

A lacuna mais importante para a decisão Ethereum/EVM é que a MeshWave ainda não apresenta, nas branches principais inspecionadas, uma camada comprovada de consenso/execução de contratos que precise ser substituída ou integrada. A decisão deve partir do que existe de fato — e não de uma migração imaginária de uma blockchain distribuída já consolidada.

## 5. Bloqueios e pendências

1. Recuperar acesso read-only válido ao projeto Supabase MWN para confirmar flags atuais de ativos, tabelas e estado do ledger, sem expor credenciais.
2. Reconciliar a origem das tabelas de ordens referenciadas pelos triggers e confirmar se existe motor de negociação fora da branch `main`.
3. Corrigir a divergência entre estado documental `STAGED` e estado real `PAUSED` da tarefa SCP, após confirmar que a alteração não dispara agente pago.
4. Sincronizar o espelho `missions/SCP-TASK-000027.md` em etapa própria.

## 6. Integridade da execução

- Ferramentas utilizadas: GitHub, Vercel Hobby, Supabase read-only e fontes públicas.
- Serviços pagos/ créditos externos: nenhum utilizado.
- Alterações em código, dados financeiros, banco, contratos, chaves, saldos, ordens ou produção: nenhuma.
- POC, transação ou deploy: nenhum.
