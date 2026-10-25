// App imports the factory without constructing the CLI datasource or reading a local .env.
import { fileURLToPath } from 'node:url';
import type { DataSourceOptions } from 'typeorm';
import type { RuntimeConfig } from '../configuration/environment.js';
import { FOUNDATION_ENTITIES } from './entities/foundation.entities.js';

/** Single source for runtime and migration options; imported without boot-time side effects. */
export function databaseOptions(config: RuntimeConfig): DataSourceOptions {
  const { poolMax, ...connection } = config.database;
  return {
    type: 'postgres',
    uuidExtension: 'pgcrypto',
    ...connection,
    entities: FOUNDATION_ENTITIES,
    migrations: [
      fileURLToPath(
        new URL(
          `./migrations/*.${import.meta.url.endsWith('.ts') ? 'ts' : 'js'}`,
          import.meta.url,
        ),
      ),
    ],
    synchronize: false,
    dropSchema: false,
    migrationsTableName: 'schema_migrations',
    migrationsTransactionMode: 'all',
    logging: false,
    installExtensions: false,
    invalidWhereValuesBehavior: { null: 'throw', undefined: 'throw' },
    poolSize: poolMax,
    extra: {
      connectionTimeoutMillis: config.dependencyTimeoutMs,
      query_timeout: config.dependencyTimeoutMs,
      statement_timeout: config.dependencyTimeoutMs,
      application_name: 'piazza-server',
    },
  };
}
