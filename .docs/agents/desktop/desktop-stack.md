# Piazza — Desktop Technical Stack

Angular renderer plus Electron main/preload under apps/desktop-client, independently locked manifest. Import @piazza/contracts via file:../../packages/contracts; build contracts before app. Renderer uses standalone components, separate files, Signals/computed, typed forms, explicit RxJS requests, compile-time @angular/localize and Tailwind/Lucide/Fontsource. No second frontend stack or runtime translation store. Match web behavior/design without cross-editing apps/web-client; shared UI extraction is a future explicit package decision.

## Security architecture

Main manages window lifecycle and OS-specific services; preload is a narrow typed bridge; renderer is unprivileged bundled local content. Require contextIsolation, sandbox, nodeIntegration false, restrictive CSP and permission-request denial by default. Deny untrusted navigations/new windows and validate sender/frame/origin/arguments on every IPC request. Never expose ipcRenderer/send/invoke generically, arbitrary shell/exec, arbitrary file read/write, provider keys or general authenticated HTTP proxy. Controlled HTTPS API access stays on the permitted origin.

Use a reviewed OS credential integration; keep access tokens renderer-memory only and refresh material in native secure storage. A Linux backend lacking encrypted storage cannot fall back to plaintext. Session bridge operations are tightly scoped and do not let task content retrieve secret bytes. One-time runtime enrollment credentials are displayed only for the explicit operator workflow and cleared immediately after handoff. No remote webpage loads in the privileged local app window.

## Native build decisions

Before code: choose target OS/architectures, compatible Electron/Angular/Node integration, secure-store support, package tool and signing/notarization/distribution path against official docs. No dedicated Electron note was supplied, so project constraints govern until verified implementation references are recorded. No auto-update service is selected initially; manual signed updates with documented provenance are a proposed starting point, subject to owner decision.

Per-app .env.sample documents public API/base-path config, not signing or runtime secrets. Dockerfile from root context builds contracts/renderer and supports Linux-compatible checks; selected native runners build/sign/test appropriate artifacts, because a Linux Docker build does not prove macOS/Windows packaging. Compose never starts a desktop GUI in production. Packaging runs without real user accounts/secrets in build artifacts.

Dark-first and light mode; canvas #25282A/#E4E4E7, muted #A1A1AA, interactive #6F8F82, category #8A6D3B, destructive #AF231C. Inter/JetBrains Mono with Gurmukhi/CJK-capable fallbacks; Lucide; measured contrast, keyboard focus, semantic labels and reduced motion. Interface/policy/system messages in en/fr/es/pa/zh; authored content unchanged and untranslated. No tracking SDK, ads, unselected animation or payment integration.

## Verification

Typecheck/lint/unit tests cover bridge schemas/state/error handling. Integration tests exercise main/preload security, secure-store fallback and auth refresh. Packaged E2E covers applicable E01–E15 including stale writes and disconnect/no replay. Contract tests validate both IPC allowed methods and API projections, using one source of domain shapes. Audit dependencies, preload exposure, navigation, dangerous schemes, downloads and secret logs. Run native keyboard/screen-reader, five-locales and both-theme checks on every selected target; signed artifact installation is a release gate.
