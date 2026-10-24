# Vanta — Agent Best Practices

## Core Stack Facts

- Vanta.js = Three.js-based animated background scenes (NET, WAVES, BIRDS, FOG, GLOBE, RINGS, CELLS, etc.) — drop-in `<div>` background via `VANTA.<EFFECT>({ el, ... })` or the framework wrappers (`vanta-react`, `vanta-vue`, `vanta-angular`).
- Three.js peer dependency (install both; vanta bundles the effect classes, three powers the renderer); ~v0.5.x current (Google Analytics-only API in v0.5.25+, no key needed for local).
- Config per effect: `mouseControls`, `touchControls`, `gyroControls`, `minHeight`, `minWidth`, `scale`, `scaleMobile`, plus effect colors (`color`, `backgroundColor`).

## File & Project Conventions

- One component per background (`BackgroundScene.svelte/tsx/vue`) wrapping the vanta instance lifecycle; instance stored in a ref/`$state` for cleanup; never scatter `VANTA.NET()` calls across pages.
- Config object (colors, controls, scale) defined once as a typed constant — reuse across routes; keep it in `src/lib/` if shared.
- Import pattern: `import NET from 'vanta/dist/vanta.net.min'` + `import * as THREE from 'three'` — pass `THREE` to the effect options.

## Framework-Native Idioms

- Lifecycle = mount/unmount only: create in `onMount` (Svelte) / `useEffect` (React, guard for SSR) / `ngAfterViewInit` (Angular), destroy in the teardown (`() => vanta.destroy()`); never recreate on every re-render.
- SSR guard: vanta touches `window` — create inside client-only lifecycle; for SvelteKit check `browser` before init (or use `{@mount}`/client component); Next.js needs `'use client'` + mounted check.
- Pause/restart: `vanta.setOptions()` to swap colors live; destroy + recreate on container resize if `scale: true` misbehaves; respect `prefers-reduced-motion` by skipping init entirely.
- Combine with a gradient/color overlay div for text legibility — backgrounds are decorative: `aria-hidden="true"`, content sits above via `position: relative; z-index`.

## Commands & Tooling

- `npm i vanta three` (+ `@types/three` for TS) · framework wrappers: `npm i vanta-react` / `vanta-vue` / `vanta-angular` if you want `<Vanta />` components.
- Dev check: `npm run dev` → background animates; verify no console errors about WebGL context; test `scaleMobile` on device emulation.
- Performance: `devices`/`fps: 60` defaults are fine; for low-power, disable `mouseControls` on touch (`touchControls: false`) — mobile battery.

## Common Pitfalls

- **Hallucination traps**: inventing API keys ("VANTA_ANALYTICS_UUID"? no — v0.5.25+ automatically reports; no key required), non-existent effects (`VANTA.FIREWORKS` isn't a shipped preset — stick to documented presets), or `vanta.js` script-tag-only usage when npm is the norm.
- Missing `THREE` import → `THREE is not defined` runtime — pass the instance explicitly.
- SSR crash: calling `VANTA.NET` during server render (SvelteKit/Next) throws — always lifecycle-guard.
- Memory leaks: no `destroy()` on unmount → WebGL context piles up; single Canvas context limit (~16) — leak enough tabs and backgrounds go blank.
- Overlapping WebGL: multiple vanta instances on one page fight for context — one background per view, destroy on route change (SvelteKit: destroy in `onDestroy`).

## Rulebase Coupling

- (framework state-pairing): background config (colors, enabled) belongs in the design-state spec — expose as props/`$state`, not hardcoded per route.
- (desktop/mobile isolation): `touchControls`/`scaleMobile`/`gyroControls` are the isolation knobs; disable heavy effects on mobile per
- (i18n packs): backgrounds are decorative — no strings; ensure overlay text remains readable in all locales' script density.
- (docs hygiene): comment the effect name + config in the component; don't strip the destroy/cleanup code when editing.

## References

- https://www.vantajs.com/ · https://github.com/tengbao/vanta · https://www.npmjs.com/package/vanta
