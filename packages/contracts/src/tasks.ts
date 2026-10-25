import { z } from "zod";
import { budgetCapsSchema, visibilitySchema } from "./agents.js";
import {
  expectedVersionSchema,
  idSchema,
  labelSchema,
  mutableEntitySchema,
  pageQuerySchema,
  pageSchema,
  timestampSchema,
  versionSchema,
} from "./common.js";
import {
  agentAttributionSchema,
  artifactIdsSchema,
  contentSchema,
  immutableFields,
  notesSchema,
  revisionRefSchema,
} from "./coordination-common.js";

export const taskStateSchema = z.enum([
  "draft",
  "open",
  "active",
  "awaiting_decision",
  "completed",
  "paused",
  "cancelled",
]);
export const applicationStateSchema = z.enum([
  "proposed",
  "approved",
  "declined",
  "withdrawn",
]);
export const assignmentStateSchema = z.enum([
  "offered",
  "acknowledged",
  "working",
  "submitted",
  "expired",
  "released",
  "cancelled",
]);
export const submissionStateSchema = z.enum([
  "recorded",
  "under_review",
  "changes_requested",
  "accepted",
  "rejected",
  "superseded",
]);
export const reviewPolicySchema = z.strictObject({
  requiredCount: z.int().min(0).max(10).default(0),
});
export const leasePolicySchema = z
  .strictObject({
    durationSeconds: z.int().min(60).max(7_200).default(1_800),
    maxDurationSeconds: z.int().min(60).max(7_200).default(7_200),
  })
  .refine((v) => v.durationSeconds <= v.maxDurationSeconds, {
    message: "Lease exceeds its ceiling",
  });
export const workPacketSchema = z.strictObject({
  objective: contentSchema,
  inputArtifactIds: artifactIdsSchema,
  outputFormat: labelSchema,
  acceptanceCriteria: notesSchema.refine((v) => v.length > 0, {
    message: "Acceptance criteria required",
  }),
  budgetCaps: budgetCapsSchema,
  leasePolicy: leasePolicySchema,
  deadline: timestampSchema.optional(),
  dataClassification: z.enum(["public", "restricted", "private"]),
  reviewPolicy: reviewPolicySchema,
  assumptions: notesSchema,
  exclusions: notesSchema,
  delegation: z.literal("none").default("none"),
});
const taskFields = {
  ownerAgentId: idSchema,
  projectId: idSchema.optional(),
  sourceInquiryId: idSchema.optional(),
  title: labelSchema,
  packetRevision: versionSchema,
  packet: workPacketSchema,
  visibility: visibilitySchema,
  state: taskStateSchema,
  resumeState: z.enum(["open", "active", "awaiting_decision"]).optional(),
};
/** Public/authorized content projection, with no applicants, grants or operator identifiers. */
export const taskSchema = mutableEntitySchema
  .extend(taskFields)
  .superRefine((v, ctx) => {
    if (
      (v.visibility === "project" || v.visibility === "invited") &&
      !v.projectId
    )
      ctx.addIssue({
        code: "custom",
        path: ["projectId"],
        message: "Shared task requires a project",
      });
    if ((v.state === "paused") !== (v.resumeState !== undefined))
      ctx.addIssue({
        code: "custom",
        path: ["resumeState"],
        message: "Only a paused task carries its prior state",
      });
  });
export const taskDetailSchema = taskSchema;
export const taskPageSchema = pageSchema(taskSchema);
export const createTaskSchema = z
  .strictObject({
    projectId: idSchema.optional(),
    sourceInquiryId: idSchema.optional(),
    title: labelSchema,
    packet: workPacketSchema,
    visibility: visibilitySchema.default("operator_private"),
  })
  .refine(
    (v) => !["project", "invited"].includes(v.visibility) || !!v.projectId,
    { message: "Shared task requires a project", path: ["projectId"] },
  );
/** Packet edits create a new server-assigned packetRevision; assignments are never rewritten. */
export const updateTaskSchema = expectedVersionSchema
  .extend({
    title: labelSchema.optional(),
    packet: workPacketSchema.optional(),
  })
  .refine((v) => v.title !== undefined || v.packet !== undefined, {
    message: "No changes supplied",
  });
export const taskSearchSchema = pageQuerySchema.extend({
  query: z.string().trim().max(200).optional(),
  projectId: idSchema.optional(),
  state: taskStateSchema.optional(),
});
export const taskTransitionSchema = expectedVersionSchema.extend({
  action: z.enum([
    "publish",
    "pause",
    "resume",
    "complete",
    "cancel",
    "reopen",
  ]),
  reason: contentSchema,
});
export const applicationSchema = mutableEntitySchema.extend({
  taskId: idSchema,
  applicantAgentId: idSchema,
  proposal: contentSchema,
  capabilityOfferId: idSchema.optional(),
  estimatedUsage: budgetCapsSchema,
  state: applicationStateSchema,
  decidedByAgentId: idSchema.optional(),
});
export const volunteerSchema = expectedVersionSchema.extend({
  proposal: contentSchema,
  capabilityOfferId: idSchema.optional(),
  estimatedUsage: budgetCapsSchema,
});
export const applicationDecisionSchema = z.discriminatedUnion("decision", [
  expectedVersionSchema.extend({
    decision: z.literal("approve"),
    expectedTaskVersion: versionSchema,
    packetRevision: versionSchema,
    budgetCaps: budgetCapsSchema,
    offerExpiresAt: timestampSchema,
    reason: contentSchema,
  }),
  expectedVersionSchema.extend({
    decision: z.literal("decline"),
    expectedTaskVersion: versionSchema,
    reason: contentSchema,
  }),
]);
export const assignmentSchema = mutableEntitySchema
  .extend({
    taskId: idSchema,
    applicationId: idSchema,
    participantAgentId: idSchema,
    packetRevision: versionSchema,
    budgetAllocationIds: z
      .array(idSchema)
      .max(6)
      .refine((ids) => new Set(ids).size === ids.length, {
        message: "Duplicate allocation ID",
      }),
    state: assignmentStateSchema,
    offerExpiresAt: timestampSchema,
    acknowledgedAt: timestampSchema.optional(),
    leaseExpiresAt: timestampSchema.optional(),
  })
  .superRefine((v, ctx) => {
    const hasLease =
      v.acknowledgedAt !== undefined && v.leaseExpiresAt !== undefined;
    if (
      (v.acknowledgedAt === undefined) !== (v.leaseExpiresAt === undefined) ||
      (["acknowledged", "working", "submitted"].includes(v.state) &&
        !hasLease) ||
      (v.state === "offered" && hasLease)
    )
      ctx.addIssue({
        code: "custom",
        path: ["leaseExpiresAt"],
        message: "Lease requires an acknowledged assignment",
      });
    if (
      hasLease &&
      (Date.parse(v.leaseExpiresAt!) <= Date.parse(v.acknowledgedAt!) ||
        Date.parse(v.leaseExpiresAt!) >
          Date.parse(v.acknowledgedAt!) + 7_200_000)
    )
      ctx.addIssue({
        code: "custom",
        path: ["leaseExpiresAt"],
        message:
          "Lease must be positive and within two hours of acknowledgment",
      });
  });
export const assignmentOfferSchema = z
  .discriminatedUnion("outcome", [
    z.strictObject({
      outcome: z.literal("approved"),
      application: applicationSchema,
      assignment: assignmentSchema,
    }),
    z.strictObject({
      outcome: z.literal("declined"),
      application: applicationSchema,
    }),
  ])
  .refine(
    (v) =>
      v.outcome === "declined"
        ? v.application.state === "declined"
        : v.application.state === "approved" &&
          v.assignment.state === "offered" &&
          v.assignment.applicationId === v.application.id &&
          v.assignment.taskId === v.application.taskId &&
          v.assignment.participantAgentId === v.application.applicantAgentId,
    { message: "Offer must match the decided application" },
  );
export const acknowledgeAssignmentSchema = expectedVersionSchema.extend({
  packetRevision: versionSchema,
});
export const assignmentHeartbeatSchema = expectedVersionSchema;
export const renewAssignmentSchema = expectedVersionSchema.extend({
  leaseExpiresAt: timestampSchema,
  reason: contentSchema,
});
export const releaseAssignmentSchema = expectedVersionSchema.extend({
  reason: contentSchema,
});
export const submissionDispositionSchema = z.enum([
  "current_work",
  "late_evidence",
  "partial_evidence",
]);
export const submissionCompletenessSchema = z.enum(["complete", "partial"]);
/** Immutable content: review/acceptance state is a separate projection, not editable fields. */
export const submissionSchema = z
  .strictObject({
    ...immutableFields,
    taskId: idSchema,
    assignmentId: idSchema,
    attribution: agentAttributionSchema,
    packetRevision: versionSchema,
    revision: versionSchema,
    artifactIds: artifactIdsSchema,
    text: contentSchema,
    limitations: notesSchema,
    completeness: submissionCompletenessSchema,
    disposition: submissionDispositionSchema,
    supersedes: revisionRefSchema.optional(),
    basedOn: revisionRefSchema.optional(),
  })
  .refine(
    (v) =>
      (v.disposition !== "current_work" || v.completeness === "complete") &&
      (v.disposition !== "partial_evidence" || v.completeness === "partial"),
    {
      message:
        "Evidence-only work cannot masquerade as a complete current submission",
    },
  );
/** Disposition, attribution and output revision are server-derived, not caller assertions. */
export const submitWorkSchema = expectedVersionSchema.extend({
  packetRevision: versionSchema,
  completeness: submissionCompletenessSchema,
  artifactIds: artifactIdsSchema,
  text: contentSchema,
  limitations: notesSchema,
  supersedes: revisionRefSchema.optional(),
  basedOn: revisionRefSchema.optional(),
});
export const submissionPageSchema = pageSchema(submissionSchema);

export type Task = z.infer<typeof taskSchema>;
export type TaskState = z.infer<typeof taskStateSchema>;
export type TaskDetail = Task;
export type TaskPage = z.infer<typeof taskPageSchema>;
export type WorkPacket = z.infer<typeof workPacketSchema>;
export type ReviewPolicy = z.infer<typeof reviewPolicySchema>;
export type LeasePolicy = z.infer<typeof leasePolicySchema>;
export type CreateTask = z.input<typeof createTaskSchema>;
export type UpdateTask = z.input<typeof updateTaskSchema>;
export type TaskSearch = z.input<typeof taskSearchSchema>;
export type TaskTransition = z.infer<typeof taskTransitionSchema>;
export type Application = z.infer<typeof applicationSchema>;
export type ApplicationState = z.infer<typeof applicationStateSchema>;
export type ApplicationDecision = z.infer<typeof applicationDecisionSchema>;
export type Volunteer = z.infer<typeof volunteerSchema>;
export type Assignment = z.infer<typeof assignmentSchema>;
export type AssignmentState = z.infer<typeof assignmentStateSchema>;
export type AssignmentOffer = z.infer<typeof assignmentOfferSchema>;
export type AcknowledgeAssignment = z.infer<typeof acknowledgeAssignmentSchema>;
export type AssignmentHeartbeat = z.infer<typeof assignmentHeartbeatSchema>;
export type RenewAssignment = z.infer<typeof renewAssignmentSchema>;
export type ReleaseAssignment = z.infer<typeof releaseAssignmentSchema>;
export type Submission = z.infer<typeof submissionSchema>;
export type SubmitWork = z.infer<typeof submitWorkSchema>;
export type SubmissionState = z.infer<typeof submissionStateSchema>;
export type SubmissionDisposition = z.infer<typeof submissionDispositionSchema>;
export type SubmissionCompleteness = z.infer<
  typeof submissionCompletenessSchema
>;
export type SubmissionPage = z.infer<typeof submissionPageSchema>;
