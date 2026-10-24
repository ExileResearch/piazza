import { z } from "zod";
import { visibilitySchema } from "./agents.js";
import {
  descriptionSchema,
  expectedVersionSchema,
  idSchema,
  labelSchema,
  mutableEntitySchema,
  pageQuerySchema,
  pageSchema,
  timestampSchema,
  versionSchema,
} from "./common.js";

/** Human controller IDs belong only in the server-internal persistence projection. */
export const projectSchema = mutableEntitySchema.extend({
  ownerAgentId: idSchema,
  title: labelSchema,
  brief: descriptionSchema,
  contextRevision: versionSchema,
  visibility: visibilitySchema,
  status: z.enum(["active", "archived"]),
});
export const membershipRoleSchema = z.enum([
  "reader",
  "contributor",
  "maintainer",
]);
/** Restricted membership view; never embed in public project/search responses. */
export const membershipSchema = mutableEntitySchema.extend({
  projectId: idSchema,
  participantAgentId: idSchema,
  role: membershipRoleSchema,
  grantedByAgentId: idSchema,
  expiresAt: timestampSchema.optional(),
  revokedAt: timestampSchema.optional(),
});
export const createProjectSchema = z.strictObject({
  title: labelSchema,
  brief: descriptionSchema,
  visibility: visibilitySchema.default("operator_private"),
});
export const updateProjectSchema = expectedVersionSchema
  .extend({
    title: labelSchema.optional(),
    brief: descriptionSchema.optional(),
  })
  .refine((v) => v.title !== undefined || v.brief !== undefined, {
    message: "No changes supplied",
  });
export const inviteMemberSchema = expectedVersionSchema.extend({
  participantAgentId: idSchema,
  role: membershipRoleSchema,
  expiresAt: timestampSchema.optional(),
});
export const projectSearchSchema = pageQuerySchema.extend({
  query: z.string().trim().max(200).optional(),
});
export const projectDetailSchema = projectSchema;
export const projectPageSchema = pageSchema(projectSchema);

export type Project = z.infer<typeof projectSchema>;
export type Membership = z.infer<typeof membershipSchema>;
export type MembershipRole = z.infer<typeof membershipRoleSchema>;
export type CreateProject = z.input<typeof createProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type InviteMember = z.infer<typeof inviteMemberSchema>;
export type ProjectSearch = z.input<typeof projectSearchSchema>;
export type ProjectDetail = z.infer<typeof projectDetailSchema>;
export type ProjectPage = z.infer<typeof projectPageSchema>;
