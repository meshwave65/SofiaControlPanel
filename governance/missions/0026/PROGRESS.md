# MISSION_0026 — Progresso

**Estado:** PROGRESS  
**Prioridade:** CRÍTICA — nível máximo  
**Criada em:** 2026-11-16  
**Última atualização:** 2026-11-16  
**Índice operacional:** [OPERATIONAL_INDEX.md](./OPERATIONAL_INDEX.md)

## Aprovação e governança

- TR v0.1.0 aprovado e publicado em TR-v0.1.0-APPROVED.md.
- Blueprint v1.0.0 publicado, estado READY.
- Missão MISSION_0026 permanece em PROGRESS no Supabase.
- SCP-TASK-000027 foi consultada anteriormente como PAUSED, sem agente atribuído e githubSyncStatus=pending, divergindo do estado STAGED em documentos. Nenhuma mudança foi feita para evitar disparo automático de agente ou consumo de créditos.
- O arquivo espelho missions/SCP-TASK-000027.md ainda não existe.

## Segurança — correção RLS

- RLS habilitado em sofia.governanceMissions.
- Política RESTRICTIVE para anon e authenticated, com USING(false) e WITH CHECK(false).
- Nenhum grant ou acesso de cliente foi concedido.
- Nenhuma outra tabela, policy, grant ou dado financeiro foi alterado.
- A autorização de correção permanece limitada a essa tabela de governança.

## Estado documental

- ORIGINAL_REQUEST preservado.
- TR-v0.1.0-DRAFT preservado como histórico supersedido.
- TR-v0.1.0-APPROVED: VALIDATED.
- BLUEPRINT v1.0.0: READY.
- OR-WP26.1 atualizado com baseline live de 80 blocos/80 transações, reconciliação estrutural dos ledgers e inspeção funcional MW-Ex.
- OR-WP26.2: DONE.
- OR-WP26.3: DONE.
- OR-WP26.4: IN PROGRESS — matriz inicial de equivalências MeshWave × Ethereum/EVM publicada.
- TASKS e OPERATIONAL_INDEX atualizados.

## Execução técnica — 2026-11-16

### WP26.1 — Baseline MeshWave
- Supabase MeshWave65 (ufylccbdjfzydbwhpmpp) consultado diretamente.
- Estado live: 80 blocos (0–79), 80 transações confirmadas, 135 lançamentos em mw_account_ledger, 29 transações MW-Ex e 34 lançamentos em mwex_ledger_entries.
- As 80 transações da cadeia têm correspondência por hash no ledger de contas; as 29 transações MW-Ex têm lançamentos correspondentes (24 com uma perna, 5 com duas), sem órfãos.
- Cadeia classificada como piloto, canonical=false, consenso single-operator; sequência e referências parent-hash sem divergências estruturais. Não foi feita auditoria criptográfica independente.
- MW-Ex tem funções de ordens, reservas, fills e liquidação; matching MANUAL_REVIEW, confirmação fiduciária MANUAL_ADMIN, ordens a mercado desabilitadas e zero ordens/fills live.
- Replicação MeshWalker foi retirada do caminho crítico; só será reconsiderada se houver necessidade concreta de armazenamento distribuído para dados off-chain.
- Estado: PARTIAL — baseline suficiente para WP26.4; inventário global complementar pendente.

### WP26.2 — Catálogo Ethereum/EVM
- EVM, Solidity, ERCs, OpenZeppelin, Hardhat, Foundry, viem, revm, account abstraction, L2/rollups, Besu e Cosmos SDK/CometBFT avaliados.
- EVM é execução determinística e não fornece consenso por si só.
- Estado: DONE.

### WP26.3 — PoUW e consenso
- Consenso, execução EVM, trabalho útil, verificação e recompensa separados.
- PoUW MeshWave deve ser tratado como camada de reconhecimento/verificação de contribuições e contabilização de UMS, não como consenso presumido.
- Estado: DONE.

### WP26.4 — Equivalências e gaps
- Inspecionada diretamente a função mw_append_event: bloqueio da metadata, incremento sequencial, um evento por bloco, SHA-256 sobre JSON canônico, gravação de bloco/transação e atualização do ponteiro da cadeia.
- Criada matriz inicial comparando produção de blocos, execução, integridade, ledger, UMS, MWN, MW-Ex, carteiras, PoUW, dados off-chain, RPC/indexação, governança e replicação.
- Conclusão preliminar: Ethereum pode substituir a responsabilidade de consenso/produção de blocos se for escolhida como rede canônica; não substitui automaticamente regras econômicas, MW-Ex, PoUW, FIAT, identidade ou armazenamento privado.
- Estado: IN PROGRESS.

## Limites respeitados

- Ferramentas gratuitas: GitHub e Supabase read-only; Vercel Hobby para evidência de deployment previamente consultada.
- Nenhum agente pago, serviço pago ou crédito externo utilizado.
- Nenhum código, contrato, token, carteira, chave, saldo, ordem, schema ou configuração financeira alterado.
- Nenhuma transação, POC executável, migração econômica ou deploy realizado.

## Próximos passos

1. Completar inventário delimitado de repositórios/deployments e confirmar fronteiras on-chain/off-chain.
2. Refinar WP26.4 com as regras invariáveis UMS/MWN/MW-Ex e critérios de migração.
3. Concluir WP26.4 antes de iniciar a comparação A–F do WP26.5.
4. Reconciliar PAUSED/STAGED de SCP-TASK-000027 sem alterar status ou acionar agente pago.
