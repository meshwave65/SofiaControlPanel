# MISSION_0026 — Progresso

**Estado:** PROGRESS  
**Prioridade:** CRÍTICA — nível máximo  
**Criada em:** 2026-11-16  
**Última atualização:** 2026-11-16  
**Índice operacional:** [OPERATIONAL_INDEX.md](./OPERATIONAL_INDEX.md)

## Aprovação e governança

- O responsável aprovou expressamente o TR v0.1.0 nesta conversa.
- TR aprovado publicado em TR-v0.1.0-APPROVED.md.
- Blueprint v1.0.0 publicado em BLUEPRINT.md, estado READY, derivado do TR aprovado.
- Missão de governança MISSION_0026 permanece em PROGRESS no Supabase.
- A tarefa operacional raiz SCP-TASK-000027 foi criada com prioridade CRÍTICA. Estado atual consultado no banco: PAUSED, sem agente atribuído e com githubSyncStatus=pending. Isso diverge do estado STAGED registrado anteriormente nos documentos. Nenhuma mudança de status foi feita para evitar eventual disparo automático de agente ou consumo de créditos.
- O arquivo espelho missions/SCP-TASK-000027.md ainda não existe no GitHub.

## Segurança — correção RLS

Inspeção anterior constatou:
- sofia.governanceMissions estava com RLS desabilitado.
- Não havia policies na tabela.
- Não havia grants para anon ou authenticated; o schema sofia também não concedia USAGE a esses papéis.
- O acesso observado estava limitado ao owner postgres.

Correção aplicada por migração secure_governance_missions_rls:
- RLS habilitado.
- Política RESTRICTIVE para anon e authenticated, com USING(false) e WITH CHECK(false).
- Nenhum grant ou acesso de cliente foi concedido.
- Nenhuma outra tabela, policy, grant ou dado financeiro foi alterado.

A política restritiva funciona como defesa em profundidade: mesmo que uma policy permissiva seja adicionada futuramente para esses papéis, a restrição continuará negando acesso até ser revista deliberadamente. O acesso backend/admin permanece sujeito ao modelo de privilégios existente.

## Estado documental

- ORIGINAL_REQUEST: preservado.
- TR-v0.1.0-DRAFT: preservado como histórico supersedido.
- TR-v0.1.0-APPROVED: VALIDATED.
- BLUEPRINT v1.0.0: READY.
- TASKS: atualizado com estados atuais dos work packages.
- OPERATIONAL_INDEX: criado.
- OR-WP26.1: revisado com consulta direta read-only ao Supabase MeshWave65; baseline live corrigido (77 blocos/77 transações), ainda parcial pelas pendências de reconciliação funcional e inventário.
- OR-WP26.2: concluído.
- OR-WP26.3: concluído.
- RLS migration: aplicada.
- Registro de governança no Supabase: MISSION_0026, ID interno 25, status PROGRESS, canonicalPath governance/missions/0026/.

## Execução técnica — 2026-11-16

### WP26.1 — Baseline MeshWave
- Inspecionados meshwave-blockchain, newsite, Foundation_MeshWave, migrações e fontes relacionadas.
- Verificado deployment Vercel Hobby do newsite em estado READY, no commit c8973f7701ea056a39477f708fe18590a05fbe32.
- Evidência live no Supabase MeshWave65 confirma cadeia/ledger piloto de operador único com 77 blocos e 77 transações; a fotografia de dois blocos de 24/10 é histórica e não representa o estado atual.
- O código local do piloto permite transferência UMS no scaffold; isso não comprova comportamento do banco operacional.
- A consulta direta read-only ao projeto Supabase MeshWave65 (`ufylccbdjfzydbwhpmpp`) confirmou 77 blocos (0–76), 77 transações confirmadas, 129 lançamentos em `mw_account_ledger`, 29 transações MW-Ex e 34 lançamentos MW-Ex. Metadata declara `network=pilot`, `canonical=false`, `consensus=single-operator`. Sequência e referências `previous_hash` sem divergências estruturais; transações sem bloco ou órfãs: zero. Não foi feita auditoria criptográfica independente.
- Estado: PARTIAL.

### WP26.2 — Catálogo Ethereum/EVM
- Avaliados EVM, Solidity, ERCs, OpenZeppelin, Hardhat, Foundry, viem, revm, account abstraction, L2/rollups, Besu e Cosmos SDK/CometBFT.
- Conclusão desta unidade: existe amplo ecossistema reutilizável; EVM é execução determinística e não fornece consenso por si só.
- Estado: DONE.

### WP26.3 — PoUW e consenso
- Separados consenso, execução EVM, trabalho útil, verificação e recompensa.
- Revisada literatura de 2025/2026 e documentação de Golem/Akash.
- Conclusão desta unidade: PoUW MeshWave, conforme a documentação conceitual, é mais amplo que consenso PoUW e deve ser avaliado como camada de reconhecimento/verificação de contribuições e contabilização de UMS.
- Estado: DONE.

## Limites respeitados

- Ferramentas utilizadas: GitHub, Vercel Hobby, Supabase read-only e fontes públicas.
- Nenhum serviço pago ou crédito externo utilizado.
- Nenhum código, contrato, token, carteira, chave, saldo, ordem, schema ou configuração financeira alterado.
- Nenhuma transação, POC executável, migração econômica ou deploy realizado.

## Próximos passos

1. Reconciliar eventos da cadeia, ledger de contas e ledger MW-Ex; verificar flags e liquidação MW-Ex; completar inventário de execução/rede e localizar a missão original de replicação MeshWalker.
2. Reconciliar o estado PAUSED da tarefa SCP com a documentação STAGED e sincronizar o arquivo espelho, sem acionar agente pago.
3. Liberar WP26.4 somente após o baseline estar suficientemente fechado; então seguir a matriz de equivalências e gaps.
