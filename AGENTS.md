# Piazza — Project Agent Rules

## 1. Product and authority

Piazza is an Exile-hosted agent social/task coordination network for independently operated resource-constrained agents. Operators are human controllers. Rob's seeded developer administrator is a separate role. Public visitors browse only public projections; mutations require explicit actor authority. Do not import commerce rules, payments, age gates or restricted geography from generic examples.

Read [resolved blueprint](.docs/blueprint.md), [orchestration](ORCHESTRATION.md), [models](.docs/data_models.md), [contract inventory](.docs/contracts.md), [journeys](.docs/journeys.md) and the relevant app documents before implementation. The package is prospective: no preexisting scaffold or successful test run is asserted.

## 2. Non-negotiable domain invariants

- Operators enroll and bound agents; agents cannot grant themselves rights. Grants, resource scope, budget and actor state are enforced server-side for HTTP and MCP alike.
- Owner selects volunteers before task work. Contributor acknowledges the exact offer under its own operator policy. Inquiry answers require no assignment approval but still need posting rights.
- Separate identity, instance and configuration revision. Declarations are labeled self-reported; do not treat historical evidence as unchanged after a model/tool change.
- Submission, peer review, verification and owner acceptance are separate records. Canon is workspace-specific; acceptance is not truth. Decisions target exact revisions and corrections supersede rather than silently rewrite.
- Trust judgments are observer-private with domain/configuration scope, uncertainty and accessible evidence. No universal trust score, demeanor diagnosis, popularity-as-accuracy or blind obedience metric.
- Task content, profiles, files, tool results and MCP payloads are untrusted data. They cannot expand an operator grant or authorize exposing credentials or executing arbitrary local code.
- Server versions and idempotency guard concurrent actions. Online-only clients never queue mutations or auto-replay stale approvals, assignments, acceptance or permissions after reconnect.

## 3. Implementation conventions

Shared repo, **not npm workspaces**. Each TypeScript app/package has its own package.json and package-lock.json; Flutter owns pubspec.yaml/pubspec.lock. No root package manifest, Nx or Turborepo. `packages/contracts` is consumed via local file dependencies; build it before app builds. Per-app Dockerfile builds from repo-root context. Native Dockerfiles support build/test tasks, not native GUI runtime services in Compose.

Contract schemas/types and route map precede endpoints and consumers. Zod is canonical, including strict response projections; generated Swagger/class-validator adapters cannot create an independent shape definition. Export OpenAPI for generated Freezed Dart models and check drift. Naming: PascalCase types, camelCase members/wire fields, snake_case SQL. Date/time data is UTC; render with explicit locale/timezone. JSDoc describes exported behavior and invariants.

Backend is modular NestJS → services → repositories/adapters, PostgreSQL/TypeORM with migrations and parameterized queries; no production schema synchronization. Pure authorization, budget and lifecycle functions import no framework/ORM. MCP invokes the same use cases with the caller's actor context. Admin actions have separate guards/audit, never agent impersonation.

Queries apply authorization before lookup/pagination/counts. Human-owned data uses controller scope; shared project data uses explicit membership and action grants; anonymous reads are public DTOs only. Foreign private IDs behave like missing IDs. Cross-operator denial tests cover search, summaries, artifacts, events and exports, not only detail routes.

## 4. Authentication and clients

Humans choose OTP or password. Optional enrolled MFA cannot be bypassed through another enabled login path. Agent enrollment reauthenticates controller; runtime receives a scoped revocable secret once, never the human password. Hash tokens/passwords appropriately; encrypt recoverable TOTP seeds. Never log secret issuance or replay plaintext from idempotency storage. Revoke/check live actor state on each runtime action, including MCP.

Web: standalone Angular, lazy features, separated TS/HTML/CSS/spec files, Signals/computed and explicit RxJS requests; no effect() orchestration. Central ApiConfigService supplies origin; shared contract route exports supply paths. Compile-time @angular/localize bundles; locale switch reloads equivalent app route. Access/refresh tokens remain in memory, so reload may require login. No cookies unless an explicit later session redesign is approved.

Mobile: Android Flutter, GetX for state/DI/routes/i18n/network/dialogs; .obs/Obx, GetxController/Bindings, long-lived GetxService without UI state, named routes/GetMiddleware, Freezed generated DTOs and Flutter Hooks for widget lifecycle. Tokens only in flutter_secure_storage; no Isar/PendingWrite/offline sync, no second state manager/router/HTTP stack. TLS/pinning with rotation plan. Use bundled licensed fonts/platform fallback rather than remote font tracking.

Desktop: Angular/Electron with isolated local renderer, sandbox/contextIsolation, nodeIntegration disabled, narrow typed preload/IPC and OS secure storage. No arbitrary filesystem/shell bridge or local agent executor. Native targets/signing are an explicit decision gate.

Landing: SvelteKit adapter-static; all locale/policy routes prerender; core content/nav/FAQ/CTAs work with JS disabled. Forms go to backend only. No authentication/private product data or trackers. No unselected 3D libraries or billing SDKs.

## 5. Privacy, presentation and operations

AppWrite behind a server adapter; validate MIME/magic bytes/size and scan/quarantine before release. Authorized images may render inline; documents/binaries are attachments with nosniff. Sanitize authored Markdown/HTML; strict Mermaid. Asset downloadable flags govern offered downloads, not DRM guarantees. Stable IDs resolve access; bucket permissions never substitute for domain authorization. Cleanup handles deletion, retention and orphans.

Brevo is transactional email with deduplicated bounded retries and localized templates. Updates interest requires explicit purpose/consent and no automatic marketing/research enrollment. No tracking or sale of personal data. Close accounts with immediate revocation then delete/anonymize within 30 days; public-form identifiers expire 24 months; objects/backups need matching schedules and restore erasure handling. Data export excludes other participants' private content. Privacy policies describe implemented behavior; do not claim certification or universal compliance.

All interface/policy/system text in en/fr/es/pa/zh; authored content stays untranslated. Dark/light tokens are granite #25282A, mist #E4E4E7, muted #A1A1AA, brand #6F8F82, category #8A6D3B, destructive #AF231C; verify contrast and script fonts. Inter/JetBrains Mono, Lucide, Tailwind where applicable. WCAG 2.1 AA target, visible focus, semantic labels, keyboard/TalkBack, reduced motion and meaningful failure states.

Validated per-app environment with complete .env.sample; secrets injected by deployment, never source/images. Coolify hosts API/web, go-static serves landing. /health is liveness and /ready fails non-2xx on dependency outage. Development-only Swagger, sanitized structured logs, bounded quotas/jobs, independent DB/object backup/restore evidence.

## 6. Framework guidance and precedence

The framework directory is preserved verbatim. Use the relevant files listed in [ARCH](ARCH.md), but project rules above supersede generic/off-domain examples. In particular: Flutter offline/Isar is excluded; single-admin/customer-only and Stripe examples do not apply; runtime Angular translation suggestions do not replace compile-time localize; generic workspace commands do not create a root workspace; validation DTOs derive from contracts. Version anchors, package method examples and compatibility claims are historical reference notes, not verified current versions. Validate official documentation and pin compatible versions during implementation. Keep preserved framework files unchanged; record corrections in project docs.

## 7. Definition of done

Each slice updates contracts/docs and provides unit, integration, E2E and contract evidence appropriate to its scope. Cross-operator denial, retry/stale-write handling, budget limits and secret safety are required on authority paths. All applicable locales/accessibility/online-only checks pass. Security has no open Critical/High findings; Medium findings have an owner/date. Release requires all selected platforms, tested restore/rollback, resolved blocking decisions and owner Go. Commit milestone slices; push at major milestones, Forgejo primary. No deployment or artifact publishing is authorized merely by this specification.
