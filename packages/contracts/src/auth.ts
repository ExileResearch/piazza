import { z } from "zod";
import {
  idSchema,
  localeSchema,
  secretSchema,
  themeSchema,
  timestampSchema,
  versionSchema,
} from "./common.js";

/** Canonicalization is trim/lowercase only; no provider-specific dot/plus rewriting. */
export const emailSchema = z
  .string()
  .max(512)
  .trim()
  .toLowerCase()
  .pipe(z.email().max(254));
export const passwordSchema = z.string().min(15).max(128);
/** Login must permit verification of a previously accepted password after policy updates. */
export const passwordLoginValueSchema = z.string().min(1).max(128);
export const otpCodeSchema = z.string().regex(/^\d{6}$/);
export const recoveryCodeSchema = z
  .string()
  .regex(/^[A-Z0-9]{4}(?:-[A-Z0-9]{4}){3}$/);
export const roleSchema = z.enum(["user", "admin"]);
export const rolesSchema = z
  .array(roleSchema)
  .min(1)
  .max(2)
  .refine(
    (roles) => roles.includes("user") && new Set(roles).size === roles.length,
    { message: "Roles must include user and contain no duplicates" },
  );
export const userStateSchema = z.enum(["active", "closed", "suspended"]);
export const mfaStateSchema = z.strictObject({ enabled: z.boolean() });

/** Non-identifying public human projection; no email, role or authentication metadata. */
export const publicUserSchema = z.strictObject({ id: idSchema });
/** Self-only account projection; never reuse as a public profile response. */
export const currentUserSchema = z.strictObject({
  id: idSchema,
  version: versionSchema,
  email: emailSchema,
  emailVerifiedAt: timestampSchema,
  roles: rolesSchema,
  locale: localeSchema,
  theme: themeSchema,
  state: userStateSchema,
  mfa: mfaStateSchema,
  createdAt: timestampSchema,
});
/** Session list projection deliberately omits refresh tokens, hashes and IP metadata. */
export const sessionSchema = z.strictObject({
  id: idSchema,
  version: versionSchema,
  createdAt: timestampSchema,
  expiresAt: timestampSchema,
  revokedAt: timestampSchema.optional(),
  isCurrent: z.boolean(),
});
export const authPurposeSchema = z.enum([
  "verify_email",
  "login_otp",
  "reset_password",
  "step_up",
  "admin_otp",
]);
export const registerRequestSchema = z.strictObject({
  email: emailSchema,
  password: passwordSchema,
  locale: localeSchema.default("en"),
});
export const verifyEmailRequestSchema = z.strictObject({ token: secretSchema });
export const otpRequestSchema = z.strictObject({
  email: emailSchema,
  intent: z.enum(["enroll", "login"]),
  locale: localeSchema.default("en"),
});
export const otpCompleteSchema = z.strictObject({
  challengeId: idSchema,
  code: otpCodeSchema,
});
export const passwordLoginSchema = z.strictObject({
  email: emailSchema,
  password: passwordLoginValueSchema,
});
export const forgotPasswordSchema = z.strictObject({ email: emailSchema });
export const resetPasswordSchema = z.strictObject({
  token: secretSchema,
  password: passwordSchema,
});
export const mfaCompleteSchema = z.discriminatedUnion("method", [
  z.strictObject({
    challengeId: idSchema,
    method: z.literal("totp"),
    code: otpCodeSchema,
  }),
  z.strictObject({
    challengeId: idSchema,
    method: z.literal("recovery_code"),
    code: recoveryCodeSchema,
  }),
]);
/** Anonymous auth requests always receive this same shape, including synthetic challenges. */
export const authRequestAcceptedSchema = z.strictObject({
  status: z.literal("request_received"),
  challengeId: idSchema,
  expiresAt: timestampSchema,
});
/** Only authenticated issuance/refresh endpoints may return this secret-bearing projection. */
export const sessionTokensSchema = z.strictObject({
  accessToken: secretSchema,
  refreshToken: secretSchema,
  tokenType: z.literal("Bearer"),
  accessExpiresAt: timestampSchema,
  refreshExpiresAt: timestampSchema,
  sessionId: idSchema,
});
export const authResultSchema = z.discriminatedUnion("status", [
  z.strictObject({
    status: z.literal("session_issued"),
    tokens: sessionTokensSchema,
    user: currentUserSchema,
  }),
  z.strictObject({
    status: z.literal("challenge_required"),
    challengeId: idSchema,
    expiresAt: timestampSchema,
    methods: z
      .array(z.enum(["totp", "recovery_code"]))
      .min(1)
      .max(2),
  }),
]);
// Authentication failures use ApiErrorResponse, not a third token-bearing success branch.
export const refreshRequestSchema = z.strictObject({
  refreshToken: secretSchema,
});
export const signOutRequestSchema = refreshRequestSchema;
export const updatePreferencesSchema = z
  .strictObject({
    expectedVersion: versionSchema,
    locale: localeSchema.optional(),
    theme: themeSchema.optional(),
  })
  .refine((value) => value.locale !== undefined || value.theme !== undefined, {
    message: "At least one preference is required",
  });
export const mfaEnrollmentRequestSchema = z.strictObject({
  method: z.literal("totp"),
});
/** Factor setup is another explicitly secret-bearing, step-up protected issuance response. */
export const mfaEnrollmentChallengeSchema = z.strictObject({
  enrollmentId: idSchema,
  secret: z.string().regex(/^[A-Z2-7]{32,128}$/),
  expiresAt: timestampSchema,
});
export const mfaEnrollmentConfirmSchema = z.strictObject({
  enrollmentId: idSchema,
  code: otpCodeSchema,
});
export const mfaEnrollmentConfirmedSchema = z.strictObject({
  enabled: z.literal(true),
  recoveryCodes: z
    .array(recoveryCodeSchema)
    .length(10)
    .refine((codes) => new Set(codes).size === codes.length, {
      message: "Recovery codes must be distinct",
    }),
});
export const mfaDisableSchema = mfaCompleteSchema;
export const stepUpRequestSchema = z.discriminatedUnion("method", [
  z.strictObject({
    method: z.literal("password"),
    password: passwordLoginValueSchema,
  }),
  z.strictObject({
    method: z.literal("email_otp"),
    challengeId: idSchema,
    code: otpCodeSchema,
  }),
  z.strictObject({
    method: z.literal("totp"),
    challengeId: idSchema,
    code: otpCodeSchema,
  }),
  z.strictObject({
    method: z.literal("recovery_code"),
    challengeId: idSchema,
    code: recoveryCodeSchema,
  }),
]);
export const stepUpResultSchema = z.discriminatedUnion("status", [
  z.strictObject({
    status: z.literal("step_up_issued"),
    stepUpToken: secretSchema,
    expiresAt: timestampSchema,
  }),
  z.strictObject({
    status: z.literal("challenge_required"),
    challengeId: idSchema,
    expiresAt: timestampSchema,
    methods: z
      .array(z.enum(["email_otp", "totp", "recovery_code"]))
      .min(1)
      .max(3),
  }),
]);

/** Configuration defaults, not encoded credentials or an implementation of authentication. */
export const authPolicySchema = z.strictObject({
  otpTtlSeconds: z.int().min(60).max(600).default(300),
  otpMaxAttempts: z.int().min(1).max(10).default(5),
  accessTtlSeconds: z.int().min(60).max(900).default(600),
  refreshTtlSeconds: z.int().min(600).max(2_592_000).default(604_800),
  stepUpTtlSeconds: z.int().min(30).max(600).default(300),
  runtimeCredentialTtlSeconds: z.int().min(60).max(2_592_000).default(86_400),
});

export type PublicUser = z.infer<typeof publicUserSchema>;
export type CurrentUser = z.infer<typeof currentUserSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type RegisterRequest = z.input<typeof registerRequestSchema>;
export type AuthResult = z.infer<typeof authResultSchema>;
export type SessionTokens = z.infer<typeof sessionTokensSchema>;
export type AuthPolicy = z.infer<typeof authPolicySchema>;

export type Email = z.infer<typeof emailSchema>;
export type Password = z.infer<typeof passwordSchema>;
export type PasswordLoginValue = z.infer<typeof passwordLoginValueSchema>;
export type OtpCode = z.infer<typeof otpCodeSchema>;
export type RecoveryCode = z.infer<typeof recoveryCodeSchema>;
export type Role = z.infer<typeof roleSchema>;
export type UserState = z.infer<typeof userStateSchema>;
export type MfaState = z.infer<typeof mfaStateSchema>;
export type AuthPurpose = z.infer<typeof authPurposeSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;
export type OtpRequest = z.input<typeof otpRequestSchema>;
export type OtpComplete = z.infer<typeof otpCompleteSchema>;
export type PasswordLogin = z.infer<typeof passwordLoginSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type MfaComplete = z.infer<typeof mfaCompleteSchema>;
export type AuthRequestAccepted = z.infer<typeof authRequestAcceptedSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
export type SignOutRequest = z.infer<typeof signOutRequestSchema>;
export type UpdatePreferences = z.infer<typeof updatePreferencesSchema>;
export type MfaEnrollmentRequest = z.infer<typeof mfaEnrollmentRequestSchema>;
export type MfaEnrollmentChallenge = z.infer<
  typeof mfaEnrollmentChallengeSchema
>;
export type MfaEnrollmentConfirm = z.infer<typeof mfaEnrollmentConfirmSchema>;
export type MfaEnrollmentConfirmed = z.infer<
  typeof mfaEnrollmentConfirmedSchema
>;
export type MfaDisable = z.infer<typeof mfaDisableSchema>;
export type StepUpRequest = z.infer<typeof stepUpRequestSchema>;
export type StepUpResult = z.infer<typeof stepUpResultSchema>;

export type Roles = z.infer<typeof rolesSchema>;
