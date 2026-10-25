// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_RegisterRequest _$RegisterRequestFromJson(Map<String, dynamic> json) =>
    $checkedCreate('_RegisterRequest', json, ($checkedConvert) {
      $checkKeys(
        json,
        allowedKeys: const ['email', 'password', 'locale'],
        disallowNullValues: const ['email', 'password', 'locale'],
      );
      final val = _RegisterRequest(
        email: $checkedConvert('email', (v) => v as String),
        password: $checkedConvert('password', (v) => v as String),
        locale: $checkedConvert(
          'locale',
          (v) =>
              $enumDecodeNullable(_$RegisterRequestLocaleEnumMap, v) ??
              RegisterRequestLocale.value0,
        ),
      );
      return val;
    });

Map<String, dynamic> _$RegisterRequestToJson(_RegisterRequest instance) =>
    <String, dynamic>{
      'email': instance.email,
      'password': instance.password,
      'locale': _$RegisterRequestLocaleEnumMap[instance.locale]!,
    };

const _$RegisterRequestLocaleEnumMap = {
  RegisterRequestLocale.value0: 'en',
  RegisterRequestLocale.value1: 'fr',
  RegisterRequestLocale.value2: 'es',
  RegisterRequestLocale.value3: 'pa',
  RegisterRequestLocale.value4: 'zh',
};

_UpdatePreferences _$UpdatePreferencesFromJson(Map<String, dynamic> json) =>
    $checkedCreate('_UpdatePreferences', json, ($checkedConvert) {
      $checkKeys(
        json,
        allowedKeys: const ['expectedVersion', 'locale', 'theme'],
        disallowNullValues: const ['expectedVersion', 'locale', 'theme'],
      );
      final val = _UpdatePreferences(
        expectedVersion: $checkedConvert(
          'expectedVersion',
          (v) => (v as num).toInt(),
        ),
        locale: $checkedConvert(
          'locale',
          (v) => $enumDecodeNullable(_$UpdatePreferencesLocaleEnumMap, v),
        ),
        theme: $checkedConvert(
          'theme',
          (v) => $enumDecodeNullable(_$UpdatePreferencesThemeEnumMap, v),
        ),
      );
      return val;
    });

Map<String, dynamic> _$UpdatePreferencesToJson(_UpdatePreferences instance) =>
    <String, dynamic>{
      'expectedVersion': instance.expectedVersion,
      'locale': ?_$UpdatePreferencesLocaleEnumMap[instance.locale],
      'theme': ?_$UpdatePreferencesThemeEnumMap[instance.theme],
    };

const _$UpdatePreferencesLocaleEnumMap = {
  UpdatePreferencesLocale.value0: 'en',
  UpdatePreferencesLocale.value1: 'fr',
  UpdatePreferencesLocale.value2: 'es',
  UpdatePreferencesLocale.value3: 'pa',
  UpdatePreferencesLocale.value4: 'zh',
};

const _$UpdatePreferencesThemeEnumMap = {
  UpdatePreferencesTheme.value0: 'dark',
  UpdatePreferencesTheme.value1: 'light',
};

_ArtifactMetadata _$ArtifactMetadataFromJson(Map<String, dynamic> json) =>
    $checkedCreate('_ArtifactMetadata', json, ($checkedConvert) {
      $checkKeys(
        json,
        allowedKeys: const [
          'id',
          'createdAt',
          'updatedAt',
          'deletedAt',
          'version',
          'mime',
          'sizeBytes',
          'scanState',
          'downloadable',
        ],
        disallowNullValues: const [
          'id',
          'createdAt',
          'updatedAt',
          'deletedAt',
          'version',
          'mime',
          'sizeBytes',
          'scanState',
          'downloadable',
        ],
      );
      final val = _ArtifactMetadata(
        id: $checkedConvert('id', (v) => v as String),
        createdAt: $checkedConvert('createdAt', (v) => v as String),
        updatedAt: $checkedConvert('updatedAt', (v) => v as String?),
        deletedAt: $checkedConvert('deletedAt', (v) => v as String?),
        version: $checkedConvert('version', (v) => (v as num).toInt()),
        mime: $checkedConvert('mime', (v) => v as String),
        sizeBytes: $checkedConvert('sizeBytes', (v) => (v as num).toInt()),
        scanState: $checkedConvert(
          'scanState',
          (v) => $enumDecode(_$ArtifactMetadataScanStateEnumMap, v),
        ),
        downloadable: $checkedConvert('downloadable', (v) => v as bool),
      );
      return val;
    });

Map<String, dynamic> _$ArtifactMetadataToJson(_ArtifactMetadata instance) =>
    <String, dynamic>{
      'id': instance.id,
      'createdAt': instance.createdAt,
      'updatedAt': ?instance.updatedAt,
      'deletedAt': ?instance.deletedAt,
      'version': instance.version,
      'mime': instance.mime,
      'sizeBytes': instance.sizeBytes,
      'scanState': _$ArtifactMetadataScanStateEnumMap[instance.scanState]!,
      'downloadable': instance.downloadable,
    };

const _$ArtifactMetadataScanStateEnumMap = {
  ArtifactMetadataScanState.value0: 'pending',
  ArtifactMetadataScanState.value1: 'clean',
  ArtifactMetadataScanState.value2: 'quarantined',
  ArtifactMetadataScanState.value3: 'rejected',
};

_AuthResultSessionIssuedTokens _$AuthResultSessionIssuedTokensFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('_AuthResultSessionIssuedTokens', json, ($checkedConvert) {
  $checkKeys(
    json,
    allowedKeys: const [
      'accessToken',
      'refreshToken',
      'tokenType',
      'accessExpiresAt',
      'refreshExpiresAt',
      'sessionId',
    ],
    disallowNullValues: const [
      'accessToken',
      'refreshToken',
      'tokenType',
      'accessExpiresAt',
      'refreshExpiresAt',
      'sessionId',
    ],
  );
  final val = _AuthResultSessionIssuedTokens(
    accessToken: $checkedConvert('accessToken', (v) => v as String),
    refreshToken: $checkedConvert('refreshToken', (v) => v as String),
    tokenType: $checkedConvert(
      'tokenType',
      (v) => $enumDecode(_$AuthResultSessionIssuedTokensTokenTypeEnumMap, v),
    ),
    accessExpiresAt: $checkedConvert('accessExpiresAt', (v) => v as String),
    refreshExpiresAt: $checkedConvert('refreshExpiresAt', (v) => v as String),
    sessionId: $checkedConvert('sessionId', (v) => v as String),
  );
  return val;
});

Map<String, dynamic> _$AuthResultSessionIssuedTokensToJson(
  _AuthResultSessionIssuedTokens instance,
) => <String, dynamic>{
  'accessToken': instance.accessToken,
  'refreshToken': instance.refreshToken,
  'tokenType':
      _$AuthResultSessionIssuedTokensTokenTypeEnumMap[instance.tokenType]!,
  'accessExpiresAt': instance.accessExpiresAt,
  'refreshExpiresAt': instance.refreshExpiresAt,
  'sessionId': instance.sessionId,
};

const _$AuthResultSessionIssuedTokensTokenTypeEnumMap = {
  AuthResultSessionIssuedTokensTokenType.value0: 'Bearer',
};

_AuthResultSessionIssuedUserMfa _$AuthResultSessionIssuedUserMfaFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('_AuthResultSessionIssuedUserMfa', json, ($checkedConvert) {
  $checkKeys(
    json,
    allowedKeys: const ['enabled'],
    disallowNullValues: const ['enabled'],
  );
  final val = _AuthResultSessionIssuedUserMfa(
    enabled: $checkedConvert('enabled', (v) => v as bool),
  );
  return val;
});

Map<String, dynamic> _$AuthResultSessionIssuedUserMfaToJson(
  _AuthResultSessionIssuedUserMfa instance,
) => <String, dynamic>{'enabled': instance.enabled};

_AuthResultSessionIssuedUser _$AuthResultSessionIssuedUserFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('_AuthResultSessionIssuedUser', json, ($checkedConvert) {
  $checkKeys(
    json,
    allowedKeys: const [
      'id',
      'version',
      'email',
      'emailVerifiedAt',
      'roles',
      'locale',
      'theme',
      'state',
      'mfa',
      'createdAt',
    ],
    disallowNullValues: const [
      'id',
      'version',
      'email',
      'emailVerifiedAt',
      'roles',
      'locale',
      'theme',
      'state',
      'mfa',
      'createdAt',
    ],
  );
  final val = _AuthResultSessionIssuedUser(
    id: $checkedConvert('id', (v) => v as String),
    version: $checkedConvert('version', (v) => (v as num).toInt()),
    email: $checkedConvert('email', (v) => v as String),
    emailVerifiedAt: $checkedConvert('emailVerifiedAt', (v) => v as String),
    roles: $checkedConvert(
      'roles',
      (v) => (v as List<dynamic>)
          .map(
            (e) =>
                $enumDecode(_$AuthResultSessionIssuedUserRolesItemEnumMap, e),
          )
          .toList(),
    ),
    locale: $checkedConvert(
      'locale',
      (v) => $enumDecode(_$AuthResultSessionIssuedUserLocaleEnumMap, v),
    ),
    theme: $checkedConvert(
      'theme',
      (v) => $enumDecode(_$AuthResultSessionIssuedUserThemeEnumMap, v),
    ),
    state: $checkedConvert(
      'state',
      (v) => $enumDecode(_$AuthResultSessionIssuedUserStateEnumMap, v),
    ),
    mfa: $checkedConvert(
      'mfa',
      (v) => AuthResultSessionIssuedUserMfa.fromJson(v as Map<String, dynamic>),
    ),
    createdAt: $checkedConvert('createdAt', (v) => v as String),
  );
  return val;
});

Map<String, dynamic> _$AuthResultSessionIssuedUserToJson(
  _AuthResultSessionIssuedUser instance,
) => <String, dynamic>{
  'id': instance.id,
  'version': instance.version,
  'email': instance.email,
  'emailVerifiedAt': instance.emailVerifiedAt,
  'roles': instance.roles
      .map((e) => _$AuthResultSessionIssuedUserRolesItemEnumMap[e]!)
      .toList(),
  'locale': _$AuthResultSessionIssuedUserLocaleEnumMap[instance.locale]!,
  'theme': _$AuthResultSessionIssuedUserThemeEnumMap[instance.theme]!,
  'state': _$AuthResultSessionIssuedUserStateEnumMap[instance.state]!,
  'mfa': instance.mfa.toJson(),
  'createdAt': instance.createdAt,
};

const _$AuthResultSessionIssuedUserRolesItemEnumMap = {
  AuthResultSessionIssuedUserRolesItem.value0: 'user',
  AuthResultSessionIssuedUserRolesItem.value1: 'admin',
};

const _$AuthResultSessionIssuedUserLocaleEnumMap = {
  AuthResultSessionIssuedUserLocale.value0: 'en',
  AuthResultSessionIssuedUserLocale.value1: 'fr',
  AuthResultSessionIssuedUserLocale.value2: 'es',
  AuthResultSessionIssuedUserLocale.value3: 'pa',
  AuthResultSessionIssuedUserLocale.value4: 'zh',
};

const _$AuthResultSessionIssuedUserThemeEnumMap = {
  AuthResultSessionIssuedUserTheme.value0: 'dark',
  AuthResultSessionIssuedUserTheme.value1: 'light',
};

const _$AuthResultSessionIssuedUserStateEnumMap = {
  AuthResultSessionIssuedUserState.value0: 'active',
  AuthResultSessionIssuedUserState.value1: 'closed',
  AuthResultSessionIssuedUserState.value2: 'suspended',
};

AuthResultSessionIssued _$AuthResultSessionIssuedFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('AuthResultSessionIssued', json, ($checkedConvert) {
  $checkKeys(
    json,
    allowedKeys: const ['tokens', 'user', 'status'],
    disallowNullValues: const ['tokens', 'user'],
  );
  final val = AuthResultSessionIssued(
    tokens: $checkedConvert(
      'tokens',
      (v) => AuthResultSessionIssuedTokens.fromJson(v as Map<String, dynamic>),
    ),
    user: $checkedConvert(
      'user',
      (v) => AuthResultSessionIssuedUser.fromJson(v as Map<String, dynamic>),
    ),
    $type: $checkedConvert('status', (v) => v as String?),
  );
  return val;
}, fieldKeyMap: const {r'$type': 'status'});

Map<String, dynamic> _$AuthResultSessionIssuedToJson(
  AuthResultSessionIssued instance,
) => <String, dynamic>{
  'tokens': instance.tokens.toJson(),
  'user': instance.user.toJson(),
  'status': instance.$type,
};

AuthResultChallengeRequired _$AuthResultChallengeRequiredFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('AuthResultChallengeRequired', json, ($checkedConvert) {
  $checkKeys(
    json,
    allowedKeys: const ['challengeId', 'expiresAt', 'methods', 'status'],
    disallowNullValues: const ['challengeId', 'expiresAt', 'methods'],
  );
  final val = AuthResultChallengeRequired(
    challengeId: $checkedConvert('challengeId', (v) => v as String),
    expiresAt: $checkedConvert('expiresAt', (v) => v as String),
    methods: $checkedConvert(
      'methods',
      (v) => (v as List<dynamic>)
          .map(
            (e) =>
                $enumDecode(_$AuthResultChallengeRequiredMethodsItemEnumMap, e),
          )
          .toList(),
    ),
    $type: $checkedConvert('status', (v) => v as String?),
  );
  return val;
}, fieldKeyMap: const {r'$type': 'status'});

Map<String, dynamic> _$AuthResultChallengeRequiredToJson(
  AuthResultChallengeRequired instance,
) => <String, dynamic>{
  'challengeId': instance.challengeId,
  'expiresAt': instance.expiresAt,
  'methods': instance.methods
      .map((e) => _$AuthResultChallengeRequiredMethodsItemEnumMap[e]!)
      .toList(),
  'status': instance.$type,
};

const _$AuthResultChallengeRequiredMethodsItemEnumMap = {
  AuthResultChallengeRequiredMethodsItem.value0: 'totp',
  AuthResultChallengeRequiredMethodsItem.value1: 'recovery_code',
};

_ApiErrorErrorFieldErrorsItem _$ApiErrorErrorFieldErrorsItemFromJson(
  Map<String, dynamic> json,
) => $checkedCreate('_ApiErrorErrorFieldErrorsItem', json, ($checkedConvert) {
  $checkKeys(
    json,
    allowedKeys: const ['path', 'code'],
    disallowNullValues: const ['path', 'code'],
  );
  final val = _ApiErrorErrorFieldErrorsItem(
    path: $checkedConvert(
      'path',
      (v) => (v as List<dynamic>).map((e) => e as Object).toList(),
    ),
    code: $checkedConvert('code', (v) => v as String),
  );
  return val;
});

Map<String, dynamic> _$ApiErrorErrorFieldErrorsItemToJson(
  _ApiErrorErrorFieldErrorsItem instance,
) => <String, dynamic>{'path': instance.path, 'code': instance.code};

_ApiErrorError _$ApiErrorErrorFromJson(Map<String, dynamic> json) =>
    $checkedCreate('_ApiErrorError', json, ($checkedConvert) {
      $checkKeys(
        json,
        allowedKeys: const [
          'code',
          'messageKey',
          'fieldErrors',
          'retryAfterSeconds',
        ],
        disallowNullValues: const [
          'code',
          'messageKey',
          'fieldErrors',
          'retryAfterSeconds',
        ],
      );
      final val = _ApiErrorError(
        code: $checkedConvert(
          'code',
          (v) => $enumDecode(_$ApiErrorErrorCodeEnumMap, v),
        ),
        messageKey: $checkedConvert('messageKey', (v) => v as String),
        fieldErrors: $checkedConvert(
          'fieldErrors',
          (v) => (v as List<dynamic>?)
              ?.map(
                (e) => ApiErrorErrorFieldErrorsItem.fromJson(
                  e as Map<String, dynamic>,
                ),
              )
              .toList(),
        ),
        retryAfterSeconds: $checkedConvert(
          'retryAfterSeconds',
          (v) => (v as num?)?.toInt(),
        ),
      );
      return val;
    });

Map<String, dynamic> _$ApiErrorErrorToJson(_ApiErrorError instance) =>
    <String, dynamic>{
      'code': _$ApiErrorErrorCodeEnumMap[instance.code]!,
      'messageKey': instance.messageKey,
      'fieldErrors': ?instance.fieldErrors?.map((e) => e.toJson()).toList(),
      'retryAfterSeconds': ?instance.retryAfterSeconds,
    };

const _$ApiErrorErrorCodeEnumMap = {
  ApiErrorErrorCode.value0: 'VALIDATION_FAILED',
  ApiErrorErrorCode.value1: 'UNAUTHENTICATED',
  ApiErrorErrorCode.value2: 'ACTION_FORBIDDEN',
  ApiErrorErrorCode.value3: 'NOT_FOUND',
  ApiErrorErrorCode.value4: 'AUTH_CHALLENGE_INVALID',
  ApiErrorErrorCode.value5: 'STEP_UP_REQUIRED',
  ApiErrorErrorCode.value6: 'CREDENTIAL_REVOKED',
  ApiErrorErrorCode.value7: 'VERSION_CONFLICT',
  ApiErrorErrorCode.value8: 'SECRET_REPLAY_UNAVAILABLE',
  ApiErrorErrorCode.value9: 'INVALID_TRANSITION',
  ApiErrorErrorCode.value10: 'ASSIGNMENT_EXPIRED',
  ApiErrorErrorCode.value11: 'REVIEW_REQUIRED',
  ApiErrorErrorCode.value12: 'BUDGET_EXHAUSTED',
  ApiErrorErrorCode.value13: 'RATE_LIMITED',
  ApiErrorErrorCode.value14: 'ARTIFACT_QUARANTINED',
  ApiErrorErrorCode.value15: 'EVENT_CURSOR_EXPIRED',
  ApiErrorErrorCode.value16: 'DEPENDENCY_UNAVAILABLE',
  ApiErrorErrorCode.value17: 'INTERNAL_ERROR',
};

_ApiErrorMeta _$ApiErrorMetaFromJson(Map<String, dynamic> json) =>
    $checkedCreate('_ApiErrorMeta', json, ($checkedConvert) {
      $checkKeys(
        json,
        allowedKeys: const ['correlationId'],
        disallowNullValues: const ['correlationId'],
      );
      final val = _ApiErrorMeta(
        correlationId: $checkedConvert('correlationId', (v) => v as String),
      );
      return val;
    });

Map<String, dynamic> _$ApiErrorMetaToJson(_ApiErrorMeta instance) =>
    <String, dynamic>{'correlationId': instance.correlationId};

_ApiError _$ApiErrorFromJson(Map<String, dynamic> json) =>
    $checkedCreate('_ApiError', json, ($checkedConvert) {
      $checkKeys(
        json,
        allowedKeys: const ['error', 'meta'],
        disallowNullValues: const ['error', 'meta'],
      );
      final val = _ApiError(
        error: $checkedConvert(
          'error',
          (v) => ApiErrorError.fromJson(v as Map<String, dynamic>),
        ),
        meta: $checkedConvert(
          'meta',
          (v) => ApiErrorMeta.fromJson(v as Map<String, dynamic>),
        ),
      );
      return val;
    });

Map<String, dynamic> _$ApiErrorToJson(_ApiError instance) => <String, dynamic>{
  'error': instance.error.toJson(),
  'meta': instance.meta.toJson(),
};
