import type { LoggerService } from '@nestjs/common';
import { z } from 'zod';
import { idSchema } from '@piazza/contracts';

const logRecordSchema = z.strictObject({
  level: z.enum(['info', 'warn', 'error', 'debug']),
  event: z.enum([
    'framework_message',
    'http_complete',
    'startup_failed',
    'legacy_sync_ignored',
    'dependency_unavailable',
  ]),
  correlationId: idSchema.optional(),
  status: z.number().int().min(100).max(599).optional(),
  operationId: z
    .string()
    .regex(/^[A-Za-z][A-Za-z0-9]{0,119}$/)
    .optional(),
  method: z
    .enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'OTHER'])
    .optional(),
  durationMs: z.number().int().min(0).optional(),
});
export type SafeLogRecord = z.infer<typeof logRecordSchema>;

/** A finite metadata allowlist deliberately excludes request data, URLs, headers and exception messages. */
export class SafeLogger implements LoggerService {
  constructor(
    private readonly sink: (line: string) => void = (line) =>
      process.stdout.write(`${line}\n`),
  ) {}
  write(record: SafeLogRecord) {
    this.sink(JSON.stringify(logRecordSchema.parse(record)));
  }
  log(_message: unknown, ..._context: unknown[]) {
    this.write({ level: 'info', event: 'framework_message' });
  }
  error(_message: unknown, ..._context: unknown[]) {
    this.write({ level: 'error', event: 'framework_message' });
  }
  warn(_message: unknown, ..._context: unknown[]) {
    this.write({ level: 'warn', event: 'framework_message' });
  }
  debug(_message: unknown, ..._context: unknown[]) {
    this.write({ level: 'debug', event: 'framework_message' });
  }
  verbose(_message: unknown, ..._context: unknown[]) {
    this.write({ level: 'debug', event: 'framework_message' });
  }
  fatal(_message: unknown, ..._context: unknown[]) {
    this.write({ level: 'error', event: 'startup_failed' });
  }
}
