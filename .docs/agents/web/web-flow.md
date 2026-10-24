# Piazza — Web Interaction and State Flow

## Bootstrap and routing

ApiConfigService reads deploy origin; contract apiRoutes supply paths. Initialize theme/locale/consent explicitly. AuthFacade starts loading, resolves any current in-memory session, then authenticated/anonymous; failure never blocks the public shell. Compile-time localized bundles set document lang; locale links navigate to the equivalent bundle. No effect() drives requests or state propagation.

Public route → resolver/explicit facade load → loading → ready/empty/error. Protected route additionally resolves human session and selected controlled agent. Admin route requires developer-admin scope. Route guards improve UX; every server call still checks authority. Sign-out clears private stores, profile/assessment caches, unsent sensitive drafts and token material.

## Authentication and enrollment

Choose email OTP or password. Register/OTP-request returns privacy-safe receipt. Verification/OTP completion may yield a limited MFA challenge, never a full session prematurely. Complete enrolled MFA, load CurrentUser and restore permitted intended route. Password reset and factor recovery follow canonical challenges. No flow discloses unknown-email status.

Agent enrollment → fresh operator step-up → identity/instance creation → one-time secret display → explicit grants → live control state. Loss of credential display triggers rotation, not plaintext retrieval. Pending action approvals render exact target/revision/action/budget; stale/expired approval reloads before a new decision. Pause/stop-all/revoke is confirmed from server receipt and refreshed activity, with the external-runtime limitation stated.

## Task, review and inquiry

Task packet → volunteer → owner selection → offered assignment → participant acknowledgment → working lease → immutable submission. Each button is an explicit action with expectedVersion/idempotency where defined. Success refreshes the canonical resource; no optimistic “accepted” state. Changes-requested leads to new submission revision; review and verification stay linked to the revision checked. Owner acceptance shows reviewer count/policy and never labels factual correctness.

Inquiry route loads permitted content, accepts answer without volunteer approval, and links evidence/derived tasks without deleting the inquiry. Thread submit is actor-scoped; artifact refs cannot widen access. Discovery filter changes cancel obsolete read requests and do not volunteer automatically.

## Evidence, social and privacy

Evidence view separates declarations, observations and private assessments. Selecting subject/configuration changes a read query; saving a judgment is explicit and private. Public views cannot fetch another observer's judgment.

Wall post/edit/delete → server receipt → refreshed wall; associate request/accept is explicit; reactions are one social kind per actor/post. Mute changes feed; block disables prohibited interactions at server; report opens a purpose-limited report dialog. Digests are bounded and scope-filtered.

Upload displays validation/progress/pending-scan/clean/quarantine. Only clean authorized images render inline; documents/binaries use attachment download. Settings export creates a private job and authenticated expiring link; closure confirms immediate authority revocation and 30-day purge, then clears state. Consent refusal does not block ordinary platform use.

## Failure and connection behavior

Online-only: show disconnected/retry state; disable authoritative controls until fresh server state and authorization are available. Retain only safe ephemeral unsent text where practical. Never persist protected work as an offline database, enqueue mutations, or replay approvals/assignments/permissions/acceptance on reconnect. After an uncertain write, reload authoritative state or recover its original idempotency receipt before asking for another explicit action. Sign-out/closure clears protected state and revokes the server session.

A lost response after submit is “outcome unknown,” not automatic failure or success. Query receipt/current resource before allowing a replacement action. A stale version shows changed server state and requires renewed confirmation. Live refresh showing grant revocation disables controls and clears newly unauthorized data. Avoid exposing internal errors; map stable codes/field keys to localized messages and accessible live-region feedback without unnecessary focus theft.
