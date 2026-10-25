import { Injectable } from '@nestjs/common';
import { healthProbeSchema } from '@piazza/contracts';
import { DatabaseLifecycle } from '../database/database-lifecycle.js';
import { StorageReadiness } from './storage-readiness.js';

@Injectable()
export class HealthService {
  constructor(
    private readonly database: DatabaseLifecycle,
    private readonly storage: StorageReadiness,
  ) {}
  async readiness() {
    const states = await Promise.allSettled([
      this.database.ready(),
      this.storage.ready(),
    ]);
    const ready = states.every((v) => v.status === 'fulfilled' && v.value);
    return {
      status: ready ? 200 : 503,
      body: healthProbeSchema.parse({ status: ready ? 'ok' : 'unavailable' }),
    };
  }
}
