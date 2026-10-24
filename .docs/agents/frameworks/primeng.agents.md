# PrimeNG — Agent Best Practices

## Core Stack Facts

- Angular UI component suite (v17+ supports standalone; v18+: signals-based state, `preset`-theme system; v19: `primeng` package with CSS variables theming); also covers PrimeVue (Vue) and PrimeReact — each is a separate package targeting its framework.
- Tree-shakeable: import components individually (`import { Button } from 'primeng/button'`) — never `import * from 'primeng'`; icons via PrimeIcons font or primeng icons (see icons pack).
- Theming: `@import "primeng/resources/...";` + a theme CSS (Aura/Lara/soho etc.) + `primeng/resources/primeng.min.css`; Angular Material-style theming via CSS variables in newer versions (`--primary-color`, etc.).

## File & Project Conventions

- Angular: standalone components imported in your component's `imports: [ButtonModule, InputTextModule, ...]`; services (`MessageService`, `ConfirmationService`, `DialogService`) via `provideX` in `app.config.ts` providers.
- Theming entry: `styles.css` imports theme + core; `theme` preset configured once in `app.config.ts` (with `providePrimeNG`), NOT per-component.
- Icons/fonts: install `primeicons` package; add font-face resources to `styles.css`; families like `p-button`, `p-inputtext` for custom overrides.

## Framework-Native Idioms

- Use PrimeNG components for their solved problems: `p-table` (sort/filter/paginate), `p-dialog` + `p-fluid`, `p-toast` for notifications, `p-confirmdialog` for destructive confirms — don't rebuild these from scratch.
- Data-driven columns with `p-table` `[value]` + `<ng-template pTemplate="body" let-row>`; pagination state hooks (`(onPage)`/`[rows]`).
- Forms: `p-inputText`, `p-dropdown`, `p-calendar`, `p-checkbox` integrate with ReactiveForms (`formControlName`), not template-driven hacks; validation messages via `p-error`/directives.
- Lazy loading: `load: true` on `p-dropdown`/`p-autoComplete` with `(onLazyLoad)`; `virtualScroll` for big tables.
- Overlays need `appendTo="body"` in scrollable/overflow contexts; `position` (top/bottom/left/right) on Tooltip/Dropdown where clipping occurs.

## Commands & Tooling

- `npm i primeng primeicons` (Angular: also `@angular/cdk` peer) · `ng add primeng` (Angular CLI schematic — wires theme + animations) · verify `angular.json` styles array includes `node_modules/primeng/resources/styles/...`.
- Angular 17+: use `provideAnimations()` / `provideAnimationsAsync()` in providers for toast/dialog animations.
- Check version compatibility: PrimeNG tracks Angular majors — mismatch = peer dep failures; `ng update primeng` after `ng update @angular/core`.

## Common Pitfalls

- **Hallucination traps**: inventing `PrimeNGModule` global imports, `primeng/config` wizard steps, or v16-era `theme: 'lara'` string config that doesn't exist in v17+/v19 — check the installed version's docs; standalone mode needs `providePrimeNG({ theme: { preset: Aura } })` shape.
- Forgetting `appendTo="body"` → clipped dropdowns/calendars inside `overflow: hidden` or `position: relative` containers.
- Z-index/overlay conflicts: default overlay z-index too low vs custom modals — set `baseZIndex` or use `p-overlayPanel` primitives.
- Styling `.p-*` classes with view-encapsulated styles — need `::ng-deep` or `ViewEncapsulation.None` (prefer CSS custom property overrides the theme exports).
- Theme double-load (importing both theme CSS and preset) → style flapping; `primeng/resources/primeng.min.css` loaded twice.
- Generic `p-table` without `[value]` binding → empty; lazy mode without `(onLazyLoad)` → blank pages.

## Rulebase Coupling

- (framework state-pairing): PrimeNG form/table state (page, sort, filter) should pair with the state spec — wire `[rows]`/sort events to signals/state, not internal defaults.
- (desktop/mobile isolation): `p-table` responsive via `responsiveLayout="scroll"`/`[breakpoint]` + `p-datatable` responsive columns; PrimeNG components are the shared DOM layer across targets.
- (i18n packs): PrimeNG locale messages (`p-confirmDialog`/calendar locale) via `@angular/localize` or `MessageService` translations — set `locale` per language.
- (docs hygiene): keep PrimeNG version + theme preset documented in README/styles comments — upgrade steps depend on it.

## References

- https://primeng.org/installation · https://primeng.org/theming · https://primeng.org/table (per-component guides under /<component-name>)
