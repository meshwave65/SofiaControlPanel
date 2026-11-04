---
or_id: "OR-20261104-0001"
task_id: "MISSION_0017-17.1-referral-onboarding-reconciliation"
skill_name: "operational-task-lifecycle|supabase"
skill_version: "0.2.0-DRAFT|0.1.2"
skill_commit: "SCP main 1dce6ee64dc020b4f448115a7386d891c8942318; Supabase skill runtime"
agent: "ChatGPT"
environment: "GitHub connector; repository read-only inspection"
status: "SUBMITTED"
oracle_status: "PENDING"
proposal_status: "NONE"
created_at: "2026-11-04T22:00:00-03:00"
---

# OperationalReport — OR-20261104-0001

## Objective
Registrar MISSION_0017 e iniciar reconciliação de arquitetura para referral, onboarding minimalista, percentual configurável e três créditos UMS após depósito validado.

## Inputs, outputs, tools
- Inputs: SCP AGENTS.md, GOVERNANCE.md, operational-task-lifecycle, skill registry/template; newsite current source and UMS accounting documentation.
- Outputs: mission, TASKS, blueprint and OR in branch mission/0017-referral-onboarding-ums.
- Tools: GitHub read-only inspection; Supabase skill. No database query or mutation.

## Execution summary
1. Read SCP operating directions and lifecycle.
2. Read skill registry. operational-task-lifecycle is DRAFT; no active catalog skill specifically covers this product feature. Selected bundled Supabase skill 0.1.2 for database/Auth/RLS.
3. Reconciled mission numbering: MISSION_0016 is latest, chose 0017.
4. Created dedicated SCP branch based on main commit 1dce6ee64dc020b4f448115a7386d891c8942318.
5. Inspected newsite files: src/pages/SimpleOnboarding.jsx, src/main.jsx, docs/modelo-contabil-ums-mwn.md, docs/audit/mwn-exchange-readiness.md and UMS migrations dated 2026-11-04.
6. Evidence: current onboarding /simple asks username, optional phone/document and does not save referral; current create_ums_acquisition requires mwc_meshwalker_profiles; admin_decide_ums_acquisition credits UMS after validation.
7. Specified three separate credit events after validation, each paired with Genesis debit, with snapshot percentage, idempotency, atomicity and anti-self-referral.
8. No product code, DB schema, balances or blockchain modified. Mission files remain in SCP feature branch pending PR.

## Problems and workarounds
- No existing referral blueprint found in retrieved project materials: authored initial blueprint from user’s direct requirements, separating unresolved technical gates.
- Minimal signup conflicts with the current acquisition RPC's fiscal-profile prerequisite: recorded as first reconciliation item; no validation bypass.
- SCP main has no branch protection enabled according to the branch endpoint; used dedicated branch and PR workflow rather than writing to main.

## Evidence and uncertainty
Verified: accounting ratio 1 MWN=1,000 UMS; up to 6 decimals; validated payment required before credit; Genesis-origin UMS ledger; legacy /simple onboarding does not capture referral.
Unknown: exact profile/acquisition schemas, RLS/policies/grants, acquisition UI flow, admin validation panel, atomic support for 3 chain appends, and existing configurable bonus data. Not yet inspected.
No production actions or external communications.

## Improvement proposals
- P-001: Add a durable referral relation and unique constraints around eligible acquisition/reward. Benefit: auditable and retry-safe. Risk: additive schema migration. Priority P0; backward-compatible if additive.
- P-002: Snapshot applied percentage/rule per eligible acquisition. Benefit: no retroactive recalculation. Risk: configuration authority. Priority P0; additive.
- P-003: Encapsulate three chain events and ledger pairs in one transactional function. Benefit: no partial credit. Risk: SECURITY DEFINER and lock design. Priority P0; requires validation.

## Privacy, safety, scope review
No secrets or unnecessary personal data copied. No schema, production balance, chain or Auth changes. Preserve admin validation and prohibition of peer-to-peer UMS transfers.

## Oracle handoff
Review the initial blueprint and 17.1 scope; verify one global configurable percentage with acquisition snapshot; confirm transaction model for three events; evaluate the fiscal-profile prerequisite. All recommendations remain proposals, not implemented.
