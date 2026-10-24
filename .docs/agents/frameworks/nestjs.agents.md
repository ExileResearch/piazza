# NestJS — Agent Best Practices

## Core Stack Facts

- Version anchor: NestJS 11.x (@nestjs/core 11; built on Express 5 by default, Fastify adapter optional).
- Batteries-included, opinionated Node framework: DI container, decorators, modules, providers — Angular-style architecture for servers.
- TypeScript-first (decorators + metadata reflection); CLI-generated projects are `tsc`-based but the framework itself is runtime-agnostic.
- Ecosystem overlap: NestJS wraps Express/Fastify, so don't mix raw Express middleware patterns blindly; use Nest guards/interceptors/pipes instead. Peers handle: validation (class-validator + class-transformer is the official pairing — NOT zod, see zod.agents.md), auth (@nestjs/passport, @nestjs/jwt), ORM (TypeORM/Prisma modules).

## File & Project Conventions

- CLI layout: `src/main.ts` (bootstrap), `src/app.module.ts` (root module), per-feature folders `src/<feature>/<feature>.module.ts|controller.ts|service.ts|dto/|entities/`.
- Config: `@nestjs/config` with `.env`; ConfigModule.forRoot({ isGlobal: true }) in AppModule.
- Tests colocated: `*.spec.ts` (unit) next to sources; `test/` folder for e2e with `e2e-jest` config.
- DTOs in `dto/` subfolder; entities/schemas in `entities/`; the pattern is enforced by the generator — keep it.
- `nest-cli.json` + `tsconfig.json`: CLI builds via `tsc`; `package.json` scripts: `start`, `start:dev`, `build`, `test`.

## Framework-Native Idioms

- Modules own scope: `@Module({ controllers, providers, imports, exports })`; providers are DI-injectable singletons by default.
- Controllers: `@Controller('users')` + `@Get(':id')` + `@Param()`/`@Body()` decorators; never access `req` directly unless using `@Req()`.
- Services: injectable classes with `@Injectable()`; business logic in services, NOT controllers.
- Pipes: `ValidationPipe({ whitelist: true, transform: true })` global — validates DTOs automatically, strips unknown props.
- Guards for auth (before handler), interceptors for response shaping, filters (`@Catch()`) for errors — use the layer that fits, don't pile logic in middleware.
- Async providers + `APP_GUARD`/`APP_PIPE`/`APP_FILTER` tokens for global registration.
- GraphQL: `@nestjs/graphql` code-first with `@ObjectType`/`@Resolver` if the spec calls for it; REST otherwise.

## Commands & Tooling

- Init: `npx @nestjs/cli new <name>` (choose npm/pnpm — pass `--package-manager`).
- Generate: `npx nest g module|controller|service|guard|pipe <name>` — always use the CLI, never hand-write module wiring.
- Dev: `npm run start:dev` (watch); build: `npm run build` (tsc → `dist/`); prod: `node dist/main.js`.
- Test: `npm test` (jest unit); `npm run test:e2e` (supertest against compiled app).
- Lint/format: `npx eslint .` ; typecheck: `npx tsc --noEmit`.
- Verify: `npm ls @nestjs/core` → expect `11.x`; `npx nest info` prints full environment.

## Common Pitfalls

- Skip `nest g` and hand-write decorator wiring — missed `@Module` imports cause "Nest can't resolve dependencies" at boot.
- Forget global `ValidationPipe` then hand-validate in services — wrong; the pipe IS the validation layer (pair with class-validator DTOs).
- Use zod with NestJS core pipeline — not native; if the spec pins zod, adapt via a custom pipe, do not claim class-validator is zod.
- Put `app.listen()` logic or env reads inside `main.ts` only — e2e tests use `app.getHttpServer()`, so bootstrap must be reusable (separate `bootstrap()` function).
- Import Express middleware like `cors`/`helmet` directly instead of `app.enableCors()` / helmet-for-nest middleware registration.
- Circular module imports — split shared providers into their own module instead.
- Wrong version idioms: `@nestjs/common` v11 drops some v9-era APIs — check the migration guide if generating for an existing repo.

## Rulebase Coupling

- Build-order: NestJS is the structured-server default — module/controller/service scaffolding order matters more than any other server pack; generate bottom-up (module → service → controller).

## References

- https://docs.nestjs.com/ (overview, providers, modules, pipes, guards)
- https://docs.nestjs.com/techniques/validation
- https://github.com/nestjs/nest/releases (version anchor + migrations)
