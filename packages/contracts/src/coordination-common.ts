import { z } from "zod";
import { budgetUnitSchema } from "./agents.js";
import {
  idSchema,
  mutableEntitySchema,
  timestampSchema,
  versionSchema,
} from "./common.js";

/** Wire revisions are immutable content identifiers, distinct from mutable versions. */
export const revisionRefSchema = z.strictObject({
  id: idSchema,
  revision: versionSchema,
});
export const evidenceTargetSchema = revisionRefSchema.extend({
  kind: z.enum([
    "submission",
    "answer",
    "thread_entry",
    "artifact",
    "verification",
    "configuration",
  ]),
});
/** Redaction removes even the existence/identifier of a now-inaccessible source. */
export const evidenceReferenceSchema = z.discriminatedUnion("status", [
  z.strictObject({
    status: z.literal("available"),
    target: evidenceTargetSchema,
  }),
  z.strictObject({ status: z.literal("unavailable") }),
]);
export const evidenceTargetsSchema = z.array(evidenceTargetSchema).max(50);
export const evidenceReferencesSchema = z
  .array(evidenceReferenceSchema)
  .max(50);
export const artifactIdsSchema = z
  .array(idSchema)
  .max(50)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "Duplicate artifact ID",
  });
export const notesSchema = z.array(z.string().trim().min(1).max(1_000)).max(20);
export const contentSchema = z.string().trim().min(1).max(16_000);
export const immutableFields = { id: idSchema, createdAt: timestampSchema };
export const agentAttributionSchema = z.discriminatedUnion("origin", [
  z.strictObject({
    origin: z.literal("runtime"),
    agentId: idSchema,
    instanceId: idSchema,
    configurationRevisionId: idSchema,
  }),
  z.strictObject({
    origin: z.literal("operator"),
    agentId: idSchema,
    configurationRevisionId: idSchema,
  }),
]);
/** Checked shape for a unit balance; updates must still be transactional in storage. */
export const budgetBalanceSchema = z
  .strictObject({
    unit: budgetUnitSchema,
    hardLimit: z.int().min(0).max(Number.MAX_SAFE_INTEGER),
    reserved: z.int().min(0).max(Number.MAX_SAFE_INTEGER),
    consumed: z.int().min(0).max(Number.MAX_SAFE_INTEGER),
  })
  .refine((b) => b.reserved <= b.hardLimit - b.consumed, {
    message: "Budget is overcommitted",
  });
export const budgetBalancesSchema = z
  .array(budgetBalanceSchema)
  .max(6)
  .refine((items) => new Set(items.map((v) => v.unit)).size === items.length, {
    message: "Duplicate balance unit",
  });
/** Restricted allocation summary; ledger provenance and operator ownership remain server-side. */
export const budgetReservationSchema = mutableEntitySchema
  .extend({
    assignmentId: idSchema,
    unit: budgetUnitSchema,
    quantity: z.int().min(0).max(Number.MAX_SAFE_INTEGER),
    state: z.enum(["held", "settled", "released"]),
    settledQuantity: z.int().min(0).max(Number.MAX_SAFE_INTEGER).optional(),
  })
  .refine(
    (v) =>
      (v.state === "settled") === (v.settledQuantity !== undefined) &&
      (v.settledQuantity ?? 0) <= v.quantity,
    {
      message:
        "Settlement requires measured/reported usage within its reservation",
    },
  );
export const usageClaimSchema = z
  .strictObject({
    eventKey: z
      .string()
      .min(16)
      .max(128)
      .regex(/^[A-Za-z0-9_-]+$/),
    unit: budgetUnitSchema,
    quantity: z.int().min(0).max(Number.MAX_SAFE_INTEGER),
    provenance: z.enum(["server_measured", "runtime_reported"]),
  })
  .refine(
    (claim) =>
      claim.unit.startsWith("reported_") ===
      (claim.provenance === "runtime_reported"),
    {
      message: "Local token/compute usage is reported, not server-measured",
    },
  );
/** Pure admission check; it neither reserves resources nor enforces external compute. */
export function canReserveBudget(
  balance: BudgetBalance,
  quantity: number,
): boolean {
  return (
    budgetBalanceSchema.safeParse(balance).success &&
    Number.isSafeInteger(quantity) &&
    quantity >= 0 &&
    quantity <= balance.hardLimit - balance.consumed - balance.reserved
  );
}
export type RevisionRef = z.infer<typeof revisionRefSchema>;
export type EvidenceTarget = z.infer<typeof evidenceTargetSchema>;
export type EvidenceReference = z.infer<typeof evidenceReferenceSchema>;
export type AgentAttribution = z.infer<typeof agentAttributionSchema>;
export type BudgetBalance = z.infer<typeof budgetBalanceSchema>;
export type BudgetReservation = z.infer<typeof budgetReservationSchema>;
export type UsageClaim = z.infer<typeof usageClaimSchema>;
