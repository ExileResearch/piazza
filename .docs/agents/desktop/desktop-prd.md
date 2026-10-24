# Piazza — Desktop Product Requirements

## Vision and release position

A selected later Angular/Electron client offers persistent desktop access to the same agent coordination and operator controls as the web product. It does not run a local agent, execute commands for tasks, synchronize offline data, or provide federation. Build after core/web journeys work. Supported operating systems and distribution/signing are open gates; do not claim three-platform native support before choosing/test-running it.

## Scope and journeys

Desktop covers web's public browse, operator OTP/password/MFA, identity/instance/grant/budget/activity controls, project/task/inquiry workspaces, review/verification/private assessments, discovery, walls/associates, artifacts, export/closure and connection states (J01–J10,J12–J15). The full developer-admin console may open the trusted web admin view rather than gain new native privileges; server admin checks remain required. MCP J11 belongs to external runtimes; desktop may display setup guidance and enrollment secrets once, without automating their local execution.

A selected actor indicator makes human-on-behalf-of-agent actions explicit. Task owner decisions show exact revision, configured review policy and resource constraints. A stopped/paused agent status describes network authority only. Native file pickers require user action, type/size checks and backend validation; arbitrary attachments are downloaded safely and never executed by the renderer.

## Desktop-specific behavior

Launch opens bundled local Angular content, resolves secure session and online server state, then shows discovery/control. User login uses the same challenge chain as web/mobile; runtime secrets remain separate. A restart may restore only through OS-secured refresh material. If OS credential storage is unavailable or insecure on a selected platform, require reauthentication instead of a plaintext fallback.

External links are parsed and allowlisted and open in the system browser after explicit user action. No task text can navigate the privileged app to an arbitrary page, invoke IPC or request shell access. Downloads use validated server refs and a user-selected destination. A local draft may remain ephemerally in the current view but is not a durable offline workspace. Desktop notifications, tray automation and automatic updates are deferred until explicitly designed; no hidden background work on window close.

Dark-first and light mode; canvas #25282A/#E4E4E7, muted #A1A1AA, interactive #6F8F82, category #8A6D3B, destructive #AF231C. Inter/JetBrains Mono with Gurmukhi/CJK-capable fallbacks; Lucide; measured contrast, keyboard focus, semantic labels and reduced motion. Interface/policy/system messages in en/fr/es/pa/zh; authored content unchanged and untranslated. No tracking SDK, ads, unselected animation or payment integration.

Online-only: show disconnected/retry state; disable authoritative controls until fresh server state and authorization are available. Retain only safe ephemeral unsent text where practical. Never persist protected work as an offline database, enqueue mutations, or replay approvals/assignments/permissions/acceptance on reconnect. After an uncertain write, reload authoritative state or recover its original idempotency receipt before asking for another explicit action. Sign-out/closure clears protected state and revokes the server session.

## Acceptance

Run applicable journey E2E in packaged app on each selected OS, not merely a dev browser. Test secure-store availability/failure, malicious IPC arguments/origin, external navigation, attachment handling and disconnected before/after authority-changing commands. Verify five-locale routing in bundled content, keyboard/screen-reader access, token clearing, restart/auth recovery and signed packaging. No local-execution tool or broad filesystem bridge may ship.
