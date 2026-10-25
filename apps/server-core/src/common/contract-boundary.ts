import { Injectable, SetMetadata, createParamDecorator } from '@nestjs/common';
import type {
  CallHandler,
  CanActivate,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  apiRoutes,
  decodeQuery,
  validateActingSelection,
} from '@piazza/contracts';
import type { ApiOperationId, FieldError } from '@piazza/contracts';
import { authenticatedActorSchema } from '@piazza/contracts/server-internal';
import { map } from 'rxjs';
import type { Response } from 'express';
import { ApiException } from './api-errors.js';
import type { HttpContext } from './http-context.js';

const CONTRACT = Symbol('CONTRACT_OPERATION');
export const Contract = (operationId: ApiOperationId) =>
  SetMetadata(CONTRACT, operationId);
export const ContractInput = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): unknown =>
    ctx.switchToHttp().getRequest<HttpContext>().contractInput,
);
type Parser<T> = {
  safeParse(value: unknown):
    | { success: true; data: T }
    | {
        success: false;
        error: {
          issues: readonly { path: readonly PropertyKey[]; code: string }[];
        };
      };
};
function parse<T>(schema: Parser<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const fields: FieldError[] = result.error.issues
    .slice(0, 100)
    .map((issue) => ({
      path: issue.path
        .filter(
          (v): v is string | number =>
            typeof v === 'number' || typeof v === 'string',
        )
        .slice(0, 16)
        .map((v) => (typeof v === 'string' ? v.slice(0, 120) : v)),
      code: `validation.${issue.code}`,
    }));
  throw new ApiException(422, 'VALIDATION_FAILED', fields);
}

/** Checks server-established actor context; it does not authenticate credentials. Use cases must additionally enforce current scoped authority in their transaction. */
@Injectable()
export class ContractIdentityGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const operationId = this.reflector.get<ApiOperationId | undefined>(
      CONTRACT,
      ctx.getHandler(),
    );
    if (!operationId) return true;
    const route = apiRoutes[operationId];
    const request = ctx.switchToHttp().getRequest<HttpContext>();
    if (['public', 'challenge', 'session'].includes(route.actor)) return true;
    if (!request.actor) {
      if (route.actor === 'public_read' && !request.headers.authorization)
        return true;
      throw new ApiException(401, 'UNAUTHENTICATED');
    }
    const actor = authenticatedActorSchema.safeParse(request.actor);
    if (!actor.success) throw new ApiException(401, 'UNAUTHENTICATED');
    if (
      ['human', 'controller', 'admin'].includes(route.actor) &&
      actor.data.kind !== 'human'
    )
      throw new ApiException(403, 'ACTION_FORBIDDEN');
    if (
      route.actor === 'admin' &&
      (actor.data.kind !== 'human' || !actor.data.roles.includes('admin'))
    )
      throw new ApiException(403, 'ACTION_FORBIDDEN');
    return true;
  }
}

/** JSON operations parse canonical boundaries and validate the complete outbound envelope. Binary/form adapters are separate. */
@Injectable()
export class ContractBoundaryInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const operationId = this.reflector.get<ApiOperationId | undefined>(
      CONTRACT,
      ctx.getHandler(),
    );
    if (!operationId) return next.handle();
    const route = apiRoutes[operationId];
    const request = ctx.switchToHttp().getRequest<HttpContext>();
    const response = ctx.switchToHttp().getResponse<Response>();
    if (route.representation === 'binary' || route.representation === 'form')
      throw new ApiException(500, 'INTERNAL_ERROR');
    request.operationId = operationId;
    if (route.method !== 'GET' && !request.is('application/json'))
      throw new ApiException(415, 'VALIDATION_FAILED');
    const consumed: Record<string, unknown> = {};
    for (const name of Object.keys(route.headers.shape)) {
      const count = request.rawHeaders.filter(
        (v, i) => i % 2 === 0 && v.toLowerCase() === name,
      ).length;
      if (count > 1) throw new ApiException(400, 'VALIDATION_FAILED');
      if (request.headers[name] !== undefined)
        consumed[name] = request.headers[name];
    }
    const headers = parse(route.headers, consumed);
    if (
      route.agent &&
      request.actor &&
      !validateActingSelection(
        request.actor.kind === 'human' ? 'human' : 'runtime',
        typeof headers['x-acting-agent-id'] === 'string'
          ? { 'x-acting-agent-id': headers['x-acting-agent-id'] }
          : {},
      )
    )
      throw new ApiException(403, 'ACTION_FORBIDDEN');
    let query: unknown;
    try {
      query = decodeQuery(
        route.query,
        new URL(request.originalUrl, 'http://local.invalid').searchParams,
      );
    } catch {
      throw new ApiException(422, 'VALIDATION_FAILED');
    }
    request.contractInput = {
      params: parse<unknown>(route.params, request.params),
      query,
      headers,
      body: parse<unknown>(route.body, request.body ?? {}),
    };
    response.status(route.status);
    response.setHeader('Cache-Control', 'no-store');
    return next.handle().pipe(
      map((data: unknown) => {
        const parsed = route.response.safeParse({
          data,
          meta: { correlationId: request.correlationId },
        });
        if (!parsed.success) throw new ApiException(500, 'INTERNAL_ERROR');
        return parsed.data;
      }),
    );
  }
}
