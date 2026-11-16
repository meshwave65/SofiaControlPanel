# SCP-TASK-000017 — Orquestração de contatos e reuniões MWC / SOFIA-SWE

> Espelho operacional versionado do registro executável sofia.tasks. A fila e o estado técnico continuam tendo o Supabase como fonte de verdade. Este arquivo preserva contexto, proveniência e referências documentais.

## Metadata

| Campo | Valor |
|---|---|
| missionKey | SCP-TASK-000017 |
| taskId | 17 |
| source | SofiaControlPanel interface |
| creatorType | user |
| status | PAUSED |
| statusId | 3 |
| priority | Média |
| parentTaskId | — |
| githubPath | missions/SCP-TASK-000017.md |
| githubSyncStatus | not_configured (registro não atualizado pela integração automática) |
| Manus Task ID histórico | jBRYfAekVEyv269TeLJa8i |
| Manus status histórico | stopped |
| Créditos históricos | 179 |

## Objective

Coordenar no SCP o fluxo de relacionamento profissional descrito na solicitação original, mantendo o repositório meshwave65/network como fonte canônica dos contatos e artefatos por projeto.

A correção de escopo de 2026-10-28 no Blueprint da MISSION_0009 restringe a continuidade dessa missão de governança a SOFIA/SWE. A referência MWC no título original é preservada como histórico; a trilha da moeda MWN pertence à MISSION_0011.

## Original description

Esta missão transfere para o SCP a coordenação de tarefas de relacionamento profissional para MWC e SOFIA/SWE. O SCP mantém a missão, a fila de tarefas e os Operational Reports. O repositório network continua sendo a fonte de verdade para identidade e mapeamento canônico de contatos, avaliações HH, índices de convergência, registros de reuniões, mensagens e materiais específicos dos projetos.

A missão não cria uma base paralela de pessoas. Cada contato conserva seu master_id e sua ficha única em network/contacts/. As avaliações devem permanecer independentes por projeto em network/projects/mwc/ e network/projects/sofia/. Não copiar biografias para o SCP.

## Parent/child lifecycle

| ID | Unidade | Estado atual | Execução externa histórica | Créditos históricos | Referência |
|---:|---|---|---|---:|---|
| 17 | Missão-pai | PAUSED | jBRYfAekVEyv269TeLJa8i (stopped) | 179 | OR-20261115-0051 |
| 22 | Análise estrutural | DONE | 4au9cD8MgDrbgYKw89XWDb (stopped) | 98 | OR-20261113-0003 |
| 23 | Análise operacional | DONE | YXHehMXwLV2M6AfjVCdmgj (stopped) | 52 | OR-20261114-0001 |
| 24 | Análise estratégica | FAIL | 2PxVMeo3St9sCMrxGcpMDM (error) | 26 | OR-20261115-0051 |

## Current reconciliation

- O pai foi reaberto em PAUSED porque sua conclusão registrada antecedeu a criação das filhas e não havia evidência de consolidação pai/filhas.
- Filhas 22 e 23 permanecem DONE; seus resultados e créditos históricos são preservados.
- Filha 24 permanece FAIL; não há resultado estratégico comprovado. Nenhuma nova execução foi iniciada.
- O TR retrospectivo v0.1.0 está aguardando validação humana; o Blueprint mestre ainda não foi derivado.
- Não houve dispatch, chamada Manus, consumo adicional de créditos ou ação externa.

## Documents

- TR v0.1.0 DRAFT: missions/SCP-TASK-000017-TR-v0.1.0-DRAFT.md
- ORIGINAL_REQUEST v1: persistido no catálogo documental Supabase, documentId=1, versionId=1.
- TR v0.1.0: persistido no catálogo documental Supabase, documentId=2, versionId=2.
- OR de reconciliação pai/filhas: governance/operational_reports/OR-20261115-0051.md
- OR de auditoria documental: governance/operational_reports/OR-20261115-0052.md

## Synchronization note

O registro Supabase informa githubSyncStatus=not_configured e erro histórico de ausência de GITHUB_PAT no Render. Este espelho foi publicado diretamente no repositório para preservar a continuidade documental; não foi alterado o estado de sincronização no banco nem alegada sincronização automática.

## Governance decisions captured during lifecycle diagnosis — 2026-11-16

During the diagnosis of TR approval and Messenger failures, the operator established lifecycle-design principles for the SCP. These are recorded as design decisions, not as implemented behavior:

- `STAGED` is the unique genesis state: every new mission, whether system-created or operator-created, starts there while awaiting workspace/framework preparation by the SCP. Once the SCP assumes the mission, it never returns to `STAGED`.
- After dispatch to an eligible agent, the agent prepares the workspace and framework (including TR and FR draft). The mission then indicates that the operator has the next action to approve the TR.
- The operator may approve the TR and release execution, or request a review that assigns the next action back to the agent. The status, not message-text inference, must identify who has the next action.
- The Message Panel is the interaction channel. Informational messages must be distinguished from operational interventions that cause authorized, auditable state transitions.
- The lifecycle is monotonic: a mission advances, may be paused/cancelled/closed under defined rules, but does not return to an earlier lifecycle stage.
- A full remake is a new processing cycle linked to the preserved prior cycle; it is not a return to `STAGED`, and it must remain visibly exceptional.
- `remake_count` is an integer initialized to `0` (not NULL). Each formally authorized and started full remake increments it. The displayed status reuses the ordinary state with a cycle prefix: `R1_`, `R2_`, …, `Rn_`. Reviews, corrections, pauses and resumptions do not increment it.
- Multiple remakes are a governance signal to investigate specification, acceptance criteria, instructions and agent/system orientation; they are not, by themselves, proof of intrinsic AI failure.

The labels `TR_PENDING` (awaiting operator approval) and `TR_REVIEW` (review requested from agent) are working names only. Their final keys and the complete transition matrix must be checked against the operator's existing status-dance and Message Panel specification before implementation.

**Operational Report:** [OR-20261116-0054](../governance/operational_reports/OR-20261116-0054.md).

These decisions do not change the current task status, validate the retrospective TR, authorize a dispatch, or authorize a new external execution. The task's existing technical and documentary states remain governed by the prior reconciliation records.
