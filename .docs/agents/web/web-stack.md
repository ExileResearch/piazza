# Piazza — Web Technical Stack

Angular standalone/lazy features under apps/web-client; TypeScript strict; per-app package.json/lockfile. Pin compatible maintained framework/tool versions at implementation. Separate component TS/HTML/CSS/spec files, OnPush, input()/output(), inject(), native template control flow and typed reactive forms. Signals for explicit status/data, computed for view models, RxJS HttpClient for actions/resolvers; no effect() orchestration or parallel hand-written API models.

## Layout and adapters

core/api holds ApiConfigService, contract-backed client, auth interceptor and safe error mapping; core/auth owns session/guards/acting-agent context; core/preferences owns explicit theme/locale/consent actions. shared contains accessible state/table/dialog controls and safe content renderer. features contain auth, control, agents, projects, tasks, inquiries, evidence, discovery, social, artifacts, settings and admin. State belongs to facades, not page-global mutable modules. Route actor/resource changes clear mismatched private caches.

`@piazza/contracts` is file:../../packages/contracts, built first. Zod parse/projection rejects drift. Central origin config plus shared route exports replaces stale exemplar hard-coded constants. Bearer tokens attach only to allowlisted API requests, not arbitrary artifact/external links. Browser access/refresh tokens stay in memory; reload/locale navigation may require reauthentication. Single-flight refresh prevents concurrent rotation races; failure clears session. No localStorage token or implicit cookie session.

## UI and localization

Dark-first and light mode; canvas #25282A/#E4E4E7, muted #A1A1AA, interactive #6F8F82, category #8A6D3B, destructive #AF231C. Inter/JetBrains Mono with Gurmukhi/CJK-capable fallbacks; Lucide; measured contrast, keyboard focus, semantic labels and reduced motion. Interface/policy/system messages in en/fr/es/pa/zh; authored content unchanged and untranslated. No tracking SDK, ads, unselected animation or payment integration.

Use Tailwind token variables, Lucide Angular icons and PrimeNG only for justified accessible complex controls. Do not assume selected raw color tokens meet every text/background contrast pair; measured semantic variants may adjust shades while retaining the palette. Self-host Fontsource fonts with system/script fallback. @angular/localize compile-time XLF extraction/build for all five languages; build output/localized route mapping tested. Locale switch navigates, not runtime dictionary orchestration. No user-authored machine translation.

Sanitize Markdown/HTML; Mermaid strict. Stable image URLs are permission-aware; binaries/documents attachments only. Project notes stay embedded in project view/dialog. Preference persistence is opt-in and online, errors offer explicit retry. No service-worker offline data store or queued HTTP write interceptor.

## Deploy and quality

Root-context multi-stage Dockerfile builds contracts then app, serves locale SPA routes via configured web container/nginx fallback; do not swallow /api or landing routes. No root package manifest. .env.sample or build-config sample includes only public origin/base-path configuration; no server secret in bundles. Coolify hosting, TLS/CSP and source-map exposure documented.

Unit: computed state/error mapping/forms/guards/theme/locale. Component: keyboard/focus/loading/scan/conflict/private-state clearing. Integration: auth/refresh and explicit feature API commands with bounded provider mocks. E2E: applicable E01–E15 against real API, including disconnect before/after sensitive writes. Contract: every request/response uses shared shape and no foreign fields. npm build/typecheck/lint/test plus browser E2E and accessibility evidence gate phases.
