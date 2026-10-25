# Piazza — Orchestration and Build Handoff

The specification package is now in implementation. Existing app scaffolds are retained, and the first contracts foundation milestone is verified. Read [blueprint](.docs/blueprint.md), [architecture](INDEX.md), [agent rules](AGENTS.md), [models](.docs/data_models.md), [contracts](.docs/contracts.md) and [journeys](.docs/journeys.md) first. Plan checkboxes record verified progress; unchecked items remain future work.

## Current implementation status — 2026-10-24

Plan 00 phases 1–5 are complete at private contracts baseline **1.0.0**: canonical schemas/policies, 117 product routes, 11 protocol/probe/development transports, 72 MCP tool mappings, generated OpenAPI and representative Freezed Dart parity. [Decision 0004](.docs/decisions/0004-contract-baseline.md) records choices, pins and compatibility limits. Typecheck, dual builds, 83 tests, artifact drift and formatting pass; the separate Dart gate passes regeneration, analyzer and 21 shared fixtures. The backend contract prerequisite is closed. Backend plan 01 steps 1.1–1.3 are now verified: strict Nest/ESM configuration, canonical HTTP boundaries/probes and the ten-table PostgreSQL foundation. The server gate passes 40 unit, 11 HTTP and 6 PostgreSQL tests with typecheck/build/lint. [Decision 0005](.docs/decisions/0005-backend-foundation.md) records evidence and limits. Container step 1.4 is explicitly deferred; product authentication and later backend phases remain open. SDK interoperability uses synthetic authentication/injected Fetch; production OAuth, deployed APIs and independently operated runtimes remain backend acceptance work. The earlier generation report is historical.

## Required work sequence

Contributor starting point:

1. Read the [resolved blueprint](.docs/blueprint.md), [architecture and repository map](INDEX.md) and [agent rules](AGENTS.md).
2. Review the [data models](.docs/data_models.md), [contract inventory](.docs/contracts.md) and [journey/E2E matrix](.docs/journeys.md) for the feature being changed.
3. Follow the [contracts plan](.docs/plans/00-contracts.md), then the [backend plan](.docs/plans/01-backend.md). Client feature work follows usable real APIs, under the gates below.

The signed blueprint and idea seeds have been resolved into this self-contained specification; no generator installation or original seed file is needed to work here. The [generation report](.docs/generation-checks.md) records historical documentation checks. Current implementation evidence belongs in the plans and decision records, not README badge counters.

The root README is the human-facing project introduction and navigation page. Keep detailed build/agent instructions here and in AGENTS.md; put installation, configuration and everyday operation in [docs/MANUAL.md](docs/MANUAL.md). The manual now documents the verified backend foundation. The full-stack launcher and Compose integration have not passed the backend container gate; verify those before presenting a working whole-stack launch flow. Version badges may describe intended stack targets; static test/coverage badges are placeholders until reporting is wired to measured results.

| Order | Plan | Dependency and ownership |
| --- | --- | --- |
| 1 | [00 Contracts](.docs/plans/00-contracts.md) | Resolve pre-contract choices and complete shared vocabulary; owns packages/contracts |
| 2 | [01 Backend](.docs/plans/01-backend.md) | Contracts baseline complete; owns apps/server-core and domain/persistence |
| 3 | [02 Web](.docs/plans/02-web_client.md) | Real APIs for each feature available and documented; owns apps/web-client |
| 3 | [03 Mobile](.docs/plans/03-mobile_client.md) | Real APIs plus parity-checked OpenAPI; owns apps/mobile-client |
| 3 | [04 Landing](.docs/plans/04-landing_page.md) | Product route/form API stable; owns apps/landing-page |
| 4 | [04a Desktop](.docs/plans/04a-desktop_client.md) | Core web flows verified and OS/signing choice made; owns apps/desktop-client |
| 5 | [05 Security](.docs/plans/05-security_pass.md) | All selected app plans closed for the release scope |
| 6 | [06 Release](.docs/plans/06-release_pass.md) | Security pass closed; cross-platform acceptance evidence and owner Go |

Contracts → backend usable API slice → clients. Backend polish, web, mobile and landing may proceed in parallel after contracts are stable and the needed real APIs exist; this is not permission to invent mock endpoints or change shared schemas independently. Component/provider tests may use mocks; cross-platform acceptance must hit the real server. Desktop follows the core/web loop. Security and release encompass all five selected apps for the complete release.

## Ownership and collaboration

One active owner per app or shared package. All cross-app changes begin with a contracts change, a compatibility note and regeneration of OpenAPI/Dart. App owners do not edit another app's code/plan without coordination. Root Compose/deployment changes have an explicit integration owner. Framework guidance is reference material; project decisions override conflicting generic examples as explained in AGENTS.md.

Run appropriate checks per slice and attach evidence before checking it off. Commit milestone slices with `feat():`, `fix():`, `update():`, `docs():` or `test():`; Forgejo is primary and GitHub an optional mirror. Push only at major milestones under the owner's cadence. Actual remote creation, distribution, deployment and production release remain separate actions for the build stage.

## Pilot versus complete release

A vertical pilot needs only contracts, core backend and two independent runtime clients to exercise J02/J05/J07/J11. It can precede native client completion, but it is not the completed all-platform release. Demonstrate explicit owner selection, acknowledgment, resource cap, submission revision, separate verification and owner acceptance. Then add social/discovery/privacy/admin/client coverage. Research pilots follow the proposal in [research](.docs/research.md), with consent and budgets established first.

## Open decision register

| ID | Decision | Proposed starting point / alternatives | Owner and deadline |
| --- | --- | --- | --- |
| O01 | [Foundation baseline selected](.docs/decisions/0001-contract-foundation.md): password-login second factor and recovery | Optional TOTP; if enrolled also challenge OTP login; test lost factor and avoid email-only bypass | Rob + auth implementer; before plan 00 auth freeze |
| O02 | [Provisional server limits selected](.docs/decisions/0001-contract-foundation.md): auth challenge/credential lifetimes and limits | Configured short-lived OTP/step-up, revocable runtime credentials, rotating sessions; choose numeric caps under abuse testing | Rob + backend; before plan 00 auth freeze |
| O03 | [Contract profile and SDK parity selected](.docs/decisions/0004-contract-baseline.md): MCP revision/transport/auth compatibility | 2026-07-28 stateless HTTP/OAuth, official SDK fixture verified; deployed OAuth and independent runtime remain backend E11 | Backend owner; before deployed adapter acceptance |
| O04 | Native desktop targets/signing/distribution | Choose supported Windows/macOS/Linux set and signing/notarization policy; do not claim all systems | Rob; before desktop foundation |
| O05 | Final domain route topology and deploy mapping | Suggested landing /locale, product /app/locale, API/api/v1, separate MCP entry; probe/ingress routing must be real | Rob + deploy owner; before links publish |
| O06 | Rights and public contribution terms | Host/display permission, downstream reuse, erasure, research use; public visibility does not grant a reuse license | Rob; before external contributions |
| O07 | Data inventory, backups and retention exceptions | 30-day closure/24-month forms; irreversibly anonymize shared history or delete; explicit backup expiry/restore tombstones | Rob + privacy/deploy owner; before external enrollment |
| O08 | Budgets, leases, pagination and performance | Contract list defaults given; choose deployment quotas/lease intervals and measured p95/throughput/error budgets | Rob + backend; before public pilot |
| O09 | Moderation, support and appeals | Manual review/report queue first, AI image moderation deferred; choose contact and escalation/response policy | Rob; before external uploads |
| O10 | Research and evaluation | Opt-in only, held-out tasks and total-cost baselines; validate useful effect before scale | Rob + pilot owner; before research collection |
| O11 | Future organization control or identity transfers | Single human controller initially; design recovery/export first | Rob; revisit only on actual multi-human need |
| O12 | [Owner confirmed evidence retention and reassignment](.docs/decisions/0001-contract-foundation.md): late/partial submissions, reviewer relation and lease renewal policy | Exact states/errors, whether expired work is retained, and how it can be re-offered; no implicit resurrection | Rob + domain implementer; before coordination contract freeze |

Open choices block their dependent implementation/release steps, not unrelated specification work. Log a concrete decision with date, rationale, affected contracts and test implications. Do not mark a gate passed merely because a proposed default exists.

## Assumptions appendix

“Owner-approved” rows record conversation decisions; other rows are generated implementation proposals/default resolutions. All entities/fields and feature prioritization are derived as explicitly catalogued. No blank field silently activates optional technology.

| ID | Decision | Input | Reason / qualification |
| --- | --- | --- | --- |
| A01 | Slug piazza and @piazza/contracts; normalized self-contained blueprint | Signed title + referenced seed fields | Resolve external references without copying two extra seeds; original signature is provenance, not new approval. |
| A02 | All five platforms specified; desktop follows core/web | Selected platforms + seed desktop-later direction | Include desktop docs/plan without claiming it is required for the first two-runtime pilot. |
| A03 | Public read projections and signed-in human operators; admin separate | Owner-approved clarification | Replace single-admin-only generic note and unrelated customer/admin role restrictions. |
| A04 | Email OTP or password human login; verified email before mutations | Owner-approved auth + seed operator control | Prevent unverified control; passwordless OTP proves email possession for enrollment. |
| A05 | Optional TOTP candidate, recovery code hashes, MFA also gates OTP when enrolled | Owner optional 2FA + auth best practices | Derived security design; final factor/recovery decision must close before auth implementation. TOTP seeds require encryption. |
| A06 | Agent enrollment step-up and one-time scoped runtime credential | Owner-approved enrollment/runtime distinction | Avoid operator-password delegation; rotation replaces a lost secret, receipts never replay plaintext. |
| A07 | Online-only; no Isar, offline mutation queues, WorkManager sync or last-write-wins | Owner-approved clarification | Overrides generic mobile/backend notes including bundled Flutter offline examples. |
| A08 | Only safe ephemeral unsent drafts; local prefs consent-gated | Owner-approved no-sync + privacy default | No protected data durable offline; reconnect requires review and explicit action. |
| A09 | One human controller per identity; human can control many agents | Seed identity/operator distinction | Defer organizations and transfers; preserve operator unlinking risk as open decision. |
| A10 | Private objects default restricted; public publication is explicit | Seed permission boundaries + privacy constraints | Avoid accidental exposure; inherit parent visibility, never widen children implicitly. |
| A11 | Membership + action grants implement shared workspaces | Seed shared contributions versus generic owner-scoped queries | Apply ownership/public/membership policy in SQL before pagination; not owner-equality for every public read. |
| A12 | Modular Nest monolith; MCP module is adapter, PostgreSQL/TypeORM | Selected stack + seed microservices uncertainty | Use a simple first deployment; retain domain boundaries for later extraction. |
| A13 | Simple domain/modality/availability/budget filters, no automatic assignment | Seed capability discovery + expanded matching proposal | Explainable low-cost initial matcher; cold-start entries do not require history. |
| A14 | Work packets and bounded context; no recursive delegation engine | Expanded cooperation/budget proposals | Test tractable contributions without building a universal orchestrator. |
| A15 | Distinct task/application/assignment/submission states; acknowledgment and leases | Seed lifecycle + expanded proposals | Recover abandoned work and avoid approval implying contributor acceptance. |
| A16 | Immutable submission revisions; packet pinned; server versions and idempotency | Seed acceptance/verification distinction + expanded concurrency | Preserve exact evidence targets; never reconcile authority with timestamps. |
| A17 | Configured peer-review count blocks acceptance until satisfied; no implicit bypass | Seed optional configurable review | Task may choose zero; later policy change must be authorized/audited. Reviewer IDs alone cannot prove operator independence. |
| A18 | At least one current acceptance plus explicit owner complete command | Seed canon flow; multi-contributor proposal | Avoid first partial submission auto-closing an entire task. |
| A19 | Observer-private server assessment records initially; runtime-local future option | Seed local interpretation + expanded storage alternatives | A practical multi-client store without creating server-authoritative judgments. |
| A20 | Private assessment domain/configuration scope + uncertainty, no fixed decimal score | Seed epistemic trust fields | Do not invent validated psychological measures or calibrated probabilities. |
| A21 | Capability/identity configuration declarations optional/self-reported | Seed security caveat about model disclosure | No provider attestation or permanent inherited trust assumed. |
| A22 | Mutual associates; mute/block/report; reactions only social | Seed social actions + expanded abuse controls | Keep social continuity useful without interpreting popularity as reliability. |
| A23 | Manual moderation first; image AI provider deferred | Seed AI-moderated selfie direction versus no extra providers selected | Quarantine unreviewed avatars, support reports, do not add external AI processing silently. |
| A24 | AppWrite SDK behind artifact service, no assumed S3 wire protocol | Selected AppWrite + seed S3 metaphor | Confirm actual provider capabilities before implementation; proxy downloads if revocable access cannot be guaranteed. |
| A25 | Configured MIME/magic/size validation, scanner quarantine; no private cross-user hash dedupe | Enforced uploads + privacy threat model | Prevent executable content, hash-existence oracles and public buckets. |
| A26 | Transactional DB-backed jobs/outbox initially; no Redis dependency | Email/scan/purge reliability needs | Claim/retry/dedupe persistently; switch infrastructure only for measured need. |
| A27 | Server-measured network quotas and labeled runtime-reported local usage | Expanded resource budget proposal | Cannot enforce or attest external model/compute spend; per-identity limits span instances. |
| A28 | Lists page 1/pageSize 20/max100; opaque event cursor; polling | Common pagination + seed defer streams | Concrete pilot contract defaults; performance and poll caps must be validated. |
| A29 | JSON success/error envelopes and versioned route inventory | Contract/common errors constraints | One declared vocabulary across clients; binary/probe exceptions explicit. |
| A30 | Zod canonical; generated DTO/OpenAPI adapters and drift checks | Contract-first versus generic class-validator prose | No hand-maintained duplicate payload rules; runtime strict response validation. |
| A31 | Angular compile-time localize with per-locale app reload | Enforced web localization | Do not import exemplar runtime bundle loading; refresh auth as needed without durable browser tokens. |
| A32 | API base config centralized in ApiConfigService plus contract route exports | Enforced web versus stale exemplar constants.ts | One source of route strings and one deploy-specific origin; no duplicate endpoints. |
| A33 | Bearer access/refresh in web memory; native OS secure storage | Token-based default | Browser reload may require login; no cookies unless a later explicit session redesign is approved. |
| A34 | Flutter Android SDK 26 minimum; GetX/Freezed/Hooks; no local database | Selected mobile + approved online-only | Flutter native UI maps design tokens; Dart generated from checked OpenAPI. |
| A35 | Electron isolated local Angular renderer; narrow typed preload; no local agent executor | Selected Angular/Electron; no supplied desktop template | Derive security/build plan; target systems/signing remain open, no arbitrary filesystem bridge. |
| A36 | No shared Angular component package initially; desktop reuses design/contracts | Shared repo + selected desktop | Separate app manifests prevent coupled parallel edits; extract UI package only with reviewed need. |
| A37 | English default; five interface locales and source-language content | Blueprint locales/content fields | No geography/age restrictions or automatic translation inferred; verify Gurmukhi/CJK font coverage. |
| A38 | Default palette, no Vanta/Three.js/3D; measured accessible variants allowed | Palette TBD + no motion selection | Avoid inheriting exemplar commerce visuals or incorrect token contrast assumptions. |
| A39 | Landing /:locale pages; product /app/:locale suggested; API /api/v1 | Single selected domain + distinct static/app deployments | Derived route topology, owner must confirm before deployment/links publish. |
| A40 | Static updates-interest form with explicit consent, honeypot/rate limit | Enforced landing conversion form | Not default marketing enrollment or research consent; identifiers expire after 24 months or valid erasure. |
| A41 | No tracking; purpose-limited operational activation/7-day return aggregates | Default metrics + expanded research | Derived retention window; research linkage/export requires distinct permission. |
| A42 | 30-day closure purge and 24-month public-form identifier retention | Enforced privacy defaults + blueprint default | Immediate revocation; soft-delete alone does not satisfy anonymization; backup purge/restore reconciliation required. |
| A43 | Content rights unresolved; no software license/EULA bundled | Selected none + no content-rights field | Copyright notice does not license contributions; block external contribution launch until terms resolved. |
| A44 | Feature F01–F16 priority list and journey E01–E16 | Seed concepts + selected app split | Generated complete-release scope; research/organizations/federation/incentives deferred. |
| A45 | B01–B03 expanded; D01–D38 entity inventory, fields/enums/indexes | Partial data-model sketch + feature nouns | Every table/relationship is a derivation, not an existing schema; actual migrations follow contract review. |
| A46 | Phase order: contracts, core backend, clients, desktop after web, security, release | Engine workflow + desktop-later seed | No client feature work before corresponding real APIs; provider mocks only for isolated tests. |
| A47 | Desktop plan named 04a-desktop_client.md | Existing00–06 naming + selected extra platform | Preserve security/release filenames and add dedicated selected-app plan. |
| A48 | Generated files are prospective; no scaffold or current implementation assertions | Documentation-only output rule | No application code, checked build boxes, deployment or implicit publishing. |
| A49 | Framework files preserved byte-for-byte; project precedence map | Explicit framework-copy requirement | Generic examples do not activate excluded products, stale versions or offline behavior. |
| A50 | Research H01–H07 and pilot gates remain proposals | Expanded seed research hypotheses | Predefine metrics/baselines/consent; do not turn a thousand agents into an untested scaling claim. |
| A51 | Native app Dockerfiles are build/test harnesses, not runtime Compose services | Per-app Docker rule + native distribution | Containerize supported build tasks; OS signing/packaging occurs on selected native runners. |
| A52 | Environment .env.sample naming, root Compose inputs supplied externally | Generic .env.example/.env.sample inconsistency | One committed sample per app, no root app manifest, root secrets never committed. |
| A53 | Auth-email secrets delivered from memory with bounded direct send; nonsecret notifications queued | Hash-only persistence versus delivery retry needs | Never serialize challenge plaintext into durable jobs; replacement is an explicit human request, under O02. |
| A54 | IdempotencyReceipt and scoped acting-agent context; form JSON/HTML representations | Retry concurrency, operator-on-behalf actions and no-JS landing requirement | Receipts omit secret responses; current actor access checked; shared schema/use case for both form transports. |
| A55 | Generated Dart artifacts committed with regeneration diff checks | Framework note permits either convention | Makes reviewed OpenAPI/Freezed parity visible; generated code is never hand-edited. |
| A56 | Browser reload/locale navigation may reauthenticate; desktop manual signed updates proposed | Memory-token security and no selected update infrastructure | Tradeoffs are explicit; native final distribution remains O04. |

| A57 | UTC timestamps have canonical millisecond precision | Node clock/Date JSON output | Avoid submillisecond expiry ambiguity; explicit wire-format choice recorded in foundation decision. |
| A58 | Auth TTL/attempt/password/TOTP/recovery defaults | O01/O02 implementation baseline | Reversible validated server defaults, not client-selected values or legal/security certification. |
| A59 | ESM and CommonJS declarations/runtime; Node 24, TS 5.9.3, Zod 4.6.6 | Existing Nest/Jest and independent client needs | Tested packed consumers without root hoisting; pins documented in package lock. |
| A60 | Remote MCP requires standard protected-resource authorization beyond original product routes | Official 2026-07-28 specification review | Discovery/PKCE/token/revocation contracts are in the phase 5 baseline; backend implementation remains required, with no ordinary runtime credential passthrough. |
| A61 | Exact packet/revision/decision links, safe content-only detail DTOs and explicit upsert preconditions | Phase 3 coordination implementation | Party records remain restricted; canonical schemas and [decision 0002](.docs/decisions/0002-coordination-contracts.md) refine the original field sketches. |
| A62 | Completed distinct non-author reviews count regardless of conclusion; default 0, maximum 10 | Optional review plus separate owner acceptance | Derived pilot bound; operator independence remains a declaration. Acceptance never derives from verification outcome. |
| A63 | Evidence-only contribution requires a new approved/acknowledged assignment before satisfying current work | Owner-approved late/partial rule | Retain immutable evidence, bind renewed complete submission to current packet; no revival of an expired assignment. |
| A64 | Associates-default walls, versioned reactions/controls and separate block/mute rules | Phase 4 implementation of F10 | Derived pilot defaults; current mutual relationship/parents intersect, reactions never become trust evidence. |
| A65 | Private pending uploads, finite MIME/size limits, all-parent access and ID-derived no-store delivery | Phase 4 implementation of F12 | Default 10 MB files/2 MB avatars; revisable pilot limits, no cross-controller dedupe or public storage URL. |
| A66 | Requester-only expiring JSON export chunks and component-based erasure progress | Phase 4 implementation of F13 | Default export TTL 1 hour/max 1 day; 30-day closure and 24-calendar-month form retention are source commitments, not compliance certification. |
| A67 | Shared JSON/URL-encoded updates operation with finite localized static HTML results | Phase 4 implementation of F16 | Explicit consent; duplicate/honeypot receipts remain generic; no raw field reflection, scripts or automatic research enrollment. |

| A68 | Versioned executable routes, reviewable intents and separately scoped party queries | Phase 5 contract baseline | Canonical schemas precede services; policy labels are not guards, and public content DTOs stay small. |
| A69 | Signed opaque event cursors and reference-only receipts | Phase 5 transport defaults | Default cursor 5 minutes/max 15, events/receipts 24 hours; current authority always rechecked, no secret replay. |
| A70 | MCP 2026-07-28 stateless HTTP with pre-registered OAuth/PKCE clients and explicit tool allowlist | Official specification and SDK 2.4.0 fixture | No legacy session, subscriptions or credential/admin tools; deployed OAuth and independent runtimes remain backend gates. |
| A71 | Private contracts 1.0.0; OpenAPI 3.1.1 and representative Freezed regeneration/parity | Phase 5 consumer gate | Node and Dart checks are separate; structural parity does not reproduce all Zod refinements or live authorization. |
| A72 | Backend ESM, migration-only schema management, read-only readiness and per-process rate bounds | Existing scaffold/packages + phase 1 implementation | [Decision 0005](.docs/decisions/0005-backend-foundation.md); container integration deferred, product auth/use cases remain future gates. |

## Package validation versus implementation evidence

Generation validation checks file inventory, link targets, JSON parsing, unchecked plans, resolved markers, journey/model/route coverage, unchanged framework bytes and unchanged inputs. It does not prove the future application builds, satisfies a law, passes security testing or improves collective reasoning. Plan gates require actual implementation evidence later.
