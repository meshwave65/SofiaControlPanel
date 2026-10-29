# Tarefas da Missão 0009 — Orquestração MWC e SOFIA-SWE

**Missão:** 0009 — Orquestração de Relacionamento MWC e SOFIA-SWE
**Status:** PROGRESS
**Blueprint:** `governance/missions/0009/BLUEPRINT.md` (v0.1.0)

| ID | Tarefa | Status | Instância | Notas |
|---|---|---|---|---|
| 9.1 | Formalizar missão e blueprint de handoff no SCP; definir roteamento meeting-first e fronteiras dos repositórios | DONE | Manus AI | Blueprint v0.1.0 criado. Distingue MWC/SOFIA-SWE, define locks e exige OR. |
| 9.2 | Verificar a possível reunião futura de NW-LI-0023; se confirmada, executar Meeting Prep e persistir materiais no network | PROGRESS | Manus AI | Existe pasta `projects/sofia/meetings/.../nw-li-0023-renato-barros/meet02-2026-11-06/`. A data/nome é apenas pista. Adquirir lock canônico antes de abrir registros individuais. |
| 9.3 | Sem reunião futura confirmada, retomar OCINT quando necessário e HH de MWC e SOFIA-SWE, um contato por vez | STAGED | — | Próximo candidato observado: NW-LI-0087 Bruno Diogo; confirmar status/locks remotos. Pular NW-LI-0091 até nova instrução. |
| 9.4 | Acionar Secretary apenas para minuta aprovada/autorizada; registrar envio, resposta e agendamento comprovados | STAGED | — | Não enviar mensagens sem autorização humana explícita. Uma minuta ou resposta positiva não comprova reunião. |
| 9.5 | Preparar cada reunião futura confirmada com Meeting Prep e registrar materiais/handoff no network | STAGED | — | Meeting Prep só trabalha com data/participantes confirmados e histórico verificável. |
| 9.6 | Auditar consistência final, atualizar relatórios/índices e fechar a missão com OR e commits remotos | STAGED | — | Não encerrar enquanto houver unidade em andamento, lock próprio ativo ou OR ausente. |

## Regra de atualização

Antes de assumir uma linha STAGED, sincronizar SCP e network, verificar atribuição/locks e atualizar a instância responsável. Para cada contato, confirmar o lock persistente do `network` antes de abrir ficha, reunião ou fonte. Após a conclusão, registrar o resultado e commit do `network`, liberar o lock em commit separado, atualizar esta lista e publicar o OR daquela unidade no SCP. Não trabalhar em mais de um `master_id` simultaneamente na mesma execução.
