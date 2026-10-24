import test from "node:test";
import assert from "node:assert/strict";
import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import * as c from "../dist/esm/index.js";
import {
  authorizeScopedAction,
  invokeMcpTool,
} from "../dist/esm/server-internal.js";
import * as f from "./coordination-fixtures.mjs";

const actor = {
  kind: "runtime",
  instanceId: f.id(12),
  agentId: f.id(2),
  credentialId: f.id(42),
};
const auth = `Bearer ${"synthetic-oauth-".repeat(4)}`;

test("all MCP tools reference canonical operations and reject actor/service-role injection", () => {
  const blocked = [
    "enrollAgent",
    "createInstance",
    "rotateCredential",
    "grantPermission",
    "moderate",
    "uploadArtifact",
    "downloadArtifact",
    "requestExport",
    "closeAccount",
    "passwordLogin",
  ];
  for (const [name, tool] of Object.entries(c.mcpTools)) {
    assert.ok(c.apiRoutes[tool.operationId], name);
    assert.equal(tool.response, c.apiRoutes[tool.operationId].response);
    assert.equal(blocked.includes(tool.operationId), false, name);
    assert.equal(
      tool.input.safeParse({
        params: {},
        query: {},
        body: {},
        actor: { kind: "admin" },
      }).success,
      false,
      name,
    );
    assert.equal(
      tool.input.safeParse({
        params: {},
        query: {},
        body: {},
        actingAgentId: f.id(1),
      }).success,
      false,
      name,
    );
  }
});

test("official SDK 2.4.0 negotiates pinned 2026-07-28 and HTTP/MCP share current denial policies", async () => {
  const state = {
    revoked: false,
    expired: false,
    foreign: false,
    exhausted: false,
    overScoped: false,
  };
  let calls = 0;
  const port = async (operationId, input, identity) => {
    calls++;
    assert.equal(operationId, "tasks");
    assert.deepEqual(identity, actor);
    const ctx = f.context();
    ctx.grants[0].actions = ["task.read"];
    if (state.revoked) ctx.principal.instance.credentialRevoked = true;
    if (state.expired) ctx.principal.instance.credentialExpiresAt = f.t1;
    if (state.foreign) ctx.memberships = [];
    if (state.exhausted) ctx.operatorBalances[0].reserved = 90;
    if (state.overScoped)
      ctx.grants[0].resourceScope = { kind: "task", id: f.id(999) };
    const decision = authorizeScopedAction(ctx, {
      action: "task.read",
      budget: [{ unit: "requests", hardLimit: 1 }],
    });
    if (!decision.allowed)
      return {
        error: { code: decision.code, messageKey: "error.denied" },
        meta: { correlationId: f.id(99) },
      };
    return {
      data: { items: [f.task], total: 1, ...input.query },
      meta: { correlationId: f.id(99) },
    };
  };
  const exchanges = [];
  const handler = createMcpHandler(
    () => {
      const server = new McpServer(
        { name: "piazza-contract-fixture", version: "1.0.0" },
        { capabilities: { tools: { listChanged: false } } },
      );
      const tool = c.mcpTools["task.list"];
      server.registerTool(
        "task.list",
        {
          inputSchema: tool.input,
          outputSchema: tool.response,
          annotations: tool.annotations,
        },
        (args) => invokeMcpTool("task.list", args, actor, port),
      );
      return server;
    },
    { legacy: "reject" },
  );
  const fetch = async (url, init) => {
    const request = new Request(url, init);
    if (request.headers.get("authorization") !== auth)
      return new Response("", {
        status: 401,
        headers: {
          "WWW-Authenticate":
            'Bearer resource_metadata="https://piazza.example/.well-known/oauth-protected-resource/mcp"',
        },
      });
    const body = await request.clone().json();
    const headers = Object.fromEntries(
      [...request.headers].filter(([key]) =>
        Object.hasOwn(c.mcpHeadersSchema.shape, key),
      ),
    );
    assert.equal(c.mcpRequestSchema.safeParse(body).success, true, body.method);
    const parsedHeaders = c.mcpHeadersSchema.parse(headers);
    assert.equal(c.validateMcpMirrors(parsedHeaders, body), true);
    const response = await handler.fetch(request);
    const responseBody = await response.clone().json();
    if (responseBody.result)
      assert.equal(
        c.mcpResponseSchema.safeParse(responseBody).success,
        true,
        JSON.stringify(c.mcpResponseSchema.safeParse(responseBody).error),
      );
    exchanges.push({ body, response: responseBody });
    return response;
  };
  const client = new Client(
    { name: "piazza-contract-consumer", version: "1.0.0" },
    { versionNegotiation: { mode: { pin: c.MCP_PROTOCOL_VERSION } } },
  );
  try {
    await client.connect(
      new StreamableHTTPClientTransport(new URL("https://piazza.example/mcp"), {
        fetch,
        requestInit: { headers: { authorization: auth } },
      }),
    );
    assert.deepEqual(
      (await client.listTools()).tools.map((t) => t.name),
      ["task.list"],
    );
    const args = { params: {}, query: {}, body: {} };
    const httpInput = {
      params: c.apiRoutes.tasks.params.parse({}),
      query: c.apiRoutes.tasks.query.parse({}),
      body: c.apiRoutes.tasks.body.parse({}),
    };
    const http = await port("tasks", httpInput, actor);
    const mcp = await client.callTool({ name: "task.list", arguments: args });
    assert.deepEqual(mcp.structuredContent, http);
    for (const [flag, code] of [
      ["revoked", "CREDENTIAL_REVOKED"],
      ["expired", "CREDENTIAL_REVOKED"],
      ["foreign", "NOT_FOUND"],
      ["exhausted", "BUDGET_EXHAUSTED"],
      ["overScoped", "ACTION_FORBIDDEN"],
    ]) {
      state[flag] = true;
      const result = await client.callTool({
        name: "task.list",
        arguments: args,
      });
      assert.equal(result.isError, true);
      assert.equal(result.structuredContent.error.code, code);
      assert.deepEqual(
        result.structuredContent,
        await port("tasks", httpInput, actor),
      );
      state[flag] = false;
    }
    const before = calls;
    const bad = await client.callTool({
      name: "task.list",
      arguments: { ...args, actor: { kind: "admin" } },
    });
    assert.equal(bad.isError, true);
    assert.equal(calls, before);
    assert.equal(exchanges[0].body.method, "server/discover");
    assert.ok(exchanges.every(({ body }) => body.method !== "initialize"));
    const request = {
      ...exchanges.find((x) => x.body.method === "tools/list").body,
      id: "mismatch",
    };
    const mismatch = await handler.fetch(
      new Request("https://piazza.example/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
          "mcp-protocol-version": c.MCP_PROTOCOL_VERSION,
          "mcp-method": "tools/call",
          "mcp-name": "task.list",
        },
        body: JSON.stringify(request),
      }),
    );
    const mismatchBody = await mismatch.json();
    assert.equal(mismatchBody.error.code, -32020);
    assert.equal(c.mcpResponseSchema.safeParse(mismatchBody).success, true);
  } finally {
    await client.close();
  }
});

test("MCP profile excludes legacy sessions, arbitrary capabilities and invalid mirrors", () => {
  const eventContext = f.context();
  eventContext.grants[0].actions = ["events.read"];
  const eventAction = {
    action: "events.read",
    budget: [{ unit: "requests", hardLimit: 1 }],
  };
  assert.equal(authorizeScopedAction(eventContext, eventAction).allowed, true);
  eventContext.actor = { kind: "anonymous" };
  eventContext.resource.visibility = "public";
  eventContext.ancestors.forEach((parent) => {
    parent.visibility = "public";
  });
  assert.deepEqual(authorizeScopedAction(eventContext, eventAction), {
    allowed: false,
    code: "UNAUTHENTICATED",
  });
  assert.equal(c.mcpTransport.sessionful, false);
  assert.equal(c.mcpTransport.subscriptions, false);
  const meta = {
    "io.modelcontextprotocol/protocolVersion": c.MCP_PROTOCOL_VERSION,
    "io.modelcontextprotocol/clientCapabilities": {},
  };
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      _meta: meta,
      name: "task.list",
      arguments: { params: {}, query: {}, body: {} },
    },
  };
  assert.equal(c.mcpRequestSchema.safeParse(request).success, true);
  for (const change of [
    { id: null },
    { method: "initialize" },
    {
      params: {
        ...request.params,
        _meta: {
          ...meta,
          "io.modelcontextprotocol/clientCapabilities": { sampling: {} },
        },
      },
    },
  ])
    assert.equal(
      c.mcpRequestSchema.safeParse({ ...request, ...change }).success,
      false,
    );
  const headers = {
    authorization: auth,
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
    "mcp-protocol-version": c.MCP_PROTOCOL_VERSION,
    "mcp-method": "tools/call",
    "mcp-name": "task.list",
  };
  assert.equal(
    c.validateMcpMirrors(c.mcpHeadersSchema.parse(headers), request),
    true,
  );
  assert.equal(
    c.validateMcpMirrors({ ...headers, "mcp-name": "task.create" }, request),
    false,
  );
});

test("OAuth protocol shapes enforce PKCE, finite scopes, redirects and secret boundaries", () => {
  const authorize = {
    response_type: "code",
    client_id: "fixture-client",
    redirect_uri: "https://client.example/callback",
    code_challenge: "a".repeat(43),
    code_challenge_method: "S256",
    scope: "task.read events.read",
    resource: "https://piazza.example/mcp",
    state: "s".repeat(32),
  };
  assert.equal(c.oauthAuthorizeQuerySchema.safeParse(authorize).success, true);
  for (const patch of [
    { scope: "admin.*" },
    { scope: "task.read task.read" },
    { code_challenge_method: "plain" },
    { redirect_uri: "http://client.example/callback" },
    { resource: "https://user:pass@piazza.example/mcp" },
    { resource: "https://piazza.example/mcp#fragment" },
  ])
    assert.equal(
      c.oauthAuthorizeQuerySchema.safeParse({ ...authorize, ...patch }).success,
      false,
    );
  assert.equal(
    c.oauthRedirectUriSchema.safeParse("http://127.0.0.1:49152/callback")
      .success,
    true,
  );
  assert.equal(
    c.oauthTokenRequestSchema.safeParse({
      grant_type: "authorization_code",
      code: "x".repeat(32),
      client_id: "fixture-client",
      redirect_uri: authorize.redirect_uri,
      code_verifier: "v".repeat(43),
      resource: authorize.resource,
    }).success,
    true,
  );
  assert.equal(
    c.oauthTokenRequestSchema.safeParse({
      grant_type: "client_credentials",
      client_id: "fixture-client",
      client_secret: "a".repeat(32),
    }).success,
    false,
  );
  assert.equal(
    c.oauthErrorSchema.safeParse({
      error: "invalid_grant",
      error_description: "private credential details",
    }).success,
    false,
  );
  assert.equal(c.oauthPolicySchema.parse({}).accessTtlSeconds, 600);
});
