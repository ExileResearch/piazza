import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import * as c from "../dist/esm/index.js";
import * as internal from "../dist/esm/server-internal.js";
import {
  agent,
  base,
  currentUser,
  grant,
  ids,
  later,
  now,
  secret,
  tokens,
} from "./fixtures.mjs";

test("normalizes email without merging provider-specific accounts", () => {
  assert.equal(
    c.emailSchema.parse("  ROB+Piazza@Example.TEST "),
    "rob+piazza@example.test",
  );
  assert.notEqual(
    c.emailSchema.parse("r.ob@example.test"),
    c.emailSchema.parse("rob@example.test"),
  );
  for (const value of ["", "rob", "rob@", null, ["rob@example.test"]]) {
    assert.equal(c.emailSchema.safeParse(value).success, false);
  }
});

test("rejects non-v4 IDs and non-UTC wire times", () => {
  assert.equal(c.idSchema.parse(ids.user), ids.user);
  assert.equal(c.timestampSchema.parse(now), now);
  for (const value of [
    "../../secret",
    "11111111-1111-7111-8111-111111111111",
  ]) {
    assert.equal(c.idSchema.safeParse(value).success, false);
  }
  for (const value of [
    "2026-10-24T17:00:00",
    "2026-10-24T17:00:00+01:00",
    "2026-02-30T17:00:00Z",
  ]) {
    assert.equal(c.timestampSchema.safeParse(value).success, false);
  }
});

test("expiry uses supplied server time and expires at the exact boundary", () => {
  assert.equal(c.isExpired(later, now), false);
  assert.equal(c.isExpired(now, now), true);
  assert.equal(c.isExpired(now, later), true);
  assert.throws(() => c.isExpired("not-a-date", now));
});

test("bounded pagination has explicit defaults and never coerces unsafe inputs", () => {
  assert.deepEqual(c.pageQuerySchema.parse({}), { page: 1, pageSize: 20 });
  for (const value of [
    { page: 0 },
    { pageSize: 101 },
    { page: "1" },
    { pageSize: true },
    { ownerId: ids.user },
  ]) {
    assert.equal(c.pageQuerySchema.safeParse(value).success, false);
  }
  const page = c.pageSchema(c.publicUserSchema);
  assert.equal(
    page.safeParse({
      items: [{ id: ids.user }],
      total: 1,
      page: 1,
      pageSize: 1,
    }).success,
    true,
  );
  assert.equal(
    page.safeParse({
      items: [{ id: ids.user }, { id: ids.agent }],
      total: 2,
      page: 1,
      pageSize: 1,
    }).success,
    false,
  );
});

test("public and self account projections reject persistence and privilege fields", () => {
  assert.equal(c.currentUserSchema.safeParse(currentUser).success, true);
  assert.equal(c.publicUserSchema.safeParse({ id: ids.user }).success, true);
  for (const key of [
    "email",
    "roles",
    "passwordHash",
    "refreshTokenHash",
    "secretHash",
  ]) {
    assert.equal(
      c.publicUserSchema.safeParse({ id: ids.user, [key]: secret }).success,
      false,
      key,
    );
  }
  assert.equal(
    c.currentUserSchema.safeParse({ ...currentUser, passwordHash: secret })
      .success,
    false,
  );
  assert.equal(
    c.currentUserSchema.safeParse({ ...currentUser, roles: ["user", "user"] })
      .success,
    false,
  );
});

test("registration cannot assign a role, controller, verification state or custom policy", () => {
  const request = {
    email: "New@Example.test",
    password: "an-example-long-password",
  };
  assert.deepEqual(c.registerRequestSchema.parse(request), {
    ...request,
    email: "new@example.test",
    locale: "en",
  });
  for (const [key, value] of Object.entries({
    roles: ["admin"],
    userId: ids.user,
    emailVerifiedAt: now,
    mfa: false,
  })) {
    assert.equal(
      c.registerRequestSchema.safeParse({ ...request, [key]: value }).success,
      false,
      key,
    );
  }
  assert.equal(
    c.registerRequestSchema.safeParse({ ...request, password: "short" })
      .success,
    false,
  );
  assert.equal(
    c.passwordLoginSchema.safeParse({
      email: request.email,
      password: "legacy",
    }).success,
    true,
  );
});

test("anonymous auth receipts cannot disclose account existence or issue credentials", () => {
  const receipt = {
    status: "request_received",
    challengeId: ids.session,
    expiresAt: later,
  };
  assert.equal(c.authRequestAcceptedSchema.safeParse(receipt).success, true);
  for (const [key, value] of Object.entries({
    exists: true,
    userId: ids.user,
    tokens,
    email: currentUser.email,
  })) {
    assert.equal(
      c.authRequestAcceptedSchema.safeParse({ ...receipt, [key]: value })
        .success,
      false,
      key,
    );
  }
});

test("OTP and factor challenges retain leading zeroes and require a purpose-bound challenge ID", () => {
  assert.equal(
    c.otpCompleteSchema.parse({ challengeId: ids.session, code: "000123" })
      .code,
    "000123",
  );
  for (const code of [123, "12345", "1234567", "123abc"]) {
    assert.equal(
      c.otpCompleteSchema.safeParse({ challengeId: ids.session, code }).success,
      false,
    );
  }
  assert.equal(
    c.mfaCompleteSchema.safeParse({ method: "totp", code: "000123" }).success,
    false,
  );
  assert.equal(
    c.mfaCompleteSchema.safeParse({
      challengeId: ids.session,
      method: "email_otp",
      code: "000123",
    }).success,
    false,
  );
  assert.equal(
    c.mfaCompleteSchema.safeParse({
      challengeId: ids.session,
      method: "recovery_code",
      code: "AAAA-BBBB-CCCC-DDDD",
    }).success,
    true,
  );
});

test("an MFA challenge is structurally incapable of being a session-issued response", () => {
  const challenge = {
    status: "challenge_required",
    challengeId: ids.session,
    expiresAt: later,
    methods: ["totp", "recovery_code"],
  };
  assert.equal(c.authResultSchema.safeParse(challenge).success, true);
  assert.equal(
    c.authResultSchema.safeParse({ ...challenge, tokens }).success,
    false,
  );
  assert.equal(
    c.authResultSchema.safeParse({ ...challenge, user: currentUser }).success,
    false,
  );
  assert.equal(
    c.authResultSchema.safeParse({
      status: "session_issued",
      tokens,
      user: currentUser,
    }).success,
    true,
  );
  assert.equal(
    c.authResultSchema.safeParse({
      status: "session_issued",
      user: currentUser,
    }).success,
    false,
  );
});

test("credentials can occur only in explicit issuance projections", () => {
  assert.equal(c.sessionTokensSchema.safeParse(tokens).success, true);
  const session = {
    id: ids.session,
    version: 1,
    createdAt: now,
    expiresAt: later,
    isCurrent: true,
  };
  assert.equal(c.sessionSchema.safeParse(session).success, true);
  for (const key of ["refreshToken", "refreshTokenHash", "ipHash"]) {
    assert.equal(
      c.sessionSchema.safeParse({ ...session, [key]: secret }).success,
      false,
      key,
    );
  }
  assert.equal(
    c.credentialIssuedSchema.safeParse({
      credentialId: ids.credential,
      instanceId: ids.instance,
      secret,
      expiresAt: later,
    }).success,
    true,
  );
  assert.equal(
    c.agentProfileSchema.safeParse({ ...agent, secret }).success,
    false,
  );
});

test("factor setup is a separate explicit secret projection, not ordinary MFA status", () => {
  assert.equal(c.mfaStateSchema.safeParse({ enabled: true }).success, true);
  assert.equal(
    c.mfaStateSchema.safeParse({ enabled: true, secret }).success,
    false,
  );
  assert.equal(
    c.mfaEnrollmentConfirmedSchema.safeParse({
      enabled: true,
      recoveryCodes: [],
    }).success,
    false,
  );
  assert.equal(
    c.mfaEnrollmentChallengeSchema.safeParse({
      enrollmentId: ids.session,
      secret: "A".repeat(32),
      expiresAt: later,
    }).success,
    true,
  );
});

test("empty preference updates and undeclared locales are rejected", () => {
  assert.equal(
    c.updatePreferencesSchema.safeParse({ locale: "fr", expectedVersion: 1 })
      .success,
    true,
  );
  for (const value of [
    {},
    { locale: "xx" },
    { theme: "system" },
    { role: "admin" },
  ]) {
    assert.equal(c.updatePreferencesSchema.safeParse(value).success, false);
  }
});

test("auth policy defaults are bounded configuration, not client-controlled login fields", () => {
  assert.equal(c.authPolicySchema.parse({}).otpMaxAttempts, 5);
  assert.equal(c.authPolicySchema.parse({}).accessTtlSeconds, 600);
  assert.equal(
    c.authPolicySchema.safeParse({ otpTtlSeconds: 86_400 }).success,
    false,
  );
  assert.equal(
    c.otpRequestSchema.safeParse({
      email: currentUser.email,
      intent: "login",
      otpMaxAttempts: 100,
    }).success,
    false,
  );
});

test("identity enrollment defaults to private and cannot choose its controller", () => {
  const input = { displayName: " Cedar ", modalities: ["text"] };
  assert.equal(
    c.enrollAgentSchema.parse(input).profileVisibility,
    "operator_private",
  );
  assert.equal(c.enrollAgentSchema.parse(input).displayName, "Cedar");
  assert.equal(
    c.enrollAgentSchema.safeParse({ ...input, userId: ids.user }).success,
    false,
  );
  assert.equal(
    c.enrollAgentSchema.safeParse({ ...input, status: "active" }).success,
    false,
  );
  for (const key of ["userId", "grants", "credentials", "assessments"]) {
    assert.equal(
      c.agentProfileSchema.safeParse({ ...agent, [key]: secret }).success,
      false,
      key,
    );
  }
});

test("configuration and instance records keep identity and execution revisions distinct", () => {
  const config = {
    ...base,
    agentId: ids.agent,
    sequence: 1,
    declared: { tools: [], model: "small-local-model" },
    disclosureScope: "operator_private",
    effectiveAt: now,
  };
  assert.equal(c.configurationRevisionSchema.safeParse(config).success, true);
  assert.equal(
    c.configurationRevisionSchema.safeParse({
      ...config,
      declared: { ...config.declared, apiKey: secret },
    }).success,
    false,
  );
  const instance = {
    ...base,
    agentId: ids.agent,
    configurationRevisionId: ids.config,
    label: "laptop",
    state: "active",
    version: 1,
  };
  assert.equal(c.agentInstanceSchema.safeParse(instance).success, true);
  assert.equal(
    c.agentInstanceSchema.safeParse({
      ...instance,
      configurationRevisionId: undefined,
    }).success,
    false,
  );
});

test("grants require finite explicit actions, expiry and a typed resource scope", () => {
  assert.equal(c.permissionGrantSchema.safeParse(grant).success, true);
  for (const changes of [
    { actions: ["*"] },
    { actions: [] },
    { actions: ["discovery.read", "discovery.read"] },
    { expiresAt: undefined },
    { resourceScope: { kind: "task" } },
    { resourceScope: { kind: "public", id: ids.agent } },
  ]) {
    assert.equal(
      c.permissionGrantSchema.safeParse({ ...grant, ...changes }).success,
      false,
    );
  }
});

test("resource caps cannot use duplicate units, negative limits or an unselected currency economy", () => {
  for (const caps of [
    [{ unit: "requests", hardLimit: -1 }],
    [
      { unit: "requests", hardLimit: 1 },
      { unit: "requests", hardLimit: 10 },
    ],
    [{ unit: "credits", hardLimit: 10 }],
  ])
    assert.equal(c.budgetCapsSchema.safeParse(caps).success, false);
  assert.equal(
    c.budgetCapsSchema.safeParse([{ unit: "requests", hardLimit: 0 }]).success,
    true,
  );
});

test("approval binds exact digest/revision and rejects an arbitrary command body", () => {
  const approval = {
    ...base,
    version: 1,
    agentId: ids.agent,
    requestedAction: "task.assign",
    target: { resourceScope: { kind: "task", id: ids.agent }, revision: 2 },
    payloadDigest: "a".repeat(64),
    budget: [],
    expiresAt: later,
    decision: "pending",
  };
  assert.equal(c.actionApprovalSchema.safeParse(approval).success, true);
  assert.equal(
    c.actionApprovalSchema.safeParse({ ...approval, payloadDigest: "guess" })
      .success,
    false,
  );
  assert.equal(
    c.actionApprovalSchema.safeParse({ ...approval, command: "run anything" })
      .success,
    false,
  );
  assert.equal(
    c.actingAgentContextSchema.safeParse({
      actingAgentId: ids.agent,
      userId: ids.user,
    }).success,
    false,
  );
});

test("strict envelopes reject additional fields at every serialized boundary", () => {
  const schema = c.apiSuccessSchema(c.currentUserSchema);
  const response = { data: currentUser, meta: { correlationId: ids.session } };
  assert.equal(schema.safeParse(response).success, true);
  assert.equal(schema.safeParse({ ...response, debug: secret }).success, false);
  assert.equal(
    schema.safeParse({
      ...response,
      data: { ...currentUser, passwordHash: secret },
    }).success,
    false,
  );
  assert.equal(
    schema.safeParse({
      ...response,
      meta: { ...response.meta, rawToken: secret },
    }).success,
    false,
  );
  const error = {
    error: { code: "NOT_FOUND", messageKey: "errors.not_found" },
    meta: response.meta,
  };
  assert.equal(c.apiErrorResponseSchema.safeParse(error).success, true);
  assert.equal(
    c.apiErrorResponseSchema.safeParse({
      ...error,
      error: { ...error.error, stack: "private" },
    }).success,
    false,
  );
});

test("server persistence records are absent from the client-facing export surface", () => {
  for (const name of [
    "userSchema",
    "authTokenSchema",
    "sessionRecordSchema",
    "agentCredentialRecordSchema",
    "authenticatedActorSchema",
  ]) {
    assert.equal(name in c, false, name);
    assert.equal(name in internal, true, name);
  }
  const user = { ...base, ...currentUser, passwordHash: secret };
  delete user.mfa;
  assert.equal(internal.userSchema.safeParse(user).success, true);
  assert.equal(c.currentUserSchema.safeParse(user).success, false);
  assert.equal(
    internal.authTokenSchema.safeParse({
      ...base,
      challengeId: ids.session,
      purpose: "login_otp",
      secretHash: secret,
      expiresAt: later,
      attemptCount: 0,
      deliveryState: "sent",
    }).success,
    true,
  );
});

test("baseline DTOs export JSON Schema without falling back to unconstrained any", () => {
  for (const schema of [
    c.currentUserSchema,
    c.agentProfileSchema,
    c.authResultSchema,
    c.permissionGrantSchema,
    c.actionApprovalSchema,
  ]) {
    const json = z.toJSONSchema(schema, { io: "output" });
    assert.ok(Object.keys(json).length > 1);
    assert.equal(JSON.stringify(json).includes("passwordHash"), false);
    assert.equal(JSON.stringify(json).includes("secretHash"), false);
  }
  const json = z.toJSONSchema(c.agentProfileSchema);
  assert.equal(json.additionalProperties, false);
  assert.ok(json.required.includes("id"));
  assert.equal(json.required.includes("avatarArtifactId"), false);
  assert.deepEqual(json.properties.status.enum, [
    "active",
    "paused",
    "suspended",
    "closed",
  ]);
});

test("concurrent preference edits require a server version and setup codes are unique", () => {
  assert.equal(
    c.updatePreferencesSchema.safeParse({ locale: "fr" }).success,
    false,
  );
  const codes = Array.from({ length: 10 }, (_, i) => `AAAA-BBBB-CCCC-000${i}`);
  assert.equal(
    c.mfaEnrollmentConfirmedSchema.safeParse({
      enabled: true,
      recoveryCodes: codes,
    }).success,
    true,
  );
  assert.equal(
    c.mfaEnrollmentConfirmedSchema.safeParse({
      enabled: true,
      recoveryCodes: Array(10).fill(codes[0]),
    }).success,
    false,
  );
});

test("an enrollment response cannot issue a credential for a different instance", () => {
  const response = {
    instance: {
      ...base,
      id: ids.instance,
      agentId: ids.agent,
      configurationRevisionId: ids.config,
      label: "laptop",
      state: "active",
      version: 1,
    },
    credential: {
      credentialId: ids.credential,
      instanceId: ids.instance,
      secret,
      expiresAt: later,
    },
  };
  assert.equal(c.instanceEnrollmentSchema.safeParse(response).success, true);
  assert.equal(
    c.instanceEnrollmentSchema.safeParse({
      ...response,
      credential: { ...response.credential, instanceId: ids.agent },
    }).success,
    false,
  );
});

test("transport metadata explicitly distinguishes public HTML, binary and JSON responses", () => {
  const descriptor = {
    operationId: "submitUpdatesInterest",
    method: "POST",
    path: "/api/v1/public/updates",
    actor: "public",
    representations: ["json", "html"],
    requiresVersion: false,
    requiresIdempotency: false,
    issuesSecret: false,
  };
  assert.equal(c.routeDescriptorSchema.safeParse(descriptor).success, true);
  assert.equal(
    c.routeDescriptorSchema.safeParse({
      ...descriptor,
      representations: ["json", "json"],
    }).success,
    false,
  );
  assert.equal(
    c.routeDescriptorSchema.safeParse({ ...descriptor, actor: "unrestricted" })
      .success,
    false,
  );
  assert.equal(
    c.healthProbeSchema.safeParse({ status: "ok", databaseUrl: secret })
      .success,
    false,
  );
});
