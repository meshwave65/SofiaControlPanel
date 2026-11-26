# MISSION_0033 — DDL Structural Audit

**Date:** 2026-11-26  
**Source:** MeshWave65 / `ufylccbdjfzydbwhpmpp` / schema `sofia`  
**Target:** Sandbox / `detstgxofjnnggxluqtl` / schema `sandbox`  
**Method:** Read-only catalog comparison through PostgreSQL information_schema and pg_catalog. No source writes.

## Result

The 25 source base tables are present in the target. The target has one additional base table, `sessions`, required by the Sandbox lifecycle. No source base table or source base-table column is missing.

| Object | Source | Target | Difference |
|---|---:|---:|---|
| Base tables | 25 | 26 | + `sessions` |
| Base-table columns | 272 | 308 | +36 Sandbox/session fields |
| Enum labels | 6 | 6 | Identical |
| Constraints | 109 | 134 | +25 Sandbox/session constraints |
| Indexes | 88 | 110 | +22 Sandbox/session indexes |
| Triggers (event rows) | 12 | 82 | Sandbox lifecycle/session triggers; 3 source dispatch event rows intentionally absent |
| Functions | 11 | 15 | Sandbox session lifecycle functions; dispatch/RLS helpers intentionally differ |
| Sequences | 25 | 25 | Same names and owner |
| Views | 1 | 1 | Same view name, Sandbox-specific projection |
| RLS-enabled base tables | 25/25 | 26/26 | All enabled |
| RLS policies | 22 | 0 | Deliberate fail-closed backend-only model |

## Column differences

- All 272 source base-table columns exist in the target.
- The 36 target-only columns are Sandbox-specific:
  - `sandboxSessionId` on session-owned records;
  - `agents.agentOrigin`, `agents.sourceAgentId`;
  - nullable `agents.ownerId` for shared catalog rows;
  - `users.activeSandboxSessionId`;
  - the 16 columns of `sessions`.
- `agents.ownerId` is nullable only in the target, required for `SCP_CATALOG` rows with no per-user owner.
- Enum defaults differ only in schema qualification (`sofia.*` vs `sandbox.*`); enum labels are identical.

## Constraints and indexes

- All 109 source constraints are present in the target.
- The 25 additional target constraints are the session foreign keys, session lifecycle checks, and agent-origin/identity checks.
- All 88 source indexes are present in the target.
- The 22 additional target indexes support session ownership and session-scoped access.

## Triggers and functions

- The source's two task-dispatch event rows and one message-dispatch event row are intentionally not installed in Sandbox. External automatic dispatch remains disabled.
- The target adds session assignment, session synchronization, TTL, close and purge dispatch behavior.
- Source RLS helper functions (`can_access_task`, `current_user_id`, `is_admin`) are not copied because target RLS has no client policies and all protected application access is server-mediated.
- Target-only functions implement session lifecycle and session assignment.
- Two common functions are intentionally extended so immutable mission-document evidence can still be deleted during an authorized session purge:
  - `reject_mission_document_version_mutation`
  - `validate_mission_action_unit_gate_evidence`

## RLS, grants and ownership

- Source: 25/25 tables have RLS enabled and 22 policies.
- Target: 26/26 tables have RLS enabled and zero policies. Direct anon/authenticated access therefore remains denied.
- Target application DML grants are restricted to the server-side `sandbox_app` role; the role has schema/table privileges and BYPASSRLS. `postgres` retains ownership. No authenticated/anon table grants were copied.
- All source tables, sequences and the view are owned by `postgres` in both schemas.

## View difference

The view `agent_catalog_public` exists in both schemas. The target view intentionally:
- maps `sourceAgentId` to the source catalog identifier;
- filters to `agentOrigin='SCP_CATALOG'`;
- omits `description`.

The Sandbox application currently reads the catalog through the protected backend, not through this view. The omission of `description` is retained as a privacy-minimizing projection; the replicated catalog descriptions remain null.

## Agent catalog validation

- Source agents: 19.
- Target `SCP_CATALOG` agents: 19.
- Every source ID has exactly one matching `sourceAgentId` in target.
- Names, versions, status and connection status match.
- Target descriptions are null (source descriptions contain account labels/email identifiers).
- Source credential counts: 19 accounts, 19 passwords, 19 tokens.
- Target catalog credential counts: 0 accounts, 0 passwords, 0 tokens.

This confirms that the catalog was replicated without copying account credentials or tokens.

## Conclusion

The table/column/constraint/index/sequence/ownership baseline is structurally aligned. The differences are intentional Sandbox isolation and lifecycle controls, plus the documented view projection and the deliberate omission of production dispatch and direct-client RLS policies.

This audit does **not** prove the Render service is connected to this target database. Runtime endpoint verification is tracked separately in OR-20261126-0004.
