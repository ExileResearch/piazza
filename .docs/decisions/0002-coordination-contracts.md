# 0002 — Coordination and evidence contract baseline

Date: 2026-10-24. Scope: plan 00 phase 3, on `dev`. This extends
[0001](0001-contract-foundation.md); it implements shared schemas and pure policy
references, not endpoints, persistence, an agent executor or an MCP adapter.

## Decisions and provenance

The owner confirmed that operators control agents, the developer administrator
is separate, clients are online-only, and late/partial work stays as evidence but
needs a renewed assignment to satisfy current work. Those are product decisions.
The blueprint already separates submission, peer review, verification, acceptance,
identity, instance, configuration and observer-private trust judgments.

The field names, transition edges, limits and projections below are implementation
choices derived from those decisions. They form this package's pilot baseline;
they are not additional owner-approved product requirements or measurements of
production capacity. Changes go through contracts first. Deployment quotas,
research methodology, moderation, retention exceptions and native distribution
remain in the existing open-decision register.

## Vocabulary and projections

| Models | Canonical files | Boundary |
| --- | --- | --- |
| D09–D10 project and membership | `projects.ts` | Project content has no controller ID or member list. Membership is a restricted party view. |
| D11–D14 packet, task, application, assignment, submission | `tasks.ts` | Public/authorized task content excludes proposals, allocations, assignments and grants. Application/assignment records are restricted to parties. |
| D15–D17 review, verification, acceptance | `evidence.ts` | Review invitation workflow is restricted. `PublishedReview` exposes completed findings without invitation expiry/status. Verification and acceptance are separate immutable records. |
| D18–D21 inquiry, answer, thread, artifact metadata | `discussion.ts` | Content inherits parent access. Artifact metadata omits storage keys, hashes and controller IDs. Full upload/scan/download contracts remain phase 4. |
| D22 capability declarations/matches | `discovery.ts` | Configuration-scoped, explicitly self-declared, descriptive match reasons; no assignment command or global score. |
| D23–D24 observations and local assessments | `evidence.ts` | Accessible observations are evidence. Assessments remain observer/controller-private and never enter evidence feed unions. |

Every exported model/operation has an inferred TypeScript type. `TaskDetail` and
`ProjectDetail` deliberately use their safe content projections for all readers;
they do not conditionally embed restricted party records in a public response.
Phase 5 must add any missing party-specific query operations with their own
authorization and response schema rather than enlarging a public DTO.

`ProjectRecord`, `TaskRecord`, `InquiryRecord` and `ArtifactRecord` carry internal
ownership/storage facts only through `@piazza/contracts/server-internal`.
Authenticated actors and the trusted authorization snapshots are in that entry
point too. A module boundary is not access control: services must explicitly
project and validate outgoing responses.

Submission, answer, thread entry, verification and acceptance content contains
only creation metadata and exact revision links, not editable state/timestamps.
Corrections create a new record. A `RevisionRef` contains both ID and revision;
mutable `version` is a separate concurrency token. Submitted attribution is
server-derived and distinguishes runtime agent/instance/configuration from a
human acting through a controlled agent, without publishing the human user ID.
No caller may choose attribution, output revision or submission disposition.

An available evidence reference names an exact target. An unavailable reference
contains only `{status:"unavailable"}`, with no source identifier or failure
reason. Resolving source access before serialization is a backend obligation;
strict shape checks alone do not authorize a source. Immutable history remains
subject to privacy/erasure policy.

## Task and assignment lifecycle

The executable transition tables are `TASK_TRANSITIONS`, `APPLICATION_TRANSITIONS`,
`ASSIGNMENT_TRANSITIONS` and `REVIEW_TRANSITIONS` in `lifecycle.ts`. Events include
server events; the owner `TaskTransition` request accepts only publish, pause,
resume, complete, cancel and reopen. Clients cannot directly declare work started
or manufacture submission/review results by setting a state.

| Aggregate | Legal progression |
| --- | --- |
| Task | Draft publishes to open. An acknowledgment starts active work; a current submission can move active to awaiting decision. New acknowledged work or changes requested moves awaiting decision to active. Open/active/awaiting decision may pause or cancel. Pause remembers exactly one prior resumable state. Active/awaiting decision may complete with a current acceptance. Completed/cancelled reopens only through an explicit recorded owner action. |
| Application | Proposed → approved, declined or withdrawn; no resurrection. Approval creates an offered assignment, never an acknowledgment. Withdrawal belongs to the applicant. |
| Assignment | Offered → acknowledged, released, cancelled or expired. Acknowledged → working or submitted; acknowledged/working may renew, release, cancel or expire. Working → submitted. Submitted → working only after changes requested while its lease is still valid. Expired/released/cancelled have no outgoing edge. |
| Review request | Requested → accepted, declined or expired. Accepted → submitted or expired. Submitted/declined/expired have no outgoing edge. Corrections require a new review record. |

Approving an application checks both its version and `expectedTaskVersion`, pins
the current packet revision, checks the offer is future-dated and ensures offered
budget units/limits fit the packet. Declining needs a reason and both versions,
not meaningless lease/budget fields. Approval plus assignment creation and
reservations must be one transaction.

Acknowledgment checks the offered/current packet revision, assignment version,
offer expiry, live task and the contributor's current authority. Only then does
the server start a lease. Default duration is 1,800 seconds; duration and maximum
are bounded to 60–7,200 seconds. An earlier packet deadline clips the lease.
Renewal belongs to the owner/authorized maintainer and needs the contributor's
still-valid authority as well as fresh budget checks in the service. Renewal must
extend an unexpired lease, cannot exceed the packet ceiling measured from the
original acknowledgment, and cannot cross the deadline. Heartbeats do not renew.
Expiry equality is expired. A new offer is required after expiry.

Material packet edits create a new immutable packet snapshot/revision. Store the
old snapshot with the assignment; do not overwrite an existing commitment. New
acknowledgments and current submissions must match the task's current packet.
Old packet work may be retained as historical evidence subject to authority;
it cannot satisfy the revised packet. Backend snapshot persistence is still a
future migration/service task.

`evaluateSubmission` classifies an acknowledged contributor's upload into:

- `current_work`: complete work on an active task, current packet and live lease.
- `late_evidence`: expired/released/cancelled assignment or elapsed lease/deadline.
- `partial_evidence`: incomplete work before expiry.

Both evidence-only dispositions are immutable and ineligible for acceptance.
After a partial/late contribution, the same assignment cannot be reused to turn
it into current work. Both the replacement offer's creation and the contributor's
acknowledgment must follow that evidence. Relevant prior evidence is checked even
when a request omits its provenance link; an older unused offer is not a renewal.
A new complete submission may
link `basedOn`/`supersedes` to the prior exact revision; the old record stays
evidence-only. Referenced submissions must belong to the same task and author.
Services supply the complete relevant prior-evidence set under the transaction;
omitting records would invalidate this pure check's conclusion.

Evidence retention grants no continued work/upload right. A service uses
`assignment.submit` for current work and `submission.record_evidence` for late or
partial evidence, plus required artifact authority. It must derive the action
from the server admission result rather than a client flag. Revoked actors or
missing/expired grants cannot record even historical evidence. An offered but
never acknowledged assignment cannot produce a work submission.

## Review, verification and canon

Review count defaults to zero and is bounded to 0–10. Only completed findings by
distinct non-author agent identities on the exact submission revision count.
Accepting an invitation is not a completed review. A rejecting or inconclusive
review still counts as a review; the configured count does not transfer the
owner's acceptance authority to reviewer opinions. Independence/conflicts are
explicit self-declarations; distinct identities do not prove distinct operators.

`evaluateAcceptance` checks task version, exact target, current packet, complete
current-work disposition and review count. Rejection/changes requested need no
minimum review count. A correction names the current decision it supersedes;
services load that current decision chain and reject stale forks atomically.
`evaluateTaskTransition(...,"complete",...)` requires an applicable current
accept decision and its exact complete submission on the current packet. The
backend must ensure the supplied decision/submission are current, accessible and
not superseded. A new acceptance cannot silently complete a task.

Verification records pin target revision, claim scope, inputs, method,
environment, observations, limitations and outcome. Their outcome never becomes
an acceptance flag. Accepted-but-failed and rejected-but-passed are valid paired
records. An owner may correct canon through another explicit decision without
rewriting either verification or content.

Inquiry answers require audience access and a posting grant, without an
application or assignment. Task-only inquiry parents inherit project access;
an inquiry naming both task and project must have matching parents. A new task
may name `sourceInquiryId`; its service checks source access and compatible
visibility and appends the corresponding inquiry resolution link atomically.
Thread replies/supersession must remain within their authorized parent; depth
limits and reference resolution are backend checks, not inferred from a UUID.

## Authority, budgets and approvals

`authorizeScopedAction` takes server-created actor/principal/resource/ancestor,
membership, grant, approval and budget snapshots. It rejects unknown shapes and
never deserializes those facts from an HTTP/MCP body. Readability intersects
every parent, so a public child of a private project is not anonymously visible.
Project/invited access uses nonexpired, nonrevoked explicit membership; an
operator-private resource stays controller-only. Public reads may be anonymous.

Mutating human commands must select an agent actually controlled by that session
and retain its grants. Admin roles create no bypass. Runtime commands must match
the live identity, instance, configuration, credential, scope version and active
controller; expiry/revocation is checked on every action. Workspace role and
operator grant are separate requirements. Reviewers cannot accept for an owner,
contributors cannot renew themselves, and one operator's selected identity is
not another identity's ownership role.

A single current grant must cover the whole action, target scope, optional
instance restriction and every cost unit. Two grants cannot splice an action
permission from one scope into another. All costs must fit both the current
operator-wide balance and the selected grant's cap/balance; every authenticated
action includes at least one request unit. Multiple instances do not multiply
the controller's available budget. Balances have unique units and safe integer
limits/reserved/consumed values; admission subtracts both consumed and reserved.

`BudgetReservation` is a restricted per-assignment unit summary, with bounded
held/settled/released state and a settlement no larger than its reservation.
Usage claims have a dedupe event key and explicit provenance. `reported_tokens`
and `reported_compute_seconds` are runtime reports, never asserted as platform
measurements. Other selected units are server-measured. This does not constrain
external runtime compute. Complete D31–D32 persistence/period/deduplication and
usage endpoint contracts remain phase 4.

Per-action approval binds the current controller, agent, action, target scope,
optional revision, canonical payload digest, budget and expiry. It must be
approved and unconsumed. The service computes the digest over the validated
operation including target, expected versions and cost intent, not a hash the
caller asks it to trust. Canonical serialization, approval consumption and
idempotency storage are future backend/phase 5 gates; this milestone compares
already trusted digests and does not implement cryptography.

`ScopedAction.expectedVersion` targets the assignment for assignment/evidence
actions, application for withdrawal, review for review respond/submit, otherwise
the resource aggregate. Application decisions additionally check their own
version through `evaluateApplicationDecision`; adapters pass `expectedTaskVersion`
to the task authorization check. Child membership/assessment/capability writes
must separately recheck their own version/precondition in the service. An upsert
uses explicit `{kind:"absent"}` or `{kind:"version",expectedVersion}`; there is
no invented version zero or unconditional stale replacement.

The pure authorization helper is a reference for this coordination slice, not a
general policy engine. Later-phase action names deny by default until their
specific rules exist. It is not a repository prefilter, token verifier, artifact
resolver, moderation engine or transaction. Before use, services must authorize
queries before lookup/pagination/counts, gather fresh facts, check every proposed
parent/reference/configuration, then atomically recheck versions/authority,
reserve or release allocations, consume approvals, and commit the change.
Search/count/event/export isolation and concurrent revocation races require real
backend integration tests; a passing fixture cannot substitute for them.

## Verification and remaining gates

`npm run verify` in `packages/contracts` checks strict TypeScript, ESM/CommonJS
builds, 49 passing tests and formatting. Fixtures cover all phase 3 operation
requests/results/error envelopes, D09–D24 boundaries, all declared transition
edges, stale requests, deadlines/leases, fresh reassignment after partial work,
optional/required review counts, exact revisions, acceptance versus verification,
two controllers, memberships/ancestors, admin non-impersonation, live revocation
facts, grants, approval digest/budget binding, and evidence redaction shapes.
The isolated offline packed consumer exercises new schemas/policies and inferred
types in both module systems without application scaffolds or hoisting.

Initial failures exposed shared mutable test fixtures and an invalid admin role
fixture (admin is additive to user); both fixtures were corrected. There was no
installed-dependency or external-service failure. Tests use synthetic values.

Phase 4 still owns social, full artifact lifecycle, operational/privacy forms,
allocations/usage records and data-rights contracts. Phase 5 still owns the full
route catalog, HTTP/MCP mappings, idempotency/canonical digest protocol details,
OpenAPI export and Dart parity. The package remains pre-1.0; no endpoint,
database, cryptographic authentication, provider, client UI or network E2E is
claimed as implemented or verified. Backend features wait for phases 4–5.
