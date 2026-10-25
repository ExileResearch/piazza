import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigurationModule } from './configuration/configuration.module.js';
import { RUNTIME_CONFIG } from './configuration/environment.js';
import type { RuntimeConfig } from './configuration/environment.js';
import { CommonModule } from './common/common.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigurationModule,
    CommonModule,
    ThrottlerModule.forRootAsync({
      inject: [RUNTIME_CONFIG],
      useFactory: (config: RuntimeConfig) => [
        { name: 'default', ...config.rateLimit },
      ],
    }),
    DatabaseModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
