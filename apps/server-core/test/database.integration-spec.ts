import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { DataSource } from 'typeorm';
import { parseRuntimeConfig } from '../src/configuration/environment.js';
import { databaseOptions } from '../src/database/options.js';
import { Foundation1792893549466 } from '../src/database/migrations/1792893549466-Foundation.js';
import {
  AgentEntity,
  ConfigurationEntity,
  CredentialEntity,
  InstanceEntity,
  UserEntity,
  GrantEntity,
  ApprovalEntity,
} from '../src/database/entities/foundation.entities.js';
import { DatabaseLifecycle } from '../src/database/database-lifecycle.js';
import { SafeLogger } from '../src/common/safe-logger.js';

// Never read the developer's .env. Each run owns a fresh database, not the supplied database's tables.
const supplied = process.env.TEST_DATABASE_URL;
if (!supplied)
  throw new Error(
    'TEST_DATABASE_URL must identify an isolated local PostgreSQL database with CREATEDB privileges.',
  );
let url: URL;
try {
  url = new URL(supplied);
} catch {
  throw new Error('TEST_DATABASE_URL is not a valid PostgreSQL URL.');
}
if (
  !['postgres:', 'postgresql:'].includes(url.protocol) ||
  !['127.0.0.1', 'localhost'].includes(url.hostname) ||
  !/^\/piazza_test[a-z0-9_]*$/.test(url.pathname) ||
  url.search ||
  url.hash
)
  throw new Error(
    'Integration database must be localhost with a piazza_test-prefixed database name and no URL options.',
  );
const dbName = `piazza_test_${randomUUID().replaceAll('-', '')}`;
const baseConfig = parseRuntimeConfig({
  NODE_ENV: 'test',
  DATABASE_URL: supplied,
});
const root = new DataSource({ ...databaseOptions(baseConfig), migrations: [] });
url.pathname = `/${dbName}`;
const config = parseRuntimeConfig({ NODE_ENV: 'test', DATABASE_URL: url.href });
const source = new DataSource({
  ...databaseOptions(config),
  migrations: [Foundation1792893549466],
});
let created = false;
const first = randomUUID(),
  second = randomUUID(),
  agent = randomUUID(),
  otherAgent = randomUUID(),
  revision = randomUUID(),
  otherRevision = randomUUID(),
  instance = randomUUID();
const expiry = new Date(Date.now() + 3600000);

describe('real PostgreSQL foundation', () => {
  beforeAll(async () => {
    await root.initialize();
    await root.query(`CREATE DATABASE "${dbName}"`);
    created = true;
    await source.initialize();
  });
  afterAll(async () => {
    if (source.isInitialized) await source.destroy();
    if (created && root.isInitialized)
      await root.query(`DROP DATABASE "${dbName}" WITH (FORCE)`);
    if (root.isInitialized) await root.destroy();
  });
  it('reverts, reapplies and leaves no entity metadata drift', async () => {
    const unmigrated = new DatabaseLifecycle(
      source,
      config,
      new SafeLogger(() => undefined),
    );
    expect(await unmigrated.ready()).toBe(false);
    expect(
      await source.query(
        "SELECT to_regclass('public.schema_migrations') AS table_name",
      ),
    ).toEqual([{ table_name: null }]);
    await source.runMigrations();
    expect(await source.showMigrations()).toBe(false);
    await source.undoLastMigration();
    const pending = new DatabaseLifecycle(
      source,
      config,
      new SafeLogger(() => undefined),
    );
    expect(await pending.ready()).toBe(false);
    expect(
      await source.query("SELECT to_regclass('public.users') AS table_name"),
    ).toEqual([{ table_name: null }]);
    expect(await source.showMigrations()).toBe(true);
    await source.runMigrations();
    const diff = await source.driver.createSchemaBuilder().log();
    expect(diff.upQueries.map((q) => q.query)).toEqual([]);
  });
  it('stores canonical users, hides secret columns by default and bounds metadata', async () => {
    const repo = source.getRepository(UserEntity);
    await repo.insert([
      { id: first, email: 'one@example.com', passwordHash: 'h'.repeat(60) },
      { id: second, email: 'two@example.com' },
    ]);
    const user = await repo.findOneByOrFail({ id: first });
    expect(user.passwordHash).toBeUndefined();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.createdAt.toISOString()).toMatch(/\.\d{3}Z$/);
    expect(
      (
        await repo
          .createQueryBuilder('u')
          .addSelect('u.passwordHash')
          .where('u.id = :id', { id: first })
          .getOneOrFail()
      ).passwordHash,
    ).toBe('h'.repeat(60));
    await expect(
      repo.insert({ email: 'one@example.com' }),
    ).rejects.toMatchObject({ driverError: { code: '23505' } });
    await expect(
      repo.insert({ email: 'UPPER@example.com' }),
    ).rejects.toMatchObject({ driverError: { code: '23514' } });
    await expect(
      repo.findOneBy({ id: undefined as unknown as string }),
    ).rejects.toThrow();
  });
  it('rolls back a failed committing transaction', async () => {
    const id = randomUUID();
    await expect(
      source.transaction(async (manager) => {
        await manager
          .getRepository(UserEntity)
          .insert({ id, email: 'rollback@example.com' });
        throw new Error('fixture rollback');
      }),
    ).rejects.toThrow('fixture rollback');
    expect(await source.getRepository(UserEntity).existsBy({ id })).toBe(false);
  });
  it('binds each instance to its controller and its own agent configuration', async () => {
    await source.getRepository(AgentEntity).insert([
      { id: agent, userId: first, displayName: 'First', modalities: ['text'] },
      {
        id: otherAgent,
        userId: second,
        displayName: 'Second',
        modalities: ['text'],
      },
    ]);
    await source.getRepository(ConfigurationEntity).insert([
      {
        id: revision,
        agentId: agent,
        sequence: 1,
        declared: {},
        disclosureScope: 'operator_private',
        effectiveAt: new Date(),
      },
      {
        id: otherRevision,
        agentId: otherAgent,
        sequence: 1,
        declared: {},
        disclosureScope: 'operator_private',
        effectiveAt: new Date(),
      },
    ]);
    const repo = source.getRepository(InstanceEntity);
    await repo.insert({
      id: instance,
      agentId: agent,
      userId: first,
      configurationRevisionId: revision,
      label: 'Runtime',
    });
    await expect(
      repo.insert({
        agentId: agent,
        userId: second,
        configurationRevisionId: revision,
        label: 'Foreign controller',
      }),
    ).rejects.toMatchObject({
      driverError: { constraint: 'fk_instances_controller' },
    });
    await expect(
      repo.insert({
        agentId: agent,
        userId: first,
        configurationRevisionId: otherRevision,
        label: 'Foreign configuration',
      }),
    ).rejects.toMatchObject({
      driverError: { constraint: 'fk_instances_configuration' },
    });
  });
  it('rejects foreign credentials, grants and approvals', async () => {
    const credentials = source.getRepository(CredentialEntity);
    const credential = {
      instanceId: instance,
      userId: first,
      keyId: randomUUID(),
      secretHash: 'h'.repeat(64),
      expiresAt: expiry,
    };
    await credentials.insert(credential);
    expect(
      (await credentials.findOneByOrFail({ keyId: credential.keyId }))
        .secretHash,
    ).toBeUndefined();
    await expect(
      credentials.insert({
        ...credential,
        id: randomUUID(),
        keyId: randomUUID(),
        userId: second,
      }),
    ).rejects.toMatchObject({
      driverError: { constraint: 'fk_credentials_controller' },
    });
    const grants = source.getRepository(GrantEntity);
    const grant = {
      agentId: agent,
      grantorUserId: first,
      instanceId: instance,
      actions: ['project.read' as const],
      resourceScope: { kind: 'public' as const },
      budgetCaps: [],
      approvalRule: 'within_grant' as const,
      expiresAt: expiry,
    };
    await grants.insert(grant);
    await expect(
      grants.insert({ ...grant, id: randomUUID(), grantorUserId: second }),
    ).rejects.toMatchObject({
      driverError: { constraint: 'fk_grants_controller' },
    });
    await expect(
      grants.insert({
        ...grant,
        id: randomUUID(),
        agentId: otherAgent,
        grantorUserId: second,
      }),
    ).rejects.toMatchObject({
      driverError: { constraint: 'fk_grants_instance' },
    });
    await expect(
      grants.insert({
        ...grant,
        id: randomUUID(),
        resourceScope: {} as typeof grant.resourceScope,
      }),
    ).rejects.toMatchObject({ driverError: { constraint: 'ck_grants_scope' } });
    // Exact intent contents are validated by canonical schemas in the future use case; DB ownership still fails closed.
    await expect(
      source.getRepository(ApprovalEntity).insert({
        userId: second,
        agentId: agent,
        requestedAction: 'project.read',
        target: { resourceScope: { kind: 'public' } },
        payloadDigest: 'a'.repeat(64),
        budget: [],
        expiresAt: expiry,
        intent: {} as never,
      }),
    ).rejects.toMatchObject({
      driverError: { constraint: 'fk_approvals_controller' },
    });
  });
  it('detects pending migrations and retries a real unavailable database without leaking diagnostics', async () => {
    const lifecycle = new DatabaseLifecycle(
      source,
      config,
      new SafeLogger(() => undefined),
    );
    expect(await lifecycle.ready()).toBe(true);
    const unavailableConfig = parseRuntimeConfig({
      NODE_ENV: 'test',
      DATABASE_URL:
        'postgresql://fixture:unused@127.0.0.1:1/piazza_test_unavailable',
      DEPENDENCY_TIMEOUT_MS: '100',
    });
    const unavailable = new DataSource(databaseOptions(unavailableConfig));
    const logs: string[] = [];
    const failed = new DatabaseLifecycle(
      unavailable,
      unavailableConfig,
      new SafeLogger((line) => logs.push(line)),
    );
    expect(await failed.ready()).toBe(false);
    expect(await failed.ready()).toBe(false);
    expect(
      logs.every(
        (line) => !line.includes('unused') && !line.includes('127.0.0.1'),
      ),
    ).toBe(true);
    await failed.onApplicationShutdown();
  });
});
