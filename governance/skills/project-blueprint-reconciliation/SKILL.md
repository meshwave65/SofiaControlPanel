---
name: project-blueprint-reconciliation
description: Reconcile project renames, scope drift, and competing source-of-truth documents across versioned repositories. Use before outreach or project-specific assessment when identifiers, names, paths, or authoritative blueprints conflict.
---

# Project Blueprint Reconciliation

Use this skill to establish what is known, what changed, which artifact is authoritative, and what must remain blocked when a project name or scope diverges across repositories. Do not use it to invent or approve product, legal, economic, or technical decisions.

## Workflow

1. **Confirm mandate and boundary.** Read repository instructions, the formal task, and the project's current mission/blueprint. Record who supplied any rename or scope correction, when, and whether it is an instruction, approved decision, or merely a proposal.
2. **Reconcile remotes.** Fetch the canonical branches, inspect worktree/commits, indices, active assignments, locks, and relevant meeting records. Preserve concurrent work. Follow meeting-first routing when the project mission requires it.
3. **Inventory relevant artifacts.** Locate project READMEs, normative and role-specific blueprints, decision logs, requirements matrices, source registers, project paths, historical reports, and named implementations. Read documents that could affect scope; record their commit, version/date, status, and claims.
4. **Build an evidence ledger.** Separate: (a) owner instruction, (b) approved decision with accountable approver, (c) versioned project document, (d) historical/legacy material, (e) implementation/test evidence, and (f) inference or unknown. A newer name does not automatically supersede technical or commercial definitions.
5. **Map names to meanings.** Determine whether the change applies to the whole product, one asset/module, a legal entity, a code/project path, or only user-facing terminology. Do not globally replace strings where the token may denote distinct things. Distinguish display name, canonical identifier, historic alias, parent project, and subproject.
6. **Choose a non-destructive source-of-truth treatment.** If evidence supports a bounded, reversible mapping, document it with effective date, scope, provenance, links, and explicitly excluded claims. Keep legacy files intact; add a notice/crosswalk rather than mass rename. Create a new canonical directory only when the mission or owner instruction requires a distinct scope and the path does not duplicate an existing authoritative artifact.
7. **Do not fill approval gaps.** If the change would alter purpose, utility, requirements, economic model, architecture, maturity, risk, eligibility, or commitments, record the exact decision needed and the approving role. Leave the blueprint as draft/blocked until approval. Do not run downstream assessment or outreach against unresolved scope.
8. **Persist minimal linked artifacts.** Update the project source-of-truth index/README and cross-reference affected legacy documents. Do not edit historical evidence or imply migration validated it. Update a formal decision log, requirements matrix, or version only if the repository's own change-control rules require it and the decision is actually approved.
9. **Validate and hand off.** Check links, paths, version/status labels, CSV schemas, git diff, and remote commits. Record unresolved questions, the safe next action, and any blocked downstream roles. Create a task-specific Operational Report where required.

## Minimum output

Use a concise reconciliation note with:

- current canonical name and source of the name instruction;
- what the old name refers to in each relevant artifact/path;
- artifact inventory with version/date/status and scope;
- a name/path crosswalk, including preserved historical locations;
- explicit facts, owner assertions, inferences, and unknowns;
- exact unresolved decisions and who must approve them;
- downstream actions permitted, blocked, or requiring review;
- changed files, commits, and validation results.

## Safety constraints

- Never infer legal ownership, trademark availability, token issuance, tradability, price, liquidity, conversion, yield, backing, investor rights, security, performance, adoption, or product maturity from a rename or internal document.
- Never turn a draft, proposal, roadmap, or self-reported claim into an approved specification.
- Preserve historical records and provenance; do not overwrite old names or silently reinterpret old assessments.
- Do not send messages, invite contacts, or make commitments. A reconciliation skill has no communication authority.
- Avoid unnecessary personal data; project-source audit should normally use project artifacts, not individual contact records.
- When an authoritative decision is missing, produce a useful bounded audit and stop at the approval gate rather than guessing.
