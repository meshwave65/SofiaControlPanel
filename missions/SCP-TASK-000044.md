# Governança de mercado do MWN no MW-Ex

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo é a fonte versionada de proveniência e contexto.

## Metadata

| Campo | Valor |
| --- | --- |
| missionKey | SCP-TASK-000044 |
| taskId | 44 |
| source | SofiaControlPanel connector operation |
| creator | meshwave65@gmail.com |
| creatorType | user |
| statusId | 2 |
| priorityId | 1 |
| parentTaskId | |
| dueDate | |
| mirroredAt | 2026-11-19T12:49:58.390Z |

## Description

Formalizar a linha de base evolutiva v0.1 da governança MWN/MW-Ex. Preservar: distinção entre estoque, oferta efetiva, demanda, liquidez e preço marginal; mercados primário e secundário; cashback financiado pelo vendedor, separado do preço e pago ao comprador; reservas de MWN e FIAT, prevenção de dupla alocação e liquidação atômica; liberdade de escolha do comprador; agregação de ofertas com termos idênticos; preferência MeshWalker somente quando condições comerciais forem equivalentes. Princípio: “Neutralidade comercial com preferência comunitária”. Registrar questões abertas sem bloquear a linha de base. Sem implementação, transações ou alterações de saldos.

## Synchronization contract

- Supabase task ID: `44`
- GitHub path: `missions/SCP-TASK-000044.md`
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam uma missão automaticamente.
