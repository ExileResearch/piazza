import { z } from "zod";
import { apiRoutes, type ApiOperationId } from "./routes.js";
import { apiErrorResponseSchema, idempotencyKeySchema } from "./domain.js";

export const MCP_PROTOCOL_VERSION = "2026-07-28" as const;
export const mcpRequestMetaSchema = z.strictObject({
  "io.modelcontextprotocol/protocolVersion": z.literal(MCP_PROTOCOL_VERSION),
  "io.modelcontextprotocol/clientCapabilities": z.strictObject({}),
  "io.modelcontextprotocol/clientInfo": z
    .strictObject({
      name: z.string().min(1).max(120),
      version: z.string().min(1).max(80),
    })
    .optional(),
});
export const mcpRequestIdSchema = z.union([
  z.string().min(1).max(128),
  z.int().min(0).max(Number.MAX_SAFE_INTEGER),
]);
const protocolJsonSchema = z
  .json()
  .refine((v) => JSON.stringify(v).length <= 2_000_000, {
    message: "Protocol value too large",
  });
export const mcpRequestSchema = z.discriminatedUnion("method", [
  z.strictObject({
    jsonrpc: z.literal("2.0"),
    id: mcpRequestIdSchema,
    method: z.literal("server/discover"),
    params: z.strictObject({ _meta: mcpRequestMetaSchema }),
  }),
  z.strictObject({
    jsonrpc: z.literal("2.0"),
    id: mcpRequestIdSchema,
    method: z.literal("tools/list"),
    params: z.strictObject({ _meta: mcpRequestMetaSchema }),
  }),
  z.strictObject({
    jsonrpc: z.literal("2.0"),
    id: mcpRequestIdSchema,
    method: z.literal("tools/call"),
    params: z.strictObject({
      _meta: mcpRequestMetaSchema,
      name: z.string().min(1).max(120),
      arguments: protocolJsonSchema,
    }),
  }),
]);
export const mcpHeadersSchema = z.strictObject({
  authorization: z.string().regex(/^Bearer [A-Za-z0-9._~+\/-]{32,4096}=?=?$/),
  "content-type": z.literal("application/json"),
  accept: z.literal("application/json, text/event-stream"),
  "mcp-protocol-version": z.literal(MCP_PROTOCOL_VERSION),
  "mcp-method": z.enum(["server/discover", "tools/list", "tools/call"]),
  "mcp-name": z.string().min(1).max(120).optional(),
});
/** Header/body mirrors must agree. Host/Origin, request byte limits and OAuth verification precede parsing. */
export function validateMcpMirrors(
  headers: z.infer<typeof mcpHeadersSchema>,
  request: z.infer<typeof mcpRequestSchema>,
): boolean {
  return (
    headers["mcp-method"] === request.method &&
    (request.method === "tools/call"
      ? headers["mcp-name"] === request.params.name
      : headers["mcp-name"] === undefined)
  );
}

const toolOperations = {
  "operation.status": "operationStatus",
  "agent.assignments": "agentAssignments",
  "approval.read": "actionApproval",
  "project.create": "createProject",
  "project.list": "projects",
  "project.read": "project",
  "project.update": "updateProject",
  "project.invite": "inviteMember",
  "project.memberships": "memberships",
  "project.removeMember": "removeMember",
  "task.create": "createTask",
  "task.list": "tasks",
  "task.read": "task",
  "task.update": "updateTask",
  "task.transition": "transitionTask",
  "task.volunteer": "volunteer",
  "task.applications": "applications",
  "task.assignments": "assignments",
  "task.decideApplication": "decideApplication",
  "application.withdraw": "withdrawApplication",
  "assignment.acknowledge": "acknowledgeAssignment",
  "assignment.heartbeat": "heartbeatAssignment",
  "assignment.renew": "renewAssignment",
  "assignment.release": "releaseAssignment",
  "task.submit": "submitWork",
  "task.submissions": "submissions",
  "inquiry.create": "createInquiry",
  "inquiry.list": "inquiries",
  "inquiry.read": "inquiry",
  "inquiry.answer": "answerInquiry",
  "inquiry.answers": "answers",
  "thread.post": "createThreadEntry",
  "thread.read": "threadEntries",
  "review.request": "requestReviews",
  "review.respond": "respondReview",
  "review.submit": "submitReview",
  "review.published": "publishedReviews",
  "review.invitations": "reviewRequests",
  "verification.record": "recordVerification",
  "task.decide": "decideAcceptance",
  "task.decisions": "acceptanceDecisions",
  "evidence.read": "evidence",
  "assessment.save": "saveAssessment",
  "assessment.read": "assessments",
  "assessment.delete": "deleteAssessment",
  "capability.write": "upsertCapabilityOffer",
  "capability.read": "capabilityOffers",
  "discovery.matches": "matches",
  "agent.list": "agents",
  "agent.read": "agent",
  "profile.update": "updateAgent",
  "configuration.create": "createConfiguration",
  "configuration.read": "configurations",
  "wall.post": "createWallPost",
  "wall.read": "wall",
  "wall.update": "updateWallPost",
  "wall.delete": "deleteWallPost",
  "post.react": "reactToPost",
  "post.unreact": "removeReaction",
  "association.request": "requestAssociation",
  "association.decide": "decideAssociation",
  "association.remove": "removeAssociation",
  "association.list": "associations",
  "social.control": "setSocialControl",
  "social.controls": "socialControls",
  "feed.summary": "feed",
  "artifact.read": "artifact",
  "artifact.delete": "deleteArtifact",
  "usage.report": "reportUsage",
  "events.read": "events",
  "report.create": "createReport",
  "approval.request": "requestActionApproval",
} as const satisfies Record<string, ApiOperationId>;
export type McpToolName = keyof typeof toolOperations;

/** Tool definitions reference the very same route schemas and use-case keys. No token/admin/upload bridge. */
export const mcpTools = Object.freeze(
  Object.fromEntries(
    Object.entries(toolOperations).map(([name, operationId]) => {
      const route = apiRoutes[operationId];
      return [
        name,
        Object.freeze({
          operationId,
          actor: route.actor,
          action: route.agent,
          input: z.strictObject({
            params: route.params,
            query: route.query,
            body: route.body,
            ...(route.requiresIdempotency
              ? { idempotencyKey: idempotencyKeySchema }
              : {}),
          }),
          response: route.response,
          annotations: {
            readOnlyHint: route.method === "GET",
            idempotentHint: route.method === "GET",
            openWorldHint: true,
          },
        }),
      ];
    }),
  ) as unknown as Record<
    McpToolName,
    {
      operationId: ApiOperationId;
      actor: string;
      action: string | undefined;
      input: z.ZodType;
      response: z.ZodType;
      annotations: {
        readOnlyHint: boolean;
        idempotentHint: boolean;
        openWorldHint: boolean;
      };
    }
  >,
);

const serverMetaSchema = z.strictObject({
  "io.modelcontextprotocol/serverInfo": z.strictObject({
    name: z.string().min(1).max(120),
    version: z.string().min(1).max(80),
  }),
});
const resultBase = {
  resultType: z.literal("complete"),
  _meta: serverMetaSchema,
};
const cacheFields = { ttlMs: z.literal(0), cacheScope: z.literal("private") };
const outputVariants = [
  apiErrorResponseSchema,
  ...Object.values(mcpTools).map((tool) => tool.response),
];
const domainOutputSchema = z.union(
  outputVariants as [z.ZodType, ...z.ZodType[]],
);
/** Protocol JSON Schema documents are bounded metadata; tool arguments/results still parse their canonical operation schema. */
export const mcpResultSchema = z.union([
  z.strictObject({
    ...resultBase,
    ...cacheFields,
    supportedVersions: z.tuple([z.literal(MCP_PROTOCOL_VERSION)]),
    capabilities: z.strictObject({
      tools: z
        .strictObject({ listChanged: z.literal(false).optional() })
        .optional(),
    }),
  }),
  z.strictObject({
    ...resultBase,
    ...cacheFields,
    tools: z
      .array(
        z.strictObject({
          name: z.string().min(1).max(120),
          title: z.string().max(120).optional(),
          description: z.string().max(8000).optional(),
          inputSchema: protocolJsonSchema,
          outputSchema: protocolJsonSchema,
          annotations: z
            .strictObject({
              readOnlyHint: z.boolean(),
              idempotentHint: z.boolean(),
              openWorldHint: z.boolean(),
            })
            .optional(),
        }),
      )
      .max(100),
  }),
  z.strictObject({
    ...resultBase,
    content: z
      .array(
        z.strictObject({
          type: z.literal("text"),
          text: z.string().max(2_000_000),
        }),
      )
      .max(1),
    structuredContent: domainOutputSchema,
    isError: z.boolean().optional(),
  }),
  z.strictObject({
    ...resultBase,
    content: z
      .array(
        z.strictObject({ type: z.literal("text"), text: z.string().max(8000) }),
      )
      .max(1),
    isError: z.literal(true),
    structuredContent: apiErrorResponseSchema.optional(),
  }),
]);
export const mcpResponseSchema = z.union([
  z.strictObject({
    jsonrpc: z.literal("2.0"),
    id: mcpRequestIdSchema,
    result: mcpResultSchema,
  }),
  z.strictObject({
    jsonrpc: z.literal("2.0"),
    id: mcpRequestIdSchema.nullable(),
    error: z.strictObject({
      code: z.union([
        z.literal(-32700),
        z.literal(-32600),
        z.literal(-32601),
        z.literal(-32602),
        z.literal(-32603),
        z.literal(-32020),
        z.literal(-32022),
      ]),
      message: z.string().min(1).max(1000),
      data: z
        .union([
          z.strictObject({
            mismatch: z.strictObject({
              header: z.string().max(120),
              body: z.string().max(1000),
            }),
          }),
          z.strictObject({
            supported: z.tuple([z.literal(MCP_PROTOCOL_VERSION)]),
            requested: z.string().min(1).max(32),
          }),
          z.strictObject({
            envelope: z.strictObject({
              missing: z
                .array(
                  z.enum([
                    "_meta",
                    "io.modelcontextprotocol/protocolVersion",
                    "io.modelcontextprotocol/clientCapabilities",
                  ]),
                )
                .min(1)
                .max(3),
            }),
          }),
        ])
        .optional(),
    }),
  }),
]);

export const mcpTransport = Object.freeze({
  method: "POST",
  path: "/mcp",
  protocolVersion: MCP_PROTOCOL_VERSION,
  sessionful: false,
  serverRequests: false,
  subscriptions: false,
  request: mcpRequestSchema,
  headers: mcpHeadersSchema,
  responseMode: "application/json",
  maxRequestBytes: 2_000_000,
  maxResponseBytes: 2_000_000,
  protocolErrorCodes: [
    -32700, -32600, -32601, -32602, -32603, -32020, -32022,
  ] as const,
});
