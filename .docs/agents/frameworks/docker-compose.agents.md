# Docker Compose — Agent Best Practices

## Core Stack Facts

- Docker Compose v2 (`docker compose` plugin): multi-container orchestration on ONE host via `compose.yaml`; the portable local/dev + small-prod stack. Kubernetes is the scale-out peer (overkill for v1 packages).
- Default package posture: multi-stage Dockerfiles + Docker Compose; Coolify deploys on top of Docker — Compose files are the substrate Coolify and self-hosted targets understand.
- Stack shape for a typical generated package: `server` (API), `db` (Postgres), `redis` (queue/cache), optional `worker`.

## File & Project Conventions

- `compose.yaml` at repo root (or `docker/` with `docker-compose.yml`): services, build contexts, ports, volumes, networks, env_file.
- `.env` at the compose root for variable interpolation (`${POSTGRES_PASSWORD}`) — .env gitignored; `.env.example` committed with ALL keys documented. Real secrets never inline in compose.
- Separate profiles: `docker compose --profile dev up` vs prod overrides `compose.prod.yaml` (healthchecks, restart policies, resource limits).
- Multi-stage Dockerfile per app: builder stage (deps+build) → slim runtime (non-root user, `COPY --chown`); pinned base tags (`node:22-slim` by digest or major), never `latest`.

## Framework-Native Idioms

- Service health: `healthcheck:` per service (`test: ["CMD", "node", "healthcheck.mjs"]` or curl) + `depends_on: condition: service_healthy` — replaces sleep-based ordering (the classic race).
- Networks: user-defined bridge network; expose only the public ports (`ports: "8000:3000"`), internals talk over service DNS names (no host-IP hackery).
- Volumes: named volumes (`db-data:`), not bind mounts for state; `pgdata` survives `down`; the uploads directory is mounted for a local object-storage variant.
- Restart policies: `restart: unless-stopped` for persistent services; `no` for one-shot jobs; never `always` for DB boot loops.
- Logging: services log JSON to stdout (`logging: driver: json-file` with rotation `max-size: 10m`); compose collects — observability pack contract.
- Migrations: a `migrate` one-shot service (image of the server, command override) run before app start via `depends_on: service_completed_successfully` (compose v2.20+).

## Commands & Tooling

- `docker compose up -d --build`, `docker compose ps`, `docker compose logs -f server`, `docker compose down -v` (destroys volumes — never casually).
- `docker compose config` to validate interpolation; `docker compose exec server sh` for debugging.
- CI: `docker compose up -d && docker compose exec server npm run test:integration` — compose as the test harness.

## Common Pitfalls

- Hallucination traps: v2 vs v3 schema confusion (v3 top-level keys like `version:` are obsolete), invented condition values, wrong `depends_on` syntax.
- Sleep-based ordering (`sleep 10`) instead of `service_healthy` — races on slow DB boots.
- Secrets visible via `docker inspect` (inline env) or committed `.env`; `.env` referenced but missing → compose warns and interpolates empty strings (silent misconfig).
- No resource limits → OOM on the host; no restart policy → service dies on reboot and stays dead.
- Bind-mounting the whole repo into prod containers; `node_modules` bind issues on Mac/Windows (use named volumes for deps).
- Port collisions with host services; exposing Postgres/Redis to the world (`0.0.0.0:5432`) "for debugging".
- Forgetting `-v` consequences; backups of named volumes never scheduled.

## Rulebase Coupling

- Compose = persistent host
- compose orchestration mirrors the contracts-first build order — server/client services reference the contracts package build first.
- Compose is the delivery format Coolify consumes; the storage service volume matches the chosen storage option's path.
- infra-as-code files are plan phases (healthcheck rollout, migrate service, volume declaration) verified by `docker compose config` + integration run.

## References

- https://docs.docker.com/compose/
- https://docs.docker.com/build/building/multi-stage/
- https://docs.docker.com/reference/compose-file/
