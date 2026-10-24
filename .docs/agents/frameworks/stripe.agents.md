# Stripe — Agent Best Practices

## Core Stack Facts

- Stripe API (2025-era versions, pin `apiVersion` in the SDK), `stripe-node` SDK; Billing features: Prices, Subscriptions, Checkout Sessions, Billing Portal, Webhooks. Test mode = separate keys + test card suite.
- Peer: Paddle/Lemon Squeezy (merchant-of-record, EU VAT handled) vs Stripe (raw control, you own tax/compliance). Packages that offer payments default to Stripe unless the blueprint selects otherwise.

## File & Project Conventions

- `src/billing/` (or `src/payments/`): prices/subscriptions/webhook modules; `stripe` SDK instance created once with `apiVersion` pinned; secret from env validated at boot.
- Price IDs are environment-specific config (test vs live have different IDs) — never hardcode IDs that exist in only one mode.
- Webhook endpoint: one route `/api/v1/webhooks/stripe` with raw-body capture (body-parser `verify` or `rawBody` flag — signatures verify the RAW body, not the parsed JSON).
- Plans/tiers in DB keyed by Stripe Price ID; usage counters (recipe generations) atomic (DB transaction or idempotent increments).

## Framework-Native Idioms

- Webhook signature verification — non-negotiable: `stripe.webhooks.constructEvent(rawBody, sigHeader, webhookSecret)`; reject on failure with 400 BEFORE any business logic. Never disable verification "for dev" in prod.
- Idempotent event handling: store `stripeEvent.id` + `type` in a `processed_events` table (unique), skip duplicates; process events async (queue) so a failed handler doesn't lose the event; return 200 only after successful handling, 4xx/5xx to trigger retries.
- Handle the lifecycle events, not just checkout: `checkout.session.completed` (activate), `customer.subscription.updated` (plan/status changes incl. past_due), `customer.subscription.deleted` (downgrade to free tier + revoke entitlements), `invoice.payment_failed` (dunning/grace), `invoice.paid` (renewal).
- Checkout vs Portal: Checkout Session for acquisition (mode=subscription, price, `client_reference_id`/metadata = user id); Billing Portal for self-serve plan change/cancel — portal config set in dashboard, never rebuild billing UI.
- Test mode: `sk_test_`/`pk_test_` keys + test cards (4242 success, 4000000000000002 declined); webhook testing via `stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe` + `stripe trigger checkout.session.completed`.
- Refunds/cancellations honor policy: refund via `refunds.create`; subscription cancel with `proration_behavior` explicit.

## Commands & Tooling

- `stripe login`, `stripe listen`, `stripe trigger <event>`, `stripe samples`; dashboard dev-mode webhook forwarding.
- Tests: mock HTTP server for Stripe API (nock) + real webhook signature fixtures; unit-test the event handler matrix (one test per event type + duplicate event).
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`-style envs — test/live split enforced by env, never by code branch.

## Common Pitfalls

- Hallucination traps: wrong SDK method names (`paymentIntents.create` vs `checkout.sessions.create`), inventing `customer.subscription.updated` payload fields, fake key prefixes.
- Skipping signature verification or verifying the parsed/rewritten body (Express JSON middleware already consumed it → signature fails → wrong fix is "disable verify" instead of raw-body capture).
- Non-idempotent handlers → double activation, double usage credit on Stripe retries; forgetting `processed_events` uniqueness across restarts.
- Live keys in tests/commits; `sk_live_` in a public repo is an instant compromise — rotate immediately if leaked.
- Using test-mode hooks (e.g. `payment_intent.success_webhook_delivered`-style) or test clocks in prod paths; `metadata` trusted for auth decisions (metadata is not verified — always reconcile with the customer id from the event).
- Entitlements cached client-side or expired only on webhook — enforce server-side on every privileged action (usage limits enforced per the plan's rules).
- 3D Secure/`requires_action` ignored in payment flows: handle `requires_action` states via Checkout (Stripe handles it) rather than raw PaymentIntents.

## Rulebase Coupling

- accounts + Stripe — billing identity = auth identity; portal/checkout handoff is the v1 billing UX.
- Compliance pack: Stripe is a processor — data flows (PII in billing) documented in privacy artifacts; deletion flow must reconcile Stripe-held data.

## References

- https://docs.stripe.com/webhooks
- https://docs.stripe.com/keys
- https://docs.stripe.com/api
