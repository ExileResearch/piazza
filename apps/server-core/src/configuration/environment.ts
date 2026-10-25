import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';
import { z } from 'zod';
import {
  authPolicySchema,
  emailSchema,
  transportPolicySchema,
} from '@piazza/contracts';

export const RUNTIME_CONFIG = Symbol('RUNTIME_CONFIG');
const optional = z.string().trim().min(1).optional();
const bool = z.enum(['true', 'false']).transform((v) => v === 'true');
const integer = (min: number, max: number, fallback: number) =>
  z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.int().min(min).max(max))
    .default(fallback);
const secret = z
  .string()
  .min(32)
  .max(4096)
  .refine((v) => !/^(replace|change[-_ ]?me|example)/i.test(v));
const httpUrl = z.url().refine((v) => {
  const u = new URL(v);
  return (
    ['http:', 'https:'].includes(u.protocol) &&
    !u.username &&
    !u.password &&
    !u.hash
  );
});
const rawSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  HOST: z.string().min(1).max(253).default('127.0.0.1'),
  PORT: integer(1, 65535, 3000),
  SWAGGER_ENABLED: bool.default(false),
  CORS_ORIGINS: z.string().max(4096).default('http://localhost:4200'),
  TRUST_PROXY_HOPS: integer(0, 5, 0),
  REQUEST_BODY_LIMIT_BYTES: integer(1024, 2_000_000, 262_144),
  RATE_LIMIT_TTL_MS: integer(1000, 3_600_000, 60_000),
  RATE_LIMIT_LIMIT: integer(1, 10_000, 120),
  RATE_LIMIT_AUTH_TTL_MS: integer(1000, 3_600_000, 60_000),
  RATE_LIMIT_AUTH_LIMIT: integer(1, 1000, 10),
  DATABASE_URL: z.url().optional(),
  DB_HOST: optional,
  DB_PORT: integer(1, 65535, 5432),
  DB_USER: optional,
  DB_PASSWORD: z.string().min(1).optional(),
  DB_NAME: optional,
  DB_MIGRATIONS_RUN: bool.default(false),
  DB_SYNCHRONIZE: bool.default(false),
  DB_SSL_MODE: z.enum(['disable', 'verify-full']).default('disable'),
  DB_SSL_CA: z.string().min(1).optional(),
  DB_POOL_MAX: integer(1, 100, 10),
  DEPENDENCY_TIMEOUT_MS: integer(100, 30_000, 2000),
  ADMIN_EMAIL: emailSchema.optional(),
  APP_WEB_URL: httpUrl.optional(),
  JWT_SECRET: secret.optional(),
  OTP_HASH_KEY: secret.optional(),
  TOTP_ENCRYPTION_KEY: z
    .string()
    .regex(/^[a-fA-F0-9]{64}$/)
    .optional(),
  BREVO_API_KEY: optional,
  BREVO_SENDER_EMAIL: emailSchema.optional(),
  BREVO_SENDER_NAME: optional,
  APPWRITE_ENDPOINT: httpUrl.optional(),
  APPWRITE_PROJECT_ID: optional,
  APPWRITE_API_KEY: optional,
  APPWRITE_BUCKET_ID: optional,
  AUTH_OTP_TTL_SECONDS: integer(60, 600, 300),
  AUTH_OTP_MAX_ATTEMPTS: integer(1, 10, 5),
  AUTH_ACCESS_TTL_SECONDS: integer(60, 900, 600),
  AUTH_REFRESH_TTL_SECONDS: integer(600, 2_592_000, 604_800),
  AUTH_STEP_UP_TTL_SECONDS: integer(30, 600, 300),
  AUTH_RUNTIME_CREDENTIAL_TTL_SECONDS: integer(60, 2_592_000, 86_400),
  EVENT_CURSOR_TTL_SECONDS: integer(60, 900, 300),
  EVENT_RETENTION_SECONDS: integer(3600, 604_800, 86_400),
  IDEMPOTENCY_TTL_SECONDS: integer(300, 86_400, 86_400),
});

/** Configuration failures expose variable names only, never supplied values or raw parser errors. */
export class ConfigurationError extends Error {
  constructor(readonly fields: readonly string[]) {
    super(`Invalid configuration fields: ${fields.join(', ')}`);
    this.name = 'ConfigurationError';
  }
}

/** Validates only application settings; unrelated process variables never enter the result. */
export function parseRuntimeConfig(input: NodeJS.ProcessEnv) {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(input))
    normalized[key] = value === '' ? undefined : value;
  normalized.NODE_ENV ??= input.PROD === 'true' ? 'production' : 'development';
  normalized.ADMIN_EMAIL ??= normalized.EMAIL;
  normalized.APP_WEB_URL ??= normalized.WEB_CLIENT_URL;
  if (normalized.NODE_ENV === 'production')
    normalized.DB_SSL_MODE ??= 'verify-full';
  const result = rawSchema.safeParse(normalized);
  if (!result.success)
    throw new ConfigurationError([
      ...new Set(result.error.issues.map((i) => String(i.path[0]))),
    ]);
  const e = result.data;
  const invalid = new Set<string>();
  if (input.PROD !== undefined && !['true', 'false'].includes(input.PROD))
    invalid.add('PROD');
  if (
    input.PROD !== undefined &&
    (input.PROD === 'true') !== (e.NODE_ENV === 'production')
  )
    invalid.add('PROD');
  if (
    input.ADMIN_EMAIL &&
    input.EMAIL &&
    input.ADMIN_EMAIL.toLowerCase() !== input.EMAIL.toLowerCase()
  )
    invalid.add('ADMIN_EMAIL');
  if (
    input.APP_WEB_URL &&
    input.WEB_CLIENT_URL &&
    input.APP_WEB_URL !== input.WEB_CLIENT_URL
  )
    invalid.add('APP_WEB_URL');
  if (e.NODE_ENV === 'production' && e.DB_SSL_MODE === 'disable')
    invalid.add('DB_SSL_MODE');
  if (e.NODE_ENV === 'production' && e.DB_SYNCHRONIZE)
    invalid.add('DB_SYNCHRONIZE');
  if (e.NODE_ENV === 'production' && e.SWAGGER_ENABLED)
    invalid.add('SWAGGER_ENABLED');
  const origins = [...new Set(e.CORS_ORIGINS.split(',').map((v) => v.trim()))];
  if (
    origins.length > 20 ||
    origins.some((v) => {
      try {
        const u = new URL(v);
        return (
          u.origin !== v ||
          !['http:', 'https:'].includes(u.protocol) ||
          (e.NODE_ENV === 'production' && u.protocol !== 'https:')
        );
      } catch {
        return true;
      }
    })
  )
    invalid.add('CORS_ORIGINS');
  let database = {
    host: e.DB_HOST ?? '',
    port: e.DB_PORT,
    username: e.DB_USER ?? '',
    password: e.DB_PASSWORD ?? '',
    database: e.DB_NAME ?? '',
  };
  if (e.DATABASE_URL) {
    const u = new URL(e.DATABASE_URL);
    if (
      !['postgres:', 'postgresql:'].includes(u.protocol) ||
      u.search ||
      u.hash
    )
      invalid.add('DATABASE_URL');
    try {
      database = {
        host: u.hostname,
        port: u.port ? Number(u.port) : 5432,
        username: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        database: decodeURIComponent(u.pathname.slice(1)),
      };
    } catch {
      invalid.add('DATABASE_URL');
    }
    if (
      !database.host ||
      !database.username ||
      !database.password ||
      !database.database
    )
      invalid.add('DATABASE_URL');
  } else
    for (const [key, value] of [
      ['DB_HOST', e.DB_HOST],
      ['DB_USER', e.DB_USER],
      ['DB_PASSWORD', e.DB_PASSWORD],
      ['DB_NAME', e.DB_NAME],
    ])
      if (!value) invalid.add(key!);
  if (
    e.APPWRITE_ENDPOINT &&
    e.NODE_ENV === 'production' &&
    !e.APPWRITE_ENDPOINT.startsWith('https://')
  )
    invalid.add('APPWRITE_ENDPOINT');
  if (invalid.size) throw new ConfigurationError([...invalid]);
  return Object.freeze({
    nodeEnv: e.NODE_ENV,
    host: e.HOST,
    port: e.PORT,
    swaggerEnabled: e.SWAGGER_ENABLED && e.NODE_ENV === 'development',
    corsOrigins: origins,
    trustProxyHops: e.TRUST_PROXY_HOPS,
    bodyLimitBytes: e.REQUEST_BODY_LIMIT_BYTES,
    rateLimit: { ttl: e.RATE_LIMIT_TTL_MS, limit: e.RATE_LIMIT_LIMIT },
    authRateLimit: {
      ttl: e.RATE_LIMIT_AUTH_TTL_MS,
      limit: e.RATE_LIMIT_AUTH_LIMIT,
    },
    database: {
      ...database,
      migrationsRun: e.DB_MIGRATIONS_RUN,
      ssl:
        e.DB_SSL_MODE === 'verify-full'
          ? {
              rejectUnauthorized: true,
              ...(e.DB_SSL_CA ? { ca: e.DB_SSL_CA } : {}),
            }
          : (false as const),
      poolMax: e.DB_POOL_MAX,
    },
    dependencyTimeoutMs: e.DEPENDENCY_TIMEOUT_MS,
    legacySynchronizeIgnored: e.DB_SYNCHRONIZE,
    adminEmail: e.ADMIN_EMAIL,
    appWebUrl: e.APP_WEB_URL,
    authSecrets: {
      jwtSecret: e.JWT_SECRET,
      otpHashKey: e.OTP_HASH_KEY,
      totpEncryptionKey: e.TOTP_ENCRYPTION_KEY,
    },
    email: {
      apiKey: e.BREVO_API_KEY,
      senderEmail: e.BREVO_SENDER_EMAIL,
      senderName: e.BREVO_SENDER_NAME,
    },
    storage: {
      endpoint: e.APPWRITE_ENDPOINT,
      projectId: e.APPWRITE_PROJECT_ID,
      apiKey: e.APPWRITE_API_KEY,
      bucketId: e.APPWRITE_BUCKET_ID,
    },
    authPolicy: authPolicySchema.parse({
      otpTtlSeconds: e.AUTH_OTP_TTL_SECONDS,
      otpMaxAttempts: e.AUTH_OTP_MAX_ATTEMPTS,
      accessTtlSeconds: e.AUTH_ACCESS_TTL_SECONDS,
      refreshTtlSeconds: e.AUTH_REFRESH_TTL_SECONDS,
      stepUpTtlSeconds: e.AUTH_STEP_UP_TTL_SECONDS,
      runtimeCredentialTtlSeconds: e.AUTH_RUNTIME_CREDENTIAL_TTL_SECONDS,
    }),
    transportPolicy: transportPolicySchema.parse({
      cursorTtlSeconds: e.EVENT_CURSOR_TTL_SECONDS,
      eventRetentionSeconds: e.EVENT_RETENTION_SECONDS,
      idempotencyTtlSeconds: e.IDEMPOTENCY_TTL_SECONDS,
    }),
  });
}
export type RuntimeConfig = ReturnType<typeof parseRuntimeConfig>;

/** File values are optional and never override process-injected secrets. */
export function loadRuntimeConfig(): RuntimeConfig {
  const path = fileURLToPath(new URL('../../.env', import.meta.url));
  const file =
    process.env.NODE_ENV !== 'test' && existsSync(path)
      ? parse(readFileSync(path))
      : {};
  return parseRuntimeConfig({ ...file, ...process.env });
}
