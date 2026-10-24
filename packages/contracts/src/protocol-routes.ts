import { z } from "zod";
import * as c from "./domain.js";
import { mcpTransport, mcpResponseSchema } from "./mcp.js";
import { bearerHeaderSchema } from "./route-definition.js";

const html = z.string().min(1).max(100_000);
function protocol<
  T extends {
    auth: string;
    headers?: z.ZodType;
    stepUp?: boolean;
    requestMediaType?: string;
  },
>(route: T) {
  return Object.freeze({
    ...route,
    params: c.emptySchema,
    headers:
      route.headers ??
      z.strictObject({
        ...(route.auth === "human"
          ? { authorization: bearerHeaderSchema }
          : {}),
        ...(route.stepUp ? { "x-step-up-token": c.secretSchema } : {}),
        ...(route.requestMediaType
          ? { "content-type": z.literal(route.requestMediaType) }
          : {}),
      }),
  });
}
/** Explicit non-envelope transports. HTML must be rendered from finite trusted templates, never raw input. */
export const protocolRoutes = Object.freeze({
  health: protocol({
    method: "GET",
    path: "/health",
    query: c.emptySchema,
    body: c.emptySchema,
    response: c.healthProbeSchema,
    statuses: [200],
    mediaType: "application/json",
    auth: "public",
  }),
  ready: protocol({
    method: "GET",
    path: "/ready",
    query: c.emptySchema,
    body: c.emptySchema,
    response: c.healthProbeSchema,
    statuses: [200, 503],
    mediaType: "application/json",
    auth: "public",
  }),
  docs: protocol({
    method: "GET",
    path: "/api/v1/docs",
    query: c.emptySchema,
    body: c.emptySchema,
    response: html,
    statuses: [200],
    mediaType: "text/html",
    auth: "public",
    devOnly: true,
  }),
  docsJson: protocol({
    method: "GET",
    path: "/api/v1/docs-json",
    query: c.emptySchema,
    body: c.emptySchema,
    response: z.json(),
    statuses: [200],
    mediaType: "application/json",
    auth: "public",
    devOnly: true,
  }),
  protectedResource: protocol({
    method: "GET",
    path: "/.well-known/oauth-protected-resource/mcp",
    query: c.emptySchema,
    body: c.emptySchema,
    response: c.protectedResourceMetadataSchema,
    statuses: [200],
    mediaType: "application/json",
    auth: "public",
  }),
  authorizationServer: protocol({
    method: "GET",
    path: "/.well-known/oauth-authorization-server",
    query: c.emptySchema,
    body: c.emptySchema,
    response: c.authorizationServerMetadataSchema,
    statuses: [200],
    mediaType: "application/json",
    auth: "public",
  }),
  oauthAuthorize: protocol({
    method: "GET",
    path: "/oauth/authorize",
    query: c.oauthAuthorizeQuerySchema,
    body: c.emptySchema,
    response: html,
    statuses: [200],
    mediaType: "text/html",
    auth: "public",
    errors: c.oauthErrorSchema,
  }),
  oauthDecision: protocol({
    method: "POST",
    path: "/oauth/authorize/decision",
    query: c.emptySchema,
    body: c.oauthAuthorizationDecisionSchema,
    response: c.emptySchema,
    statuses: [302],
    mediaType: "application/json",
    auth: "human",
    stepUp: true,
    responseHeaders: c.oauthRedirectHeadersSchema,
    errors: c.apiErrorResponseSchema,
    errorStatuses: [400, 401, 403, 404, 409, 422, 429, 500, 503],
    bodyless: true,
  }),
  oauthToken: protocol({
    method: "POST",
    path: "/oauth/token",
    query: c.emptySchema,
    body: c.oauthTokenRequestSchema,
    response: c.oauthTokenResponseSchema,
    statuses: [200],
    mediaType: "application/json",
    requestMediaType: "application/x-www-form-urlencoded",
    auth: "pkce_or_refresh",
    responseHeaders: c.oauthResponseHeadersSchema,
    errors: c.oauthErrorSchema,
  }),
  oauthRevoke: protocol({
    method: "POST",
    path: "/oauth/revoke",
    query: c.emptySchema,
    body: c.oauthRevokeRequestSchema,
    response: c.emptySchema,
    statuses: [200],
    mediaType: "application/json",
    requestMediaType: "application/x-www-form-urlencoded",
    auth: "registered_client",
    errors: c.oauthErrorSchema,
    bodyless: true,
    responseHeaders: c.oauthResponseHeadersSchema,
  }),
  mcp: protocol({
    ...mcpTransport,
    query: c.emptySchema,
    body: mcpTransport.request,
    response: mcpResponseSchema,
    statuses: [200],
    mediaType: "application/json",
    auth: "mcp_oauth",
  }),
});
