# Swagger / OpenAPI — Agent Best Practices

## Core Stack Facts

- OpenAPI 3.1 (JSON Schema 2020-12 based); Swagger UI 5.x renders it; `swagger.json` served at a known path (`/api/docs-json`, `/api/docs`).
- In NestJS: `@nestjs/swagger` (CLI plugin to auto-generate DTO metadata; decorators `@ApiTags/@ApiOperation/@ApiProperty`). In Express/Fastify: `swagger-ui-express` or `@fastify/swagger` + hand-written or `zod-openapi`-derived specs.
- Relation: this is the contract surface for the OpenAPI-driven client approach (blueprint API client selection = OpenAPI/typelink-driven + shared contracts).

## File & Project Conventions

- Spec lives where the server lives: `src/**` decorators produce it (code-first) OR standalone `openapi.yaml` (spec-first) — pick one per repo; generated packages are code-first (NestJS decorators).
- Serve at versioned path: `/api/v1/docs`; JSON export at `/api/v1/docs-json` for codegen.
- DTOs in the contracts workspace mirror the OpenAPI shapes; `openapi-typescript`/`orval` generate client types from the JSON.
- `apiVersion` pinned in the SDK/request layer; breaking changes = new path version, not silent field removal.

## Framework-Native Idioms

- Annotate every endpoint: tags (grouping), operation summary, response models (`@ApiResponse`), error shapes (CONTRACTS §7 envelope).
- `@ApiProperty({ example, required, enum })` on DTOs — examples are what clients and tests read; keep them real (no placeholder "string").
- Security schemes: `@ApiBearerAuth()` / `securitySchemes: bearerAuth` — declare, don't imply.
- Validation decorators (class-validator) + OpenAPI metadata stay in sync — the plugin derives one from the other; never hand-write both.
- Deprecation: `deprecated: true` on operations, keep them serving one version.

## Commands & Tooling

- `npx @nestjs/cli` generators; verify spec via `curl <base>/api/v1/docs-json | jq '.paths | length'`.
- Codegen: `npx openapi-typescript <spec-url> -o contracts/openapi.d.ts`; orval for typed clients; run in CI with `--diff` against committed spec to catch drift.
- Validate spec on save: `npx @redocly/cli lint openapi.yaml` (spec-first) or a CI job fetching the served JSON.

## Common Pitfalls

- Hallucination traps: invented OpenAPI keywords, wrong security scheme names, `@ApiProperty` vs `@ApiPropertyOptional` misuse, fake `x-` vendor extensions.
- Spec drift: decorators and generated types diverge — regenerate in CI, fail on diff.
- Secrets in spec: example values containing real tokens/URLs — scrub examples.
- Envelope mismatch: error responses not specified (every 4xx/5xx must be documented); clients then handle `unknown` shapes.
- Versioning lies: `/api/v1` that changes under the same version.

## Rulebase Coupling

- CONTRACTS (blueprint): shared contracts package is compile-time source of truth; OpenAPI JSON is the runtime artifact of it — never fork DTO shapes per client.
- contracts package builds before clients; generated types gate client compilation.
- spec regeneration is a step in plan phases; committed spec diff reviewed per cadence.

## References

- https://swagger.io/specification/
- https://docs.nestjs.com/openapi/introduction
- https://openapi-ts.dev/
