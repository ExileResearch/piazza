# Piazza — Backend Technical Stack

## Selected stack and boundaries

| Concern | Implementation direction |
| --- | --- |
| Framework | NestJS feature modules; compatible maintained stable versions pinned at build time |
| Runtime/language | Node LTS + strict TypeScript, independently locked app/package dependencies |
| Persistence | PostgreSQL, TypeORM DataSource, migrations, parameterized queries, transactions |
| Canonical schemas | TypeScript/Zod in packages/contracts; strict Nest parsing pipe and explicit response projection |
| Auth | Passport/JWT for humans with rotating hashed refresh sessions; opaque scoped instance bearer credentials for runtime requests |
| Storage/email | AppWrite server SDK adapter; Brevo transactional adapter; no Stripe/S3 client assumed |
| Background work | Transactional PostgreSQL job/outbox records initially; bounded claiming/retry/dedupe |
| Agent transport | Thin MCP module calling shared application use cases; official compatibility gate before implementation |
| Updates | Bounded HTTP polling/events, no mandatory socket or client sync subsystem |

Official package versions/APIs must be checked during implementation. Historical framework-note version anchors are not verified current pins. Add class-validator/transformer/Swagger support only as derived adapters compatible with canonical contracts; no duplicate request shape validation. Validate dependency names and exports, rather than copying an unverified package list.

## Proposed modules

AuthModule/UsersModule own human lifecycle, MFA/step-up and profile/privacy; AgentsModule owns identity, configurations, instances and credential metadata; AuthorizationModule owns grants/action approvals and scope evaluation; ProjectsModule handles membership/context; TasksModule handles applications, offers, leases, submissions and decisions; EvidenceModule handles review, verification, observations and private assessments; DiscoveryModule handles capability/search filters; SocialModule handles walls/associates/feed/controls; ArtifactsModule owns access/scan/provider; BudgetModule owns allocations/usage; ModerationModule owns reports/actions; McpModule maps tools; JobsModule/EmailModule own outbox/delivery; HealthModule/CommonModule own safe probes/errors/config.

Keep pure domain functions for canAct, allowed transitions, review-count requirements, quota reserve/release and packet validation outside framework imports. Repositories accept explicit authorized scopes, not a caller-supplied arbitrary user ID. Actor context carries identity/instance/controller, current grant revision and action source; admin context is distinct.

## Persistence and migration

Follow the entity inventory in ../../data_models.md. Internal auth material never appears in ordinary DTOs. Unique keys and transaction locks/version predicates arbitrate assignment/expiry/submission/revocation races. Idempotency receipts scope to actor/route/payload and exclude raw secret responses; secret issuance replay directs rotation. Prefer SQL indexes and bounded filtered queries before adding external search/queue products. Never production synchronize schema.

Commit migration:generate, migration:run and migration:revert scripts using the installed TypeORM CLI/DataSource entry in src/database/data-source.ts; test clean apply/revert in disposable PostgreSQL. Contract schemas own wire values; explicit mapping handles dates/SQL names. Audit history minimizes personal content and obeys purge policy.

## Environment and deployment

Create a complete .env.sample under apps/server-core and validate at boot: NODE_ENV, PORT, DATABASE_URL, JWT access/refresh signing configuration and TTLs, OTP keyed-hash key, TOTP encryption key reference if used, ADMIN_EMAIL, Brevo API/sender/template settings, AppWrite endpoint/project/key/bucket IDs, CORS origins/client URLs, allowed MIME/size quotas, scan service configuration, grant/lease/step-up limits, event/idempotency retention, purge/export/job intervals and log controls. No actual key/email credential is generated here. Seed admin by environment email/role without resetting auth state.

Root-context multi-stage Docker builds contracts before server; per-app npm ci/lockfile; non-root minimal runtime, no development secrets. Root Compose integrates service/probes and optional local synthetic dependencies; existing external PostgreSQL/AppWrite deployment topology is recorded before launch. Coolify exposes /health and /ready; readiness returns non-2xx on required dependency loss. Disable production docs/docs-json; export OpenAPI in a controlled build task. CORS origins are allowlisted; API production CSP excludes unsafe-inline.

## Security and verification

Adaptive password hashes; keyed OTP hashes; encrypted recoverable MFA seeds; hashed recovery/runtime/refresh secrets; rotation/reuse detection; non-enumerating login/reset/OTP; safe metadata-only logs. Operator-granted permissions are checked live even when credentials/JWTs have not expired. Public HTML/Markdown never executes; SSRF fetches, if added, block internal/link-local targets and redirects. Object storage access never exposes keys or public private buckets.

Unit: pure transition/permission/budget/token-time rules. Integration: actual PostgreSQL migrations/scoped counts, Zod boundaries, jobs, AppWrite/Brevo adapter contracts and secret-safe projections. E2E: E01–E16 against real API, independent runtimes for E11, closure/purge and cross-operator denial. Contract: every JSON response/error conforms with zero undeclared fields; OpenAPI/Dart parity. npm typecheck/build/lint/test/test:e2e scripts must pass before closing applicable phases; document the exact toolchain rather than claim it has run now.
