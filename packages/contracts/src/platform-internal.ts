/** Server-only records. These are never endpoint response schemas or client command bodies. */
import { z } from "zod";
import { authenticatedActorSchema } from "./actors-internal.js";
import {
  artifactParentSchema,
  artifactMimeSchema,
  scanOutcomeSchema,
} from "./artifacts.js";
import { emailSchema } from "./auth.js";
import {
  apiErrorCodeSchema,
  digestSchema,
  expectedVersionSchema,
  idSchema,
  labelSchema,
  localeSchema,
  mutableEntitySchema,
  timestampSchema,
  versionSchema,
} from "./common.js";
import { immutableFields } from "./coordination-common.js";
import { artifactMetadataSchema } from "./discussion.js";
import {
  activityEventSchema,
  adminReportSchema,
  budgetAllocationSchema,
  moderationActionSchema,
  moderationTargetSchema,
  operationalJobMetadataSchema,
} from "./operations.js";
import {
  consentStateSchema,
  exportEntrySchema,
  exportJobSchema,
  publicFormExpiresAt,
} from "./privacy.js";
import { resourceReferenceSchema } from "./events.js";
import { idempotencyKeySchema } from "./transport.js";

const storedArtifactParentSchema = z.union([
  artifactParentSchema,
  z.strictObject({ kind: z.literal("account_export"), id: idSchema }),
]);
export const artifactRecordSchema = artifactMetadataSchema
  .extend({
    userId: idSchema,
    agentId: idSchema.optional(),
    opaqueStorageRef: z.string().min(1).max(512),
    hash: digestSchema,
    parentRefs: z
      .array(storedArtifactParentSchema)
      .min(1)
      .max(10)
      .refine(
        (v) => new Set(v.map((p) => `${p.kind}:${p.id}`)).size === v.length,
      ),
    purpose: z.enum(["attachment", "avatar", "account_export"]),
    avatarModeration: z.enum([
      "not_required",
      "pending",
      "approved",
      "rejected",
    ]),
    scanRevision: versionSchema,
    expiresAt: timestampSchema.optional(),
  })
  .refine(
    (v) =>
      (v.purpose === "avatar"
        ? v.avatarModeration !== "not_required" &&
          !!v.agentId &&
          v.parentRefs.length === 1 &&
          v.parentRefs[0]?.kind === "agent" &&
          v.parentRefs[0].id === v.agentId &&
          ["image/png", "image/jpeg", "image/webp"].includes(v.mime)
        : v.avatarModeration === "not_required") &&
      (v.purpose === "account_export"
        ? v.parentRefs.length === 1 &&
          v.parentRefs[0]?.kind === "account_export" &&
          !!v.expiresAt &&
          v.mime === "application/json"
        : !!v.agentId &&
          v.parentRefs.every((p) => p.kind !== "account_export")),
    { message: "Artifact purpose, ownership and parent binding must agree" },
  );
export const artifactScanCommandSchema = expectedVersionSchema.extend({
  outcome: scanOutcomeSchema,
  scanRevision: versionSchema,
  scannedAt: timestampSchema,
});
export const artifactUploadFactsSchema = z.strictObject({
  parentVersion: versionSchema,
  readableParents: z.array(storedArtifactParentSchema).max(10),
  measuredMime: artifactMimeSchema,
  measuredBytes: z.int().min(1).max(Number.MAX_SAFE_INTEGER),
  remainingUploadBytes: z.int().min(0).max(Number.MAX_SAFE_INTEGER),
});
export const artifactReadFactsSchema = z.strictObject({
  actor: z.union([
    authenticatedActorSchema,
    z.strictObject({ kind: z.literal("anonymous") }),
  ]),
  readableParents: z.array(storedArtifactParentSchema).max(10),
  now: timestampSchema,
});
export const abuseReportRecordSchema = adminReportSchema.extend({
  reporter: z.discriminatedUnion("kind", [
    z.strictObject({ kind: z.literal("human"), userId: idSchema }),
    z.strictObject({
      kind: z.literal("agent"),
      agentId: idSchema,
      userId: idSchema,
    }),
  ]),
});
export const moderationActionRecordSchema = moderationActionSchema.extend({
  adminUserId: idSchema,
});
export const budgetAllocationRecordSchema = budgetAllocationSchema.safeExtend({
  userId: idSchema,
  grantId: idSchema.optional(),
});
export const auditActorSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("human"), userId: idSchema }),
  z.strictObject({
    kind: z.literal("agent"),
    agentId: idSchema,
    instanceId: idSchema,
    userId: idSchema,
  }),
  z.strictObject({ kind: z.literal("system"), jobId: idSchema.optional() }),
]);
export const auditEventSchema = activityEventSchema.extend({
  actor: auditActorSchema,
  controllerUserId: idSchema.optional(),
});
export const consentRecordSchema = consentStateSchema.extend({
  subject: z.discriminatedUnion("kind", [
    z.strictObject({ kind: z.literal("account"), userId: idSchema }),
    z.strictObject({ kind: z.literal("public_form"), submissionId: idSchema }),
  ]),
});
/** Only admitted requests persist identifiers; bot/honeypot suppression retains no raw field values. */
export const publicFormSubmissionSchema = z
  .strictObject({
    ...immutableFields,
    email: emailSchema,
    locale: localeSchema,
    purpose: z.literal("updates"),
    consentVersion: labelSchema,
    consent: z.literal(true),
    expiresAt: timestampSchema,
  })
  .refine((v) => v.expiresAt === publicFormExpiresAt(v.createdAt), {
    message: "Public form identifiers expire after 24 calendar months",
  });
// Explicit union extension keeps strict variants and the public expiry refinement.
export const accountExportRecordSchema = z
  .discriminatedUnion("state", [
    exportJobSchema.options[0].extend({ userId: idSchema }),
    ...exportJobSchema.options
      .slice(1)
      .map((option) => option.extend({ userId: idSchema })),
  ])
  .refine((v) => {
    const { userId, ...projection } = v;
    return exportJobSchema.safeParse(projection).success;
  });
export const operationalJobSchema = operationalJobMetadataSchema.safeExtend({
  opaquePayloadRef: z.string().regex(/^[A-Za-z0-9_-]{16,128}$/),
  dedupeKey: idempotencyKeySchema,
  target: moderationTargetSchema.optional(),
  ownerUserId: idSchema.optional(),
});
export const idempotencyReceiptSchema = mutableEntitySchema
  .extend({
    actor: auditActorSchema,
    operationId: z.string().regex(/^[a-z][a-zA-Z0-9]{0,119}$/),
    target: resourceReferenceSchema.optional(),
    key: idempotencyKeySchema,
    payloadDigest: digestSchema,
    expiresAt: timestampSchema,
    result: z.discriminatedUnion("state", [
      z.strictObject({ state: z.literal("pending") }),
      z.strictObject({
        state: z.literal("applied"),
        reference: resourceReferenceSchema,
      }),
      z.strictObject({
        state: z.literal("applied_secret_issuance"),
        nextAction: z.enum([
          "rotate_credential",
          "restart_factor_enrollment",
          "reauthenticate",
        ]),
      }),
      z.strictObject({ state: z.literal("failed"), code: apiErrorCodeSchema }),
    ]),
  })
  .refine((v) => Date.parse(v.expiresAt) > Date.parse(v.createdAt), {
    message: "Receipt retention must be positive",
  });
export const humanOperationSchema = z.enum([
  "account.export",
  "account.close",
  "export.read",
  "consent.decide",
  "moderation.apply",
  "admin.read",
  "report.create",
]);
export const verifiedStepUpSchema = z.strictObject({
  userId: idSchema,
  sessionId: idSchema,
  operation: humanOperationSchema,
  payloadDigest: digestSchema,
  expiresAt: timestampSchema,
  consumedAt: timestampSchema.optional(),
});
export const humanOperationFactsSchema = z.strictObject({
  actor: authenticatedActorSchema,
  sessionActive: z.boolean(),
  accountActive: z.boolean(),
  resourceUserId: idSchema.optional(),
  now: timestampSchema,
  payloadDigest: digestSchema,
  stepUp: verifiedStepUpSchema.optional(),
});
export const ownedExportEntrySchema = z.strictObject({
  userId: idSchema,
  entry: exportEntrySchema,
});
export const purgeComponentSchema = z.enum([
  "account",
  "collaboration",
  "objects",
  "indexes",
  "jobs",
  "restore_erasure",
]);
export const accountErasureRecordSchema = mutableEntitySchema
  .extend({
    userId: idSchema,
    closedAt: timestampSchema,
    purgeDueAt: timestampSchema,
    completed: z
      .array(
        z.strictObject({
          component: purgeComponentSchema,
          method: z.enum(["delete", "irreversibly_anonymize"]),
          completedAt: timestampSchema,
        }),
      )
      .max(6)
      .refine(
        (items) => new Set(items.map((v) => v.component)).size === items.length,
      ),
    state: z.enum(["pending", "running", "completed", "failed"]),
  })
  .refine(
    (v) =>
      Date.parse(v.purgeDueAt) <= Date.parse(v.closedAt) + 30 * 86_400_000 &&
      Date.parse(v.purgeDueAt) >= Date.parse(v.closedAt) &&
      v.completed.every(
        (c) => Date.parse(c.completedAt) >= Date.parse(v.closedAt),
      ) &&
      (v.state !== "completed" || v.completed.length === 6),
    {
      message:
        "Erasure is not complete until every component has been addressed",
    },
  );

export type ArtifactRecord = z.infer<typeof artifactRecordSchema>;
export type ArtifactScanCommand = z.infer<typeof artifactScanCommandSchema>;
export type ArtifactUploadFacts = z.infer<typeof artifactUploadFactsSchema>;
export type ArtifactReadFacts = z.infer<typeof artifactReadFactsSchema>;
export type AbuseReportRecord = z.infer<typeof abuseReportRecordSchema>;
export type ModerationActionRecord = z.infer<
  typeof moderationActionRecordSchema
>;
export type BudgetAllocationRecord = z.infer<
  typeof budgetAllocationRecordSchema
>;
export type AuditActor = z.infer<typeof auditActorSchema>;
export type AuditEvent = z.infer<typeof auditEventSchema>;
export type ConsentRecord = z.infer<typeof consentRecordSchema>;
export type PublicFormSubmission = z.infer<typeof publicFormSubmissionSchema>;
export type AccountExportRecord = z.infer<typeof accountExportRecordSchema>;
export type OperationalJob = z.infer<typeof operationalJobSchema>;
export type IdempotencyReceipt = z.infer<typeof idempotencyReceiptSchema>;
export type HumanOperation = z.infer<typeof humanOperationSchema>;
export type VerifiedStepUp = z.infer<typeof verifiedStepUpSchema>;
export type HumanOperationFacts = z.infer<typeof humanOperationFactsSchema>;
export type OwnedExportEntry = z.infer<typeof ownedExportEntrySchema>;
export type AccountErasureRecord = z.infer<typeof accountErasureRecordSchema>;
