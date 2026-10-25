import { z } from "zod";
import * as c from "../../dist/esm/index.js";
import { readFileSync } from "node:fs";
const pkg = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
);
export const representativeSchemas = {
  RegisterRequest: c.registerRequestSchema,
  UpdatePreferences: c.updatePreferencesSchema,
  ArtifactMetadata: c.artifactMetadataSchema,
  AuthResult: c.authResultSchema,
  ApiError: c.apiErrorResponseSchema,
};
export function jsonSchema(schema, io = "output") {
  const { $schema, ...result } = z.toJSONSchema(schema, {
    io,
    target: "draft-2020-12",
    unrepresentable: "throw",
  });
  return result;
}
export function generateOpenApi({ development = false } = {}) {
  const schemas = {};
  const paths = {};
  const schemaNames = new Map();
  function component(name, schema, io = "output") {
    const local = jsonSchema(schema, io);
    const fingerprint = JSON.stringify(local);
    if (schemaNames.has(fingerprint))
      return { $ref: `#/components/schemas/${schemaNames.get(fingerprint)}` };
    schemaNames.set(fingerprint, name);
    schemas[name] = JSON.parse(
      JSON.stringify(local).replaceAll(
        "#/$defs/",
        `#/components/schemas/${name}/$defs/`,
      ),
    );
    return { $ref: `#/components/schemas/${name}` };
  }
  function parameters(schema, location) {
    const s = jsonSchema(schema, "input");
    return Object.entries(s.properties ?? {}).map(([name, value]) => ({
      name,
      in: location,
      required: location === "path" || s.required?.includes(name) || false,
      schema: value,
    }));
  }
  function responseHeaders(schema) {
    return Object.fromEntries(
      Object.entries(jsonSchema(schema).properties ?? {}).map(
        ([key, value]) => [key, { required: true, schema: value }],
      ),
    );
  }
  for (const [name, s] of Object.entries(representativeSchemas))
    component(
      name,
      s,
      name === "RegisterRequest" || name === "UpdatePreferences"
        ? "input"
        : "output",
    );
  for (const [operationId, r] of Object.entries(c.apiRoutes)) {
    const path = r.path.replace(/:([A-Za-z]+)/g, "{$1}");
    const content = {};
    for (const type of r.responseMediaTypes)
      content[type] = {
        schema:
          type === "application/octet-stream"
            ? { type: "string", format: "binary" }
            : type === "text/html"
              ? { type: "string", maxLength: 100000 }
              : component(`${operationId}Response`, r.response),
      };
    const responses = {
      [r.status]: {
        description: "Successful operation",
        content,
        ...(r.responseHeaders
          ? { headers: responseHeaders(r.responseHeaders) }
          : {}),
      },
    };
    for (const [status, error] of Object.entries(r.errors))
      responses[status] = {
        description: `Safe ${status} outcome`,
        content: {
          "application/json": {
            schema: component(`${operationId}Error${status}`, error),
          },
        },
      };
    if (r.representation === "form")
      for (const value of Object.values(responses))
        value.content["text/html"] = {
          schema: { type: "string", maxLength: 100000 },
        };
    const bodyRef = component(`${operationId}Body`, r.body, "input");
    const bodyContent = Object.fromEntries(
      r.requestMediaTypes.map((type) => [
        type,
        {
          schema:
            type === "multipart/form-data"
              ? {
                  type: "object",
                  additionalProperties: false,
                  required: ["metadata", "file"],
                  properties: {
                    metadata: bodyRef,
                    file: { type: "string", format: "binary" },
                  },
                }
              : bodyRef,
          ...(type === "multipart/form-data"
            ? { encoding: { metadata: { contentType: "application/json" } } }
            : {}),
        },
      ]),
    );
    const security =
      r.actor === "public_read"
        ? [{}, { humanBearer: [] }, { runtimeBearer: [] }]
        : r.actor === "public" ||
            r.actor === "session" ||
            r.actor === "challenge"
          ? []
          : [
              { humanBearer: [] },
              ...(r.agent || r.actor === "scoped_approval_request"
                ? [{ runtimeBearer: [] }]
                : []),
            ];
    (paths[path] ??= {})[r.method.toLowerCase()] = {
      operationId,
      tags: [...r.features],
      parameters: [
        ...parameters(r.params, "path"),
        ...parameters(r.query, "query"),
        ...parameters(r.headers, "header").filter(
          (p) => p.name !== "authorization",
        ),
      ],
      security,
      responses,
      ...(r.method !== "GET"
        ? { requestBody: { required: true, content: bodyContent } }
        : {}),
      "x-piazza-policy": r.actor,
      "x-piazza-action": r.agent ?? null,
      "x-piazza-idempotency": r.requiresIdempotency,
      "x-piazza-secret-once": r.issuesSecret,
      "x-piazza-runtime-validation":
        "Zod refinements and transactional authority remain mandatory",
    };
  }
  for (const [operationId, r] of Object.entries(c.protocolRoutes)) {
    if (r.devOnly && !development) continue;
    const responses = Object.fromEntries(
      r.statuses.map((status) => [
        status,
        {
          description: "Protocol outcome",
          ...(status === 302 || r.bodyless
            ? {}
            : {
                content: {
                  [r.mediaType]: {
                    schema: component(
                      `${operationId}ProtocolResponse`,
                      r.response,
                    ),
                  },
                },
              }),
          ...(r.responseHeaders
            ? { headers: responseHeaders(r.responseHeaders) }
            : {}),
        },
      ]),
    );
    if (r.errors)
      for (const status of r.errorStatuses ?? [400, 401, 403, 429, 500, 503])
        responses[status] = {
          description: "Protocol error",
          content: {
            "application/json": {
              schema: component(`${operationId}ProtocolError`, r.errors),
            },
          },
        };
    if (operationId === "mcp")
      for (const status of [400, 401, 403, 405, 406, 413, 415, 429, 500, 503])
        responses[status] = {
          description:
            status === 401
              ? "OAuth challenge with WWW-Authenticate protected-resource metadata"
              : "Transport/protocol rejection",
        };
    (paths[r.path] ??= {})[r.method.toLowerCase()] = {
      operationId,
      tags: ["protocol"],
      parameters: [
        ...parameters(r.query, "query"),
        ...parameters(r.headers, "header").filter(
          (p) => p.name !== "authorization",
        ),
      ],
      security:
        r.auth === "human"
          ? [{ humanBearer: [] }]
          : r.auth === "mcp_oauth"
            ? [{ mcpOAuth: [] }]
            : [],
      responses,
      ...(r.method === "POST"
        ? {
            requestBody: {
              required: true,
              content: {
                [r.requestMediaType ?? "application/json"]: {
                  schema: component(
                    `${operationId}ProtocolBody`,
                    r.body,
                    "input",
                  ),
                },
              },
            },
          }
        : {}),
      "x-piazza-auth": r.auth,
      ...(r.devOnly ? { "x-development-only": true } : {}),
      ...(r.stepUp ? { "x-step-up-required": true } : {}),
    };
  }
  for (const [name, s] of Object.entries(representativeSchemas))
    component(
      name,
      s,
      name === "RegisterRequest" || name === "UpdatePreferences"
        ? "input"
        : "output",
    );
  return {
    openapi: "3.1.1",
    info: {
      title: "Piazza contract baseline",
      version: pkg.version,
      description:
        "Design baseline; no endpoint implementation or deployment is asserted. Zod runtime validation is authoritative.",
    },
    paths,
    components: {
      schemas,
      securitySchemes: {
        humanBearer: {
          type: "http",
          scheme: "bearer",
          description: "Human session; no cookies.",
        },
        runtimeBearer: {
          type: "http",
          scheme: "bearer",
          description:
            "Scoped revocable instance credential, live authority checked per action.",
        },
        mcpOAuth: {
          type: "oauth2",
          flows: {
            authorizationCode: {
              authorizationUrl: "/oauth/authorize",
              tokenUrl: "/oauth/token",
              scopes: Object.fromEntries(
                c.permissionActionSchema.options.map((scope) => [scope, scope]),
              ),
            },
          },
          description:
            "Pre-registered public clients, PKCE S256, exact MCP resource audience and live instance/grants; ordinary runtime bearer is not accepted.",
        },
      },
    },
  };
}
export function generateToolCatalog() {
  return Object.entries(c.mcpTools).map(([name, t]) => ({
    name,
    operationId: t.operationId,
    actor: t.actor,
    action: t.action ?? null,
    inputSchema: jsonSchema(t.input, "input"),
    outputSchema: jsonSchema(t.response),
    annotations: t.annotations,
  }));
}
