# Fontsource — Agent Best Practices

## Core Stack Facts

- Fontsource = self-hosted open-source font packages on npm (`@fontsource-variable/inter`, `@fontsource/roboto`, etc.) — fonts ship as WOFF2 with CSS, zero Google Fonts CDN runtime dependency.
- Variable fonts available via `@fontsource-variable/*` (one file, full weight range, `font-variation-settings`); static weights via `@fontsource/*` (import per weight: `@fontsource/inter/400.css`, `500.css`...).
- Works everywhere CSS imports work: SvelteKit, Next.js, Vite, plain HTML; tree-shaken at build, hashed filenames, preloaded via `<link rel="preload">` in v4+ API docs.

## File & Project Conventions

- Import in your global stylesheet (`src/app.css` for SvelteKit/Vite, `layout.tsx` for Next) — one import per font set: `import '@fontsource-variable/inter';`.
- Font stacks declared once, in a `@theme`/CSS variable or `:root` — `--font-sans: 'Inter Variable', ui-sans-serif, system-ui, sans-serif;` (Tailwind v4: `--font-sans` token registers the whole family).
- Keep `@fontsource/*` imports in the entry CSS, not scattered in components — duplicated imports = duplicated font-face declarations.

## Framework-Native Idioms

- Preloading: add `import '@fontsource-variable/inter/wght.css'` (axis-specific) or set `font-display: swap` (default) — variable fonts keep CLS low via `size-adjust` metrics override files where provided.
- Tailwind: register in `@theme { --font-sans: ...; --font-mono: ...; }` then use `font-sans`/`font-mono` utilities.
- SvelteKit: import in `+layout.svelte`'s `<style>` or root `app.css`; Next.js: import in `layout.tsx` (or use `next/font` — but Fontsource is the framework-agnostic equivalent; don't double-load).
- Subsetting: Fontsource packages are already subsetted by unicode-range — don't hand-subset; lazy-load secondary fonts (e.g. display faces) with `font-display: swap`.

## Commands & Tooling

- `npm i @fontsource-variable/inter` · verify with `npm ls @fontsource`.
- Check `node_modules/@fontsource-variable/inter/` for available CSS entrypoints (`index.css`, `wght.css`, `standard.css`); weights via `400.css` etc. on non-variable packages.
- Bundle check: `npm run build` then inspect `dist/assets/*.woff2` — fonts present and hashed; use `fonttools`/`woff2_compress` only for custom fonts.

## Common Pitfalls

- **Hallucination traps**: `@import url('https://fonts.googleapis.com/...')` = NOT Fontsource — Fontsource is self-hosted; inventing non-existent package names (`@fontsource-variable/inter-italic` → it's `@fontsource-variable/inter` with `font-style: italic` support inside) or assuming `@fontsource/<name>/400.css` exists when only the variable package was installed.
- Missing font-display consideration: `swap` (default) avoids invisible text; `block` hides text — pick deliberately.
- Importing a static weight CSS that doesn't exist (variable package has no per-weight files).
- Forgetting the font stack fallback list: `font-family: 'Inter Variable'` alone on non-woff2-capable or offline contexts → fallback chain mandatory.
- Double-loading: Fontsource import + Google Fonts link tag + `next/font` all for the same family → duplicate network + CLS regressions.

## Rulebase Coupling

- (framework state-pairing): typography family/weights are design-spec state — declare once in `@theme`, referenced by tokens (`font-sans`), never per-component.
- (desktop/mobile isolation): one font pipeline for all targets; mobile perf = subsetting/axes, not separate font files per platform.
- (i18n packs): non-Latin scripts (Cyrillic, Arabic, CJK) need the font's subset coverage — verify the Fontsource package supports the locale's script before shipping; RTL fonts in the same stack.
- (docs hygiene): comments in `app.css` naming which font/weight each `@theme` token maps to — agents preserve these on edit.

## References

- https://fontsource.org/docs/getting-started/introduction · https://fontsource.org/docs/getting-started/install · https://fontsource.org/fonts/inter (per-font pages list axes & subsets)
