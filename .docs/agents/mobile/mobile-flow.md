# Piazza — Mobile Interaction and State Flow

## Bootstrap and auth

main initializes Flutter and registers ApiService/AuthService/ThemeService/LocaleService as GetxService singletons. Load consented device preferences and secure tokens, then resolve online session through one refresh path. GetMaterialApp uses named GetPage routes with Bindings and GetMiddleware; unknown/failed auth resolves safely without a boot hang. There is no Isar opening, database hydration or PendingWrite collection.

AuthController submits choice of OTP/password. Request receipts are non-enumerating. OTP/verification completion yields session or limited MFA challenge; enrolled MFA cannot be skipped by choosing another login method. Password recovery/reset and sign-out follow server contracts. GetConnect performs single-flight refresh once; unrecoverable failure clears tokens/private UI and routes to sign-in. Deep links carry permitted challenge identifiers, not runtime secrets or arbitrary redirects.

## Data and control flow

Open feature → GetxController.load via service → loading → ready/empty/error. Views observe tightly scoped Obx state; controllers call services, never raw networking. A live task/agent screen shows last refreshed status. Every approval, assignment, acceptance, grant expansion or revocation is an explicit command with server revision/idempotency fields. One-time credential handoff is cleared on exit and never cached in image/log/ordinary storage.

Task detail sequences application/selection/offer/acknowledgment/lease/submission. Review and verification are separate tabs/sections targeting exact revisions. A later corrected submission does not overwrite past findings. Inquiry answer has no volunteer gate but still checks selected-agent posting authority. Evidence assessments save privately. Social actions refresh their canonical object and enforce blocks, not only hide buttons.

## Files and account

Picker prechecks size/type, upload service sends to API, scan state remains pending until server marks clean. Documents/binaries use authorized attachment download; do not render active content in a WebView. Private image caches are bounded and cleared on sign-out/revocation; no durable offline private gallery.

Theme/locale apply via explicit setters; device persistence is opt-in. Remote preference failure is surfaced with manual retry, not background sync. Export polls its private job while foregrounded and downloads with current authorization. Closure confirms immediate access loss/30-day cleanup, clears secure tokens and all protected state. Push is deferred; no notification token collection is needed.

## Loss of connection and uncertain outcome

Online-only: show disconnected/retry state; disable authoritative controls until fresh server state and authorization are available. Retain only safe ephemeral unsent text where practical. Never persist protected work as an offline database, enqueue mutations, or replay approvals/assignments/permissions/acceptance on reconnect. After an uncertain write, reload authoritative state or recover its original idempotency receipt before asking for another explicit action. Sign-out/closure clears protected state and revokes the server session.

Connectivity status is advisory; an HTTP failure is authoritative for request outcome. A lost response after a command shows “status unknown” and offers a status check; never treat it as safe to send a new mutation automatically. On resume/reconnect refetch session/resource/grants before enabling controls. Get.dialog/snackbar feedback is translated, semantically announced and does not rely on color. Foreground polling is bounded with jitter/backoff; no WorkManager data synchronization is added.
