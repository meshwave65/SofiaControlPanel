---
name: linkedin-ocint-mapper
description: Mapeamento profissional público e unitário de contatos oriundos do LinkedIn em repositórios Git concorrentes. Use para reconciliar a fila, verificar processamento prévio, adquirir lock exclusivo, pesquisar fontes públicas, persistir mapping/source register, atualizar índices, publicar checkpoints e liberar locks sem enviar mensagens.
---
# LinkedIn OCINT Mapper

Execute this workflow for public professional mapping of LinkedIn-derived contacts in a shared Git repository. Process **one contact at a time**. Never send messages, connection requests, or invitations; produce only reviewable artifacts.

## Mandatory safeguards

- Treat the remote repository as the source of truth. Synchronize and inspect it before selecting a contact.
- Never discard uncommitted work. Only use destructive reset/clean commands when the tree is clean and the clone is disposable.
- Skip contacts with an active lock or terminal status such as `DONE` or `REVIEW_REQUIRED`.
- Publish a persistent lock before researching. Never force-push or remove another agent's lock.
- Collect only public professional information needed for identity reconciliation. Exclude emails, phones, addresses, family data, and other sensitive personal data.
- Distinguish observed facts, self-descriptions, independent confirmations, and inference. Do not assign an organization's capabilities to a person without evidence.
- Open relevant source URLs; do not rely only on search snippets.

## Repository inputs

Locate the canonical index, source queue, contact directory, mission report, local protocols, and templates. Common paths are `contacts/INDEX.csv`, `network_master.csv`, `contacts/`, and `docs/reports/mission_state.md`. Preserve the existing schema, encoding, columns, and naming conventions.

## Unit workflow

1. Read local instructions such as `AGENTS.md`, OCINT protocols, templates, and the latest mission report.
2. Run `git fetch origin --prune`, inspect `git status --short --branch`, and review the remote head. If the tree is dirty, preserve and reconcile it before continuing.
3. Read the canonical index, source queue, and all `*/.processing.lock/owner.json` files. Start with the requested ID; if it is locked or terminal, select the next eligible contact in canonical order and record the skip.
4. Create `<contact_dir>/.processing.lock/owner.json` atomically with ID, name, agent, environment, UTC timestamp, base commit, `IN_PROGRESS` state, and scope. Commit and push the lock. If push fails, remove only the local lock, resynchronize, and reselect.
5. Research the exact public profile plus at least one relevant institutional or independent source. Resolve homonyms before associating facts.
6. Classify every source as origin record, primary public profile, institutional, or independent. Record the access date and limitations.
7. Write `mapping.md` and `sources/source_register.md` using the bundled templates. Set `DONE` only when identity is sufficiently reconciled; use `REVIEW_REQUIRED` for homonymy, conflict, or insufficient evidence.
8. Update the canonical index and mission report. Validate CSV structure, files, references, and `git diff --check`.
9. Commit and push only the contact artifacts, index, and report. Confirm the checkpoint exists remotely.
10. Remove the lock only after the checkpoint is remote. Commit and push the lock release, then verify a clean tree.
11. If continuous execution is explicitly requested, resynchronize and repeat with the next free contact. Maintain at most one lock owned by this execution.
12. Create and submit one `OperationalReport` for the execution using `skill-governance-oracle/templates/OperationalReport.template.md`. Record problems, workarounds, evidence limits, and concrete improvement proposals. Do not mark the task complete without linking the OR ID and artifact path.

## Queue decision logic

Use the index status, not folder existence alone. A partial folder with an active lock is a conflict. Treat an unexplained lock as active until the repository protocol explicitly authorizes expiry.

```text
sync_remote_safely()
locks = read_all_processing_locks()
index = read_canonical_index()
for contact in source_queue_in_order:
    if contact.id in locks: continue
    if index[contact.id].status in {DONE, REVIEW_REQUIRED}: continue
    choose contact
    break
```

## Evidence and output quality

Mark identity `RESOLVED` when the source URL matches a public profile with the same name and there is organization/cargo convergence or independent corroboration. If only an aggregator, homonym, or conflicting evidence exists, narrow the claim and use `REVIEW_REQUIRED`.

`mapping.md` must cover identity, role and organization, relevant trajectory, supported capabilities, self-declaration limits, privacy limits, operational status, and references. `source_register.md` must list source ID, observed fact, title, URL, type, publication date when visible, access date, and limitations. State that no sensitive data was collected and no message was sent.

## Failure handling

- On rejected push, fetch and inspect; never force-push.
- On another agent's lock, skip or follow an explicit expiry protocol; never remove it casually.
- On unavailable sources, record the limitation and seek an alternative; do not fill gaps by inference.
- On homonymy, use `REVIEW_REQUIRED` and explain the conflict.
- On malformed CSV, preserve existing fields and encoding; do not rewrite it with a reduced schema.

## Bundled resources

- Run `scripts/inspect_queue.py` for a read-only lock and next-contact inspection.
- Use `templates/mapping.template.md`, `templates/source_register.template.md`, and `templates/lock_owner.template.json` for consistent artifacts.
- Use `skill-governance-oracle/templates/OperationalReport.template.md` for the mandatory post-execution report when that shared skill is available.
