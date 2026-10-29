# Tarefas da Missão 0009 — Orquestração MWC e SOFIA-SWE

**Missão:** 0009 — Orquestração de Relacionamento MWC e SOFIA-SWE
**Status:** PROGRESS
**Blueprint:** `governance/missions/0009/BLUEPRINT.md` (v0.1.0)

| ID | Tarefa | Status | Instância | Notas |
|---|---|---|---|---|
| 9.1 | Formalizar missão e blueprint de handoff no SCP; definir roteamento meeting-first e fronteiras dos repositórios | DONE | Manus AI | Blueprint v0.1.0 criado. Distingue MWC/SOFIA-SWE, define locks e exige OR. |
| 9.2 | Verificar a possível reunião futura de NW-LI-0023; se confirmada, executar Meeting Prep e persistir materiais no network | DONE | Manus AI | Agendamento confirmado para 06/11/2026, 16:00–16:45. Briefing existente revisado; inventário atualizado em `1890bb9`; lock separado liberado em `aac1d90`. Demonstração end-to-end/latência continuam pendentes. |
| 9.3 | Sem outra reunião futura confirmada, retomar HH de SOFIA/SWE, um contato por vez | PROGRESS | Manus AI | A trilha da criptomoeda anteriormente chamada MWC foi transferida para MISSION_0011 (MWN); não executar HH/MWC para a moeda nesta missão. NW-LI-0087 foi concluído em `df8bb88` e liberado em `93eca56`; próximo contato possível para SOFIA/SWE é NW-LI-0088, sujeito a novo preflight e lock. Pular NW-LI-0091 até nova instrução. |
| 9.4 | Acionar Secretary apenas para minuta aprovada/autorizada; registrar envio, resposta e agendamento comprovados | STAGED | — | Não enviar mensagens sem autorização humana explícita. Uma minuta ou resposta positiva não comprova reunião. |
| 9.5 | Preparar cada reunião futura confirmada com Meeting Prep e registrar materiais/handoff no network | STAGED | — | Meeting Prep só trabalha com data/participantes confirmados e histórico verificável. |
| 9.6 | Auditar consistência final, atualizar relatórios/índices e fechar a missão com OR e commits remotos | STAGED | — | Não encerrar enquanto houver unidade em andamento, lock próprio ativo ou OR ausente. |

## Regra de atualização

Antes de assumir uma linha STAGED, sincronizar SCP e network, verificar atribuição/locks e atualizar a instância responsável. Para cada contato, confirmar o lock persistente do `network` antes de abrir ficha, reunião ou fonte. Após a conclusão, registrar o resultado e commit do `network`, liberar o lock em commit separado, atualizar esta lista e publicar o OR daquela unidade no SCP. Não trabalhar em mais de um `master_id` simultaneamente na mesma execução.
