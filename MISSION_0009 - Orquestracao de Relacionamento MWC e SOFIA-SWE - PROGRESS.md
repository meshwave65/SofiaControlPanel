# Missão 0009: Orquestração de Relacionamento MWC e SOFIA-SWE

**ID:** 0009
**Status:** PROGRESS
**Objetivo:** Transferir ao SofiaControlPanel (SCP) a coordenação da sequência de mapeamento, convergência, comunicação e preparação de reuniões para MWC e SOFIA/SWE, mantendo `meshwave65/network` como repositório canônico dos contatos e artefatos de projeto.

## Descrição

A missão coordena os agentes OCINT, HH, Secretary e Meeting Prep em torno de contatos já existentes na base compartilhada do `network`. Cada execução deve começar verificando se há reunião futura confirmada. Se houver, Meeting Prep tem prioridade. Caso contrário, a fila segue OCINT quando a ficha canônica precisar de criação/reconciliação, HH para a avaliação por projeto, Secretary somente após autorização humana de comunicação, e Meeting Prep após confirmação de uma reunião.

As duas avaliações-alvo são independentes: MWC e SOFIA/SWE. A ficha profissional continua única em `network/contacts/`; os relatórios, índices, mensagens e materiais de reunião permanecem em `network/projects/`. O SCP guarda este plano, o status das tarefas e os Operational Reports.

## Esclarecimento de escopo — 2026-10-28

O responsável informou que a criptomoeda anteriormente chamada MWC passou a se chamar MWN. A partir desta correção, a convergência, comunicação e preparação de reuniões relativas à moeda são roteadas por `MISSION_0011` e não devem continuar usando avaliações/minutas MWC como atuais. `MISSION_0009` permanece com o escopo SOFIA/SWE; referências MWC antigas abaixo são histórico, não autorização para prospecção da moeda.

## Blueprint e controle

- Blueprint operacional: [`governance/missions/0009/BLUEPRINT.md`](governance/missions/0009/BLUEPRINT.md), versão 0.1.0.
- Tarefas: `MISSION_0009 - TASKS - PROGRESS.md`.
- Repositório canônico de execução: `https://github.com/meshwave65/network`, branch `main`.
- Agente atualmente responsável: Manus AI; outros agentes devem consultar primeiro o estado remoto desta missão e os locks no `network` antes de assumir uma unidade.

## Roteamento inicial

A verificação inicial confirmou reunião SOFIA/SWE de `NW-LI-0023 — Renato Barros` em 06/11/2026, das 16:00 às 16:45 (`America/Sao_Paulo`), por videoconferência. O briefing existente foi revisado e considerado suficiente; o inventário de materiais registra as pendências de demonstração. A checagem ocorreu sob lock remoto, persistido no commit `a28e74c`; o checkpoint está em `1890bb9` e o lock foi liberado em `aac1d90`. Não houve nova mensagem, leitura de canal ou alteração de agenda.

## Estado de retomada

No snapshot consultado da branch `main` do `network` (`bf9728054a89002d4b0e1050e29e9406c8666f10`), a última sequência revisada segundo o protocolo de convergência mútua v0.3.0 alcançava `NW-LI-0086`. `NW-LI-0087 — Bruno Diogo` é o próximo candidato observado para reavaliação MWC/SOFIA-SWE, mas deverá ser confirmado novamente após concluir a prioridade de reuniões. `NW-LI-0153` aparecia com lock ativo e não pode ser processado enquanto esse lock persistir. `NW-LI-0091` permanece excluído conforme instrução anterior, até que o usuário altere essa regra.

Nenhuma mensagem foi enviada por esta missão. O envio pelo Secretary requer autorização humana explícita e confirmação observável no canal. A missão só será encerrada após atualizar o estado do `network`, concluir as etapas aplicáveis, publicar os ORs e validar os commits remotos.
