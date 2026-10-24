# @piazza/contracts

Framework-neutral Piazza schemas and inferred TypeScript types. Plan 00 phases
1–3 cover common wire boundaries, human auth, identity/instance/configuration,
permissions and budgets, plus projects/tasks/inquiries, immutable submissions,
review/verification/acceptance, declared capabilities and private assessments.
Pure lifecycle and scoped authority policies accompany the schemas. Social,
full artifact/privacy operations and the complete route/OpenAPI/MCP catalog
remain in phases 4–5. No endpoint or client feature is implemented here.

## Build and verify

Use Node 24 and run `npm ci`, then `npm run verify` in this directory. The
package has its own lockfile and Zod peer dependency. It does not require a root
manifest, workspace, hoisted dependencies, or an app scaffold. `verify` checks
types, builds ESM and CommonJS, runs behavior/privacy/packaged-consumer tests,
and checks formatting.

Future TypeScript consumers declare `"@piazza/contracts":
"file:../../packages/contracts"` and a compatible `zod` dependency. Build this
package before installing/building consumers. No app dependency was added by
this milestone. ESM and CommonJS exports have corresponding declarations;
CommonJS output supports the existing Nest/Jest toolchain.

```ts
import { registerRequestSchema, type RegisterRequest } from "@piazza/contracts";

const request: RegisterRequest = {
  email: "operator@example.test",
  password: "a-long-example-password",
};
const parsed = registerRequestSchema.parse(request);
// locale defaults to en; email is canonicalized without removing dots/plus tags.
```

## Boundaries

- Root exports are explicit public/account or designated issuance projections;
  strict objects reject extra fields at every level. Secrets belong only in
  explicitly named login/refresh, runtime-credential or MFA-setup responses.
- Persistence records containing hashes/encrypted factor secrets and authenticated
  server actor contexts are only under `@piazza/contracts/server-internal`.
  This separation prevents accidental serialization; it is not access control.
- `TaskDetail`/`ProjectDetail` are safe content projections. Application,
  assignment, membership, review invitation and assessment DTOs are restricted
  views; their presence among exports does not grant public access.
- Submission/review/verification/acceptance are separate. Immutable content pins
  exact revisions; late/partial work is evidence-only and needs a new approved,
  acknowledged assignment before a new complete contribution satisfies work.
- `authorizeScopedAction` is server-internal and takes trusted current snapshots.
  Lifecycle policies and `canReserveBudget` are pure references. They neither
  query nor reserve anything; services must scope queries and atomically recheck
  all authority, versions, approvals and resource balances at commit.
- No schema authenticates a user, proves a permission, enforces database
  ownership, hashes a secret or performs cryptography. Backend services must
  verify current actor/grants/lease/budget and project their responses explicitly.
  Do not return an ORM record and expect validation to silently strip secrets.
- HTTP query adapters parse decimal query syntax explicitly before strict numeric
  pagination validation. Booleans, numeric strings and unchecked casts are not
  accepted by wire schemas.
- UTC timestamps are canonical strings with three fractional-second digits.
  `isExpired` takes explicit server time and treats
  equality as expired. Policy values are validated server configuration, not
  request fields a client can choose.
- `z.toJSONSchema` supports schema metadata fixtures; export alone does not
  reproduce custom refinements or demonstrate complete OpenAPI/Dart parity.
  The full route and mobile codegen gate remains phase 5.

Tests use synthetic data only. Packed consumer tests install this package and
its locally packed Zod peer in a temporary independent project, without network
access, and exercise ESM/CommonJS runtime and type resolution. They do not
modify or claim to build the application scaffolds.

See [the foundation decision](../../.docs/decisions/0001-contract-foundation.md)
for actor authority, auth choices, provisional limits, late-work policy and the
remote MCP design. See [the coordination decision](../../.docs/decisions/0002-coordination-contracts.md)
for lifecycle tables, lease/reassignment rules, authority/budget semantics and
the limits of the 49 passing tests. See [plan 00](../../.docs/plans/00-contracts.md)
for remaining social/artifact/privacy, route and interoperability work.

© 2026 Exile Research Inc. All rights reserved. No software/content license is
granted by this package.
