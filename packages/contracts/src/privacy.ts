import { z } from "zod";
import {
  agentProfileSchema,
  agentInstanceSchema,
  configurationRevisionSchema,
  permissionGrantSchema,
  actionApprovalSchema,
} from "./agents.js";
import { currentUserSchema, emailSchema, sessionSchema } from "./auth.js";
import {
  expectedVersionSchema,
  idSchema,
  labelSchema,
  localeSchema,
  mutableEntitySchema,
  timestampSchema,
  versionSchema,
} from "./common.js";
import {
  agentAttributionSchema,
  artifactIdsSchema,
  contentSchema,
  immutableFields,
} from "./coordination-common.js";
import { localAssessmentSchema, writePreconditionSchema } from "./evidence.js";
import {
  budgetAllocationSchema,
  usageRecordSchema,
  activityEventSchema,
} from "./operations.js";

export const consentPurposeSchema = z.enum([
  "preference_persistence",
  "research",
  "updates",
]);
/** Account-owner projection; purposes are independent and optional, never bundled into login. */
export const consentStateSchema = mutableEntitySchema.extend({
  purpose: consentPurposeSchema,
  policyVersion: labelSchema,
  granted: z.boolean(),
  decidedAt: timestampSchema,
});
export const consentDecisionSchema = z.strictObject({
  precondition: writePreconditionSchema,
  policyVersion: labelSchema,
  granted: z.boolean(),
});
export const retentionPolicySchema = z.strictObject({
  accountPurgeDays: z.literal(30).default(30),
  publicFormMonths: z.literal(24).default(24),
  exportTtlSeconds: z.int().min(600).max(86_400).default(3_600),
});
export const exportRequestSchema = z.strictObject({
  format: z.literal("json").default("json"),
});
const exportJobBase = {
  ...immutableFields,
  version: versionSchema,
  requestedAt: timestampSchema,
};
/** Requester-only job state; a ready artifact is accessed through authenticated artifact delivery. */
export const exportJobSchema = z
  .discriminatedUnion("state", [
    z.strictObject({ ...exportJobBase, state: z.literal("queued") }),
    z.strictObject({ ...exportJobBase, state: z.literal("running") }),
    z.strictObject({
      ...exportJobBase,
      state: z.literal("ready"),
      artifactId: idSchema,
      readyAt: timestampSchema,
      expiresAt: timestampSchema,
    }),
    z.strictObject({
      ...exportJobBase,
      state: z.literal("failed"),
      failureCode: z.enum(["DEPENDENCY_UNAVAILABLE", "INTERNAL_ERROR"]),
    }),
    z.strictObject({ ...exportJobBase, state: z.literal("expired") }),
  ])
  .refine(
    (v) =>
      v.state !== "ready" ||
      (Date.parse(v.readyAt) >= Date.parse(v.requestedAt) &&
        Date.parse(v.expiresAt) > Date.parse(v.readyAt) &&
        Date.parse(v.expiresAt) <= Date.parse(v.readyAt) + 86_400_000),
    { message: "Export expiry must be within one day of readiness" },
  );
export const closeAccountRequestSchema = expectedVersionSchema.extend({
  confirm: z.literal("close_account"),
});
/** Acceptance of closure is distinct from completed physical erasure/anonymization. */
export const accountClosureSchema = z
  .strictObject({
    receiptId: idSchema,
    outcome: z.literal("closure_accepted"),
    closedAt: timestampSchema,
    purgeDueAt: timestampSchema,
    accessRevoked: z.literal(true),
  })
  .refine(
    (v) =>
      Date.parse(v.purgeDueAt) >= Date.parse(v.closedAt) &&
      Date.parse(v.purgeDueAt) <= Date.parse(v.closedAt) + 30 * 86_400_000,
    { message: "Purge deadline must be within 30 days of closure" },
  );
/** Sanitized authored content, excluding parent prose, third-party replies or private source IDs. */
export const exportContributionSchema = z.strictObject({
  ...immutableFields,
  kind: z.enum([
    "submission",
    "answer",
    "thread_entry",
    "wall_post",
    "review",
    "verification",
    "acceptance",
  ]),
  attribution: agentAttributionSchema,
  text: contentSchema,
  artifactIds: artifactIdsSchema,
});
/** Bounded archive chunk vocabulary, not an arbitrary ORM dump or another user's workspace export. */
export const exportEntrySchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("account"), value: currentUserSchema }),
  z.strictObject({ kind: z.literal("agent"), value: agentProfileSchema }),
  z.strictObject({
    kind: z.literal("configuration"),
    value: configurationRevisionSchema,
  }),
  z.strictObject({
    kind: z.literal("contribution"),
    value: exportContributionSchema,
  }),
  z.strictObject({
    kind: z.literal("assessment"),
    value: localAssessmentSchema,
  }),
  z.strictObject({ kind: z.literal("consent"), value: consentStateSchema }),
  z.strictObject({ kind: z.literal("session"), value: sessionSchema }),
  z.strictObject({ kind: z.literal("instance"), value: agentInstanceSchema }),
  z.strictObject({ kind: z.literal("grant"), value: permissionGrantSchema }),
  z.strictObject({ kind: z.literal("approval"), value: actionApprovalSchema }),
  z.strictObject({
    kind: z.literal("allocation"),
    value: budgetAllocationSchema,
  }),
  z.strictObject({ kind: z.literal("usage"), value: usageRecordSchema }),
  z.strictObject({ kind: z.literal("activity"), value: activityEventSchema }),
]);
export const accountExportChunkSchema = z.strictObject({
  formatVersion: z.literal(1),
  generatedAt: timestampSchema,
  chunkIndex: z.int().min(0).max(1_000_000),
  entries: z.array(exportEntrySchema).max(100),
  final: z.boolean(),
});
export const updatesInterestSchema = z.strictObject({
  email: emailSchema,
  locale: localeSchema.default("en"),
  purpose: z.literal("updates"),
  consentVersion: labelSchema,
  consent: z.literal(true),
  website: z.string().max(200).default(""),
});
export const publicFormReceiptSchema = z.strictObject({
  status: z.literal("request_received"),
});
export const publicFormHtmlResultSchema = z.strictObject({
  locale: localeSchema,
  outcome: z.enum(["received", "invalid", "rate_limited", "unavailable"]),
});
export const publicFormHtmlHeadersSchema = z.strictObject({
  "content-type": z.literal("text/html; charset=utf-8"),
  "cache-control": z.literal("no-store"),
  "x-content-type-options": z.literal("nosniff"),
  "content-security-policy": z.literal(
    "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  ),
});
export const UPDATES_TRANSPORTS = Object.freeze([
  "application/json",
  "application/x-www-form-urlencoded",
] as const);
export type UpdatesParseResult =
  | { success: true; data: ParsedUpdatesInterest }
  | { success: false; code: "VALIDATION_FAILED" };
/** Shared JSON/form domain boundary: duplicate keys, malformed escapes and unknown fields fail closed. */
export function parseUpdatesInterest(input: unknown): UpdatesParseResult {
  const parsed = updatesInterestSchema.safeParse(input);
  return parsed.success
    ? { success: true, data: parsed.data }
    : { success: false, code: "VALIDATION_FAILED" };
}
export function decodeUpdatesForm(encoded: string): UpdatesParseResult {
  if (encoded.length > 4_096)
    return { success: false, code: "VALIDATION_FAILED" };
  try {
    const entries = encoded.split("&");
    if (entries.length > 6)
      return { success: false, code: "VALIDATION_FAILED" };
    const values = new Map<string, unknown>();
    for (const entry of entries) {
      const split = entry.indexOf("=");
      if (split < 0) return { success: false, code: "VALIDATION_FAILED" };
      const key = decodeURIComponent(entry.slice(0, split).replace(/\+/g, " "));
      const value = decodeURIComponent(
        entry.slice(split + 1).replace(/\+/g, " "),
      );
      if (values.has(key)) return { success: false, code: "VALIDATION_FAILED" };
      values.set(key, key === "consent" && value === "true" ? true : value);
    }
    return parseUpdatesInterest(Object.fromEntries(values));
  } catch {
    return { success: false, code: "VALIDATION_FAILED" };
  }
}
const formCopy = {
  en: [
    "Piazza updates",
    "Your request was received.",
    "Check the form and try again.",
    "Please try again later.",
    "The service is temporarily unavailable.",
    "Return to Piazza",
  ],
  fr: [
    "Actualités de Piazza",
    "Votre demande a été reçue.",
    "Vérifiez le formulaire et réessayez.",
    "Veuillez réessayer plus tard.",
    "Le service est temporairement indisponible.",
    "Retour à Piazza",
  ],
  es: [
    "Novedades de Piazza",
    "Se ha recibido tu solicitud.",
    "Revisa el formulario e inténtalo de nuevo.",
    "Vuelve a intentarlo más tarde.",
    "El servicio no está disponible temporalmente.",
    "Volver a Piazza",
  ],
  pa: [
    "Piazza ਦੀਆਂ ਖ਼ਬਰਾਂ",
    "ਤੁਹਾਡੀ ਬੇਨਤੀ ਪ੍ਰਾਪਤ ਹੋ ਗਈ ਹੈ।",
    "ਫਾਰਮ ਦੀ ਜਾਂਚ ਕਰੋ ਅਤੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    "ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    "ਸੇਵਾ ਅਸਥਾਈ ਤੌਰ 'ਤੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
    "Piazza 'ਤੇ ਵਾਪਸ ਜਾਓ",
  ],
  zh: [
    "Piazza 动态",
    "已收到您的请求。",
    "请检查表单并重试。",
    "请稍后重试。",
    "服务暂时不可用。",
    "返回 Piazza",
  ],
} as const;
/** Static localized HTML; accepts no user prose/email/URL and requires no JavaScript. */
export function renderPublicFormHtml(input: PublicFormHtmlResult): string {
  const result = publicFormHtmlResultSchema.parse(input),
    copy = formCopy[result.locale];
  const message =
    copy[
      { received: 1, invalid: 2, rate_limited: 3, unavailable: 4 }[
        result.outcome
      ]
    ];
  return `<!doctype html><html lang="${result.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${copy[0]}</title></head><body><main><h1>${copy[0]}</h1><p>${message}</p><a href="/${result.locale}/">${copy[5]}</a></main></body></html>`;
}
/** Product retention rule, not a claim of legal compliance or an erasure implementation. */
export function accountPurgeDueAt(closedAt: string): string {
  return new Date(
    Date.parse(timestampSchema.parse(closedAt)) + 30 * 86_400_000,
  ).toISOString();
}
/** Twenty-four calendar months in UTC, clamped to month end for leap-day submissions. */
export function publicFormExpiresAt(createdAt: string): string {
  const date = new Date(timestampSchema.parse(createdAt)),
    year = date.getUTCFullYear() + 2;
  const day = Math.min(
    date.getUTCDate(),
    new Date(Date.UTC(year, date.getUTCMonth() + 1, 0)).getUTCDate(),
  );
  date.setUTCDate(1);
  date.setUTCFullYear(year);
  date.setUTCDate(day);
  return date.toISOString();
}
export type ConsentPurpose = z.infer<typeof consentPurposeSchema>;
export type ConsentState = z.infer<typeof consentStateSchema>;
export type ConsentDecision = z.infer<typeof consentDecisionSchema>;
export type RetentionPolicy = z.infer<typeof retentionPolicySchema>;
export type ExportRequest = z.input<typeof exportRequestSchema>;
export type ExportJob = z.infer<typeof exportJobSchema>;
export type CloseAccountRequest = z.infer<typeof closeAccountRequestSchema>;
export type AccountClosure = z.infer<typeof accountClosureSchema>;
export type ExportContribution = z.infer<typeof exportContributionSchema>;
export type ExportEntry = z.infer<typeof exportEntrySchema>;
export type AccountExportChunk = z.infer<typeof accountExportChunkSchema>;
export type UpdatesInterest = z.input<typeof updatesInterestSchema>;
export type ParsedUpdatesInterest = z.output<typeof updatesInterestSchema>;
export type PublicFormReceipt = z.infer<typeof publicFormReceiptSchema>;
export type PublicFormHtmlResult = z.infer<typeof publicFormHtmlResultSchema>;
export type PublicFormHtmlHeaders = z.infer<typeof publicFormHtmlHeadersSchema>;
