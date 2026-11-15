# MISSION_0020 — Progresso

**Estado:** PROGRESS  
**Última atualização:** 2026-11-15

## Situação consolidada

A missão foi reorientada para restaurar o SCP como gestor soberano das missões e interface de comando/interlocução do operador. O agente externo executa etapas temporárias; não é dono da missão nem da continuidade.

A decisão metodológica mais recente estabelece visão global e planejamento integrado, com implementação paulatina: uma etapa funcional por vez, resultado real visível, avaliação do responsável, correções pontuais e avanço sequencial. Não se deve trabalhar às cegas nem agrupar diversas etapas em um lote grande.

## Decisões persistidas

- OR-20261115-0043: reorientação do SCP, papel do Messenger, TR como Transactional Report, fronteiras de ARC/PGC, auditoria funcional e limites operacionais.
- OR-20261115-0044: operar em modo missão com decisões persistidas; visão global com implementação incremental; reduzir risco por pequenos incrementos verificáveis; continuidade independente de chat.
- OR-20261115-0045: primeiro incremento da conversa central com a SOFIA na UI TaskDetail; histórico vinculado à missão-raiz, com consulta periódica e envio pelo contrato existente.

## Estado técnico conhecido

- PR #15: https://github.com/meshwave65/SofiaControlPanel/pull/15
- Branch: `feat/sofia-cognitive-control-plane`.
- Roteamento de mensagens da missão-raiz para executor ativo em tarefa-filha está implementado na branch e possui workflow anterior aprovado conforme OR-0043.
- Commit `fabaff376cfbe7889752dc57ec3d7785e959d0aa` atualiza rótulos e descrição do TR na UI.
- Commit `9944dedebe02e92b267758bf13b311d3ee8baebf` adiciona a aba Messenger ao detalhe da missão. A consulta e a gravação usam sempre o ID da missão-raiz, mesmo a partir de tarefa-filha.
- CI do commit `9944dedebe02e92b267758bf13b311d3ee8baebf`: aprovado no run #43723491191 (TypeScript, testes, build e validações PostgreSQL/dispatch). Ver OR-20261115-0046. QA visual autenticado e teste real controlado do ciclo Manus ainda pendentes.
- PR #15 permanece OPEN e não mergeada. Nenhuma alteração foi publicada em produção.

## Incrementos recentes

- Messenger central: UI implementada e CI aprovado; ligação de código para retorno do executor à conversa central rastreada. Ver OR-0045 e OR-0046.
- Painel Execução e executor: UI implementada e CI aprovado; estado local e estado externo apresentados separadamente, com consulta do perfil público do agente sem credenciais. Ver OR-0047.

## Próxima ação

Prosseguir a auditoria do ciclo de vida da missão com inspeção dos contratos e limites reais. Escolher uma única operação funcional para restaurar. Não simular pausa/retomada externa alterando apenas status local. QA visual e teste real controlado continuam dependentes de ambiente/autorização.

## Bloqueios e limites

- Não alterar produção, fazer merge/deploy/restart ou realizar chamadas externas/consumir créditos sem autorização específica.
- Não tocar em 20.3/Mateus.
- Não expandir AC-023 nem ARC/PGC como gates/fontes de execução.
- Testes unitários com mocks não comprovam entrega real a Manus/agente.
