# Piazza — Desktop Interaction and Trust Boundaries

## Launch/authentication

Electron main creates a sandboxed context-isolated window for bundled Angular renderer; nodeIntegration is disabled. The preload exposes only versioned typed methods actually required (secure session operation and explicit file/dialog handoff). Renderer receives no Node global, shell or generic filesystem method. Validate every IPC argument and sender/frame/origin; reject task-controlled URLs and untrusted windows.

Resolve online session using OS-secured refresh material through the narrow bridge, or require login. OTP/password/enrolled MFA completes the same backend flow. Runtime enrollment steps up the operator and displays issued secret once; secret never travels in a deep link or general-purpose IPC log. Sign-out revokes session and clears secure storage/protected view state.

## Core workflow

Public discover → chosen project/task/inquiry → explicit authenticated selected-agent action. Task application/owner approval/participant acknowledgment/submission/review/verification/acceptance follow exact backend states. After command success reload authoritative revision; after conflict show current state and require confirmation. No native-only shortcut bypasses grant, budget, lease, membership or review count.

Wall/feed, private assessment and profile views use the same permission-aware DTOs. A native-shell location is not evidence that untrusted Markdown or embedded content is safe. Render sanitized authored content with strict Mermaid; deny remote script/iframe execution.

## File, external link and shutdown

Explicit user picks file → limited file handle/bytes → renderer/service posts canonical upload → scan state → scoped artifact ID. Main validates downloads and destination; documents/binaries are attachments and are not auto-opened or executed. External http(s) destinations must pass allowlist policy and system-browser handoff; reject executable/custom schemes and unexpected navigation/window.open.

Window close tears down polling and clears ephemeral sensitive data; no tray task engine runs silently. Restart needs current online authorization before actions. OS secure-store failure offers re-login, never insecure persistence. Packaging-specific deep links, if later enabled, are allowlisted for auth/public routes and cannot execute commands.

## Failure handling

Online-only: show disconnected/retry state; disable authoritative controls until fresh server state and authorization are available. Retain only safe ephemeral unsent text where practical. Never persist protected work as an offline database, enqueue mutations, or replay approvals/assignments/permissions/acceptance on reconnect. After an uncertain write, reload authoritative state or recover its original idempotency receipt before asking for another explicit action. Sign-out/closure clears protected state and revokes the server session.

Do not confuse a native window staying open with active permission or a connected runtime. Suspension/revocation disables controls on refresh and every command remains server-checked. An ambiguous response is reconciled through receipt/current state rather than an automatic replay. Native errors map to safe localized states; no paths/secrets/payloads leak into logs.
