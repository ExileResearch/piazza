import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RUNTIME_CONFIG } from '../configuration/environment.js';
import type { RuntimeConfig } from '../configuration/environment.js';
import { databaseOptions } from './options.js';
import { DatabaseLifecycle } from './database-lifecycle.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [RUNTIME_CONFIG],
      useFactory: (config: RuntimeConfig) => ({
        ...databaseOptions(config),
        manualInitialization: true,
        retryAttempts: 1,
      }),
    }),
  ],
  providers: [DatabaseLifecycle],
  exports: [TypeOrmModule, DatabaseLifecycle],
})
export class DatabaseModule {}
