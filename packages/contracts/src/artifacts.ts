import { z } from "zod";
import { expectedVersionSchema, idSchema } from "./common.js";
import { artifactMetadataSchema } from "./discussion.js";
import { idempotencyKeySchema } from "./transport.js";

/** A finite pilot allowlist, revisable through contracts; SVG/HTML/executables are excluded. */
export const artifactMimeSchema = z.enum([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "audio/mpeg",
  "video/mp4",
]);
export const artifactParentSchema = z.strictObject({
  kind: z.enum(["agent", "project", "task", "inquiry", "wall_post"]),
  id: idSchema,
});
/** All parents intersect; listing one public parent never makes other private parents public. */
export const artifactParentsSchema = z
  .array(artifactParentSchema)
  .min(1)
  .max(10)
  .refine(
    (items) =>
      new Set(items.map((p) => `${p.kind}:${p.id}`)).size === items.length,
    { message: "Duplicate artifact parent" },
  );
export const artifactPurposeSchema = z.enum(["attachment", "avatar"]);
/** Multipart metadata part only; bytes are a separate bounded stream, never JSON/base64. */
export const uploadArtifactSchema = expectedVersionSchema
  .extend({
    parent: artifactParentSchema,
    mime: artifactMimeSchema,
    sizeBytes: z.int().min(1).max(25_000_000),
    downloadable: z.boolean().default(true),
    purpose: artifactPurposeSchema.default("attachment"),
  })
  .refine(
    (v) =>
      v.purpose !== "avatar" ||
      (v.parent.kind === "agent" &&
        ["image/png", "image/jpeg", "image/webp"].includes(v.mime)),
    { message: "Avatars require an agent parent and a supported raster image" },
  );
/** Lowercase normalized headers; adapters reject ambiguous duplicate headers before parsing. */
export const artifactUploadHeadersSchema = z.strictObject({
  "content-type": z
    .string()
    .regex(
      /^multipart\/form-data; boundary=(?:[A-Za-z0-9_-]{1,70}|"[A-Za-z0-9_-]{1,70}")$/,
    ),
  "idempotency-key": idempotencyKeySchema,
});
/** Accepted bytes remain pending; no bucket URL, storage key, filename echo or hash-existence signal. */
export const artifactUploadSchema = z
  .strictObject({ artifact: artifactMetadataSchema })
  .refine((v) => v.artifact.scanState === "pending", {
    message: "New uploads await scanning",
  });
export const artifactPolicySchema = z.strictObject({
  maxBytes: z.int().min(1).max(25_000_000).default(10_000_000),
  maxAvatarBytes: z.int().min(1).max(5_000_000).default(2_000_000),
});
export const ARTIFACT_EXTENSIONS = Object.freeze({
  "text/plain": "txt",
  "text/markdown": "md",
  "text/csv": "csv",
  "application/json": "json",
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "audio/mpeg": "mp3",
  "video/mp4": "mp4",
} as const);
const dispositionSchema = z
  .string()
  .regex(
    /^(?:inline|attachment); filename="artifact-[a-f0-9-]{36}\.(?:txt|md|csv|json|pdf|png|jpg|webp|mp3|mp4)"$/,
  )
  .refine(
    (v) => idSchema.safeParse(v.split("artifact-")[1]?.slice(0, 36)).success,
    { message: "Disposition requires a canonical artifact ID" },
  );
export const artifactDownloadHeadersSchema = z
  .strictObject({
    "content-type": artifactMimeSchema,
    "content-length": z
      .string()
      .regex(/^(?:0|[1-9][0-9]{0,15})$/)
      .refine((v) => Number.isSafeInteger(Number(v))),
    "content-disposition": dispositionSchema,
    "x-content-type-options": z.literal("nosniff"),
    "cache-control": z.literal("no-store"),
  })
  .refine(
    (v) =>
      !v["content-disposition"].startsWith("inline") ||
      ["image/png", "image/jpeg", "image/webp"].includes(v["content-type"]),
    { message: "Only clean approved raster images may be offered inline" },
  )
  .refine(
    (v) =>
      v["content-disposition"].endsWith(
        `.${ARTIFACT_EXTENSIONS[v["content-type"]]}"`,
      ),
    { message: "Filename extension must match delivery type" },
  );
export const artifactDownloadPlanSchema = z
  .strictObject({
    artifactId: idSchema,
    headers: artifactDownloadHeadersSchema,
  })
  .refine(
    (v) =>
      v.headers["content-disposition"].includes(`artifact-${v.artifactId}.`),
    { message: "Delivery filename must match artifact ID" },
  );
export const scanOutcomeSchema = z.enum(["clean", "infected", "unavailable"]);

export type ArtifactMime = z.infer<typeof artifactMimeSchema>;
export type ArtifactParent = z.infer<typeof artifactParentSchema>;
export type ArtifactPurpose = z.infer<typeof artifactPurposeSchema>;
export type UploadArtifact = z.input<typeof uploadArtifactSchema>;
export type ArtifactUploadHeaders = z.infer<typeof artifactUploadHeadersSchema>;
export type ArtifactUpload = z.infer<typeof artifactUploadSchema>;
export type ArtifactPolicy = z.infer<typeof artifactPolicySchema>;
export type ArtifactDownloadHeaders = z.infer<
  typeof artifactDownloadHeadersSchema
>;
export type ArtifactDownloadPlan = z.infer<typeof artifactDownloadPlanSchema>;
export type ScanOutcome = z.infer<typeof scanOutcomeSchema>;
