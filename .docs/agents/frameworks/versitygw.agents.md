# VersityGW (S3-compatible object storage) — Agent Best Practices

## Core Stack Facts

- VersityGW is an open-source, single-binary **S3-compatible gateway**: it exposes the AWS S3 API in front of a backend — a POSIX filesystem, ScoutFS, Azure Blob, or another S3 — so any AWS SDK, `aws s3` CLI, or boto3 client works against it unchanged.
- It is the **in-stack** alternative to AppWrite: run it as a container in `compose.yml`; the app speaks S3 to it. Good fit for self-hosted, no-vendor object storage.
- Addressing is **path-style** (`http://host:port/bucket/key`) by default — virtual-hosted style needs wildcard DNS, so prefer path-style for self-hosted deployments.

## File & Project Conventions

- `src/storage/`: a storage service abstraction over the S3 SDK (`@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`) — feature modules never call the SDK directly.
- Config via env, validated at boot: `S3_ENDPOINT` (e.g. `http://versitygw:7070`), `S3_REGION` (any value; required by the SDK), `S3_ACCESS_KEY`, `S3_SECRET_KEY`, and a bucket/prefix per purpose. Set `forcePathStyle: true`.
- Bucket naming: `kebab-case`, one purpose per bucket. Store the object key + owning entity id in the database — the DB is the index, the gateway is storage.
- Gateway config (root credentials, backend path, port) lives in `compose.yml`/env; secrets are never committed.

## Framework-Native Idioms

- Uploads are server-mediated: the client asks the API, which returns a short-lived **presigned PUT**; large streams can go straight to the gateway with the presigned URL, small ones may pass through the API.
- Presigned URLs: short TTL (e.g. 15 min) for private reads; long-lived URLs only for intentionally public assets.
- Validate server-side: MIME allowlist, size cap, filename sanitisation; resolve ownership server-side before serving any object.
- Idempotent overwrite by content hash; delete on entity removal via a cascade job (no orphaned keys).
- Readiness: probe the gateway `/health` and a `HeadBucket` check from the API readiness route.

## Commands & Tooling

- `aws --endpoint-url http://localhost:7070 s3 ls` / `s3 cp ./file s3://<bucket>/key`; configure with the gateway's root keys.
- `docker compose exec versitygw versitygw --help` / container logs for gateway diagnostics; `curl -i http://localhost:7070/<bucket>` for a smoke check.
- Tests: fake the storage service in unit tests; integration against the real container asserting upload → presign → read → delete plus a permission denial.

## Common Pitfalls

- Hallucination traps: assuming full AWS IAM/ACL parity — VersityGW implements a **subset**, so enforce auth in the app route, never via bucket policies; inventing a rich web console (there is only a CLI/daemon).
- Path-style vs virtual-hosted addressing confusion → signature errors; always set `forcePathStyle: true`.
- Forgetting to set a region — the SDK requires one even though the gateway ignores it.
- Exposing the gateway port publicly; serving objects without presigning or an auth'd proxy route.
- Orphaned keys after entity deletion (no cascade); unbounded storage growth.
- Committing root credentials, or shipping root keys in a client bundle (proxy uploads instead).

## Rulebase Coupling

- Object storage is versioned buckets behind the storage service; the blueprint selects **AppWrite** or **VersityGW**.
- The storage service ships in the server package before clients wire uploads (contracts-first build order).
- upload → validate → store → cascade-delete is a phased, test-covered plan slice.

## References

- https://github.com/versity/versitygw
- https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/
