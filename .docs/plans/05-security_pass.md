# 05 — Security Hardening and Polish

**Scope:** Independent evidence-based review of contracts, backend/MCP, web, Android, landing and selected desktop targets.

**Starting state:** documentation only; no scaffold or passing implementation checks are assumed.

**Prerequisites:** All app plans closed for intended release; disposable synthetic-data staging only; authorized non-destructive testing, no production scans.

Read [blueprint](../blueprint.md), [models](../data_models.md), [contracts](../contracts.md), [journeys](../journeys.md), [AGENTS](../../AGENTS.md) and the applicable app docs before each slice. Contract changes precede endpoint/client changes. All checkboxes are prospective.

## Phase 1 — Scope, evidence and secrets

- [ ] 1.1 Record staging targets/test accounts/authorization, dependency versions and ASVS Level 2/API-security threat coverage; choose applicable standard editions before claims.
- [ ] 1.2 Create private findings report: ID, area, severity Critical/High/Medium/Low, evidence, reproduction, remediation, retest status/owner.
- [ ] 1.3 Scan repo/history/build artifacts for secrets; rotate any exposed value. Check .env.sample/validation and no secret in Compose/image layers/clients.
- [ ] 1.4 Review structured logs/errors/spec examples/jobs for passwords, raw tokens, OTP bodies/hashes, email bodies/private payloads or unexpected identifying content.

**Exit gate:** Scope/test rules and private report exist; no unhandled credential exposure; configuration fails safely and no production/real user data is involved.

## Phase 2 — Authentication and authority

- [ ] 2.1 Test password hashing, non-enumerating register/login/OTP/reset, challenge expiry/purpose/atomic consume, abuse limits and MFA recovery/no alternate-path bypass.
- [ ] 2.2 Test refresh rotation/replay family revocation, sign-out/closure, step-up digest/expiry and one-time credential issuance/no plaintext receipt replay.
- [ ] 2.3 Test runtime credential/grant/identity revocation under HTTP and MCP, two-instance quota sharing, stop-all and no adapter service-role escalation.
- [ ] 2.4 Probe every private list/detail/search/count/feed/event/export/download with foreign/missing IDs and revoked memberships; public projections never include sensitive metadata.
- [ ] 2.5 Test public registration/admin-role mass assignment, agent self-grant, owner/participant/reviewer impersonation and administrator acceptance/verification conflation.

**Exit gate:** E01–E04/E08/E11/E14 authority denials pass consistently; MFA/revocation/role protections cannot be bypassed through another client/transport.

## Phase 3 — Domain races, resource abuse and epistemic integrity

- [ ] 3.1 Race offer approval/acknowledgment/expiry/submission/grant revoke/owner decision; verify transaction/version conflict semantics and no stale packet commitments.
- [ ] 3.2 Replay idempotency keys/usage/heartbeats and alter payload under same key; no double quota consumption/release, duplicate acceptance or resurrected lease.
- [ ] 3.3 Exhaust request/upload/concurrency limits and simulate retry storms; bound recursion, polling, thread depth, packet size and review loops; label reported usage accurately.
- [ ] 3.4 Exercise review-count/author conflicts, changed submission revision, acceptance after failed verification and rejected-but-passed evidence; no hidden trust score or private assessment leak.
- [ ] 3.5 Test controlled Sybil/collusion/prompt-injection fixtures only in sandbox, including malicious artifact credential requests; refusals outside grants do not damage commitment assessment.

**Exit gate:** E05/E07/E08/E09/E11/E15 race/resource/privacy cases pass and residual collusion/correlated-error limitations are documented honestly.

## Phase 4 — Input, storage and client attack surfaces

- [ ] 4.1 Fuzz scoped contract boundaries for unknown fields/mass assignment; parameterized SQL; Markdown/HTML stored XSS in all clients; strict Mermaid and URL sanitization.
- [ ] 4.2 Test SSRF only if server fetching is implemented: scheme/host/redirect/DNS/internal/link-local controls; do not invent an unnecessary URL-fetch feature.
- [ ] 4.3 Test AppWrite private bucket access, MIME/magic mismatch, oversized uploads, scanner outage/malware/quarantine, dangerous filenames and attachment/nosniff disposition.
- [ ] 4.4 Inspect browser token storage/CSP/CORS/HSTS, mobile Keystore/pinning/backup-pin rotation/private cache cleanup and absence of secrets in AAB.
- [ ] 4.5 Test Electron sandbox/node isolation, narrow IPC sender/argument validation, unsafe navigation/custom schemes/external links/downloads and secure-store fail-closed behavior.
- [ ] 4.6 Test static landing JS-off path, no private auth state/secrets/trackers, public form honeypot/rate/consent/HTML response injection and canonical typed errors.

**Exit gate:** E10/E12/E15/E16 client/storage/injection cases pass on every selected runtime; no untrusted file executes or private media bypasses authorization.

## Phase 5 — Privacy, operations and supply chain

- [ ] 5.1 Run export/closure as two operators, immediate credential/session/grant revoke and simulated30-day personal purge, including free text/media/assessments/indexes and identifying hashes.
- [ ] 5.2 Run24-month public-form identifier purge/earlier erasure; consent withdrawal and opt-in-only preference/research/marketing handling; compare policies to actual data flows.
- [ ] 5.3 Rehearse encrypted database/object backup restore, retention expiry and reapplication of erasure/revocation before traffic resumes; verify no private bucket backup is omitted.
- [ ] 5.4 Check least-privilege DB, no public DB port, non-root/minimal containers/read-only FS where possible, required health/readiness behavior and safe secret rotation.
- [ ] 5.5 Run dependency/container scans with current vulnerability data, lockfiles/digest pins/reproducible builds and per-release SBOM. No open High/Critical dependency finding.

**Exit gate:** E13 privacy/restore evidence passes, security observations are traceable, no sensitive log/output leak and provider/backup policy matches implementation.

## Phase 6 — Polish, remediation and owner review

- [ ] 6.1 Review all five locales, no hardcoded visible strings, source-language authored content, font/script coverage and both-theme measured contrast.
- [ ] 6.2 Run automated AXE plus manual keyboard/screen-reader, TalkBack/native reviews, focus/reduced-motion and 48dp checks on primary/destructive flows.
- [ ] 6.3 Remediate every Critical/High, retest each finding, assign Medium owner/due date and record approved bounded residual risks without hiding blockers.
- [ ] 6.4 Attach private findings summary/evidence to release record for owner review; restore any synthetic data altered by test pass.

**Exit gate:** Zero open Critical/High; all remediation retested; Medium triaged with owner/date; owner signs the private security findings report.

## Quality gates

| Level       | Required evidence                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------- |
| Unit        | Normalization, token-time/purpose checks, permission/transition/budget rules and client validator rejection.        |
| Integration | Cross-scope DB/provider/file/MCP/IPC/security controls on disposable actual services.                               |
| E2E         | All affected E01–E16 abuse/failure paths with synthetic operators in real packaged/browser/device clients.          |
| Contract    | Unknown fields rejected, safe errors/projections exact, all transport/IPC representations and generated DTOs agree. |

## Definition of done

No unremediated Critical/High finding remains, retests are evidenced, privacy/retention/operator authority is demonstrated and all selected clients meet accessibility/security gates. Do not claim a certification or untested universal safety.

Record actual commands, versions, fixtures, failures and evidence before checking slices. Update affected docs/assumptions if behavior changes. Commit after milestone slices; push only at major milestones under owner cadence. No production deployment, message sending or artifact publication occurs merely by closing this document.
