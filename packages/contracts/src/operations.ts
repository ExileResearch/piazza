import { z } from "zod";
import { permissionActionSchema } from "./agents.js";
import {
  expectedVersionSchema,
  eventCursorQuerySchema,
  idSchema,
  labelSchema,
  mutableEntitySchema,
  pageQuerySchema,
  pageSchema,
  timestampSchema,
  versionSchema,
} from "./common.js";
import {
  budgetBalanceSchema,
  contentSchema,
  immutableFields,
  usageClaimSchema,
} from "./coordination-common.js";

/** Includes identifiers only, never excerpts from the reported private resource. */
export const moderationTargetSchema = z.strictObject({
  kind: z.enum([
    "agent",
    "wall_post",
    "thread_entry",
    "artifact",
    "task",
    "inquiry",
    "submission",
    "answer",
  ]),
  id: idSchema,
  revision: versionSchema,
});
export const reportCategorySchema = z.enum([
  "spam",
  "harassment",
  "unsafe_content",
  "privacy",
  "other",
]);
export const createAbuseReportSchema = z.strictObject({
  target: moderationTargetSchema,
  category: reportCategorySchema,
  details: contentSchema,
});
/** Reporter receipt reveals no investigation, reporter identity or target-private data. */
export const abuseReportReceiptSchema = z.strictObject({
  ...immutableFields,
  status: z.literal("received"),
});
export const reportStateSchema = z.enum([
  "received",
  "reviewing",
  "resolved",
  "dismissed",
]);
export const adminReportSchema = mutableEntitySchema.extend({
  target: moderationTargetSchema,
  category: reportCategorySchema,
  details: contentSchema,
  status: reportStateSchema,
  moderationActionIds: z.array(idSchema).max(20),
});
export const reportQuerySchema = pageQuerySchema.extend({
  status: reportStateSchema.optional(),
});
export const adminReportPageSchema = pageSchema(adminReportSchema);
export const moderationActionKindSchema = z.enum([
  "hide_content",
  "restore_content",
  "remove_content",
  "suspend_agent",
  "restore_agent",
]);
export const createModerationActionSchema = expectedVersionSchema
  .extend({
    target: moderationTargetSchema,
    action: moderationActionKindSchema,
    reason: contentSchema,
    reportId: idSchema.optional(),
    appealOfId: idSchema.optional(),
  })
  .refine(
    (v) =>
      ["suspend_agent", "restore_agent"].includes(v.action) ===
      (v.target.kind === "agent"),
    {
      message:
        "Agent suspension and content moderation are separate operations",
    },
  );
/** Admin-only record; never an acceptance/verification and never discloses the reporter. */
export const moderationActionSchema = z.strictObject({
  ...immutableFields,
  target: moderationTargetSchema,
  action: moderationActionKindSchema,
  reason: contentSchema,
  status: z.literal("applied"),
  reportId: idSchema.optional(),
  appealOfId: idSchema.optional(),
});
export const moderationNoticeSchema = z.strictObject({
  ...immutableFields,
  action: moderationActionKindSchema,
  messageKey: z.literal("moderation.action_applied"),
});
export const budgetPeriodSchema = z
  .strictObject({ startsAt: timestampSchema, endsAt: timestampSchema })
  .refine((v) => Date.parse(v.startsAt) < Date.parse(v.endsAt), {
    message: "Budget period must be positive",
  });
/** Controller/assignment-party projection. Released is cumulative history, not another debit. */
export const budgetAllocationSchema = budgetBalanceSchema.safeExtend({
  ...mutableEntitySchema.shape,
  agentId: idSchema,
  assignmentId: idSchema.optional(),
  released: z.int().min(0).max(Number.MAX_SAFE_INTEGER),
  period: budgetPeriodSchema,
});
export const usageRecordSchema = usageClaimSchema.safeExtend({
  ...immutableFields,
  allocationId: idSchema,
});
export const runtimeUsageClaimSchema = z.strictObject({
  eventKey: usageClaimSchema.shape.eventKey,
  quantity: usageClaimSchema.shape.quantity,
  unit: z.enum(["reported_tokens", "reported_compute_seconds"]),
});
/** Runtime can report local usage, not author server-measured records or choose provenance. */
export const reportUsageSchema = expectedVersionSchema.extend({
  entries: z
    .array(
      runtimeUsageClaimSchema.extend({
        allocationId: idSchema,
        expectedAllocationVersion: versionSchema,
      }),
    )
    .min(1)
    .max(6)
    .refine((v) => new Set(v.map((e) => e.allocationId)).size === v.length, {
      message: "Each allocation may occur only once per atomic usage batch",
    }),
});
export const usageReceiptSchema = z
  .strictObject({
    records: z.array(usageRecordSchema).min(1).max(6),
    allocations: z.array(budgetAllocationSchema).min(1).max(6),
  })
  .refine(
    (v) =>
      new Set(v.records.map((r) => `${r.allocationId}:${r.eventKey}`)).size ===
        v.records.length &&
      new Set(v.allocations.map((a) => a.id)).size === v.allocations.length &&
      v.records.every((r) =>
        v.allocations.some((a) => a.id === r.allocationId && a.unit === r.unit),
      ),
    { message: "Usage receipts must match unique allocation units" },
  );
export const activityActionSchema = z.union([
  permissionActionSchema,
  z.enum([
    "account.close",
    "account.export",
    "consent.decide",
    "artifact.scan",
    "moderation.apply",
    "budget.release",
  ]),
]);
export const activityTargetSchema = z.discriminatedUnion("status", [
  z.strictObject({
    status: z.literal("available"),
    target: moderationTargetSchema,
  }),
  z.strictObject({ status: z.literal("unavailable") }),
]);
/** Controller-scoped activity, redacted against current source access; no arbitrary metadata. */
export const activityEventSchema = z.strictObject({
  ...immutableFields,
  action: activityActionSchema,
  target: activityTargetSchema,
  outcome: z.enum(["applied", "denied", "failed"]),
  policyVersion: labelSchema,
  correlationId: idSchema,
});
/** Cursor page omits global/private totals; cursor signing, retention and expiry belong to phase 5. */
export const activityPageSchema = z.strictObject({
  items: z.array(activityEventSchema).max(100),
  nextCursor: eventCursorQuerySchema.shape.cursor,
});
export const operationalJobKindSchema = z.enum([
  "nonsecret_notification",
  "artifact_scan",
  "account_export",
  "account_purge",
  "orphan_cleanup",
  "form_retention",
]);
export const operationalJobStateSchema = z.enum([
  "queued",
  "running",
  "succeeded",
  "failed",
  "cancelled",
]);
/** Safe operational metadata; job payload refs and target ownership are server-internal. */
export const operationalJobMetadataSchema = mutableEntitySchema
  .extend({
    kind: operationalJobKindSchema,
    state: operationalJobStateSchema,
    attemptCount: z.int().min(0).max(10),
    maxAttempts: z.int().min(1).max(10),
    nextAttemptAt: timestampSchema.optional(),
    failureCode: z
      .enum(["DEPENDENCY_UNAVAILABLE", "INTERNAL_ERROR"])
      .optional(),
  })
  .refine(
    (v) =>
      v.attemptCount <= v.maxAttempts &&
      (!["running", "succeeded", "failed"].includes(v.state) ||
        v.attemptCount > 0) &&
      (v.state !== "queued" || v.attemptCount < v.maxAttempts) &&
      (v.nextAttemptAt === undefined || v.state === "queued") &&
      (v.failureCode === undefined || ["failed", "queued"].includes(v.state)),
    { message: "Invalid bounded job state" },
  );
export const opsQuerySchema = z.strictObject({
  window: z.enum(["hour", "day"]).default("day"),
});
/** Minimized operational totals; no content, relationship graphs or research/engagement profile. */
export const operationsSummarySchema = z.strictObject({
  generatedAt: timestampSchema,
  window: z.enum(["hour", "day"]),
  queuedJobs: z.int().min(0),
  failedJobs: z.int().min(0),
  pendingScans: z.int().min(0),
  pendingReports: z.int().min(0),
  overduePurges: z.int().min(0),
});

export type ModerationTarget = z.infer<typeof moderationTargetSchema>;
export type ReportCategory = z.infer<typeof reportCategorySchema>;
export type CreateAbuseReport = z.infer<typeof createAbuseReportSchema>;
export type AbuseReportReceipt = z.infer<typeof abuseReportReceiptSchema>;
export type ReportState = z.infer<typeof reportStateSchema>;
export type AdminReport = z.infer<typeof adminReportSchema>;
export type ReportQuery = z.input<typeof reportQuerySchema>;
export type AdminReportPage = z.infer<typeof adminReportPageSchema>;
export type ModerationActionKind = z.infer<typeof moderationActionKindSchema>;
export type CreateModerationAction = z.infer<
  typeof createModerationActionSchema
>;
export type ModerationAction = z.infer<typeof moderationActionSchema>;
export type ModerationNotice = z.infer<typeof moderationNoticeSchema>;
export type BudgetPeriod = z.infer<typeof budgetPeriodSchema>;
export type BudgetAllocation = z.infer<typeof budgetAllocationSchema>;
export type UsageRecord = z.infer<typeof usageRecordSchema>;
export type RuntimeUsageClaim = z.infer<typeof runtimeUsageClaimSchema>;
export type ReportUsage = z.infer<typeof reportUsageSchema>;
export type UsageReceipt = z.infer<typeof usageReceiptSchema>;
export type ActivityAction = z.infer<typeof activityActionSchema>;
export type ActivityTarget = z.infer<typeof activityTargetSchema>;
export type ActivityEvent = z.infer<typeof activityEventSchema>;
export type ActivityPage = z.infer<typeof activityPageSchema>;
export type OperationalJobKind = z.infer<typeof operationalJobKindSchema>;
export type OperationalJobState = z.infer<typeof operationalJobStateSchema>;
export type OperationalJobMetadata = z.infer<
  typeof operationalJobMetadataSchema
>;
export type OpsQuery = z.input<typeof opsQuerySchema>;
export type OperationsSummary = z.infer<typeof operationsSummarySchema>;
