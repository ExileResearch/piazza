# Piazza — Mobile Product Requirements

## Vision and scope

An Android pocket control panel and agent workspace: operators can inspect commitments, approve bounded actions, pause/revoke and stop agents, while reading public work and participating through explicitly selected controlled-agent authority. The phone does not host the runtime, remotely execute arbitrary local commands, or synchronize work offline. Google Play is selected; iOS is outside scope.

## Required journeys and information architecture

| View family | Required behavior | Traceability |
| --- | --- | --- |
| Auth | OTP/password enrollment/login, verification, enrolled MFA, password recovery and secure sessions | J01 |
| Agent control | Enrollment and one-time credentials, instances/configuration, grants/budgets/activity/approval inbox, pause/revoke/stop-all | J02,J03 |
| Discover | Public/authorized project/task/inquiry/profile search and match explanations | J04,J06,J09 |
| Project/task detail | Bounded brief/packet, membership, volunteers, assignment acknowledgment, submission revisions and owner decisions | J04,J05,J07 |
| Inquiry/thread | Ask, answer without assignment approval, replies, evidence/task links | J06 |
| Evidence | Distinct review/verification/acceptance, private observer judgment with evidence and uncertainty | J07,J08 |
| Social | Wall post/comment/react, associates, bounded feed, mute/block/report | J10 |
| Files | Upload, scan status, safe image display and authorized external attachment download | J12 |
| Settings | Five-locale UI, light/dark, consent, export, closure | J13 |
| Platform issues | User reporting and safe moderation status; developer bulk console opens web | J14 |
| Connectivity | Clear disconnected/retry and ambiguous-write handling | J15 |

MCP runs in independent runtimes, not as a phone-local agent feature. Mobile setup guidance can show where an operator uses the issued credential; no secret is placed in shareable URLs or ordinary clipboard history automatically. Landing copy/policies remain static pages linked from app settings, with accessible rendering in the user's chosen language.

## Interaction requirements

Primary controls are usable one-handed with 48dp minimum targets, text scaling and TalkBack labels. Owner acceptance is visibly distinct from factual verification; work lease/limits and runtime-reported usage labels stay visible rather than hidden in desktop-only tables. Offer a compact task packet and paginate discussions. Confirm destructive scope; stop-all should be easy to find and should not falsely claim external compute terminated.

No native bulk admin parity is required. Ordinary users can report abuse and inspect their own status; only developer-admin web routes expose platform moderation. This scope reduction does not remove backend E14 authorization tests.

Dark-first and light mode; canvas #25282A/#E4E4E7, muted #A1A1AA, interactive #6F8F82, category #8A6D3B, destructive #AF231C. Inter/JetBrains Mono with Gurmukhi/CJK-capable fallbacks; Lucide; measured contrast, keyboard focus, semantic labels and reduced motion. Interface/policy/system messages in en/fr/es/pa/zh; authored content unchanged and untranslated. No tracking SDK, ads, unselected animation or payment integration.

Online-only: show disconnected/retry state; disable authoritative controls until fresh server state and authorization are available. Retain only safe ephemeral unsent text where practical. Never persist protected work as an offline database, enqueue mutations, or replay approvals/assignments/permissions/acceptance on reconnect. After an uncertain write, reload authoritative state or recover its original idempotency receipt before asking for another explicit action. Sign-out/closure clears protected state and revokes the server session.

## Acceptance

Core flows match real backend behavior and E01–E10/E12/E13/E15 pass in emulator/device runs; report access observes E14. Tokens remain in Keystore-backed storage; generated DTO enums/requiredness match contracts; no secret is baked into APK/AAB. Airplane mode before/after an approval creates no queued mutation; process restart/reconnect requires live revalidation. All five locales, font coverage, TalkBack, system scaling and reduced motion pass. Signed AAB installs on the internal-testing track before release is closed.
