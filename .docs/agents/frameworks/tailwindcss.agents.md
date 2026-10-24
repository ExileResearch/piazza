# Tailwind CSS — Agent Best Practices

## Core Stack Facts

- v4: CSS-first configuration — `@import "tailwindcss";` in your CSS is the whole setup; no `tailwind.config.js` needed (JS config is optional, loaded via `@config`).
- Utility-first: `flex`, `grid`, `p-4`, `text-sm`, `hover:`/`focus:`/`dark:` variants; v4 uses `@theme { --color-brand: ...; }` to register design tokens as CSS custom properties; automatic content detection (no `content` array).
- Works with any framework via PostCSS plugin, `@tailwindcss/vite` plugin, or the standalone CLI; SvelteKit/Next/Vue all supported (see framework packs).

## File & Project Conventions

- `src/app.css` (or `index.css`) with `@import "tailwindcss"` + optional `@theme` block imported once in the root layout; component classes via `@layer components` or `@apply`.
- Design tokens live in `@theme` (colors, spacing scale overrides, fonts) — not scattered hex values; `@custom-variant` for custom variants (e.g. `@custom-variant dark (&:where(.dark, .dark *));`).
- Keep utility soup out of JS/TS — classes in markup only; long class lists can be extracted to `@utility` or component classes, but prefer composing utilities in templates (`class="flex items-center gap-2 ..."`) for flexibility.

## Framework-Native Idioms

- Responsive: mobile-first prefixes `sm:` `md:` `lg:` `xl:` — write base styles for mobile, add breakpoints up; `container` for width constraints; `min-h-screen`, `grid-cols-*` for layouts.
- Variants: `hover:`, `focus-visible:` (a11y), `active:`, `group-hover:`, `peer-`, `dark:`, `aria-`, `data-` custom variants in v4.
- Arbitrary values sparingly: `w-[calc(100%-2rem)]` when the scale lacks it — usually a sign a token is missing; prefer tokens.
- `@apply` in `@layer components` for repeated button/input patterns WITH token values; don't `@apply` exotic variants that can't be statically analyzed.
- Framer/GSAP/three.js interplay: Tailwind classes for layout — inline styles/`style:` for animation-driven properties (Tailwind purges!). See animation packs.

## Commands & Tooling

- Install: `npm i tailwindcss @tailwindcss/vite` → add plugin to `vite.config.ts` → `@import "tailwindcss";` in CSS. PostCSS path: `npm i tailwindcss @tailwindcss/postcss` + `postcss.config.mjs`.
- `npx @tailwindcss/cli -i input.css -o output.css` for non-bundler use; `npx tailwindcss` (v4 CLI).
- Editor: official Tailwind CSS IntelliSense extension (class autocomplete + `@apply` support); `tailwind-merge` for component libs that combine user + default classes (clsx + twMerge pattern).

## Common Pitfalls

- **Hallucination traps**: v3-isms (`tailwind.config.js` content array, `@tailwind base/components/utilities` directives) are v4-wrong — v4 is CSS-first with `@import "tailwindcss"`; don't emit `purge: [...]` (v4 auto-detects); `darkMode: 'class'` option replaced by `@custom-variant`.
- Forgetting `@import "tailwindcss"` in the entry CSS → nothing styled but no error.
- Dynamic class strings: `bg-${color}-500` gets purged — always use full class names or safelist patterns; conditional via object maps `{ 'bg-red-500': isError }` + clsx.
- Breaking token scale: hardcoding hex in components instead of `@theme` tokens → no dark mode, no consistency; overriding `--color-*` needs full token defined once.
- Scoped-component CSS + Tailwind: `.vue` `<style scoped>` is separate from the global Tailwind layer — don't expect `@apply` to see scoped tokens unless imported.

## Rulebase Coupling

- (framework state-pairing): theme tokens (colors/spacing/typography) are part of the state+design spec — declare in `@theme` once, never duplicate in components.
- (desktop/mobile isolation): responsive utilities carry the isolation — no platform-forked CSS files; tablet/desktop = breakpoint variants only.
- (i18n packs): RTL support needs logical properties (`ms-/me-`, `ps-/pe-` in v4) — don't hand-write `ml-`/`mr-` for bilingual layouts.
- (docs hygiene): keep `@theme` blocks commented (token purpose); generated components retain their utility classes as documentation.

## References

- https://tailwindcss.com/docs/installation/using-vite · https://tailwindcss.com/docs/theme · https://tailwindcss.com/docs/functions-and-directives · https://tailwindcss.com/blog/tailwindcss-v4
