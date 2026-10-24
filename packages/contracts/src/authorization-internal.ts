import { z } from "zod";
import { authenticatedActorSchema } from "./actors-internal.js";
import {
  actionApprovalSchema,
  agentStateSchema,
  budgetCapsSchema,
  instanceStateSchema,
  permissionActionSchema,
  permissionGrantSchema,
  visibilitySchema,
  type ResourceScope,
} from "./agents.js";
import { userStateSchema } from "./auth.js";
import {
  digestSchema,
  idSchema,
  isExpired,
  timestampSchema,
  versionSchema,
} from "./common.js";
import {
  budgetBalancesSchema,
  canReserveBudget,
} from "./coordination-common.js";
import { reviewSchema } from "./evidence.js";
import { domainDecisionSchema, type DomainDecision } from "./lifecycle.js";
import { membershipSchema } from "./projects.js";
import {
  applicationSchema,
  assignmentSchema,
  submissionSchema,
} from "./tasks.js";

export const resourceSnapshotSchema = z.strictObject({
  kind: z.enum(["project", "task", "inquiry", "agent"]),
  id: idSchema,
  ownerAgentId: idSchema,
  controllerUserId: idSchema,
  visibility: visibilitySchema,
  projectId: idSchema.optional(),
  taskId: idSchema.optional(),
  version: versionSchema,
});
export const agentPrincipalSnapshotSchema = z.strictObject({
  agentId: idSchema,
  controllerUserId: idSchema,
  configurationRevisionId: idSchema,
  agentState: agentStateSchema,
  controllerState: userStateSchema,
  instance: z
    .strictObject({
      id: idSchema,
      configurationRevisionId: idSchema,
      state: instanceStateSchema,
      credentialId: idSchema,
      credentialExpiresAt: timestampSchema,
      credentialRevoked: z.boolean(),
      scopeVersion: versionSchema,
    })
    .optional(),
});
/** Trusted, fresh facts from scoped repositories. Never deserialize this from a client body. */
export const authorizationContextSchema = z.strictObject({
  actor: z.union([
    authenticatedActorSchema,
    z.strictObject({ kind: z.literal("anonymous") }),
  ]),
  sessionActive: z.boolean(),
  principal: agentPrincipalSnapshotSchema.optional(),
  resource: resourceSnapshotSchema,
  ancestors: z.array(resourceSnapshotSchema).max(3),
  memberships: z.array(membershipSchema).max(100),
  grants: z.array(permissionGrantSchema).max(100),
  operatorBalances: budgetBalancesSchema,
  grantBalances: z
    .array(
      z.strictObject({ grantId: idSchema, balances: budgetBalancesSchema }),
    )
    .max(100)
    .refine(
      (items) => new Set(items.map((v) => v.grantId)).size === items.length,
      { message: "Duplicate grant balance" },
    ),
  actionApproval: actionApprovalSchema.extend({ userId: idSchema }).optional(),
  assignment: assignmentSchema.optional(),
  application: applicationSchema.optional(),
  review: reviewSchema.optional(),
  submission: submissionSchema.optional(),
  now: timestampSchema,
});
/** The adapter supplies action/cost/digest from the operation, not from untrusted tool text. */
export const scopedActionSchema = z.strictObject({
  action: permissionActionSchema,
  expectedVersion: versionSchema.optional(),
  payloadDigest: digestSchema.optional(),
  budget: budgetCapsSchema,
});
export type ResourceSnapshot = z.infer<typeof resourceSnapshotSchema>;
export type AgentPrincipalSnapshot = z.infer<
  typeof agentPrincipalSnapshotSchema
>;
export type AuthorizationContext = z.infer<typeof authorizationContextSchema>;
export type ScopedAction = z.infer<typeof scopedActionSchema>;
const deny = (
  code:
    | "NOT_FOUND"
    | "ACTION_FORBIDDEN"
    | "UNAUTHENTICATED"
    | "CREDENTIAL_REVOKED"
    | "STEP_UP_REQUIRED"
    | "BUDGET_EXHAUSTED"
    | "VERSION_CONFLICT"
    | "VALIDATION_FAILED",
): DomainDecision => ({ allowed: false, code });
const readActions = new Set([
  "discovery.read",
  "project.read",
  "task.read",
  "inquiry.read",
  "evidence.read",
]);

function projectId(
  resource: ResourceSnapshot,
  context: AuthorizationContext,
): string | undefined {
  return resource.kind === "project"
    ? resource.id
    : (resource.projectId ??
        context.ancestors.find(
          (p) => p.kind === "task" && p.id === resource.taskId,
        )?.projectId);
}
function membership(context: AuthorizationContext, resource: ResourceSnapshot) {
  return context.memberships.find(
    (m) =>
      m.participantAgentId === context.principal?.agentId &&
      m.projectId === projectId(resource, context) &&
      !m.revokedAt &&
      (!m.expiresAt || !isExpired(m.expiresAt, context.now)),
  );
}
function canRead(
  context: AuthorizationContext,
  resource: ResourceSnapshot,
): boolean {
  if (resource.visibility === "public") return true;
  if (context.actor.kind === "anonymous") return false;
  const controllerId =
    context.actor.kind === "human"
      ? context.actor.userId
      : context.principal?.controllerUserId;
  if (controllerId === resource.controllerUserId) return true;
  return (
    resource.visibility !== "operator_private" &&
    !!membership(context, resource)
  );
}
function scopeMatches(
  scope: ResourceScope,
  context: AuthorizationContext,
): boolean {
  const r = context.resource;
  if (scope.kind === "public")
    return (
      r.visibility === "public" &&
      context.ancestors.every((p) => p.visibility === "public")
    );
  if (scope.kind === "controlled_agents")
    return (
      r.kind === "agent" &&
      r.controllerUserId === context.principal?.controllerUserId
    );
  if (scope.kind === r.kind && scope.id === r.id) return true;
  if (scope.kind === "project") return projectId(r, context) === scope.id;
  if (scope.kind === "task") return r.taskId === scope.id;
  return false;
}
function ownsOrMaintains(context: AuthorizationContext): boolean {
  return (
    context.principal?.agentId === context.resource.ownerAgentId ||
    membership(context, context.resource)?.role === "maintainer"
  );
}
function roleAllows(
  context: AuthorizationContext,
  action: ScopedAction["action"],
): boolean {
  const principal = context.principal;
  if (!principal) return false;
  if (readActions.has(action)) return true;
  if (action === "application.withdraw")
    return (
      context.resource.kind === "task" &&
      context.application?.taskId === context.resource.id &&
      context.application.applicantAgentId === principal.agentId
    );
  if (["project.update", "project.members.manage"].includes(action))
    return context.resource.kind === "project" && ownsOrMaintains(context);
  if (
    ["task.update", "task.assign", "task.decide", "review.request"].includes(
      action,
    )
  )
    return context.resource.kind === "task" && ownsOrMaintains(context);
  if (action === "assignment.renew")
    return (
      context.resource.kind === "task" &&
      context.assignment?.taskId === context.resource.id &&
      ownsOrMaintains(context)
    );
  if (
    [
      "assignment.acknowledge",
      "assignment.heartbeat",
      "assignment.release",
      "assignment.submit",
      "submission.record_evidence",
    ].includes(action)
  ) {
    const a = context.assignment;
    return (
      !!a &&
      context.resource.kind === "task" &&
      a.taskId === context.resource.id &&
      (a.participantAgentId === principal.agentId ||
        (action === "assignment.release" && ownsOrMaintains(context)))
    );
  }
  if (["review.submit", "review.respond"].includes(action)) {
    const r = context.review,
      s = context.submission;
    return (
      !!r &&
      !!s &&
      r.reviewerAgentId === principal.agentId &&
      r.submission.id === s.id &&
      r.submission.revision === s.revision &&
      s.taskId === context.resource.id &&
      context.resource.kind === "task"
    );
  }
  if (
    [
      "assessment.read",
      "assessment.write",
      "capability.write",
      "profile.update",
      "configuration.create",
      "project.create",
    ].includes(action)
  )
    return (
      context.resource.kind === "agent" &&
      context.resource.id === principal.agentId &&
      context.resource.ownerAgentId === principal.agentId
    );
  if (action === "task.create")
    return (
      (context.resource.kind === "agent" &&
        context.resource.id === principal.agentId) ||
      (context.resource.kind === "project" &&
        (ownsOrMaintains(context) ||
          ["contributor", "maintainer"].includes(
            membership(context, context.resource)?.role ?? "",
          )))
    );
  if (action === "task.volunteer" && context.resource.kind !== "task")
    return false;
  if (action === "inquiry.answer" && context.resource.kind !== "inquiry")
    return false;
  if (
    action === "inquiry.create" &&
    !["agent", "project", "task"].includes(context.resource.kind)
  )
    return false;
  if (
    [
      "inquiry.create",
      "inquiry.answer",
      "thread.post",
      "verification.record",
      "task.volunteer",
    ].includes(action)
  )
    return (
      context.resource.visibility === "public" ||
      ownsOrMaintains(context) ||
      action === "task.volunteer" ||
      ["contributor", "maintainer"].includes(
        membership(context, context.resource)?.role ?? "",
      )
    );
  // Later phases explicitly add their action/role rules; there is no general permissive fallback.
  return false;
}

/**
 * Pure policy reference, not credential verification or a database filter. Services must obtain
 * scoped facts and atomically recheck versions, consume approvals and reserve balances when committing.
 */
export function authorizeScopedAction(
  context: AuthorizationContext,
  request: ScopedAction,
): DomainDecision {
  if (
    !authorizationContextSchema.safeParse(context).success ||
    !scopedActionSchema.safeParse(request).success
  )
    return deny("VALIDATION_FAILED");
  const nodes = [context.resource, ...context.ancestors];
  for (const node of nodes) {
    if (
      node.taskId &&
      node.projectId &&
      context.ancestors.find((p) => p.kind === "task" && p.id === node.taskId)
        ?.projectId !== node.projectId
    )
      return deny("NOT_FOUND");
    if (
      node.projectId &&
      node.kind !== "project" &&
      !context.ancestors.some(
        (p) => p.kind === "project" && p.id === node.projectId,
      )
    )
      return deny("NOT_FOUND");
    if (
      node.taskId &&
      !context.ancestors.some((p) => p.kind === "task" && p.id === node.taskId)
    )
      return deny("NOT_FOUND");
  }
  if (!nodes.every((r) => canRead(context, r))) return deny("NOT_FOUND");
  const isPublicRead =
    readActions.has(request.action) &&
    nodes.every((r) => r.visibility === "public");
  if (context.actor.kind === "anonymous")
    return isPublicRead ? { allowed: true } : deny("UNAUTHENTICATED");
  if (context.actor.kind === "human" && !context.sessionActive)
    return deny("UNAUTHENTICATED");
  if (isPublicRead && context.actor.kind === "human" && !context.principal)
    return { allowed: true };
  const p = context.principal;
  if (!p || p.agentState !== "active" || p.controllerState !== "active")
    return deny("CREDENTIAL_REVOKED");
  if (context.actor.kind === "human") {
    if (context.actor.userId !== p.controllerUserId)
      return deny("ACTION_FORBIDDEN");
  } else {
    const actor = context.actor,
      instance = p.instance;
    if (
      !instance ||
      actor.agentId !== p.agentId ||
      actor.controllerUserId !== p.controllerUserId ||
      actor.configurationRevisionId !== p.configurationRevisionId ||
      actor.instanceId !== instance.id ||
      actor.configurationRevisionId !== instance.configurationRevisionId ||
      actor.credentialId !== instance.credentialId ||
      actor.scopeVersion !== instance.scopeVersion ||
      instance.state !== "active" ||
      instance.credentialRevoked ||
      isExpired(instance.credentialExpiresAt, context.now)
    )
      return deny("CREDENTIAL_REVOKED");
  }
  if (!roleAllows(context, request.action)) return deny("ACTION_FORBIDDEN");
  const targetVersion =
    request.action === "application.withdraw"
      ? context.application?.version
      : request.action.startsWith("assignment.") ||
          request.action === "submission.record_evidence"
        ? context.assignment?.version
        : ["review.submit", "review.respond"].includes(request.action)
          ? context.review?.version
          : context.resource.version;
  if (
    request.expectedVersion !== undefined &&
    request.expectedVersion !== targetVersion
  )
    return deny("VERSION_CONFLICT");
  if (!request.budget.some((v) => v.unit === "requests" && v.hardLimit >= 1))
    return deny("BUDGET_EXHAUSTED");
  const operatorBudget = request.budget.every((cost) => {
    const balance = context.operatorBalances.find((b) => b.unit === cost.unit);
    return !!balance && canReserveBudget(balance, cost.hardLimit);
  });
  if (!operatorBudget) return deny("BUDGET_EXHAUSTED");
  const matching = context.grants.filter(
    (g) =>
      g.agentId === p.agentId &&
      !g.revokedAt &&
      !isExpired(g.expiresAt, context.now) &&
      (!g.instanceId ||
        (context.actor.kind === "agent" &&
          g.instanceId === context.actor.instanceId)) &&
      g.actions.includes(request.action) &&
      scopeMatches(g.resourceScope, context),
  );
  let hadBudget = false;
  for (const grant of matching) {
    const balances = context.grantBalances.find(
      (v) => v.grantId === grant.id,
    )?.balances;
    if (
      !request.budget.every((cost) => {
        const cap = grant.budgetCaps.find((v) => v.unit === cost.unit),
          balance = balances?.find((v) => v.unit === cost.unit);
        return (
          !!cap &&
          !!balance &&
          canReserveBudget(
            {
              ...balance,
              hardLimit: Math.min(cap.hardLimit, balance.hardLimit),
            },
            cost.hardLimit,
          )
        );
      })
    )
      continue;
    hadBudget = true;
    if (grant.approvalRule === "per_action") {
      const a = context.actionApproval;
      if (
        !a ||
        a.userId !== p.controllerUserId ||
        a.agentId !== p.agentId ||
        a.decision !== "approved" ||
        a.consumedAt ||
        isExpired(a.expiresAt, context.now) ||
        a.requestedAction !== request.action ||
        !request.payloadDigest ||
        a.payloadDigest !== request.payloadDigest ||
        !scopeMatches(a.target.resourceScope, context) ||
        (a.target.revision !== undefined &&
          a.target.revision !== request.expectedVersion) ||
        !request.budget.every((cost) =>
          a.budget.some(
            (v) => v.unit === cost.unit && v.hardLimit >= cost.hardLimit,
          ),
        )
      )
        continue;
    }
    return domainDecisionSchema.parse({ allowed: true });
  }
  return matching.length === 0
    ? deny("ACTION_FORBIDDEN")
    : !hadBudget
      ? deny("BUDGET_EXHAUSTED")
      : deny("STEP_UP_REQUIRED");
}
