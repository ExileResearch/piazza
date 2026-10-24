# REST / OpenAPI — Agent Best Practices

## Core Stack Facts

- REST over HTTP/1.1–2, JSON bodies; OpenAPI 3.x as the machine-readable contract (see swagger-openapi.agents.md).
- Default package posture: REST is the primary client protocol (no GraphQL/gRPC/tRPC/WebSockets unless the blueprint adds one) — this is the default API surface for generated packages.
- NestJS (server) + Angular/Svelte/Flutter clients all consume the same OpenAPI-derived types (contracts workspace).

## File & Project Conventions

- Versioned URI prefix: `/api/v1` — never unversioned routes in greenfield packages.
- Controllers thin, services fat: controller = HTTP concerns (status, headers), service = domain logic; guards/validation at the boundary.
- DTOs per operation context: `CreateXDto`/`UpdateXDto`/`XResponseDto` (or `PartialType`), validated with class-validator + zod on non-Nest surfaces.
- Errors through one envelope (CONTRACTS §7): `{ status, code, message, details? }` — one shape, every endpoint.
- Pagination: `page`/`limit` or cursor — one convention repo-wide (document it), stable ordering column required.

## Framework-Native Idioms

- Status codes: 201 (created), 204 (no content), 400 malformed, 401 unauthenticated, 403 unauthorized (RBAC), 404 absent, 409 conflict, 422 validation, 429 rate-limited — no 200-with-error-body hacks.
- Idempotent writes: PUT = full replace, PATCH = partial; if the client can retry safely, say so in the contract (e.g. `Idempotency-Key` header on payment-ish endpoints).
- Caching: `ETag`/`If-None-Match` for read-heavy resources; `Cache-Control` on public catalog endpoints (package metadata).
- Rate limiting middleware on auth + generation endpoints (blueprint: standard rate limiting); emit `Retry-After`.
- Filtering by query params with allowlists — never reflect raw user input into a query builder.

## Commands & Tooling

- `curl -i http://localhost:3000/api/v1/health`; `jq` for JSON assertions; `supertest` for integration coverage of every route.
- Regenerate clients: `npx openapi-typescript` / orval from `/api/v1/docs-json`; CI diff gate.
- `npm run start:dev` for the server; Postman/Bruno collections optional but must match the spec (collections drift — treat spec as truth).

## Common Pitfalls

- Hallucination traps: invented status codes (422 vs 400 misused), fake headers, wrong content-type `application/hal+json` when the blueprint doesn't do HATEOAS.
- Security: returning internal error text/stack to clients; missing auth on admin routes (guard-ready per blueprint); CORS wildcard with credentials.
- Breaking changes under `/v1` — new version, not silent mutation.
- Envelope inconsistency: success = bare DTO, error = envelope — clients can't trust shapes; one envelope both ways.
- Forgetting 429/5xx in the OpenAPI spec and client retry logic (exponential backoff, jitter).

## Rulebase Coupling

- CONTRACTS: REST shapes live in the shared contracts package; per-client forks are a violation.
- REST works on any deployment target (stateless) — keep it stateless; file/stream endpoints don't become persistent transports.
- endpoint checklist phases; each route's tests close its checkbox.
- integration tests for critical flows non-negotiable.

## References

- https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- https://swagger.io/specification/
- https://docs.nestjs.com/controllers
