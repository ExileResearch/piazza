import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ApiExceptionFilter } from './api-errors.js';
import {
  ContractBoundaryInterceptor,
  ContractIdentityGuard,
} from './contract-boundary.js';
import { SafeLogger } from './safe-logger.js';

@Global()
@Module({
  providers: [
    { provide: SafeLogger, useFactory: () => new SafeLogger() },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
    { provide: APP_GUARD, useClass: ContractIdentityGuard },
    { provide: APP_INTERCEPTOR, useClass: ContractBoundaryInterceptor },
  ],
  exports: [SafeLogger],
})
export class CommonModule {}
