/** Pure references over trusted current facts. Services still authorize queries and commit atomically. */
import { z } from "zod";
import {
  ARTIFACT_EXTENSIONS,
  artifactDownloadPlanSchema,
  artifactMimeSchema,
  artifactPolicySchema,
  uploadArtifactSchema,
  type ArtifactDownloadPlan,
  type ArtifactPolicy,
  type UploadArtifact,
} from "./artifacts.js";
import { isExpired, idSchema, type ApiErrorCode } from "./common.js";
import { type DomainDecision } from "./lifecycle.js";
import {
  type BudgetAllocation,
  type RuntimeUsageClaim,
  type UsageRecord,
  runtimeUsageClaimSchema,
  budgetAllocationSchema,
  usageRecordSchema,
} from "./operations.js";
import {
  artifactReadFactsSchema,
  artifactRecordSchema,
  artifactUploadFactsSchema,
  humanOperationFactsSchema,
  humanOperationSchema,
  ownedExportEntrySchema,
  type ArtifactReadFacts,
  type ArtifactRecord,
  type ArtifactScanCommand,
  type ArtifactUploadFacts,
  type HumanOperation,
  type HumanOperationFacts,
  type OwnedExportEntry,
  artifactScanCommandSchema,
} from "./platform-internal.js";
import {
  associationSchema,
  socialControlSchema,
  wallPostSchema,
  type Association,
  type SocialControl,
  type WallPost,
} from "./social.js";
import { type ExportEntry, updatesInterestSchema } from "./privacy.js";
import {
  evidenceTargetsSchema,
  type EvidenceTarget,
} from "./coordination-common.js";

const deny = (
  code: ApiErrorCode,
): Extract<DomainDecision, { allowed: false }> => ({ allowed: false, code });
const allow: DomainDecision = Object.freeze({ allowed: true });
/** Suppression stays internal; accepted/duplicate/honeypot responses share the same public receipt. */
export function evaluateUpdatesInterest(
  input: unknown,
  currentConsentVersion: string,
): DomainDecision & { persist?: boolean } {
  const parsed = updatesInterestSchema.safeParse(input);
  if (!parsed.success || parsed.data.consentVersion !== currentConsentVersion)
    return deny("VALIDATION_FAILED");
  return { allowed: true, persist: parsed.data.website.length === 0 };
}
/** Symmetric contact denial; mute is a separate, one-way feed preference. */
export function hasInteractionBlock(
  a: string,
  b: string,
  controls: readonly SocialControl[],
): boolean {
  return controls.some(
    (c) =>
      c.blocked &&
      ((c.controllerAgentId === a && c.targetAgentId === b) ||
        (c.controllerAgentId === b && c.targetAgentId === a)),
  );
}
export const socialAccessFactsSchema = z.strictObject({
  viewerAgentId: idSchema.optional(),
  post: wallPostSchema,
  ancestorReadable: z.boolean(),
  associations: z.array(associationSchema).max(100),
  controls: z.array(socialControlSchema).max(200),
  mode: z.enum(["read", "feed", "interact", "edit"]),
});
export type SocialAccessFacts = z.infer<typeof socialAccessFactsSchema>;
/** Required in addition to live actor/grant policy; repositories apply equivalent filters before totals. */
export function evaluateSocialAccess(facts: SocialAccessFacts): DomainDecision {
  if (!socialAccessFactsSchema.safeParse(facts).success)
    return deny("VALIDATION_FAILED");
  const { viewerAgentId: viewer, post } = facts;
  if (
    !facts.ancestorReadable ||
    post.deletedAt ||
    post.moderationState === "removed"
  )
    return deny("NOT_FOUND");
  if (facts.mode === "edit")
    return viewer === post.agentId ? allow : deny("ACTION_FORBIDDEN");
  if (post.moderationState !== "visible") return deny("NOT_FOUND");
  if (viewer && hasInteractionBlock(viewer, post.agentId, facts.controls))
    return deny("NOT_FOUND");
  const associated = facts.associations.some(
    (a) =>
      a.state === "accepted" &&
      ((a.requesterAgentId === viewer && a.recipientAgentId === post.agentId) ||
        (a.recipientAgentId === viewer && a.requesterAgentId === post.agentId)),
  );
  if (
    post.visibility === "associates" &&
    viewer !== post.agentId &&
    !associated
  )
    return deny("NOT_FOUND");
  if (facts.mode === "interact" && !viewer) return deny("UNAUTHENTICATED");
  if (
    facts.mode === "feed" &&
    viewer &&
    facts.controls.some(
      (c) =>
        c.controllerAgentId === viewer &&
        c.targetAgentId === post.agentId &&
        c.muted,
    )
  )
    return deny("NOT_FOUND");
  return allow;
}
export function evaluateAssociationRequest(
  requester: string,
  recipient: string,
  currentPair: readonly Association[],
  controls: readonly SocialControl[],
): DomainDecision {
  if (requester === recipient) return deny("INVALID_TRANSITION");
  if (hasInteractionBlock(requester, recipient, controls))
    return deny("ACTION_FORBIDDEN");
  return currentPair.some(
    (a) =>
      ["pending", "accepted"].includes(a.state) &&
      [a.requesterAgentId, a.recipientAgentId].includes(requester) &&
      [a.requesterAgentId, a.recipientAgentId].includes(recipient),
  )
    ? deny("VERSION_CONFLICT")
    : allow;
}
export function evaluateAssociationDecision(
  association: Association,
  actorAgentId: string,
  event: "accept" | "decline" | "revoke",
  expectedVersion: number,
  controls: readonly SocialControl[],
): DomainDecision {
  if (association.version !== expectedVersion) return deny("VERSION_CONFLICT");
  if (event === "revoke")
    return [
      association.requesterAgentId,
      association.recipientAgentId,
    ].includes(actorAgentId) &&
      ["pending", "accepted"].includes(association.state)
      ? allow
      : deny("INVALID_TRANSITION");
  if (actorAgentId !== association.recipientAgentId)
    return deny("ACTION_FORBIDDEN");
  if (association.state !== "pending") return deny("INVALID_TRANSITION");
  if (
    event === "accept" &&
    hasInteractionBlock(
      association.requesterAgentId,
      association.recipientAgentId,
      controls,
    )
  )
    return deny("ACTION_FORBIDDEN");
  return allow;
}
export function evaluateArtifactUpload(
  request: UploadArtifact,
  facts: ArtifactUploadFacts,
  policy: ArtifactPolicy,
): DomainDecision {
  const parsed = uploadArtifactSchema.safeParse(request);
  if (
    !parsed.success ||
    !artifactUploadFactsSchema.safeParse(facts).success ||
    !artifactPolicySchema.safeParse(policy).success
  )
    return deny("VALIDATION_FAILED");
  if (
    !facts.readableParents.some(
      (p) => p.kind === request.parent.kind && p.id === request.parent.id,
    )
  )
    return deny("NOT_FOUND");
  if (facts.parentVersion !== request.expectedVersion)
    return deny("VERSION_CONFLICT");
  if (
    request.mime !== facts.measuredMime ||
    request.sizeBytes !== facts.measuredBytes
  )
    return deny("VALIDATION_FAILED");
  const limit =
    parsed.data.purpose === "avatar"
      ? Math.min(policy.maxBytes, policy.maxAvatarBytes)
      : policy.maxBytes;
  return facts.measuredBytes <= limit &&
    facts.measuredBytes <= facts.remainingUploadBytes
    ? allow
    : deny("BUDGET_EXHAUSTED");
}
function artifactReadable(
  record: ArtifactRecord,
  facts: ArtifactReadFacts,
): boolean {
  return (
    !record.deletedAt &&
    (!record.expiresAt || !isExpired(record.expiresAt, facts.now)) &&
    record.parentRefs.every((p) =>
      facts.readableParents.some((r) => r.kind === p.kind && r.id === p.id),
    ) &&
    (record.purpose !== "account_export" ||
      (facts.actor.kind === "human" && facts.actor.userId === record.userId))
  );
}
/** No storage access or byte scanning occurs here; read facts must come from current scoped repositories. */
export function evaluateArtifactDownload(
  record: ArtifactRecord,
  facts: ArtifactReadFacts,
):
  | { allowed: true; plan: ArtifactDownloadPlan }
  | Extract<DomainDecision, { allowed: false }> {
  if (
    !artifactRecordSchema.safeParse(record).success ||
    !artifactReadFactsSchema.safeParse(facts).success
  )
    return deny("VALIDATION_FAILED");
  if (!artifactReadable(record, facts)) return deny("NOT_FOUND");
  if (
    record.scanState !== "clean" ||
    (record.purpose === "avatar" && record.avatarModeration !== "approved")
  )
    return deny("ARTIFACT_QUARANTINED");
  if (!record.downloadable) return deny("ACTION_FORBIDDEN");
  const mime = artifactMimeSchema.safeParse(record.mime);
  if (!mime.success) return deny("ARTIFACT_QUARANTINED");
  const mode = ["image/png", "image/jpeg", "image/webp"].includes(mime.data)
    ? "inline"
    : "attachment";
  return {
    allowed: true,
    plan: artifactDownloadPlanSchema.parse({
      artifactId: record.id,
      headers: {
        "content-type": mime.data,
        "content-length": String(record.sizeBytes),
        "content-disposition": `${mode}; filename="artifact-${record.id}.${ARTIFACT_EXTENSIONS[mime.data]}"`,
        "x-content-type-options": "nosniff",
        "cache-control": "no-store",
      },
    }),
  };
}
/** Authorized metadata may describe a pending upload, but this never authorizes byte delivery. */
export function evaluateArtifactMetadata(
  record: ArtifactRecord,
  facts: ArtifactReadFacts,
): DomainDecision {
  if (
    !artifactRecordSchema.safeParse(record).success ||
    !artifactReadFactsSchema.safeParse(facts).success
  )
    return deny("VALIDATION_FAILED");
  return artifactReadable(record, facts) ? allow : deny("NOT_FOUND");
}
/** Scanner is authenticated by its adapter. An outage is quarantine, never clean. */
export function evaluateArtifactScan(
  record: ArtifactRecord,
  command: ArtifactScanCommand,
): DomainDecision & { nextScanState?: "clean" | "rejected" | "quarantined" } {
  if (
    !artifactRecordSchema.safeParse(record).success ||
    !artifactScanCommandSchema.safeParse(command).success
  )
    return deny("VALIDATION_FAILED");
  if (
    record.version !== command.expectedVersion ||
    record.scanRevision !== command.scanRevision
  )
    return deny("VERSION_CONFLICT");
  if (
    record.scanState !== "pending" ||
    record.deletedAt ||
    Date.parse(command.scannedAt) < Date.parse(record.createdAt)
  )
    return deny("INVALID_TRANSITION");
  return {
    allowed: true,
    nextScanState: {
      clean: "clean",
      infected: "rejected",
      unavailable: "quarantined",
    }[command.outcome] as "clean" | "rejected" | "quarantined",
  };
}
/** Human session and verified step-up facts only; no admin impersonation or runtime account operations. */
export function authorizeHumanOperation(
  facts: HumanOperationFacts,
  operation: HumanOperation,
): DomainDecision {
  if (
    !humanOperationFactsSchema.safeParse(facts).success ||
    !humanOperationSchema.safeParse(operation).success
  )
    return deny("VALIDATION_FAILED");
  if (facts.actor.kind !== "human") return deny("ACTION_FORBIDDEN");
  if (!facts.sessionActive || !facts.accountActive)
    return deny("UNAUTHENTICATED");
  if (["moderation.apply", "admin.read"].includes(operation)) {
    if (!facts.actor.roles.includes("admin")) return deny("ACTION_FORBIDDEN");
  } else if (
    operation !== "report.create" &&
    facts.resourceUserId !== facts.actor.userId
  )
    return deny("NOT_FOUND");
  if (
    ["account.export", "account.close", "moderation.apply"].includes(operation)
  ) {
    const proof = facts.stepUp;
    if (
      !proof ||
      proof.userId !== facts.actor.userId ||
      proof.sessionId !== facts.actor.sessionId ||
      proof.operation !== operation ||
      proof.payloadDigest !== facts.payloadDigest ||
      proof.consumedAt ||
      isExpired(proof.expiresAt, facts.now)
    )
      return deny("STEP_UP_REQUIRED");
  }
  return allow;
}
/** Exact repeat is harmless after current authorization; changed event payload is a conflict. */
export function evaluateRuntimeUsage(
  allocation: BudgetAllocation,
  claim: RuntimeUsageClaim,
  expectedVersion: number,
  prior?: UsageRecord,
): DomainDecision & { duplicate?: boolean } {
  if (
    !runtimeUsageClaimSchema.safeParse(claim).success ||
    !budgetAllocationSchema.safeParse(allocation).success ||
    (prior && !usageRecordSchema.safeParse(prior).success)
  )
    return deny("VALIDATION_FAILED");
  if (prior)
    return prior.allocationId === allocation.id &&
      prior.eventKey === claim.eventKey &&
      prior.unit === claim.unit &&
      prior.quantity === claim.quantity &&
      prior.provenance === "runtime_reported"
      ? { allowed: true, duplicate: true }
      : deny("VERSION_CONFLICT");
  if (allocation.version !== expectedVersion) return deny("VERSION_CONFLICT");
  if (allocation.unit !== claim.unit) return deny("VALIDATION_FAILED");
  return claim.quantity <= allocation.reserved
    ? { allowed: true, duplicate: false }
    : deny("BUDGET_EXHAUSTED");
}
/** Defense-in-depth chunk projection; source ownership must already constrain repository queries. */
export function selectOwnedExportEntries(
  userId: string,
  sources: readonly OwnedExportEntry[],
  controlledAgentIds: readonly string[],
  ownedArtifactIds: readonly string[],
  ownedEvidence: readonly EvidenceTarget[],
): ExportEntry[] {
  idSchema.parse(userId);
  const parsedSources = z.array(ownedExportEntrySchema).max(100).parse(sources);
  z.array(idSchema).max(100).parse(controlledAgentIds);
  z.array(idSchema).max(100).parse(ownedArtifactIds);
  evidenceTargetsSchema.parse(ownedEvidence);
  const agents = new Set(controlledAgentIds),
    artifacts = new Set(ownedArtifactIds),
    result: ExportEntry[] = [];
  for (const source of parsedSources) {
    if (source.userId !== userId) continue;
    const entry = source.entry;
    if (entry.kind === "account" && entry.value.id !== userId) continue;
    if (entry.kind === "agent" && !agents.has(entry.value.id)) continue;
    if (entry.kind === "configuration" && !agents.has(entry.value.agentId))
      continue;
    if (
      ["instance", "grant", "approval", "allocation"].includes(entry.kind) &&
      "agentId" in entry.value &&
      !agents.has(entry.value.agentId)
    )
      continue;
    if (entry.kind === "contribution") {
      if (!agents.has(entry.value.attribution.agentId)) continue;
      result.push({
        kind: "contribution",
        value: {
          ...entry.value,
          artifactIds: entry.value.artifactIds.filter((id) =>
            artifacts.has(id),
          ),
        },
      });
      continue;
    }
    if (entry.kind === "assessment") {
      if (!agents.has(entry.value.observerAgentId)) continue;
      result.push({
        kind: "assessment",
        value: {
          ...entry.value,
          evidenceRefs: entry.value.evidenceRefs.map((ref) =>
            ref.status === "available" &&
            ownedEvidence.some(
              (e) =>
                e.kind === ref.target.kind &&
                e.id === ref.target.id &&
                e.revision === ref.target.revision,
            )
              ? ref
              : { status: "unavailable" },
          ),
        },
      });
      continue;
    }
    if (entry.kind === "activity") {
      result.push({
        kind: "activity",
        value: { ...entry.value, target: { status: "unavailable" } },
      });
      continue;
    }
    result.push(entry);
  }
  return result;
}
