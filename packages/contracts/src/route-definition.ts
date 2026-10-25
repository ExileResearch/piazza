import { z } from "zod";
import * as c from "./domain.js";

/** Only normalized consumed headers enter this boundary; ordinary HTTP headers are extracted first. */
export const bearerHeaderSchema = z
  .string()
  .regex(/^Bearer [A-Za-z0-9._~+\/-]{32,4096}=?=?$/);
export const errorCodesByStatus = {
  400: ["VALIDATION_FAILED"],
  401: ["UNAUTHENTICATED", "AUTH_CHALLENGE_INVALID", "CREDENTIAL_REVOKED"],
  403: ["ACTION_FORBIDDEN", "STEP_UP_REQUIRED"],
  404: ["NOT_FOUND"],
  409: [
    "VERSION_CONFLICT",
    "INVALID_TRANSITION",
    "ASSIGNMENT_EXPIRED",
    "REVIEW_REQUIRED",
    "ARTIFACT_QUARANTINED",
    "SECRET_REPLAY_UNAVAILABLE",
  ],
  410: ["EVENT_CURSOR_EXPIRED"],
  413: ["VALIDATION_FAILED"],
  415: ["VALIDATION_FAILED"],
  422: ["VALIDATION_FAILED"],
  429: ["BUDGET_EXHAUSTED", "RATE_LIMITED"],
  500: ["INTERNAL_ERROR"],
  503: ["DEPENDENCY_UNAVAILABLE"],
} as const satisfies Record<number, readonly c.ApiErrorCode[]>;
export type ActorPolicy = c.PermissionPolicyName;
export type RouteOptions = {
  agent?: c.PermissionAction;
  stepUp?: boolean;
  secret?: boolean;
  status?: 200 | 201 | 202;
  devOnly?: boolean;
  representation?: "json" | "binary" | "form";
  responseHeaders?: z.ZodType;
};
type SegmentParam<S extends string> = S extends `:${infer N}` ? N : never;
type ParamNames<P extends string> = P extends `${infer A}/${infer B}`
  ? SegmentParam<A> | ParamNames<B>
  : SegmentParam<P>;
type ParamSchema<N extends string> = N extends "purpose"
  ? typeof c.consentPurposeSchema
  : N extends "parentType"
    ? typeof c.threadParentSchema.shape.kind
    : N extends "key"
      ? typeof c.idempotencyKeySchema
      : typeof c.idSchema;

/** Registers schemas themselves, so HTTP/MCP/Swagger adapters cannot invent DTOs. Policy labels are not guards. */
export function defineRoute<
  const M extends "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  const P extends string,
  B extends z.ZodType,
  Q extends z.ZodType,
  R extends z.ZodType,
  const O extends RouteOptions = {},
>(
  method: M,
  path: P,
  body: B,
  query: Q,
  data: R,
  actor: ActorPolicy,
  features: readonly string[],
  options: O = {} as O,
) {
  const names = [...path.matchAll(/:([A-Za-z]+)/g)].map((match) => match[1]!);
  const params = z.strictObject(
    Object.fromEntries(
      names.map((name) => [
        name,
        name === "purpose"
          ? c.consentPurposeSchema
          : name === "parentType"
            ? c.threadParentSchema.shape.kind
            : name === "key"
              ? c.idempotencyKeySchema
              : c.idSchema,
      ]),
    ) as { [N in ParamNames<P>]: ParamSchema<N> },
  );
  const mutation = method !== "GET";
  const requiresIdempotency =
    mutation &&
    !path.startsWith("/api/v1/auth/") &&
    path !== "/api/v1/public/updates";
  const headers = z.strictObject({
    ...(actor === "public_read"
      ? { authorization: bearerHeaderSchema.optional() }
      : actor === "public" || actor === "challenge" || actor === "session"
        ? {}
        : { authorization: bearerHeaderSchema }),
    ...(options.agent ? { "x-acting-agent-id": c.idSchema.optional() } : {}),
    ...(options.stepUp ? { "x-step-up-token": c.secretSchema } : {}),
    ...(requiresIdempotency
      ? { "idempotency-key": c.idempotencyKeySchema }
      : {}),
    ...(options.representation === "binary" && mutation
      ? { "content-type": c.artifactUploadHeadersSchema.shape["content-type"] }
      : {}),
  });
  const statuses = [
    400,
    422,
    429,
    500,
    503,
    401,
    403,
    404,
    ...(mutation || options.representation === "binary" ? [409] : []),
    ...((query as z.ZodType) === c.eventCursorQuerySchema ? [410] : []),
    ...(options.representation === "binary" && mutation ? [413, 415] : []),
  ];
  const errors = Object.fromEntries(
    statuses.map((status) => {
      const codes =
        errorCodesByStatus[status as keyof typeof errorCodesByStatus];
      return [
        status,
        c.apiErrorResponseSchema.extend({
          error: c.apiErrorResponseSchema.shape.error.extend({
            code: z.enum(codes),
          }),
        }),
      ];
    }),
  );
  return Object.freeze({
    method,
    path,
    params,
    query,
    headers,
    body,
    data,
    actor,
    features,
    journeys: features.map((feature) => feature.replace(/^F/, "J")),
    ...options,
    agent: options.agent,
    representation: options.representation,
    responseHeaders:
      options.responseHeaders ??
      z.strictObject({ "cache-control": z.literal("no-store") }),
    requiresIdempotency,
    issuesSecret: options.secret ?? false,
    status: options.status ?? 200,
    response: (options.representation === "binary" && !mutation
      ? data
      : c.apiSuccessSchema(data)) as O extends { representation: "binary" }
      ? M extends "GET"
        ? R
        : ReturnType<typeof c.apiSuccessSchema<R>>
      : ReturnType<typeof c.apiSuccessSchema<R>>,
    errors,
    responseValidation:
      options.representation === "binary" && !mutation
        ? "delivery_plan_then_bounded_stream"
        : "json_envelope",
    requestMediaTypes:
      options.representation === "form"
        ? ["application/json", "application/x-www-form-urlencoded"]
        : options.representation === "binary" && mutation
          ? ["multipart/form-data"]
          : ["application/json"],
    responseMediaTypes:
      options.representation === "binary" && !mutation
        ? ["application/octet-stream"]
        : options.representation === "form"
          ? ["application/json", "text/html"]
          : ["application/json"],
  });
}

/** Decode query syntax before schema validation; duplicate and unknown keys fail, never last-value-win. */
export function decodeQuery<T extends z.ZodType>(
  schema: T,
  input: URLSearchParams,
): z.output<T> {
  const result: Record<string, string | number> = {};
  for (const [key, value] of input) {
    if (Object.hasOwn(result, key)) throw new Error("VALIDATION_FAILED");
    if (["page", "pageSize", "limit", "revision"].includes(key)) {
      if (!/^[1-9][0-9]*$/.test(value)) throw new Error("VALIDATION_FAILED");
      result[key] = Number(value);
    } else result[key] = value;
  }
  return schema.parse(result);
}

/** Runtime identity is credential-derived; a human must explicitly select a controlled agent. */
export function validateActingSelection(
  kind: "human" | "runtime",
  headers: { "x-acting-agent-id"?: string },
): boolean {
  return kind === "human"
    ? headers["x-acting-agent-id"] !== undefined
    : headers["x-acting-agent-id"] === undefined;
}
