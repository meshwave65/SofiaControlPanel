---
name: network-contact-orchestration
description: Coordinate authorized MeshWave contact-engagement missions whose canonical people and project artifacts live in the network repository. Use when routing work among Meeting Prep, OCINT, HH, and Secretary; always check confirmed meetings first.
---

# Network Contact Orchestration

## Scope

Use this skill to route and track a contact-engagement mission from SofiaControlPanel (SCP) while preserving `meshwave65/network` as the source of truth for canonical contacts, project convergence, communication records, and meeting materials. Follow the active mission blueprint and the role-specific protocols in `network/docs/protocols/agents/`. This skill is a coordinator, not a replacement for OCINT, HH, Secretary, or Meeting Prep instructions.

## Preflight

1. Read SCP `AGENTS.md`, the mission blueprint, the task list, and `governance/registry/skills.csv`. Record the chosen skill/version/commit for the Operational Report (OR).
2. Fetch the relevant repositories and inspect branches, uncommitted changes, mission state, project indices, prior reports, and remote contact locks. Preserve other agents' work.
3. Confirm the project scope and its authoritative blueprint. If the blueprint is missing or materially ambiguous, record a block; do not invent requirements.
4. Check the relevant project meeting directories before assigning a new contact task. A directory name or proposed date alone does not prove a confirmed appointment.

## Routing order

- **Upcoming meeting explicitly confirmed:** route that contact/project to Meeting Prep first. Confirm date, time, participants, and confirmation evidence in existing records. Follow `network/docs/protocols/agents/MEETING_PREP.md`; reuse the canonical mapping, HH report, communication history, and meeting templates. Update the existing meeting folder; do not create parallel materials. Keep credentials out of Git. Do not represent an untested demonstration as working.
- **Only a tentative proposal, `date-pending` placeholder, or past meeting:** do not treat it as a future confirmed meeting. Check whether a documented, authorized Secretary follow-up is due; otherwise continue the contact queue.
- **No upcoming confirmed meeting:** inspect the canonical contact record. Use OCINT only when identity, record completeness, or a material public-professional evidence gap requires it. Reuse adequate records and never duplicate a biography. Then route to HH for project-specific convergence.
- **After HH:** Secretary may prepare a personalized draft only when the applicable project rules permit it. Sending, inviting, or scheduling requires explicit human authorization and an authorized channel. Record only observable events and confirmed responses.
- **After a meeting is confirmed:** route back to Meeting Prep before starting another activity for that same contact.

## HH requirements

Read the target project's blueprint, README, convergence protocol, and prior assessment before research. Evaluate each project independently; a result for one project never transfers to another. Apply the current `NOT/LOW/MID/HIG/ALL` scale by project and segment. Under mutual-convergence protocol v0.3.0, any MID/HIG/ALL must connect a concrete current project front and stage with the contact's current, person-specific professional activity, a verifiable intersection, plausible benefit for both sides, and uncertainty for the contact to confirm. Generic credentials, historical experience, employer capability, or network assumptions are insufficient.

Use public professional sources only as needed to resolve a material gap. Separate verified facts, self-reported claims, inference, and unknowns. Do not collect sensitive or private information. Do not send messages as part of OCINT or HH.

## Contact locks and persistence

1. Process only one `master_id` at a time per agent. Before opening contact-specific profiles, communication history, or meeting content, inspect all relevant remote refs for an existing lock.
2. Acquire the canonical lock atomically at `contacts/<master_id> - <name>/.processing.lock/owner.json`, with the contact ID, agent/environment, UTC timestamp, base commit, `IN_PROGRESS` state, and scope. Commit and push the lock to `origin/main`; verify it remotely before continuing.
3. If a lock exists, a push fails, or identity/scope conflict makes the work unsafe, stop without researching or editing that contact. Never overwrite or remove another agent's lock.
4. Persist only the correct role's artifacts in `network`, validate them, and confirm the result in `origin/main` before removing the lock in a separate commit. Update applicable project indices and mission state without duplicating the canonical biography.
5. Update the SCP task status and create one OR per meaningful task execution. Use the official OR template, a unique ID from the SCP index, `oracle_status: PENDING`, and a traceable commit. Never include credentials or unnecessary personal data in the OR.

## Handoff

Record the contact ID, project(s), role performed, meeting status, outcome, artifact paths, remote commit(s), lock acquisition/release commits, unresolved items, and the next eligible task. Distinguish a prepared draft from a sent message and a tentative meeting from a confirmed meeting. Do not close a mission while its applicable work or OR remains unpublished.
