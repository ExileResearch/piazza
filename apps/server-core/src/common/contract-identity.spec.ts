import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from '@jest/globals';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';
import { Contract, ContractIdentityGuard } from './contract-boundary.js';
import { ApiException } from './api-errors.js';

class Routes {
  @Contract('currentUser') human(this: void) {}
  @Contract('operations') administrator(this: void) {}
  @Contract('projects') publicRead(this: void) {}
}
const human = {
  kind: 'human',
  userId: randomUUID(),
  sessionId: randomUUID(),
  roles: ['user'],
};
const agent = {
  kind: 'agent',
  agentId: randomUUID(),
  instanceId: randomUUID(),
  configurationRevisionId: randomUUID(),
  controllerUserId: randomUUID(),
  credentialId: randomUUID(),
  scopeVersion: 1,
};
function context(
  handler: keyof Routes,
  actor?: unknown,
  authorization?: string,
): ExecutionContext {
  return new ExecutionContextHost(
    [{ actor, headers: authorization ? { authorization } : {} }],
    Routes,
    Routes.prototype[handler],
  );
}
const guard = new ContractIdentityGuard(new Reflector());
function denial(ctx: ExecutionContext, status: number) {
  try {
    guard.canActivate(ctx);
    throw new Error('expected denial');
  } catch (error) {
    expect(error).toBeInstanceOf(ApiException);
    expect((error as ApiException).getStatus()).toBe(status);
  }
}
describe('contract actor classification (trusted server context only)', () => {
  it('rejects an unauthenticated human operation', () =>
    denial(context('human'), 401));
  it('rejects an agent on a human operation', () =>
    denial(context('human', agent), 403));
  it('accepts a server-established human context', () =>
    expect(guard.canActivate(context('human', human))).toBe(true));
  it('requires a separate admin role', () =>
    denial(context('administrator', human), 403));
  it('never treats an agent as the developer administrator', () =>
    denial(context('administrator', agent), 403));
  it('accepts a server-established human admin', () =>
    expect(
      guard.canActivate(
        context('administrator', { ...human, roles: ['user', 'admin'] }),
      ),
    ).toBe(true));
  it('rejects malformed trusted context', () =>
    denial(context('human', { ...human, userId: 'not-a-uuid' }), 401));
  it('permits anonymous public reads', () =>
    expect(guard.canActivate(context('publicRead'))).toBe(true));
  it('refuses to downgrade invalid bearer authentication to anonymous', () =>
    denial(context('publicRead', undefined, 'Bearer invalid'), 401));
});
