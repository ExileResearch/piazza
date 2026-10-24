# Zod — Agent Best Practices

## Core Stack Facts

- Version anchor: Zod 4.x (4.4.x current; Zod 4 released mid-2025 — the `zod/v3` entrypoint exists for legacy compat, do not generate new code on v3 idioms unless pinned).
- TypeScript-first schema declaration + validation library: one schema → runtime validator + inferred static type (`z.infer<typeof schema>`). Zero dependencies, tree-shakeable, edge-compatible.
- Relationship to peers: the standard validation layer for Express/Fastify/NestJS (custom pipe)/Node APIs in this catalog. vs class-validator (NestJS default docs pairing) — NestJS pairs with class-validator natively; zod is the framework-agnostic favorite. vs Ajv (JSON Schema — Fastify's native schema engine); when a framework has a native schema system (Fastify), prefer the native one and use zod at the API boundary only if the spec demands.
- Zod 4 core changes: `.check()` (non-throwing, returns boolean) added, `z.string().email()` → `z.email()` top-level, `.parse` still throws `ZodError` with `error.issues` (renamed from `.errors`), async via `.parseAsync`/`safeParseAsync`; `z.late()` → `z.lazy` (v3 name kept workable); import from `"zod"` (v4) not `"zod/v3"`.

## File & Project Conventions

- Layout: schemas colocated with features (`src/<feature>/schemas/<name>.schema.ts`) or a central `src/schemas/` for shared domain models; DTO/request schemas in `dto/` folders mirroring NestJS conventions.
- File shape: export the schema AND its inferred type: `export const UserSchema = z.object({...}); export type User = z.infer<typeof UserSchema>;` — never `any` in place of the inferred type.
- Where they live per framework: Express — middleware module; Fastify — inside route `schema` (native) or preHandler; NestJS — custom pipe wrapping `schema.parse` (zod-pipe pattern) unless class-validator is pinned; Node bare — a `validate()` helper around `safeParse`.
- Shared domain schemas (entities) imported by both server and (if applicable) generated client — single source of truth, no duplicated hand-written types.

## Framework-Native Idioms

- Compose: `z.object({ id: z.string().uuid(), email: z.email(), tags: z.array(z.string()).max(5).default([]), meta: z.record(z.string(), z.unknown()) })` — build big schemas from small ones; `.extend()`/`.merge()` for inheritance; `z.union`/`z.discriminatedUnion('kind', [...])` for variants.
- Parse safely: `const parsed = UserSchema.safeParse(input)` → `if (!parsed.success) throw new BadRequest(parsed.error.issues)` — safeParse for control flow, parse only when you want throw.
- Type extraction: `z.infer` for the whole type; `z.input<typeof S>` (input may differ from output when `.transform`/`.default` present); `z.output<typeof S>` for post-transform type.
- Refinements: `.refine((v) => v.password === v.confirm, { path: ['confirm'], message: '...' })` for cross-field; `.superRefine` for multi-issue; `.transform` for coercion (`z.coerce.number()` — beware: coerce never validates, it force-casts then checks).
- Nested errors: `parsed.error.issues` array with `path` — map to field-level errors for 422 responses; ZodError `.flatten()` for quick shaped output.
- Async: `.parseAsync`/`.safeParseAsync` for DB-backed refinements (`z.string().refine(async (id) => exists(id))`).
- Framework adapters (official third-party): `@fastify/type-provider-zod` (Fastify schema bridge), `zodios` (axios+zod), `@anatine/zod-nestjs` or custom pipe (NestJS) — pick the adapter, don't hand-roll everywhere.

## Commands & Tooling

- Install: `npm i zod` (v4); legacy projects pinned to v3: `npm i zod@3` — imports stay `"zod"`.
- Typecheck is the primary tool: `npx tsc --noEmit` — schema/type mismatches surface here; lint: `npx eslint .`.
- Test: `node --test`/jest — unit-test schemas directly: `expect(UserSchema.parse(payload)).toEqual(expected)` for happy path, `.safeParse` + `issues` for failure cases; property-test with fast-check if the spec allows.
- No build step, no codegen, no CLI — zod is a library, not a toolchain.
- Verify: `npm ls zod` → `4.x`; `node -p "require('zod/package.json').version"` — and grep imports: `from 'zod'` (v4) vs `from 'zod/v3'` (forced legacy).

## Common Pitfalls

- v3 API in v4 code: `z.string().email()` (chain method, REMOVED in v4 → top-level `z.email()`), `.errors` (→ `.issues`, `.errors` error-level alias removed), `z.record(z.string())` value-type-first signature (v4 flips args: `z.record(keySchema, valueSchema)`).
- `z.coerce.number()` on user input — coercion bypasses type validation; `z.coerce` is for known-safe incoming formats (e.g. query strings), not for "make anything a number".
- `.parse` in a try/catch WITHOUT `instanceof ZodError` check — validates nothing; `error.issues` only exists on ZodError, other throws pass through.
- Forget `.default()` on optional-with-fallback fields — undefined propagates; default applies at parse when key absent.
- Use `z.infer` on the WRONG schema (input vs output with transforms) — expose `z.input` for request types where transforms exist.
- Hand-validate in route handlers instead of one boundary parse — the whole point is a single chokepoint; parse once in middleware/pipe/preHandler.
- Duplicate the schema between "validation file" and "types file" — inferred types ARE the schema; derive, never duplicate.
- Import `zod/v4` or subpath `zod/v4/core` in mixed projects — the migration guide renames, but `zod/v3` still resolves; pin one major and lint against mixed imports.

## Rulebase Coupling

- ORM/framework pairing: zod pairs as the validation boundary for every TS server pack (Express/Fastify/NestJS/Node) — generated request/response schemas are the contract the framework validation and ORM types both hang off.

## References

- https://zod.dev/ (v4 docs: schemas, refinement, transforms, errors)
- https://zod.dev/v4/migration (upgrade / v3-compat guide)
- https://github.com/colinhacks/zod
