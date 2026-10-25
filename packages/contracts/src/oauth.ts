/** Standard protocol field names intentionally use OAuth snake_case, outside product envelopes. */
import { z } from "zod";
import { permissionActionSchema } from "./agents.js";
import {
  expectedVersionSchema,
  idSchema,
  labelSchema,
  secretSchema,
  timestampSchema,
} from "./common.js";

export const oauthClientIdSchema = z.string().regex(/^[A-Za-z0-9_-]{8,128}$/);
export const oauthHttpsUrlSchema = z
  .url()
  .max(2048)
  .refine(
    (value) => {
      const url = new URL(value);
      return (
        url.protocol === "https:" && !url.username && !url.password && !url.hash
      );
    },
    { message: "HTTPS URL without credentials or fragment required" },
  );
export const oauthRedirectUriSchema = z
  .url()
  .max(2048)
  .refine(
    (value) => {
      const url = new URL(value);
      return (
        !url.username &&
        !url.password &&
        !url.hash &&
        (url.protocol === "https:" ||
          (url.protocol === "http:" &&
            ["127.0.0.1", "[::1]"].includes(url.hostname)))
      );
    },
    { message: "Pre-registered HTTPS or native loopback redirect required" },
  );
export const oauthScopeSchema = z
  .string()
  .min(1)
  .max(3000)
  .refine(
    (value) => {
      const scopes = value.split(" ");
      return (
        scopes.length <= 50 &&
        new Set(scopes).size === scopes.length &&
        scopes.every((s) => permissionActionSchema.safeParse(s).success)
      );
    },
    { message: "Distinct supported action scopes required" },
  );
export const oauthAuthorizeQuerySchema = z.strictObject({
  response_type: z.literal("code"),
  client_id: oauthClientIdSchema,
  redirect_uri: oauthRedirectUriSchema,
  code_challenge: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  code_challenge_method: z.literal("S256"),
  scope: oauthScopeSchema,
  resource: oauthHttpsUrlSchema,
  state: z
    .string()
    .min(16)
    .max(128)
    .regex(/^[A-Za-z0-9_-]+$/),
});
export const oauthAuthorizationDecisionSchema = z.discriminatedUnion(
  "decision",
  [
    expectedVersionSchema.extend({
      requestId: idSchema,
      decision: z.literal("approve"),
      instanceId: idSchema,
    }),
    expectedVersionSchema.extend({
      requestId: idSchema,
      decision: z.literal("deny"),
    }),
  ],
);
export const oauthTokenRequestSchema = z.discriminatedUnion("grant_type", [
  z.strictObject({
    grant_type: z.literal("authorization_code"),
    code: secretSchema,
    client_id: oauthClientIdSchema,
    redirect_uri: oauthRedirectUriSchema,
    code_verifier: z.string().regex(/^[A-Za-z0-9._~-]{43,128}$/),
    resource: oauthHttpsUrlSchema,
  }),
  z.strictObject({
    grant_type: z.literal("refresh_token"),
    refresh_token: secretSchema,
    client_id: oauthClientIdSchema,
    resource: oauthHttpsUrlSchema,
    scope: oauthScopeSchema.optional(),
  }),
]);
/** Explicit secret issuance only. Never store this response in idempotency receipts/logs. */
export const oauthTokenResponseSchema = z.strictObject({
  access_token: secretSchema,
  token_type: z.literal("Bearer"),
  expires_in: z.int().min(60).max(900),
  refresh_token: secretSchema.optional(),
  scope: oauthScopeSchema,
});
export const oauthRevokeRequestSchema = z.strictObject({
  token: secretSchema,
  client_id: oauthClientIdSchema,
  token_type_hint: z.enum(["access_token", "refresh_token"]).optional(),
});
export const oauthErrorSchema = z.strictObject({
  error: z.enum([
    "invalid_request",
    "invalid_client",
    "invalid_grant",
    "unauthorized_client",
    "unsupported_grant_type",
    "invalid_scope",
    "invalid_target",
    "access_denied",
    "server_error",
    "temporarily_unavailable",
  ]),
});
export const protectedResourceMetadataSchema = z.strictObject({
  resource: oauthHttpsUrlSchema,
  authorization_servers: z.array(oauthHttpsUrlSchema).length(1),
  scopes_supported: z.array(permissionActionSchema).min(1).max(100),
  bearer_methods_supported: z.tuple([z.literal("header")]),
});
export const authorizationServerMetadataSchema = z.strictObject({
  issuer: oauthHttpsUrlSchema,
  authorization_endpoint: oauthHttpsUrlSchema,
  token_endpoint: oauthHttpsUrlSchema,
  revocation_endpoint: oauthHttpsUrlSchema,
  response_types_supported: z.tuple([z.literal("code")]),
  grant_types_supported: z.tuple([
    z.literal("authorization_code"),
    z.literal("refresh_token"),
  ]),
  code_challenge_methods_supported: z.tuple([z.literal("S256")]),
  token_endpoint_auth_methods_supported: z.tuple([z.literal("none")]),
  scopes_supported: z.array(permissionActionSchema).min(1).max(100),
});
export const oauthConsentViewSchema = z.strictObject({
  requestId: idSchema,
  clientName: labelSchema,
  scopes: z.array(permissionActionSchema).min(1).max(50),
  resource: oauthHttpsUrlSchema,
  expiresAt: timestampSchema,
  instances: z
    .array(z.strictObject({ id: idSchema, label: labelSchema }))
    .max(100),
});
export const oauthRedirectHeadersSchema = z.strictObject({
  location: oauthRedirectUriSchema,
  "cache-control": z.literal("no-store"),
});
export const oauthResponseHeadersSchema = z.strictObject({
  "cache-control": z.literal("no-store"),
  pragma: z.literal("no-cache"),
});
export const oauthPolicySchema = z.strictObject({
  authorizationCodeTtlSeconds: z.int().min(30).max(120).default(60),
  consentTtlSeconds: z.int().min(60).max(600).default(300),
  accessTtlSeconds: z.int().min(60).max(900).default(600),
  refreshTtlSeconds: z.int().min(600).max(604800).default(86400),
});

export type OAuthAuthorizeQuery = z.infer<typeof oauthAuthorizeQuerySchema>;
export type OAuthAuthorizationDecision = z.infer<
  typeof oauthAuthorizationDecisionSchema
>;
export type OAuthTokenRequest = z.infer<typeof oauthTokenRequestSchema>;
export type OAuthTokenResponse = z.infer<typeof oauthTokenResponseSchema>;
export type OAuthRevokeRequest = z.infer<typeof oauthRevokeRequestSchema>;
export type OAuthError = z.infer<typeof oauthErrorSchema>;
export type ProtectedResourceMetadata = z.infer<
  typeof protectedResourceMetadataSchema
>;
export type AuthorizationServerMetadata = z.infer<
  typeof authorizationServerMetadataSchema
>;
export type OAuthConsentView = z.infer<typeof oauthConsentViewSchema>;
export type OAuthPolicy = z.infer<typeof oauthPolicySchema>;
