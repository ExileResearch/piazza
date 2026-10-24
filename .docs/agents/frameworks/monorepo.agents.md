# Repo Layout (shared repo, per-app manifests + Docker Compose) — Agent Best Practices

## Core Stack Facts
- A **shared repo, not an npm workspace**: each app and package has its own `package.json` and `package-lock.json`.
- Root owns only orchestration: `compose.yml`, `.gitignore`, `.dockerignore`, `tsconfig.base.json`, and docs.
- The shared contracts package is consumed through a `file:` dependency (e.g. `"@<project>/contracts": "file:../../packages/contracts"`).
- Each app has its own `Dockerfile`; builds use the **repo-root context** so contracts are built first and the app is copied second.
- No Nx, no Turborepo, no root task graph. Keep it boring.

## File & Project Conventions
- Root: `compose.yml`, `.gitignore`, `.dockerignore`, `tsconfig.base.json`, `README.md`.
- Apps: `apps/<app>/package.json` + `package-lock.json` + `Dockerfile` + the app's own `README.md`.
- Shared: `packages/contracts` with its own `package.json`/lockfile and an ESM build (plus CJS if a Jest/Nest consumer needs it).
- Commit every lockfile. CI runs `npm ci` per app.
- One root `.gitignore` and `.dockerignore`; their globs cover every app.

## Framework-Native Idioms
- Install per app: `cd apps/backend && npm install`. Contracts first: `cd packages/contracts && npm ci && npm run build`.
- Contracts are a `file:` dependency: after changing them, rebuild the package so the app picks up `dist`. Do not rely on symlinks or hoisting.
- Docker: `context: .` and `dockerfile: apps/<app>/Dockerfile`; build contracts in an earlier layer, then `npm ci` for the app, then copy the app.
- Compose wires services. PostgreSQL may be external (set `DB_HOST` in the app `.env`) or a sidecar, per project.

## Commands & Tooling
- `cd packages/contracts && npm ci && npm run build`
- `cd apps/backend && npm ci && npm run build && npm test`
- `docker compose build && docker compose up -d`
- CI: build contracts, then per-app `npm ci` + typecheck/lint/test, then compose build.

## Common Pitfalls
- Adding a root `package.json` "for convenience" — it creates a second lockfile/workspace and breaks per-app Docker installs.
- Relying on hoisted `node_modules`; every app must be independently installable.
- Forgetting to rebuild contracts after a schema change; stale `dist` causes phantom type errors.
- A wrong relative path in a `file:` dependency; verify with `npm ls @<project>/contracts`.
- Setting the Docker context to `apps/<app>` so `packages/contracts` is unavailable; use the repo root.
- Committing `node_modules`, `dist`, or per-app `.env`.

## Rulebase Coupling
- Build order (contracts → server → clients) is enforced by Docker layers and app scripts, not a task graph.
- Plans commit per phase; each app's scripts gate its own phase.
- Docs live under `.docs/` at the repo root; apps live under `apps/`, shared code under `packages/`.

## References
- https://docs.npmjs.com/cli/v10/commands/npm-ci
- https://docs.docker.com/compose/
