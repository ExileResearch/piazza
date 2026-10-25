import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import helmet from 'helmet';
import { idSchema, protocolRoutes } from '@piazza/contracts';
import type { Express, NextFunction, Response } from 'express';
import { RUNTIME_CONFIG } from './configuration/environment.js';
import type { RuntimeConfig } from './configuration/environment.js';
import type { HttpContext } from './common/http-context.js';
import { SafeLogger } from './common/safe-logger.js';
import { ApiException } from './common/api-errors.js';

/** Shared bootstrap for the executable and HTTP tests; logs only finite, approved metadata. */
export function configureApplication(app: NestExpressApplication): void {
  const config = app.get<RuntimeConfig>(RUNTIME_CONFIG);
  const logger = app.get(SafeLogger);
  app.useLogger(logger);
  const server: Express = app.getHttpAdapter().getInstance();
  server.set('trust proxy', config.trustProxyHops);
  app.use((req: HttpContext, res: Response, next: NextFunction) => {
    const supplied = idSchema.safeParse(req.headers['x-correlation-id']);
    req.correlationId = supplied.success ? supplied.data : randomUUID();
    res.setHeader('X-Correlation-Id', req.correlationId);
    res.setHeader('Cache-Control', 'no-store');
    const start = performance.now();
    res.on('finish', () =>
      logger.write({
        level: 'info',
        event: 'http_complete',
        correlationId: req.correlationId!,
        status: res.statusCode,
        method: [
          'GET',
          'POST',
          'PUT',
          'PATCH',
          'DELETE',
          'HEAD',
          'OPTIONS',
        ].includes(req.method)
          ? (req.method as 'GET')
          : 'OTHER',
        ...(req.operationId ? { operationId: req.operationId } : {}),
        durationMs: Math.max(0, Math.round(performance.now() - start)),
      }),
    );
    next();
  });
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'none'"],
          baseUri: ["'none'"],
          frameAncestors: ["'none'"],
          formAction: ["'none'"],
        },
      },
    }),
  );
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || config.corsOrigins.includes(origin)) callback(null, true);
      else callback(new ApiException(403, 'ACTION_FORBIDDEN'));
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-Id',
      'X-Acting-Agent-Id',
      'X-Step-Up-Token',
      'Idempotency-Key',
      'If-Match',
    ],
    exposedHeaders: ['X-Correlation-Id', 'Retry-After'],
    maxAge: 600,
  });
  app.useBodyParser('json', { limit: config.bodyLimitBytes, strict: true });
  app.enableShutdownHooks();
  if (config.swaggerEnabled) {
    const entry = createRequire(import.meta.url).resolve('@piazza/contracts');
    const document = JSON.parse(
      readFileSync(
        resolve(dirname(entry), '../../generated/openapi.json'),
        'utf8',
      ),
    ) as OpenAPIObject;
    // Baseline contracts describe future APIs. Only implemented routes appear in runtime docs.
    document.paths = Object.fromEntries(
      Object.entries(document.paths).filter(([path]) =>
        ['/health', '/ready'].includes(path),
      ),
    );
    // JSON docs avoid relaxing the API's strict CSP for an interactive documentation UI.
    SwaggerModule.setup(protocolRoutes.docs.path, app, document, {
      ui: false,
      raw: ['json'],
      jsonDocumentUrl: protocolRoutes.docsJson.path,
    });
    server.get(protocolRoutes.docs.path, (_req, res) =>
      res
        .type('html')
        .send(
          '<!doctype html><html lang="en"><meta charset="utf-8"><title>Piazza API development docs</title><h1>Piazza API foundation</h1><p>Only health and readiness are implemented.</p><a href="/api/v1/docs-json">OpenAPI JSON</a></html>',
        ),
    );
  }
}
