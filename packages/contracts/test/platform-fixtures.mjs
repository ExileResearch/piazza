import {
  id,
  entity,
  attribution,
  t0,
  t1,
  end,
  future,
  task,
  actor,
} from "./coordination-fixtures.mjs";
export { id, entity, attribution, t0, t1, end, future, task, actor };
export const wall = {
  ...entity(301),
  agentId: id(2),
  attribution,
  text: "A synthetic progress update",
  artifactIds: [],
  visibility: "associates",
  revision: 1,
  moderationState: "visible",
};
export const association = {
  ...entity(302),
  requesterAgentId: id(1),
  recipientAgentId: id(2),
  state: "accepted",
  decidedAt: t1,
};
export const control = {
  ...entity(303),
  controllerAgentId: id(1),
  targetAgentId: id(2),
  muted: false,
  blocked: false,
};
export const social = () =>
  structuredClone({
    viewerAgentId: id(1),
    post: wall,
    ancestorReadable: true,
    associations: [association],
    controls: [control],
    mode: "read",
  });
export const parent = { kind: "task", id: task.id };
export const artifact = {
  ...entity(304),
  mime: "text/plain",
  sizeBytes: 10,
  scanState: "clean",
  downloadable: true,
};
export const storedArtifact = {
  ...artifact,
  userId: id(32),
  agentId: id(2),
  opaqueStorageRef: "synthetic-object-ref",
  hash: "a".repeat(64),
  parentRefs: [parent],
  purpose: "attachment",
  avatarModeration: "not_required",
  scanRevision: 1,
};
export const upload = {
  expectedVersion: 1,
  parent,
  mime: "text/plain",
  sizeBytes: 10,
  downloadable: true,
  purpose: "attachment",
};
export const uploadFacts = {
  parentVersion: 1,
  readableParents: [parent],
  measuredMime: "text/plain",
  measuredBytes: 10,
  remainingUploadBytes: 100,
};
export const readFacts = {
  actor: actor(2),
  readableParents: [parent],
  now: t1,
};
export const target = { kind: "wall_post", id: wall.id, revision: 1 };
export const report = {
  ...entity(305),
  target,
  category: "spam",
  details: "Synthetic repeated unsolicited contact",
  status: "received",
  moderationActionIds: [],
};
export const moderation = {
  id: id(306),
  createdAt: t1,
  target,
  action: "hide_content",
  reason: "Report reviewed",
  status: "applied",
  reportId: report.id,
};
export const allocation = {
  ...entity(307),
  agentId: id(2),
  assignmentId: id(104),
  unit: "reported_tokens",
  hardLimit: 1000,
  reserved: 500,
  consumed: 100,
  released: 200,
  period: { startsAt: t0, endsAt: future },
};
export const claim = {
  eventKey: "synthetic_usage_0001",
  unit: "reported_tokens",
  quantity: 100,
};
export const usage = {
  id: id(308),
  createdAt: t1,
  allocationId: allocation.id,
  ...claim,
  provenance: "runtime_reported",
};
export const activity = {
  id: id(309),
  createdAt: t1,
  action: "wall.post",
  target: { status: "available", target },
  outcome: "applied",
  policyVersion: "pilot-1",
  correlationId: id(310),
};
export const consent = {
  ...entity(311),
  purpose: "research",
  policyVersion: "research-v1",
  granted: false,
  decidedAt: t1,
};
export const form = {
  email: "person+piazza@example.test",
  locale: "en",
  purpose: "updates",
  consentVersion: "updates-v1",
  consent: true,
  website: "",
};
export const exportJob = {
  id: id(312),
  createdAt: t0,
  requestedAt: t0,
  version: 1,
  state: "queued",
};
export const job = {
  ...entity(313),
  kind: "artifact_scan",
  state: "queued",
  attemptCount: 0,
  maxAttempts: 3,
};
export const human = {
  kind: "human",
  userId: id(32),
  roles: ["user"],
  sessionId: id(314),
};
export const humanFacts = () => ({
  actor: human,
  sessionActive: true,
  accountActive: true,
  resourceUserId: id(32),
  now: t1,
  payloadDigest: "b".repeat(64),
});
export const stepUp = (operation) => ({
  userId: id(32),
  sessionId: human.sessionId,
  operation,
  payloadDigest: "b".repeat(64),
  expiresAt: end,
});
export const page = (value) => ({
  items: [value],
  total: 1,
  page: 1,
  pageSize: 20,
});
