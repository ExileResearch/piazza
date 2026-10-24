# JSDoc — Agent Best Practices

## Core Stack Facts

- JSDoc = block-comment annotations (`/** ... */`) documenting JS/TS APIs; tooling: TypeScript understands `@param/@returns/@throws/@template` natively for checking; TypeDoc renders TS+JSDoc to docs.
- Alternative/peer: TSDoc (standardized corporate tags), tsdoc.json lint rules. Default package posture: JSDoc comments on the public API surface, not every line.

## File & Project Conventions

- Scope: exportable public API (controllers, services, DTOs, config, client methods, rulebase functions). Internal one-liners need no ceremony.
- Style: `@param` with types and meaning; `@returns`; `@throws` for expected failures; `@example` for non-obvious usage; `@deprecated` with replacement path.
- Generated/derived code (OpenAPI types, codegen output) is NOT hand-documented — regenerate, don't annotate.
- Keep docs in the same commit as the code they describe. A doc for code that changed in the same PR is a stale doc.

## Framework-Native Idioms

- Run the type checker over docs: `@param {string} name` mismatches surface as TS errors when `checkJs`/declaration emit is on.
- Use TS types in `@param {TypeName}` rather than re-describing shape in prose; `@typedef` for inline object shapes.
- Document invariants and failure modes, not restatements: "resolves to the package manifest, throws `NotFoundError` if the request hash misses".
- `@see` cross-references between coupled APIs (auth guard ↔ RBAC ability factory).
- NestJS: controller methods get `@ApiOperation` (OpenAPI) + JSDoc for human docs; the two must not contradict (swagger-openapi pack).

## Commands & Tooling

- `npx typedoc --entryPoints src/index.ts --out docs/api` (generated API docs in CI, published with the package artifact).
- Lint: `eslint-plugin-jsdoc` (require-param, require-returns, check-types) with `exemptedBy` for internal files.
- CI gate: `typedoc` build fails on missing required tags; `checkJs: true` spot-check on the contracts package.

## Common Pitfalls

- Hallucination traps: invented JSDoc tags (`@import` misuse), wrong `@template` syntax, JSDoc `@type` in TS files where TS types suffice.
- Stale docs: signature changed, prose didn't — the lint/type check catches tag mismatches but not semantic drift; review docs in code review.
- Documenting implementation instead of contract ("loops over array" — worthless); document behavior + edge cases.
- JSDoc on private internals bloating the generated API surface — `@internal`/exclude non-exported.
- Copy-paste example blocks that don't compile.

## Rulebase Coupling

- generated package layout carries `docs/api/` as part of the artifact.
- CONTRACTS: shared contracts package is where JSDoc matters most — its types are consumed by every client; document invariants there first.
- doc-generation CI gate is part of the testing bar for shipped packages.
- doc updates ride the same commits as the code; plan phases close only when docs+tests+code move together.

## References

- https://jsdoc.app/
- https://typedoc.org/
- https://tsdoc.org/
