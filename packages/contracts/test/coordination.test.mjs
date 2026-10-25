import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { z } from "zod";
import * as c from "../dist/esm/index.js";
import * as internal from "../dist/esm/server-internal.js";
import * as f from "./coordination-fixtures.mjs";

const valid = (schema, value) =>
  assert.deepEqual(
    schema.safeParse(value).success,
    true,
    schema.safeParse(value).error?.message,
  );
const invalid = (schema, value) =>
  assert.equal(schema.safeParse(value).success, false);
const denied = (result, code) =>
  assert.deepEqual(result, { allowed: false, code });
const allowed = (result) => assert.equal(result.allowed, true);
const copy = (value) => structuredClone(value);

const operations = [
  [
    "createProject",
    { title: f.project.title, brief: f.project.brief },
    "projectDetail",
    f.project,
  ],
  [
    "updateProject",
    { expectedVersion: 1, title: "Updated" },
    "projectDetail",
    f.project,
  ],
  ["projectSearch", {}, "projectPage", f.page(f.project)],
  [
    "inviteMember",
    { expectedVersion: 1, participantAgentId: f.id(2), role: "contributor" },
    "membership",
    f.member,
  ],
  [
    "createTask",
    { title: f.task.title, packet: f.packet },
    "taskDetail",
    f.task,
  ],
  [
    "updateTask",
    { expectedVersion: 1, packet: f.packet },
    "taskDetail",
    f.task,
  ],
  ["taskSearch", { state: "active" }, "taskPage", f.page(f.task)],
  [
    "taskTransition",
    { expectedVersion: 1, action: "pause", reason: "Await resources" },
    "taskDetail",
    { ...f.task, state: "paused", resumeState: "active" },
  ],
  [
    "volunteer",
    {
      expectedVersion: 1,
      proposal: f.application.proposal,
      estimatedUsage: f.caps,
    },
    "application",
    f.application,
  ],
  [
    "applicationDecision",
    {
      decision: "approve",
      expectedVersion: 1,
      expectedTaskVersion: 1,
      packetRevision: 1,
      budgetCaps: f.caps,
      offerExpiresAt: f.end,
      reason: "Relevant capability",
    },
    "assignmentOffer",
    {
      outcome: "approved",
      application: {
        ...f.application,
        state: "approved",
        decidedByAgentId: f.id(1),
      },
      assignment: f.offered,
    },
  ],
  [
    "applicationDecision",
    {
      decision: "decline",
      expectedVersion: 1,
      expectedTaskVersion: 1,
      reason: "Capacity full",
    },
    "assignmentOffer",
    {
      outcome: "declined",
      application: { ...f.application, state: "declined" },
    },
  ],
  [
    "acknowledgeAssignment",
    { expectedVersion: 1, packetRevision: 1 },
    "assignment",
    f.working,
  ],
  ["assignmentHeartbeat", { expectedVersion: 2 }, "assignment", f.working],
  [
    "renewAssignment",
    {
      expectedVersion: 2,
      leaseExpiresAt: "2026-10-24T18:00:00.000Z",
      reason: "Owner renewed",
    },
    "assignment",
    { ...f.working, leaseExpiresAt: "2026-10-24T18:00:00.000Z" },
  ],
  [
    "releaseAssignment",
    { expectedVersion: 2, reason: "No capacity" },
    "actionReceipt",
    { receiptId: f.id(150), outcome: "applied", occurredAt: f.t1 },
  ],
  ["submitWork", f.submit, "submission", f.submission],
  ["pageQuery", {}, "submissionPage", f.page(f.submission)],
  [
    "createInquiry",
    { title: f.inquiry.title, question: f.inquiry.question },
    "inquiry",
    f.inquiry,
  ],
  [
    "inquirySearch",
    { projectId: f.project.id },
    "inquiryPage",
    f.page(f.inquiry),
  ],
  [
    "answerInquiry",
    { expectedVersion: 1, text: f.answer.text, evidenceTargets: [] },
    "answer",
    f.answer,
  ],
  [
    "createThreadEntry",
    { expectedVersion: 1, content: f.thread.content, artifactIds: [] },
    "threadEntry",
    f.thread,
  ],
  ["pageQuery", {}, "threadPage", f.page(f.thread)],
  [
    "requestReviews",
    {
      expectedVersion: 1,
      submissionRevision: 1,
      reviewerAgentIds: [f.id(1)],
      expiresAt: f.end,
    },
    "reviewRequestPage",
    f.page({ ...f.review, requestState: "requested", result: undefined }),
  ],
  [
    "reviewInvitationResponse",
    { expectedVersion: 1, response: "accept" },
    "review",
    { ...f.review, requestState: "accepted", result: undefined },
  ],
  [
    "submitReview",
    {
      expectedVersion: 1,
      submissionRevision: 1,
      result: (({ configurationRevisionId, ...rest }) => rest)(f.findings),
    },
    "review",
    f.review,
  ],
  [
    "recordVerification",
    (({ id, createdAt, attribution, ...rest }) => ({
      ...rest,
      inputs: [f.target],
    }))(f.verification),
    "verification",
    f.verification,
  ],
  ["decideAcceptance", f.decide, "acceptanceDecision", f.acceptance],
  [
    "evidenceQuery",
    { subjectAgentId: f.id(2) },
    "evidencePage",
    f.page({ kind: "observation", value: f.observation }),
  ],
  [
    "saveAssessment",
    {
      ...f.assessmentFields,
      precondition: { kind: "absent" },
      evidenceTargets: [],
    },
    "localAssessment",
    f.assessment,
  ],
  [
    "assessmentQuery",
    { domain: "methods" },
    "assessmentPage",
    f.page(f.assessment),
  ],
  [
    "assessmentDelete",
    {
      expectedVersion: 1,
      domain: "methods",
      configurationScope: f.assessmentFields.configurationScope,
    },
    "actionReceipt",
    { receiptId: f.id(151), outcome: "applied", occurredAt: f.t1 },
  ],
  [
    "upsertCapabilityOffer",
    {
      ...f.offerFields,
      precondition: { kind: "version", expectedVersion: 1 },
      evidenceTargets: [],
    },
    "capabilityOffer",
    f.capability,
  ],
  [
    "matchQuery",
    {
      domain: "methods",
      modality: "text",
      format: "markdown",
      packetSizeBytes: 1024,
    },
    "matchPage",
    f.page({ offer: f.capability, reasons: ["domain", "packet_limit"] }),
  ],
];

test("every phase 3 operation has a strict request/result/error envelope fixture", () => {
  for (const [requestName, request, resultName, result] of operations) {
    const requestSchema = c[`${requestName}Schema`],
      resultSchema = c[`${resultName}Schema`];
    assert.ok(requestSchema, requestName);
    assert.ok(resultSchema, resultName);
    valid(requestSchema, request);
    valid(c.apiSuccessSchema(resultSchema), {
      data: result,
      meta: { correlationId: f.id(200) },
    });
    invalid(requestSchema, {
      ...request,
      runArbitraryCommand: "untrusted task text",
    });
    for (const code of [
      "NOT_FOUND",
      "VERSION_CONFLICT",
      "ACTION_FORBIDDEN",
      "BUDGET_EXHAUSTED",
      "INVALID_TRANSITION",
    ]) {
      valid(c.apiErrorResponseSchema, {
        error: { code, messageKey: "errors.action_failed" },
        meta: { correlationId: f.id(200) },
      });
    }
  }
});

test("D09-D24 projections are bounded and reject controller/persistence/authority leakage", () => {
  const entities = [
    [c.projectSchema, f.project],
    [c.membershipSchema, f.member],
    [c.taskSchema, f.task],
    [c.applicationSchema, f.application],
    [c.assignmentSchema, f.working],
    [c.submissionSchema, f.submission],
    [c.reviewSchema, f.review],
    [c.verificationSchema, f.verification],
    [c.acceptanceDecisionSchema, f.acceptance],
    [c.inquirySchema, f.inquiry],
    [c.answerSchema, f.answer],
    [c.threadEntrySchema, f.thread],
    [c.artifactMetadataSchema, f.artifact],
    [c.capabilityOfferSchema, f.capability],
    [c.observationSchema, f.observation],
    [c.localAssessmentSchema, f.assessment],
  ];
  for (const [schema, entity] of entities) {
    valid(schema, entity);
    for (const field of [
      "userId",
      "passwordHash",
      "rawToken",
      "opaqueStorageRef",
      "universalTrustScore",
    ])
      invalid(schema, { ...entity, [field]: "private" });
  }
  for (const field of [
    "memberships",
    "applications",
    "assignments",
    "reviews",
    "localAssessments",
    "grants",
  ]) {
    invalid(c.taskDetailSchema, { ...f.task, [field]: [] });
    invalid(c.projectDetailSchema, { ...f.project, [field]: [] });
  }
  valid(internal.projectRecordSchema, { ...f.project, userId: f.id(31) });
  valid(internal.taskRecordSchema, { ...f.task, userId: f.id(31) });
  valid(internal.inquiryRecordSchema, { ...f.inquiry, userId: f.id(31) });
  valid(internal.artifactRecordSchema, {
    ...f.artifact,
    userId: f.id(31),
    opaqueStorageRef: "opaque-test-object",
    hash: "a".repeat(64),
    agentId: f.id(1),
    parentRefs: [{ kind: "task", id: f.task.id }],
    purpose: "attachment",
    avatarModeration: "not_required",
    scanRevision: 1,
  });
  for (const name of [
    "projectRecordSchema",
    "taskRecordSchema",
    "inquiryRecordSchema",
    "artifactRecordSchema",
    "authorizationContextSchema",
    "authorizeScopedAction",
  ])
    assert.equal(name in c, false, name);
});

test("source references redact identifiers and private judgments never enter evidence feeds", () => {
  valid(c.evidenceReferenceSchema, { status: "unavailable" });
  invalid(c.evidenceReferenceSchema, {
    status: "unavailable",
    target: f.target,
  });
  invalid(c.evidenceReferenceSchema, { status: "unavailable", id: f.id(999) });
  invalid(c.evidenceItemSchema, { kind: "assessment", value: f.assessment });
  invalid(c.evidenceItemSchema, { kind: "observation", value: f.assessment });
  invalid(c.agentProfileSchema, { id: f.id(2), assessments: [f.assessment] });
  invalid(c.saveAssessmentSchema, {
    ...f.assessmentFields,
    precondition: { kind: "version", expectedVersion: 0 },
    evidenceTargets: [],
  });
  invalid(c.assessmentJudgmentsSchema, [
    f.assessment.judgments[0],
    f.assessment.judgments[0],
  ]);
  invalid(c.localAssessmentSchema, { ...f.assessment, visibility: "public" });
});

test("immutable content cannot acquire mutable state or caller-supplied attribution", () => {
  for (const [schema, value] of [
    [c.submissionSchema, f.submission],
    [c.answerSchema, f.answer],
    [c.threadEntrySchema, f.thread],
    [c.verificationSchema, f.verification],
    [c.acceptanceDecisionSchema, f.acceptance],
  ]) {
    for (const field of [
      "updatedAt",
      "deletedAt",
      "accepted",
      "verified",
      "state",
    ])
      invalid(schema, { ...value, [field]: f.t1 });
  }
  for (const field of [
    "attribution",
    "revision",
    "disposition",
    "authorAgentId",
  ])
    invalid(c.submitWorkSchema, {
      ...f.submit,
      [field]: field === "attribution" ? f.attribution : 1,
    });
  invalid(c.workPacketSchema, { ...f.packet, delegation: "unrestricted" });
  invalid(c.taskSchema, { ...f.task, state: "paused" });
  invalid(c.taskSchema, { ...f.task, resumeState: "open" });
  invalid(c.createTaskSchema, {
    title: "No parent",
    packet: f.packet,
    visibility: "project",
  });
  invalid(c.createInquirySchema, {
    title: "No parent",
    question: "Question",
    visibility: "invited",
  });
  invalid(c.reviewPolicySchema, { requiredCount: 11 });
  invalid(c.leasePolicySchema, {
    durationSeconds: 120,
    maxDurationSeconds: 60,
  });
});

test("task, application, assignment and review tables enumerate legal edges with terminal denial", () => {
  for (const [from, event, to] of c.TASK_TRANSITIONS) {
    const task = {
      ...f.task,
      state: from,
      ...(from === "paused"
        ? { resumeState: event === "resume" ? to : "active" }
        : {}),
    };
    assert.equal(
      c.evaluateTaskTransition(task, event, 1, {
        decision: f.acceptance,
        submission: f.submission,
      }).nextState,
      to,
    );
  }
  for (const [from, event, to] of c.APPLICATION_TRANSITIONS)
    assert.equal(
      c.evaluateApplicationTransition(
        { ...f.application, state: from },
        event,
        1,
      ).nextState,
      to,
    );
  for (const [from, event, to] of c.ASSIGNMENT_TRANSITIONS) {
    const assignment =
      from === "offered" ? f.offered : { ...f.working, state: from };
    const now = event === "expire" ? f.end : f.t1;
    assert.equal(
      c.evaluateAssignmentTransition(
        assignment,
        event,
        assignment.version,
        now,
        {
          leaseExpiresAt: "2026-10-24T18:00:00.000Z",
          maxDurationSeconds: 7200,
        },
      ).nextState,
      to,
    );
  }
  for (const [from, event, to] of c.REVIEW_TRANSITIONS)
    assert.equal(
      c.evaluateReviewTransition(
        { ...f.review, requestState: from, result: undefined },
        event,
        1,
        event === "expire" ? f.end : f.t1,
      ).nextState,
      to,
    );
  denied(
    c.evaluateTaskTransition({ ...f.task, state: "completed" }, "start", 1),
    "INVALID_TRANSITION",
  );
  denied(c.evaluateTaskTransition(f.task, "pause", 2), "VERSION_CONFLICT");
  denied(c.evaluateTaskTransition(f.task, "complete", 1), "INVALID_TRANSITION");
  denied(
    c.evaluateTaskTransition(f.task, "complete", 1, {
      decision: { ...f.acceptance, submission: { ...f.ref, revision: 2 } },
      submission: f.submission,
    }),
    "INVALID_TRANSITION",
  );
  denied(
    c.evaluateApplicationTransition(
      { ...f.application, state: "declined" },
      "approve",
      1,
    ),
    "INVALID_TRANSITION",
  );
  denied(
    c.evaluateApplicationTransition(f.application, "approve", 2),
    "VERSION_CONFLICT",
  );
  denied(
    c.evaluateAssignmentTransition(
      { ...f.working, state: "expired" },
      "renew",
      2,
      f.t1,
    ),
    "INVALID_TRANSITION",
  );
  denied(
    c.evaluateReviewTransition(f.review, "submit", 1, f.t1),
    "INVALID_TRANSITION",
  );
  denied(
    c.evaluateReviewTransition(
      { ...f.review, requestState: "accepted" },
      "submit",
      1,
      f.end,
    ),
    "INVALID_TRANSITION",
  );
  denied(
    c.evaluateReviewTransition(f.review, "submit", 2, f.t1),
    "VERSION_CONFLICT",
  );
});

test("approval and acknowledgment pin packet/version and bound allocation/offer/lease", () => {
  const approval = operations.find(
    ([name, value]) =>
      name === "applicationDecision" && value.decision === "approve",
  )[1];
  allowed(c.evaluateApplicationDecision(f.task, f.application, approval, f.t1));
  denied(
    c.evaluateApplicationDecision(
      f.task,
      f.application,
      { ...approval, expectedTaskVersion: 2 },
      f.t1,
    ),
    "VERSION_CONFLICT",
  );
  denied(
    c.evaluateApplicationDecision(
      f.task,
      f.application,
      { ...approval, packetRevision: 2 },
      f.t1,
    ),
    "VERSION_CONFLICT",
  );
  denied(
    c.evaluateApplicationDecision(
      f.task,
      f.application,
      { ...approval, offerExpiresAt: f.t1 },
      f.t1,
    ),
    "ASSIGNMENT_EXPIRED",
  );
  denied(
    c.evaluateApplicationDecision(
      f.task,
      f.application,
      { ...approval, budgetCaps: [{ unit: "requests", hardLimit: 101 }] },
      f.t1,
    ),
    "BUDGET_EXHAUSTED",
  );
  const acknowledgment = { expectedVersion: 1, packetRevision: 1 };
  assert.deepEqual(
    c.evaluateAcknowledgment(f.task, f.offered, acknowledgment, f.t0),
    { allowed: true, leaseExpiresAt: f.end },
  );
  assert.equal(
    c.evaluateAcknowledgment(
      { ...f.task, packet: { ...f.packet, deadline: f.t1 } },
      f.offered,
      acknowledgment,
      f.t0,
    ).leaseExpiresAt,
    f.t1,
  );
  denied(
    c.evaluateAcknowledgment(
      f.task,
      f.offered,
      { ...acknowledgment, packetRevision: 2 },
      f.t0,
    ),
    "VERSION_CONFLICT",
  );
  denied(
    c.evaluateAcknowledgment(f.task, f.offered, acknowledgment, f.end),
    "ASSIGNMENT_EXPIRED",
  );
  denied(
    c.evaluateAcknowledgment(
      { ...f.task, state: "paused", resumeState: "active" },
      f.offered,
      acknowledgment,
      f.t0,
    ),
    "INVALID_TRANSITION",
  );
  invalid(c.assignmentOfferSchema, {
    ...operations[9][3],
    assignment: { ...f.offered, participantAgentId: f.id(1) },
  });
  invalid(c.assignmentSchema, { ...f.offered, leaseExpiresAt: f.end });
  invalid(c.assignmentSchema, {
    ...f.working,
    leaseExpiresAt: "2026-10-24T19:00:00.001Z",
  });
});

test("heartbeats cannot renew; only unexpired leases can extend within original ceiling", () => {
  invalid(c.assignmentHeartbeatSchema, {
    expectedVersion: 2,
    leaseExpiresAt: f.future,
  });
  denied(
    c.evaluateAssignmentTransition(f.working, "renew", 1, f.t1),
    "VERSION_CONFLICT",
  );
  denied(
    c.evaluateAssignmentTransition(f.working, "renew", 2, f.end, {
      leaseExpiresAt: f.future,
      maxDurationSeconds: 7200,
    }),
    "ASSIGNMENT_EXPIRED",
  );
  for (const renewal of [
    undefined,
    { leaseExpiresAt: f.end, maxDurationSeconds: 7200 },
    { leaseExpiresAt: "2026-10-24T19:00:00.001Z", maxDurationSeconds: 7200 },
    { leaseExpiresAt: f.future, maxDurationSeconds: 7200, deadline: f.end },
  ])
    denied(
      c.evaluateAssignmentTransition(f.working, "renew", 2, f.t1, renewal),
      "INVALID_TRANSITION",
    );
});

test("late/partial evidence is retained but cannot become current work without a fresh acknowledgment", () => {
  assert.deepEqual(
    c.evaluateSubmission(f.task, f.working, f.submit, f.t1, []),
    { allowed: true, disposition: "current_work" },
  );
  assert.deepEqual(
    c.evaluateSubmission(f.task, f.working, f.submit, f.end, []),
    { allowed: true, disposition: "late_evidence" },
  );
  assert.deepEqual(
    c.evaluateSubmission(
      { ...f.task, packet: { ...f.packet, deadline: f.t1 } },
      f.working,
      f.submit,
      f.t1,
      [],
    ),
    { allowed: true, disposition: "late_evidence" },
  );
  const partial = {
    ...f.submission,
    completeness: "partial",
    disposition: "partial_evidence",
  };
  assert.deepEqual(
    c.evaluateSubmission(
      f.task,
      f.working,
      { ...f.submit, completeness: "partial" },
      f.t1,
      [],
    ),
    { allowed: true, disposition: "partial_evidence" },
  );
  denied(
    c.evaluateSubmission(f.task, f.working, f.submit, f.t1, [partial]),
    "INVALID_TRANSITION",
  );
  denied(
    c.evaluateAcceptance(f.task, partial, [], f.decide),
    "INVALID_TRANSITION",
  );
  denied(
    c.evaluateAcceptance(
      f.task,
      { ...f.submission, disposition: "late_evidence" },
      [],
      f.decide,
    ),
    "INVALID_TRANSITION",
  );
  const request = { ...f.submit, basedOn: f.ref };
  denied(
    c.evaluateSubmission(f.task, f.working, request, f.t1, [], {
      basedOn: partial,
    }),
    "INVALID_TRANSITION",
  );
  const fresh = {
    ...f.working,
    id: f.id(180),
    createdAt: "2026-10-24T17:02:00.000Z",
    acknowledgedAt: "2026-10-24T17:02:00.000Z",
    leaseExpiresAt: "2026-10-24T17:32:00.000Z",
  };
  allowed(
    c.evaluateSubmission(
      f.task,
      fresh,
      request,
      "2026-10-24T17:03:00.000Z",
      [partial],
      { basedOn: partial },
    ),
  );
  // Omitting a provenance link cannot reuse an offer approved before the partial evidence.
  denied(
    c.evaluateSubmission(
      f.task,
      { ...fresh, createdAt: f.t0 },
      f.submit,
      "2026-10-24T17:03:00.000Z",
      [partial],
    ),
    "INVALID_TRANSITION",
  );
  denied(
    c.evaluateSubmission(f.task, fresh, request, f.t1, [], {
      basedOn: { ...partial, taskId: f.id(999) },
    }),
    "INVALID_TRANSITION",
  );
  denied(
    c.evaluateSubmission(
      f.task,
      fresh,
      { ...f.submit, supersedes: f.ref },
      f.t1,
      [],
    ),
    "INVALID_TRANSITION",
  );
  denied(
    c.evaluateSubmission(
      f.task,
      fresh,
      { ...f.submit, supersedes: f.ref },
      f.t1,
      [],
      {
        supersedes: {
          ...partial,
          attribution: { ...f.attribution, agentId: f.id(1) },
        },
      },
    ),
    "INVALID_TRANSITION",
  );
  denied(
    c.evaluateSubmission(
      f.task,
      f.offered,
      { ...f.submit, expectedVersion: 1 },
      f.t1,
      [],
    ),
    "INVALID_TRANSITION",
  );
  denied(
    c.evaluateSubmission(
      { ...f.task, packetRevision: 2 },
      f.working,
      f.submit,
      f.t1,
      [],
    ),
    "VERSION_CONFLICT",
  );
  invalid(c.submissionSchema, { ...partial, disposition: "current_work" });
});

test("review counts use completed distinct non-author identities on exact revisions, independently of opinion", () => {
  const task = {
    ...f.task,
    packet: { ...f.packet, reviewPolicy: { requiredCount: 2 } },
  };
  allowed(c.evaluateAcceptance(f.task, f.submission, [], f.decide)); // default zero
  denied(
    c.evaluateAcceptance(task, f.submission, [f.review, f.review], f.decide),
    "REVIEW_REQUIRED",
  );
  for (const other of [
    { ...f.review, reviewerAgentId: f.id(2) },
    { ...f.review, submission: { ...f.ref, revision: 2 } },
    { ...f.review, requestState: "accepted", result: undefined },
  ])
    denied(
      c.evaluateAcceptance(task, f.submission, [f.review, other], f.decide),
      "REVIEW_REQUIRED",
    );
  allowed(
    c.evaluateAcceptance(
      task,
      f.submission,
      [f.review, { ...f.review, id: f.id(190), reviewerAgentId: f.id(3) }],
      f.decide,
    ),
  ); // rejecting reviews still count as reviews
  denied(
    c.evaluateAcceptance(f.task, f.submission, [], {
      ...f.decide,
      expectedVersion: 2,
    }),
    "VERSION_CONFLICT",
  );
  denied(
    c.evaluateAcceptance(f.task, f.submission, [], {
      ...f.decide,
      submission: { ...f.ref, revision: 2 },
    }),
    "VERSION_CONFLICT",
  );
  denied(
    c.evaluateAcceptance(f.task, f.submission, [], f.decide, f.acceptance),
    "VERSION_CONFLICT",
  );
  allowed(
    c.evaluateAcceptance(
      f.task,
      f.submission,
      [],
      { ...f.decide, supersedesId: f.acceptance.id },
      f.acceptance,
    ),
  );
});

test("acceptance and verification coexist as independent evidence, including accepted/fail and rejected/pass", () => {
  valid(c.acceptanceDecisionSchema, f.acceptance);
  valid(c.verificationSchema, f.verification);
  allowed(c.evaluateAcceptance(f.task, f.submission, [], f.decide));
  allowed(
    c.evaluateTaskTransition(f.task, "complete", 1, {
      decision: f.acceptance,
      submission: f.submission,
    }),
  );
  valid(c.acceptanceDecisionSchema, { ...f.acceptance, decision: "reject" });
  valid(c.verificationSchema, { ...f.verification, outcome: "pass" });
  denied(
    c.evaluateTaskTransition(f.task, "complete", 1, {
      decision: { ...f.acceptance, decision: "reject" },
      submission: f.submission,
    }),
    "INVALID_TRANSITION",
  );
});

test("two operators complete volunteer/approval/acknowledgment/submission/review/acceptance policy fixtures", () => {
  const contributor = f.context();
  const owner = copy(contributor);
  owner.actor = f.actor(1);
  owner.principal = f.principal(1);
  owner.grants[0].agentId = f.id(1);
  owner.grants[0].actions = ["task.assign", "task.decide", "review.request"];
  const cost = [{ unit: "requests", hardLimit: 1 }];
  allowed(
    internal.authorizeScopedAction(owner, {
      action: "task.assign",
      expectedVersion: 1,
      budget: cost,
    }),
  );
  denied(
    internal.authorizeScopedAction(contributor, {
      action: "task.assign",
      expectedVersion: 1,
      budget: cost,
    }),
    "ACTION_FORBIDDEN",
  );
  contributor.assignment = f.offered;
  contributor.grants[0].actions = ["assignment.acknowledge"];
  allowed(
    internal.authorizeScopedAction(contributor, {
      action: "assignment.acknowledge",
      expectedVersion: 1,
      budget: cost,
    }),
  );
  allowed(
    c.evaluateAcknowledgment(
      f.task,
      f.offered,
      { expectedVersion: 1, packetRevision: 1 },
      f.t1,
    ),
  );
  allowed(internal.authorizeScopedAction(f.context(), f.action));
  allowed(c.evaluateSubmission(f.task, f.working, f.submit, f.t1, []));
  owner.review = f.review;
  owner.submission = f.submission;
  owner.grants[0].actions.push("review.submit");
  allowed(
    internal.authorizeScopedAction(owner, {
      action: "review.submit",
      expectedVersion: 1,
      budget: cost,
    }),
  );
  allowed(
    internal.authorizeScopedAction(owner, {
      action: "task.decide",
      expectedVersion: 1,
      budget: cost,
    }),
  );
  allowed(c.evaluateAcceptance(f.task, f.submission, [f.review], f.decide));
});

test("private parent membership is checked before child reads, including anonymous and unrelated operators", () => {
  const ctx = f.context();
  ctx.resource = { ...ctx.resource, visibility: "public" };
  const read = { action: "task.read", budget: f.action.budget };
  ctx.actor = { kind: "anonymous" };
  ctx.principal = undefined;
  denied(internal.authorizeScopedAction(ctx, read), "NOT_FOUND");
  ctx.ancestors = [{ ...f.projectResource, visibility: "public" }];
  allowed(internal.authorizeScopedAction(ctx, read));
  ctx.ancestors = [];
  denied(internal.authorizeScopedAction(ctx, read), "NOT_FOUND");
  const member = f.context();
  member.grants[0].actions = ["task.read"];
  allowed(internal.authorizeScopedAction(member, read));
  for (const membership of [
    [],
    [{ ...f.member, revokedAt: f.t0 }],
    [{ ...f.member, expiresAt: f.t1 }],
  ])
    denied(
      internal.authorizeScopedAction(
        { ...member, memberships: membership },
        read,
      ),
      "NOT_FOUND",
    );
  denied(
    internal.authorizeScopedAction(
      {
        ...member,
        ancestors: [{ ...f.projectResource, visibility: "operator_private" }],
      },
      read,
    ),
    "NOT_FOUND",
  );
  denied(
    internal.authorizeScopedAction(
      { ...member, actor: f.actor(3), principal: f.principal(3) },
      read,
    ),
    "NOT_FOUND",
  );
});

test("operators need selected-agent ownership and grants; admin status confers no impersonation", () => {
  const ctx = f.context();
  ctx.actor = {
    kind: "human",
    userId: f.id(32),
    roles: ["user"],
    sessionId: f.id(50),
  };
  ctx.sessionActive = true;
  allowed(internal.authorizeScopedAction(ctx, f.action));
  denied(
    internal.authorizeScopedAction({ ...ctx, sessionActive: false }, f.action),
    "UNAUTHENTICATED",
  );
  denied(
    internal.authorizeScopedAction({ ...ctx, grants: [] }, f.action),
    "ACTION_FORBIDDEN",
  );
  const admin = {
    ...ctx,
    actor: { ...ctx.actor, userId: f.id(99), roles: ["user", "admin"] },
  };
  denied(internal.authorizeScopedAction(admin, f.action), "ACTION_FORBIDDEN");
  // Owning a different agent does not confer workspace-owner decisions.
  ctx.grants[0].actions = ["task.decide"];
  denied(
    internal.authorizeScopedAction(ctx, {
      ...f.action,
      action: "task.decide",
      expectedVersion: 1,
    }),
    "ACTION_FORBIDDEN",
  );
});

test("private assessments are scoped to the observer even when the subject/profile is public", () => {
  const ctx = f.context();
  ctx.resource = {
    kind: "agent",
    id: f.id(2),
    ownerAgentId: f.id(2),
    controllerUserId: f.id(32),
    visibility: "public",
    version: 1,
  };
  ctx.ancestors = [];
  ctx.grants[0].actions = ["assessment.write"];
  ctx.grants[0].resourceScope = { kind: "agent", id: f.id(2) };
  allowed(
    internal.authorizeScopedAction(ctx, {
      ...f.action,
      action: "assessment.write",
      expectedVersion: 1,
    }),
  );
  ctx.resource = {
    ...ctx.resource,
    id: f.id(1),
    ownerAgentId: f.id(1),
    controllerUserId: f.id(31),
  };
  denied(
    internal.authorizeScopedAction(ctx, {
      ...f.action,
      action: "assessment.write",
      expectedVersion: 1,
    }),
    "ACTION_FORBIDDEN",
  );
});

test("inquiry answers require posting access but no assignment, while readers cannot post privately", () => {
  const ctx = f.context();
  delete ctx.assignment;
  ctx.resource = {
    ...f.taskResource,
    kind: "inquiry",
    id: f.inquiry.id,
    taskId: f.task.id,
  };
  ctx.ancestors = [f.taskResource, f.projectResource];
  ctx.grants[0].actions = ["inquiry.answer"];
  const request = { ...f.action, action: "inquiry.answer", expectedVersion: 1 };
  allowed(internal.authorizeScopedAction(ctx, request));
  denied(
    internal.authorizeScopedAction(
      { ...ctx, memberships: [{ ...f.member, role: "reader" }] },
      request,
    ),
    "ACTION_FORBIDDEN",
  );
  denied(
    internal.authorizeScopedAction(
      { ...ctx, resource: f.taskResource },
      request,
    ),
    "ACTION_FORBIDDEN",
  );
  invalid(c.answerInquirySchema, {
    expectedVersion: 1,
    text: "Answer",
    evidenceTargets: [],
    assignmentId: f.working.id,
  });
});

test("live runtime identity/configuration/credential/scope state is checked on every action", () => {
  for (const mutation of [
    (ctx) => {
      ctx.principal.agentState = "paused";
    },
    (ctx) => {
      ctx.principal.controllerState = "closed";
    },
    (ctx) => {
      ctx.principal.instance.state = "revoked";
    },
    (ctx) => {
      ctx.principal.instance.credentialRevoked = true;
    },
    (ctx) => {
      ctx.principal.instance.credentialExpiresAt = f.t1;
    },
    (ctx) => {
      ctx.principal.configurationRevisionId = f.id(999);
    },
    (ctx) => {
      ctx.principal.instance.configurationRevisionId = f.id(999);
    },
    (ctx) => {
      ctx.actor.scopeVersion = 2;
    },
    (ctx) => {
      ctx.actor.instanceId = f.id(999);
    },
    (ctx) => {
      ctx.actor.credentialId = f.id(999);
    },
  ]) {
    const ctx = copy(f.context());
    mutation(ctx);
    denied(internal.authorizeScopedAction(ctx, f.action), "CREDENTIAL_REVOKED");
  }
  denied(
    internal.authorizeScopedAction(f.context(), {
      ...f.action,
      expectedVersion: 1,
    }),
    "VERSION_CONFLICT",
  );
});

test("one grant must cover action, resource, instance and the entire budget", () => {
  const split = f.context();
  const uploadBalance = {
    unit: "upload_bytes",
    hardLimit: 100,
    reserved: 0,
    consumed: 0,
  };
  split.operatorBalances.push(uploadBalance);
  split.grants.push({
    ...f.grant,
    id: f.id(801),
    budgetCaps: [{ unit: "upload_bytes", hardLimit: 100 }],
  });
  split.grantBalances.push({ grantId: f.id(801), balances: [uploadBalance] });
  denied(
    internal.authorizeScopedAction(split, {
      ...f.action,
      budget: [...f.action.budget, { unit: "upload_bytes", hardLimit: 1 }],
    }),
    "BUDGET_EXHAUSTED",
  );
  const ctx = copy(f.context());
  ctx.grants[0].resourceScope = { kind: "task", id: f.id(999) };
  ctx.grants.push({ ...f.grant, id: f.id(999), actions: ["task.read"] });
  denied(internal.authorizeScopedAction(ctx, f.action), "ACTION_FORBIDDEN");
  const bound = copy(f.context());
  bound.grants[0].instanceId = f.id(999);
  denied(internal.authorizeScopedAction(bound, f.action), "ACTION_FORBIDDEN");
  for (const changed of [
    { revokedAt: f.t0 },
    { expiresAt: f.t1 },
    { agentId: f.id(1) },
  ])
    denied(
      internal.authorizeScopedAction(
        { ...f.context(), grants: [{ ...f.grant, ...changed }] },
        f.action,
      ),
      "ACTION_FORBIDDEN",
    );
  const exhausted = copy(f.context());
  exhausted.operatorBalances[0].reserved = 90;
  denied(
    internal.authorizeScopedAction(exhausted, f.action),
    "BUDGET_EXHAUSTED",
  );
  const grantExhausted = copy(f.context());
  grantExhausted.grantBalances[0].balances[0].reserved = 90;
  denied(
    internal.authorizeScopedAction(grantExhausted, f.action),
    "BUDGET_EXHAUSTED",
  );
  denied(
    internal.authorizeScopedAction(f.context(), {
      ...f.action,
      budget: [{ unit: "upload_bytes", hardLimit: 1 }],
    }),
    "BUDGET_EXHAUSTED",
  );
  // All instances consume the same supplied controller balance, not a fresh per-instance allowance.
  const other = copy(exhausted);
  other.actor.instanceId = f.id(800);
  other.principal.instance.id = f.id(800);
  denied(internal.authorizeScopedAction(other, f.action), "BUDGET_EXHAUSTED");
  invalid(internal.authorizationContextSchema, {
    ...f.context(),
    operatorBalances: [f.balance, f.balance],
  });
});

test("exact-action approvals cannot be reused after digest/revision/authority/budget/expiry changes", () => {
  const ctx = copy(f.context());
  ctx.grants[0].approvalRule = "per_action";
  const request = { ...f.action, payloadDigest: "a".repeat(64) };
  denied(internal.authorizeScopedAction(ctx, request), "STEP_UP_REQUIRED");
  ctx.actionApproval = {
    ...f.entity(400),
    userId: f.id(32),
    agentId: f.id(2),
    requestedAction: "assignment.submit",
    target: { resourceScope: { kind: "task", id: f.task.id }, revision: 2 },
    payloadDigest: request.payloadDigest,
    budget: f.action.budget,
    expiresAt: f.future,
    decision: "approved",
  };
  allowed(internal.authorizeScopedAction(ctx, request));
  for (const changed of [
    { userId: f.id(31) },
    { agentId: f.id(1) },
    { requestedAction: "task.decide" },
    { decision: "pending" },
    { payloadDigest: "b".repeat(64) },
    { consumedAt: f.t0 },
    { expiresAt: f.t1 },
    { budget: [] },
    { target: { resourceScope: { kind: "task", id: f.id(999) }, revision: 2 } },
    { target: { resourceScope: { kind: "task", id: f.task.id }, revision: 1 } },
  ])
    denied(
      internal.authorizeScopedAction(
        { ...ctx, actionApproval: { ...ctx.actionApproval, ...changed } },
        request,
      ),
      "STEP_UP_REQUIRED",
    );
});

test("budget reservations are bounded and external compute usage remains explicitly reported", () => {
  assert.equal(c.canReserveBudget(f.balance, 80), true);
  for (const quantity of [-1, 81, 1.5, Number.MAX_SAFE_INTEGER + 1])
    assert.equal(c.canReserveBudget(f.balance, quantity), false);
  invalid(c.budgetBalanceSchema, { ...f.balance, consumed: 91 });
  valid(c.budgetReservationSchema, {
    ...f.entity(500),
    assignmentId: f.working.id,
    unit: "requests",
    quantity: 10,
    state: "settled",
    settledQuantity: 8,
  });
  invalid(c.budgetReservationSchema, {
    ...f.entity(500),
    assignmentId: f.working.id,
    unit: "requests",
    quantity: 10,
    state: "settled",
    settledQuantity: 11,
  });
  valid(c.usageClaimSchema, {
    eventKey: "reported_usage_0001",
    unit: "reported_tokens",
    quantity: 1000,
    provenance: "runtime_reported",
  });
  invalid(c.usageClaimSchema, {
    eventKey: "reported_usage_0001",
    unit: "reported_tokens",
    quantity: 1000,
    provenance: "server_measured",
  });
  invalid(c.usageClaimSchema, {
    eventKey: "reported_usage_0001",
    unit: "requests",
    quantity: 1,
    provenance: "runtime_reported",
  });
});

test("discovery is a self-declared configuration-scoped offer, never automatic assignment or trust rank", () => {
  valid(c.createTaskSchema, {
    title: f.task.title,
    packet: f.packet,
    sourceInquiryId: f.inquiry.id,
  });
  valid(c.capabilityOfferSchema, {
    ...f.capability,
    visibility: "project",
    projectId: f.project.id,
  });
  invalid(c.capabilityOfferSchema, { ...f.capability, visibility: "project" });
  invalid(c.capabilityOfferSchema, { ...f.capability, claimBasis: "verified" });
  invalid(c.capabilityOfferSchema, {
    ...f.capability,
    availability: { startsAt: f.t1, endsAt: f.t0 },
  });
  invalid(c.matchSchema, {
    offer: f.capability,
    reasons: ["domain"],
    autoAssign: true,
  });
  invalid(c.matchSchema, {
    offer: f.capability,
    reasons: ["domain"],
    trustScore: 0.9,
  });
  invalid(c.upsertCapabilityOfferSchema, {
    ...f.offerFields,
    precondition: { kind: "absent" },
    evidenceTargets: [],
    agentId: f.id(1),
  });
});

test("coordination schemas retain JSON metadata and import no framework/ORM", () => {
  for (const [name] of operations) {
    const json = z.toJSONSchema(c[`${name}Schema`], { io: "output" });
    assert.ok(Object.keys(json).length > 1, name);
    assert.equal(JSON.stringify(json).includes("passwordHash"), false);
  }
  const json = z.toJSONSchema(c.submissionSchema);
  assert.equal(json.additionalProperties, false);
  assert.ok(json.required.includes("revision"));
  assert.equal(json.required.includes("supersedes"), false);
  assert.deepEqual(json.properties.disposition.enum, [
    "current_work",
    "late_evidence",
    "partial_evidence",
  ]);
  for (const file of readdirSync(new URL("../src/", import.meta.url)).filter(
    (f) => f.endsWith(".ts"),
  )) {
    const source = readFileSync(
      new URL(`../src/${file}`, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(
      source,
      /from\s+["'](?:@nestjs|typeorm|@angular|express)/,
    );
  }
});

test("applicants alone withdraw and contributors cannot renew their own leases", () => {
  const ctx = f.context();
  ctx.application = f.application;
  ctx.grants[0].actions = ["application.withdraw", "assignment.renew"];
  allowed(
    internal.authorizeScopedAction(ctx, {
      ...f.action,
      action: "application.withdraw",
      expectedVersion: 1,
    }),
  );
  denied(
    internal.authorizeScopedAction(
      { ...ctx, application: { ...f.application, applicantAgentId: f.id(1) } },
      { ...f.action, action: "application.withdraw", expectedVersion: 1 },
    ),
    "ACTION_FORBIDDEN",
  );
  denied(
    internal.authorizeScopedAction(ctx, {
      ...f.action,
      action: "assignment.renew",
    }),
    "ACTION_FORBIDDEN",
  );
  ctx.actor = f.actor(1);
  ctx.principal = f.principal(1);
  ctx.grants[0].agentId = f.id(1);
  allowed(
    internal.authorizeScopedAction(ctx, {
      ...f.action,
      action: "assignment.renew",
    }),
  );
});

test("inquiry parent chains must agree and inherited project access covers task-only inquiries", () => {
  const ctx = f.context();
  ctx.grants[0].actions = ["inquiry.answer"];
  ctx.resource = {
    ...f.taskResource,
    kind: "inquiry",
    id: f.inquiry.id,
    taskId: f.task.id,
  };
  ctx.ancestors = [f.taskResource, f.projectResource];
  const request = { ...f.action, action: "inquiry.answer", expectedVersion: 1 };
  delete ctx.resource.projectId;
  allowed(internal.authorizeScopedAction(ctx, request));
  ctx.resource.projectId = f.id(999);
  ctx.ancestors.push({
    ...f.projectResource,
    id: f.id(999),
    visibility: "public",
  });
  denied(internal.authorizeScopedAction(ctx, request), "NOT_FOUND");
});

test("published review projection omits private invitation metadata", () => {
  const published = {
    id: f.review.id,
    createdAt: f.t1,
    submission: f.ref,
    reviewerAgentId: f.id(1),
    result: f.findings,
  };
  valid(c.publishedReviewSchema, published);
  invalid(c.publishedReviewSchema, {
    ...published,
    expiresAt: f.review.expiresAt,
  });
  invalid(c.publishedReviewSchema, { ...published, requestState: "submitted" });
});
