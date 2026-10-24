# 03 — Mobile Client

**Scope:** apps/mobile-client Android Flutter/GetX online companion.

**Starting state:** documentation only; no scaffold or passing implementation checks are assumed.

**Prerequisites:** Plan00 baseline and needed real plan01 APIs available; checked OpenAPI export exists; online-only override is mandatory.

Read [blueprint](../blueprint.md), [models](../data_models.md), [contracts](../contracts.md), [journeys](../journeys.md), [AGENTS](../../AGENTS.md) and the applicable app docs before each slice. Contract changes precede endpoint/client changes. All checkboxes are prospective.

## Phase 1 — Dart parity and online foundation

- [ ] 1.1 Scaffold Flutter/Android app with pubspec lock, strict analysis, formatting/unit/widget/integration scripts and generated Freezed/json DTO pipeline from OpenAPI.
- [ ] 1.2 Check requiredness/enums/nullability/time/error/auth union fixtures against canonical contracts; generated files committed and regeneration diff-gated.
- [ ] 1.3 Register GetxService Api/Auth/Theme/Locale, named GetPage routes/GetMiddleware/Bindings, .obs/Obx feature controllers and widget-scoped Hooks.
- [ ] 1.4 Wire GetConnect TLS/pinning configuration, Keystore secure credentials and five-locale native tokens/fonts; no Isar, PendingWrite or sync background service.

**Exit gate:** flutter analyze/format/tests pass, emulator boots online/disconnected safely, generated API call round-trips and contract/Dart fixture parity passes.

## Phase 2 — Account and operator controls

- [ ] 2.1 Build OTP/password enrollment/login, verification, enrolled MFA, recovery and single-flight refresh; tokens only secure storage and no provider keys in AAB.
- [ ] 2.2 Build controlled agent/instance/profile/configuration list, enrollment/one-time secret view, grants/budgets/activity and exact-action approval inbox.
- [ ] 2.3 Add pause/revoke/resume/stop-all, scope-visible confirmations and auth expiry clearing; no false promise that phone terminates local compute.
- [ ] 2.4 Run E01–E03 in emulator with two operators and secret/log inspection; test deep-link auth safely without runtime secret URLs.

**Exit gate:** Human auth and controller lifecycle work with live server; foreign controls and factor bypass fail; secrets are cleared from UI/cache and secure-store fallback is safe.

## Phase 3 — Coordination, evidence and files

- [ ] 3.1 Build project/task/inquiry search/detail, capability filters, packet context, members, volunteer/offer/acknowledgment/lease/submission and threaded answers.
- [ ] 3.2 Build optional review, separate verification/owner decision and private assessment with exact revision/configuration/uncertainty labels.
- [ ] 3.3 Build artifacts picker/upload/scan/error, clean-image display and authorized binary attachment download; private image caches cannot survive logout/access loss.
- [ ] 3.4 Cover E04–E09/E12 on live backend with parent-scope denial, stale writes, late/partial result and accepted-but-failed verification cases.

**Exit gate:** Core tasks/inquiries/evidence/discovery/files work end-to-end on device with generated DTOs, no queue, and correct resource/actor boundaries.

## Phase 4 — Social, privacy and connection handling

- [ ] 4.1 Build wall/feed/associate/comment/reaction, mute/block/report and own moderation status; link bulk developer console to trusted web route.
- [ ] 4.2 Build consent/theme/locale/settings, export/download and account closure; clear secure credentials/private in-memory/media state.
- [ ] 4.3 Implement disconnected/retry screens and app-resume live revalidation; no offline data mutation or WorkManager sync.
- [ ] 4.4 Run E10/E13/E15 and E14 report-role checks in airplane mode before/after commands and across process restart; outcome unknown recovers existing state only.

**Exit gate:** No reconnect causes a queued approval/grant/assignment; account export excludes others and closure immediately revokes; social scope checks hold.

## Phase 5 — Android accessibility and internal release

- [ ] 5.1 Review .tr copy/all five locales, Gurmukhi/CJK fallback, 48dp targets, text scaling, TalkBack and reduce-motion; no color-only state.
- [ ] 5.2 Record SDK 26 min and current target SDK/version choices; verify certificate backup pins/rotation, dependency locks and no secret in package/logs.
- [ ] 5.3 Prepare Android Docker build/test harness from root context and native emulator runner; signing secrets external/owner-held.
- [ ] 5.4 Build signed AAB, privacy/data-safety/store listing, install from internal testing and record device test evidence without public publication.

**Exit gate:** analyze/format/unit/widget/integration/contract parity all pass; TalkBack/five languages are reviewed; signed internal-test installation succeeds.

## Quality gates

| Level       | Required evidence                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------------- |
| Unit        | Generated DTO parsing, controller transitions, error mappings, grants/retry view behavior.                            |
| Integration | GetConnect auth/refresh, services/controllers, image/download scope and generated-model round trips.                  |
| E2E         | Applicable E01–E10/E12/E13/E15 plus report-role denial on real API in emulator/device, airplane mode/process restart. |
| Contract    | OpenAPI regeneration diff, canonical Zod-to-Dart enum/nullability/error fixtures; no hand-maintained DTO fork.        |

## Definition of done

Android online core parity is demonstrated without offline database/sync, unsafe credential storage or competing frameworks; signed internal artifact is tested and accessibility complete.

Record actual commands, versions, fixtures, failures and evidence before checking slices. Update affected docs/assumptions if behavior changes. Commit after milestone slices; push only at major milestones under owner cadence. No production deployment, message sending or artifact publication occurs merely by closing this document.
