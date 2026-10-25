import { z } from "zod";
import { apiErrorCodeSchema, isExpired, timestampSchema } from "./common.js";
import {
  acceptanceDecisionSchema,
  reviewRequestStateSchema,
  type AcceptanceDecision,
  type DecideAcceptance,
  type Review,
} from "./evidence.js";
import {
  applicationStateSchema,
  assignmentStateSchema,
  submissionDispositionSchema,
  taskStateSchema,
  type AcknowledgeAssignment,
  type Application,
  type ApplicationDecision,
  type Assignment,
  type Submission,
  type SubmitWork,
  type Task,
} from "./tasks.js";

export const domainDecisionSchema = z.discriminatedUnion("allowed", [
  z.strictObject({ allowed: z.literal(true) }),
  z.strictObject({ allowed: z.literal(false), code: apiErrorCodeSchema }),
]);
export type DomainDecision = z.infer<typeof domainDecisionSchema>;
export const submissionAdmissionSchema = z.discriminatedUnion("allowed", [
  z.strictObject({
    allowed: z.literal(true),
    disposition: submissionDispositionSchema,
  }),
  z.strictObject({ allowed: z.literal(false), code: apiErrorCodeSchema }),
]);
export type SubmissionAdmission = z.infer<typeof submissionAdmissionSchema>;
export const acknowledgmentAdmissionSchema = z.discriminatedUnion("allowed", [
  z.strictObject({
    allowed: z.literal(true),
    leaseExpiresAt: timestampSchema,
  }),
  z.strictObject({ allowed: z.literal(false), code: apiErrorCodeSchema }),
]);
export type AcknowledgmentAdmission = z.infer<
  typeof acknowledgmentAdmissionSchema
>;
export const transitionDecisionSchema = z.discriminatedUnion("allowed", [
  z.strictObject({
    allowed: z.literal(true),
    nextState: z.union([
      taskStateSchema,
      applicationStateSchema,
      assignmentStateSchema,
      reviewRequestStateSchema,
    ]),
  }),
  z.strictObject({ allowed: z.literal(false), code: apiErrorCodeSchema }),
]);
export type TransitionDecision = z.infer<typeof transitionDecisionSchema>;
const allow: DomainDecision = Object.freeze({ allowed: true });
const deny = (
  code: z.infer<typeof apiErrorCodeSchema>,
): Extract<DomainDecision, { allowed: false }> => ({ allowed: false, code });

/** Event vocabulary includes server events; the owner HTTP command is a narrower schema. */
export const taskEventSchema = z.enum([
  "publish",
  "start",
  "await_decision",
  "changes_requested",
  "pause",
  "resume",
  "complete",
  "cancel",
  "reopen",
]);
export const applicationEventSchema = z.enum([
  "approve",
  "decline",
  "withdraw",
]);
export const assignmentEventSchema = z.enum([
  "acknowledge",
  "start",
  "submit",
  "changes_requested",
  "renew",
  "release",
  "cancel",
  "expire",
]);
export const reviewEventSchema = z.enum([
  "accept",
  "decline",
  "submit",
  "expire",
]);
export type TaskEvent = z.infer<typeof taskEventSchema>;
export type ApplicationEvent = z.infer<typeof applicationEventSchema>;
export type AssignmentEvent = z.infer<typeof assignmentEventSchema>;
export type ReviewEvent = z.infer<typeof reviewEventSchema>;

export const TASK_TRANSITIONS = Object.freeze(
  [
    ["draft", "publish", "open"],
    ["draft", "cancel", "cancelled"],
    ["open", "start", "active"],
    ["open", "pause", "paused"],
    ["open", "cancel", "cancelled"],
    ["active", "await_decision", "awaiting_decision"],
    ["active", "pause", "paused"],
    ["active", "cancel", "cancelled"],
    ["active", "complete", "completed"],
    ["awaiting_decision", "start", "active"],
    ["awaiting_decision", "changes_requested", "active"],
    ["awaiting_decision", "pause", "paused"],
    ["awaiting_decision", "cancel", "cancelled"],
    ["awaiting_decision", "complete", "completed"],
    ["paused", "resume", "open"],
    ["paused", "resume", "active"],
    ["paused", "resume", "awaiting_decision"],
    ["paused", "cancel", "cancelled"],
    ["completed", "reopen", "open"],
    ["cancelled", "reopen", "open"],
  ].map((row) => Object.freeze(row)),
);
export const APPLICATION_TRANSITIONS = Object.freeze(
  [
    ["proposed", "approve", "approved"],
    ["proposed", "decline", "declined"],
    ["proposed", "withdraw", "withdrawn"],
  ].map((row) => Object.freeze(row)),
);
export const ASSIGNMENT_TRANSITIONS = Object.freeze(
  [
    ["offered", "acknowledge", "acknowledged"],
    ["offered", "release", "released"],
    ["offered", "cancel", "cancelled"],
    ["offered", "expire", "expired"],
    ["acknowledged", "start", "working"],
    ["acknowledged", "submit", "submitted"],
    ["acknowledged", "renew", "acknowledged"],
    ["acknowledged", "release", "released"],
    ["acknowledged", "cancel", "cancelled"],
    ["acknowledged", "expire", "expired"],
    ["working", "submit", "submitted"],
    ["working", "renew", "working"],
    ["working", "release", "released"],
    ["working", "cancel", "cancelled"],
    ["working", "expire", "expired"],
    ["submitted", "changes_requested", "working"],
  ].map((row) => Object.freeze(row)),
);
export const REVIEW_TRANSITIONS = Object.freeze(
  [
    ["requested", "accept", "accepted"],
    ["requested", "decline", "declined"],
    ["requested", "expire", "expired"],
    ["accepted", "submit", "submitted"],
    ["accepted", "expire", "expired"],
  ].map((row) => Object.freeze(row)),
);

function edge(
  table: readonly (readonly string[])[],
  from: string,
  event: string,
  resumeState?: string,
): TransitionDecision {
  const row = table.find(
    (r) =>
      r[0] === from &&
      r[1] === event &&
      (event !== "resume" || r[2] === resumeState),
  );
  return row
    ? transitionDecisionSchema.parse({ allowed: true, nextState: row[2] })
    : deny("INVALID_TRANSITION");
}
/** Domain admissibility only. Services authorize the actor and commit atomically afterward. */
export function evaluateTaskTransition(
  task: Task,
  event: TaskEvent,
  expectedVersion: number,
  current?: { decision: AcceptanceDecision; submission: Submission },
): TransitionDecision {
  if (task.version !== expectedVersion) return deny("VERSION_CONFLICT");
  if (
    event === "complete" &&
    (!current ||
      !acceptanceDecisionSchema.safeParse(current.decision).success ||
      current.decision.decision !== "accept" ||
      current.decision.taskId !== task.id ||
      current.submission.taskId !== task.id ||
      current.decision.submission.id !== current.submission.id ||
      current.decision.submission.revision !== current.submission.revision ||
      current.submission.packetRevision !== task.packetRevision ||
      current.submission.disposition !== "current_work" ||
      current.submission.completeness !== "complete")
  )
    return deny("INVALID_TRANSITION");
  return edge(TASK_TRANSITIONS, task.state, event, task.resumeState);
}
export function evaluateApplicationTransition(
  application: Application,
  event: ApplicationEvent,
  expectedVersion: number,
): TransitionDecision {
  return application.version !== expectedVersion
    ? deny("VERSION_CONFLICT")
    : edge(APPLICATION_TRANSITIONS, application.state, event);
}
/** Approval pins the current packet and a bounded offer; it never acknowledges on behalf of a contributor. */
export function evaluateApplicationDecision(
  task: Task,
  application: Application,
  request: ApplicationDecision,
  now: string,
): TransitionDecision {
  if (
    request.expectedTaskVersion !== task.version ||
    application.taskId !== task.id
  )
    return deny("VERSION_CONFLICT");
  if (!["open", "active", "awaiting_decision"].includes(task.state))
    return deny("INVALID_TRANSITION");
  if (request.decision === "approve") {
    if (request.packetRevision !== task.packetRevision)
      return deny("VERSION_CONFLICT");
    if (
      isExpired(request.offerExpiresAt, now) ||
      (task.packet.deadline && isExpired(task.packet.deadline, now))
    )
      return deny("ASSIGNMENT_EXPIRED");
    if (
      !request.budgetCaps.every((cost) =>
        task.packet.budgetCaps.some(
          (cap) => cap.unit === cost.unit && cap.hardLimit >= cost.hardLimit,
        ),
      )
    )
      return deny("BUDGET_EXHAUSTED");
  }
  return evaluateApplicationTransition(
    application,
    request.decision,
    request.expectedVersion,
  );
}
/** A server-issued lease starts only on contributor acknowledgment and cannot exceed the packet deadline. */
export function evaluateAcknowledgment(
  task: Task,
  assignment: Assignment,
  request: AcknowledgeAssignment,
  now: string,
): AcknowledgmentAdmission {
  if (
    assignment.taskId !== task.id ||
    request.packetRevision !== assignment.packetRevision ||
    request.packetRevision !== task.packetRevision
  )
    return deny("VERSION_CONFLICT");
  if (!["open", "active", "awaiting_decision"].includes(task.state))
    return deny("INVALID_TRANSITION");
  const transition = evaluateAssignmentTransition(
    assignment,
    "acknowledge",
    request.expectedVersion,
    now,
  );
  if (!transition.allowed) return transition;
  const end = Math.min(
    Date.parse(now) + task.packet.leasePolicy.durationSeconds * 1_000,
    task.packet.deadline ? Date.parse(task.packet.deadline) : Infinity,
  );
  return end <= Date.parse(now)
    ? deny("ASSIGNMENT_EXPIRED")
    : { allowed: true, leaseExpiresAt: new Date(end).toISOString() };
}
/** A heartbeat is not an event/renewal. Expired leases cannot be revived through any edge. */
export function evaluateAssignmentTransition(
  assignment: Assignment,
  event: AssignmentEvent,
  expectedVersion: number,
  now: string,
  renewal?: {
    leaseExpiresAt: string;
    maxDurationSeconds: number;
    deadline?: string;
  },
): TransitionDecision {
  if (assignment.version !== expectedVersion) return deny("VERSION_CONFLICT");
  const expiresAt =
    assignment.state === "offered"
      ? assignment.offerExpiresAt
      : assignment.leaseExpiresAt;
  if (event === "expire") {
    if (!expiresAt || !isExpired(expiresAt, now))
      return deny("INVALID_TRANSITION");
  } else if (
    ["acknowledge", "start", "submit", "renew", "changes_requested"].includes(
      event,
    ) &&
    (!expiresAt || isExpired(expiresAt, now))
  ) {
    return deny("ASSIGNMENT_EXPIRED");
  }
  if (event === "renew") {
    if (
      !renewal ||
      !assignment.acknowledgedAt ||
      !assignment.leaseExpiresAt ||
      !Number.isInteger(renewal.maxDurationSeconds) ||
      renewal.maxDurationSeconds < 60 ||
      renewal.maxDurationSeconds > 7_200 ||
      isExpired(renewal.leaseExpiresAt, assignment.leaseExpiresAt) ||
      Date.parse(renewal.leaseExpiresAt) >
        Date.parse(assignment.acknowledgedAt) +
          renewal.maxDurationSeconds * 1_000 ||
      (renewal.deadline !== undefined &&
        Date.parse(renewal.leaseExpiresAt) > Date.parse(renewal.deadline))
    )
      return deny("INVALID_TRANSITION");
  }
  return edge(ASSIGNMENT_TRANSITIONS, assignment.state, event);
}
export function evaluateReviewTransition(
  review: Review,
  event: ReviewEvent,
  expectedVersion: number,
  now: string,
): TransitionDecision {
  if (review.version !== expectedVersion) return deny("VERSION_CONFLICT");
  if (event === "expire" && !isExpired(review.expiresAt, now))
    return deny("INVALID_TRANSITION");
  if (event !== "expire" && isExpired(review.expiresAt, now))
    return deny("INVALID_TRANSITION");
  return edge(REVIEW_TRANSITIONS, review.requestState, event);
}

/** Classifies historical evidence without granting its author upload/assignment authority. */
export function evaluateSubmission(
  task: Task,
  assignment: Assignment,
  request: SubmitWork,
  now: string,
  priorEvidence: readonly Submission[],
  related: { basedOn?: Submission; supersedes?: Submission } = {},
): SubmissionAdmission {
  if (
    assignment.version !== request.expectedVersion ||
    assignment.taskId !== task.id ||
    assignment.packetRevision !== request.packetRevision
  )
    return deny("VERSION_CONFLICT");
  if (
    !assignment.acknowledgedAt ||
    !assignment.leaseExpiresAt ||
    Date.parse(assignment.acknowledgedAt) > Date.parse(now)
  )
    return deny("INVALID_TRANSITION");
  for (const link of ["basedOn", "supersedes"] as const) {
    const ref = request[link],
      source = related[link];
    if (
      ref &&
      (!source ||
        ref.id !== source.id ||
        ref.revision !== source.revision ||
        source.taskId !== task.id ||
        source.attribution.agentId !== assignment.participantAgentId)
    )
      return deny("INVALID_TRANSITION");
    if (!ref && source) return deny("INVALID_TRANSITION");
  }
  if (
    ["expired", "released", "cancelled"].includes(assignment.state) ||
    isExpired(assignment.leaseExpiresAt, now) ||
    (task.packet.deadline && isExpired(task.packet.deadline, now))
  )
    return { allowed: true, disposition: "late_evidence" };
  if (request.completeness === "partial")
    return { allowed: true, disposition: "partial_evidence" };
  if (
    !["acknowledged", "working"].includes(assignment.state) ||
    task.state !== "active"
  )
    return deny("INVALID_TRANSITION");
  if (task.packetRevision !== request.packetRevision)
    return deny("VERSION_CONFLICT");
  if (
    priorEvidence.some(
      (v) =>
        v.assignmentId === assignment.id && v.disposition !== "current_work",
    )
  )
    return deny("INVALID_TRANSITION");
  for (const source of [...priorEvidence, ...Object.values(related)]) {
    if (
      source.taskId === task.id &&
      source.attribution.agentId === assignment.participantAgentId &&
      source.disposition !== "current_work" &&
      (source.assignmentId === assignment.id ||
        Date.parse(assignment.createdAt) <= Date.parse(source.createdAt) ||
        Date.parse(assignment.acknowledgedAt) <= Date.parse(source.createdAt))
    )
      return deny("INVALID_TRANSITION");
  }
  return { allowed: true, disposition: "current_work" };
}

/** Completed reviews count regardless of opinion; acceptance is an owner's separate decision. */
export function evaluateAcceptance(
  task: Task,
  submission: Submission,
  reviews: readonly Review[],
  request: DecideAcceptance,
  currentDecision?: AcceptanceDecision,
): DomainDecision {
  if (
    request.expectedVersion !== task.version ||
    request.submission.id !== submission.id ||
    request.submission.revision !== submission.revision ||
    submission.taskId !== task.id
  )
    return deny("VERSION_CONFLICT");
  if (
    currentDecision
      ? request.supersedesId !== currentDecision.id ||
        currentDecision.taskId !== task.id
      : request.supersedesId !== undefined
  )
    return deny("VERSION_CONFLICT");
  if (!["active", "awaiting_decision"].includes(task.state))
    return deny("INVALID_TRANSITION");
  if (request.decision !== "accept") return allow;
  if (
    submission.disposition !== "current_work" ||
    submission.completeness !== "complete"
  )
    return deny("INVALID_TRANSITION");
  if (submission.packetRevision !== task.packetRevision)
    return deny("VERSION_CONFLICT");
  const reviewers = new Set(
    reviews
      .filter(
        (r) =>
          r.requestState === "submitted" &&
          !!r.result &&
          r.submission.id === submission.id &&
          r.submission.revision === submission.revision &&
          r.reviewerAgentId !== submission.attribution.agentId,
      )
      .map((r) => r.reviewerAgentId),
  );
  return reviewers.size >= task.packet.reviewPolicy.requiredCount
    ? allow
    : deny("REVIEW_REQUIRED");
}
