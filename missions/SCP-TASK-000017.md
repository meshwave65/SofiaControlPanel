# SCP-TASK-000017 — Orquestração de contatos e reuniões MWC / SOFIA-SWE

> Espelho operacional versionado do registro executável sofia.tasks. A fila e o estado técnico continuam tendo o Supabase como fonte de verdade. Este arquivo preserva contexto, proveniência e referências documentais.

## Metadata

| Campo | Valor |
|---|---|
| missionKey | SCP-TASK-000017 |
| taskId | 17 |
| source | SofiaControlPanel interface |
| creatorType | user |
| status | DONE |
| statusId | 4 |
| priority | Média |
| parentTaskId | — |
| githubPath | missions/SCP-TASK-000017.md |
| githubSyncStatus | synced (reconciliado em 2026-11-20) |
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
| 17 | Missão-pai | DONE | jBRYfAekVEyv269TeLJa8i (stopped) | 179 | OR-20261115-0051 |
| 22 | Análise estrutural | DONE | 4au9cD8MgDrbgYKw89XWDb (stopped) | 98 | OR-20261113-0003 |
| 23 | Análise operacional | DONE | YXHehMXwLV2M6AfjVCdmgj (stopped) | 52 | OR-20261114-0001 |
| 24 | Análise estratégica | FAIL | 2PxVMeo3St9sCMrxGcpMDM (error) | 26 | OR-20261115-0051 |

## Current reconciliation

- O pai foi reaberto em PAUSED porque sua conclusão registrada antecedeu a criação das filhas e não havia evidência de consolidação pai/filhas.
- Filhas 22 e 23 permanecem DONE; seus resultados e créditos históricos são preservados.
- Filha 24 permanece FAIL; não há resultado estratégico comprovado. Nenhuma nova execução foi iniciada.
- O TR retrospectivo v0.1.0 está aguardando validação humana; o Blueprint mestre ainda não foi derivado.
- Não houve dispatch, chamada Manus, consumo adicional de créditos ou ação externa.

## Snapshot de status reconciliado — 2026-11-20

O registro atual em `sofia.tasks` informa `DONE` (statusId 4, concluído em 2026-11-16 10:34:41 UTC), substituindo o snapshot anterior `PAUSED`. O histórico da intervenção de 15/11 e do evento de retomada pendente de 16/11 permanece preservado em `sofia.activityLogs`. O TR retrospectivo continua em `AWAITING_HUMAN_VALIDATION`; o estado operacional DONE não é evidência de aprovação humana do TR.

## Documents

- TR v0.1.0 DRAFT: missions/SCP-TASK-000017-TR-v0.1.0-DRAFT.md
- ORIGINAL_REQUEST v1: persistido no catálogo documental Supabase, documentId=1, versionId=1.
- TR v0.1.0: persistido no catálogo documental Supabase, documentId=2, versionId=2.
- OR de reconciliação pai/filhas: governance/operational_reports/OR-20261115-0051.md
- OR de auditoria documental: governance/operational_reports/OR-20261115-0052.md

## Synchronization note

A ausência histórica de GITHUB_PAT no Render permanece registrada como causa da falha automática original. Este arquivo foi reconciliado com o estado atual do Supabase; o registro operacional passa a apontar para o SHA vigente do arquivo e para githubSyncStatus=synced.

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

## Task decomposition, continuous synthesis and Message Manager reference — 2026-11-16

The operator's reference document [INTERAÇÃO CRIAÇÃO DE TAREFAS](https://docs.google.com/document/d/1wr-fgra5GOFmP_cVT7mJq5-hN1_WBkFIVi5xhjEEBp8/edit?usp=drivesdk) was read in full and its design implications were recorded in [OR-20261116-0054](../governance/operational_reports/OR-20261116-0054.md), sections 11–13.

Key principles captured from the reference:

- Task decomposition is recursive. A specialist may factor its own task into subtasks and thereby assume the manager role for those children.
- The parent creates its own draft with chapters/placeholders for delegated tasks and continuously monitors child drafts while developing its own report in parallel. It does not wait for child completion to begin synthesis.
- The parent's artifact structure expands as descendants create subtasks; the intended Genesis report integrates the full task and artifact hierarchy.
- The Message Manager distinguishes Message, Order, Response, Report and Create Task interactions. An Order is an operational intervention: the manager may suspend a child using `on_hold_bymanager`; the agent responds; the manager evaluates and releases; only then does the agent acknowledge and effectively resume.
- Manager release and agent resumption are separate events. A task must not be represented as actively resumed merely because the manager released it.
- The separate “who has the ball” metadata uses `0` (fulfilled), `1` (manager) and `2` (agent) in the intervention cycle described by the reference. These are responsibility metadata values, not task status codes.

The existing lifecycle decisions and this reference have not yet been reconciled against the current SCP status catalog, permissions model or implementation. No implementation, database change, TR approval, dispatch or external execution is authorized by this documentation update.

## Implementation audit — 2026-11-16

A static audit of branch `feat/sofia-cognitive-control-plane` against the operator's reference document and the decisions in OR-20261116-0054 was recorded in [OR-20261116-0055](../governance/operational_reports/OR-20261116-0055.md).

Main findings:
- The current implementation uses `STAGED` as automatic-dispatch eligibility, while the operator defines it as the unique genesis state before SCP assumption. Human-origin missions currently start in `PAUSED` and are promoted to `STAGED` after TR/Blueprint gates.
- No dedicated persisted “who has the ball” responsibility metadata was found.
- The current Messenger supports ordinary messages, read-only mission/eligibility tools and explicit forwarding of instructions; it does not implement the full Order → manager hold → agent response → manager release → agent acknowledgement/resumption protocol.
- Recursive factorization is explicitly blocked for tasks that already have a parent; inspection and consolidation operate on direct children.
- Consolidation is manual and flat; continuous monitoring/integration of child drafts into the parent's draft was not found.
- FR is absent from the initial document catalog, and the current TR specification's terminology/definition requires reconciliation with the operator's FR/TR distinction.
- No `remake_count` or persisted processing-cycle model was found in the inspected schema.

This is a static repository audit, not a production-state verification. No database, task status, TR, Blueprint, code, migration, Manus execution, credit balance or deployment was changed.

## Lifecycle specification draft — 2026-11-16

The consolidated lifecycle draft is [MISSION_LIFECYCLE_SPECIFICATION_DRAFT.md](../governance/architecture/MISSION_LIFECYCLE_SPECIFICATION_DRAFT.md). It separates lifecycle status, next-action responsibility, interaction events and processing cycles; records confirmed rules and open decisions; and remains non-normative pending explicit operator approval. No implementation is authorized by the draft.
