# Email (Brevo) — Agent Best Practices

## Core Stack Facts

- Brevo (fka Sendinblue): transactional email API v3 (`POST /smtp/email`), templates with params, webhooks (delivered/bounce/complaint events), contact lists, Sender identity validation.
- SDK: `@getbrevo/brevo` (official Node) or plain REST; API key via `x-api-key` header (or `api-key`). Sandbox mode for dev/test sends.
- Relation: email is a downstream notification channel — never the source of truth for accounts or billing state (Stripe emails come from Stripe; order confirmations echo DB state).

## File & Project Conventions

- `src/email/` (or `src/notifications/`): one mailer service wrapping Brevo; feature modules call it, never the SDK directly.
- Templates: IDs via env (template IDs differ per environment account); params contract documented per template (`sendWelcome(user, { name, locale })`).
- Queue sends: enqueue (BullMQ/Redis) and retry with backoff — SMTP/API failures must not block request handlers.
- Env: `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, per-env template ID map — validated at boot; sandbox flag for non-prod.
- Bounce/complaint lists: webhook → suppression list (DB); never keep sending to a hard-bounced address.

## Framework-Native Idioms

- Transactional vs marketing split: transactional (password reset, receipts, generation-complete) goes through the API with the user's consent basis; marketing requires explicit opt-in consent records (PIPEDA/GDPR consent, compliance pack).
- Use template params, not dynamic subject/body concatenation — keeps escaping and localization in the template layer.
- Locale-aware sends: pick template by `user.locale`; fall back to primary locale; never send mixed-language emails (EN template to FR user = parity bug).
- Idempotency for user-facing confirms: dedupe by event id (same `processed_events` pattern as Stripe) — double welcome email is a symptom, not cosmetic.
- Sender validation: verify SPF/DKIM in the Brevo dashboard for your domain; check `Message-ID` headers in sandbox to confirm send path.
- Webhooks: verify signature (Brevo signs webhooks; check `signature` header per docs) and process asynchronously; update suppression list idempotently.

## Commands & Tooling

- Test with sandbox mode: sends don't leave Brevo; assert call payloads via mocked SDK in unit tests.
- `curl -X POST https://api.brevo.com/v3/smtp/email -H "api-key: $BREVO_API_KEY" -H "Content-Type: application/json" -d '{...}'` for smoke checks.
- `brevo` dashboard: template previews, analytics, sender domain validation status.

## Common Pitfalls

- Hallucination traps: wrong endpoint paths (`/v3/smtp/email` vs `/v3/smtp/templates`), invented auth header names, `sendinblue` SDK legacy names in new code.
- API key committed or scoped too broadly (give the key only `smtp` permission); sandbox key used in prod.
- Sending to unsubscribed/bounced addresses (deliverability collapse); not respecting suppression lists.
- Blocking the request path on SMTP latency — always queue; retry storms without backoff on outage.
- HTML injection via unescaped user content in template params; PII in email logs.
- Forgetting Reply-To and unsubscribe headers on marketing sends (compliance).

## Rulebase Coupling

- email templates are a product surface — same locale set as web/mobile, dictionary-synced.
- Compliance pack: consent records, suppression lists, and processor documentation (Brevo = processor) ride the same privacy artifacts.
- email flows (welcome, reset, receipts) are checkable phases with test coverage; template changes land with the code that uses them.
- auth emails (verification/reset) tie to the accounts model; billing emails remain Stripe's job unless overridden.

## References

- https://developers.brevo.com/reference
- https://developers.brevo.com/docs/getting-started
- https://www.brevo.com/email-api/
