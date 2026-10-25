import { Catch, HttpException } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { apiErrorResponseSchema, idSchema } from '@piazza/contracts';
import type { ApiErrorCode, FieldError } from '@piazza/contracts';
import type { HttpContext } from './http-context.js';

export class ApiException extends HttpException {
  constructor(
    status: number,
    readonly code: ApiErrorCode,
    readonly fields: FieldError[] = [],
  ) {
    super('Request failed', status);
  }
}
const statusCodes: Record<number, ApiErrorCode> = {
  400: 'VALIDATION_FAILED',
  401: 'UNAUTHENTICATED',
  403: 'ACTION_FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'VERSION_CONFLICT',
  410: 'EVENT_CURSOR_EXPIRED',
  413: 'VALIDATION_FAILED',
  415: 'VALIDATION_FAILED',
  422: 'VALIDATION_FAILED',
  429: 'RATE_LIMITED',
  503: 'DEPENDENCY_UNAVAILABLE',
};

/** Last-resort projection never reflects exception messages, parser input, SQL, stack or private identifiers. */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const request = host.switchToHttp().getRequest<HttpContext>();
    const response = host.switchToHttp().getResponse<Response>();
    if (response.headersSent) return;
    let status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    if (
      exception instanceof Error &&
      'type' in exception &&
      exception.type === 'entity.parse.failed'
    )
      status = 400;
    if (
      exception instanceof Error &&
      'type' in exception &&
      exception.type === 'entity.too.large'
    )
      status = 413;
    if (status < 400 || status > 599) status = 500;
    const code =
      exception instanceof ApiException
        ? exception.code
        : (statusCodes[status] ?? 'INTERNAL_ERROR');
    const correlationId = idSchema.safeParse(request.correlationId).success
      ? request.correlationId!
      : randomUUID();
    const body = apiErrorResponseSchema.parse({
      error: {
        code,
        messageKey: `error.${code.toLowerCase()}`,
        ...(exception instanceof ApiException && exception.fields.length
          ? { fieldErrors: exception.fields }
          : {}),
        ...(status === 429
          ? {
              retryAfterSeconds: Math.min(
                86400,
                Math.max(1, Number(response.getHeader('Retry-After')) || 60),
              ),
            }
          : {}),
      },
      meta: { correlationId },
    });
    response.setHeader('X-Correlation-Id', correlationId);
    response.setHeader('Cache-Control', 'no-store');
    response.status(status).json(body);
  }
}
