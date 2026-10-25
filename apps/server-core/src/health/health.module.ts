import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';
import { StorageReadiness } from './storage-readiness.js';

@Module({
  imports: [DatabaseModule],
  controllers: [HealthController],
  providers: [HealthService, StorageReadiness],
})
export class HealthModule {}
