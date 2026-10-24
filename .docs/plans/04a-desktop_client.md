# 04a — Desktop Client

**Scope:** apps/desktop-client later Angular/Electron online application.

**Starting state:** documentation only; no scaffold or passing implementation checks are assumed.

**Prerequisites:** Core plan01/02 flows verified; O04 native targets/signing and secure-store compatibility decided; plan00 contracts current.

Read [blueprint](../blueprint.md), [models](../data_models.md), [contracts](../contracts.md), [journeys](../journeys.md), [AGENTS](../../AGENTS.md) and the applicable app docs before each slice. Contract changes precede endpoint/client changes. All checkboxes are prospective.

## Phase 1 — Target and trust-boundary decisions

- [ ] 1.1 Record supported OS/architectures, signing/notarization/manual-update approach, compatible framework/Electron versions and official implementation references.
- [ ] 1.2 Define main/preload/renderer boundaries, narrow typed IPC schema, sender/frame/origin validation and deny-by-default navigation/permission rules.
- [ ] 1.3 Choose OS secure credential backend per selected target, fail-closed no-plaintext behavior and session restoration; runtime credentials remain distinct.
- [ ] 1.4 Define no local agent hosting, shell execution, generic filesystem bridge, offline store or background automation; record any future exceptions as separate scope changes.

**Exit gate:** Explicit target/security design and credential-storage proof exist before native app implementation; no unsupported three-platform claim.

## Phase 2 — Isolated shell and renderer

- [ ] 2.1 Scaffold per-app Angular/Electron manifest/lockfile, contract file dependency, TS/HTML/CSS/spec split, typed preload and build/test scripts.
- [ ] 2.2 Load only bundled renderer content with sandbox/contextIsolation/nodeIntegration false, restrictive CSP and blocked unsafe new windows/navigation/schemes.
- [ ] 2.3 Wire Signals/computed/RxJS API facades, compile-time locale bundles and allowlisted API origin; no cross-editing web app source or root workspace.
- [ ] 2.4 Implement OTP/password/MFA/refresh secure-session bridge and selected-agent context; no generic IPC/network proxy.

**Exit gate:** Packaged app launches on selected test target, IPC rejection tests pass, auth works against real backend and secret material is absent from logs/bundles.

## Phase 3 — Core product and native handoffs

- [ ] 3.1 Implement applicable web journeys for control, identity, project/task/inquiry, review/verification/acceptance/private assessment and discovery.
- [ ] 3.2 Implement social/artifact/settings/export/closure and report status, opening bulk admin web view safely where needed.
- [ ] 3.3 Add user-triggered file picker/download with bounded typed handoff, attachment restrictions and safe system-browser external links; no auto-open/execute.
- [ ] 3.4 Test pause/revocation/resource limits, conflict/unknown outcome and offline before/after action; reconnect refreshes state and never queues mutations.

**Exit gate:** Applicable E01–E15 packaged real-API flows pass with two operators and no privileged renderer escape or stale automatic decision.

## Phase 4 — Native quality and signed installation

- [ ] 4.1 Run unit/IPC/schema tests, native integration and packaged E2E on every selected target, including OS secure-store failure/restart/sign-out.
- [ ] 4.2 Review en/fr/es/pa/zh localized routing/fonts, keyboard/screen-reader, contrast/both themes, reduced motion and native control labels.
- [ ] 4.3 Build root-context Docker harness for supported checks and selected native CI/package/sign runners with external owner-held secrets.
- [ ] 4.4 Produce signed native installers/checksums, install/uninstall and manual update/rollback proof; no automatic public distribution.

**Exit gate:** Every selected OS has actual install/security/accessibility evidence, no insecure secret fallback and no unresolved signing/distribution blocker.

## Quality gates

| Level       | Required evidence                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| Unit        | Bridge schema validation, window allowlists, explicit renderer state and error mappings.                       |
| Integration | Main/preload/OS secure-store/auth/file handoffs including denied sender and unsafe destination.                |
| E2E         | Applicable E01–E15 in packaged native app per selected OS and real backend; disconnect/restart/no-queue cases. |
| Contract    | IPC allowlist is typed/validated; API request/response projections match shared contracts and OpenAPI.         |

## Definition of done

Later desktop client meets the same operator/domain rules and tested online behavior as web, with explicitly selected signed native targets and no local-execution feature creep.

Record actual commands, versions, fixtures, failures and evidence before checking slices. Update affected docs/assumptions if behavior changes. Commit after milestone slices; push only at major milestones under owner cadence. No production deployment, message sending or artifact publication occurs merely by closing this document.
