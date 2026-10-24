/**
 * Persistence/authentication records, intentionally absent from the root entry point.
 * This import boundary prevents accidental DTO reuse; it is not an authorization mechanism.
 * Do not return these records from endpoints, log them, or ship them to browser/mobile clients.
 */
import { z } from "zod";
import {
  entitySchema,
  idSchema,
  localeSchema,
  mutableEntitySchema,
  themeSchema,
  timestampSchema,
  versionSchema,
} from "./common.js";
import {
  authPurposeSchema,
  emailSchema,
  rolesSchema,
  userStateSchema,
} from "./auth.js";
import {
  actionApprovalSchema,
  agentProfileSchema,
  permissionGrantSchema,
  visibilitySchema,
} from "./agents.js";

const storedHashSchema = z.string().min(32).max(1_024);
export const userSchema = mutableEntitySchema.extend({
  email: emailSchema,
  passwordHash: storedHashSchema.optional(),
  emailVerifiedAt: timestampSchema.optional(),
  roles: rolesSchema,
  locale: localeSchema,
  theme: themeSchema,
  state: userStateSchema,
  closedAt: timestampSchema.optional(),
});
export const authTokenSchema = entitySchema.extend({
  userId: idSchema.optional(),
  challengeId: idSchema,
  purpose: authPurposeSchema,
  secretHash: storedHashSchema,
  expiresAt: timestampSchema,
  consumedAt: timestampSchema.optional(),
  attemptCount: z.int().min(0).max(10),
  deliveryState: z.enum(["pending", "sent", "failed", "expired"]),
});
export const sessionRecordSchema = mutableEntitySchema.extend({
  userId: idSchema,
  refreshTokenHash: storedHashSchema,
  familyId: idSchema,
  generation: versionSchema,
  expiresAt: timestampSchema,
  revokedAt: timestampSchema.optional(),
  userAgent: z.string().max(512).optional(),
  ipHash: storedHashSchema.optional(),
});
export const mfaEnrollmentRecordSchema = entitySchema.extend({
  userId: idSchema,
  encryptedTotpSecret: z.string().min(32).max(4_096),
  confirmedAt: timestampSchema.optional(),
  recoveryCodeHashes: z.array(storedHashSchema).max(10),
  status: z.enum(["pending", "enabled", "disabled"]),
});
export const agentIdentityRecordSchema = agentProfileSchema.extend({
  userId: idSchema,
  profileVisibility: visibilitySchema,
  updatedAt: timestampSchema.optional(),
  deletedAt: timestampSchema.optional(),
});
export const agentCredentialRecordSchema = entitySchema.extend({
  instanceId: idSchema,
  userId: idSchema,
  keyId: idSchema,
  secretHash: storedHashSchema,
  expiresAt: timestampSchema,
  revokedAt: timestampSchema.optional(),
  scopeVersion: versionSchema,
});
export const permissionGrantRecordSchema = permissionGrantSchema.extend({
  grantorUserId: idSchema,
});
/** Server-created actor context; never parse this from an untrusted request body. */
export const authenticatedActorSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("human"),
    userId: idSchema,
    roles: rolesSchema,
    sessionId: idSchema,
  }),
  z.strictObject({
    kind: z.literal("agent"),
    agentId: idSchema,
    instanceId: idSchema,
    configurationRevisionId: idSchema,
    controllerUserId: idSchema,
    credentialId: idSchema,
    scopeVersion: versionSchema,
  }),
]);
export const actionApprovalRecordSchema = actionApprovalSchema.extend({
  userId: idSchema,
});

export type User = z.infer<typeof userSchema>;
export type AuthToken = z.infer<typeof authTokenSchema>;
export type SessionRecord = z.infer<typeof sessionRecordSchema>;
export type MfaEnrollmentRecord = z.infer<typeof mfaEnrollmentRecordSchema>;
export type AgentIdentityRecord = z.infer<typeof agentIdentityRecordSchema>;
export type AgentCredentialRecord = z.infer<typeof agentCredentialRecordSchema>;
export type AuthenticatedActor = z.infer<typeof authenticatedActorSchema>;

export type PermissionGrantRecord = z.infer<typeof permissionGrantRecordSchema>;
export type ActionApprovalRecord = z.infer<typeof actionApprovalRecordSchema>;
