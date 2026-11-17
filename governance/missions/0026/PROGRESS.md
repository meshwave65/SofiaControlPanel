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
- A tarefa operacional raiz SCP-TASK-000027 foi criada com prioridade CRÍTICA. Estado atual consultado anteriormente no banco: PAUSED, sem agente atribuído e com githubSyncStatus=pending. Isso diverge do estado STAGED registrado anteriormente nos documentos. Nenhuma mudança de status foi feita para evitar eventual disparo automático de agente ou consumo de créditos.
- O arquivo espelho missions/SCP-TASK-000027.md ainda não existe.

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
- OPERATIONAL_INDEX: atualizado.
- OR-WP26.1: revisado novamente com consulta live read-only ao Supabase MeshWave65; baseline corrigido para 80 blocos/80 transações, reconciliação estrutural de ledgers e avaliação funcional do MW-Ex.
- OR-WP26.2: concluído.
- OR-WP26.3: concluído.
- RLS migration: aplicada.
- Registro de governança no Supabase: MISSION_0026, ID interno 25, status PROGRESS, canonicalPath governance/missions/0026/.

## Execução técnica — 2026-11-16

### WP26.1 — Baseline MeshWave
- Supabase MeshWave65 (ufylccbdjfzydbwhpmpp) consultado diretamente; não foram usados documentos históricos como substitutos do estado live.
- Estado live: 80 blocos (0–79), 80 transações confirmadas, 135 lançamentos em mw_account_ledger, 29 transações MW-Ex e 34 lançamentos em mwex_ledger_entries.
- As 80 transações da cadeia têm correspondência por hash no ledger de contas; as 29 transações MW-Ex têm lançamentos correspondentes (24 com uma perna, 5 com duas), sem órfãos.
- Cadeia classificada como piloto, canonical=false, consenso single-operator; sequência e referências parent-hash sem divergências estruturais. Não foi feita auditoria criptográfica independente.
- MW-Ex tem funções de ordens, reservas, fills e liquidação; porém matching MANUAL_REVIEW, confirmação fiduciária MANUAL_ADMIN, ordens a mercado desabilitadas e zero ordens/fills live. Portanto, não é exchange operacional comprovada.
- A ideia de replicação MeshWalker foi reclassificada como requisito futuro opcional de armazenamento/recuperação fora do caminho crítico; localizar documento antigo não bloqueia a missão.
- Estado: PARTIAL — suficiente para iniciar WP26.4; falta fechar inventário global e reconciliação do status operacional da tarefa.

### WP26.2 — Catálogo Ethereum/EVM
- Avaliados EVM, Solidity, ERCs, OpenZeppelin, Hardhat, Foundry, viem, revm, account abstraction, L2/rollups, Besu e Cosmos SDK/CometBFT.
- Conclusão: existe amplo ecossistema reutilizável; EVM é execução determinística e não fornece consenso por si só.
- Estado: DONE.

### WP26.3 — PoUW e consenso
- Separados consenso, execução EVM, trabalho útil, verificação e recompensa.
- Revisada literatura de 2025/2026 e documentação de Golem/Akash.
- Conclusão: PoUW MeshWave, conforme a documentação conceitual, é mais amplo que consenso PoUW e deve ser avaliado como camada de reconhecimento/verificação de contribuições e contabilização de UMS.
- Estado: DONE.

## Limites respeitados

- Ferramentas utilizadas: GitHub, Vercel Hobby, Supabase read-only e fontes públicas.
- Nenhum serviço pago ou crédito externo utilizado.
- Nenhum código, contrato, token, carteira, chave, saldo, ordem, schema ou configuração financeira alterado.
- Nenhuma transação, POC executável, migração econômica ou deploy realizado.

## Próximos passos

1. Iniciar WP26.4 — matriz de equivalências e gaps MeshWave × Ethereum/EVM, usando o baseline live revisado.
2. Completar inventário delimitado de repositórios/deployments e registrar limites da busca.
3. Reconciliar o estado PAUSED de SCP-TASK-000027 com a documentação STAGED e o arquivo espelho, sem alterar status ou acionar agente pago.
