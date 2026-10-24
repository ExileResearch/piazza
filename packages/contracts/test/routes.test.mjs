import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import SwaggerParser from "@apidevtools/swagger-parser";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import * as c from "../dist/esm/index.js";
import * as internal from "../dist/esm/server-internal.js";
import {
  generateOpenApi,
  representativeSchemas,
  jsonSchema,
} from "../scripts/lib/openapi.mjs";
import { id, t0, t1, caps } from "./coordination-fixtures.mjs";

test("all inventory rows materialize once and cover F01-F16 with bounded schema components", async () => {
  const doc = await readFile(
    new URL("../../../.docs/contracts.md", import.meta.url),
    "utf8",
  );
  const declared = [
    ...doc.matchAll(
      /^\|\s*(GET|POST|PUT|PATCH|DELETE)\s*\|\s*(\/[^\s|]*)\s*\|/gm,
    ),
  ].map(([, m, p]) => `${m} /api/v1${p}`);
  const keys = Object.values(c.apiRoutes).map((r) => `${r.method} ${r.path}`);
  assert.equal(new Set(keys).size, keys.length);
  for (const row of declared) assert.ok(keys.includes(row), row);
  const journeys = new Set(
    Object.values(c.apiRoutes).flatMap((r) => r.journeys),
  );
  for (let n = 1; n <= 16; n++)
    assert.ok(journeys.has(`J${String(n).padStart(2, "0")}`));
  const features = new Set(
    Object.values(c.apiRoutes).flatMap((r) => r.features),
  );
  for (let n = 1; n <= 16; n++)
    assert.ok(features.has(`F${String(n).padStart(2, "0")}`));
  for (const [key, r] of Object.entries(c.apiRoutes)) {
    assert.deepEqual(
      Object.keys(r.params.shape).sort(),
      [...r.path.matchAll(/:([A-Za-z]+)/g)].map((m) => m[1]).sort(),
      key,
    );
    for (const s of [r.params, r.query, r.headers, r.body]) {
      assert.equal(
        s.safeParse({ injectedAuthority: "admin" }).success,
        false,
        key,
      );
      assert.doesNotThrow(() => jsonSchema(s, "input"), key);
    }
    assert.doesNotThrow(() => jsonSchema(r.response));
    for (const [status, schema] of Object.entries(r.errors)) {
      const code = c.errorCodesByStatus[status][0];
      const error = {
        error: { code, messageKey: "error.safe" },
        meta: { correlationId: id(1) },
      };
      assert.equal(schema.safeParse(error).success, true, `${key} ${status}`);
      assert.equal(
        schema.safeParse({
          ...error,
          error: { ...error.error, stack: "unsafe" },
        }).success,
        false,
      );
    }
  }
});

test("parameter kinds, numeric query syntax, acting selection and secret headers stay explicit", () => {
  assert.equal(
    c.apiRoutes.threadEntries.params.safeParse({
      parentType: "task",
      parentId: id(1),
    }).success,
    true,
  );
  assert.equal(
    c.apiRoutes.threadEntries.params.safeParse({
      parentType: "admin",
      parentId: id(1),
    }).success,
    false,
  );
  assert.equal(
    c.apiRoutes.decideConsent.params.safeParse({ purpose: "unknown" }).success,
    false,
  );
  assert.deepEqual(
    c.decodeQuery(c.pageQuerySchema, new URLSearchParams("page=2&pageSize=10")),
    { page: 2, pageSize: 10 },
  );
  for (const q of [
    "page=1&page=2",
    "page=true",
    "page=01",
    "page=1.2",
    "page=1e2",
    "page=1&admin=true",
  ])
    assert.throws(() =>
      c.decodeQuery(c.pageQuerySchema, new URLSearchParams(q)),
    );
  assert.equal(
    c.validateActingSelection("runtime", { "x-acting-agent-id": id(1) }),
    false,
  );
  assert.equal(c.validateActingSelection("human", {}), false);
  assert.equal(
    c.validateActingSelection("human", { "x-acting-agent-id": id(1) }),
    true,
  );
  assert.equal(
    c.apiRoutes.createInstance.headers.safeParse({
      authorization: `Bearer ${"a".repeat(32)}`,
      "idempotency-key": "a".repeat(16),
    }).success,
    false,
  );
  for (const name of [
    "passwordLogin",
    "refresh",
    "stepUp",
    "createInstance",
    "rotateCredential",
    "enrollMfa",
    "confirmMfa",
  ])
    assert.equal(c.apiRoutes[name].issuesSecret, true, name);
  assert.equal(c.apiRoutes.createTask.requiresIdempotency, true);
  assert.equal(c.apiRoutes.passwordLogin.requiresIdempotency, false);
});

test("approval intent reuses exact route inputs and excludes administrative/credential/binary operations", () => {
  const intent = {
    operationId: "updateTask",
    params: { id: id(1) },
    query: {},
    body: { expectedVersion: 1, title: "Revised" },
  };
  assert.equal(
    c.requestActionApprovalSchema.safeParse({ intent, budget: caps }).success,
    true,
  );
  assert.equal(
    c.actionIntentSchema.safeParse({
      ...intent,
      body: { ...intent.body, grant: "admin" },
    }).success,
    false,
  );
  for (const name of [
    "moderate",
    "createInstance",
    "uploadArtifact",
    "task",
    "requestActionApproval",
  ])
    assert.equal(
      c.actionIntentSchema.safeParse({ ...intent, operationId: name }).success,
      false,
      name,
    );
  assert.equal(
    c.requestActionApprovalSchema.safeParse({
      intent,
      budget: caps,
      payloadDigest: "a".repeat(64),
    }).success,
    false,
  );
});

test("OpenAPI is valid in production/development modes with correct transports and security", async () => {
  const prod = generateOpenApi();
  const dev = generateOpenApi({ development: true });
  await SwaggerParser.validate(structuredClone(prod));
  await SwaggerParser.validate(structuredClone(dev));
  assert.equal(prod.openapi, "3.1.1");
  assert.equal(prod.info.version, "1.0.0");
  assert.equal(prod.paths["/api/v1/docs"], undefined);
  assert.equal(dev.paths["/api/v1/docs"].get["x-development-only"], true);
  assert.ok(prod.paths["/ready"].get.responses[503]);
  assert.ok(
    prod.paths["/api/v1/artifacts"].post.requestBody.content[
      "multipart/form-data"
    ],
  );
  assert.ok(
    prod.paths["/api/v1/artifacts/{id}/download"].get.responses[200].content[
      "application/octet-stream"
    ],
  );
  assert.ok(
    prod.paths["/api/v1/public/updates"].post.responses[202].content[
      "text/html"
    ],
  );
  assert.ok(
    prod.paths["/oauth/token"].post.requestBody.content[
      "application/x-www-form-urlencoded"
    ],
  );
  assert.deepEqual(prod.paths["/mcp"].post.security, [{ mcpOAuth: [] }]);
});

test("representative OpenAPI and Zod fixtures agree on optionality, enums, dates and auth branches", async () => {
  const ajv = addFormats(new Ajv({ strict: true }));
  const validators = Object.fromEntries(
    Object.entries(representativeSchemas).map(([name, s]) => [
      name,
      ajv.compile(
        jsonSchema(
          s,
          name === "RegisterRequest" || name === "UpdatePreferences"
            ? "input"
            : "output",
        ),
      ),
    ]),
  );
  const fixtures = JSON.parse(
    await readFile(new URL("./parity-fixtures.json", import.meta.url), "utf8"),
  );
  for (const [i, f] of fixtures.entries()) {
    const parsed = representativeSchemas[f.schema].safeParse(f.value);
    assert.equal(parsed.success, f.valid, `Zod fixture ${i}`);
    assert.equal(
      validators[f.schema](f.value),
      f.valid,
      `OpenAPI fixture ${i}`,
    );
    if (f.valid)
      assert.deepEqual(
        parsed.data,
        f.expected ?? f.value,
        `Normalization fixture ${i}`,
      );
  }
  // Cross-field refinements cannot be inferred from ordinary JSON Schema. Server validation remains mandatory.
  assert.equal(
    c.updatePreferencesSchema.safeParse({ expectedVersion: 1 }).success,
    false,
  );
});

test("cursor signatures bind actor, filter, expiry and opaque handle without revealing ledger positions", async () => {
  const record = {
    handle: id(1),
    actorScopeDigest: "a".repeat(64),
    filterDigest: "b".repeat(64),
    issuedAt: t0,
    expiresAt: t1,
  };
  const key = new Uint8Array(32).fill(7);
  const cursor = await internal.issueEventCursor(record, key);
  assert.ok(cursor.length <= 512);
  const expected = {
    actorScopeDigest: record.actorScopeDigest,
    filterDigest: record.filterDigest,
    now: t0,
  };
  assert.deepEqual(
    await internal.readEventCursor(cursor, key, expected),
    record,
  );
  for (const patch of [
    { actorScopeDigest: "c".repeat(64) },
    { filterDigest: "d".repeat(64) },
    { now: t1 },
  ])
    assert.equal(
      await internal.readEventCursor(cursor, key, { ...expected, ...patch }),
      undefined,
    );
  assert.equal(
    await internal.readEventCursor(
      cursor,
      new Uint8Array(32).fill(8),
      expected,
    ),
    undefined,
  );
  assert.equal(
    await internal.readEventCursor(cursor + "a", key, expected),
    undefined,
  );
  await assert.rejects(() =>
    internal.issueEventCursor(
      { ...record, expiresAt: "2026-10-24T18:00:00.000Z" },
      key,
    ),
  );
  assert.equal(
    internal.eventCursorRecordSchema.safeParse({ ...record, sequence: 3000 })
      .success,
    false,
  );
  assert.deepEqual(c.transportPolicySchema.parse({}), {
    cursorTtlSeconds: 300,
    eventRetentionSeconds: 86400,
    idempotencyTtlSeconds: 86400,
  });
});

test("canonical digest has deterministic key order and rejects lossy or unsafe JSON", async () => {
  assert.equal(internal.canonicalJson({ b: 2, a: 1 }), ' {"a":1,"b":2}'.trim());
  assert.equal(
    await internal.payloadDigest({ b: 2, a: 1 }),
    await internal.payloadDigest({ a: 1, b: 2 }),
  );
  assert.notEqual(
    await internal.payloadDigest({ a: 1 }),
    await internal.payloadDigest({ a: 2 }),
  );
  for (const value of [
    undefined,
    NaN,
    Infinity,
    new Date(),
    { a: undefined },
    "\ud800",
  ])
    assert.throws(() => internal.canonicalJson(value));
  const cycle = {};
  cycle.x = cycle;
  assert.throws(() => internal.canonicalJson(cycle));
  assert.equal(
    c.operationStatusSchema.safeParse({
      state: "secret_unavailable",
      receiptId: id(1),
      nextAction: "rotate_credential",
      secret: "a".repeat(32),
    }).success,
    false,
  );
  assert.equal(
    c.eventPageSchema.safeParse({ items: [], nextCursor: "stale" }).success,
    false,
  );
});

test("new controller operations and restricted pages have positive fixtures and reject authority fields", () => {
  const cases = [
    [
      c.updateAgentProfileSchema,
      { expectedVersion: 1, displayName: "A new name" },
    ],
    [
      c.createConfigurationSchema,
      {
        expectedVersion: 1,
        declared: { tools: [] },
        disclosureScope: "operator_private",
      },
    ],
    [
      c.createInstanceSchema,
      { expectedVersion: 1, configurationRevisionId: id(1), label: "Worker" },
    ],
    [c.rotateCredentialSchema, { expectedVersion: 1 }],
    [
      c.grantPermissionSchema,
      {
        expectedVersion: 1,
        actions: ["task.read"],
        resourceScope: { kind: "project", id: id(1) },
        budgetCaps: caps,
        approvalRule: "within_grant",
        expiresAt: t1,
      },
    ],
    [c.stopAllRequestSchema, { confirm: "stop_all_agents" }],
    [c.decideActionApprovalSchema, { expectedVersion: 1, decision: "approve" }],
    [c.agentSearchSchema, { page: 1, query: "review", modality: "text" }],
  ];
  for (const [schema, input] of cases) {
    assert.equal(schema.safeParse(input).success, true);
    assert.equal(
      schema.safeParse({ ...input, userId: id(999) }).success,
      false,
    );
  }
  for (const schema of [
    c.membershipPageSchema,
    c.applicationPageSchema,
    c.assignmentPageSchema,
    c.publishedReviewPageSchema,
    c.acceptanceDecisionPageSchema,
    c.associationPageSchema,
    c.socialControlPageSchema,
    c.capabilityOfferPageSchema,
    c.configurationPageSchema,
    c.actionApprovalPageSchema,
  ]) {
    assert.equal(
      schema.safeParse({ items: [], total: 0, page: 1, pageSize: 20 }).success,
      true,
    );
    assert.equal(
      schema.safeParse({
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        privateCount: 2,
      }).success,
      false,
    );
  }
  assert.equal(c.apiRoutes.publishedReviews.query.safeParse({}).success, false);
  assert.equal(
    c.apiRoutes.publishedReviews.query.safeParse({ revision: 1 }).success,
    true,
  );
});

test("controller summary and receipt projections omit hidden histories, secrets and ledger positions", async () => {
  const { agent } = await import("./fixtures.mjs");
  const empty = { items: [], total: 0, page: 1, pageSize: 20 };
  const summary = {
    agent,
    instances: empty,
    grants: empty,
    allocations: empty,
    assignments: empty,
    pendingApprovals: empty,
  };
  assert.equal(c.agentControlStateSchema.safeParse(summary).success, true);
  assert.equal(
    c.agentControlStateSchema.safeParse({
      ...summary,
      privateAssessments: empty,
    }).success,
    false,
  );
  for (const value of [
    { state: "pending", receiptId: id(1) },
    {
      state: "applied",
      receiptId: id(1),
      reference: { kind: "assignment", id: id(2), revision: 1 },
    },
    {
      state: "secret_unavailable",
      receiptId: id(1),
      nextAction: "restart_factor_enrollment",
    },
    { state: "failed", receiptId: id(1), code: "VERSION_CONFLICT" },
  ])
    assert.equal(c.operationStatusSchema.safeParse(value).success, true);
  assert.equal(
    c.apiRoutes.downloadArtifact.responseValidation,
    "delivery_plan_then_bounded_stream",
  );
  assert.equal(
    c.apiRoutes.downloadArtifact.response,
    c.artifactDownloadPlanSchema,
  );
});
