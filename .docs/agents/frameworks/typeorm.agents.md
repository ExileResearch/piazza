# TypeORM — Agent Best Practices

## Core Stack Facts

- Version anchor: TypeORM 1.x (current major, released 2026 after the long 0.3.x era — do NOT generate 0.2.x idioms). npm `latest` = 1.1.x.
- Full-featured TypeScript ORM: entities, relations, migrations, query builder, active-record + data-mapper patterns.
- Ecosystem: the default ORM in NestJS docs (`@nestjs/typeorm`); works standalone with Express/Fastify. Peers: Prisma (schema-first, generated client), Sequelize (legacy, CJS), Drizzle (lightweight, SQL-close).
- Supports PostgreSQL, MySQL/MariaDB, SQLite, MSSQL, Oracle, (deprecated MongoDB driver — use Mongoose for Mongo, see mongodb.agents.md).

## File & Project Conventions

- Entities colocated with features: `src/<feature>/entities/<name>.entity.ts`, decorated `@Entity('table_name')`.
- DataSource config: `src/data-source.ts` exporting `new DataSource({ type, host, port, username, password, database, entities: [...], migrations: [...] })` — used by CLI AND app; never hardcode credentials in the file (env vars).
- Migrations: `src/migrations/<timestamp>-<name>.ts` (sequelize-style timestamp prefix); generated, not handwritten, for schema changes.
- Options object, not `ormconfig.json` — that file was removed in 0.3+; keep config in code.
- NestJS: TypeOrmModule.forRoot({...}) + `TypeOrmModule.forFeature([Entity])` per feature module.

## Framework-Native Idioms

- Decorator-driven schema: `@Entity`, `@PrimaryGeneratedColumn()`, `@Column({ type: 'varchar', length: 255 })`, `@ManyToOne(() => User, u => u.posts)` + `@JoinColumn()` on the owning side.
- Repositories: inject `Repository<Entity>` (NestJS) or `dataSource.getRepository(Entity)`; use `.find({ where, relations, order, take, skip })` — never `find().then(r => r.filter(...))` in JS.
- QueryBuilder for complex queries: `dataSource.createQueryBuilder('u').leftJoinAndSelect('u.posts','p').where('u.active = :active', { active: true })`.
- Transactions: `dataSource.transaction(async (manager) => { ... })` — everything inside via `manager`, not the repository.
- Migrations as the single source of truth for schema: `migration:generate` after entity changes, `migration:run` in deploy.

## Commands & Tooling

- Install: `npm i typeorm reflect-metadata pg` (+ `@nestjs/typeorm` for NestJS); TS projects need `experimentalDecorators` + `emitDecoratorMetadata` in tsconfig.
- CLI: `npx typeorm` (v1: `typeorm` binary); init: `npx typeorm init`; migration generate: `npx typeorm migration:generate src/migrations/<name> -d src/data-source.ts`; run: `npx typeorm migration:run -d src/data-source.ts`; revert: `npx typeorm migration:revert -d src/data-source.ts`.
- Schema sync (dev only): `synchronize: true` — NEVER in production; migrations instead.
- Test: `npm test` (jest/node:test) with a disposable DB (SQLite or test Postgres); lint/typecheck: `npx eslint .`, `npx tsc --noEmit`.
- Verify: `npm ls typeorm` → expect `1.x`.

## Common Pitfalls

- Write 0.2.x API: `createConnection()`, `getConnection()`, `ormconfig.json` — all removed/deprecated in 0.3+/1.x; use a `DataSource` instance everywhere.
- Omit `reflect-metadata` import — decorators silently produce no metadata, relations come back undefined.
- Use `synchronize: true` in production — schema drift and data-loss risk; migrations are mandatory.
- N+1: lazy relations (`@OneToMany(..., { lazy: true })`) auto-query per row; always eager-load with `relations` or JoinColumn.
- Type `@Column()` without explicit type on SQLite/Postgres — TS type ≠ column type; annotate DB types.
- Circular entity imports for bidirectional relations — use arrow-function relation targets `() => Entity` (required anyway) plus `import type` where possible.
- Cross-ORM: this is not Prisma — no `prisma.schema` file, no generated client; don't mix `@Entity` with Prisma `model` blocks.

## Rulebase Coupling

- ORM/framework pairing: TypeORM is the default for NestJS projects; pair `@nestjs/typeorm` + `forFeature` when the spec pins NestJS.

## References

- https://typeorm.io/ (entities, relations, migrations, transactions)
- https://typeorm.io/data-source
- https://docs.nestjs.com/techniques/database (NestJS + TypeORM official pairing)
