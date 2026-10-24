# 00 — Contracts Package

**Scope:** packages/contracts and shared interface design; no app feature implementation.

**Starting state:** application scaffolds already exist. The contracts package was absent when this build began. Phases 1–4 are now verified; full route/client/MCP compatibility and baseline freeze remain in phase 5.

**Prerequisites:** Resolved package available; close O01–O03 as needed before their contract families freeze.

Read [blueprint](../blueprint.md), [models](../data_models.md), [contracts](../contracts.md), [journeys](../journeys.md), [AGENTS](../../AGENTS.md) and the applicable app docs before each slice. Contract changes precede endpoint/client changes. All checkboxes are prospective.

## Phase 1 — Resolve vocabulary and authority

- [x] 1.1 Resolve O12 late/partial/lease policy, then review F01–F16/J01–J16, define public/human/operator-agent/admin actors and role-safe projections; record generation assumptions accepted or revised.
- [x] 1.2 Resolve OTP/password/MFA/recovery/session lifetimes and enrollment/credential rules (O01/O02). Define no-MFA-bypass behavior across enabled login methods.
- [x] 1.3 Record online-only policy, explicit version/idempotency semantics, membership-versus-controller authorization and acceptance-versus-verification distinctions.
- [x] 1.4 Choose supported MCP revision/transport/auth compatibility with official references (O03), before freezing its adapter schemas; preserve application API independence.

**Exit gate:** Reviewed actor/action/scope matrix and auth state diagram exist; unresolved family-specific choices are explicit blockers, not silent defaults.

## Phase 2 — Package and baseline schemas

- [x] 2.1 Create packages/contracts own manifest/lockfile, strict TS build/check/test scripts, Zod peer/export layout, ESM and tested CJS only where needed; no root npm workspace.
- [x] 2.2 Define UUID/time/locale/theme/pagination/error/success schemas, unknown-field rejection and route-operation metadata including binary/probe/form exceptions.
- [x] 2.3 Define B01–B03/D01–D08 internal/private/public schemas; secret-containing internals are not ordinary public exports. Human roles cannot be set through registration.
- [x] 2.4 Add normalization, boundary, token-expiry representation, challenge-required union and response-leak fixtures.

**Exit gate:** npm build/check/test passes for contracts; consumer resolution smoke harness works without app scaffolding or hoisting; secret-safe projections reject undeclared fields.

## Phase 3 — Coordination and evidence schemas

- [x] 3.1 Define all D09–D24 entities and operation schemas: projects/membership, packets/tasks/applications/assignments, immutable submissions, review, verification, decisions, inquiry/answer/thread, capability and assessments.
- [x] 3.2 Publish complete task/assignment/review enums and transition tables; pin packet/submit revisions, acknowledgment/lease limits, exact owner acceptance and review-count requirements.
- [x] 3.3 Define budget reservation/usage provenance, approval payload digest, controller/grant intersection and scoped actor types. No universal trust vector or auto-assign command.
- [x] 3.4 Add two-operator fixtures for public/member/controller/admin projections, stale requests, expired lease, optional review and accepted-but-failed verification.

**Exit gate:** Every coordination journey has request/result/error fixtures and state denial cases; all model references/enums resolve without framework imports.

## Phase 4 — Social, artifacts, privacy and operational contracts

- [x] 4.1 Define D25–D38 schemas including wall visibility/associations/reactions/controls/reports, budgets/activity, consent/forms/export and safe job metadata.
- [x] 4.2 Define artifact upload/scan/download headers and visibility constraints; do not expose storage keys, private hash-existence, raw credentials or unreviewed files.
- [x] 4.3 Define sanitized account export/closure and retention operation DTOs, including 30-day purge and 24-month form identifier handling; no claim that soft-delete is anonymization.
- [x] 4.4 Define public updates form schema for JSON and URL-encoded transport; safe localized HTML result is an explicit representation of the same use case, not another business endpoint.

**Exit gate:** Contract fixtures cover social/data-rights/form happy and denial paths; every feature-owned noun has a defined schema/projection.

## Phase 5 — Route and client compatibility baseline

- [ ] 5.1 Materialize every route row in ../contracts.md as apiRoutes with exact methods/path/query/header/body/response/status/error schemas; add /health,/ready and development-only OpenAPI metadata.
- [ ] 5.2 Define bounded events/cursor expiry and MCP tool mappings to domain operations with identical actor/grant rules; no adapter service-role escalation.
- [ ] 5.3 Document canonical Zod-to-Nest/Swagger metadata generation and establish representative OpenAPI/Dart parity fixtures, including optionality, enums, dates and auth challenges.
- [ ] 5.4 Run contracts unit/schema tests, route-inventory coverage and imports; freeze a versioned baseline and record how future app owners request cross-app changes.

**Exit gate:** All F01–F16/J01–J16 have typed operations and denial/error shapes; no duplicate payload definitions; contracts build/check/tests green. Backend implementation may now start.

## Quality gates

| Level       | Required evidence                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Unit        | Normalization, schema bounds, unions, enums and transition input rejection.                                                     |
| Integration | Independent package resolution, metadata/schema export and fake-consumer compatibility without workspace hoisting.              |
| E2E         | Scenario fixture chain register/verify/login → enroll → task workflow → cross-operator denial; real server E2E is a later gate. |
| Contract    | Every declared route/model has schema fixtures; strict projections exclude secrets and OpenAPI/Dart mapping cases agree.        |

## Definition of done

All shared vocabularies/operations/errors are reviewable and versioned, auth/MCP choices for implemented families are resolved, and backend can import the package. Do not mark runtime integration or security as tested by schema tests alone.

Record actual commands, versions, fixtures, failures and evidence before checking slices. Update affected docs/assumptions if behavior changes. Commit after milestone slices; push only at major milestones under owner cadence. No production deployment, message sending or artifact publication occurs merely by closing this document.

## Foundation milestone evidence — 2026-10-24

Phases 1–2 complete on `dev`. The [foundation decision](../decisions/0001-contract-foundation.md) records the actor/scope matrix, auth/MFA state diagram, provisional server limits, current MCP design target and the owner's late/partial-work decision. MCP SDK/client interoperability remains a phase 5/backend gate; selecting its design target is not a claim that the adapter exists.

`packages/contracts` has its own pinned lockfile, canonical Zod schemas and inferred types, separate public/account and server-internal entry points, and ESM/CommonJS builds with declarations. It covers B01–B03 and D01–D08, bounded common/error/transport metadata and permission/resource shapes. Auth schemas validate shape only; actual password checking, ownership, revocation and cryptography remain backend responsibilities.

Verification: Node 24.21.0, TypeScript 5.9.3, Zod 4.6.6; `npm run verify` runs typecheck, both builds, 25 passing tests and formatting checks. Tests cover normalization/expiry, privilege and secret-field rejection, MFA/session distinction, grant caps, response metadata and an independently packed local-file consumer with ESM/CommonJS runtime and strict type resolution. Consumer tests run offline and do not depend on root hoisting or app modifications.

At that foundation checkpoint, no full task lifecycle fixture chain, network E2E, database migration, provider integration, OpenAPI route catalog or Dart client was claimed. Phase 3 is now recorded separately below; backend feature work still waits for phases 4–5.

## Coordination milestone evidence — 2026-10-24

Phase 3 complete on `dev`. [Decision 0002](../decisions/0002-coordination-contracts.md) records implemented D09–D24 projections/operations, legal lifecycle edges, exact immutable revisions, acknowledgment and bounded lease/renewal, evidence-only late/partial work with renewed assignments, independent verification/acceptance, review counts, private assessments, declared capabilities and scoped authority/budget checks. D21 metadata is available; full artifact lifecycle remains phase 4.

Verification: `npm run verify` passes strict typecheck, ESM/CommonJS builds, 49 tests and formatting. Each phase 3 operation has request/result/error-envelope fixtures and unknown-field denial. Two-controller policy scenarios cover role/parent access, stale versions, revocation facts, budgets, single-grant scope intersection, exact approval digest/revision, reviewer/owner separation and reassignment after evidence-only work. Packaged offline consumers verify the new runtime exports/inferred types in both module systems without app hoisting.

The first test runs exposed shared mutable fixtures and an invalid additive-admin role fixture; both were corrected and the full suite rerun. No live service was used. Pure policies require trusted repository snapshots and atomic service enforcement: these tests do not prove real SQL prefilters, concurrency/idempotency, cryptographic authentication, artifact access, network E2E, MCP, OpenAPI or Dart parity. No application feature code changed. At that checkpoint phases 4–5 remained unchecked; phase 4 is now recorded below.

## Social, artifact, privacy and operations evidence — 2026-10-24

Phase 4 complete on `dev`. [Decision 0003](../decisions/0003-social-artifacts-privacy-contracts.md) records D25–D38 schemas/projections, complete D21 upload/scan/delivery vocabulary, mutual associations, wall audience/mute/block rules, separate reports/moderation, allocation/usage provenance and dedupe, safe activity/job/receipt metadata, human export/closure authority, retention deadlines and one updates-form operation with JSON/URL-encoded/HTML representations.

Verification: `npm run verify` passes strict typecheck, ESM/CommonJS builds, 70 tests and formatting. Added fixtures cover all phase 4 request/result/error boundaries, two-operator audience/parent denial, blocked contact, stale wall/scan writes, quarantine and safe delivery headers, allocation batches and repeat usage, bound step-up, admin versus account owner, safe export chunks/expiry, 30-day closure scheduling, leap-day 24-month form retention, duplicate-key/malformed form rejection, five-locale static HTML and no raw secrets in metadata. Independent offline packed consumers check new exports/inferred types in both module systems.

The export-job union initially required a nonempty tuple to typecheck; it retains strict variants and expiry validation. The runtime suite passed on its first full run and after refinements. These are contract/pure-policy fixtures, not evidence of live scanning, SQL pagination isolation, erasure, backup restore, actual job/delivery workers, no-JS browser accessibility or network E2E. No dependency pins or app features were changed. Phase 5 remains unchecked; backend features still wait for complete routes, HTTP/MCP mapping, event/idempotency semantics, OpenAPI/Dart parity and baseline freeze.
