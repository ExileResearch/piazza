# 04 — Landing Page

**Scope:** apps/landing-page static five-locale explanation, policies and updates-interest form.

**Starting state:** documentation only; no scaffold or passing implementation checks are assumed.

**Prerequisites:** Plan00 form contract stable; real public plan01 form API available; product/locale deployment topology and public claims approved before links publish.

Read [blueprint](../blueprint.md), [models](../data_models.md), [contracts](../contracts.md), [journeys](../journeys.md), [AGENTS](../../AGENTS.md) and the applicable app docs before each slice. Contract changes precede endpoint/client changes. All checkboxes are prospective.

## Phase 1 — Static foundation and routes

- [ ] 1.1 Scaffold SvelteKit adapter-static with own manifest/lockfile and contract file dependency for enhanced form, strict check/lint/test/build scripts.
- [ ] 1.2 Prerender /en,/fr,/es,/pa,/zh and policy routes; root static English default, meaningful404, canonical/hreflang/title/description/OG and sitemap/robots.
- [ ] 1.3 Build accessible header/footer/nav/locale links/theme controls, self-host fonts/Lucide and shared dark/light tokens with consented preference persistence.
- [ ] 1.4 Confirm static hosting go-static path mapping and proposed /app product destinations without exposing auth or private app state.

**Exit gate:** Static build contains all five locale route HTML, no secret/private state and core navigation/content renders with JS disabled.

## Phase 2 — Feature explanation and honest demonstration

- [ ] 2.1 Build hero, one identifiable F01–F16 feature block, why-choose-us and illustrative task/agent flow; fictional/demo data labeled.
- [ ] 2.2 Explain human grants, bounded resources, Exile hosting, local trust and acceptance-versus-verification; make no unmeasured intelligence/safety/scale promises.
- [ ] 2.3 Build FAQ covering operator/runtime auth, canon/truth, online-only limits, privacy/export/closure and research/marketing opt-in.
- [ ] 2.4 Route discover/enroll/sign-in CTAs to actual product views with safe locale/public destination only; no private object/token/email parameters.

**Exit gate:** Content matches blueprint scope, all must-have blocks and FAQ present, no unselected commerce/age/federation/3D claims and actual CTAs resolve.

## Phase 3 — Public form and policy behavior

- [ ] 3.1 Implement plain HTML form POST and typed enhanced JSON submission to the same canonical backend endpoint; consent purpose and privacy link explicit.
- [ ] 3.2 Test honeypot/rate-limit, generic success, unavailable backend and localized safe HTML/JSON results; no client queue or secret/API provider access.
- [ ] 3.3 Publish Privacy/Data Retention/Terms/Acceptable Use in all languages with actual providers,30-day closure/24-month form identifiers, export/erasure and contribution-rights decision.
- [ ] 3.4 Prevent automatic accounts/newsletters/research enrollment; no third-party CAPTCHA without explicit provider/privacy approval.

**Exit gate:** E16 passes with JS off/on against real backend; form retention/access/erasure works; policies and contribution permissions approved for external launch.

## Phase 4 — Performance, accessibility and artifact

- [ ] 4.1 Run unit/content-key parity, serialization/schema fixtures, static-route/link/metadata integration and E16 browser flows.
- [ ] 4.2 Run AXE and keyboard/screen-reader on nav/FAQ/locale/form/error/policies, both-theme contrast, motion and non-Latin layout checks.
- [ ] 4.3 Measure Lighthouse Performance/SEO/Accessibility target 95 under recorded profile; optimize assets, no runtime trackers or unselected animation libraries.
- [ ] 4.4 Build root-context Docker/static artifact for Exile go-static; validate no server runtime or sensitive source maps/secrets; document manual file deploy/rollback.

**Exit gate:** All locale/policy/static/no-JS/form/contract gates pass; verified static output is ready for later release publication, not already published.

## Quality gates

| Level       | Required evidence                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------- |
| Unit        | Content/message key parity, field normalization and form serialization/error mapping.               |
| Integration | Prerendered route/link/metadata inventory and backend form HTML/JSON representations.               |
| E2E         | E16 with JS disabled/enabled and actual server; accessible success/failure and no private CTA data. |
| Contract    | UpdatesInterest schema/safe receipts/errors and form content-negotiation tests; no schema fork.     |

## Definition of done

Static output explains the complete selected product truthfully and works without JS, uses the real purpose-limited form and matches privacy/rights implementation.

Record actual commands, versions, fixtures, failures and evidence before checking slices. Update affected docs/assumptions if behavior changes. Commit after milestone slices; push only at major milestones under owner cadence. No production deployment, message sending or artifact publication occurs merely by closing this document.
