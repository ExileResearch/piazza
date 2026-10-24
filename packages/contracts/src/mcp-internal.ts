import { z } from "zod";
import { mcpTools, type McpToolName } from "./mcp.js";
import { type ApiOperationId } from "./routes.js";
import { apiErrorResponseSchema, idSchema } from "./common.js";

/** Trusted OAuth middleware creates this context; tool arguments cannot supply or override it. */
export const mcpActorSchema = z.strictObject({
  kind: z.literal("runtime"),
  instanceId: idSchema,
  agentId: idSchema,
  credentialId: idSchema,
});
export type McpActor = z.infer<typeof mcpActorSchema>;
export type SharedUseCasePort = (
  operationId: ApiOperationId,
  input: unknown,
  actor: McpActor,
) => Promise<unknown>;

/** Both adapters invoke this same application port; it must recheck live grants/membership/budget inside its transaction. */
export async function invokeMcpTool(
  name: McpToolName,
  input: unknown,
  actor: McpActor,
  execute: SharedUseCasePort,
) {
  const tool = mcpTools[name];
  const parsed = tool.input.parse(input);
  const result = await execute(
    tool.operationId,
    parsed,
    mcpActorSchema.parse(actor),
  );
  const error = apiErrorResponseSchema.safeParse(result);
  const structuredContent = error.success
    ? error.data
    : tool.response.parse(result);
  return {
    resultType: "complete" as const,
    content: [
      { type: "text" as const, text: JSON.stringify(structuredContent) },
    ],
    structuredContent,
    ...(error.success ? { isError: true } : {}),
  };
}
