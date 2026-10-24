// Deterministic synthetic data for two independently controlled agents, never real credentials.
export const id = (n) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
export const t0 = "2026-10-24T17:00:00.000Z";
export const t1 = "2026-10-24T17:01:00.000Z";
export const end = "2026-10-24T17:30:00.000Z";
export const future = "2026-10-24T19:00:00.000Z";
export const entity = (n) => ({ id: id(n), createdAt: t0, version: 1 });
export const caps = [{ unit: "requests", hardLimit: 100 }];
export const attribution = {
  origin: "runtime",
  agentId: id(2),
  instanceId: id(12),
  configurationRevisionId: id(22),
};
export const packet = {
  objective: "Compare the two methods and report limitations",
  inputArtifactIds: [],
  outputFormat: "markdown",
  acceptanceCriteria: ["Cite reproducible evidence"],
  budgetCaps: caps,
  leasePolicy: { durationSeconds: 1800, maxDurationSeconds: 7200 },
  dataClassification: "restricted",
  reviewPolicy: { requiredCount: 0 },
  assumptions: [],
  exclusions: [],
  delegation: "none",
};
export const project = {
  ...entity(100),
  ownerAgentId: id(1),
  title: "Methods",
  brief: "A bounded investigation",
  contextRevision: 1,
  visibility: "project",
  status: "active",
};
export const member = {
  ...entity(101),
  projectId: project.id,
  participantAgentId: id(2),
  role: "contributor",
  grantedByAgentId: id(1),
};
export const task = {
  ...entity(102),
  ownerAgentId: id(1),
  projectId: project.id,
  title: "Compare methods",
  packetRevision: 1,
  packet,
  visibility: "project",
  state: "active",
};
export const application = {
  ...entity(103),
  taskId: task.id,
  applicantAgentId: id(2),
  proposal: "I can compare these",
  estimatedUsage: caps,
  state: "proposed",
};
export const offered = {
  ...entity(104),
  taskId: task.id,
  applicationId: application.id,
  participantAgentId: id(2),
  packetRevision: 1,
  budgetAllocationIds: [id(105)],
  state: "offered",
  offerExpiresAt: end,
};
export const working = {
  ...offered,
  version: 2,
  state: "working",
  acknowledgedAt: t0,
  leaseExpiresAt: end,
};
export const submit = {
  expectedVersion: 2,
  packetRevision: 1,
  completeness: "complete",
  artifactIds: [],
  text: "Method A succeeded under these conditions",
  limitations: ["Small sample"],
};
export const submission = {
  id: id(106),
  createdAt: t1,
  taskId: task.id,
  assignmentId: working.id,
  attribution,
  packetRevision: 1,
  revision: 1,
  artifactIds: [],
  text: submit.text,
  limitations: submit.limitations,
  completeness: "complete",
  disposition: "current_work",
};
export const ref = { id: submission.id, revision: 1 };
export const target = { kind: "submission", ...ref };
export const independence = {
  basis: "self_declared",
  relationship: "unknown",
  details: "No operator-independence attestation",
};
export const findings = {
  method: "Reproduce the comparison",
  findings: "The evidence is incomplete",
  outcome: "reject",
  conflicts: [],
  independence,
  configurationRevisionId: id(21),
};
export const review = {
  ...entity(107),
  submission: ref,
  reviewerAgentId: id(1),
  requestState: "submitted",
  expiresAt: end,
  result: findings,
};
export const verification = {
  id: id(108),
  createdAt: t1,
  target,
  claimScope: "Result reproducibility",
  method: "Repeat the experiment",
  inputs: [{ status: "available", target }],
  environment: "Synthetic fixture",
  observations: "Did not reproduce",
  outcome: "fail",
  limitations: [],
  independence,
  attribution,
};
export const acceptance = {
  id: id(109),
  createdAt: t1,
  taskId: task.id,
  submission: ref,
  attribution: {
    origin: "operator",
    agentId: id(1),
    configurationRevisionId: id(21),
  },
  decision: "accept",
  rationale: "Meets this task's criteria",
};
export const decide = {
  expectedVersion: 1,
  submission: ref,
  decision: "accept",
  rationale: acceptance.rationale,
};
export const inquiry = {
  ...entity(110),
  authorAgentId: id(1),
  projectId: project.id,
  taskId: task.id,
  title: "Which baseline?",
  question: "What baseline should we use?",
  visibility: "project",
  resolutionLinks: [],
};
export const answer = {
  id: id(111),
  createdAt: t1,
  inquiryId: inquiry.id,
  attribution,
  text: "Use the documented baseline",
  evidenceRefs: [],
  revision: 1,
};
export const thread = {
  id: id(112),
  createdAt: t1,
  parent: { kind: "task", id: task.id },
  attribution,
  content: "Here is a caveat",
  revision: 1,
  artifactIds: [],
};
export const artifact = {
  ...entity(113),
  mime: "text/plain",
  sizeBytes: 10,
  scanState: "clean",
  downloadable: true,
};
export const offerFields = {
  configurationRevisionId: id(22),
  domains: ["methods"],
  modalities: ["text"],
  formats: ["markdown"],
  packetLimitBytes: 4096,
  availability: { startsAt: t0, endsAt: future },
  resourceLimits: caps,
  visibility: "public",
};
export const capability = {
  ...entity(114),
  ...offerFields,
  agentId: id(2),
  evidenceRefs: [],
  claimBasis: "self_declared",
};
export const observation = {
  id: id(115),
  createdAt: t1,
  subjectAgentId: id(2),
  target,
  sourceAgentId: id(1),
  evidenceKind: "observation",
  provenance: {
    origin: "platform_record",
    methodVersion: "fixture-v1",
    sources: [{ status: "available", target }],
  },
  statement: "A submission was recorded",
  observedAt: t1,
  disclosureScope: "project",
};
export const assessmentFields = {
  domain: "methods",
  configurationScope: { kind: "exact", configurationRevisionId: id(22) },
  judgments: [
    {
      dimension: "technical_competence",
      judgment: "Evidence remains limited",
      uncertainty: "high",
    },
  ],
  methodVersion: "local-v1",
};
export const assessment = {
  ...entity(116),
  ...assessmentFields,
  observerAgentId: id(1),
  subjectAgentId: id(2),
  evidenceRefs: [],
  assessedAt: t1,
};
export const grant = {
  ...entity(117),
  agentId: id(2),
  actions: ["assignment.submit"],
  resourceScope: { kind: "project", id: project.id },
  budgetCaps: caps,
  approvalRule: "within_grant",
  expiresAt: future,
};
export const balance = {
  unit: "requests",
  hardLimit: 100,
  reserved: 10,
  consumed: 10,
};
export const projectResource = {
  kind: "project",
  id: project.id,
  ownerAgentId: id(1),
  controllerUserId: id(31),
  visibility: "project",
  version: 1,
};
export const taskResource = {
  kind: "task",
  id: task.id,
  ownerAgentId: id(1),
  controllerUserId: id(31),
  visibility: "project",
  projectId: project.id,
  version: 1,
};
export const principal = (n) => ({
  agentId: id(n),
  controllerUserId: id(n + 30),
  configurationRevisionId: id(n + 20),
  agentState: "active",
  controllerState: "active",
  instance: {
    id: id(n + 10),
    configurationRevisionId: id(n + 20),
    state: "active",
    credentialId: id(n + 40),
    credentialExpiresAt: future,
    credentialRevoked: false,
    scopeVersion: 1,
  },
});
export const actor = (n) => ({
  kind: "agent",
  agentId: id(n),
  instanceId: id(n + 10),
  configurationRevisionId: id(n + 20),
  controllerUserId: id(n + 30),
  credentialId: id(n + 40),
  scopeVersion: 1,
});
export const context = () =>
  structuredClone({
    actor: actor(2),
    sessionActive: false,
    principal: principal(2),
    resource: taskResource,
    ancestors: [projectResource],
    memberships: [member],
    grants: [grant],
    operatorBalances: [balance],
    grantBalances: [{ grantId: grant.id, balances: [balance] }],
    assignment: working,
    now: t1,
  });
export const action = {
  action: "assignment.submit",
  expectedVersion: 2,
  budget: [{ unit: "requests", hardLimit: 1 }],
};
export const page = (value) => ({
  items: [value],
  total: 1,
  page: 1,
  pageSize: 20,
});
