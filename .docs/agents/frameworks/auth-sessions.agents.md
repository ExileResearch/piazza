# Auth & Sessions (JWT / Cookie patterns) — Agent Best Practices

## Core Stack Facts

- JWT (RFC 7519): signed claims (`iat/exp/nbf/iss/aud/sub`) — a _stateless token_, not a session store. Libraries: `jose` (modern, edge-safe) or `jsonwebtoken` 9; NestJS: `@nestjs/jwt` + `Passport`/`AuthGuard`.
- Cookie sessions: HttpOnly + Secure + SameSite cookies with a server-side session record — stateful, revocable, CSRF-sensitive.
- Default package posture: token-based (JWT, in-memory/secure storage) — mobile (SecureStore/Keychain) and SPA clients; cookie flow is the alternative when the blueprint selects it.

## File & Project Conventions

- `src/auth/`: auth module (login/register/refresh/logout), guards, strategy (JWT or session), token service. Auth logic never lives in feature modules.
- Token config centralized: signing secret(s) from env (validated at boot), algorithm pinned, issuer/audience set, expiry constants in one place.
- Refresh tokens: rotated, stored hashed (DB) if server-side; short access TTL (5–15 min).
- Session store (cookie mode): Redis with TTL = session lifetime; session id in cookie, data server-side only.

## Framework-Native Idioms

- JWT: verify signature + `exp` + `aud/iss` on every request; never decode-then-trust — `verify()`, not `decode()` alone.
- Signing: RS256 (public/private key) for multi-service or client verification; HS256 only single-service with a strong secret.
- Storage on clients: mobile SecureStore/Keychain/Keystore (never AsyncStorage for tokens); web SPA: memory + short-lived refresh (blueprint: token-based, in-memory/secure storage).
- Cookie mode: `HttpOnly; Secure; SameSite=Lax/Strict` + CSRF token (double-submit or header) for state-changing requests; `__Host-` prefix where supported.
- Logout revokes: client deletes token AND server-side blocklist/rotation for refresh tokens; biometric-assisted login optional on mobile (MobileAgent instruction: never mandatory).
- Multi-device: revoke-by-session-id; password change revokes all but current.

## Commands & Tooling

- `npx tsc --noEmit` catches strategy typing; integration tests: login → token → guarded route (200) → tampered token (401) → expired (401).
- `jose` jwt CLI or `jwt.io`-style decode for debugging only — treat any decode as untrusted input.
- Generate secrets: `openssl rand -base64 48`; RS256 keypair: `openssl genpkey`/`ssh-keygen -t ed25519` (EdDSA also fine with jose).

## Common Pitfalls

- Hallucination traps: wrong `jsonwebtoken` v9 callbacks vs v8, invented `expiresIn` units, `passReqToCallback` misuse, fabricating Passport strategy names.
- `decode()` without `verify()` in auth paths; no `exp` check; algorithm confusion (HS256 accepted for RS256-signed tokens).
- Secrets committed or in public env files; secret rotation without keeping old key valid briefly (grace window).
- Refresh token stored insecurely or rotated carelessly (reuse = replay).
- CSRF ignored in cookie mode; SameSite=None without Secure; CORS `credentials` misconfig.
- Client-computed "isLoggedIn" or client-computed roles as auth — role checks (admin vs customer) always enforced server-side, never trusted from the client.

## Rulebase Coupling

- accounts + Stripe — auth issues the identity, Stripe entitlement checks reuse the same session; entitlements always loaded with the profile server-side.
- CONTRACTS: auth DTOs (login/refresh/token payload shapes) in shared contracts; clients consume, never fork.
- auth flows (login/refresh/logout/revoke) are checkable phases with integration tests.

## References

- https://jwt.io/introduction
- https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- https://github.com/panva/jose
