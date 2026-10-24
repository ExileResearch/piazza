# Testing — Agent Best Practices

## Core Stack Facts

- Vitest 2/3 (Vite-native, ESM-first, `vi.mock` hoisted), Jest 29/30 (legacy default, commonjs-friendly, ts-jest or babel), Playwright 1.x (browser E2E + API testing + trace viewer).
- Relationship: unit (Vitest/Jest) → integration (supertest against real routes + DB) → E2E (Playwright, real browser against deployed/CI server). They are layers, not alternatives.

## File & Project Conventions

- Colocated specs: `src/**/*.spec.ts` (Vitest) or `__tests__/` (Jest) — pick one per repo, document in AGENTS.md.
- `vitest.config.ts`/`jest.config.ts` with `setupFiles` for env mocks; coverage thresholds enforced (`100` for utils, `80` where legacy).
- Playwright: `playwright.config.ts` with `webServer` booting the app, `projects` (chromium required, firefox/webkit optional), `trace: 'on-first-retry'`, `reporter: 'html'`.
- Test env vars separate from prod: `.env.test`, no live keys.

## Framework-Native Idioms

- Vitest: `describe/it/expect`, `vi.fn()/vi.mock()` — fake at module boundaries, never mock what you're testing; `test.concurrent` only for isolated cases.
- Jest: same shape; `jest.useFakeTimers()` for time-dependent logic; snapshot tests only for stable, reviewed output (API envelopes, not UI).
- Playwright: `expect(page).toHaveURL/toHaveText` — assert user-visible outcomes, not implementation; `getByRole/getByLabel` selectors (a11y-correct), avoid CSS-positional selectors.
- Integration: real DB in a transaction-rolled test (or testcontainers); supertest against the NestJS app with the same guards/middleware as prod.
- Seed data as fixtures module, deterministic; never depend on test order.

## Commands & Tooling

- `npx vitest run` / `npm test -- --watch`; `npx jest --coverage`; `npx playwright test` + `npx playwright show-report`.
- `npx playwright install chromium` after adding the dep (browsers are NOT in package-lock).
- CI: unit+integration on every push; E2E on the review/preview environment or merge.

## Common Pitfalls

- Hallucination traps: inventing matchers (`toHaveBeenCalledWithExactly` doesn't exist), wrong Playwright config keys, mocking `fetch` globally and breaking the module under test.
- E2E flake: fixed sleeps — use `expect(...).toBeVisible({ timeout })` or `waitForResponse`; never `page.waitForTimeout` as a sync crutch.
- Testing implementation details (class names, DOM order) → brittle suites; test behavior.
- Tests passing locally, failing in CI: missing test env vars, browser not installed, or `localhost:3000` already taken — use `webServer.reuseExistingServer`.
- Skipping the E2E bar: E2E omitted for "key flows" (auth, checkout, generation) — document gaps, don't silently drop.

## Rulebase Coupling

- unit+integration non-negotiable; E2E for key flows — this is the emitted bar, enforce per generated package.
- a plan phase only closes when its checkbox steps are test-verified (check as work progresses).
- cadence gates commits on green suites; `none` cadence still requires tests before user-approved push.

## References

- https://vitest.dev/guide/
- https://jestjs.io/docs/getting-started
- https://playwright.dev/docs/intro
