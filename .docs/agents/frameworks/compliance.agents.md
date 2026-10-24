# Compliance (GDPR / PIPEDA / HIPAA) — Agent Best Practices

## Core Stack Facts

- GDPR (EU): lawful basis, data subject rights, breach notification ≤72h, DPA/records; PIPEDA (Canada): consent, purpose limitation, accountability, breach reporting to OPC; HIPAA (US): PHI, BAAs, security/administrative safeguards, audit controls.
- Default package posture: GDPR + PIPEDA, unless the blueprint adds HIPAA. Generated packages carry GDPR/PIPEDA posture; HIPAA-specific machinery (BAAs, PHI logging) must NOT be claimed unless the blueprint selects HIPAA.
- Compliance is cross-cutting: auth, storage, observability, email, and deploy packs all touch it.

## File & Project Conventions

- `docs/privacy/` in the package: privacy policy source, data-flow map (what PII flows where — auth, billing via Stripe, email via Brevo, storage), retention table.
- Privacy-relevant code grouped: `src/privacy/` (export, deletion, consent) — not scattered per feature.
- Consent records persisted (who, what, when, version of policy); children's consent flag where age-gated (blueprint: 18+).
- DPA/records mapping: know your processors (Stripe, Brevo, Appwrite/self-host, hosting provider) — list them in the privacy artifacts.

## Framework-Native Idioms

- Right to erasure: account deletion endpoint that cascades personal data (profile, PII fields, uploaded media metadata) within SLA (default: account deletion + data export included).
- Data export: download-your-data endpoint producing a deterministic archive (JSON + media) — blueprint: "user can download their packages".
- Data minimization: don't log PII in structured logs (observability pack: strip emails/tokens from log fields); sanitize error messages before they reach Sentry.
- Consent UX: locale-aware, versioned policy acceptance stored server-side.
- Encryption at rest (blueprint: pgcrypto/disk encryption); TLS everywhere in transit; secrets never in repos.
- Breach path: structured event logged (who/what/when) to satisfy notification windows for GDPR/PIPEDA.

## Commands & Tooling

- Automated check: CI job scanning for PII field names in log statements (`email`, `phone`, `token`) — fails review.
- Data-flow doc regenerated when entities change.
- Test: erasure flow integration test (delete → export shows nothing → re-auth blocked); export test (archive contains owned data only).

## Common Pitfalls

- Hallucination traps: inventing GDPR "cookie banner required for API SaaS" claims, HIPAA checkbox claims when the blueprint didn't select it, made-up retention deadlines (28-day hardcodes without ruling).
- Logging PII (emails in request logs) then claiming minimization.
- Deleting the account but leaving Stripe customer data/emails firing (marketing) — processor data handling must be part of the deletion flow.
- Consent as a single boolean without version/timestamp/audit trail.
- Export leaking other users' data (missing ownership filter — the classic).
- Geographic claims: don't state "data stays in EU" without a hosting ruling.

## Rulebase Coupling

- privacy policies and consent screens must exist in the same locale set as the product surfaces.
- Stripe processing agreement; account deletion must handle the billing-adjacent personal data (processor + controller split).
- hosting location is a deployment decision — compliance statements follow the selected target, not the other way.
- privacy/erasure/export features are checkable plan phases with tests.

## References

- https://gdpr-info.eu/
- https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/
- https://www.hhs.gov/hipaa/index.html
