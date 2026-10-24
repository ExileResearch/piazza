import { z } from "zod";
import {
  apiErrorCodeSchema,
  idSchema,
  timestampSchema,
  versionSchema,
} from "./common.js";
import { activityActionSchema } from "./operations.js";
import { idempotencyKeySchema } from "./transport.js";

/** References expose no resource content; access is rechecked before projection and receipt replay. */
export const resourceReferenceSchema = z.strictObject({
  kind: z.enum([
    "user",
    "agent",
    "configuration",
    "instance",
    "grant",
    "approval",
    "project",
    "membership",
    "task",
    "application",
    "assignment",
    "submission",
    "review",
    "verification",
    "acceptance",
    "inquiry",
    "answer",
    "thread_entry",
    "wall_post",
    "association",
    "reaction",
    "social_control",
    "artifact",
    "allocation",
    "usage",
    "consent",
    "export",
    "report",
    "moderation",
  ]),
  id: idSchema,
  revision: versionSchema.optional(),
});
export const eventTargetSchema = z.discriminatedUnion("status", [
  z.strictObject({
    status: z.literal("available"),
    target: resourceReferenceSchema,
  }),
  z.strictObject({ status: z.literal("unavailable") }),
]);
export const eventSchema = z.strictObject({
  id: idSchema,
  occurredAt: timestampSchema,
  action: activityActionSchema,
  target: eventTargetSchema,
});
export const eventPageSchema = z
  .strictObject({
    items: z.array(eventSchema).max(100),
    nextCursor: z.string().min(1).max(512).optional(),
  })
  .refine((v) => v.items.length > 0 || v.nextCursor === undefined, {
    message: "An empty terminal page has no cursor",
  });
export const transportPolicySchema = z.strictObject({
  cursorTtlSeconds: z.int().min(60).max(900).default(300),
  eventRetentionSeconds: z.int().min(3_600).max(604_800).default(86_400),
  idempotencyTtlSeconds: z.int().min(300).max(86_400).default(86_400),
});
export const idempotencyLookupQuerySchema = z.strictObject({
  operationId: z.string().regex(/^[a-z][a-zA-Z0-9]{0,119}$/),
});
export const operationStatusSchema = z.discriminatedUnion("state", [
  z.strictObject({ state: z.literal("pending"), receiptId: idSchema }),
  z.strictObject({
    state: z.literal("applied"),
    receiptId: idSchema,
    reference: resourceReferenceSchema,
  }),
  z.strictObject({
    state: z.literal("secret_unavailable"),
    receiptId: idSchema,
    nextAction: z.enum([
      "rotate_credential",
      "restart_factor_enrollment",
      "reauthenticate",
    ]),
  }),
  z.strictObject({
    state: z.literal("failed"),
    receiptId: idSchema,
    code: apiErrorCodeSchema,
  }),
]);
export const idempotencyPathSchema = z.strictObject({
  key: idempotencyKeySchema,
});
export type ResourceReference = z.infer<typeof resourceReferenceSchema>;
export type EventTarget = z.infer<typeof eventTargetSchema>;
export type Event = z.infer<typeof eventSchema>;
export type EventPage = z.infer<typeof eventPageSchema>;
export type TransportPolicy = z.infer<typeof transportPolicySchema>;
export type IdempotencyLookupQuery = z.infer<
  typeof idempotencyLookupQuerySchema
>;
export type OperationStatus = z.infer<typeof operationStatusSchema>;
