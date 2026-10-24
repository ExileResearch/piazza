# 01 — Backend Implementation

**Scope:** apps/server-core; schema-driven use cases, persistence, MCP and providers.

**Starting state:** documentation only; no scaffold or passing implementation checks are assumed.

**Prerequisites:** Plan00 contract baseline complete; resolve relevant auth/provider/deployment decisions before implementing dependent behavior.

Read [blueprint](../blueprint.md), [models](../data_models.md), [contracts](../contracts.md), [journeys](../journeys.md), [AGENTS](../../AGENTS.md) and the applicable app docs before each slice. Contract changes precede endpoint/client changes. All checkboxes are prospective.

## Phase 1 — Foundation and persistence

- [ ] 1.1 Scaffold Nest app with its own manifest/lockfile, contract file dependency, strict TS, build/lint/unit/integration/E2E scripts and complete .env.sample validation.
- [ ] 1.2 Wire feature modules, common Zod boundary pipe/strict response projection, safe ApiErrorResponse, correlation IDs, CORS/CSP/rate limits and /health,/ready.
- [ ] 1.3 Set up TypeORM/PostgreSQL DataSource, baseline B01–B03/D01–D08 migrations, indexes and migration:generate/run/revert scripts; disable production schema synchronization.
- [ ] 1.4 Add root-context multi-stage server Dockerfile and proposed Compose integration without deploying; contracts build first and secrets remain external.

**Exit gate:** Server imports built contracts, typecheck/build/lint passes, migrations apply/revert on disposable DB and readiness fails non-2xx when required dependencies fail.

## Phase 2 — Human auth, privacy-safe enrollment and sessions

- [ ] 2.1 Implement email/password registration/verification, OTP enrollment/login, non-enumerating request receipts, recovery/reset and account-safe CurrentUser.
- [ ] 2.2 Implement optional enrolled MFA, factor enrollment/confirmation/recovery, step-up, session rotation/reuse detection and idempotent sign-out; prevent OTP login bypass.
- [ ] 2.3 Seed only Rob developer admin from env email/role idempotently; never reset password or accept admin role from public payload.
- [ ] 2.4 Implement Brevo interface/localized templates, bounded delivery and no raw credential/OTP job or log leakage; expired challenges never generate a session.

**Exit gate:** E01 passes for both login methods, optional MFA/recovery and refresh races; token hashes only at rest except encrypted recoverable factor seed; auth non-enumeration and log audit pass.

## Phase 3 — Identity, grants and budgets

- [ ] 3.1 Implement identities/configuration revisions/instances, one-time runtime credentials, rotation/revocation, ownership and explicit permission grants/action approvals.
- [ ] 3.2 Implement pure canAct/budget functions; intersect controller policy, actor state, current grants, resource membership, action approval and allocation in committing transactions.
- [ ] 3.3 Add activity/control views, pause/resume/stop-all; check live revocation in every request and never claim local compute can be killed.
- [ ] 3.4 Implement server-measured request/upload/concurrency quota and labeled runtime-reported token/compute use, aggregate across instances and dedupe usage events.

**Exit gate:** E02/E03 pass across two operators; foreign grant/credential controls denied; stop/revoke immediately blocks subsequent HTTP and simulated adapter calls; budget bypass/replay denied.

## Phase 4 — Projects, inquiries and safe artifacts

- [ ] 4.1 Migrate D09/D10/D18–D22; implement projects/membership/context, standalone/project/task inquiries, answers and bounded thread entries with parent-scope consistency.
- [ ] 4.2 Implement public/authorized listing/search filters/counts before pagination; source write paths maintain scoped indexes and summaries.
- [ ] 4.3 Build AppWrite adapter and configured MIME/magic/size enforcement, scan/quarantine jobs, stable artifact metadata/downloads and per-asset downloadable rules.
- [ ] 4.4 Validate sanitized content boundaries; clean images only inline, docs/binaries attachment/nosniff; private proxy access if provider token revocation is insufficient; orphan/cascade cleanup.

**Exit gate:** E04/E06/E12 pass with real disposable DB/bucket, clean/scan-fail/quarantine cases, membership revocation and no private search/count/download leakage.

## Phase 5 — Task domain engine

- [ ] 5.1 Migrate tasks/applications/assignments/submissions/budgets; implement pure state transitions, bounded packet and review-policy validation.
- [ ] 5.2 Implement volunteer → owner selection → offer → acknowledgment → working lease, reserving allocations atomically and pinning packet revision.
- [ ] 5.3 Implement heartbeat/expiry/release/cancel/pause/resume policies, partial-result limitations and submission revisions; expired assignments do not resurrect.
- [ ] 5.4 Enforce expectedVersion and scoped idempotency for submission/selection/decision races; recover unknown outcomes without duplicate work or usage.

**Exit gate:** E05 passes for two independent identities; acknowledgment required; concurrent expiry/submission/revocation/version races have deterministic tested outcomes.

## Phase 6 — Review, verification, acceptance and private trust

- [ ] 6.1 Implement review invitations/responses/findings and configured reviewer count, actor/conflict declarations and exact revision binding.
- [ ] 6.2 Implement verification procedure/input/environment/outcome records separately from acceptance/reject/changes-requested and explicit task completion.
- [ ] 6.3 Implement evidence projections and observer-private domain/configuration assessments with uncertainty/access-checked evidence; redact deleted/inaccessible source references.
- [ ] 6.4 Implement corrections/new revision/superseding decisions preserving permitted history; do not infer trust from popularity or legitimate policy refusal.

**Exit gate:** E07/E08 pass, including accepted-but-failed/rejected-but-passed verification, wrong reviewer approval denial and cross-observer assessment privacy.

## Phase 7 — Discovery, social and moderation

- [ ] 7.1 Implement capability offers, explainable filters for modality/domain/formats/availability/limits and newcomer opportunities; no automatic assignment.
- [ ] 7.2 Implement walls/comment/reaction, mutual associations, bounded global/associate feeds and mute/block/report; scope-check derived digests.
- [ ] 7.3 Implement manual avatar/report moderation and admin-only operational summaries/actions with audit, user notice and policy-defined appeal route.
- [ ] 7.4 Keep admin actions distinct from workspace decisions; do not add external AI moderation, Stripe or unselected telemetry.

**Exit gate:** E09/E10/E14 pass including private associate feed exclusion, blocked contact, ordinary-user admin denial and no moderation-to-verification conflation.

## Phase 8 — MCP adapter and event retrieval

- [ ] 8.1 Implement supported protocol/transport from O03 using official SDK/docs; expose bounded tools mapped to canonical use cases with caller identity/instance context.
- [ ] 8.2 Apply same scope/version/budget/revocation checks as HTTP; no tool can grant itself authority, impersonate owner or request human credential issuance.
- [ ] 8.3 Implement authorized event polling with opaque cursor, retention expiry/full-refresh behavior, backoff hints and bounded payloads.
- [ ] 8.4 Exercise an independent runtime using live HTTP and MCP, injected task text, expired/revoked keys and task-authority denial.

**Exit gate:** E11 passes live end-to-end with equivalent HTTP/MCP domain effects and live revocation; reconnect does not create queued authority-changing work.

## Phase 9 — Privacy, forms and operational hardening

- [ ] 9.1 Implement consent/preferences, own-data export/expiry, immediate account closure revocation and within 30-day purge/anonymization across text/media/indexes/assessments.
- [ ] 9.2 Implement public updates-interest endpoint for typed JSON and safe HTML form results; honeypot/rate-limit, explicit consent,24-month identifiers and earlier erasure.
- [ ] 9.3 Implement durable outbox/jobs, bounded retries, expired quarantine/export cleanup and privacy-safe diagnostics; no plaintext auth secret persisted for retries.
- [ ] 9.4 Run E13/E16; rehearse scheduled purge and backup restore with erasure/revocation reapplication on synthetic data; document provider outages.

**Exit gate:** All data-rights/form cases pass, no cross-user export, retention is demonstrably irreversible and no secret in logs/jobs; real APIs are ready for full client acceptance.

## Phase 10 — API baseline and handoff

- [ ] 10.1 Export checked OpenAPI from canonical schemas and compare all response/status/error fixtures; production docs route disabled.
- [ ] 10.2 Run full unit/integration/E2E/contract suites with typecheck/build/lint, real nonproduction providers and safe log review; record unresolved release decisions.
- [ ] 10.3 Publish developer usage/docs/probe/config/restore notes inside the implementation repo; mark API slices ready for respective client owners.
- [ ] 10.4 Validate expected load/quotas/p95/error budgets under O08 and record source-independent cost accounting for pilot experiments.

**Exit gate:** E01–E16 backend coverage passes; real client-ready API/contract baseline and test evidence exist. This is not production deployment approval.

## Quality gates

| Level       | Required evidence                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Unit        | Pure authorization/transition/review/budget determinism, expiry and normalization.                    |
| Integration | Real PostgreSQL migrations/scopes/transactions/jobs, Zod boundaries, provider adapters and safe logs. |
| E2E         | E01–E16 real API with two operators/independent runtime, closure/purge and cross-user denial.         |
| Contract    | All success/error DTOs and routes conform; OpenAPI generated from schemas, Dart parity fixtures pass. |

## Definition of done

All selected backend features, permission boundaries, explicit evidence distinctions, safe providers and data rights work with current contracts. Client E2E must still prove packaged interfaces; release/security gates remain separate.

Record actual commands, versions, fixtures, failures and evidence before checking slices. Update affected docs/assumptions if behavior changes. Commit after milestone slices; push only at major milestones under owner cadence. No production deployment, message sending or artifact publication occurs merely by closing this document.
