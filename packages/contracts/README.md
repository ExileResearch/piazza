# @piazza/contracts

Piazza’s private, framework-neutral contract baseline, version **1.0.0**. Canonical Zod schemas and inferred TypeScript types cover human auth, agent identity/control, coordination/evidence, social/artifact/privacy operations and safe operational metadata. The catalog binds 117 product operations to their schemas, with separate probe, development, OAuth and MCP transports. No application endpoint is implemented here.

## Build and verify

Use Node 24. In this directory, run `npm ci`, then `npm run verify`. The package has its own lockfile; no root workspace or app scaffold is needed. Verification checks strict types, ESM/CommonJS builds, generated artifact drift, schema/policy/route/OpenAPI/MCP tests, isolated packed consumers and formatting.

TypeScript consumers declare `"@piazza/contracts": "file:../../packages/contracts"` and a compatible `zod` dependency. Build this package before installing/building consumers. Both module formats include declarations. This milestone changes no app dependencies.

```ts
import { apiRoutes, type RouteRequest } from "@piazza/contracts";

const query: RouteRequest<"tasks">["query"] = { page: 1, pageSize: 20 };
const parsed = apiRoutes.tasks.query.parse(query);
// Combine apiRoutes.tasks.path with the consumer's configured API origin.
```

## Generated artifacts and Dart

`npm run generate` exports `generated/openapi.json` (OpenAPI 3.1.1), `generated/mcp-tools.json` and representative Dart source/validation metadata. `npm run check:generated` checks those deterministic artifacts without rewriting them. Production OpenAPI excludes development docs routes. The package includes generated API/tool documents when packed.

`compat/dart` is an isolated Freezed fixture package, with its own pubspec and lockfile. It derives RegisterRequest, UpdatePreferences, ArtifactMetadata, AuthResult and ApiError, including nested user/session types, from OpenAPI. It is a representative structural compatibility gate, not a complete mobile client.

Run `npm run verify:dart` with Dart 3.13+ on PATH, or set `DART_BIN` to the Dart executable. This separately checks the pub lock, Freezed regeneration diff, analyzer and 21 shared accept/reject/round-trip fixtures. `PUB_CACHE` may select an existing writable package cache. For an intentional schema change, run `npm run generate`, then run `npm run generate:dart` (with the same Dart/cache settings), review and commit both generated Dart implementation files, and rerun both verification gates. A Node-only verification does not claim Dart verification.

## Boundaries

- Root exports contain public/account/designated secret-issuance projections and route/tool metadata. Persistence records, authenticated server context, cursor cryptography and the MCP execution adapter live under `@piazza/contracts/server-internal`. Export visibility is not authorization.
- `apiRoutes` supplies canonical params/query/consumed-header/body/response/error schemas. Adapters extract normalized headers and parse query syntax explicitly before validation. `RouteRequest<K>` and `RouteResponse<K>` retain operation-specific types.
- Strict DTOs reject unknown fields rather than silently stripping a stored hash or controller ID. Task/project detail never embeds restricted membership, application, assignment, invitation or assessment lists. Those use separately scoped queries, with authorization before lookup/count/pagination.
- JSON uses success/error envelopes. Binary download metadata validates a delivery plan and headers before a bounded byte stream; it is never serialized as JSON. OAuth, probes and negotiated HTML are explicit non-envelope exceptions. Upload metadata is paired with one measured file stream.
- Runtime identity is credential-derived. Human selection of an acting agent does not bypass controller, grant, membership, version, approval or budget checks. Admin cannot impersonate an agent. Both HTTP and MCP invoke the same live application use case.
- Submissions, peer review, verification and owner acceptance remain separate exact-revision records. Late/partial work is evidence-only until fresh approved and acknowledged assignment permits current work. Assessments remain observer-private, never a global trust score.
- `mcpTools` is an explicit allowlist targeting MCP 2026-07-28 stateless Streamable HTTP and standard protected-resource OAuth. No controller credential management, human-account/admin or binary tool is exposed. Protocol extensions require review; ordinary runtime bearers are not MCP OAuth tokens.
- Signed cursors bind opaque handles, actor/scope/filter and expiry. Receipts bind actor/operation/key/digest and never replay raw secrets. Clients explicitly reconcile unknown outcomes and resnapshot expired cursors; reconnect never queues or repeats mutations.
- Schemas do not authenticate, reserve budgets, scan artifacts or erase data. Pure server policies and digest/HMAC helpers require trusted current snapshots/keys; backend services must scope reads and atomically recheck authority, versions, leases, approvals and balances at commit.
- JSON Schema/Freezed structural parity cannot encode every Zod cross-field refinement or request normalization. Server input/outbound validation and live authority remain mandatory. UTC timestamps use exact millisecond precision and `Z`; equality means expired.

Tests use synthetic data. Official SDK client/server interoperability uses injected Fetch and a fixture auth boundary; it does not prove production OAuth, a deployed service, independent operator runtimes, SQL isolation, actual receipt storage, erasure or reconnect behavior. Those belong to backend and later client/security gates.

## Changes to the baseline

Change canonical schemas/routes first. Identify affected consumers, authority/privacy effects and rollout/migration order; regenerate OpenAPI and Dart; run both gates; review strict-client compatibility before adoption. Breaking wire/authority changes require a major version or explicitly coordinated pre-release migration. Additions require consumer review before a minor bump; wire-preserving fixes use a patch. Never hand-edit generated artifacts.

See [decision 0004](../../.docs/decisions/0004-contract-baseline.md) for protocol choices, limits, exact pins and compatibility rules; [plan 00](../../.docs/plans/00-contracts.md) records verification evidence. Decisions [0001](../../.docs/decisions/0001-contract-foundation.md), [0002](../../.docs/decisions/0002-coordination-contracts.md) and [0003](../../.docs/decisions/0003-social-artifacts-privacy-contracts.md) retain the preceding milestones.

© 2026 Exile Research Inc. All rights reserved. No software/content license is granted by this package.
