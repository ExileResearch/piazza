# Coolify — Agent Best Practices

## Core Stack Facts

- Coolify (v4.x): self-hosted PaaS on your own Docker host — deploy from Git (Forgejo/GitHub/GitLab), Dockerfiles, Docker Compose, static sites, databases as services; no per-seat cloud tax.
- Typical target: Coolify for the server + web apps; a pre-configured static container for the landing page; CI/CD = Coolify itself; git host = Forgejo, which fires Coolify auto-deploy webhooks.
- Relation to peers: Vercel = managed serverless (functions, platform lock-in); Railway/Fly = managed containers with their own infra; Coolify = YOUR hardware, YOUR Docker, full control — bullets go to your host.

## File & Project Conventions

- App defined by a Dockerfile or Compose in the repo: `Dockerfile` (multi-stage: build stage → slim runtime) or `docker-compose.yml` for multi-service stacks (server + db + redis).
- Deployment metadata lives in the Coolify dashboard per app: build command, start command, ports, healthcheck path — mirror critical values in a repo `docs/deploy.md` (dashboard state can drift; document it).
- Envs: set in Coolify dashboard (or `.env` import), NEVER committed; Coolify can read `.env.example` as a schema — commit `.env.example` with all keys documented.
- Persistent volumes for state (Postgres data, uploads): declared in Compose or Coolify volume config; ephemeral filesystem otherwise (no local disk assumptions).

## Framework-Native Idioms

- Healthchecks: Coolify probes hit your configured path — serve `/health` (liveness) and use `/ready` (DB-connected) so the orchestrator stops routing to a half-dead app. Healthcheck must not require auth (probe has none).
- Deploy flow: push to Forgejo → webhook → Coolify builds container → rolling/atomic deploy on the same port; assert the new container passes the healthcheck before traffic switches (zero-downtime when configured).
- Persistent services OK here: Coolify runs containers 24/7 — long-lived sockets/workers/queues are legitimate
- Databases: self-host Postgres via Coolify (or existing server) — backups are YOUR job: schedule volume snapshots/pg_dump; restore drill documented.
- Logs/observability: Coolify shows container logs; wire your JSON logging (observability pack) to stdout so the dashboard is useful; attach Sentry/OTel as configured.
- Secrets: use Coolify's variable store per app-environment; rotate via dashboard; `preview` vs `production` env scopes kept separate.

## Commands & Tooling

- Coolify web UI/API; `curl` the app: `curl -fsS http://<host>/health`; `docker compose ps` on the host server for ground truth.
- `docker exec <container> pg_dump` scripted for backups (cron on host); test restore at least once as a routine discipline.

## Common Pitfalls

- Hallucination traps: inventing Coolify dashboard paths/API names, assuming "serverless" semantics — Coolify is NOT serverless; don't write function-style handlers.
- Healthcheck misconfig: path wrong, auth-protected `/health`, or `ready` never implemented → Coolify marks app down and redeploys loop.
- Secrets in committed `.env`/Compose (look out for `environment:` blocks with real values), or `:latest` tags floating (pin image/digest for reproducibility).
- Deploying with build-time secrets baked into image layers (multi-stage build leaking `ENV` values into final layer).
- Forgetting volumes → data loss on every redeploy; single-host SPOF without backup.
- Port/domain mismatch between Coolify proxy config and the app's `PORT` env — logs show "listening on 3000" while proxy hits 8080.

## Rulebase Coupling

- Coolify is a persistent target — sockets, background workers, queues are allowed; serverless-vs-persistent preflight marks this package type "persistent".
- Coolify is the locked target for server+web; landing = static container — deploy packs must not silently switch targets.
- deploy config (Dockerfile, healthcheck, volumes) is a checkable phase; cadence gates container builds.
- Observability pack: `/health`+`/ready` paths and JSON stdout logging are the shared contract with Coolify probes.

## References

- https://coolify.io/docs/
- https://coolify.io/docs/knowledge-base/deployments/webhooks
- https://docs.docker.com/build/building/multi-stage/
