import { Inject, Injectable } from '@nestjs/common';
import type {
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RUNTIME_CONFIG } from '../configuration/environment.js';
import type { RuntimeConfig } from '../configuration/environment.js';
import { SafeLogger } from '../common/safe-logger.js';

/** A failed dependency keeps the process live but unready; retries are single-flight and bounded by driver timeouts. */
@Injectable()
export class DatabaseLifecycle
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private connecting: Promise<boolean> | undefined;
  constructor(
    private readonly source: DataSource,
    @Inject(RUNTIME_CONFIG) private readonly config: RuntimeConfig,
    private readonly logger: SafeLogger,
  ) {}
  async onApplicationBootstrap(): Promise<void> {
    if (this.config.legacySynchronizeIgnored)
      this.logger.write({ level: 'warn', event: 'legacy_sync_ignored' });
    await this.connect();
  }
  private async connect(): Promise<boolean> {
    if (this.source.isInitialized) return true;
    if (this.connecting) return this.connecting;
    this.connecting = this.source
      .initialize()
      .then(() => true)
      .catch(() => {
        this.logger.write({ level: 'warn', event: 'dependency_unavailable' });
        return false;
      })
      .finally(() => {
        this.connecting = undefined;
      });
    return this.connecting;
  }
  async ready(): Promise<boolean> {
    if (!(await this.connect())) return false;
    try {
      // TypeORM showMigrations() can create its tracking table. The migration-status check must not create its own tracking table.
      const applied = await this.source.query<{ name: string }[]>(
        'SELECT "name" FROM "public"."schema_migrations"',
      );
      const names = new Set(applied.map((row) => row.name));
      return (
        this.source.migrations.length > 0 &&
        this.source.migrations.every((migration) =>
          names.has(migration.name ?? migration.constructor.name),
        )
      );
    } catch {
      return false;
    }
  }
  async onApplicationShutdown(): Promise<void> {
    if (this.connecting) await this.connecting;
    if (this.source.isInitialized) await this.source.destroy();
  }
}
