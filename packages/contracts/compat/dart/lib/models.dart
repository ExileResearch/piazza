// GENERATED from generated/openapi.json; edit canonical Zod schemas and regenerate.
// ignore_for_file: invalid_annotation_target
import 'package:freezed_annotation/freezed_annotation.dart';
import 'wire_validation.dart';
part 'models.freezed.dart';
part 'models.g.dart';

enum RegisterRequestLocale {
  @JsonValue("en")
  value0,
  @JsonValue("fr")
  value1,
  @JsonValue("es")
  value2,
  @JsonValue("pa")
  value3,
  @JsonValue("zh")
  value4,
}

@Freezed(fromJson: true, toJson: true)
sealed class RegisterRequest with _$RegisterRequest {
  @JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
  const factory RegisterRequest({
    @JsonKey(disallowNullValue: true) required String email,
    @JsonKey(disallowNullValue: true) required String password,
    @JsonKey(disallowNullValue: true) @Default(RegisterRequestLocale.value0) RegisterRequestLocale locale,
  }) = _RegisterRequest;
  factory RegisterRequest.fromJson(Map<String, dynamic> json) {
    validateWire("RegisterRequest", json);
    return _$RegisterRequestFromJson(json);
  }
}

enum UpdatePreferencesLocale {
  @JsonValue("en")
  value0,
  @JsonValue("fr")
  value1,
  @JsonValue("es")
  value2,
  @JsonValue("pa")
  value3,
  @JsonValue("zh")
  value4,
}

enum UpdatePreferencesTheme {
  @JsonValue("dark")
  value0,
  @JsonValue("light")
  value1,
}

@Freezed(fromJson: true, toJson: true)
sealed class UpdatePreferences with _$UpdatePreferences {
  @JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
  const factory UpdatePreferences({
    @JsonKey(disallowNullValue: true) required int expectedVersion,
    @JsonKey(disallowNullValue: true) UpdatePreferencesLocale? locale,
    @JsonKey(disallowNullValue: true) UpdatePreferencesTheme? theme,
  }) = _UpdatePreferences;
  factory UpdatePreferences.fromJson(Map<String, dynamic> json) {
    validateWire("UpdatePreferences", json);
    return _$UpdatePreferencesFromJson(json);
  }
}

enum ArtifactMetadataScanState {
  @JsonValue("pending")
  value0,
  @JsonValue("clean")
  value1,
  @JsonValue("quarantined")
  value2,
  @JsonValue("rejected")
  value3,
}

@Freezed(fromJson: true, toJson: true)
sealed class ArtifactMetadata with _$ArtifactMetadata {
  @JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
  const factory ArtifactMetadata({
    @JsonKey(disallowNullValue: true) required String id,
    @JsonKey(disallowNullValue: true) required String createdAt,
    @JsonKey(disallowNullValue: true) String? updatedAt,
    @JsonKey(disallowNullValue: true) String? deletedAt,
    @JsonKey(disallowNullValue: true) required int version,
    @JsonKey(disallowNullValue: true) required String mime,
    @JsonKey(disallowNullValue: true) required int sizeBytes,
    @JsonKey(disallowNullValue: true) required ArtifactMetadataScanState scanState,
    @JsonKey(disallowNullValue: true) required bool downloadable,
  }) = _ArtifactMetadata;
  factory ArtifactMetadata.fromJson(Map<String, dynamic> json) {
    validateWire("ArtifactMetadata", json);
    return _$ArtifactMetadataFromJson(json);
  }
}

enum AuthResultSessionIssuedTokensTokenType {
  @JsonValue("Bearer")
  value0,
}

@Freezed(fromJson: true, toJson: true)
sealed class AuthResultSessionIssuedTokens with _$AuthResultSessionIssuedTokens {
  @JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
  const factory AuthResultSessionIssuedTokens({
    @JsonKey(disallowNullValue: true) required String accessToken,
    @JsonKey(disallowNullValue: true) required String refreshToken,
    @JsonKey(disallowNullValue: true) required AuthResultSessionIssuedTokensTokenType tokenType,
    @JsonKey(disallowNullValue: true) required String accessExpiresAt,
    @JsonKey(disallowNullValue: true) required String refreshExpiresAt,
    @JsonKey(disallowNullValue: true) required String sessionId,
  }) = _AuthResultSessionIssuedTokens;
  factory AuthResultSessionIssuedTokens.fromJson(Map<String, dynamic> json) {
    validateWire("AuthResultSessionIssuedTokens", json);
    return _$AuthResultSessionIssuedTokensFromJson(json);
  }
}

enum AuthResultSessionIssuedUserRolesItem {
  @JsonValue("user")
  value0,
  @JsonValue("admin")
  value1,
}

enum AuthResultSessionIssuedUserLocale {
  @JsonValue("en")
  value0,
  @JsonValue("fr")
  value1,
  @JsonValue("es")
  value2,
  @JsonValue("pa")
  value3,
  @JsonValue("zh")
  value4,
}

enum AuthResultSessionIssuedUserTheme {
  @JsonValue("dark")
  value0,
  @JsonValue("light")
  value1,
}

enum AuthResultSessionIssuedUserState {
  @JsonValue("active")
  value0,
  @JsonValue("closed")
  value1,
  @JsonValue("suspended")
  value2,
}

@Freezed(fromJson: true, toJson: true)
sealed class AuthResultSessionIssuedUserMfa with _$AuthResultSessionIssuedUserMfa {
  @JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
  const factory AuthResultSessionIssuedUserMfa({
    @JsonKey(disallowNullValue: true) required bool enabled,
  }) = _AuthResultSessionIssuedUserMfa;
  factory AuthResultSessionIssuedUserMfa.fromJson(Map<String, dynamic> json) {
    validateWire("AuthResultSessionIssuedUserMfa", json);
    return _$AuthResultSessionIssuedUserMfaFromJson(json);
  }
}

@Freezed(fromJson: true, toJson: true)
sealed class AuthResultSessionIssuedUser with _$AuthResultSessionIssuedUser {
  @JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
  const factory AuthResultSessionIssuedUser({
    @JsonKey(disallowNullValue: true) required String id,
    @JsonKey(disallowNullValue: true) required int version,
    @JsonKey(disallowNullValue: true) required String email,
    @JsonKey(disallowNullValue: true) required String emailVerifiedAt,
    @JsonKey(disallowNullValue: true) required List<AuthResultSessionIssuedUserRolesItem> roles,
    @JsonKey(disallowNullValue: true) required AuthResultSessionIssuedUserLocale locale,
    @JsonKey(disallowNullValue: true) required AuthResultSessionIssuedUserTheme theme,
    @JsonKey(disallowNullValue: true) required AuthResultSessionIssuedUserState state,
    @JsonKey(disallowNullValue: true) required AuthResultSessionIssuedUserMfa mfa,
    @JsonKey(disallowNullValue: true) required String createdAt,
  }) = _AuthResultSessionIssuedUser;
  factory AuthResultSessionIssuedUser.fromJson(Map<String, dynamic> json) {
    validateWire("AuthResultSessionIssuedUser", json);
    return _$AuthResultSessionIssuedUserFromJson(json);
  }
}

enum AuthResultChallengeRequiredMethodsItem {
  @JsonValue("totp")
  value0,
  @JsonValue("recovery_code")
  value1,
}

@Freezed(unionKey: "status", fromJson: true, toJson: true)
sealed class AuthResult with _$AuthResult {
  @FreezedUnionValue("session_issued")
  @JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
  const factory AuthResult.session_issued({
    @JsonKey(disallowNullValue: true) required AuthResultSessionIssuedTokens tokens,
    @JsonKey(disallowNullValue: true) required AuthResultSessionIssuedUser user,
  }) = AuthResultSessionIssued;
  @FreezedUnionValue("challenge_required")
  @JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
  const factory AuthResult.challenge_required({
    @JsonKey(disallowNullValue: true) required String challengeId,
    @JsonKey(disallowNullValue: true) required String expiresAt,
    @JsonKey(disallowNullValue: true) required List<AuthResultChallengeRequiredMethodsItem> methods,
  }) = AuthResultChallengeRequired;
  factory AuthResult.fromJson(Map<String, dynamic> json) {
    validateWire("AuthResult", json);
    return _$AuthResultFromJson(json);
  }
}

enum ApiErrorErrorCode {
  @JsonValue("VALIDATION_FAILED")
  value0,
  @JsonValue("UNAUTHENTICATED")
  value1,
  @JsonValue("ACTION_FORBIDDEN")
  value2,
  @JsonValue("NOT_FOUND")
  value3,
  @JsonValue("AUTH_CHALLENGE_INVALID")
  value4,
  @JsonValue("STEP_UP_REQUIRED")
  value5,
  @JsonValue("CREDENTIAL_REVOKED")
  value6,
  @JsonValue("VERSION_CONFLICT")
  value7,
  @JsonValue("SECRET_REPLAY_UNAVAILABLE")
  value8,
  @JsonValue("INVALID_TRANSITION")
  value9,
  @JsonValue("ASSIGNMENT_EXPIRED")
  value10,
  @JsonValue("REVIEW_REQUIRED")
  value11,
  @JsonValue("BUDGET_EXHAUSTED")
  value12,
  @JsonValue("RATE_LIMITED")
  value13,
  @JsonValue("ARTIFACT_QUARANTINED")
  value14,
  @JsonValue("EVENT_CURSOR_EXPIRED")
  value15,
  @JsonValue("DEPENDENCY_UNAVAILABLE")
  value16,
  @JsonValue("INTERNAL_ERROR")
  value17,
}

@Freezed(fromJson: true, toJson: true)
sealed class ApiErrorErrorFieldErrorsItem with _$ApiErrorErrorFieldErrorsItem {
  @JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
  const factory ApiErrorErrorFieldErrorsItem({
    @JsonKey(disallowNullValue: true) required List<Object> path,
    @JsonKey(disallowNullValue: true) required String code,
  }) = _ApiErrorErrorFieldErrorsItem;
  factory ApiErrorErrorFieldErrorsItem.fromJson(Map<String, dynamic> json) {
    validateWire("ApiErrorErrorFieldErrorsItem", json);
    return _$ApiErrorErrorFieldErrorsItemFromJson(json);
  }
}

@Freezed(fromJson: true, toJson: true)
sealed class ApiErrorError with _$ApiErrorError {
  @JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
  const factory ApiErrorError({
    @JsonKey(disallowNullValue: true) required ApiErrorErrorCode code,
    @JsonKey(disallowNullValue: true) required String messageKey,
    @JsonKey(disallowNullValue: true) List<ApiErrorErrorFieldErrorsItem>? fieldErrors,
    @JsonKey(disallowNullValue: true) int? retryAfterSeconds,
  }) = _ApiErrorError;
  factory ApiErrorError.fromJson(Map<String, dynamic> json) {
    validateWire("ApiErrorError", json);
    return _$ApiErrorErrorFromJson(json);
  }
}

@Freezed(fromJson: true, toJson: true)
sealed class ApiErrorMeta with _$ApiErrorMeta {
  @JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
  const factory ApiErrorMeta({
    @JsonKey(disallowNullValue: true) required String correlationId,
  }) = _ApiErrorMeta;
  factory ApiErrorMeta.fromJson(Map<String, dynamic> json) {
    validateWire("ApiErrorMeta", json);
    return _$ApiErrorMetaFromJson(json);
  }
}

@Freezed(fromJson: true, toJson: true)
sealed class ApiError with _$ApiError {
  @JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
  const factory ApiError({
    @JsonKey(disallowNullValue: true) required ApiErrorError error,
    @JsonKey(disallowNullValue: true) required ApiErrorMeta meta,
  }) = _ApiError;
  factory ApiError.fromJson(Map<String, dynamic> json) {
    validateWire("ApiError", json);
    return _$ApiErrorFromJson(json);
  }
}
