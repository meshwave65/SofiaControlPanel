# MISSION_0020 — Progresso

**Estado:** PROGRESS  
**Última atualização:** 2026-11-15

## Situação consolidada

A missão foi reorientada para restaurar o SCP como gestor soberano das missões e interface de comando/interlocução do operador. O agente externo executa etapas temporárias; não é dono da missão nem da continuidade.

A decisão metodológica mais recente estabelece visão global e planejamento integrado, com implementação paulatina: uma etapa funcional por vez, resultado real visível, avaliação do responsável, correções pontuais e avanço sequencial. Não se deve trabalhar às cegas nem agrupar diversas etapas em um lote grande.

## Decisões persistidas

- OR-20261115-0043: reorientação do SCP, papel do Messenger, TR como Transactional Report, fronteiras de ARC/PGC, auditoria funcional e limites operacionais.
- OR-20261115-0044: operar em modo missão com decisões persistidas; visão global com implementação incremental; reduzir risco por pequenos incrementos verificáveis; continuidade independente de chat.

## Estado técnico conhecido

- PR #15: https://github.com/meshwave65/SofiaControlPanel/pull/15
- Branch: `feat/sofia-cognitive-control-plane`.
- Roteamento de mensagens da missão-raiz para executor ativo em tarefa-filha está implementado na branch e possui workflow anterior aprovado conforme OR-0043.
- Commit `fabaff376cfbe7889752dc57ec3d7785e959d0aa` atualiza rótulos e descrição do TR na UI. Não foi observado workflow CI associado a esse commit.
- Nenhuma dessas alterações está declarada como publicada em produção. PR #15 permanece sem merge conforme último estado registrado; reconciliar antes de qualquer nova ação.

## Próxima ação

Um incremento de UI no Messenger da missão: inspecionar a interface e contratos existentes e tornar visível/utilizável a conversa central com a SOFIA. A próxima instância deve fazer somente essa etapa, demonstrá-la e parar para avaliação do responsável.

## Bloqueios e limites

- Não alterar produção, fazer merge/deploy/restart ou realizar chamadas externas/consumir créditos sem autorização específica.
- Não tocar em 20.3/Mateus.
- Não expandir AC-023 nem ARC/PGC como gates/fontes de execução.
- Testes unitários com mocks não comprovam entrega real a Manus/agente.
