import { z } from "zod";

/** Persistent identifiers use UUIDv4; clients cannot supply arbitrary database keys. */
export const idSchema = z.uuidv4();
/** Canonical UTC millisecond strings match server clock precision and Date JSON output. */
export const timestampSchema = z.iso.datetime({ precision: 3 });
export const versionSchema = z.int().min(1).max(Number.MAX_SAFE_INTEGER);
export const localeSchema = z.enum(["en", "fr", "es", "pa", "zh"]);
export const themeSchema = z.enum(["dark", "light"]);
export const labelSchema = z.string().trim().min(1).max(120);
export const descriptionSchema = z.string().max(8_000);
export const digestSchema = z.string().regex(/^[a-f0-9]{64}$/);
/** Opaque credential bytes; validation does not authenticate or verify a token. */
export const secretSchema = z.string().min(32).max(4_096);
export const emptySchema = z.strictObject({});
export const expectedVersionSchema = z.strictObject({
  expectedVersion: versionSchema,
});

/** Baseline persistence sketch; not a public response projection by itself. */
export const entitySchema = z.strictObject({
  id: idSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema.optional(),
  deletedAt: timestampSchema.optional(),
});
export const mutableEntitySchema = entitySchema.extend({
  version: versionSchema,
});

export const pageQuerySchema = z.strictObject({
  page: z.int().min(1).max(1_000_000).default(1),
  pageSize: z.int().min(1).max(100).default(20),
});
/** HTTP adapters parse numeric query syntax explicitly before this wire boundary. */
export type PageQuery = z.input<typeof pageQuerySchema>;

/** Creates a strict bounded list response using an existing item projection. */
export function pageSchema<T extends z.ZodType>(item: T) {
  return z
    .strictObject({
      items: z.array(item).max(100),
      total: z.int().min(0).max(Number.MAX_SAFE_INTEGER),
      page: z.int().min(1).max(1_000_000),
      pageSize: z.int().min(1).max(100),
    })
    .refine((value) => value.items.length <= value.pageSize, {
      message: "Page contains more items than pageSize",
      path: ["items"],
    });
}

export const eventCursorQuerySchema = z.strictObject({
  cursor: z.string().min(1).max(512).optional(),
  limit: z.int().min(1).max(100).default(20),
});

export const apiErrorCodeSchema = z.enum([
  "VALIDATION_FAILED",
  "UNAUTHENTICATED",
  "ACTION_FORBIDDEN",
  "NOT_FOUND",
  "AUTH_CHALLENGE_INVALID",
  "STEP_UP_REQUIRED",
  "CREDENTIAL_REVOKED",
  "VERSION_CONFLICT",
  "SECRET_REPLAY_UNAVAILABLE",
  "INVALID_TRANSITION",
  "ASSIGNMENT_EXPIRED",
  "REVIEW_REQUIRED",
  "BUDGET_EXHAUSTED",
  "RATE_LIMITED",
  "ARTIFACT_QUARANTINED",
  "EVENT_CURSOR_EXPIRED",
  "DEPENDENCY_UNAVAILABLE",
  "INTERNAL_ERROR",
]);
/** Field errors carry stable keys, never reflected private input or raw Zod issues. */
export const fieldErrorSchema = z.strictObject({
  path: z.array(z.union([z.string().max(120), z.int().min(0)])).max(16),
  code: z.string().regex(/^[a-z][a-z0-9_.]{0,119}$/),
});
export const responseMetaSchema = z.strictObject({ correlationId: idSchema });
export const apiErrorResponseSchema = z.strictObject({
  error: z.strictObject({
    code: apiErrorCodeSchema,
    messageKey: z.string().regex(/^[a-z][a-z0-9_.]{0,119}$/),
    fieldErrors: z.array(fieldErrorSchema).max(100).optional(),
    retryAfterSeconds: z.int().min(0).max(86_400).optional(),
  }),
  meta: responseMetaSchema,
});
/** Creates a response envelope without weakening its explicit data projection. */
export function apiSuccessSchema<T extends z.ZodType>(data: T) {
  return z.strictObject({ data, meta: responseMetaSchema });
}
export const actionReceiptSchema = z.strictObject({
  receiptId: idSchema,
  outcome: z.literal("applied"),
  occurredAt: timestampSchema,
});

/** Reports expiration at the boundary as well as after it; callers supply server time. */
export function isExpired(expiresAt: string, now: string): boolean {
  return (
    Date.parse(timestampSchema.parse(expiresAt)) <=
    Date.parse(timestampSchema.parse(now))
  );
}

export type Id = z.infer<typeof idSchema>;
export type Locale = z.infer<typeof localeSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type Entity = z.infer<typeof entitySchema>;
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type ActionReceipt = z.infer<typeof actionReceiptSchema>;

export type Timestamp = z.infer<typeof timestampSchema>;
export type Version = z.infer<typeof versionSchema>;
export type Label = z.infer<typeof labelSchema>;
export type Description = z.infer<typeof descriptionSchema>;
export type Digest = z.infer<typeof digestSchema>;
export type Secret = z.infer<typeof secretSchema>;
export type Empty = z.infer<typeof emptySchema>;
export type ExpectedVersion = z.infer<typeof expectedVersionSchema>;
export type MutableEntity = z.infer<typeof mutableEntitySchema>;
export type EventCursorQuery = z.infer<typeof eventCursorQuerySchema>;
export type FieldError = z.infer<typeof fieldErrorSchema>;
export type ResponseMeta = z.infer<typeof responseMetaSchema>;
