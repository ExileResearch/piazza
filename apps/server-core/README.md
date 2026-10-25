# Piazza API

NestJS foundation for the Piazza backend. Current runtime routes are `GET /health` and `GET /ready`, plus explicitly enabled development documentation. Product authentication, agent control, task coordination and MCP endpoints are planned, not implemented by this foundation.

See the [manual](../../docs/MANUAL.md) for setup, configuration and probes; [backend plan](../../.docs/plans/01-backend.md) for implementation progress; and [foundation decision](../../.docs/decisions/0005-backend-foundation.md) for persistence and compatibility details.

## Developer checks

Build `packages/contracts` first. Run these commands from this directory:

```sh
npm ci
npm run verify
```

`verify` runs typecheck, build, lint, unit tests, HTTP E2E tests, then real PostgreSQL integration tests. Docker must be running; the database helper creates a localhost-only PostgreSQL 17 container with temporary storage and removes it afterward. The first run may need to fetch `postgres:17-alpine`. No existing Compose service or database is used.

Individual checks: `typecheck`, `build`, `lint`, `test:unit`, `test:e2e`, `test:database`. `test:integration` instead requires an explicit `TEST_DATABASE_URL`: localhost, database name beginning `piazza_test`, no URL query options, disposable credentials with CREATEDB permission. The suite creates and drops a separate randomly named database. It never reads `.env`; do not supply production credentials. An externally supplied test server/container remains the caller's responsibility.

`npm run start:dev` runs the source watcher. `npm run build` followed by `npm run start:prod` runs compiled ESM. Node 24 is required. Jest uses Node's experimental VM modules because the installed adapters use ESM; the resulting Node warning is expected.

## Migrations

Review the target configuration first; CLI commands use this app's `.env`, overridden by process-injected values. Migration commands connect to that configured database and can change or remove data. Use a disposable database for generation and reversal checks; review generated SQL before applying it elsewhere.

```sh
npm run migration:show
npm run migration:generate -- src/database/migrations/DescriptiveName
npm run migration:run
npm run migration:revert
```

The TypeORM generator emits a normal import for `MigrationInterface` and `QueryRunner`; make it `import type` under this project's `verbatimModuleSyntax`, then format and review the migration. Synchronization and destructive automatic schema dropping are always disabled. Migration application on startup is an explicit opt-in (`DB_MIGRATIONS_RUN=true`); the default is manual application.

The foundation migration creates ten tables for B01–B03/D01–D08. Row types use `Date`/`null`, whereas DTOs use canonical UTC strings/omitted optionals. Never return ORM rows. Secret columns have `select: false`, which is defense in depth rather than authorization; explicit selections and raw SQL still require careful projection.

## Extending the API

Use `@Contract(operationId)` and `@ContractInput()` for JSON operations, with canonical route schemas. The interceptor checks consumed headers, params, query, body and the complete success envelope. It rejects extra outbound fields rather than removing them. Binary/HTML form transports require their own adapters and currently fail closed through this JSON boundary.

`ContractIdentityGuard` checks a server-established actor's shape and role class. Credential validation, current account state, live scoped grants, step-up, resource membership, budget enforcement, idempotency and transactional policies must be implemented before enabling their corresponding product routes. Header text alone never establishes an actor. Test-only controllers exercise the boundary without exposing fake product APIs.

The common rate limiter uses per-process memory and per-handler/IP keys, with no trusted proxy hops by default. It is a foundation bound, not a distributed deployment quota. The auth-specific configuration is reserved until authentication routes exist. No cookie sessions, offline queues, mail sends, object uploads or model calls are activated.
