# MISSION_0026 — Avaliar reaproveitamento da stack Ethereum/EVM no ecossistema MeshWave

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo é a fonte versionada de proveniência e contexto.

## Metadata

| Campo | Valor |
| --- | --- |
| missionKey | SCP-TASK-000027 |
| taskId | 28 |
| source | SofiaControlPanel interface |
| creator | user:1425 |
| creatorType | user |
| statusId | 2 |
| priorityId | 4 |
| parentTaskId |  |
| dueDate |  |
| mirroredAt | 2026-11-20T02:45:14.379Z |

## Description

MISSION_0026 — PRIORIDADE CRÍTICA (nível máximo). TR v0.1.0 aprovado e Blueprint v1.0.0 READY. Avaliar com evidências atuais se MeshWave deve reaproveitar EVM, Solidity, padrões ERC, clientes, bibliotecas, carteiras, indexadores e infraestrutura Ethereum em vez de desenvolver equivalentes próprios. Escopo: estado real da blockchain/rede MeshWave, MWN, UMS, MW-Ex, ledger, carteiras, PoUW e nós; catálogo de tecnologias Ethereum; análise PoUW separada de consenso e execução; mapa de equivalências; comparação arquitetural Ethereum mainnet, L2 EVM, appchain/sidechain EVM, runtime próprio com EVM, adoção seletiva de tooling e alternativa não-EVM quando justificável; arquitetura recomendada; riscos, migração conceitual e roadmap. Preservar: UMS segregada por carteira; transferências entre MeshWalkers bloqueadas por padrão, mas excepcionalmente permitidas quando houver necessidade sistêmica específica, relevante, delimitada e documentada com motivação e abrangência robustas (ex.: emissões Genesis); exceções não constituem fluxo ordinário e devem ser desestimuladas; conversão UMS↔MWN exclusivamente pela MW-Ex; MWN como ponte; MW-Ex mantém compra/venda apenas para ativos habilitados (atualmente MWN); FIAT somente contra entrada confirmada e ledger auditável. Não confundir PoUW com PoW/PoS ou execução EVM. Entregáveis e critérios completos estão no TR aprovado e Blueprint. Sem agente fixo: atribuição dinâmica pelo SCP. Esta missão autoriza apenas análise e recomendação. Não alterar código, contratos, tokens, supply, carteiras, chaves, saldos, ledger, ordens, dados financeiros, schema, RLS fora da correção pontual autorizada, nem configuração; não realizar POC executável, transação, migração, deploy ou contratar serviços. Não avançar para desenvolvimento além do conceito sem validação de interesse externo e nova autorização/missão.

## Synchronization contract

- Supabase task ID: `28`
- GitHub path: `missions/SCP-TASK-000027.md`
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam a missão automaticamente.
