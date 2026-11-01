---
name: meeting-preparation-dossier
description: Produces complete, individualized meeting-preparation dossiers beyond a README or agenda: participant intelligence, project convergence, argument ladder, talk track, evidence and claims, demo plan, visual support, objections, next-step paths, and persisted quality-checked artifacts. Mandatory whenever Meeting Prep is assigned.
---

# Meeting Preparation Dossier

## 1. Purpose and completion standard

Prepare the project owner to conduct a specific meeting with command of the participant context, a coherent argument, verifiable evidence, and usable supporting materials. The output is a complete meeting dossier, not merely a calendar record, README, agenda, or generic list of questions.

A task is complete only when:
- participant identity, project, scope, and meeting status are resolved;
- professional intelligence relevant to the meeting is documented with traceable sources and limitations;
- the participant-to-project convergence is individualized and evidence-based;
- the conversation strategy and argument ladder are ready for oral use;
- the core written materials have actually been produced and persisted;
- visual/presentation needs have been addressed, with a justified decision to create or omit them;
- claims, product maturity, demonstrations, and logistics have been checked for accuracy;
- the meeting folder provides a working index to the deliverables;
- unresolved items and owner decisions are explicit.

Creating only a README, filling date/time, copying generic questions, listing files that do not exist, or writing “materials to prepare” is not completion.

## 1.1 Reprocess previously prepared meetings

Whenever this skill is introduced, materially revised, or an owner identifies that an existing meeting package was not adequately produced, all affected meetings previously labeled prepared/complete must be reopened and reprocessed.

Set the operational state to `PENDING_REPROCESSING` until the new quality gate passes. Existing README files, agendas, briefings, and reports are historical inputs only; their existence or previous completion label does not satisfy this skill.

For each affected meeting:
1. inventory every existing file and classify it as reusable, stale, incomplete, unsupported, or historical;
2. preserve historical material and provenance; do not silently delete or overwrite it;
3. reread the current blueprint, participant mapping, evidence, and meeting logistics;
4. rebuild the dossier against the full requirements in this skill, not merely patch the previous agenda;
5. produce and persist missing supporting artifacts, including executive brief, talk track, evidence/claims, demo plan, discovery questions/objections, and conditional next steps as applicable;
6. validate every relative link, claim, source, maturity statement, and deliverable;
7. update the meeting README with a file-by-file status and only mark `COMPLETE` after the quality checklist passes.

A reprocessing batch must list every affected meeting and its state. If a meeting cannot be reprocessed because of an active writer lock, missing identity, inaccessible evidence, or a human decision, leave it explicitly pending/blocked and record the exact dependency. Do not claim that the batch is complete while any affected meeting remains pending or blocked.

## 2. Authority and mandatory inputs

Before authoring, read:
1. the central governance/ARCHAEOLOGICAL_CONTEXT.md and relevant current operational guidance;
2. repository root instructions and the general agent workflow;
2. the specific Meeting Prep role protocol;
3. the current authoritative project blueprint and product-stage documentation;
4. the canonical contact mapping and source register;
5. the HH convergence report and any scope decisions;
6. actual communication history and meeting evidence;
7. existing meeting templates and prior artifacts;
8. the existing folder for this exact meeting.

Precedence:
1. latest explicit owner instruction within authorized scope;
2. current project blueprint for scope, claims, and technical maturity;
3. primary calendar/communication evidence for logistics;
4. canonical mapping and professional sources for participant facts;
5. HH assessments and prior documents, which require revalidation;
6. folder names, placeholders, and inference, which are never proof.

Do not silently reconcile material conflicts. Preserve history, document the conflict, and ask only for the clarification necessary to proceed. Never assign a meeting to a person merely because their first name matches.

## 3. Identity and logistics gate

Create a control record containing:
- project and blueprint version/commit;
- canonical contact ID and full name;
- stated purpose of the meeting;
- date, local time, timezone, duration, format, location/link, and participants;
- evidence/source for each logistical field and its confirmation level;
- state: MEETING_CONFIRMED, MEETING_PROPOSED, PREPARATION_PRELIMINARY, MEETING_COMPLETED, or BLOCKED_IDENTITY.

Rules:
- A confirmed meeting requires explicit evidence or an unequivocal owner statement. Distinguish owner confirmation from an external calendar lookup.
- A folder name, date-pending placeholder, unaccepted invitation, or isolated date is not proof.
- If identity is ambiguous, block individual personalization, do not choose a candidate by guess, and request disambiguation.
- If only some logistics are missing, continue safe strategic preparation and mark missing fields; do not unnecessarily block the whole dossier.
- If the meeting is only proposed, create preliminary material only when explicitly requested and label every artifact PRELIMINARY.
- Meeting Prep never sends messages, edits calendar events, confirms attendance, or negotiates schedules.

## 4. Participant intelligence

Build a meeting-oriented professional profile, not an indiscriminate biography:
- current professional role and trajectory, with dates where available;
- directly relevant skills and experience;
- current initiatives, products, publications, clients, research, or activities that support convergence;
- relevant organizational context, distinguishing organizational capability from the participant's personal mandate;
- concrete intersections with the target project;
- gaps, contradictory signals, and unverified data;
- what the participant is demonstrably likely to know, only when supported;
- discovery questions to validate hypotheses about priorities.

For every material claim, record source, publication/access date, and confidence. Prefer primary and professional sources. Do not infer interest, budget, decision authority, availability, investment intent, endorsement, or need from title, reputation, or employer.

Classify statements as VERIFIED FACT, CONTACT/ORGANIZATION STATEMENT, PROJECT-OWNER STATEMENT, WORKING INFERENCE (with rationale and confidence), or UNKNOWN/TO VALIDATE. If a source is unavailable, record that limitation; do not silently replace it with an assumption.

## 5. Translate the blueprint into meeting narrative

Extract without modifying the blueprint:
- problem and target user;
- value proposition;
- actual maturity: concept, prototype, MVP, or operation;
- capabilities actually implemented;
- tests and observed results, including method and limits;
- dependencies, risks, and gaps;
- commercial/operational hypotheses not yet validated;
- the ask or next step allowed by the meeting objective.

Create a claims-and-evidence matrix with columns: permissible claim, concrete evidence, maturity state, qualification/limit, and where it will be used.

Never elevate a hypothesis to fact, local test to production operation, simulation to commercial result, mockup to working feature, or architectural intention to implementation. If documents disagree, identify the conflict and follow the current authoritative source.

Adapt the narrative to the participant:
- begin with a verifiable professional problem or area of relevance;
- explain why the conversation may be useful to both sides without presuming interest;
- use only the necessary level of jargon and define essential acronyms;
- distinguish what the meeting seeks to discover from what it presents;
- do not mix projects, assets, products, or offers without explicit authorization and demonstrable relevance.

## 6. Argument ladder and talk track

Produce a sequenced argument with transitions and purpose:
1. opening and context;
2. specific reason for speaking with this participant;
3. concrete problem and user/organizational impact;
4. value proposition and operating mechanism;
5. available evidence and demonstration;
6. limitations, risks, and items under validation;
7. discovery and validation questions;
8. next step compatible with maturity and meeting purpose;
9. closing, synthesis, and confirmation of what was actually agreed.

For each stage include the spoken core message, supporting evidence/material, question or transition, indicative duration, signal to observe, and statements that must not be made.

Use a minute-by-minute agenda only when duration is confirmed. Otherwise use relative blocks without inventing timing.

## 7. Objections and defensible responses

Anticipate objections only as preparation hypotheses, never as opinions attributed to the participant. For each include:
- possible objection/question;
- why it may arise;
- concise honest response;
- supporting evidence;
- limitation or missing information;
- follow-up question to understand the actual concern.

Cover technical, economic, operational, regulatory, security, privacy, adoption, and governance issues when relevant. If no verified answer exists, prepare a candid response such as: “This has not yet been validated; the required test would be…”. Never improvise a promise.

## 8. Required deliverable package

Use the existing meeting directory. Do not move, duplicate, or overwrite historical artifacts. Follow current repository naming conventions.

### A. README.md — operational index

Must contain identity, project, confirmed logistics, preparation status/date, blueprint version, relative links to every deliverable, each artifact's status (complete/partial/pending/blocked), and owner-dependent open items.

### B. meeting_prep.md — main strategic dossier

Must contain executive summary and objective; relevant participant profile; participant/project convergence and reason for meeting; claims/evidence/maturity matrix; argument ladder; talk track and questions; objections and defensible answers; demo plan and fallback; minimum outcomes and boundaries; pre-meeting checklist; sources and uncertainty.

### C. materials/ — actual supporting materials

Produce concrete files, not an inventory alone. Select and justify what is relevant:
- executive_brief.md: concise 1–2 page brief in language suited to the participant;
- talk_track.md: suggested spoken narrative and transitions;
- evidence_and_claims.md: evidence, metrics, sources, maturity, and limitations;
- demo_plan.md: demo flow, prerequisites, steps, expected observations, known failures, and no-demo fallback;
- questions_and_objections.md: discovery questions, possible objections, and defensible answers;
- next_step_options.md: conditional paths for follow-up, explicitly not commitments;
- presentation (PPTX/PDF) when a presentation is needed;
- diagrams/infographics/images when they materially clarify architecture, process, or value.

The core package A and B and essential C materials may not be omitted without a specific rationale in README. Consolidating sections into fewer files is acceptable only when navigation and completeness are preserved.

### D. Post-meeting records

Keep minutes and follow-up templates empty until the meeting occurs. Afterward record only observed facts, decisions, owners, deadlines, and actual agreements. Follow-up drafts remain drafts and are never sent by Meeting Prep.

## 9. Visual materials and presentations

Choose visual form based on communication need:
- architecture map for components and boundaries;
- flowchart for processes;
- sequence diagram for interactions;
- chart for traceable metrics;
- comparison table for alternatives;
- timeline for roadmap;
- infographic for executive synthesis.

Do not create charts without real data or explicit hypothetical labels. Do not use generic stock imagery as a substitute for a technical diagram. Label states as implemented, tested, proposed, or future. Include source, date, and method notes on charts. Avoid confidential information. Prefer materials explainable in minutes and usable offline.

A presentation is required when there is a formal demonstration, several concepts requiring a visual sequence, a multi-party meeting, or an explicit request. Otherwise, a brief plus diagrams may suffice; document the rationale.

## 10. Demonstration and fallback

For each demo:
1. identify exact environment, version, and artifact;
2. verify whether the flow was actually executed, by whom, and when;
3. define prerequisites and non-sensitive test data;
4. list reproducible steps and observable outcomes;
5. record limitations, known failures, and dependencies;
6. prepare a fallback using report, screenshot, diagram, or explanation, clearly labeled as not a live demo;
7. never claim a demo was tested without evidence.

Do not provision infrastructure, run migrations, unfreeze labs, conduct financial operations, or perform external actions merely to prepare a meeting unless specifically authorized.

## 11. Conditional next-step plan

Prepare conditional paths, not commitments:
- if explicit interest emerges, identify a small validation step;
- specify data, participants, resources, and decision criteria required;
- if an objection emerges, explain how to clarify or close without pressure;
- if no convergence exists, record it and do not insist;
- identify decisions reserved to the project owner.

Do not create a commercial offer, budget, binding schedule, partnership, or investment request without supporting basis and authorization. Respect the principle of validating external interest before substantial development/investment.

## 12. Persistence and artifact quality

- Use Markdown for text dossiers; create PPTX/PDF/diagrams when materially useful.
- Every file must be complete, clearly named, and linked through valid relative paths; no empty placeholders presented as deliverables.
- Reuse valid existing content; add dated addenda when preserving history matters.
- Do not delete historical content without authorization.
- Never persist tokens, meeting PINs, private dial-in credentials, access secrets, or unnecessary personal data.
- Restricted meeting links may be omitted from Git; record that the link was provided through a private invitation.
- Use ISO dates, local time, and explicit timezone.
- Record source, version/commit, and access date.
- If binary output cannot be created, do not pretend it exists; provide editable Markdown/SVG/Mermaid source and record the limitation.

## 13. Mandatory quality review

Before marking ready, verify:

Identity and logistics:
- canonical ID and participant match; no homonym confusion;
- date, time, timezone, duration, and format are supported and consistent;
- meeting state is accurately labeled.

Content:
- blueprint and version were read; blueprint was not modified;
- profile uses traceable sources and separates facts from inferences;
- convergence is individualized and supported;
- claims matrix does not exaggerate maturity or results;
- argument ladder, questions, objections, and answers are usable orally;
- materials are adapted to participant and available time.

Artifacts:
- README links only to files that exist;
- strategic dossier is complete;
- executive brief and talk track exist;
- evidence and demo plan are documented;
- visual/presentation material exists or omission is justified;
- relative links resolve;
- minutes/follow-up remain empty or clearly post-meeting.

Integrity:
- no invented information, interest, response, feature, or commitment;
- no secrets/credentials persisted;
- no message sent or calendar changed;
- diff reviewed and remote artifacts verified;
- blockers and human dependencies recorded.

If any essential item fails, status must be PARTIAL or BLOCKED, never COMPLETE.

## 14. Report and handoff

Report meeting, participant, project, logistics status, artifacts with exact paths, key sources/access dates, validations, complete/partial/blocked items, owner decisions, and next step.

Create an OperationalReport under the active governance skill. Do not mark the mission task complete until the package is persisted, reviewed, and verifiable in the remote repository.


## 16. Archaeological context and per-OR evolution

The central governance/ARCHAEOLOGICAL_CONTEXT.md applies to this Skill. Read it before execution and do not create a separate competing archaeological history inside the meeting folder. When an OR identifies a reusable lesson, a procedural defect, a risk, or a justified optimization, the Oracle reviews it during the mission rather than waiting for the FOR. Corrections within delegated authority may be implemented, validated, and used by the next stage immediately. Preserve evidence, prior decisions, and version traceability. Changes beyond delegated authority remain subject to the applicable approval.

Every meaningful execution stage must be reported through its OR and reviewed in the ongoing operational cycle. The final FOR consolidates all stage ORs and interventions; it does not replace per-OR review. This Skill remains DRAFT until the supervised pilot is evaluated and approved.

## 15. Success test

A third party who did not participate in preparation must be able to open the meeting folder and quickly understand who is attending and why, what the owner wants to achieve, what to say and in what order, what can safely be shown or claimed, which questions to ask, how to answer objections honestly, and what next step may be proposed if convergence exists.

The owner must be able to conduct the meeting using the dossier without reconstructing the context in another conversation.
