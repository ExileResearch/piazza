# Node.js — Agent Best Practices

## Core Stack Facts

- Version anchor: Node 24 LTS "Krypton" (Oct 2025+); Node 22 "Jod" still maintained. Ships npm 11.
- JavaScript runtime, not a framework; the platform every other backend pack in this catalog runs on.
- Ecosystem: single-threaded event loop, worker_threads for CPU work, child_process for isolation. ESM is the default module system since Node 22 (no flag needed); CJS supported via `.cjs`.
- Relationship to peers: Express/Fastify/NestJS are HTTP layers on top

## File & Project Conventions

- Canonical entrypoint: `src/index.js` or `src/index.ts`, started via `"start"` script in `package.json`.
- ESM: `.js` files with `"type": "module"` in package.json; `.mjs`/`.cjs` extensions override per-file.
- Config: `.env` for secrets (loaded with `--env-file` flag since v20, no dotenv dependency needed), `node --env-file=.env src/index.js`.
- `node_modules` never committed; lockfile (`package-lock.json` or `pnpm-lock.yaml`/`yarn.lock`) always committed.
- Engines field (`"engines": {"node": ">=24"}`) documents the runtime contract.

## Framework-Native Idioms

- Prefer `node:test` + `node:assert` for unit tests — zero-dependency, built-in test runner with TAP output.
- Use `fetch` (global since 18/21), `AbortController`, and `fs/promises` rather than third-party wrappers.
- Structured logging to stdout (JSON lines), not `console.log` sprawl; `--enable-source-maps` for stack traces.
- `stream`/`stream/web` for backpressure-aware I/O; `util.styleText` for terminal colors (no chalk needed).
- `--watch` flag for dev reload; `--experimental-strip-types` for running TS directly (type stripping, no type-check).

## Commands & Tooling

- Init: `npm init -y`; package-manager aware — npm is the default for this package set, corepack for pinning; other managers are fine in their own projects.
- Run: `node --watch src/index.js` (dev), `node src/index.js` (prod); `npm start`.
- Test: `node --test` (or `npm test` → `node --test test/`).
- Typecheck (TS projects): `tsc --noEmit`; lint: `npx eslint .`; format: `npx prettier --check .`.
- Verify runtime: `node -v` (expect v24.x) and `node -p "process.features.typescript"` for strip-types support.

## Common Pitfalls

- Assume CJS default — check `"type"` in package.json before writing `require` vs `import`.
- Pin nothing: `npm install` without flags can drift majors. Use `npm ci` in CI, never `npm install`.
- Write callback-style code instead of promises; Node core is promise-native now (util.promisify only for legacy APIs).
- Forget `--env-file`, then hardcode secrets — wrong; use the built-in flag.
- Use `_` as second arg of `http.createServer` callback — that's Express/flatiron style; most natives don't need it (defensive `(req, res, next)` only applies to Express middleware).
- Set `process.exitCode` instead of calling `process.exit()` after async work (truncates pending writes/streams).

## Rulebase Coupling

- build-order: node is the platform baseline for all TS/JS server packs — pin the runtime version before framework code is generated.

## References

- https://nodejs.org/api/ (core docs; check the "LTS" banner for current anchor)
- https://nodejs.org/en/learn/getting-started/introduction-to-nodejs
- https://nodejs.org/dist/index.json (machine-readable LTS/version list)
