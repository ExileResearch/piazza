# PostgreSQL — Agent Best Practices

## Core Stack Facts

- Version anchor: PostgreSQL 17/18 (17 released Sep 2024, 18 released Sep 2025); pg 16 still widely deployed in managed services — pin per project.
- The default relational choice in this catalog: ACID, JSONB, full-text search, window functions, extensions ecosystem. Orms in the catalog (TypeORM/Prisma/Drizzle/Sequelize) all treat PG as the primary dialect.
- Client libraries: `pg` (node-postgres, callbacks/promises + `pg.Pool`), `postgres` (postgres.js, tagged templates), `pg-promise` — pick per project; `pg` is the default.
- Distinguish: server (PostgreSQL) vs driver (`pg`) vs ORM layer — a "postgres" pack means the database, not the driver.

## File & Project Conventions

- Connection via env: `DATABASE_URL=postgres://user:pass@host:5432/db` (or `postgresql://`); pool `new Pool({ connectionString })` — never hardcode credentials.
- Migrations live in the ORM's folder (`prisma/migrations`, `src/db/migrations`, `migrations/`); raw SQL migrations are `*.sql` with versioned prefixes (`0001_...sql`).
- SQL files: `schema.sql` for bootstrap DDL in samples; `.sql` scripts under `db/` for ad-hoc ops. psql scripts: `\i path/file.sql`.
- Naming: snake_case tables/columns by convention; lowercase identifiers (unquoted names fold to lowercase); `id` bigserial/identity PKs, `created_at`/`updated_at` timestamptz.

## Framework-Native Idioms

- Use `jsonb` for semi-structured data + GIN indexes (`CREATE INDEX ... USING gin (data jsonb_path_ops)`) — JSONB is PG's superpower; don't force everything into normalized tables, don't use `json` (no indexing).
- `timestamptz` (not `timestamp`) for all time columns; `now()`/`CURRENT_TIMESTAMP` defaults; never store local-time strings.
- Transactions: `BEGIN/COMMIT/ROLLBACK` or ORM `transaction()`; `SELECT ... FOR UPDATE` for row locking.
- Parameterized queries always — `$1, $2` placeholders with pg, `sql\`...\`` tags with postgres.js; never string interpolation.
- `RETURNING *` on INSERT/UPDATE/DELETE (PG-specific, ORMs expose it); `ON CONFLICT (col) DO UPDATE/NOTHING` for upserts (PG 9.5+, standard).
- Index strategy: `EXPLAIN (ANALYZE, BUFFERS)` to check plans; B-tree for equality/range, GIN for jsonb/arrays/trgm (`pg_trgm`), BRIN for huge append-only tables.
- `\dt`, `\d table`, `\l` in psql for inspection; `pg_stat_activity` for live queries; `pg_dump`/`pg_restore` for backup.

## Commands & Tooling

- Local: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=... -e POSTGRES_DB=... postgres:17` (official image; version-tag it).
- psql: `psql "$DATABASE_URL"`; run file: `psql "$DATABASE_URL" -f schema.sql`.
- Backup: `pg_dump "$DATABASE_URL" > dump.sql`; restore: `psql "$DATABASE_URL" < dump.sql`; `pg_dump --schema-only` for DDL-only.
- Migrations via ORM CLI (see orm packs); verify with `\d` or `information_schema.columns` queries.
- Server admin: `pg_ctl`/`pg_ctlcluster` only for self-managed installs; managed (RDS/Neon/Supabase) expose SQL-level admin only.

## Common Pitfalls

- Use `JSON` column instead of `jsonb` — loses indexing, equality, and `@>` containment operators.
- String-interpolate into SQL (JS or SQL side) — use bind params ($1/placeholders); PG has no runtime safety net for raw text.
- `timestamp` without time zone for global apps — DST/multi-TZ bugs; timestamptz always.
- Forget explicit indexes on FK columns — FK joins scan; add indexes on `WHERE`/join columns proactively.
- Quote camelCase identifiers everywhere ("UserId") — unquoted names fold to lowercase; your quotes will mismatch the schema. Prefer snake_case to avoid the trap entirely.
- Assume `SERIAL` is best — `IDENTITY` (`GENERATED ALWAYS AS IDENTITY`) is the modern standard; serial is legacy convenience.
- `LIKE '%x%'` on big tables without `pg_trgm` — use `ILIKE` + trigram GIN or `pg_trgm` extension.
- Write MySQL-flavored SQL (`AUTO_INCREMENT`, backticks, `LIMIT ? OFFSET ?` is fine but `?` placeholders are mysql2 — pg uses `$1`).

## Rulebase Coupling

- ORM/driver pairing: PostgreSQL is the default relational target — when the spec names PG, wire the ORM pack's PG dialect and `pg`/`postgres` driver choice.

## References

- https://www.postgresql.org/docs/current/ (official docs; check "current" = 17/18)
- https://www.postgresql.org/docs/current/ddl-json.html (jsonb + GIN)
- https://node-postgres.com/ (pg driver)
