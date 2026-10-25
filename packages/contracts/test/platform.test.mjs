import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import * as c from "../dist/esm/index.js";
import * as s from "../dist/esm/server-internal.js";
import * as f from "./platform-fixtures.mjs";
import { currentUser, agent } from "./fixtures.mjs";
import { assessment, context, action } from "./coordination-fixtures.mjs";

const valid = (schema, value) => {
  const parsed = schema.safeParse(value);
  assert.equal(parsed.success, true, parsed.error?.message);
};
const invalid = (schema, value) =>
  assert.equal(schema.safeParse(value).success, false);
const allow = (result) =>
  assert.equal(result.allowed, true, JSON.stringify(result));
const deny = (result, code) =>
  assert.deepEqual(result, { allowed: false, code });
const copy = (value) => structuredClone(value);
const receipt = { receiptId: f.id(399), outcome: "applied", occurredAt: f.t1 };
const operations = [
  [
    "createWallPost",
    { text: f.wall.text, artifactIds: [] },
    "wallPost",
    f.wall,
  ],
  [
    "updateWallPost",
    { expectedVersion: 1, text: "A correction" },
    "wallPost",
    { ...f.wall, text: "A correction", revision: 2, version: 2 },
  ],
  ["pageQuery", {}, "wallPage", f.page(f.wall)],
  [
    "reactToPost",
    { precondition: { kind: "absent" }, expectedPostVersion: 1, kind: "like" },
    "reaction",
    {
      ...f.entity(320),
      postId: f.wall.id,
      reactorAgentId: f.id(1),
      kind: "like",
    },
  ],
  [
    "removeReaction",
    { expectedVersion: 1, expectedPostVersion: 1 },
    "actionReceipt",
    receipt,
  ],
  [
    "requestAssociation",
    { recipientAgentId: f.id(2) },
    "association",
    { ...f.association, state: "pending", decidedAt: undefined },
  ],
  [
    "associationDecision",
    { expectedVersion: 1, decision: "accept" },
    "association",
    f.association,
  ],
  ["expectedVersion", { expectedVersion: 1 }, "actionReceipt", receipt],
  [
    "setSocialControl",
    {
      precondition: { kind: "version", expectedVersion: 1 },
      muted: false,
      blocked: true,
    },
    "socialControl",
    { ...f.control, blocked: true },
  ],
  [
    "feedQuery",
    { scope: "associates" },
    "feedDigest",
    { ...f.page(f.wall), generatedAt: f.t1 },
  ],
  [
    "uploadArtifact",
    f.upload,
    "artifactUpload",
    { artifact: { ...f.artifact, scanState: "pending" } },
  ],
  ["empty", {}, "artifactMetadata", f.artifact],
  [
    "createAbuseReport",
    { target: f.target, category: "spam", details: f.report.details },
    "abuseReportReceipt",
    { id: f.report.id, createdAt: f.t0, status: "received" },
  ],
  ["reportQuery", {}, "adminReportPage", f.page(f.report)],
  [
    "createModerationAction",
    {
      expectedVersion: 1,
      target: f.target,
      action: "hide_content",
      reason: f.moderation.reason,
    },
    "moderationAction",
    f.moderation,
  ],
  [
    "reportUsage",
    {
      expectedVersion: 2,
      entries: [
        {
          ...f.claim,
          allocationId: f.allocation.id,
          expectedAllocationVersion: 1,
        },
      ],
    },
    "usageReceipt",
    { records: [f.usage], allocations: [f.allocation] },
  ],
  ["eventCursorQuery", {}, "activityPage", { items: [f.activity] }],
  [
    "consentDecision",
    {
      precondition: { kind: "absent" },
      policyVersion: "research-v1",
      granted: false,
    },
    "consentState",
    f.consent,
  ],
  ["exportRequest", {}, "exportJob", f.exportJob],
  [
    "closeAccountRequest",
    { expectedVersion: 1, confirm: "close_account" },
    "accountClosure",
    {
      receiptId: f.id(321),
      outcome: "closure_accepted",
      closedAt: f.t1,
      purgeDueAt: c.accountPurgeDueAt(f.t1),
      accessRevoked: true,
    },
  ],
  [
    "updatesInterest",
    f.form,
    "publicFormReceipt",
    { status: "request_received" },
  ],
  [
    "opsQuery",
    {},
    "operationsSummary",
    {
      generatedAt: f.t1,
      window: "day",
      queuedJobs: 0,
      failedJobs: 0,
      pendingScans: 0,
      pendingReports: 0,
      overduePurges: 0,
    },
  ],
];

test("phase 4 operations have strict request, result and safe error fixtures", () => {
  for (const [inputName, input, outputName, output] of operations) {
    valid(c[`${inputName}Schema`], input);
    invalid(c[`${inputName}Schema`], { ...input, privateDebug: "not allowed" });
    valid(c.apiSuccessSchema(c[`${outputName}Schema`]), {
      data: output,
      meta: { correlationId: f.id(400) },
    });
    for (const code of [
      "NOT_FOUND",
      "ACTION_FORBIDDEN",
      "VERSION_CONFLICT",
      "ARTIFACT_QUARANTINED",
      "BUDGET_EXHAUSTED",
      "DEPENDENCY_UNAVAILABLE",
    ])
      valid(c.apiErrorResponseSchema, {
        error: { code, messageKey: "errors.action_failed" },
        meta: { correlationId: f.id(400) },
      });
  }
});

test("D25-D38 projections distinguish public, party, admin and server-only fields", () => {
  for (const [schema, value] of [
    [c.wallPostSchema, f.wall],
    [c.associationSchema, f.association],
    [c.socialControlSchema, f.control],
    [c.adminReportSchema, f.report],
    [c.moderationActionSchema, f.moderation],
    [c.budgetAllocationSchema, f.allocation],
    [c.usageRecordSchema, f.usage],
    [c.activityEventSchema, f.activity],
    [c.consentStateSchema, f.consent],
    [c.exportJobSchema, f.exportJob],
    [c.operationalJobMetadataSchema, f.job],
  ]) {
    valid(schema, value);
    for (const key of [
      "userId",
      "passwordHash",
      "rawToken",
      "opaqueStorageRef",
      "opaquePayloadRef",
      "reporterUserId",
    ])
      invalid(schema, { ...value, [key]: "private" });
  }
  for (const key of [
    "associations",
    "controls",
    "reports",
    "trustScore",
    "assessments",
    "privateGraph",
  ])
    invalid(c.wallPostSchema, { ...f.wall, [key]: [] });
  invalid(c.adminReportSchema, {
    ...f.report,
    reporter: { kind: "human", userId: f.id(32) },
  });
  invalid(c.abuseReportReceiptSchema, {
    id: f.report.id,
    createdAt: f.t0,
    status: "received",
    target: f.target,
  });
  invalid(c.moderationNoticeSchema, {
    id: f.id(360),
    createdAt: f.t1,
    action: "hide_content",
    messageKey: "moderation.action_applied",
    reporterUserId: f.id(32),
  });
  for (const name of [
    "artifactRecordSchema",
    "artifactScanCommandSchema",
    "abuseReportRecordSchema",
    "moderationActionRecordSchema",
    "budgetAllocationRecordSchema",
    "auditEventSchema",
    "consentRecordSchema",
    "publicFormSubmissionSchema",
    "accountExportRecordSchema",
    "operationalJobSchema",
    "idempotencyReceiptSchema",
    "accountErasureRecordSchema",
    "evaluateArtifactDownload",
    "authorizeHumanOperation",
  ]) {
    assert.equal(name in c, false, name);
    assert.equal(name in s, true, name);
  }
});

test("associates-only content needs mutual acceptance; revoked relationships and private ancestors hide it", () => {
  allow(s.evaluateSocialAccess(f.social()));
  for (const state of ["pending", "declined", "revoked"]) {
    const facts = f.social();
    facts.associations[0] = {
      ...facts.associations[0],
      state,
      ...(state === "pending" ? { decidedAt: undefined } : {}),
    };
    deny(s.evaluateSocialAccess(facts), "NOT_FOUND");
  }
  deny(
    s.evaluateSocialAccess({ ...f.social(), viewerAgentId: f.id(3) }),
    "NOT_FOUND",
  );
  deny(
    s.evaluateSocialAccess({ ...f.social(), viewerAgentId: undefined }),
    "NOT_FOUND",
  );
  deny(
    s.evaluateSocialAccess({ ...f.social(), ancestorReadable: false }),
    "NOT_FOUND",
  );
  allow(
    s.evaluateSocialAccess({
      ...f.social(),
      viewerAgentId: f.id(2),
      associations: [],
    }),
  );
  allow(
    s.evaluateSocialAccess({
      ...f.social(),
      viewerAgentId: undefined,
      post: { ...f.wall, visibility: "public" },
    }),
  );
});

test("mute only filters the observer feed; either party's block prevents authenticated interaction", () => {
  const facts = f.social();
  facts.controls[0].muted = true;
  allow(s.evaluateSocialAccess(facts));
  deny(s.evaluateSocialAccess({ ...facts, mode: "feed" }), "NOT_FOUND");
  allow(s.evaluateSocialAccess({ ...facts, mode: "interact" }));
  for (const control of [
    { ...f.control, blocked: true },
    {
      ...f.control,
      controllerAgentId: f.id(2),
      targetAgentId: f.id(1),
      blocked: true,
    },
  ]) {
    deny(
      s.evaluateSocialAccess({
        ...f.social(),
        controls: [control],
        mode: "interact",
      }),
      "NOT_FOUND",
    );
  }
  deny(
    s.evaluateSocialAccess({
      ...f.social(),
      post: { ...f.wall, visibility: "public" },
      viewerAgentId: undefined,
      mode: "interact",
    }),
    "UNAUTHENTICATED",
  );
  deny(
    s.evaluateSocialAccess({
      ...f.social(),
      post: { ...f.wall, moderationState: "hidden" },
    }),
    "NOT_FOUND",
  );
});

test("wall authorship and explicit version checks survive grants and moderator state", () => {
  const ctx = context();
  ctx.resource = {
    kind: "agent",
    id: f.id(2),
    ownerAgentId: f.id(2),
    controllerUserId: f.id(32),
    version: 1,
    visibility: "public",
  };
  ctx.ancestors = [];
  ctx.wallPost = f.wall;
  ctx.grants[0].resourceScope = { kind: "agent", id: f.id(2) };
  ctx.grants[0].actions = ["wall.update", "wall.delete", "post.react"];
  allow(
    s.authorizeScopedAction(ctx, {
      ...action,
      action: "wall.update",
      expectedVersion: 1,
    }),
  );
  deny(
    s.authorizeScopedAction(ctx, {
      ...action,
      action: "wall.update",
      expectedVersion: 2,
    }),
    "VERSION_CONFLICT",
  );
  deny(
    s.authorizeScopedAction(
      {
        ...ctx,
        wallPost: {
          ...f.wall,
          agentId: f.id(1),
          attribution: { ...f.attribution, agentId: f.id(1) },
        },
      },
      { ...action, action: "wall.update", expectedVersion: 1 },
    ),
    "ACTION_FORBIDDEN",
  );
  deny(
    s.evaluateSocialAccess({ ...f.social(), mode: "edit" }),
    "ACTION_FORBIDDEN",
  );
  allow(
    s.evaluateSocialAccess({
      ...f.social(),
      viewerAgentId: f.id(2),
      mode: "edit",
      post: { ...f.wall, moderationState: "hidden" },
    }),
  );
  invalid(c.updateWallPostSchema, {
    expectedVersion: 1,
    moderationState: "visible",
  });
  invalid(c.wallPostSchema, {
    ...f.wall,
    attribution: { ...f.attribution, agentId: f.id(1) },
  });
  invalid(c.reactToPostSchema, { kind: "like" });
});

test("association requests cannot self-accept, duplicate reverse requests or revive terminal relationships", () => {
  const pending = { ...f.association, state: "pending", decidedAt: undefined };
  allow(s.evaluateAssociationRequest(f.id(1), f.id(2), [], []));
  deny(
    s.evaluateAssociationRequest(f.id(1), f.id(1), [], []),
    "INVALID_TRANSITION",
  );
  deny(
    s.evaluateAssociationRequest(f.id(2), f.id(1), [pending], []),
    "VERSION_CONFLICT",
  );
  deny(
    s.evaluateAssociationDecision(pending, f.id(1), "accept", 1, []),
    "ACTION_FORBIDDEN",
  );
  allow(s.evaluateAssociationDecision(pending, f.id(2), "accept", 1, []));
  deny(
    s.evaluateAssociationDecision(pending, f.id(2), "accept", 2, []),
    "VERSION_CONFLICT",
  );
  deny(
    s.evaluateAssociationDecision(pending, f.id(2), "accept", 1, [
      { ...f.control, blocked: true },
    ]),
    "ACTION_FORBIDDEN",
  );
  allow(
    s.evaluateAssociationDecision(f.association, f.id(1), "revoke", 1, [
      { ...f.control, blocked: true },
    ]),
  );
  deny(
    s.evaluateAssociationDecision(
      { ...f.association, state: "revoked" },
      f.id(2),
      "accept",
      1,
      [],
    ),
    "INVALID_TRANSITION",
  );
});

test("uploads compare measured bytes/MIME, quota, parent and version without accepting storage references", () => {
  const ctx = context();
  ctx.resource = {
    kind: "agent",
    id: f.id(1),
    ownerAgentId: f.id(1),
    controllerUserId: f.id(31),
    visibility: "public",
    version: 1,
  };
  ctx.ancestors = [];
  ctx.wallPost = {
    ...f.wall,
    agentId: f.id(1),
    attribution: { ...f.attribution, agentId: f.id(1) },
    visibility: "public",
    version: 2,
  };
  ctx.grants[0].resourceScope = { kind: "public" };
  ctx.grants[0].actions = ["artifact.upload"];
  ctx.grants[0].budgetCaps.push({ unit: "upload_bytes", hardLimit: 100 });
  const bytes = {
    unit: "upload_bytes",
    hardLimit: 100,
    reserved: 0,
    consumed: 0,
  };
  ctx.operatorBalances.push(bytes);
  ctx.grantBalances[0].balances.push(bytes);
  const cost = {
    action: "artifact.upload",
    expectedVersion: 2,
    budget: [...action.budget, { unit: "upload_bytes", hardLimit: 10 }],
  };
  allow(s.authorizeScopedAction(ctx, cost));
  deny(
    s.authorizeScopedAction(ctx, { ...cost, expectedVersion: 1 }),
    "VERSION_CONFLICT",
  );
  // A valid public-profile grant is only the first gate; current post controls still deny contact.
  deny(
    s.evaluateSocialAccess({
      ...f.social(),
      viewerAgentId: f.id(2),
      post: ctx.wallPost,
      mode: "interact",
      controls: [{ ...f.control, blocked: true }],
    }),
    "NOT_FOUND",
  );
  const policy = c.artifactPolicySchema.parse({});
  allow(s.evaluateArtifactUpload(f.upload, f.uploadFacts, policy));
  for (const key of [
    "hash",
    "opaqueStorageRef",
    "scanState",
    "url",
    "filename",
  ])
    invalid(c.uploadArtifactSchema, { ...f.upload, [key]: "untrusted" });
  deny(
    s.evaluateArtifactUpload(
      f.upload,
      { ...f.uploadFacts, readableParents: [] },
      policy,
    ),
    "NOT_FOUND",
  );
  deny(
    s.evaluateArtifactUpload(
      f.upload,
      { ...f.uploadFacts, parentVersion: 2 },
      policy,
    ),
    "VERSION_CONFLICT",
  );
  deny(
    s.evaluateArtifactUpload(
      f.upload,
      { ...f.uploadFacts, measuredMime: "application/pdf" },
      policy,
    ),
    "VALIDATION_FAILED",
  );
  deny(
    s.evaluateArtifactUpload(
      f.upload,
      { ...f.uploadFacts, measuredBytes: 11 },
      policy,
    ),
    "VALIDATION_FAILED",
  );
  deny(
    s.evaluateArtifactUpload(
      f.upload,
      { ...f.uploadFacts, remainingUploadBytes: 9 },
      policy,
    ),
    "BUDGET_EXHAUSTED",
  );
  invalid(c.uploadArtifactSchema, { ...f.upload, mime: "image/svg+xml" });
  invalid(c.uploadArtifactSchema, { ...f.upload, purpose: "avatar" });
  valid(c.artifactUploadHeadersSchema, {
    "content-type": "multipart/form-data; boundary=synthetic_boundary",
    "idempotency-key": "synthetic_upload_0001",
  });
  invalid(c.artifactUploadHeadersSchema, {
    "content-type": "multipart/form-data; boundary=x\r\nInjected: yes",
    "idempotency-key": "synthetic_upload_0001",
  });
  invalid(c.artifactUploadSchema, { artifact: f.artifact });
});

test("artifact access intersects every current parent and hides foreign IDs before scan errors", () => {
  allow(s.evaluateArtifactDownload(f.storedArtifact, f.readFacts));
  const record = {
    ...f.storedArtifact,
    parentRefs: [f.parent, { kind: "project", id: f.id(999) }],
  };
  deny(s.evaluateArtifactDownload(record, f.readFacts), "NOT_FOUND");
  deny(
    s.evaluateArtifactDownload(
      { ...record, scanState: "quarantined" },
      f.readFacts,
    ),
    "NOT_FOUND",
  );
  deny(
    s.evaluateArtifactMetadata(f.storedArtifact, {
      ...f.readFacts,
      readableParents: [],
    }),
    "NOT_FOUND",
  );
  deny(
    s.evaluateArtifactDownload(
      { ...f.storedArtifact, expiresAt: f.t1 },
      f.readFacts,
    ),
    "NOT_FOUND",
  );
  deny(
    s.evaluateArtifactDownload(
      { ...f.storedArtifact, deletedAt: f.t1 },
      f.readFacts,
    ),
    "NOT_FOUND",
  );
  deny(
    s.evaluateArtifactDownload(
      { ...f.storedArtifact, downloadable: false },
      f.readFacts,
    ),
    "ACTION_FORBIDDEN",
  );
});

test("pending/outage/rejected files cannot be delivered; stale scan results cannot release a new revision", () => {
  const pending = { ...f.storedArtifact, scanState: "pending" };
  allow(s.evaluateArtifactMetadata(pending, f.readFacts));
  for (const scanState of ["pending", "quarantined", "rejected"])
    deny(
      s.evaluateArtifactDownload({ ...pending, scanState }, f.readFacts),
      "ARTIFACT_QUARANTINED",
    );
  const command = {
    expectedVersion: 1,
    scanRevision: 1,
    scannedAt: f.t1,
    outcome: "unavailable",
  };
  assert.equal(
    s.evaluateArtifactScan(pending, command).nextScanState,
    "quarantined",
  );
  assert.equal(
    s.evaluateArtifactScan(pending, { ...command, outcome: "infected" })
      .nextScanState,
    "rejected",
  );
  assert.equal(
    s.evaluateArtifactScan(pending, { ...command, outcome: "clean" })
      .nextScanState,
    "clean",
  );
  deny(
    s.evaluateArtifactScan(pending, { ...command, scanRevision: 2 }),
    "VERSION_CONFLICT",
  );
  deny(
    s.evaluateArtifactScan(pending, { ...command, expectedVersion: 2 }),
    "VERSION_CONFLICT",
  );
  deny(s.evaluateArtifactScan(f.storedArtifact, command), "INVALID_TRANSITION");
});

test("download headers are generated from trusted IDs; only approved raster images render inline", () => {
  const result = s.evaluateArtifactDownload(f.storedArtifact, f.readFacts);
  allow(result);
  valid(c.artifactDownloadHeadersSchema, result.plan.headers);
  assert.equal(result.plan.headers["x-content-type-options"], "nosniff");
  assert.equal(result.plan.headers["cache-control"], "no-store");
  assert.ok(
    result.plan.headers["content-disposition"].startsWith("attachment;"),
  );
  invalid(c.artifactDownloadHeadersSchema, {
    ...result.plan.headers,
    "content-disposition": 'attachment; filename="../../secret.txt"',
  });
  invalid(c.artifactDownloadHeadersSchema, {
    ...result.plan.headers,
    "content-disposition": result.plan.headers["content-disposition"].replace(
      "attachment",
      "inline",
    ),
  });
  const image = {
    ...f.storedArtifact,
    mime: "image/png",
    purpose: "avatar",
    avatarModeration: "pending",
    parentRefs: [{ kind: "agent", id: f.id(2) }],
  };
  const facts = { ...f.readFacts, readableParents: image.parentRefs };
  deny(s.evaluateArtifactDownload(image, facts), "ARTIFACT_QUARANTINED");
  const ready = s.evaluateArtifactDownload(
    { ...image, avatarModeration: "approved" },
    facts,
  );
  allow(ready);
  assert.ok(ready.plan.headers["content-disposition"].startsWith("inline;"));
});

test("admin moderation requires a current human admin and bound step-up without altering canon", () => {
  const facts = { ...f.humanFacts(), stepUp: f.stepUp("moderation.apply") };
  deny(
    s.authorizeHumanOperation(facts, "moderation.apply"),
    "ACTION_FORBIDDEN",
  );
  facts.actor = { ...f.human, roles: ["user", "admin"] };
  allow(s.authorizeHumanOperation(facts, "moderation.apply"));
  deny(
    s.authorizeHumanOperation(
      { ...facts, stepUp: undefined },
      "moderation.apply",
    ),
    "STEP_UP_REQUIRED",
  );
  deny(
    s.authorizeHumanOperation(
      { ...facts, actor: f.actor(2) },
      "moderation.apply",
    ),
    "ACTION_FORBIDDEN",
  );
  for (const key of ["acceptance", "verification", "deciderAgentId"])
    invalid(c.createModerationActionSchema, {
      expectedVersion: 1,
      target: f.target,
      action: "hide_content",
      reason: "Reviewed",
      [key]: true,
    });
  invalid(c.createModerationActionSchema, {
    expectedVersion: 1,
    target: f.target,
    action: "suspend_agent",
    reason: "Wrong target",
  });
});

test("usage provenance, allocation caps and exact duplicate events remain explicit", () => {
  invalid(c.reportUsageSchema, {
    expectedVersion: 1,
    entries: [
      {
        ...f.claim,
        allocationId: f.allocation.id,
        expectedAllocationVersion: 1,
      },
      {
        ...f.claim,
        eventKey: "synthetic_usage_0002",
        allocationId: f.allocation.id,
        expectedAllocationVersion: 1,
      },
    ],
  });
  invalid(c.usageReceiptSchema, {
    records: [f.usage],
    allocations: [{ ...f.allocation, id: f.id(999) }],
  });
  allow(s.evaluateRuntimeUsage(f.allocation, f.claim, 1));
  assert.equal(
    s.evaluateRuntimeUsage({ ...f.allocation, version: 2 }, f.claim, 1, f.usage)
      .duplicate,
    true,
  );
  deny(
    s.evaluateRuntimeUsage(
      f.allocation,
      { ...f.claim, quantity: 101 },
      1,
      f.usage,
    ),
    "VERSION_CONFLICT",
  );
  deny(s.evaluateRuntimeUsage(f.allocation, f.claim, 2), "VERSION_CONFLICT");
  deny(
    s.evaluateRuntimeUsage(f.allocation, { ...f.claim, quantity: 501 }, 1),
    "BUDGET_EXHAUSTED",
  );
  invalid(c.runtimeUsageClaimSchema, { ...f.claim, unit: "requests" });
  invalid(c.runtimeUsageClaimSchema, {
    ...f.claim,
    provenance: "server_measured",
  });
  invalid(c.usageRecordSchema, { ...f.usage, provenance: "server_measured" });
  invalid(c.budgetAllocationSchema, { ...f.allocation, reserved: 901 });
});

test("account exports and closure require ownership, a live human session and matching single-use step-up", () => {
  for (const operation of ["account.export", "account.close"]) {
    const facts = { ...f.humanFacts(), stepUp: f.stepUp(operation) };
    allow(s.authorizeHumanOperation(facts, operation));
    deny(
      s.authorizeHumanOperation(
        { ...facts, resourceUserId: f.id(31) },
        operation,
      ),
      "NOT_FOUND",
    );
    deny(
      s.authorizeHumanOperation({ ...facts, sessionActive: false }, operation),
      "UNAUTHENTICATED",
    );
    deny(
      s.authorizeHumanOperation({ ...facts, accountActive: false }, operation),
      "UNAUTHENTICATED",
    );
    deny(
      s.authorizeHumanOperation({ ...facts, actor: f.actor(2) }, operation),
      "ACTION_FORBIDDEN",
    );
    for (const change of [
      { expiresAt: f.t1 },
      { consumedAt: f.t0 },
      { payloadDigest: "a".repeat(64) },
      { sessionId: f.id(999) },
      { userId: f.id(31) },
      { operation: "consent.decide" },
    ])
      deny(
        s.authorizeHumanOperation(
          { ...facts, stepUp: { ...facts.stepUp, ...change } },
          operation,
        ),
        "STEP_UP_REQUIRED",
      );
  }
  const admin = {
    ...f.humanFacts(),
    actor: { ...f.human, roles: ["user", "admin"] },
    resourceUserId: f.id(31),
  };
  deny(s.authorizeHumanOperation(admin, "export.read"), "NOT_FOUND");
  deny(
    s.authorizeHumanOperation(
      { ...f.humanFacts(), resourceUserId: undefined },
      "export.read",
    ),
    "NOT_FOUND",
  );
});

test("export chunks whitelist owned data and redact foreign evidence and artifact references", () => {
  const account = { kind: "account", value: { ...currentUser, id: f.id(32) } };
  const ownAgent = { kind: "agent", value: { ...agent, id: f.id(2) } };
  const ownAssessment = {
    kind: "assessment",
    value: {
      ...assessment,
      observerAgentId: f.id(2),
      evidenceRefs: [
        {
          status: "available",
          target: { kind: "submission", id: f.id(998), revision: 1 },
        },
      ],
    },
  };
  const contribution = {
    kind: "contribution",
    value: {
      id: f.id(350),
      createdAt: f.t1,
      kind: "submission",
      attribution: f.attribution,
      text: "My own work",
      artifactIds: [f.artifact.id, f.id(999)],
    },
  };
  const entries = [account, ownAgent, ownAssessment, contribution].map(
    (entry) => ({ userId: f.id(32), entry }),
  );
  entries.push({
    userId: f.id(31),
    entry: { kind: "account", value: { ...currentUser, id: f.id(31) } },
  });
  entries.push({
    userId: f.id(32),
    entry: {
      kind: "assessment",
      value: { ...assessment, observerAgentId: f.id(1) },
    },
  });
  const projected = s.selectOwnedExportEntries(
    f.id(32),
    entries,
    [f.id(2)],
    [f.artifact.id],
    [],
  );
  assert.equal(projected.length, 4);
  assert.deepEqual(
    projected.find((e) => e.kind === "contribution").value.artifactIds,
    [f.artifact.id],
  );
  assert.deepEqual(
    projected.find((e) => e.kind === "assessment").value.evidenceRefs,
    [{ status: "unavailable" }],
  );
  valid(c.accountExportChunkSchema, {
    formatVersion: 1,
    generatedAt: f.t1,
    chunkIndex: 0,
    entries: projected,
    final: true,
  });
  for (const value of [
    { kind: "account", value: { ...currentUser, passwordHash: "secret" } },
    { kind: "project", value: { title: "Another participant's private text" } },
    { kind: "credential", value: { secret: "raw" } },
  ])
    invalid(c.exportEntrySchema, value);
});

test("ready exports are bounded, requester-only and no longer downloadable at exact expiry", () => {
  const ready = {
    ...f.exportJob,
    state: "ready",
    readyAt: f.t1,
    artifactId: f.artifact.id,
    expiresAt: f.end,
  };
  valid(c.exportJobSchema, ready);
  valid(s.accountExportRecordSchema, { ...ready, userId: f.id(32) });
  invalid(c.exportJobSchema, {
    ...ready,
    expiresAt: "2026-10-26T17:01:00.000Z",
  });
  invalid(c.exportJobSchema, { ...f.exportJob, artifactId: f.artifact.id });
  const record = {
    ...f.storedArtifact,
    mime: "application/json",
    purpose: "account_export",
    agentId: undefined,
    parentRefs: [{ kind: "account_export", id: ready.id }],
    expiresAt: f.end,
  };
  const facts = {
    ...f.readFacts,
    actor: f.human,
    readableParents: record.parentRefs,
  };
  allow(s.evaluateArtifactDownload(record, facts));
  deny(
    s.evaluateArtifactDownload(record, { ...facts, actor: f.actor(2) }),
    "NOT_FOUND",
  );
  deny(
    s.evaluateArtifactDownload(record, {
      ...facts,
      actor: { ...f.human, userId: f.id(31), roles: ["user", "admin"] },
    }),
    "NOT_FOUND",
  );
  deny(
    s.evaluateArtifactDownload(record, { ...facts, now: f.end }),
    "NOT_FOUND",
  );
});

test("closure schedules 30-day erasure and soft-delete/pseudonymization cannot claim completion", () => {
  assert.equal(
    c.accountPurgeDueAt("2026-12-15T23:59:59.000Z"),
    "2027-01-14T23:59:59.000Z",
  );
  const closure = operations.find(
    ([name]) => name === "closeAccountRequest",
  )[3];
  invalid(c.accountClosureSchema, { ...closure, accessRevoked: false });
  invalid(c.accountClosureSchema, {
    ...closure,
    purgeDueAt: "2026-12-01T00:00:00.000Z",
  });
  invalid(c.closeAccountRequestSchema, {
    expectedVersion: 1,
    softDeleteOnly: true,
  });
  const erasure = {
    ...f.entity(370),
    userId: f.id(32),
    closedAt: f.t0,
    purgeDueAt: c.accountPurgeDueAt(f.t0),
    completed: [],
    state: "completed",
  };
  invalid(s.accountErasureRecordSchema, erasure);
  const components = [
    "account",
    "collaboration",
    "objects",
    "indexes",
    "jobs",
    "restore_erasure",
  ];
  valid(s.accountErasureRecordSchema, {
    ...erasure,
    completed: components.map((component) => ({
      component,
      method: "delete",
      completedAt: f.t1,
    })),
  });
  invalid(s.accountErasureRecordSchema, {
    ...erasure,
    state: "running",
    completed: [
      { component: "account", method: "pseudonymize", completedAt: f.t1 },
    ],
  });
});

test("calendar retention clamps leap days and rejects indefinite form identifier storage", () => {
  assert.equal(
    c.publicFormExpiresAt("2024-02-29T23:15:00.000Z"),
    "2026-02-28T23:15:00.000Z",
  );
  assert.equal(
    c.publicFormExpiresAt("2026-10-24T17:00:00.000Z"),
    "2028-10-24T17:00:00.000Z",
  );
  const record = {
    id: f.id(380),
    createdAt: f.t0,
    email: f.form.email,
    locale: "en",
    purpose: "updates",
    consentVersion: "updates-v1",
    consent: true,
    expiresAt: c.publicFormExpiresAt(f.t0),
  };
  valid(s.publicFormSubmissionSchema, record);
  invalid(s.publicFormSubmissionSchema, {
    ...record,
    expiresAt: "2030-10-24T17:00:00.000Z",
  });
  invalid(s.publicFormSubmissionSchema, {
    ...record,
    rawHoneypotValue: "retained bot text",
  });
  invalid(c.retentionPolicySchema, { accountPurgeDays: 90 });
});

test("JSON and no-JS URL-encoded updates requests share normalization, consent and unknown-field rules", () => {
  assert.equal(s.evaluateUpdatesInterest(f.form, "updates-v1").persist, true);
  assert.equal(
    s.evaluateUpdatesInterest(
      { ...f.form, website: "bot-filled field" },
      "updates-v1",
    ).persist,
    false,
  );
  deny(s.evaluateUpdatesInterest(f.form, "new-policy-v2"), "VALIDATION_FAILED");
  const encoded = new URLSearchParams({
    ...f.form,
    email: " PERSON+PIAZZA@Example.test ",
    consent: "true",
  }).toString();
  assert.deepEqual(
    c.decodeUpdatesForm(encoded),
    c.parseUpdatesInterest({
      ...f.form,
      email: " PERSON+PIAZZA@Example.test ",
    }),
  );
  for (const body of [
    encoded + "&email=other%40example.test",
    encoded + "&research=true",
    encoded.replace("consent=true", "consent=false"),
    encoded.replace("consent=true", "consent=on"),
    encoded + "&__proto__=x",
    "email=%GG",
    "x".repeat(4097),
  ])
    assert.equal(c.decodeUpdatesForm(body).success, false, body.slice(0, 50));
  for (const input of [
    { ...f.form, consent: false },
    { ...f.form, researchConsent: true },
    { ...f.form, purpose: "research" },
    { ...f.form, consent: "true" },
  ])
    assert.equal(c.parseUpdatesInterest(input).success, false);
  valid(c.updatesInterestSchema, { ...f.form, website: "bot-filled field" }); // Service suppresses without revealing why.
  invalid(c.publicFormReceiptSchema, {
    status: "request_received",
    exists: true,
  });
});

test("localized form HTML accepts no user content, exposes no email, and works without scripts", () => {
  for (const locale of c.localeSchema.options)
    for (const outcome of [
      "received",
      "invalid",
      "rate_limited",
      "unavailable",
    ]) {
      const html = c.renderPublicFormHtml({ locale, outcome });
      assert.ok(html.includes(`<html lang="${locale}">`));
      assert.ok(html.includes("<main><h1>"));
      assert.ok(html.includes(`href="/${locale}/"`));
      assert.doesNotMatch(html, /<script|onload|@example|undefined|https?:/);
    }
  assert.throws(() =>
    c.renderPublicFormHtml({
      locale: "en",
      outcome: "received",
      email: "<script>bad</script>",
    }),
  );
  valid(c.publicFormHtmlHeadersSchema, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "content-security-policy":
      "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  });
  valid(c.consentStateSchema, f.consent); // Declining research does not prevent any service operation.
  allow(s.authorizeHumanOperation(f.humanFacts(), "consent.decide"));
});

test("jobs are bounded and safe receipts/audit metadata cannot persist raw auth material", () => {
  invalid(c.operationalJobMetadataSchema, { ...f.job, attemptCount: 3 });
  valid(s.operationalJobSchema, {
    ...f.job,
    opaquePayloadRef: "synthetic_payload_0001",
    dedupeKey: "synthetic_job_0001",
  });
  invalid(c.operationalJobMetadataSchema, { ...f.job, maxAttempts: 1000 });
  invalid(c.operationalJobMetadataSchema, { ...f.job, attemptCount: 4 });
  invalid(c.operationalJobMetadataSchema, {
    ...f.job,
    state: "succeeded",
    nextAttemptAt: f.end,
  });
  invalid(c.operationalJobMetadataSchema, {
    ...f.job,
    kind: "auth_email_with_otp",
  });
  const saved = {
    ...f.entity(390),
    actor: { kind: "human", userId: f.id(32) },
    operationId: "enrollInstance",
    key: "synthetic_receipt_0001",
    payloadDigest: "a".repeat(64),
    expiresAt: f.future,
    result: {
      state: "applied_secret_issuance",
      nextAction: "rotate_credential",
    },
  };
  valid(s.idempotencyReceiptSchema, saved);
  invalid(s.idempotencyReceiptSchema, {
    ...saved,
    result: { ...saved.result, secret: "raw" },
  });
  invalid(s.idempotencyReceiptSchema, {
    ...saved,
    responseBody: { refreshToken: "raw" },
  });
  invalid(s.auditEventSchema, {
    ...f.activity,
    actor: { kind: "human", userId: f.id(32) },
    metadata: { email: f.form.email },
  });
  invalid(c.activityTargetSchema, { status: "unavailable", target: f.target });
});

test("phase 4 JSON Schema retains strict variants, enums and optionality", () => {
  for (const [name] of operations) {
    const json = z.toJSONSchema(c[`${name}Schema`], { io: "output" });
    assert.ok(Object.keys(json).length > 1);
    assert.equal(JSON.stringify(json).includes("passwordHash"), false);
  }
  for (const name of [
    "artifactDownloadHeadersSchema",
    "accountExportChunkSchema",
    "operationalJobMetadataSchema",
    "publicFormHtmlResultSchema",
  ])
    assert.ok(Object.keys(z.toJSONSchema(c[name])).length > 1);
  assert.equal(z.toJSONSchema(c.wallPostSchema).additionalProperties, false);
  assert.deepEqual(z.toJSONSchema(c.associationSchema).properties.state.enum, [
    "pending",
    "accepted",
    "declined",
    "revoked",
  ]);
  invalid(c.feedDigestSchema, {
    ...f.page(f.wall),
    generatedAt: f.t1,
    subjectiveTrustRanking: [],
  });
});
