import { Controller, Get, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { healthProbeSchema, protocolRoutes } from '@piazza/contracts';
import { HealthService } from './health.service.js';

@Controller()
@SkipThrottle()
export class HealthController {
  constructor(private readonly health: HealthService) {}
  @Get(protocolRoutes.health.path)
  healthcheck() {
    return healthProbeSchema.parse({ status: 'ok' });
  }
  @Get(protocolRoutes.ready.path)
  async readiness(@Res({ passthrough: true }) response: Response) {
    const result = await this.health.readiness();
    response.status(result.status);
    return result.body;
  }
}
