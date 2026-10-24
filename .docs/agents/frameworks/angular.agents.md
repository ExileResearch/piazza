# Angular — Agent Best Practices

## Core Stack Facts

- v19+ standalone-by-default; signals (`signal`, `computed`, `effect`) are the reactive primitive; zone.js optional but classic `ChangeDetectionStrategy.OnPush` still applies.
- TypeScript-first; decorators (`@Component`), DI via constructor injection; RxJS still ubiquitous (HttpClient, forms, router events).
- Rendering: Ahead-of-Time (AOT) compile; `@if`/`@for`/`@switch` control flow blocks replace `*ngIf`/`*ngFor` (legacy).

## File & Project Conventions

- One component = folder with `foo.component.ts`, `foo.component.html`, `foo.component.css/scss`, `foo.component.spec.ts` — keep HTML/CSS in separate files unless trivial; `styleUrls`/`templateUrl` references.
- Services `foo.service.ts` (providedIn: 'root'); standalone components declare `imports: [...]`; feature modules only when lazy — prefer `loadChildren`/`loadComponent` routes.
- Naming: `kebab-case` files, `PascalCase` classes, `camelCase` members; `signal` fields named without `$`.

## Framework-Native Idioms

- Standalone components + `imports` array; signals for state, `computed` for derived, `effect` only for explicit side-effects (logging, DOM sync) — never as the default state pipeline.
- Template: `@if (cond) {} @else {}`, `@for (item of items; track item.id) {}` — **always** provide `track` for list identity.
- `input()` / `output()` / `model()` function APIs for component APIs; `viewChild`/`contentChild` instead of `@ViewChild` strings.
- Forms: ReactiveFormsModule with typed `FormGroup`/`FormControl`; prefer `form.controls.x` over index access.
- DI: `inject()` function inside injection context; lazy routes via `loadComponent: () => import(...)`.

## Commands & Tooling

- `npx @angular/cli new app --standalone` · `ng generate component foo` · `ng serve` (dev, hot-reload) · `ng build` (AOT, budgets) · `ng test` (Karma/Jest) · `ng lint` (ESLint) · `ng add` for Angular Material/PrimeNG (needs `--project` in monorepos).
- Use `ng generate` — hand-scaffolding misses the `app.config.ts` providers wiring.

## Common Pitfalls

- **No `effect()` unless explicitly allowed** by the project; effects re-run on any dependency change and are a state-update smell (signal-in-effect loops, ExpressionChangedAfterItHasBeenChecked legacy).
- Do NOT split one component across inline template that grows unbounded; respect separate `.html`/`.css`/`.ts` convention — agents collapse files and break `styleUrls`.
- `track` required in `@for` or list DOM gets destroyed/recreated; using index as track breaks identity.
- Signals are shallow: mutating nested object properties needs `update()`/immutable reassign to notify — don't hand back RxJS-heavy `BehaviorSubject` patterns unless the codebase uses them.
- Zone.js vs zoneless: don't mix; if `provideZonelessChangeDetection()` is set, never rely on `NgZone` hacks.

## Rulebase Coupling

- (framework state-pairing): mirror Angular signal state alongside the project's state contract — `signal()` for UI state, a service for cross-feature state.
- (desktop/mobile isolation): keep responsive logic in CSS/media queries, not duplicated in TS; share components, isolate adapters.
- (i18n packs): use `@angular/localize` `$localize` or ngx-translate; never hardcode UI strings (see localization pack).
- (docs hygiene): every generated component keeps its `.spec.ts` and doc comments; don't delete scaffolded tests.

## References

- https://angular.dev/guide/components · https://angular.dev/guide/signals · https://angular.dev/guide/forms
