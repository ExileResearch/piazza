# Three.js — Agent Best Practices

## Core Stack Facts

- WebGL scene graph library (r160+): `Scene`, `PerspectiveCamera`, `WebGLRenderer`, `Mesh` + `Geometry`/`Material`; ES modules via npm, no script-tag CDN for apps.
- Render loop via `requestAnimationFrame` (or `WebGPURenderer` emerging); Three is imperative — frameworks (react-three-fiber, svelte-cubed) wrap it declaratively; lighting/physically-based materials (`MeshStandardMaterial`) are the modern default.
- Full control model: camera, controls (`OrbitControls` from `three/examples/jsm/controls/`), loaders (`GLTFLoader`), shaders (ShaderMaterial), postprocessing (EffectComposer).

## File & Project Conventions

- One scene module per experience (`scene.ts` exports `createScene(container)`); component wrapper owns the renderer + lifecycle; keep three code off the main data flow — it mutates imperatively.
- Assets in `static/`/`public/` (gltf, textures) loaded via URL, not imported bundles; or import via `?url` in Vite.
- Types: `@types/three` or three's bundled types; JSM example imports (`three/examples/jsm/...`) — never `three/examples/jsm/postprocessing/` path typos.

## Framework-Native Idioms

- Lifecycle: create renderer in mount, `renderer.setAnimationLoop` (or RAF loop), dispose in teardown — `renderer.dispose()`, `geometry.dispose()`, material/texture `.dispose()`; remove canvas from DOM.
- Sizing: `renderer.setSize(w, h)` + camera aspect; observe container resize (`ResizeObserver`) — re-render on resize; `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` for perf.
- React: react-three-fiber (`Canvas`, `useFrame`, primitives) — don't hand-manage RAF in React; Svelte: svelte-cubed or `{@attach}`-style mount; Angular: mount in `ngAfterViewInit` + destroy in ngOnDestroy.
- `OrbitControls.enableDamping = true` requires `controls.update()` each frame; light units: use `useLegacyLights = false` + `renderer.toneMapping`.
- VR/XR: `renderer.xr.enabled` + `ARButton`/`VRButton`.

## Commands & Tooling

- `npm i three` (+ `@types/three`, or `react-three-fiber` + `@react-three/drei` for React).
- Dev: `vite dev` serves three fine; check WebGL support `WebGL.isWebGL2Available()`; `three/examples/jsm/utils/` has helpers; `gltf-transform` CLI for asset optimization.
- Debug: `import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'` for camera inspection; `three-stdlib` if using R3F.

## Common Pitfalls

- **Hallucination traps**: `three.js` global import syntax (`new THREE.Scene()` without import) in modules; fabricating loader paths (`three/addons/` is the import-map alias only in CDN docs — npm uses `three/examples/jsm/`); inventing `renderer.setAnimationLoop` availability before r113 (it's standard now, but don't mix old `requestAnimationFrame` patterns with it).
- Memory: not disposing geometries/materials/textures on unmount → GPU memory growth; textures from canvas/DataTexture need `.needsUpdate = true`.
- Unit/scale confusion (meters vs arbitrary) — GLTF exports in meters; camera far/near planes too tight → clipped meshes.
- Resize without ResizeObserver → stretched/aspect-distorted renders.
- Fullscreen canvas + CSS: canvas must be inside a positioned container; `position: fixed; inset: 0` for backgrounds — z-index under content.
- Interaction: raycasting without `updateMatrixWorld` → stale hit tests; `pointer-events: none` on overlay canvases.

## Rulebase Coupling

- (framework state-pairing): scene/config state (camera, object transforms, animation params) should map to the state spec — three's internal object graph is not the app's state; mirror it.
- (desktop/mobile isolation): mobile → lower pixel ratio, reduced geometry (LOD), `touch-action: none` handling; desktop → full effects (isolation knobs).
- (i18n packs): UI overlays over WebGL must be DOM/locale-driven (never canvas-text); aria/fallback content for non-WebGL contexts.
- (docs hygiene): keep scene module docblocks and dispose calls intact when editing generated code.

## References

- https://threejs.org/docs/ · https://threejs.org/examples/ · https://github.com/pmndrs/react-three-fiber (R3F) · https://drei.docs.pmnd.rs/
