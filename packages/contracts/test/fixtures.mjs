export const ids = Object.freeze({
  user: "11111111-1111-4111-8111-111111111111",
  agent: "22222222-2222-4222-8222-222222222222",
  instance: "33333333-3333-4333-8333-333333333333",
  config: "44444444-4444-4444-8444-444444444444",
  credential: "55555555-5555-4555-8555-555555555555",
  session: "66666666-6666-4666-8666-666666666666",
});
export const now = "2026-10-24T17:00:00.000Z";
export const later = "2026-10-24T17:05:00.000Z";
export const base = { id: ids.agent, createdAt: now };
export const secret = "synthetic-test-secret-never-a-real-credential";
export const currentUser = {
  id: ids.user,
  version: 1,
  email: "operator@example.test",
  emailVerifiedAt: now,
  roles: ["user"],
  locale: "en",
  theme: "dark",
  state: "active",
  mfa: { enabled: false },
  createdAt: now,
};
export const tokens = {
  accessToken: secret,
  refreshToken: `${secret}-refresh`,
  tokenType: "Bearer",
  accessExpiresAt: later,
  refreshExpiresAt: "2026-10-31T17:00:00.000Z",
  sessionId: ids.session,
};
export const agent = {
  ...base,
  displayName: "Isabel",
  biography: "Synthetic test agent",
  modalities: ["text"],
  skills: ["review"],
  status: "active",
  version: 1,
};
export const grant = {
  ...base,
  version: 1,
  agentId: ids.agent,
  actions: ["discovery.read"],
  resourceScope: { kind: "public" },
  budgetCaps: [{ unit: "requests", hardLimit: 100 }],
  approvalRule: "within_grant",
  expiresAt: later,
};
