# Icons (Lucide / FontAwesome / Remix / Phosphor / Tabler) — Agent Best Practices

## Core Stack Facts

- Default choice: **Lucide** (`lucide-*` packages: `lucide-react`, `lucide-vue-next`, `lucide-angular`, `lucide-svelte`, `lucide-static`) — clean 24px stroke icons, tree-shaken per-icon named exports.
- Alternates: Font Awesome (`@fortawesome/fontawesome-free` + `@fortawesome/react-fontawesome` etc., icon fonts + SVG), Remix Icon (`remixicon` CSS font), Phosphor (`@phosphor-icons/react` etc., 6 weights, duotone), Tabler (`@tabler/icons-react` etc., stroke style, 4k+ icons).
- All five export **named icon components** (tree-shakeable) — string-literal component mapping (`<Icon name="x" />`) is NOT the Lucide/Phosphor/Tabler API and kills tree-shaking.

## File & Project Conventions

- Pick ONE icon set as primary (per repo — Lucide for the catalog's SvelteKit stack); import icons directly where used: `import { Heart } from 'lucide-svelte';` — no global `icons.js` registry unless a dynamic map is truly needed.
- Font-based sets (FontAwesome free/Remix): import the CSS once (`@fortawesome/fontawesome-free/css/all.min.css` or `remixicon.css`) in the root stylesheet + use `<i class="fa-solid fa-heart">` / `<i class="ri-heart-line">`; keep brand/regular/solid prefixes consistent.
- Sizes/colors: Lucide/Phosphor/Tabler accept `size`/`stroke-width`/`color` props — use those + CSS (`currentColor`) rather than wrapper divs; fonts via CSS `font-size`/`color`.

## Framework-Native Idioms

- `currentColor` inheritance: icons tint with surrounding text color by default — set `class="text-red-500"`/`color` on the icon, not a nested span.
- Aria: decorative icons get `aria-hidden="true"`; meaningful icons need `role="img"` + `<title>`/`aria-label` (don't rely on tooltips).
- SvelteKit/Vite: import the framework package (`lucide-svelte` not `lucide-react`) — wrong package = runtime mismatch; dynamic-icon components (`<DynamicIcon>`) exist for runtime-name lookup, use only when icon names come from data.
- PrimeNG's `PrimeIcons` (`pi pi-*` classes) is a separate font — don't mix with Lucide for the same control; see primeng pack.

## Commands & Tooling

- `npm i lucide-svelte` (or `lucide-react` / `@tabler/icons-react` / `@phosphor-icons/react` / `remixicon` / `@fortawesome/fontawesome-free`).
- Verify names against the set's docs page (`https://lucide.dev/icons/<name>`); typo'd names fail at build with named-export errors — good signal, don't grep-workaround.
- Bundle check: `npm run build` and confirm `dist/assets/*.js` includes only used icon modules when tree-shaken (Vite/Rollup handles it).

## Common Pitfalls

- **Hallucination traps**: inventing icon names (Lucide has no `fa-*` classes; copying FontAwesome class strings into Lucide code and vice versa); `import { icons } from 'lucide-react'` wholesale (kills tree-shaking, huge bundle); `Icon name="x"` generic-component API that doesn't exist in these packages.
- Wrong package per framework (vue vs react vs svelte named exports differ).
- `<i class="pi pi-check">` vs `fa-solid` vs `ri-` prefixes: each font set has its own class namespace — using the wrong prefix silently renders nothing (or raw glyph).
- Forgetting `aria-hidden` on decorative icons (a11y scan failures).
- Color via wrapper `span` instead of icon props/`currentColor` → unstyled in dark themes.

## Rulebase Coupling

- (framework state-pairing): icon-set choice + size/color tokens are design-spec state — document the chosen set and its props contract in the state spec.
- (desktop/mobile isolation): same set across targets; touch targets sized via CSS not icon `size` inflation.
- (i18n packs): icons carrying meaning (arrows, status) need `aria-label` from locale strings, not hardcoded English.
- (docs hygiene): keep icon imports/usage consistent (named imports), no commented-out clones — agents keep generated icon usages clean.

## References

- https://lucide.dev/guide/packages · https://docs.fontawesome.com/web/use-with/react · https://remixicon.com/ · https://phosphoricons.com/ · https://tabler.io/icons
