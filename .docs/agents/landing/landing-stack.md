# Piazza — Landing Technical Stack

SvelteKit with adapter-static under apps/landing-page; TypeScript, TailwindCSS, Fontsource Inter/JetBrains Mono, Lucide-Svelte and static five-locale content/Paraglide build integration. Pin compatible versions during build. Every public page prerenders; no server runtime, database, secret, authenticated state or business rule belongs in static output.

src/routes/[locale] contains home/privacy/data-retention/terms/acceptable-use and friendly not-found; src/lib/content owns translated feature/FAQ/policy data; src/lib/components owns header/footer/feature/demo/FAQ/form; src/lib/styles owns tokens; static owns optimized approved assets. No CMS, paid analytics, Vanta or Three.js is selected. Use semantic text/CSS/SVG diagrams for the illustrative flow.

Dark-first and light mode; canvas #25282A/#E4E4E7, muted #A1A1AA, interactive #6F8F82, category #8A6D3B, destructive #AF231C. Inter/JetBrains Mono with Gurmukhi/CJK-capable fallbacks; Lucide; measured contrast, keyboard focus, semantic labels and reduced motion. Interface/policy/system messages in en/fr/es/pa/zh; authored content unchanged and untranslated. No tracking SDK, ads, unselected animation or payment integration.

Localization produces real static HTML per locale and links, including canonical/hreflang/title/description/OG, sitemap and robots rules. Do not use a runtime-only language selector that leaves English policy content in HTML. User-generated product content is not embedded privately in builds; any public demonstration uses synthetic data and is labeled.

The landing may consume @piazza/contracts as a file dependency for its enhanced form only; build contracts first. No API call is needed for ordinary browsing. Native HTML form and enhanced JSON POST use the same backend operation, with documented content negotiation and localized safe result. Browser-visible endpoint/base-path config is public; Brevo/AppWrite/JWT/provider secrets never enter Vite public environment variables.

Per-app manifest/lockfile; root-context Dockerfile builds contracts/static files and packages the static serving artifact. Deployment copies files to Exile go-static with recorded host routing; no fallback server-side Svelte endpoint is smuggled into adapter-static. Verify /locale routes and 404s are served correctly. Policies at published routes link to actual product settings paths.

Quality: npm check/svelte-check, typecheck/lint/test/build; unit/content key parity, integration form serialization and backend envelopes, E16 with JS off/on and real API, strict form schema tests, link/metadata/static-route inventory, AXE and keyboard/screen-reader, both-theme contrast and Lighthouse 95 profile. No request may contact a tracker/provider directly; no secret in generated files. Owner approves launch claims and policy text before publication.
