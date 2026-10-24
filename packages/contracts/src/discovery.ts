import { z } from "zod";
import {
  budgetCapsSchema,
  modalitySchema,
  visibilitySchema,
} from "./agents.js";
import {
  idSchema,
  labelSchema,
  mutableEntitySchema,
  pageQuerySchema,
  pageSchema,
  timestampSchema,
} from "./common.js";
import {
  evidenceReferencesSchema,
  evidenceTargetsSchema,
} from "./coordination-common.js";
import { writePreconditionSchema } from "./evidence.js";

const offerFields = {
  projectId: idSchema.optional(),
  configurationRevisionId: idSchema,
  domains: z.array(labelSchema).min(1).max(20),
  modalities: z.array(modalitySchema).min(1).max(5),
  formats: z.array(labelSchema).min(1).max(20),
  packetLimitBytes: z.int().min(1).max(10_000_000),
  availability: z
    .strictObject({ startsAt: timestampSchema, endsAt: timestampSchema })
    .refine((v) => Date.parse(v.startsAt) < Date.parse(v.endsAt), {
      message: "Availability must have a positive interval",
    }),
  resourceLimits: budgetCapsSchema,
  visibility: visibilitySchema,
};
/** Capability declarations are labeled and linked to a configuration, never attested by default. */
export const capabilityOfferSchema = mutableEntitySchema
  .extend({
    ...offerFields,
    agentId: idSchema,
    evidenceRefs: evidenceReferencesSchema,
    claimBasis: z.literal("self_declared"),
  })
  .refine(
    (v) => !["project", "invited"].includes(v.visibility) || !!v.projectId,
    { message: "Shared offer requires a project", path: ["projectId"] },
  );
export const upsertCapabilityOfferSchema = z
  .strictObject({
    ...offerFields,
    precondition: writePreconditionSchema,
    evidenceTargets: evidenceTargetsSchema,
  })
  .refine(
    (v) => !["project", "invited"].includes(v.visibility) || !!v.projectId,
    { message: "Shared offer requires a project", path: ["projectId"] },
  );
export const matchQuerySchema = pageQuerySchema.extend({
  taskId: idSchema.optional(),
  domain: labelSchema,
  modality: modalitySchema,
  format: labelSchema,
  packetSizeBytes: z.int().min(1).max(10_000_000),
});
/** An explanation is descriptive; it is not an assignment or an authoritative trust ranking. */
export const matchSchema = z.strictObject({
  offer: capabilityOfferSchema,
  reasons: z
    .array(
      z.enum([
        "domain",
        "modality",
        "format",
        "availability",
        "packet_limit",
        "resource_limits",
      ]),
    )
    .min(1)
    .max(6),
});
export const matchPageSchema = pageSchema(matchSchema);
export type CapabilityOffer = z.infer<typeof capabilityOfferSchema>;
export type UpsertCapabilityOffer = z.infer<typeof upsertCapabilityOfferSchema>;
export type MatchQuery = z.input<typeof matchQuerySchema>;
export type Match = z.infer<typeof matchSchema>;
export type MatchPage = z.infer<typeof matchPageSchema>;
