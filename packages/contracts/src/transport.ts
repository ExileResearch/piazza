import { z } from "zod";
import { secretSchema } from "./common.js";

export const permissionPolicyNameSchema = z.enum([
  "public",
  "public_read",
  "human",
  "controller",
  "scoped_agent",
  "workspace_owner",
  "participant",
  "reviewer",
  "observer",
  "admin",
  "session",
  "challenge",
  "scoped_approval_request",
]);

export type PermissionPolicyName = z.infer<typeof permissionPolicyNameSchema>;

/** Compact descriptor vocabulary; apiRoutes binds actual schemas and policy metadata. */
export const routeDescriptorSchema = z.strictObject({
  operationId: z.string().regex(/^[a-z][a-zA-Z0-9]{0,119}$/),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  path: z
    .string()
    .min(1)
    .max(256)
    .regex(/^\/(?:[a-zA-Z0-9_:/.-])*$/),
  actor: permissionPolicyNameSchema,
  representations: z
    .array(z.enum(["json", "binary", "html"]))
    .min(1)
    .max(3)
    .refine((values) => new Set(values).size === values.length),
  requiresVersion: z.boolean(),
  requiresIdempotency: z.boolean(),
  issuesSecret: z.boolean(),
});
/** Declared exception to JSON envelopes; dependency details remain private. */
export const healthProbeSchema = z.strictObject({
  status: z.enum(["ok", "unavailable"]),
});
export const idempotencyKeySchema = z
  .string()
  .min(16)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/);
export type RouteDescriptor = z.infer<typeof routeDescriptorSchema>;
export type HealthProbe = z.infer<typeof healthProbeSchema>;
export type IdempotencyKey = z.infer<typeof idempotencyKeySchema>;
/** Sensitive human operations use a verified proof header; never persist this raw value in receipts/logs. */
export const stepUpHeadersSchema = z.strictObject({
  "x-step-up-token": secretSchema,
});
export type StepUpHeaders = z.infer<typeof stepUpHeadersSchema>;
