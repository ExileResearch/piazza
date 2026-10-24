# SvelteKit — Agent Best Practices

## Core Stack Facts

- Svelte 5 runes mode: `$state`, `$derived`, `$effect`, `$props`, `$inspect`; runes are plain JS — no legacy `export let`, `$:`, `on:click`, slots (legacy Svelte 4 syntax is deprecated).
- SvelteKit = filesystem-based routing (`+page.svelte`, `+layout.svelte`, `+server.js`); SSR by default with adapters (@sveltejs/adapter-auto/node/static); runes re-render fine-grainedly (no virtual DOM, no hydration diffing — properties are set directly).
- `$state` is deep by default (proxied); effect order differs from React — no render-phase purity guarantees, effects run after DOM updates.

## File & Project Conventions

- Routes: `src/routes/<segment>/+page.svelte` (page), `+layout.svelte` (nested layout, persists across children), `+page.server.js/ts` (server load), `+page.js` (universal load), `+layout.server.js`, `+server.js` (API endpoints, GET/POST/PUT/DELETE exports), `+error.svelte`.
- `src/lib/` for shared code (`$lib` alias — NOT a node_modules import); `src/lib/components/`, `src/lib/server/` (server-only, guarded: importing into client code throws); `static/` for public assets.
- Naming: `+page.svelte` exactly; components `PascalCase.svelte`; `svelte.config.js` (adapter + `compilerOptions`); `vite.config.ts`.

## Framework-Native Idioms

- Reactivity: `let count = $state(0)`; derived `let double = $derived(count * 2)` — **never `$effect` for derived values** (effect = escape hatch); `$props()` destructure for props (`let { type = 'default' } = $props()`).
- Props treated as possibly-changing: values derived from props must use `$derived`, not a plain `const` (stale capture trap).
- Events: `onclick={handler}` attribute shorthand — not `on:click`; `bind:value`, `bind:this`; window/document listeners go in `<svelte:window onkeydown={...} />` / `<svelte:document />`, NOT `onMount`/`$effect`.
- Snippets (`{#snippet name(params)}`) + `{@render name(...)}` render tags replace slots/`$$slots`; snippets are props — `let { children } = $props()` then `{@render children?.()}`; type with `import type { Snippet } from 'svelte'`.
- Lists: **keyed each blocks** `{#each items as item (item.id)}` — key must uniquely identify the item, never the index; avoid destructuring when mutating the item (breaks `bind:` identity).
- Data loading: `load` functions in `+page.server.js` return props; use `$page.data`; `await` in load is fine (SSR awaits it).
- Context via `setContext`/`getContext` (or `createContext` for typed) — never shared module state for per-user data (SSR leak between users).
- `$effect` for external sync only — prefer `{@attach fn}` (Svelte 5.29+, replaces `use:action` for DOM integration), `createSubscriber` (svelte/reactivity) for external event sources, `$inspect`/`$inspect.trace` for debugging (never ship `$inspect` — dev-only).
- Styling: `<style>` is scoped; JS-driven CSS via `style:--custom-prop` + `var()`; parent styling of child via CSS custom properties or `:global` (inherits through component boundary).
- Experimental async (5.36+): `await` in `<script>`/markup/`$derived` needs `compilerOptions.experimental.async` in `svelte.config.js`; `hydratable('key', fn)` avoids re-fetching server data on hydration (devalue-serializable); `<svelte:boundary>` + `pending` snippet for loading UI; `fork()` for preload intent.

## Commands & Tooling

- `npx sv create` (official scaffold: SvelteKit, adapter, TS, prettier/eslint options) · `npm run dev -- --open` · `npm run build` (adapter output to `build/`) · `npm run preview` · `npx svelte-check` (TS for SFCs — required, tsc alone won't check .svelte) · `npx prettier --write --plugin prettier-plugin-svelte`.
- Check `svelte.config.js` for adapter (auto → platform); `npm run build && npm run preview` verifies production behavior (SSR + streaming).

## Common Pitfalls

- **Runes traps**: forgetting `.value` is wrong — runes auto-track; `$derived` takes an expression, use `$derived.by(() => ...)` for function bodies; derived objects/arrays are NOT deep-reactive (use `$state` inside `$derived.by` if mutation needed).
- Mutating state inside `$effect` → effect loops; never wrap effect contents in `if (browser)` (effects never run on server); effects run on server only in rare SSR cases — gate external-touch code properly.
- Uploading `$state` to `window`/`globalThis` breaks SSR (leaks across requests) — keep state in components/context.
- Assumed `export let`/`$:` (legacy syntax) — compiler errors in runes mode; don't "upgrade" runes code to stores (use classes with `$state` fields instead — the modern replacement).
- Load-fetching in `onMount` instead of `load` → flash of loading + no SSR data; `load` is the only place for server data.
- `{#each}` without key or with index key → DOM churn, broken `bind:` state on reorder.
- Hydration mismatch: random/time values in SSR-rendered markup (use `hydratable('key', () => Math.random())`); CSP with inline scripts needs `nonce`/hash on `render`.

## Rulebase Coupling

- (framework state-pairing): map state spec → `$state` (component) / `$page.data` (route) / context (scoped) / classes-with-`$state`-fields (shared) — never module singletons.
- (desktop/mobile isolation): shared SFCs across targets; layouts per platform; responsive via CSS custom properties + media queries.
- (i18n packs): `$lib/paraglide` or svelte-i18n with `$lib/locales`; hardcoded strings fail
- (docs hygiene): generated pages keep `+page.svelte` small, documented; don't delete load function comments or test files.

## References

- https://svelte.dev/docs/svelte/what-are-runes · https://svelte.dev/docs/kit/introduction · https://svelte.dev/docs/svelte/$effect · https://svelte.dev/docs/kit/load
