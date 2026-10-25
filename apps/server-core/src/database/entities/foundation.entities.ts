import { EntitySchema } from 'typeorm';
import type { EntitySchemaColumnOptions, EntitySchemaOptions } from 'typeorm';
import * as c from '@piazza/contracts';
import type {
  User,
  AuthToken,
  SessionRecord,
  MfaEnrollmentRecord,
  AgentIdentityRecord,
  AgentCredentialRecord,
  PermissionGrantRecord,
  ActionApprovalRecord,
} from '@piazza/contracts/server-internal';

/** Database rows use Date/null; canonical DTOs use UTC strings/omitted optionals. Never serialize rows directly. */
type Stored<T> = {
  [K in keyof T]-?: K extends `${string}At`
    ? Date | (undefined extends T[K] ? null : never)
    : Exclude<T[K], undefined> | (undefined extends T[K] ? null : never);
};
export type UserRow = Stored<User>;
export type AuthTokenRow = Stored<AuthToken>;
export type SessionRow = Stored<SessionRecord>;
export type MfaRow = Stored<MfaEnrollmentRecord>;
export type AgentRow = Stored<AgentIdentityRecord>;
export type ConfigurationRow = Stored<c.ConfigurationRevision>;
export type InstanceRow = Stored<c.AgentInstance> & { userId: string };
export type CredentialRow = Stored<AgentCredentialRecord>;
export type GrantRow = Stored<PermissionGrantRecord>;
export type ApprovalRow = Stored<ActionApprovalRecord>;

const uuid = (name: string, nullable = false): EntitySchemaColumnOptions => ({
  type: 'uuid',
  name,
  nullable,
});
const text = (
  name: string,
  length: number,
  nullable = false,
  select = true,
): EntitySchemaColumnOptions => ({
  type: 'varchar',
  name,
  length,
  nullable,
  select,
});
const time = (name: string, nullable = false): EntitySchemaColumnOptions => ({
  type: 'timestamptz',
  precision: 3,
  name,
  nullable,
});
const json = (name: string): EntitySchemaColumnOptions => ({
  type: 'jsonb',
  name,
});
const integer = (
  name: string,
  defaultValue?: number,
): EntitySchemaColumnOptions => ({
  type: 'integer',
  name,
  ...(defaultValue !== undefined ? { default: defaultValue } : {}),
});
const base = {
  id: { ...uuid('id'), primary: true, generated: 'uuid' as const },
  createdAt: { ...time('created_at'), default: () => 'CURRENT_TIMESTAMP(3)' },
  updatedAt: time('updated_at', true),
  deletedAt: time('deleted_at', true),
};
const mutable = {
  ...base,
  version: { ...integer('version', 1), version: true },
};
const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;
const oneOf = (column: string, values: readonly string[]) =>
  `"${column}" IN (${values.map(quote).join(',')})`;
const validId = `"id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`;
function entity<T>(
  name: string,
  tableName: string,
  columns: EntitySchemaOptions<T>['columns'],
  extras: Omit<EntitySchemaOptions<T>, 'name' | 'tableName' | 'columns'> = {},
) {
  const checks = [
    { name: `ck_${tableName}_id`, expression: validId },
    ...('version' in columns
      ? [{ name: `ck_${tableName}_version`, expression: '"version" > 0' }]
      : []),
    ...(extras.checks ?? []),
  ];
  return new EntitySchema<T>({ name, tableName, columns, ...extras, checks });
}
const fk = (
  name: string,
  target: string,
  columnNames: string[],
  referencedColumnNames = ['id'],
  onDelete: 'CASCADE' | 'RESTRICT' = 'RESTRICT',
) => ({ name, target, columnNames, referencedColumnNames, onDelete });

export const UserEntity = entity<UserRow>(
  'UserRow',
  'users',
  {
    ...mutable,
    email: text('email', 254),
    passwordHash: text('password_hash', 1024, true, false),
    emailVerifiedAt: time('email_verified_at', true),
    roles: {
      ...text('roles', 16),
      array: true,
      default: ['user'],
    },
    locale: { ...text('locale', 2), default: 'en' },
    theme: { ...text('theme', 5), default: 'dark' },
    state: { ...text('state', 9), default: 'active' },
    closedAt: time('closed_at', true),
  },
  {
    uniques: [{ name: 'uq_users_email', columns: ['email'] }],
    checks: [
      {
        name: 'ck_users_canonical_email',
        expression: 'email = lower(btrim(email))',
      },
      {
        name: 'ck_users_roles',
        expression:
          "roles = ARRAY['user']::varchar[] OR roles = ARRAY['user','admin']::varchar[] OR roles = ARRAY['admin','user']::varchar[]",
      },
      {
        name: 'ck_users_locale',
        expression: oneOf('locale', c.localeSchema.options),
      },
      {
        name: 'ck_users_theme',
        expression: oneOf('theme', c.themeSchema.options),
      },
      {
        name: 'ck_users_state',
        expression: oneOf('state', c.userStateSchema.options),
      },
    ],
  },
);
export const AuthTokenEntity = entity<AuthTokenRow>(
  'AuthTokenRow',
  'auth_tokens',
  {
    ...base,
    userId: uuid('user_id', true),
    challengeId: uuid('challenge_id'),
    purpose: text('purpose', 16),
    secretHash: text('secret_hash', 1024, false, false),
    expiresAt: time('expires_at'),
    consumedAt: time('consumed_at', true),
    attemptCount: integer('attempt_count', 0),
    deliveryState: { ...text('delivery_state', 7), default: 'pending' },
  },
  {
    foreignKeys: [
      fk('fk_auth_tokens_user', 'UserRow', ['userId'], ['id'], 'CASCADE'),
    ],
    uniques: [{ name: 'uq_auth_tokens_challenge', columns: ['challengeId'] }],
    indices: [
      { name: 'ix_auth_tokens_expiry', columns: ['expiresAt'] },
      { name: 'ix_auth_tokens_user', columns: ['userId'] },
    ],
    checks: [
      {
        name: 'ck_auth_tokens_purpose',
        expression: oneOf('purpose', c.authPurposeSchema.options),
      },
      {
        name: 'ck_auth_tokens_delivery',
        expression: oneOf('delivery_state', [
          'pending',
          'sent',
          'failed',
          'expired',
        ]),
      },
      {
        name: 'ck_auth_tokens_attempts',
        expression: 'attempt_count BETWEEN 0 AND 10',
      },
      { name: 'ck_auth_tokens_expiry', expression: 'expires_at > created_at' },
    ],
  },
);
export const SessionEntity = entity<SessionRow>(
  'SessionRow',
  'sessions',
  {
    ...mutable,
    userId: uuid('user_id'),
    refreshTokenHash: text('refresh_token_hash', 1024, false, false),
    familyId: uuid('family_id'),
    generation: integer('generation', 1),
    expiresAt: time('expires_at'),
    revokedAt: time('revoked_at', true),
    userAgent: text('user_agent', 512, true, false),
    ipHash: text('ip_hash', 1024, true, false),
  },
  {
    foreignKeys: [
      fk('fk_sessions_user', 'UserRow', ['userId'], ['id'], 'CASCADE'),
    ],
    indices: [
      { name: 'ix_sessions_user', columns: ['userId'] },
      { name: 'ix_sessions_family', columns: ['familyId'] },
      { name: 'ix_sessions_expiry', columns: ['expiresAt'] },
    ],
    uniques: [
      { name: 'uq_sessions_refresh_hash', columns: ['refreshTokenHash'] },
      { name: 'uq_sessions_generation', columns: ['familyId', 'generation'] },
    ],
    checks: [
      { name: 'ck_sessions_generation', expression: 'generation > 0' },
      { name: 'ck_sessions_expiry', expression: 'expires_at > created_at' },
    ],
  },
);
export const MfaEntity = entity<MfaRow>(
  'MfaRow',
  'mfa_enrollments',
  {
    ...base,
    userId: uuid('user_id'),
    encryptedTotpSecret: text('encrypted_totp_secret', 4096, false, false),
    confirmedAt: time('confirmed_at', true),
    recoveryCodeHashes: {
      ...text('recovery_code_hashes', 1024, false, false),
      array: true,
    },
    status: { ...text('status', 8), default: 'pending' },
  },
  {
    foreignKeys: [fk('fk_mfa_user', 'UserRow', ['userId'], ['id'], 'CASCADE')],
    uniques: [{ name: 'uq_mfa_user', columns: ['userId'] }],
    checks: [
      {
        name: 'ck_mfa_status',
        expression: oneOf('status', ['pending', 'enabled', 'disabled']),
      },
      {
        name: 'ck_mfa_recovery_bound',
        expression: 'cardinality(recovery_code_hashes) <= 10',
      },
    ],
  },
);
export const AgentEntity = entity<AgentRow>(
  'AgentRow',
  'agent_identities',
  {
    ...mutable,
    userId: uuid('user_id'),
    displayName: text('display_name', 120),
    biography: { ...text('biography', 8000), default: '' },
    avatarArtifactId: uuid('avatar_artifact_id', true),
    modalities: { ...text('modalities', 5), array: true },
    skills: {
      ...text('skills', 120),
      array: true,
      default: [],
    },
    status: { ...text('status', 9), default: 'active' },
    profileVisibility: {
      ...text('profile_visibility', 16),
      default: 'operator_private',
    },
  },
  {
    foreignKeys: [fk('fk_agents_controller', 'UserRow', ['userId'])],
    uniques: [{ name: 'uq_agents_controller', columns: ['id', 'userId'] }],
    indices: [{ name: 'ix_agents_controller', columns: ['userId'] }],
    checks: [
      {
        name: 'ck_agents_status',
        expression: oneOf('status', c.agentStateSchema.options),
      },
      {
        name: 'ck_agents_visibility',
        expression: oneOf('profile_visibility', c.visibilitySchema.options),
      },
      {
        name: 'ck_agents_modalities',
        expression: `cardinality(modalities) BETWEEN 1 AND 5 AND modalities <@ ARRAY[${c.modalitySchema.options.map(quote).join(',')}]::varchar[]`,
      },
      { name: 'ck_agents_skills', expression: 'cardinality(skills) <= 50' },
    ],
  },
);
export const ConfigurationEntity = entity<ConfigurationRow>(
  'ConfigurationRow',
  'configuration_revisions',
  {
    ...base,
    agentId: uuid('agent_id'),
    sequence: integer('sequence'),
    declared: json('declared'),
    disclosureScope: text('disclosure_scope', 16),
    effectiveAt: time('effective_at'),
  },
  {
    foreignKeys: [fk('fk_configurations_agent', 'AgentRow', ['agentId'])],
    uniques: [
      { name: 'uq_configurations_sequence', columns: ['agentId', 'sequence'] },
      { name: 'uq_configurations_agent', columns: ['id', 'agentId'] },
    ],
    checks: [
      { name: 'ck_configurations_sequence', expression: 'sequence > 0' },
      {
        name: 'ck_configurations_visibility',
        expression: oneOf('disclosure_scope', c.visibilitySchema.options),
      },
      {
        name: 'ck_configurations_declaration',
        expression:
          "jsonb_typeof(declared) = 'object' AND octet_length(declared::text) <= 65536",
      },
    ],
  },
);
export const InstanceEntity = entity<InstanceRow>(
  'InstanceRow',
  'agent_instances',
  {
    ...mutable,
    agentId: uuid('agent_id'),
    userId: uuid('user_id'),
    configurationRevisionId: uuid('configuration_revision_id'),
    label: text('label', 120),
    state: { ...text('state', 7), default: 'active' },
    lastSeenAt: time('last_seen_at', true),
    expiresAt: time('expires_at', true),
  },
  {
    foreignKeys: [
      fk(
        'fk_instances_controller',
        'AgentRow',
        ['agentId', 'userId'],
        ['id', 'userId'],
      ),
      fk(
        'fk_instances_configuration',
        'ConfigurationRow',
        ['configurationRevisionId', 'agentId'],
        ['id', 'agentId'],
      ),
    ],
    uniques: [
      { name: 'uq_instances_controller', columns: ['id', 'userId'] },
      { name: 'uq_instances_agent', columns: ['id', 'agentId'] },
    ],
    indices: [
      { name: 'ix_instances_agent', columns: ['agentId'] },
      {
        name: 'ix_instances_configuration',
        columns: ['configurationRevisionId', 'agentId'],
      },
    ],
    checks: [
      {
        name: 'ck_instances_state',
        expression: oneOf('state', c.instanceStateSchema.options),
      },
    ],
  },
);
export const CredentialEntity = entity<CredentialRow>(
  'CredentialRow',
  'agent_credentials',
  {
    ...base,
    instanceId: uuid('instance_id'),
    userId: uuid('user_id'),
    keyId: uuid('key_id'),
    secretHash: text('secret_hash', 1024, false, false),
    expiresAt: time('expires_at'),
    revokedAt: time('revoked_at', true),
    scopeVersion: integer('scope_version', 1),
  },
  {
    foreignKeys: [
      fk(
        'fk_credentials_controller',
        'InstanceRow',
        ['instanceId', 'userId'],
        ['id', 'userId'],
        'CASCADE',
      ),
    ],
    uniques: [{ name: 'uq_credentials_key', columns: ['keyId'] }],
    indices: [
      { name: 'ix_credentials_instance', columns: ['instanceId', 'userId'] },
      { name: 'ix_credentials_expiry', columns: ['expiresAt'] },
    ],
    checks: [
      { name: 'ck_credentials_scope_version', expression: 'scope_version > 0' },
      { name: 'ck_credentials_expiry', expression: 'expires_at > created_at' },
    ],
  },
);
export const GrantEntity = entity<GrantRow>(
  'GrantRow',
  'permission_grants',
  {
    ...mutable,
    agentId: uuid('agent_id'),
    instanceId: uuid('instance_id', true),
    grantorUserId: uuid('grantor_user_id'),
    actions: { ...text('actions', 40), array: true },
    resourceScope: json('resource_scope'),
    budgetCaps: json('budget_caps'),
    approvalRule: text('approval_rule', 12),
    expiresAt: time('expires_at'),
    revokedAt: time('revoked_at', true),
  },
  {
    foreignKeys: [
      fk(
        'fk_grants_controller',
        'AgentRow',
        ['agentId', 'grantorUserId'],
        ['id', 'userId'],
      ),
      fk(
        'fk_grants_instance',
        'InstanceRow',
        ['instanceId', 'agentId'],
        ['id', 'agentId'],
      ),
    ],
    indices: [
      { name: 'ix_grants_agent', columns: ['agentId'] },
      { name: 'ix_grants_instance', columns: ['instanceId', 'agentId'] },
      { name: 'ix_grants_controller', columns: ['grantorUserId'] },
      { name: 'ix_grants_expiry', columns: ['expiresAt'] },
    ],
    checks: [
      {
        name: 'ck_grants_actions',
        expression: `cardinality(actions) BETWEEN 1 AND 50 AND actions <@ ARRAY[${c.permissionActionSchema.options.map(quote).join(',')}]::varchar[]`,
      },
      {
        name: 'ck_grants_scope',
        expression:
          "jsonb_typeof(resource_scope) = 'object' AND resource_scope ? 'kind' AND COALESCE(resource_scope->>'kind','') IN ('public','controlled_agents','project','task','inquiry','agent')",
      },
      {
        name: 'ck_grants_budget',
        expression:
          "jsonb_typeof(budget_caps) = 'array' AND jsonb_array_length(budget_caps) <= 6",
      },
      {
        name: 'ck_grants_approval',
        expression: oneOf('approval_rule', ['within_grant', 'per_action']),
      },
      { name: 'ck_grants_expiry', expression: 'expires_at > created_at' },
    ],
  },
);
export const ApprovalEntity = entity<ApprovalRow>(
  'ApprovalRow',
  'action_approvals',
  {
    ...mutable,
    userId: uuid('user_id'),
    agentId: uuid('agent_id'),
    requestedAction: text('requested_action', 40),
    target: json('target'),
    payloadDigest: text('payload_digest', 64),
    budget: json('budget'),
    expiresAt: time('expires_at'),
    decision: { ...text('decision', 8), default: 'pending' },
    consumedAt: time('consumed_at', true),
    intent: json('intent'),
  },
  {
    foreignKeys: [
      fk(
        'fk_approvals_controller',
        'AgentRow',
        ['agentId', 'userId'],
        ['id', 'userId'],
      ),
    ],
    indices: [
      { name: 'ix_approvals_controller', columns: ['userId', 'decision'] },
      { name: 'ix_approvals_lookup', columns: ['agentId', 'payloadDigest'] },
      { name: 'ix_approvals_expiry', columns: ['expiresAt'] },
    ],
    checks: [
      {
        name: 'ck_approvals_action',
        expression: oneOf('requested_action', c.permissionActionSchema.options),
      },
      {
        name: 'ck_approvals_decision',
        expression: oneOf('decision', ['pending', 'approved', 'declined']),
      },
      {
        name: 'ck_approvals_digest',
        expression: "payload_digest ~ '^[a-f0-9]{64}$'",
      },
      {
        name: 'ck_approvals_intent',
        expression:
          "jsonb_typeof(intent) = 'object' AND octet_length(intent::text) <= 2000000",
      },
      {
        name: 'ck_approvals_target',
        expression: "jsonb_typeof(target) = 'object'",
      },
      {
        name: 'ck_approvals_budget',
        expression:
          "jsonb_typeof(budget) = 'array' AND jsonb_array_length(budget) <= 6",
      },
      { name: 'ck_approvals_expiry', expression: 'expires_at > created_at' },
      {
        name: 'ck_approvals_consumption',
        expression: "consumed_at IS NULL OR decision = 'approved'",
      },
    ],
  },
);

export const FOUNDATION_ENTITIES = [
  UserEntity,
  AuthTokenEntity,
  SessionEntity,
  MfaEntity,
  AgentEntity,
  ConfigurationEntity,
  InstanceEntity,
  CredentialEntity,
  GrantEntity,
  ApprovalEntity,
];
