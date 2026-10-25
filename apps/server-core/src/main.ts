import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configureApplication } from './configure-application.js';
import { RUNTIME_CONFIG } from './configuration/environment.js';
import type { RuntimeConfig } from './configuration/environment.js';
import { SafeLogger } from './common/safe-logger.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    logger: new SafeLogger(),
    abortOnError: false,
  });
  try {
    configureApplication(app);
    const config = app.get<RuntimeConfig>(RUNTIME_CONFIG);
    await app.listen(config.port, config.host);
  } catch (error) {
    await app.close().catch(() => undefined);
    throw error;
  }
}
void bootstrap().catch(() => {
  new SafeLogger().write({ level: 'error', event: 'startup_failed' });
  process.exitCode = 1;
});
