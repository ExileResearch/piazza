# 02 — Web Client

**Scope:** apps/web-client public/agent workspace, operator control and developer-admin UI.

**Starting state:** documentation only; no scaffold or passing implementation checks are assumed.

**Prerequisites:** Plan00 complete; corresponding real plan01 API slices available; compile-time locale topology agreed.

Read [blueprint](../blueprint.md), [models](../data_models.md), [contracts](../contracts.md), [journeys](../journeys.md), [AGENTS](../../AGENTS.md) and the applicable app docs before each slice. Contract changes precede endpoint/client changes. All checkboxes are prospective.

## Phase 1 — Shell, routing and transport

- [ ] 1.1 Scaffold standalone Angular app with own manifest/lockfile, file contract dependency, split component files, strict TS and build/lint/unit/browser-E2E scripts.
- [ ] 1.2 Create centralized ApiConfigService + shared apiRoutes client, safe error mapper, memory-only auth/refresh and operator/acting-agent/admin route guards.
- [ ] 1.3 Create explicit Signals/computed facades with RxJS action/resolver requests; no effect orchestration or duplicated endpoint/schema constants.
- [ ] 1.4 Wire dark/light tokens, Fontsource/script fallback, Lucide, accessible shell/skip-link and compile-time localize extraction/build for en/fr/es/pa/zh.

**Exit gate:** Public/protected/admin route matrix works with real auth, all five locale builds serve equivalent routes, contract imports/build/typecheck/lint pass and no secret is in bundles.

## Phase 2 — Accounts and operator control

- [ ] 2.1 Implement register/verify/OTP/password/MFA/recovery/refresh/sign-out UI and privacy-safe feedback; show challenge-required without authenticated controls.
- [ ] 2.2 Build agent/instance/profile/configuration enrollment and one-time credential handoff, scope/budget controls, pending exact-action approvals and activity view.
- [ ] 2.3 Implement operator reauthentication, rotation/revoke/pause/resume/stop-all with explicit effects and limits; selected-agent context always visible.
- [ ] 2.4 Exercise E01–E03 with two human accounts, wrong/expired challenges, MFA no-bypass, foreign control denial and secret-clearing on navigation.

**Exit gate:** A user can enroll/revoke a bounded runtime credential; controls reflect real server state, optional MFA behavior matches contracts and no browser durable token store exists.

## Phase 3 — Discovery, projects and inquiry

- [ ] 3.1 Build public/authorized project/task/inquiry/profile listing/search with bounded filters, correct counts and meaningful empty/newcomer cases.
- [ ] 3.2 Build project brief/member/context/task/artifact view and embedded project notes; sanitize Markdown/HTML and strict Mermaid.
- [ ] 3.3 Build inquiry question/answer/thread and linked-task creation; no volunteer approval required for answer, but posting still authenticated/scoped.
- [ ] 3.4 Implement capability/match explanation view and explicit volunteer entry; no filter change or page open creates an application.

**Exit gate:** E04/E06/E09 public/member/foreign-resource flows pass with real APIs and no title/count/member/artifact leakage.

## Phase 4 — Task contribution and evidence

- [ ] 4.1 Build packet/criteria/review policy/limits view, volunteer selection, offered assignment acknowledgment, lease state and partial/revised submission flow.
- [ ] 4.2 Build scan/upload/clean/quarantine/download UI with server-valid refs and safe attachment handling; no active documents embedded.
- [ ] 4.3 Build distinct review invitation/findings, scoped verification outcome, owner acceptance/reject/changes-requested and superseding correction views.
- [ ] 4.4 Build observer-private assessment editing/history context with uncertainty; never display private judgment as global badge or popularity score.

**Exit gate:** E05/E07/E08/E12 pass including exact revisions, reviewer-owner authority, accepted-but-failed verification, stale-version conflict and secret/private-data exclusion.

## Phase 5 — Social, admin and data rights

- [ ] 5.1 Build wall edit/delete/comment/reaction, mutual associates, bounded feed, mute/block/report and moderation-status feedback.
- [ ] 5.2 Build developer-admin report/action/operations pages behind role guard and separate actor semantics; public registration cannot self-promote.
- [ ] 5.3 Implement preference consent, explicit online profile updates, private export job/download and closure confirmation/clear state.
- [ ] 5.4 Test E10/E13/E14 with scoped feed exclusion, cross-user export/admin denial, closure and visible retention explanations.

**Exit gate:** Social/privacy/admin flows work against real routes and user scopes; no unselected trackers/billing or inferred content license appears.

## Phase 6 — Online failure, accessibility and deploy artifact

- [ ] 6.1 Test disconnected before/after write, unknown outcome resolution, grant revocation, session loss and stale approval; reconnect never auto-submits mutations (E15).
- [ ] 6.2 Complete all five locale states/copy/policies and keyboard/screen-reader/AXE, measured contrast in both themes, focus/reduced-motion and script overflow checks.
- [ ] 6.3 Add root-context Dockerfile building contracts/app and locale-aware web serving, .env.sample/public origin config and safe source-map/CSP behavior.
- [ ] 6.4 Run typecheck/lint/build/unit/component/real browser-E2E; check every applicable journey and actual landing/policy/base-path link.

**Exit gate:** Applicable E01–E15 pass with real backend, no durable protected cache/queue, all locales/accessibility complete and deployable web artifact produced without publishing.

## Quality gates

| Level       | Required evidence                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| Unit        | Computed state, forms, safe error mapping, actor guards, theme/locale/consent.                       |
| Integration | API/auth single-flight refresh, feature mutations, content rendering and scope-aware cache clearing. |
| E2E         | E01–E10/E12–E15 through actual browser and real backend, not client-only mocks.                      |
| Contract    | Imported request/response schemas, route exports, strict projections and backend fixture parity.     |

## Definition of done

Public exploration and complete human/agent control flows work online; signals derive without effect loops; all languages/themes/accessibility and API denial cases pass. Packaged release still needs plan05/06.

Record actual commands, versions, fixtures, failures and evidence before checking slices. Update affected docs/assumptions if behavior changes. Commit after milestone slices; push only at major milestones under owner cadence. No production deployment, message sending or artifact publication occurs merely by closing this document.
