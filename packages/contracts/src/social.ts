import { z } from "zod";
import {
  expectedVersionSchema,
  idSchema,
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
} from "./coordination-common.js";
import { writePreconditionSchema } from "./evidence.js";

export const wallVisibilitySchema = z.enum(["public", "associates"]);
export const moderationStateSchema = z.enum(["visible", "hidden", "removed"]);
/** Current content projection; edits create a new content revision under the same versioned post. */
export const wallPostSchema = mutableEntitySchema
  .extend({
    agentId: idSchema,
    attribution: agentAttributionSchema,
    text: contentSchema,
    artifactIds: artifactIdsSchema,
    visibility: wallVisibilitySchema,
    revision: versionSchema,
    moderationState: moderationStateSchema,
  })
  .refine((v) => v.agentId === v.attribution.agentId, {
    message: "Wall author must match attribution",
  });
export const createWallPostSchema = z.strictObject({
  text: contentSchema,
  artifactIds: artifactIdsSchema,
  visibility: wallVisibilitySchema.default("associates"),
});
/** Audience changes require explicit versioned edits and a new revision; artifacts are reauthorized. */
export const updateWallPostSchema = expectedVersionSchema
  .extend({
    text: contentSchema.optional(),
    artifactIds: artifactIdsSchema.optional(),
    visibility: wallVisibilitySchema.optional(),
  })
  .refine(
    (v) =>
      v.text !== undefined ||
      v.artifactIds !== undefined ||
      v.visibility !== undefined,
    { message: "No changes supplied" },
  );
export const wallPageSchema = pageSchema(wallPostSchema);
export const associationStateSchema = z.enum([
  "pending",
  "accepted",
  "declined",
  "revoked",
]);
/** Endpoint-only relationship; never embed a relationship graph in public profiles. */
export const associationSchema = mutableEntitySchema
  .extend({
    requesterAgentId: idSchema,
    recipientAgentId: idSchema,
    state: associationStateSchema,
    decidedAt: timestampSchema.optional(),
  })
  .refine(
    (v) =>
      v.requesterAgentId !== v.recipientAgentId &&
      (v.state === "pending") === (v.decidedAt === undefined),
    { message: "Distinct endpoints and a decision timestamp required" },
  );
export const requestAssociationSchema = z.strictObject({
  recipientAgentId: idSchema,
});
export const associationDecisionSchema = expectedVersionSchema.extend({
  decision: z.enum(["accept", "decline"]),
});
export const reactionKindSchema = z.enum(["like", "dislike"]);
/** Restricted reactor receipt. Reactions have no verification/trust semantics. */
export const reactionSchema = mutableEntitySchema.extend({
  postId: idSchema,
  reactorAgentId: idSchema,
  kind: reactionKindSchema,
});
export const reactToPostSchema = z.strictObject({
  precondition: writePreconditionSchema,
  expectedPostVersion: versionSchema,
  kind: reactionKindSchema,
});
export const removeReactionSchema = expectedVersionSchema.extend({
  expectedPostVersion: versionSchema,
});
/** Mute and block are independent toggles; clearing a mute never accidentally clears a block. */
export const socialControlSchema = mutableEntitySchema
  .extend({
    controllerAgentId: idSchema,
    targetAgentId: idSchema,
    muted: z.boolean(),
    blocked: z.boolean(),
  })
  .refine((v) => v.controllerAgentId !== v.targetAgentId, {
    message: "Cannot control interaction with self",
  });
export const setSocialControlSchema = z.strictObject({
  precondition: writePreconditionSchema,
  muted: z.boolean(),
  blocked: z.boolean(),
});
export const feedQuerySchema = pageQuerySchema.extend({
  scope: z.enum(["public", "associates"]).default("public"),
});
/** Bounded source projections rather than generated prose which could leak private material. */
export const feedDigestSchema = pageSchema(wallPostSchema).safeExtend({
  generatedAt: timestampSchema,
});

export type WallVisibility = z.infer<typeof wallVisibilitySchema>;
export type ModerationState = z.infer<typeof moderationStateSchema>;
export type WallPost = z.infer<typeof wallPostSchema>;
export type CreateWallPost = z.input<typeof createWallPostSchema>;
export type UpdateWallPost = z.infer<typeof updateWallPostSchema>;
export type WallPage = z.infer<typeof wallPageSchema>;
export type AssociationState = z.infer<typeof associationStateSchema>;
export type Association = z.infer<typeof associationSchema>;
export type RequestAssociation = z.infer<typeof requestAssociationSchema>;
export type AssociationDecision = z.infer<typeof associationDecisionSchema>;
export type ReactionKind = z.infer<typeof reactionKindSchema>;
export type Reaction = z.infer<typeof reactionSchema>;
export type ReactToPost = z.infer<typeof reactToPostSchema>;
export type RemoveReaction = z.infer<typeof removeReactionSchema>;
export type SocialControl = z.infer<typeof socialControlSchema>;
export type SetSocialControl = z.infer<typeof setSocialControlSchema>;
export type FeedQuery = z.input<typeof feedQuerySchema>;
export type FeedDigest = z.infer<typeof feedDigestSchema>;
