---
name: skill-governance-oracle
description: Governança de skills compartilhadas, roteamento de tarefas, criação de skills ausentes e melhoria contínua por OperationalReports revisados por um Oracle Agent. Use para definir um catálogo de skills, registrar execuções, analisar sugestões de melhoria, versionar mudanças e distribuir skills entre instâncias ou contas.
---
# Skill Governance Oracle

Use this protocol to operate a shared catalog of skills and a controlled improvement loop. The control panel or lead agent remains responsible for routing and approvals; the Oracle Agent reviews evidence and proposes or applies bounded changes.

## Portability model

Treat a skill as a versioned package containing `SKILL.md` and optional `scripts/`, `references/`, and `templates/`. A skill under `/home/ubuntu/skills/` is reusable by agents that share that environment, but it is not automatically available to other accounts or isolated environments.

For cross-environment or cross-account use, publish the skill directory to a shared Git repository, artifact store, or exported `.skill` package. Pin a version or commit in the catalog. Do not assume that a local path is globally shared.

Recommended shared repository layout:

```text
shared-skills/
├── skills/<skill-name>/SKILL.md
├── skills/<skill-name>/scripts|references|templates/
├── registry/skills.csv
├── operational_reports/INDEX.csv
├── operational_reports/OR-YYYYMMDD-####.md
└── oracle/reviews/OR-YYYYMMDD-####.md
```

## Control-panel routing protocol

1. Normalize the task into domain, operation, inputs, output, tools, risk, and constraints.
2. Load `registry/skills.csv` and rank active skills by trigger description, domain tags, required inputs, and compatible tools.
3. Select the highest-confidence skill and record the selected skill/version in the task execution record.
4. If no skill reaches the configured threshold, inspect existing skills for a close match. If none is suitable, create a new skill through `skill-creator`, validate it, register it as `DRAFT`, and use it only when the task has sufficient procedural guidance.
5. If multiple skills match, choose the narrowest safe skill and compose additional skills only when their boundaries are explicit.
6. After execution, require an OperationalReport before marking the task complete.

Do not silently invent a skill. Record why an existing skill was insufficient and what reusable behavior the new skill covers.

## OperationalReport lifecycle

Create one OR per meaningful skill execution. Use the bundled template and assign a unique ID. Record:

- task and execution identifiers;
- selected skill, version, commit, and environment;
- objective, inputs, outputs, and tools;
- chronological execution summary;
- failures, deviations, and workarounds;
- evidence quality and unresolved uncertainty;
- concrete improvement proposals with priority and expected benefit;
- privacy, safety, or scope concerns;
- links to artifacts and commits.

Append a row to `operational_reports/INDEX.csv` with `or_id`, `task_id`, `skill_name`, `skill_version`, `status`, `oracle_status`, `proposal_status`, `created_at`, `reviewed_at`, `review_commit`, and `notes`.

Recommended OR statuses:

```text
CREATED → SUBMITTED → IN_REVIEW → ACCEPTED | PARTIALLY_ACCEPTED | REJECTED | NEEDS_MORE_EVIDENCE
```

Never overwrite an OR after submission. Amend it with a new version or add an erratum so the audit trail remains intact.

## Oracle Agent review

The Oracle Agent is an autonomous skill, not merely a reviewer role. When invoked, it scans `operational_reports/INDEX.csv` and the `operational_reports/` directory for ORs whose `oracle_status` is `PENDING` or `IN_REVIEW`, verifies that each referenced file exists, and processes the queue in risk-and-age order. It must not wait for the task agent to nominate a specific OR. For each OR:

1. Verify that the reported behavior and suggested improvement are supported by the execution evidence.
2. Separate a one-off operator error from a repeatable skill defect.
3. Check whether the proposal is compatible with the skill's scope, privacy rules, tool permissions, and portability model.
4. Classify each proposal as `ACCEPT`, `PARTIAL`, `REJECT`, or `DEFER` with rationale.
5. For accepted changes, write a review file, patch the skill in a branch or isolated worktree, update tests/templates, run validation, and bump the skill version.
6. Publish the implementation commit and link it in the OR index and skill registry.
7. For rejected or deferred proposals, preserve the rationale and define what evidence would change the decision.

After each review, update the OR index, write `oracle/reviews/<OR-ID>.md`, and continue to the next unprocessed OR unless a conflict, missing artifact, permission issue, or high-risk change requires escalation.

The Oracle must not make silent behavioral changes, remove safety controls to improve throughput, or merge a proposal without validation. High-risk changes require human approval even if the OR recommendation is strong.

## Versioning and registry

Use semantic versioning for shared skills: patch for wording/templates/tests without behavior change, minor for backward-compatible workflow improvements, and major for incompatible schemas or safety behavior. The registry should store name, version, status, source repository, commit/tag, trigger summary, owner, last OR, and validation result.

Keep a changelog in Git history rather than duplicating long narratives in `SKILL.md`. Store detailed reasoning in Oracle review files and ORs.

## Oracle decision record

Each review file must state: OR ID, skill/version reviewed, evidence checked, proposals considered, decision per proposal, risk assessment, implementation commit or reason for non-implementation, tests run, new version, and follow-up metric. The decision must be reproducible by another agent.

## Continuous improvement guardrails

- Prefer changes supported by repeated OR evidence over isolated preferences.
- Do not optimize only for speed; preserve correctness, privacy, source traceability, and concurrency safety.
- Keep generated artifacts and registry edits atomic and reviewable.
- Measure whether an accepted change actually reduced the reported failure in later ORs.
- If a skill repeatedly requires major exceptions, split it or create a more suitable skill instead of endlessly expanding it.

## Bundled resources

- `templates/OperationalReport.template.md` — execution report.
- `templates/oracle-review.template.md` — Oracle decision record.
- `templates/skills.registry.csv` — skill catalog schema.
- `templates/operational_reports.index.csv` — OR tracking schema.
- `scripts/list_oracle_queue.py` — read-only OR queue inspection.
