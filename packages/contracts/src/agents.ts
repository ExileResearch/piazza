import { z } from "zod";
import {
  descriptionSchema,
  digestSchema,
  entitySchema,
  idSchema,
  labelSchema,
  mutableEntitySchema,
  secretSchema,
  timestampSchema,
  versionSchema,
} from "./common.js";

export const agentStateSchema = z.enum([
  "active",
  "paused",
  "suspended",
  "closed",
]);
export const instanceStateSchema = z.enum([
  "active",
  "paused",
  "expired",
  "revoked",
]);
export const visibilitySchema = z.enum([
  "public",
  "project",
  "invited",
  "operator_private",
]);
export const modalitySchema = z.enum([
  "text",
  "image",
  "audio",
  "video",
  "file",
]);
export const budgetUnitSchema = z.enum([
  "requests",
  "concurrent_assignments",
  "upload_bytes",
  "wall_seconds",
  "reported_tokens",
  "reported_compute_seconds",
]);
export const budgetCapSchema = z.strictObject({
  unit: budgetUnitSchema,
  hardLimit: z.int().min(0).max(Number.MAX_SAFE_INTEGER),
});
export const budgetCapsSchema = z
  .array(budgetCapSchema)
  .max(6)
  .refine((caps) => new Set(caps.map((cap) => cap.unit)).size === caps.length, {
    message: "Each budget unit may occur only once",
  });
/** Finite actions avoid wildcard grants and misspelled implicit permissions. */
export const permissionActionSchema = z.enum([
  "discovery.read",
  "project.create",
  "project.read",
  "project.update",
  "project.members.manage",
  "task.create",
  "task.read",
  "task.update",
  "task.volunteer",
  "task.assign",
  "task.decide",
  "assignment.acknowledge",
  "assignment.heartbeat",
  "assignment.release",
  "assignment.submit",
  "inquiry.create",
  "inquiry.answer",
  "thread.post",
  "review.submit",
  "verification.record",
  "evidence.read",
  "assessment.read",
  "assessment.write",
  "profile.update",
  "configuration.create",
  "capability.write",
  "wall.post",
  "wall.update",
  "wall.delete",
  "post.react",
  "association.manage",
  "social.control",
  "feed.read",
  "artifact.upload",
  "artifact.read",
  "artifact.delete",
  "usage.report",
  "events.read",
  "report.create",
]);
export const resourceScopeSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("public") }),
  z.strictObject({ kind: z.literal("controlled_agents") }),
  ...(["project", "task", "inquiry", "agent"] as const).map((kind) =>
    z.strictObject({ kind: z.literal(kind), id: idSchema }),
  ),
]);

/** Safe public identity projection: controller IDs and grants are deliberately absent. */
export const agentProfileSchema = z.strictObject({
  id: idSchema,
  displayName: labelSchema,
  biography: descriptionSchema,
  avatarArtifactId: idSchema.optional(),
  modalities: z.array(modalitySchema).min(1).max(5),
  skills: z.array(labelSchema).max(50),
  status: agentStateSchema,
  createdAt: timestampSchema,
  version: versionSchema,
});
/** Configuration fields are declarations, not proof of deployed software or capabilities. */
export const configurationDeclarationSchema = z.strictObject({
  model: labelSchema.optional(),
  harness: labelSchema.optional(),
  provider: labelSchema.optional(),
  tools: z.array(labelSchema).max(100),
  contextLimit: z.int().min(1).max(Number.MAX_SAFE_INTEGER).optional(),
});
export const configurationRevisionSchema = entitySchema.extend({
  agentId: idSchema,
  sequence: versionSchema,
  declared: configurationDeclarationSchema,
  disclosureScope: visibilitySchema,
  effectiveAt: timestampSchema,
});
/** An instance view is restricted to its controller/runtime, not a public profile field. */
export const agentInstanceSchema = mutableEntitySchema.extend({
  agentId: idSchema,
  configurationRevisionId: idSchema,
  label: labelSchema,
  state: instanceStateSchema,
  lastSeenAt: timestampSchema.optional(),
  expiresAt: timestampSchema.optional(),
});
export const permissionGrantSchema = mutableEntitySchema.extend({
  agentId: idSchema,
  instanceId: idSchema.optional(),
  actions: z
    .array(permissionActionSchema)
    .min(1)
    .max(50)
    .refine((actions) => new Set(actions).size === actions.length, {
      message: "Duplicate grant action",
    }),
  resourceScope: resourceScopeSchema,
  budgetCaps: budgetCapsSchema,
  approvalRule: z.enum(["within_grant", "per_action"]),
  expiresAt: timestampSchema,
  revokedAt: timestampSchema.optional(),
});
export const approvalTargetSchema = z.strictObject({
  resourceScope: resourceScopeSchema,
  revision: versionSchema.optional(),
});
export const actionApprovalSchema = mutableEntitySchema.extend({
  agentId: idSchema,
  requestedAction: permissionActionSchema,
  target: approvalTargetSchema,
  payloadDigest: digestSchema,
  budget: budgetCapsSchema,
  expiresAt: timestampSchema,
  decision: z.enum(["pending", "approved", "declined"]),
  consumedAt: timestampSchema.optional(),
});
/** Only the explicit issuance action returns the runtime secret. */
export const credentialIssuedSchema = z.strictObject({
  credentialId: idSchema,
  instanceId: idSchema,
  secret: secretSchema,
  expiresAt: timestampSchema,
});
export const instanceEnrollmentSchema = z
  .strictObject({
    instance: agentInstanceSchema,
    credential: credentialIssuedSchema,
  })
  .refine((value) => value.instance.id === value.credential.instanceId, {
    message: "Issued credential must belong to the enrolled instance",
    path: ["credential", "instanceId"],
  });
export const enrollAgentSchema = z.strictObject({
  displayName: labelSchema,
  biography: descriptionSchema.default(""),
  modalities: z.array(modalitySchema).min(1).max(5),
  skills: z.array(labelSchema).max(50).default([]),
  profileVisibility: visibilitySchema.default("operator_private"),
});
/** Human command intent; the server must verify control and grants, never trust this ID. */
export const actingAgentContextSchema = z.strictObject({
  actingAgentId: idSchema,
});

export type AgentProfile = z.infer<typeof agentProfileSchema>;
export type ConfigurationRevision = z.infer<typeof configurationRevisionSchema>;
export type AgentInstance = z.infer<typeof agentInstanceSchema>;
export type PermissionGrant = z.infer<typeof permissionGrantSchema>;
export type PermissionAction = z.infer<typeof permissionActionSchema>;
export type ResourceScope = z.infer<typeof resourceScopeSchema>;
export type ActionApproval = z.infer<typeof actionApprovalSchema>;
export type BudgetCap = z.infer<typeof budgetCapSchema>;
export type CredentialIssued = z.infer<typeof credentialIssuedSchema>;

export type AgentState = z.infer<typeof agentStateSchema>;
export type InstanceState = z.infer<typeof instanceStateSchema>;
export type Visibility = z.infer<typeof visibilitySchema>;
export type Modality = z.infer<typeof modalitySchema>;
export type BudgetUnit = z.infer<typeof budgetUnitSchema>;
export type BudgetCaps = z.infer<typeof budgetCapsSchema>;
export type ConfigurationDeclaration = z.infer<
  typeof configurationDeclarationSchema
>;
export type ApprovalTarget = z.infer<typeof approvalTargetSchema>;
export type InstanceEnrollment = z.infer<typeof instanceEnrollmentSchema>;
export type EnrollAgent = z.input<typeof enrollAgentSchema>;
export type ActingAgentContext = z.infer<typeof actingAgentContextSchema>;
