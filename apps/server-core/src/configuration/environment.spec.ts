import { describe, expect, it } from '@jest/globals';
import { ConfigurationError, parseRuntimeConfig } from './environment.js';
import { databaseOptions } from '../database/options.js';
import { SafeLogger } from '../common/safe-logger.js';

const fixture = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:fixture-password@127.0.0.1/piazza_test',
};
describe('configuration and safe diagnostics', () => {
  it('uses bounded defaults, canonical policy and migrations only', () => {
    const config = parseRuntimeConfig(fixture);
    expect(config.authPolicy.otpTtlSeconds).toBe(300);
    expect(databaseOptions(config)).toMatchObject({
      synchronize: false,
      dropSchema: false,
      migrationsRun: false,
      logging: false,
    });
    expect(config.swaggerEnabled).toBe(false);
    expect(config.trustProxyHops).toBe(0);
  });
  it.each([
    { PORT: '0' },
    { PORT: '3000oops' },
    { DB_PORT: '-1' },
    { DB_POOL_MAX: '0' },
    { DEPENDENCY_TIMEOUT_MS: '999999' },
    { DATABASE_URL: 'https://test:secret@host/db' },
    { DATABASE_URL: 'postgres://test:secret@host/db?sslmode=disable' },
    { CORS_ORIGINS: '*' },
    { CORS_ORIGINS: 'https://example.com/path' },
    { CORS_ORIGINS: 'https://user:secret@example.com' },
    { JWT_SECRET: 'replace-with-a-long-random-secret' },
    { OTP_HASH_KEY: 'short' },
    { TOTP_ENCRYPTION_KEY: 'not-hex' },
    {
      NODE_ENV: 'production',
      DB_SYNCHRONIZE: 'true',
      CORS_ORIGINS: 'https://example.com',
    },
    {
      NODE_ENV: 'production',
      SWAGGER_ENABLED: 'true',
      CORS_ORIGINS: 'https://example.com',
    },
    { NODE_ENV: 'production', CORS_ORIGINS: 'http://example.com' },
    { NODE_ENV: 'test', PROD: 'true' },
    { RATE_LIMIT_TTL_MS: '1' },
    { AUTH_OTP_MAX_ATTEMPTS: '11' },
  ])('rejects unsafe or malformed configuration %j', (overrides) => {
    expect(() => parseRuntimeConfig({ ...fixture, ...overrides })).toThrow(
      ConfigurationError,
    );
  });
  it('supports legacy aliases while refusing production synchronization', () => {
    const config = parseRuntimeConfig({
      ...fixture,
      EMAIL: 'owner@example.com',
      DB_SYNCHRONIZE: 'true',
    });
    expect(config.adminEmail).toBe('owner@example.com');
    expect(config.legacySynchronizeIgnored).toBe(true);
    expect(databaseOptions(config).synchronize).toBe(false);
    expect(
      parseRuntimeConfig({
        ...fixture,
        NODE_ENV: 'production',
        CORS_ORIGINS: 'https://example.com',
      }).database.ssl,
    ).toEqual({ rejectUnauthorized: true });
  });
  it('reports only configuration names on errors', () => {
    try {
      parseRuntimeConfig({ ...fixture, JWT_SECRET: 'sensitive-value' });
      throw new Error('expected failure');
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError);
      expect(String(error)).toContain('JWT_SECRET');
      expect(String(error)).not.toContain('sensitive-value');
    }
  });
  it('never logs untrusted framework messages, secrets, or error contexts', () => {
    const lines: string[] = [];
    const logger = new SafeLogger((line) => lines.push(line));
    logger.log('Bearer secret-token', { password: 'secret-password' });
    logger.error(
      new Error('postgres://user:password@host'),
      'stack with secret',
    );
    logger.warn('email@example.com');
    expect(lines.map((line) => JSON.parse(line) as unknown)).toEqual([
      { level: 'info', event: 'framework_message' },
      { level: 'error', event: 'framework_message' },
      { level: 'warn', event: 'framework_message' },
    ]);
  });
});
