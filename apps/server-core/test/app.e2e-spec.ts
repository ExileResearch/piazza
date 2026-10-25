import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { Controller, Get, Module, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import type { Server } from 'node:http';
import {
  apiErrorResponseSchema,
  apiRoutes,
  healthProbeSchema,
} from '@piazza/contracts';
import { AppModule } from '../src/app.module.js';
import { configureApplication } from '../src/configure-application.js';
import {
  parseRuntimeConfig,
  RUNTIME_CONFIG,
} from '../src/configuration/environment.js';
import { DatabaseLifecycle } from '../src/database/database-lifecycle.js';
import { StorageReadiness } from '../src/health/storage-readiness.js';
import { SafeLogger } from '../src/common/safe-logger.js';
import { Contract, ContractInput } from '../src/common/contract-boundary.js';

let leak = false;
let input: unknown;
@Controller('fixture')
class FixtureController {
  @Post('request')
  @Contract('requestOtp')
  request(@ContractInput() value: unknown) {
    input = value;
    return {
      status: 'request_received',
      challengeId: randomUUID(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      ...(leak ? { secretHash: 'sensitive-hash' } : {}),
    };
  }
  @Get('private')
  @Contract('currentUser')
  privateRoute() {
    throw new Error('must never reach unauthenticated handler');
  }
  @Get('failure')
  failure() {
    throw new Error('postgres://secret:password@private-host/internal');
  }
}
@Module({ imports: [AppModule], controllers: [FixtureController] })
class FixtureModule {}

const lines: string[] = [];
const dependencies = { database: true, storage: true };
async function application(
  overrides: NodeJS.ProcessEnv = {},
): Promise<NestExpressApplication> {
  const config = parseRuntimeConfig({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://fixture:unused@127.0.0.1/piazza_test',
    REQUEST_BODY_LIMIT_BYTES: '1024',
    RATE_LIMIT_LIMIT: '100',
    ...overrides,
  });
  const module = await Test.createTestingModule({ imports: [FixtureModule] })
    .overrideProvider(RUNTIME_CONFIG)
    .useValue(config)
    .overrideProvider(SafeLogger)
    .useValue(new SafeLogger((line) => lines.push(line)))
    .overrideProvider(DatabaseLifecycle)
    .useValue({ ready: () => Promise.resolve(dependencies.database) })
    .overrideProvider(StorageReadiness)
    .useValue({ ready: () => Promise.resolve(dependencies.storage) })
    .compile();
  const app = module.createNestApplication<NestExpressApplication>({
    bodyParser: false,
    logger: false,
  });
  configureApplication(app);
  await app.init();
  return app;
}

describe('foundation HTTP boundary (test-only operations)', () => {
  let app: NestExpressApplication;
  let server: Server;
  beforeAll(async () => {
    app = await application();
    server = app.getHttpServer();
  });
  afterAll(async () => {
    await app.close();
  });
  it('serves canonical liveness with safe headers and a correlation id', async () => {
    const res = await request(server).get('/health').expect(200);
    expect(healthProbeSchema.parse(res.body)).toEqual({ status: 'ok' });
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toContain(
      "default-src 'none'",
    );
    expect(res.headers['set-cookie']).toBeUndefined();
    expect(res.headers['x-correlation-id']).toMatch(/^[0-9a-f-]{36}$/);
  });
  it('reports dependency failure without private diagnostics; liveness stays available', async () => {
    await request(server).get('/ready').expect(200, { status: 'ok' });
    for (const dependency of ['database', 'storage'] as const) {
      dependencies[dependency] = false;
      await request(server)
        .get('/ready')
        .expect(503, { status: 'unavailable' });
      await request(server).get('/health').expect(200);
      dependencies[dependency] = true;
    }
  });
  it('keeps production docs and all unimplemented product routes unavailable', async () => {
    await request(server).get('/api/v1/docs-json').expect(404);
    await request(server)
      .post(apiRoutes.requestOtp.path)
      .send({ email: 'a@example.com', intent: 'login' })
      .expect(404);
  });
  it('parses the canonical input including defaults and validates the complete envelope', async () => {
    const id = randomUUID();
    const res = await request(server)
      .post('/fixture/request')
      .set('X-Correlation-Id', id)
      .send({ email: 'a@example.com', intent: 'login' })
      .expect(202);
    expect(apiRoutes.requestOtp.response.safeParse(res.body).success).toBe(
      true,
    );
    expect(res.headers['cache-control']).toBe('no-store');
    expect(input).toMatchObject({
      params: {},
      query: {},
      headers: {},
      body: { email: 'a@example.com', intent: 'login', locale: 'en' },
    });
    expect(
      (res.body as { meta: { correlationId: string } }).meta.correlationId,
    ).toBe(id);
  });
  it('rejects unknown body/query fields instead of silently discarding them', async () => {
    for (const path of [
      '/fixture/request',
      '/fixture/request?unexpected=secret',
    ]) {
      const res = await request(server)
        .post(path)
        .send({
          email: 'a@example.com',
          intent: 'login',
          ...(path.includes('?') ? {} : { password: 'sensitive-password' }),
        })
        .expect(422);
      expect(apiErrorResponseSchema.safeParse(res.body).success).toBe(true);
      expect(JSON.stringify(res.body)).not.toContain('sensitive-password');
    }
  });
  it('fails closed on extra outbound fields', async () => {
    leak = true;
    try {
      const res = await request(server)
        .post('/fixture/request')
        .send({ email: 'a@example.com', intent: 'login' })
        .expect(500);
      expect(JSON.stringify(res.body)).not.toContain('sensitive-hash');
    } finally {
      leak = false;
    }
  });
  it('rejects malformed, oversized and non-JSON input safely', async () => {
    await request(server)
      .post('/fixture/request')
      .type('json')
      .send('{broken sensitive-input')
      .expect(400);
    await request(server)
      .post('/fixture/request')
      .send({ email: 'x'.repeat(2000) })
      .expect(413);
    await request(server)
      .post('/fixture/request')
      .type('text')
      .send('sensitive-input')
      .expect(415);
  });
  it('requires a server-authenticated actor, regardless of supplied bearer text', async () => {
    await request(server).get('/fixture/private').expect(401);
    await request(server)
      .get('/fixture/private')
      .set('Authorization', `Bearer ${'x'.repeat(32)}`)
      .expect(401);
  });
  it('handles CORS, untrusted correlation values and unexpected errors safely', async () => {
    const allowed = await request(server)
      .get('/health')
      .set('Origin', 'http://localhost:4200')
      .expect(200);
    expect(allowed.headers['access-control-allow-origin']).toBe(
      'http://localhost:4200',
    );
    await request(server)
      .get('/health')
      .set('Origin', 'https://untrusted.example')
      .expect(403);
    const res = await request(server)
      .get('/fixture/failure?email=private@example.com')
      .set('X-Correlation-Id', 'sensitive-id')
      .expect(500);
    expect(apiErrorResponseSchema.safeParse(res.body).success).toBe(true);
    expect(JSON.stringify(res.body)).not.toMatch(
      /password|private-host|sensitive-id/,
    );
    expect(lines.join('\n')).not.toMatch(
      /sensitive|private@example|private-host|secretHash|Bearer/,
    );
  });
  it('bounds ordinary requests while leaving probes available', async () => {
    const limited = await application({ RATE_LIMIT_LIMIT: '1' });
    try {
      const http = limited.getHttpServer();
      await request(http).get('/fixture/failure').expect(500);
      const res = await request(http).get('/fixture/failure').expect(429);
      expect((res.body as { error: { code: string } }).error.code).toBe(
        'RATE_LIMITED',
      );
      expect(Number(res.headers['retry-after'])).toBeGreaterThan(0);
      await request(http).get('/health').expect(200);
      await request(http).get('/health').expect(200);
    } finally {
      await limited.close();
    }
  });
  it('exposes only implemented paths in explicitly enabled development docs', async () => {
    const development = await application({
      NODE_ENV: 'development',
      SWAGGER_ENABLED: 'true',
    });
    try {
      const http = development.getHttpServer();
      await request(http)
        .get('/api/v1/docs')
        .expect(200)
        .expect('Content-Type', /html/);
      const res = await request(http).get('/api/v1/docs-json').expect(200);
      expect(
        Object.keys(
          (res.body as { paths: Record<string, unknown> }).paths,
        ).sort(),
      ).toEqual(['/health', '/ready']);
    } finally {
      await development.close();
    }
  });
});
