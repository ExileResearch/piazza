import type { Request } from 'express';
import type { ApiOperationId } from '@piazza/contracts';
import type { AuthenticatedActor } from '@piazza/contracts/server-internal';

/** Actor is assigned only by authentication middleware, never from the request payload. */
export interface HttpContext extends Request {
  correlationId?: string;
  operationId?: ApiOperationId;
  contractInput?: unknown;
  actor?: AuthenticatedActor;
}
