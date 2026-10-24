# TypeScript — Agent Best Practices

## Core Stack Facts

- TypeScript 5.x (erasable syntax; `tsc` = type checker + transpiler; runtime is Node/bun/Deno whichever hosts it).
- Ecosystem peer: JavaScript (untyped baseline) and the WASM langs (Rust/Go) for perf-critical paths; TS is the default for the app/tooling layer unless the blueprint selects otherwise.

## File & Project Conventions

- `tsconfig.json` per package/workspace: `strict: true` (non-negotiable), `moduleResolution: "bundler"`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` where tenable.
- src layout: `src/` + compiled `dist/`; source maps in dev, off or stripped in prod.
- Env: `process.env` read through a validated config object (zod) at bootstrap — never sprinkled inline.
- Shared types live in the contracts package — clients import from there, never re-declare DTO shapes.

## Framework-Native Idioms

- `type` vs `interface`: interfaces for public API shapes (declaration merging), types for unions/mapped/derived.
- Discriminated unions (`type: 'success' | 'error'` + `data`/`error`) instead of optional-field soup.
- `satisfies` to keep literal types while checking structure; `as const` for option menus/rule tables.
- Narrow with type guards (`is`) and zod parsers at boundaries — trust nothing from JSON/HTTP.
- `import type` for type-only imports to keep runtime bundles clean.
- Prefer `unknown` over `any`; `any` only behind a lint-suppressed escape hatch.

## Commands & Tooling

- `npx tsc --noEmit` in CI and before every commit; `tsc --build` for project references in monorepos.
- `npm run typecheck && npm run lint && npm test` as the green gate.
- `npx tsc --noEmit --watch` for dev loops; `npm run typecheck --workspaces --if-present` for a workspace-wide check (see monorepo.agents.md).

## Common Pitfalls

- Hallucination traps: inventing lib types, wrong `lib`/`target` combos, assuming `node:fs/promises` types exist without `@types/node` pinned.
- `strict` off in generated boilerplate — re-enable; `any` creeping through API boundaries.
- ESM/CJS mismatch: `"type": "module"` vs `require()` — one or the other, never both silently.
- Decorators/metadata (`emitDecoratorMetadata`) needed for NestJS DI — forgetting it breaks injection at runtime while typechecking passes.
- Path alias drift: tsconfig paths not mirrored in the bundler → runtime "cannot find module".

## Rulebase Coupling

- (Build/Boot Order): contracts package first; all apps typecheck against it before wiring.
- living plans with checkbox phases; user-selected commit cadence honored — typecheck green is a step-closing condition.
- CONTRACTS (blueprint): API client approach is OpenAPI/typelink-driven + shared contracts package — no per-client forks.
- unit+integration non-negotiable, typecheck part of the bar.

## References

- https://www.typescriptlang.org/docs/
- https://www.typescriptlang.org/tsconfig/
- https://zod.dev/
