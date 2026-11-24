# MISSION LIFECYCLE SPECIFICATION — DRAFT

**Version:** 0.1.0-draft  
**Date:** 2026-11-16  
**Repository:** `meshwave65/SofiaControlPanel`  
**Status:** Draft for operator review — NOT normative / NOT approved for implementation  
**Related records:** OR-20261116-0054, OR-20261116-0055, mission SCP-TASK-000017  
**Reference:** Google Docs, “INTERAÇÃO CRIAÇÃO DE TAREFAS”

> This document consolidates the lifecycle design into one reviewable specification. It deliberately distinguishes confirmed operator rules from unresolved design decisions. No implementation, migration, production change or execution is authorized by this draft.

## 1. Purpose

Define a coherent lifecycle model for missions and tasks in SCP, covering:
- genesis and SCP intake;
- agent assignment and workspace/framework preparation;
- TR review and approval;
- execution, pause, intervention, release, resumption and closure;
- recursive task decomposition and manager/agent roles;
- continuous hierarchical artifact synthesis;
- explicit responsibility for the next action;
- immutable intervention history;
- full remake cycles without erasing prior work;
- FR, TR, Blueprint, OR and FOR document responsibilities.

The model must be implementable without inferring responsibility from message text or overloading unrelated status fields.

## 2. Normative language and evidence classes

- **CONFIRMED:** explicitly stated by the operator in conversation or the referenced document.
- **OBSERVED:** verified in the inspected repository implementation/documentation.
- **PROPOSAL:** a design structure suggested here to make the confirmed rules implementable; requires operator approval.
- **OPEN:** information not yet sufficiently specified. Must not be silently decided by implementation.

## 3. Four independent dimensions

A task record and its event history must keep these dimensions distinct:

### 3.1 Lifecycle status

Describes the operational condition/stage of the task. It is not a message type and is not, by itself, the complete responsibility assignment.

### 3.2 Next-action responsibility

Identifies the actor expected to perform the next action. It must be persisted explicitly and updated through authorized events. It must not be inferred from status prose, message content, `manusStatus`, or UI selection.

The reference document defines the “Com quem está a bola” values in its manager/agent intervention cycle:
- `0`: fulfilled;
- `1`: manager;
- `2`: agent.

**OPEN:** this numeric model does not explicitly define SCP and human operator responsibility during genesis, dispatch, TR approval, cancellation or other system-level transitions. The implementation model must support those actors without silently redefining the reference's 0/1/2 semantics.

### 3.3 Interaction/event

Represents what happened: Message, Order, Response, Report, Create Task, TR approval, TR review request, manager release, agent acknowledgement/resumption, pause, cancellation, completion, failure, remake authorization/start.

An event may cause a status and/or responsibility transition only when its type, actor, target, preconditions and permissions authorize that effect.

### 3.4 Processing cycle

Identifies whether the task is in its original processing cycle or a formally authorized remake. It is separate from lifecycle status and responsibility.

## 4. Genesis and SCP intake

### 4.1 Confirmed operator rules

1. Every newly created mission/task, whether created by SCP or an operator, is born in `STAGED`.
2. `STAGED` means genesis: the item has not yet been assumed by SCP and has no prepared workspace/framework.
3. SCP discovers eligible `STAGED` items and assumes/routes them to an eligible agent.
4. Once SCP has assumed a task, it must never return to `STAGED`.
5. `STAGED` must not be reused for TR approval, generic waiting, pause/resume or remake.

### 4.2 Required consequence

The current repository uses `STAGED` as automatic-dispatch eligibility and promotes human-created tasks to `STAGED` after TR/Blueprint gates. This conflicts with the confirmed genesis semantics (OR-0055).

**PROPOSAL:** separate “new/unassumed intake” from “prepared/approved for execution” in the lifecycle model. Do not choose final status keys in this draft. The dispatch mechanism must be redesigned so that claiming/assuming a genesis item is a one-way transition and later execution release uses a distinct state/event.

**OPEN:** confirm whether the SCP assumption event itself assigns the task to an agent immediately, or whether an intermediate SCP-owned preparation/assignment stage exists.

## 5. Workspace, framework and TR approval

### 5.1 Confirmed flow

1. Task is created in genesis (`STAGED`).
2. SCP assumes the task and routes/assigns it to an eligible agent.
3. The agent prepares the workspace and mission framework.
4. The agent creates the applicable initial documents, including TR draft and FR draft, and the task/artefact structure.
5. The task then awaits operator review/approval of the TR.
6. The operator either approves the specific TR version and authorizes execution, or requests revision.
7. A revision request returns the next action to the agent. The agent revises and resubmits; responsibility then returns to the operator for a new decision.

### 5.2 Approval invariants

- Approval must reference an exact document ID and version/hash.
- A Messenger text such as “TR aprovado” is not itself approval.
- Approval is a distinct, authenticated, authorized, auditable action.
- Approval must not erase historical external execution identifiers.
- Validation must distinguish a historical external task ID from an actively running external execution.
- Approval/review is not a return to genesis and must not reuse `STAGED`.

### 5.3 Status keys

`TR_PENDING` and `TR_REVIEW` remain working labels only. The final keys must be reconciled with the status catalog and the complete status dance supplied by the operator. This draft does not declare them approved.

## 6. Execution, pause, manager intervention and resumption

### 6.1 Reference interaction types

The Message Manager must support the interaction types described by the operator:
1. Message;
2. Order;
3. Response;
4. Report;
5. Create Task.

Availability and permissions depend on actor role, task relationship and current context.

### 6.2 Order protocol — confirmed reference behavior

1. Manager sends an Order to a managed task/agent.
2. The Order may include attached artefacts.
3. The original Order content is preserved as an immutable event; the recipient cannot edit/cancel the manager's original instruction.
4. The task enters `on_hold_bymanager`.
5. The next action belongs to the agent; the agent receives/acknowledges the Order and responds, optionally attaching artefacts.
6. After the response, the next action belongs to the manager.
7. The manager evaluates the response and may release the task.
8. Manager release and agent resumption are separate events.
9. After release, the next action belongs to the agent. The task is not considered effectively resumed until the agent acknowledges and records resumption.
10. The intervention cycle is fulfilled only after that agent acknowledgement/resumption event.

### 6.3 Responsibility values in this cycle

The reference's sequence is:
- manager issues Order → `2` (agent);
- agent responds → `1` (manager);
- manager releases → `2` (agent);
- agent acknowledges and resumes → `0` (fulfilled for this intervention cycle).

These values describe responsibility in the intervention cycle; they are not lifecycle status codes.

### 6.4 Open protocol details

The reference does not fully define:
- whether a task can receive multiple simultaneous open Orders;
- whether an Order can be withdrawn or superseded, and by whom;
- timeout/escalation if the agent does not acknowledge/respond;
- whether a manager may issue an Order to a descendant managed by another agent-manager;
- how operator intervention interacts with manager Orders;
- exact release status key and exact acknowledgement status key.

These must be decided before implementation. Do not silently substitute generic `PAUSED` or `PROGRESS` for the distinct manager-hold/release/acknowledgement semantics.

## 7. Recursive task hierarchy and delegated management

### 7.1 Confirmed rules

- The Genesis creates the level-0/root task and may create level-1 tasks from its roadmap.
- Each child records its direct manager as parent.
- A specialist agent may decide its own task requires decomposition.
- When it creates subtasks, it becomes their manager, while remaining the executor/specialist responsible for its own parent task.
- This can repeat at any depth; hierarchy is recursive, not fixed to one parent/child level.

### 7.2 Required invariants

- Every non-root task has one direct parent/manager task.
- Parent/child links must be acyclic.
- A task's manager role over its children is distinct from its executor identity on its own task.
- Decomposition must preserve the original scope and acceptance criteria; child scope must be traceable to the parent.
- Parent completion must account for all descendants and their required artefacts, not only direct children.
- Permissions to create, assign, pause, order, release and close descendants must follow the manager relationship and system policy.

### 7.3 Current divergence

The inspected orchestrator explicitly refuses to factorize tasks that already have a parent and queries/consolidates direct children. This is incompatible with recursive decomposition (OR-0055).

**OPEN:** confirm whether every specialist may create subtasks autonomously within its delegated scope, or whether some decomposition levels/actions require approval from the root operator/Genesis.

## 8. Continuous hierarchical synthesis and artefacts

### 8.1 Confirmed behavior from reference

- Parent creates its own draft while establishing the roadmap and task structure.
- Draft includes chapters/placeholders for delegated tasks.
- Parent monitors child drafts continuously while developing its own report in parallel.
- It does not wait for child completion to begin synthesis.
- This early monitoring lets the manager detect scope drift, missing work or inadequate development and intervene before wasting time/resources.
- When a child completes, parent integrates/adjusts its own draft; it does not start synthesis from zero.
- If a child creates descendants, the parent document structure expands to reflect the new hierarchy.
- Root/Genesis final report integrates the full task and artefact hierarchy.

### 8.2 Required behavior

- Track artefact identity, version, owner task, parent/descendant path, lifecycle state and provenance.
- Record which child artefact version was incorporated into which parent draft version.
- Updates must be incremental and traceable; do not silently overwrite parent-authored content.
- Detect new descendants and update the parent's structural placeholders/manifest.
- Parent can identify stale/missing child inputs and issue an Order or request revision.
- Completion of a child is not a prerequisite for parent draft development.

### 8.3 Open implementation decisions

- Event triggers and scheduling/frequency for monitoring child drafts.
- Conflict/merge behavior when parent and child change related sections concurrently.
- Whether synthesis is performed by the parent agent, a dedicated curator, or a system service.
- How to represent unresolved, rejected or superseded child artefact versions.
- Acceptance criteria for declaring the parent's synthesis complete.

## 9. Document model: FR, TR, Blueprint, OR and FOR

### 9.1 Definitions explicitly supplied by operator

- **FR — Final Report:** informational document, created at mission start as a draft and continuously consolidated through completion; excludes the operational portion.
- **TR:** similar to FR, but includes the operational portion of the mission.
- **FOR — Final Operational Report:** compilation of all ORs; operational in nature.

These definitions must not be collapsed into one document type.

### 9.2 Relationship and lifecycle

**PROPOSAL:** keep each document type independently identifiable and versioned. TR approval gates execution as specified by the operator. FR and TR evolve as drafts through the task hierarchy; ORs record discrete operational events/decisions; FOR consolidates ORs for the mission's operational closure.

**OPEN:** confirm the precise relationship between Blueprint and TR/FR, whether FR/TR are required for every task level, who authors each document, and whether child FR/TR drafts are embedded, referenced or both in parent documents.

### 9.3 Existing documentation conflict

**Historical naming clarification:** TR was originally named “Transactional Report”. It was subsequently renamed **Termo de Referência** at the assistant's suggestion, and the operator accepted and adopted that denomination as canonical. “Transactional Report” is historical provenance of the acronym, not a current alternative definition. Any remaining occurrence must be corrected to “Termo de Referência” while preserving this explanation where useful. Separately, the initial document catalog does not include FR; that catalog gap requires coordinated revision.

## 10. Remake and monotonic lifecycle

### 10.1 Confirmed operator rules

- Full remake is not a rollback and does not return the task to `STAGED`.
- Prior cycle remains preserved: workspace, documents, versions, ORs, messages, external IDs, credits/consumption and evidence.
- A remake creates a new processing cycle linked to the previous one.
- The active status visibly identifies the remake cycle using a derived prefix.
- `remake_count` is an integer, NOT NULL, default `0`.
- Original cycle: no prefix. First remake: `R1_`; second: `R2_`; nth: `Rn_`.
- Counter increments only when a full remake is formally authorized and started.
- TR review, incremental correction, pause and resume do not increment it.

### 10.2 Required invariants

- Each cycle has a stable identity and link to its predecessor.
- Historical artefacts/events/external execution identifiers remain immutable and queryable.
- Prefix is derived from `remake_count` plus the base lifecycle status; it is not a separate status catalog family.
- A remake requires explicit authorization, reason, scope and actor; it must be distinguishable from continuation.
- A failed or aborted remake remains in history; retry policy must not silently increment or reuse cycles.

### 10.3 Open decisions

- Whether remake applies to a single task subtree or necessarily the entire root mission.
- Whether child tasks inherit the root remake count or maintain independent cycle counters.
- How parent-child relationships across cycles are represented.
- What preconditions and approvals are required to authorize/start a remake.
- How external agents/workspaces are provisioned for the new cycle.

## 11. Monotonicity, pause and closure

A task may advance, pause, be cancelled, fail or complete according to authorized transitions, but must not return to an earlier lifecycle stage. Review is not genesis; pause/resume is not remake; remake is a new linked cycle.

**OPEN:** exact allowed transitions for ordinary pause, operator pause, manager hold, agent failure, cancellation, completion and reopening after closure must be captured in the final transition matrix. The reference and current repository do not yet provide one unified, conflict-free table.

## 12. Required event/audit model

Every lifecycle-changing event should be auditable with, at minimum:
- event ID and timestamp;
- task and processing-cycle IDs;
- event type;
- actor identity and actor role;
- target/recipient where applicable;
- previous and resulting lifecycle status;
- previous and resulting next-action responsibility;
- referenced message, document/version and attachments;
- authorization/precondition result;
- external execution reference where relevant;
- correlation/idempotency key.

This is a **PROPOSAL** for a minimum audit envelope. Exact storage design is open. Message content and lifecycle event must remain distinguishable even when one interaction produces both.

## 13. Transition matrix to complete before implementation

The final normative matrix must define, for every transition:
- source state;
- triggering event;
- authorized actor/role;
- preconditions;
- target state;
- next-action responsibility;
- side effects (workspace, artefact, external dispatch, credits);
- idempotency and duplicate-event behavior;
- audit record;
- failure/compensation behavior.

At minimum, rows are required for:
1. create mission/task;
2. SCP claim/assumption;
3. agent assignment;
4. workspace/framework preparation;
5. TR submitted;
6. TR approved;
7. TR revision requested;
8. agent resubmits TR;
9. execution released/started;
10. ordinary message;
11. manager Order and hold;
12. agent response;
13. manager release;
14. agent acknowledgement/resumption;
15. task decomposition;
16. child draft updated;
17. parent synthesis updated;
18. ordinary pause/resume;
19. cancel;
20. fail;
21. complete;
22. remake authorized;
23. remake started;
24. remake aborted/failed;
25. root mission closure/FOR consolidation.

No implementation should proceed on the basis of an incomplete transition table.

## 14. Decisions required from operator

The following are deliberately left open for explicit review:

1. **STAGED boundary:** Is SCP assumption/claim the exact event that ends genesis, or is there a separate SCP preparation/triage phase before agent assignment?
2. **Responsibility scope:** How should the reference's numeric 0/1/2 model coexist with SCP and operator as actors responsible for actions outside the manager-agent intervention cycle?
3. **Task creation authority:** Can a specialist autonomously create subtasks within its scope, or are there limits/approval gates?
4. **Remake scope:** Is remake always root-mission-wide, or can it apply to a task/subtree?
5. **Document applicability:** Are FR and TR required at every task level, or only at root/selected levels?
6. **Status vocabulary:** What is the complete original status dance and its canonical key list? Existing labels in the reference (`Open`, `in_progress`, `on_hold`, `done`, `on_hold_bymanager`, release/acknowledgement condition) must be reconciled with the repository's five seeded task statuses and auxiliary Manus statuses.

## 15. Approval and implementation gate

This draft becomes normative only after operator review and explicit approval. Following approval:
1. update the canonical architecture specifications and status catalog;
2. produce the complete transition matrix;
3. design schema/API/UI changes;
4. define migration/backfill and compatibility strategy for existing tasks, including task 17's historical Manus ID;
5. implement in small verified increments with tests;
6. only separately authorized actions may affect production, dispatch, external agents, credits or deployment.

**Current status:** Draft only. No production changes, no database changes, no task-state changes, no Manus dispatch, no credit consumption and no deployment.
