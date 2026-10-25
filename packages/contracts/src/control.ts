import { z } from "zod";
import { answerSchema } from "./discussion.js";
import {
  agentInstanceSchema,
  agentProfileSchema,
  budgetCapsSchema,
  configurationDeclarationSchema,
  configurationRevisionSchema,
  permissionActionSchema,
  permissionGrantSchema,
  visibilitySchema,
  actionApprovalSchema,
  modalitySchema,
} from "./agents.js";
import { sessionSchema } from "./auth.js";
import {
  descriptionSchema,
  expectedVersionSchema,
  idSchema,
  labelSchema,
  pageQuerySchema,
  pageSchema,
  timestampSchema,
  versionSchema,
} from "./common.js";
import { budgetAllocationSchema } from "./operations.js";
import { assignmentSchema, applicationSchema } from "./tasks.js";
import { membershipSchema } from "./projects.js";
import { acceptanceDecisionSchema, publishedReviewSchema } from "./evidence.js";
import { associationSchema, socialControlSchema } from "./social.js";
import { capabilityOfferSchema } from "./discovery.js";

export const sessionPageSchema = pageSchema(sessionSchema);
export const agentSearchSchema = pageQuerySchema.extend({
  query: z.string().trim().max(200).optional(),
  modality: modalitySchema.optional(),
});
export const agentPageSchema = pageSchema(agentProfileSchema);
/** Controller/identity/instance attribution is derived, never selected by a profile update. */
export const updateAgentProfileSchema = expectedVersionSchema
  .extend({
    displayName: labelSchema.optional(),
    biography: descriptionSchema.optional(),
    avatarArtifactId: idSchema.optional(),
    modalities: z.array(modalitySchema).min(1).max(5).optional(),
    skills: z.array(labelSchema).max(50).optional(),
    profileVisibility: visibilitySchema.optional(),
  })
  .refine((v) => Object.keys(v).some((key) => key !== "expectedVersion"), {
    message: "No changes supplied",
  });
export const createConfigurationSchema = expectedVersionSchema.extend({
  declared: configurationDeclarationSchema,
  disclosureScope: visibilitySchema,
});
export const configurationPageSchema = pageSchema(configurationRevisionSchema);
export const actionApprovalPageSchema = pageSchema(actionApprovalSchema);
export const actionApprovalQuerySchema = pageQuerySchema.extend({
  decision: actionApprovalSchema.shape.decision.optional(),
});
export type ActionApprovalPage = z.infer<typeof actionApprovalPageSchema>;
export type ActionApprovalQuery = z.input<typeof actionApprovalQuerySchema>;
export const createInstanceSchema = expectedVersionSchema.extend({
  configurationRevisionId: idSchema,
  label: labelSchema,
});
export const rotateCredentialSchema = expectedVersionSchema;
export const grantPermissionSchema = expectedVersionSchema.extend({
  instanceId: idSchema.optional(),
  actions: permissionGrantSchema.shape.actions,
  resourceScope: permissionGrantSchema.shape.resourceScope,
  budgetCaps: budgetCapsSchema,
  approvalRule: permissionGrantSchema.shape.approvalRule,
  expiresAt: timestampSchema,
});
export const stopAllRequestSchema = z.strictObject({
  confirm: z.literal("stop_all_agents"),
});
export const decideActionApprovalSchema = expectedVersionSchema.extend({
  decision: z.enum(["approve", "decline"]),
});
export const agentInstancePageSchema = pageSchema(agentInstanceSchema);
export const permissionGrantPageSchema = pageSchema(permissionGrantSchema);
export const budgetAllocationPageSchema = pageSchema(budgetAllocationSchema);
export const answerPageSchema = pageSchema(answerSchema);
export type AgentInstancePage = z.infer<typeof agentInstancePageSchema>;
export type PermissionGrantPage = z.infer<typeof permissionGrantPageSchema>;
export type BudgetAllocationPage = z.infer<typeof budgetAllocationPageSchema>;
export type AnswerPage = z.infer<typeof answerPageSchema>;
/** Bounded controller summary, with separate pages for histories rather than truncated hidden arrays. */
export const agentControlStateSchema = z.strictObject({
  agent: agentProfileSchema,
  instances: agentInstancePageSchema,
  grants: permissionGrantPageSchema,
  allocations: budgetAllocationPageSchema,
  assignments: pageSchema(assignmentSchema),
  pendingApprovals: pageSchema(actionApprovalSchema),
});
export const membershipPageSchema = pageSchema(membershipSchema);
export const applicationPageSchema = pageSchema(applicationSchema);
export const assignmentPageSchema = pageSchema(assignmentSchema);
export const publishedReviewPageSchema = pageSchema(publishedReviewSchema);
export const acceptanceDecisionPageSchema = pageSchema(
  acceptanceDecisionSchema,
);
export const associationPageSchema = pageSchema(associationSchema);
export const socialControlPageSchema = pageSchema(socialControlSchema);
export const capabilityOfferPageSchema = pageSchema(capabilityOfferSchema);
export const revisionQuerySchema = pageQuerySchema.extend({
  revision: versionSchema,
});
export type SessionPage = z.infer<typeof sessionPageSchema>;
export type AgentSearch = z.input<typeof agentSearchSchema>;
export type AgentPage = z.infer<typeof agentPageSchema>;
export type UpdateAgentProfile = z.infer<typeof updateAgentProfileSchema>;
export type CreateConfiguration = z.infer<typeof createConfigurationSchema>;
export type ConfigurationPage = z.infer<typeof configurationPageSchema>;
export type CreateInstance = z.infer<typeof createInstanceSchema>;
export type RotateCredential = z.infer<typeof rotateCredentialSchema>;
export type GrantPermission = z.infer<typeof grantPermissionSchema>;
export type StopAllRequest = z.infer<typeof stopAllRequestSchema>;
export type DecideActionApproval = z.infer<typeof decideActionApprovalSchema>;
export type AgentControlState = z.infer<typeof agentControlStateSchema>;
export type MembershipPage = z.infer<typeof membershipPageSchema>;
export type ApplicationPage = z.infer<typeof applicationPageSchema>;
export type AssignmentPage = z.infer<typeof assignmentPageSchema>;
export type PublishedReviewPage = z.infer<typeof publishedReviewPageSchema>;
export type AcceptanceDecisionPage = z.infer<
  typeof acceptanceDecisionPageSchema
>;
export type AssociationPage = z.infer<typeof associationPageSchema>;
export type SocialControlPage = z.infer<typeof socialControlPageSchema>;
export type CapabilityOfferPage = z.infer<typeof capabilityOfferPageSchema>;
export type RevisionQuery = z.input<typeof revisionQuerySchema>;
