import { z } from "zod";
import { visibilitySchema } from "./agents.js";
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
  contentSchema,
  evidenceReferencesSchema,
  evidenceTargetSchema,
  evidenceTargetsSchema,
  immutableFields,
  notesSchema,
  revisionRefSchema,
} from "./coordination-common.js";

export const reviewRequestStateSchema = z.enum([
  "requested",
  "accepted",
  "submitted",
  "declined",
  "expired",
]);
export const reviewOutcomeSchema = z.enum([
  "approve",
  "changes_requested",
  "reject",
  "inconclusive",
]);
export const independenceDeclarationSchema = z.strictObject({
  basis: z.literal("self_declared"),
  relationship: z.enum([
    "same_operator",
    "shared_sources",
    "no_known_relationship",
    "unknown",
  ]),
  details: z.string().max(2_000),
});
export const reviewFindingsSchema = z.strictObject({
  method: contentSchema,
  findings: contentSchema,
  outcome: reviewOutcomeSchema,
  conflicts: notesSchema,
  independence: independenceDeclarationSchema,
  configurationRevisionId: idSchema,
});
export const reviewSchema = mutableEntitySchema
  .extend({
    submission: revisionRefSchema,
    reviewerAgentId: idSchema,
    requestState: reviewRequestStateSchema,
    expiresAt: timestampSchema,
    result: reviewFindingsSchema.optional(),
  })
  .refine(
    (v) => (v.requestState === "submitted") === (v.result !== undefined),
    {
      message: "Only a submitted review contains findings",
      path: ["result"],
    },
  );
export const requestReviewsSchema = expectedVersionSchema.extend({
  submissionRevision: versionSchema,
  reviewerAgentIds: z
    .array(idSchema)
    .min(1)
    .max(10)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Distinct reviewer identities required",
    }),
  expiresAt: timestampSchema,
});
/** Task-audience projection of completed findings, excluding invitation status/expiry metadata. */
export const publishedReviewSchema = z.strictObject({
  ...immutableFields,
  submission: revisionRefSchema,
  reviewerAgentId: idSchema,
  result: reviewFindingsSchema,
});
export const reviewInvitationResponseSchema = expectedVersionSchema.extend({
  response: z.enum(["accept", "decline"]),
});
export const submitReviewSchema = expectedVersionSchema.extend({
  submissionRevision: versionSchema,
  result: reviewFindingsSchema.omit({ configurationRevisionId: true }),
});
export const reviewRequestPageSchema = pageSchema(reviewSchema);
export const verificationOutcomeSchema = z.enum([
  "pass",
  "fail",
  "mixed",
  "inconclusive",
]);
const verificationFields = {
  target: evidenceTargetSchema,
  claimScope: contentSchema,
  method: contentSchema,
  inputs: evidenceReferencesSchema,
  environment: contentSchema,
  observations: contentSchema,
  outcome: verificationOutcomeSchema,
  limitations: notesSchema,
  independence: independenceDeclarationSchema,
};
/** Acceptance status is deliberately absent; a verification establishes only its stated scope. */
export const verificationSchema = z.strictObject({
  ...immutableFields,
  ...verificationFields,
  attribution: agentAttributionSchema,
});
export const recordVerificationSchema = z.strictObject({
  ...verificationFields,
  inputs: evidenceTargetsSchema,
});
export const acceptanceDecisionKindSchema = z.enum([
  "accept",
  "reject",
  "changes_requested",
]);
export const acceptanceDecisionSchema = z.strictObject({
  ...immutableFields,
  taskId: idSchema,
  submission: revisionRefSchema,
  attribution: agentAttributionSchema,
  decision: acceptanceDecisionKindSchema,
  rationale: contentSchema,
  supersedesId: idSchema.optional(),
});
export const decideAcceptanceSchema = expectedVersionSchema.extend({
  submission: revisionRefSchema,
  decision: acceptanceDecisionKindSchema,
  rationale: contentSchema,
  supersedesId: idSchema.optional(),
});
export const observationSchema = z.strictObject({
  ...immutableFields,
  subjectAgentId: idSchema,
  target: evidenceTargetSchema,
  sourceAgentId: idSchema.optional(),
  evidenceKind: z.enum(["declaration", "observation"]),
  provenance: z.strictObject({
    origin: z.enum(["platform_record", "participant_report"]),
    methodVersion: labelSchema,
    sources: evidenceReferencesSchema,
  }),
  statement: contentSchema,
  observedAt: timestampSchema,
  disclosureScope: visibilitySchema,
});
export const assessmentDimensionSchema = z.enum([
  "identity_confidence",
  "factual_reliability",
  "technical_competence",
  "behavioural_reliability",
  "interaction_style",
  "behavioural_variability",
  "observed_harmful_behaviour",
  "commitment_adherence",
]);
export const configurationScopeSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("exact"),
    configurationRevisionId: idSchema,
  }),
  z.strictObject({ kind: z.literal("unknown") }),
]);
export const assessmentJudgmentSchema = z.strictObject({
  dimension: assessmentDimensionSchema,
  judgment: contentSchema,
  uncertainty: z.enum(["unknown", "high", "moderate", "low"]),
});
export const assessmentJudgmentsSchema = z
  .array(assessmentJudgmentSchema)
  .min(1)
  .max(8)
  .refine(
    (items) => new Set(items.map((v) => v.dimension)).size === items.length,
    { message: "Duplicate assessment dimension" },
  );
/** Observer/controller-only DTO. No public variant or universal score is exported. */
export const localAssessmentSchema = mutableEntitySchema.extend({
  observerAgentId: idSchema,
  subjectAgentId: idSchema,
  domain: labelSchema,
  configurationScope: configurationScopeSchema,
  judgments: assessmentJudgmentsSchema,
  evidenceRefs: evidenceReferencesSchema,
  methodVersion: labelSchema,
  assessedAt: timestampSchema,
});
/** Conditional creation avoids invented version zero and unguarded PUT upserts. */
export const writePreconditionSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("absent") }),
  z.strictObject({
    kind: z.literal("version"),
    expectedVersion: versionSchema,
  }),
]);
export const saveAssessmentSchema = z.strictObject({
  precondition: writePreconditionSchema,
  domain: labelSchema,
  configurationScope: configurationScopeSchema,
  judgments: assessmentJudgmentsSchema,
  evidenceTargets: evidenceTargetsSchema,
  methodVersion: labelSchema,
});
export const assessmentQuerySchema = pageQuerySchema.extend({
  domain: labelSchema.optional(),
});
export const assessmentDeleteSchema = expectedVersionSchema.extend({
  domain: labelSchema,
  configurationScope: configurationScopeSchema,
});
export const assessmentPageSchema = pageSchema(localAssessmentSchema);
/** Evidence listing never unions in the private assessment schema. */
export const evidenceItemSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("observation"), value: observationSchema }),
  z.strictObject({
    kind: z.literal("verification"),
    value: verificationSchema,
  }),
]);
export const evidenceQuerySchema = pageQuerySchema.extend({
  subjectAgentId: idSchema.optional(),
  target: evidenceTargetSchema.optional(),
});
export const evidencePageSchema = pageSchema(evidenceItemSchema);

export type Review = z.infer<typeof reviewSchema>;
export type PublishedReview = z.infer<typeof publishedReviewSchema>;
export type ReviewRequestState = z.infer<typeof reviewRequestStateSchema>;
export type ReviewOutcome = z.infer<typeof reviewOutcomeSchema>;
export type ReviewFindings = z.infer<typeof reviewFindingsSchema>;
export type RequestReviews = z.infer<typeof requestReviewsSchema>;
export type ReviewInvitationResponse = z.infer<
  typeof reviewInvitationResponseSchema
>;
export type SubmitReview = z.infer<typeof submitReviewSchema>;
export type ReviewRequestPage = z.infer<typeof reviewRequestPageSchema>;
export type Verification = z.infer<typeof verificationSchema>;
export type VerificationOutcome = z.infer<typeof verificationOutcomeSchema>;
export type RecordVerification = z.infer<typeof recordVerificationSchema>;
export type AcceptanceDecision = z.infer<typeof acceptanceDecisionSchema>;
export type DecideAcceptance = z.infer<typeof decideAcceptanceSchema>;
export type AcceptanceDecisionKind = z.infer<
  typeof acceptanceDecisionKindSchema
>;
export type Observation = z.infer<typeof observationSchema>;
export type LocalAssessment = z.infer<typeof localAssessmentSchema>;
export type SaveAssessment = z.infer<typeof saveAssessmentSchema>;
export type AssessmentQuery = z.input<typeof assessmentQuerySchema>;
export type AssessmentDelete = z.infer<typeof assessmentDeleteSchema>;
export type AssessmentPage = z.infer<typeof assessmentPageSchema>;
export type ConfigurationScope = z.infer<typeof configurationScopeSchema>;
export type EvidenceQuery = z.input<typeof evidenceQuerySchema>;
export type EvidencePage = z.infer<typeof evidencePageSchema>;
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
export type IndependenceDeclaration = z.infer<
  typeof independenceDeclarationSchema
>;
export type WritePrecondition = z.infer<typeof writePreconditionSchema>;
