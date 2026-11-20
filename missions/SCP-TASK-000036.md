# Onboarding por indicação e aquisição inicial com liquidação MW-Ex / Carteira Genesis

> Espelho operacional do SofiaControlPanel. A fonte executável é o registro da tarefa no Supabase; este arquivo é a fonte versionada de proveniência e contexto.

## Metadata

| Campo | Valor |
| --- | --- |
| missionKey | SCP-TASK-000036 |
| taskId | 36 |
| source | SofiaControlPanel interface |
| creator | user:1425 |
| creatorType | user |
| statusId | 4 |
| priorityId | 3 |
| parentTaskId |  |
| dueDate |  |
| mirroredAt | 2026-11-20T02:45:14.379Z |

## Description

Implementar e validar o novo fluxo de onboarding por links de indicação e aquisição inicial. Formulário: nome, email, CPF/NIF ou telefone, valor da primeira aquisição, moeda (BRL/EUR), senha e confirmação; cadastro; entrada imediata na carteira com aquisição aguardando validação. Após confirmação do PIX/transferência, executar liquidação auditável: consumir primeiro ordens de venda MWN elegíveis pelo preço (menor preço primeiro) e, em empate, timestamp mais antigo; reconverter MWN em UMS, creditar UMS ao comprador e FIAT aos vendedores; completar eventual insuficiência com Carteira Genesis, creditando a ela o FIAT correspondente; se não houver ordens, liquidar integralmente via Genesis. Política de preço deve considerar volume negociado em relação ao estoque ofertado e ao estoque total, sem reagir a ordens isoladas. Escopo: análise técnica, TR/Blueprint, implementação e testes controlados. Não executar pagamentos, transferências, conversões, créditos ou débitos reais; não alterar saldos/ordens de produção. Identificar invariantes contábeis, idempotência, concorrência, auditoria, antifraude, KYC/LGPD, moedas e arredondamento. Ordenação: preço ascendente e timestamp ascendente. Sem agente fixo; despacho por elegibilidade do SCP.

## Synchronization contract

- Supabase task ID: `36`
- GitHub path: `missions/SCP-TASK-000036.md`
- Alterações de execução e status devem ser persistidas no Supabase e espelhadas neste arquivo.
- Alterações manuais neste arquivo não executam a missão automaticamente.
