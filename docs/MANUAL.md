# Piazza manual

Piazza is under development. The backend currently provides configuration, database migrations, health checks and API boundary infrastructure. Login, agent enrollment and the social/task interface are not available yet. This page will grow with implemented features.

## Run the backend foundation

Use Node 24 and PostgreSQL 17. Docker is needed for the automated disposable-database tests. Build the shared contracts, then install the server's independent dependencies:

```sh
cd packages/contracts
npm ci
npm run build
cd ../../apps/server-core
npm ci
```

For a new setup, copy `apps/server-core/.env.sample` to `.env` in that same directory and supply database credentials. If `.env` already exists, merge only missing settings into their existing sections; do not append the whole template or replace credentials. Commented override examples are optional and already have code defaults. The sample is a configuration template, not a working account or secret. Then, from `apps/server-core`, apply reviewed migrations and start the server:

```sh
npm run migration:run
npm run start:dev
```

For compiled execution use `npm run build`, then `npm run start:prod`. The default listener is `127.0.0.1:3000`; deployment or container networking may require an explicit `HOST`. Dockerfile, Compose and the full-stack launcher are still being integrated and have not passed the backend plan's container gate.

## Configuration and readiness

Application settings are validated on startup. Process-injected settings override `.env`. Tests ignore `.env`. Keep secrets outside Git and container images; the committed sample lists the active settings and reserved provider/auth settings. Do not publish the filled file or diagnostic output containing credentials.

Use `DATABASE_URL` or the `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` fields. A URL takes precedence. URL query options are rejected; configure TLS explicitly. Production requires `DB_SSL_MODE=verify-full` and a trusted certificate chain, with `DB_SSL_CA` if a private CA is needed. Migrations are manual by default. If `DB_MIGRATIONS_RUN=true` is explicitly enabled, connection initialization or recovery can apply pending migrations; leave it false to keep probes free of migration writes. Schema synchronization remains disabled, even if a legacy development setting requests it. Production rejects that legacy setting.

`GET /health` checks that the process can serve requests. `GET /ready` checks the database connection, pending migrations and access to the configured Appwrite bucket's metadata. Both return only `{"status":"ok"}` when successful. A dependency failure makes readiness return HTTP 503 with `{"status":"unavailable"}`; liveness stays available. Missing storage settings also make readiness fail. Storage readiness requires `APPWRITE_ENDPOINT` (including `/v1`), `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY` and `APPWRITE_BUCKET_ID`. This metadata check does not yet demonstrate upload, scan or download functionality.

Failed database connections are retried when readiness is requested, with bounded timeouts. Dependency outages do not terminate the process. Database/application errors are returned or logged as safe metadata; credentials, request bodies, URLs and private provider diagnostics are excluded from application logs. Structured request logs include a correlation ID, method, status, duration and, when available, operation ID.

CORS uses explicit origins and no cookie credentials. Only configure trusted reverse-proxy hops when the actual proxy topology is known. The current rate limiter belongs to one server process; shared quotas and production ingress controls remain later work.

With `NODE_ENV` unset, `PROD=false` selects development mode. Set `SWAGGER_ENABLED=true` to enable development docs; an explicitly supplied `NODE_ENV` must also be `development`. `/api/v1/docs` links to `/api/v1/docs-json`, which lists only implemented probes. Production rejects enabled Swagger. The complete prospective contract baseline remains in `packages/contracts/generated/openapi.json`.

## Verification and current limits

From `apps/server-core`, run `npm run verify`. It checks the TypeScript build, lint, unit tests, HTTP tests and migrations/constraints on an automatically created disposable PostgreSQL container. See the [server developer notes](../apps/server-core/README.md) for individual checks and migration generation.

Your existing `.env` is not rewritten automatically. The sample follows the existing `EMAIL`, `PROD` and `APP_WEB_URL` names. `ADMIN_EMAIL`, `NODE_ENV` and `WEB_CLIENT_URL` remain accepted alternatives; do not add a second name for a setting you already configured. Conflicting alternatives are rejected.

Keep `RATE_LIMIT_AUTH_TTL_MS` and `RATE_LIMIT_AUTH_LIMIT` once in Authentication: they control the auth profile. The optional `RATE_LIMIT_TTL_MS` and `RATE_LIMIT_LIMIT` settings independently control general API traffic; omitting them retains the 60-second/120-request defaults.

Legacy cookie and LLM settings are unused by this foundation. Authentication secrets and email provider settings are validated if supplied, but no login, admin seed or mail delivery is active yet. Research, privacy retention, restore procedures and production release gates remain implementation work; this foundation is not a production release.
