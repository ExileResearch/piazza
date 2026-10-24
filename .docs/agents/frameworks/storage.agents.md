# Storage (Appwrite buckets + uploads) — Agent Best Practices

## Core Stack Facts

- Appwrite Storage 1.x: buckets, files, permissions (read/write roles per bucket/file), file metadata, signed URLs; REST + SDKs (`appwrite` JS SDK, server SDKs).
- Peers: VersityGW / S3 / R2 / MinIO (S3-compatible object APIs, presigned URLs), Supabase Storage (Postgres-backed). Appwrite = self-hostable, bucket-permission model; VersityGW = self-hosted S3-compatible gateway.

## File & Project Conventions

- `src/storage/` (or `src/files/`): storage service abstraction over the SDK (`upload/read/delete/signUrl`) — feature modules never call the Appwrite SDK directly.
- Bucket naming: `kebab-case`, one purpose per bucket (`user-uploads`, `generated-media`, `exports`); bucket IDs + API endpoint + project ID in env (`APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`), validated at boot.
- Metadata: store the file ID + kind + owner id in YOUR database (relation to the entity); the bucket is storage, the DB is the index.
- Uploads live behind auth: file-level permissions (`read: users:<id>`, `write: users:<id>`) — never public-by-default buckets for user content.

## Framework-Native Idioms

- Upload pattern (client): pick/validate → immediate upload to a dedicated upload endpoint (server mediates, not raw client→bucket unless bucket rules allow) → server stores returned `fileId` + metadata → entity references it.
- Validation server-side: MIME allowlist, size cap (bucket max size + app-level check), filename sanitization (never trust the client filename for storage keys); re-validate on read.
- Signed URLs: short-TTL (e.g. 15 min) for private reads; long-lived public URLs only for intentionally public assets (package previews).
- Idempotent overwrite: same content hash → same file (dedupe); delete on entity removal (cascade cleanup job, not orphaned blobs).
- Rate/abuse: per-user upload quota; malware-scan note in the flow when PHI/user content is the documented use case.
- Local-disk variant: cache key = request-hash; stores generated artifacts; the same service abstraction so swapping to Appwrite/VersityGW/S3 later is a config change, not a rewrite.

## Commands & Tooling

- Appwrite console: bucket settings (max size, MIME rules, permissions), API keys scoped per bucket; `appwrite` CLI for self-host management.
- Tests: fake storage service in unit tests; integration tests against the real bucket in a test project, asserting upload→read→delete round trip and permission denials.
- `curl` smoke: upload via SDK/JWT then `GET` with signed URL; assert 401 without permission.

## Common Pitfalls

- Hallucination traps: wrong SDK method names (`createFile` vs `updateFile`), invented permission strings, fabricating Appwrite console paths.
- Public buckets for user uploads (anyone can list/read) — the classic; also over-permissive bucket roles.
- Trusting client-supplied metadata/IDs — always resolve ownership server-side before serving a file.
- Orphaned blobs after entity deletion (no cascade) — storage grows unbounded.
- Ignoring size/MIME limits at the app layer (bucket limit passed, then 500s or giant uploads).
- Mixing test/prod endpoints or project IDs; API keys with full project scope in client bundles (server-side keys only).
- Signed URLs with no expiry or very long TTL for private content.

## Rulebase Coupling

- object storage = Appwrite buckets for product images, etc.
- the storage service ships in the server package before clients wire uploads (contracts-first build order).
- upload→validate→store→cascade-delete pipeline is a phased, test-covered plan slice.

## References

- https://appwrite.io/docs/products/storage
- https://appwrite.io/docs/quick-starts
- https://appwrite.io/docs/server/storage
