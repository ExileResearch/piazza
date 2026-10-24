# Localization (i18n) — Agent Best Practices

## Core Stack Facts

- i18n = externalized UI strings + locale data (dates, numbers, plurals) + RTL/LTR layout; l10n = the translation artifact set. Defaults: English source strings (`en.json`), per-locale message files, ICU MessageFormat plurals via libraries (not hand-rolled `if`).
- Library per framework: `@angular/localize`/ngx-translate (Angular), `react-i18next`/`lingui` (React), `vue-i18n` (Vue), `svelte-i18n`/`Paraglide` (Svelte/SvelteKit), `next-intl` (Next.js), `@nuxtjs/i18n` (Nuxt) — see framework packs.
- Locale detection: `navigator.language`/Accept-Language, persisted override; canonical locale codes (`en-US`, `fr`, `de-AT`) — never invent codes.

## File & Project Conventions

- One JSON per locale in `src/locales/<locale>.json` (`en.json`, `fr.json`, ...) with dot-namespaced keys (`nav.home`, `errors.retry`); keep key sets identical across locales — missing keys fail silently → lint them.
- Keys are stable identifiers — never derive translations from English strings at runtime; messages versioned with app version; locale metadata (name, dir, date/number formats) in a `locales.config.ts`/`site.config`.
- Provider setup at root: `app.config.ts` providers (Angular), `I18nextProvider`/`next-intl` provider (React/Next), `createI18n` (Vue), `paraglide` init (`svelte.config.js` + `hooks.server.js`).

## Framework-Native Idioms

- Interpolation + plurals: `t('items', { count })` with ICU `{count, plural, one {# item} other {# items}}` — plural rules differ per locale (`ru`, `ar` have many forms); never `if (count === 1)`.
- Dates/numbers: `Intl.DateTimeFormat(locale)`/`Intl.NumberFormat` via the i18n lib (`useIntl().formatDate`) — never `toLocaleDateString()` with the default locale (SSR/client mismatch).
- SvelteKit: Paraglide JS (typed messages, tree-shaken) — `msg()`/`t()` in `$lib/paraglide/messages.js`; route-based locale: `[locale]` dynamic segment + `handle` hook or cookie-based with `redirect` — set `lang`/`dir` attributes on `<html>`.
- Next.js: `[locale]` segment, `getRequestConfig`, `unstable_setRequestLocale`; static export needs per-locale `generateStaticParams`.
- Vue/Nuxt: `$t` in templates + `useI18n()`; `nuxt.config` `i18n` module with per-locale routes (`prefix: 'except_default'` decision).
- Angular: `$localize` (compile-time, extraction via `ng extract-i18n`) or ngx-translate (runtime JSON); `LOCALE_ID` + `registerLocaleData` for pipes.
- RTL: `dir="rtl"` on `<html>` per locale + logical CSS properties (`margin-inline-start`, `ps-`/`me-` Tailwind v4 utilities) — no `left`/`right` hardcoding.

## Commands & Tooling

- Extraction: `npx lingui extract` / `ng extract-i18n` / `sveltekit` paraglide `paraglide-js compile`; message lint (`i18next-parser`, `formatjs` lint) in CI — fail build on missing/extra keys.
- `npm i <framework-lib>` + provider wiring; run `npm run build` to catch SSR hydration mismatches from locale-dependent rendering.
- Tooling: `formatjs`/`lingui` macro parsing in editors; translation management via Crowdin/Lokalise/POEditor out of band (don't hand-edit 40 locales in PRs).

## Common Pitfalls

- **Hallucination traps**: inventing locale codes or messages map shapes; assuming `t()` exists without the provider mounted; fabricating ICU syntax (`{count, plural, =1 {one} other {other}}` — `=1` is valid only with explicit numbers; don't mix `one`/`=1` wrongly); `$t` in Vue templates vs `t()` in setup — both fine, but never both for the same message in a chaotic way.
- Hardcoded strings in components; reusing source-language strings as keys (English drift).
- Missed plurals/genders for `ru/pl/ar` — `{count, plural}` with wrong cardinal categories.
- SSR/client `Intl` mismatch → hydration warnings; always pass explicit locale.
- Forgetting `<html lang>` / `dir` update on locale switch → a11y + SEO issues; `<meta hreflang>` for multi-locale SEO.
- Lazy-loading locale chunks that 404 (missing file) or bloating the main bundle (import all locales eagerly when small).

## Rulebase Coupling

- (i18n packs): every user-facing string through the message layer; locale list is spec state; missing translation keys = build/lint failure, not runtime fallback.
- (framework state-pairing): `locale` + `dir` are global state (context/store per framework) — pair with the state spec, persisted (cookie/localStorage).
- (desktop/mobile isolation): same message files across targets; font/script coverage per locale (see fontsource pack) — mobile perf = loading only the active locale.
- (docs hygiene): locales config documented; extraction/lint pipeline kept in CI config; don't delete `locales/*.json` keys when refactoring components.

## References

- https://www.i18next.com/ · https://formatjs.github.io/docs/getting-started/application · https://inlang.com/m/gerre34r/library-inlang-paraglideJs · https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
