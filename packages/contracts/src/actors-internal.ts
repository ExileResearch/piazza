import { z } from "zod";
import { idSchema, versionSchema } from "./common.js";
import { rolesSchema } from "./auth.js";

/** Server-created context. Credentials/session validation happens before this shape is built. */
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
export type AuthenticatedActor = z.infer<typeof authenticatedActorSchema>;
