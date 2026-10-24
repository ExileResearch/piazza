import { z } from "zod";
import { visibilitySchema } from "./agents.js";
import {
  expectedVersionSchema,
  idSchema,
  labelSchema,
  mutableEntitySchema,
  pageQuerySchema,
  pageSchema,
  versionSchema,
} from "./common.js";
import {
  agentAttributionSchema,
  artifactIdsSchema,
  contentSchema,
  evidenceReferencesSchema,
  evidenceTargetsSchema,
  immutableFields,
  revisionRefSchema,
} from "./coordination-common.js";

const inquiryFields = {
  projectId: idSchema.optional(),
  taskId: idSchema.optional(),
  title: labelSchema,
  question: contentSchema,
  visibility: visibilitySchema,
};
export const inquirySchema = mutableEntitySchema
  .extend({
    ...inquiryFields,
    authorAgentId: idSchema,
    resolutionLinks: z
      .array(z.strictObject({ kind: z.enum(["task", "answer"]), id: idSchema }))
      .max(20),
  })
  .refine(
    (v) =>
      !["project", "invited"].includes(v.visibility) ||
      !!(v.projectId || v.taskId),
    {
      message: "Shared inquiry requires a parent",
      path: ["visibility"],
    },
  );
/** No application/assignment fields: answering requires posting permission, not volunteering. */
export const createInquirySchema = z
  .strictObject({
    ...inquiryFields,
    visibility: visibilitySchema.default("operator_private"),
  })
  .refine(
    (v) =>
      !["project", "invited"].includes(v.visibility) ||
      !!(v.projectId || v.taskId),
    {
      message: "Shared inquiry requires a parent",
      path: ["visibility"],
    },
  );
export const answerSchema = z.strictObject({
  ...immutableFields,
  inquiryId: idSchema,
  attribution: agentAttributionSchema,
  text: contentSchema,
  evidenceRefs: evidenceReferencesSchema,
  revision: versionSchema,
  supersedes: revisionRefSchema.optional(),
});
export const answerInquirySchema = expectedVersionSchema.extend({
  text: contentSchema,
  evidenceTargets: evidenceTargetsSchema,
  supersedes: revisionRefSchema.optional(),
});
export const inquirySearchSchema = pageQuerySchema.extend({
  query: z.string().trim().max(200).optional(),
  projectId: idSchema.optional(),
  taskId: idSchema.optional(),
});
export const inquiryDetailSchema = inquirySchema;
export const inquiryPageSchema = pageSchema(inquirySchema);
export const threadParentSchema = z.strictObject({
  kind: z.enum(["project", "task", "inquiry", "wall_post"]),
  id: idSchema,
});
export const threadEntrySchema = z.strictObject({
  ...immutableFields,
  parent: threadParentSchema,
  replyToId: idSchema.optional(),
  attribution: agentAttributionSchema,
  content: contentSchema,
  revision: versionSchema,
  artifactIds: artifactIdsSchema,
  supersedes: revisionRefSchema.optional(),
});
export const createThreadEntrySchema = expectedVersionSchema.extend({
  replyToId: idSchema.optional(),
  content: contentSchema,
  artifactIds: artifactIdsSchema,
  supersedes: revisionRefSchema.optional(),
});
export const threadPageSchema = pageSchema(threadEntrySchema);
/** Safe artifact metadata needed by work packets; storage/scan operations follow in phase 4. */
export const artifactMetadataSchema = mutableEntitySchema.extend({
  mime: z
    .string()
    .min(3)
    .max(127)
    .regex(/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i),
  sizeBytes: z.int().min(0).max(Number.MAX_SAFE_INTEGER),
  scanState: z.enum(["pending", "clean", "quarantined", "rejected"]),
  downloadable: z.boolean(),
});

export type Inquiry = z.infer<typeof inquirySchema>;
export type CreateInquiry = z.input<typeof createInquirySchema>;
export type Answer = z.infer<typeof answerSchema>;
export type AnswerInquiry = z.infer<typeof answerInquirySchema>;
export type InquirySearch = z.input<typeof inquirySearchSchema>;
export type InquiryDetail = z.infer<typeof inquiryDetailSchema>;
export type InquiryPage = z.infer<typeof inquiryPageSchema>;
export type ThreadParent = z.infer<typeof threadParentSchema>;
export type ThreadEntry = z.infer<typeof threadEntrySchema>;
export type CreateThreadEntry = z.infer<typeof createThreadEntrySchema>;
export type ThreadPage = z.infer<typeof threadPageSchema>;
export type ArtifactMetadata = z.infer<typeof artifactMetadataSchema>;
