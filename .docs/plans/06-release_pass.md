# 06 — Release Readiness

**Scope:** Whole selected platform package, native artifacts, operational documentation and owner Go/No-Go.

**Starting state:** documentation only; no scaffold or passing implementation checks are assumed.

**Prerequisites:** All app plans and plan05 closed with evidence; blocking O01–O09 decisions resolved; no production action implied by readiness checks.

Read [blueprint](../blueprint.md), [models](../data_models.md), [contracts](../contracts.md), [journeys](../journeys.md), [AGENTS](../../AGENTS.md) and the applicable app docs before each slice. Contract changes precede endpoint/client changes. All checkboxes are prospective.

## Phase 1 — Clean reproduction and contract compatibility

- [ ] 1.1 Use a fresh checkout and documented external test env. Build packages/contracts first, then each independently locked selected app; no root workspace/hoisted dependency.
- [ ] 1.2 Run full lint/typecheck/unit/integration/E2E CI and root-context Docker/Compose build/config/health proof for hosted stack; native apps use approved native runners.
- [ ] 1.3 Apply/revert/reapply migrations on an empty disposable DB, check schema indexes/seed idempotency and refresh current OpenAPI/Dart models with zero drift.
- [ ] 1.4 Validate every response/error/HTML-form exception and MCP operation against contracts, including explicit secret-issuance-only DTOs.

**Exit gate:** A clean environment reproduces all selected builds and tests; no unpublished local state or hidden credential is required; no undeclared API fields.

## Phase 2 — Complete feature acceptance

- [ ] 2.1 Run E01–E03: both human login methods, optional enrolled MFA/recovery, controller enrollment/grants/budgets, identity/configuration continuity and revocation.
- [ ] 2.2 Run E04–E06: public/restricted projects, all task phases with two independent runtime operators, standalone/linked inquiries and answers without volunteer approval.
- [ ] 2.3 Run E07–E09: configured review, independent scoped verification versus canon, correction/supersession, private local assessment and explainable cold-start matching.
- [ ] 2.4 Run E10–E12: social walls/associates/blocks/reports, real HTTP/MCP parity, scan/quarantine/download/cleanup; no injected task expands authority.
- [ ] 2.5 Run E13–E16: privacy/export/purge, separate developer admin, disconnected/ambiguous writes with no queue on all clients and static/no-JS form/CTA flows.
- [ ] 2.6 Attach evidence per F01–F16 and every selected platform, noting native bulk-admin web handoff; no proposed optional research/streaming/federation/payment feature silently ships.

**Exit gate:** Every must-have feature has actual accepted journey evidence; incomplete smaller pilot is not mislabeled as the full five-platform release.

## Phase 3 — Privacy, rights and public claims

- [ ] 3.1 Confirm account export, immediate authority revocation and within 30-day purge; public forms 24-month identifier limit, erasure and backup restore reconciliation all work.
- [ ] 3.2 Confirm contribution hosting/display/downstream-reuse terms, support contact, consent purposes and research opt-in before external contributions; no content license inferred from software.
- [ ] 3.3 Approve five-locale Privacy/Data Retention/Terms/Acceptable Use text describing actual Exile/Brevo/AppWrite flows and online-only limits; do not claim automatic compliance/certification.
- [ ] 3.4 Confirm no license/EULA bundled under selected none; display © 2026 Exile Research Inc. All rights reserved for software, separate contributor rights notice.
- [ ] 3.5 Check landing/product/store descriptions make no proven intelligence, remote kill, truth-by-majority or universal safety claim; fictional examples and client release status labeled.

**Exit gate:** Rights/privacy/provider/consent/retention decisions are explicit, implemented and owner-approved; no tracking/sale/unsolicited marketing or unselected billing.

## Phase 4 — All-client quality and security closure

- [ ] 4.1 Confirm plan05 private report signed with zero open Critical/High and retests; Medium owners/dates present and applicable release blockers resolved.
- [ ] 4.2 Run all five locale primary/failure/policy screens in both themes; measured contrast, keyboard/screen-reader, TalkBack 48dp/dynamic type and native accessibility evidence.
- [ ] 4.3 Validate production docs/docs-json disabled, development export available for codegen, no unsafe-inline in API CSP, token/secret safe logs and strict allowed origins.
- [ ] 4.4 Validate browser memory-token behavior, mobile pin rotation/private-cache clearing, native secure-store/IPC/isolation and disconnected no-replay across process restart.

**Exit gate:** Security/localization/accessibility/online-only behavior is verified in release artifacts, not only developer builds.

## Phase 5 — Deployment, backups and performance

- [ ] 5.1 Confirm actual domain/static/product/API/MCP routing, certificate renewal, Coolify environment/probes, .env.sample completeness and missing-config fail-fast.
- [ ] 5.2 Confirm external DB backup schedule, AppWrite bucket backups/expiry/access controls and a successful restore; operational alerts go to an owner-monitored configured channel.
- [ ] 5.3 Measure p95 API/throughput/error budget under agreed O08 load; landing Lighthouse Performance/SEO/Accessibility95 target; document web bundle limits and low-end Android start/scroll results.
- [ ] 5.4 Rehearse rollback to previous compatible API/contracts/schema/client artifacts and reapply erasure/revocation; document migration forward/revert limitations.
- [ ] 5.5 Prepare native signing/notarization/install/update/rollback proof per selected desktop OS and signed Android AAB/internal-track install; no signing key in CI artifact.

**Exit gate:** Real environment/restore/rollback/performance/native install evidence meets agreed thresholds; missing thresholds are a blocker, not a pass.

## Phase 6 — Documentation and Go/No-Go

- [ ] 6.1 Update root/app READMEs, architecture/orchestration/models/route map/agent guidance and plans to match actual behavior; record every divergence/decision with test effects.
- [ ] 6.2 Prepare version, release notes, artifact inventory/checksums/SBOM, deployment and incident/credential compromise runbooks, privacy/support and moderation appeals paths.
- [ ] 6.3 Record owner Go/No-Go covering open decisions, acceptance/security/privacy/performance and selected native targets; no unchecked blocking item may be waived silently.
- [ ] 6.4 After separate release authorization, execute tagging/publish/deploy distribution steps and verify installed/hosted artifacts. Until then leave those steps pending with readiness evidence.

**Exit gate:** Owner Go and actual authorized release mechanics are recorded before calling the release shipped; readiness alone does not publish or tag.

## Quality gates

| Level       | Required evidence                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| Unit        | Relevant normalization/expiry/domain/client-state regression suites green in clean checkout.              |
| Integration | Actual DB/providers/MCP/native IPC/config/retention and migration/restore/rollback evidence.              |
| E2E         | E01–E16 plus signed/native/browser/device installs and all-client disconnect/cross-operator denial.       |
| Contract    | Versioned package/OpenAPI/Dart/tool compatibility; zero undeclared fields or unapproved breaking changes. |

## Definition of done

Every selected app and all must-haves are accepted with real evidence, security and privacy/rights gates are closed, clean builds/restore/rollback work and owner Go is recorded. Publication is an explicit release step, not a claim made by generating these docs.

Record actual commands, versions, fixtures, failures and evidence before checking slices. Update affected docs/assumptions if behavior changes. Commit after milestone slices; push only at major milestones under owner cadence. No production deployment, message sending or artifact publication occurs merely by closing this document.
