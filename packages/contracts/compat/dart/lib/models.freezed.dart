// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$RegisterRequest {

@JsonKey(disallowNullValue: true) String get email;@JsonKey(disallowNullValue: true) String get password;@JsonKey(disallowNullValue: true) RegisterRequestLocale get locale;
/// Create a copy of RegisterRequest
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$RegisterRequestCopyWith<RegisterRequest> get copyWith => _$RegisterRequestCopyWithImpl<RegisterRequest>(this as RegisterRequest, _$identity);

  /// Serializes this RegisterRequest to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as RegisterRequest;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is RegisterRequest&&(identical(other.email, _this.email) || other.email == _this.email)&&(identical(other.password, _this.password) || other.password == _this.password)&&(identical(other.locale, _this.locale) || other.locale == _this.locale));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as RegisterRequest;
  return Object.hash(runtimeType,_this.email,_this.password,_this.locale);
}

@override
String toString() {
  final _this = this as RegisterRequest;
  return 'RegisterRequest(email: ${_this.email}, password: ${_this.password}, locale: ${_this.locale})';
}


}

/// @nodoc
abstract mixin class $RegisterRequestCopyWith<$Res>  {
  factory $RegisterRequestCopyWith(RegisterRequest value, $Res Function(RegisterRequest) _then) = _$RegisterRequestCopyWithImpl;
@useResult
$Res call({
@JsonKey(disallowNullValue: true) String email,@JsonKey(disallowNullValue: true) String password,@JsonKey(disallowNullValue: true) RegisterRequestLocale locale
});




}
/// @nodoc
class _$RegisterRequestCopyWithImpl<$Res>
    implements $RegisterRequestCopyWith<$Res> {
  _$RegisterRequestCopyWithImpl(this._self, this._then);

  final RegisterRequest _self;
  final $Res Function(RegisterRequest) _then;

/// Create a copy of RegisterRequest
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? email = null,Object? password = null,Object? locale = null,}) {
  return _then(RegisterRequest(
email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,password: null == password ? _self.password : password // ignore: cast_nullable_to_non_nullable
as String,locale: null == locale ? _self.locale : locale // ignore: cast_nullable_to_non_nullable
as RegisterRequestLocale,
  ));
}

}


/// Adds pattern-matching-related methods to [RegisterRequest].
extension RegisterRequestPatterns on RegisterRequest {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _RegisterRequest value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _RegisterRequest() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _RegisterRequest value)  $default,){
final _that = this;
switch (_that) {
case _RegisterRequest():
return $default(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _RegisterRequest value)?  $default,){
final _that = this;
switch (_that) {
case _RegisterRequest() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  String email, @JsonKey(disallowNullValue: true)  String password, @JsonKey(disallowNullValue: true)  RegisterRequestLocale locale)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _RegisterRequest() when $default != null:
return $default(_that.email,_that.password,_that.locale);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  String email, @JsonKey(disallowNullValue: true)  String password, @JsonKey(disallowNullValue: true)  RegisterRequestLocale locale)  $default,) {final _that = this;
switch (_that) {
case _RegisterRequest():
return $default(_that.email,_that.password,_that.locale);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(disallowNullValue: true)  String email, @JsonKey(disallowNullValue: true)  String password, @JsonKey(disallowNullValue: true)  RegisterRequestLocale locale)?  $default,) {final _that = this;
switch (_that) {
case _RegisterRequest() when $default != null:
return $default(_that.email,_that.password,_that.locale);case _:
  return null;

}
}

}

/// @nodoc

@JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
class _RegisterRequest implements RegisterRequest {
  const _RegisterRequest({@JsonKey(disallowNullValue: true) required this.email, @JsonKey(disallowNullValue: true) required this.password, @JsonKey(disallowNullValue: true) this.locale = RegisterRequestLocale.value0});
  factory _RegisterRequest.fromJson(Map<String, dynamic> json) => _$RegisterRequestFromJson(json);

@override@JsonKey(disallowNullValue: true) final  String email;
@override@JsonKey(disallowNullValue: true) final  String password;
@override@JsonKey(disallowNullValue: true) final  RegisterRequestLocale locale;

/// Create a copy of RegisterRequest
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$RegisterRequestCopyWith<_RegisterRequest> get copyWith => __$RegisterRequestCopyWithImpl<_RegisterRequest>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$RegisterRequestToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _RegisterRequest&&(identical(other.email, email) || other.email == email)&&(identical(other.password, password) || other.password == password)&&(identical(other.locale, locale) || other.locale == locale));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,email,password,locale);
}

@override
String toString() {
    return 'RegisterRequest(email: $email, password: $password, locale: $locale)';
}


}

/// @nodoc
abstract mixin class _$RegisterRequestCopyWith<$Res> implements $RegisterRequestCopyWith<$Res> {
  factory _$RegisterRequestCopyWith(_RegisterRequest value, $Res Function(_RegisterRequest) _then) = __$RegisterRequestCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(disallowNullValue: true) String email,@JsonKey(disallowNullValue: true) String password,@JsonKey(disallowNullValue: true) RegisterRequestLocale locale
});




}
/// @nodoc
class __$RegisterRequestCopyWithImpl<$Res>
    implements _$RegisterRequestCopyWith<$Res> {
  __$RegisterRequestCopyWithImpl(this._self, this._then);

  final _RegisterRequest _self;
  final $Res Function(_RegisterRequest) _then;

/// Create a copy of RegisterRequest
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? email = null,Object? password = null,Object? locale = null,}) {
  return _then(_RegisterRequest(
email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,password: null == password ? _self.password : password // ignore: cast_nullable_to_non_nullable
as String,locale: null == locale ? _self.locale : locale // ignore: cast_nullable_to_non_nullable
as RegisterRequestLocale,
  ));
}


}


/// @nodoc
mixin _$UpdatePreferences {

@JsonKey(disallowNullValue: true) int get expectedVersion;@JsonKey(disallowNullValue: true) UpdatePreferencesLocale? get locale;@JsonKey(disallowNullValue: true) UpdatePreferencesTheme? get theme;
/// Create a copy of UpdatePreferences
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$UpdatePreferencesCopyWith<UpdatePreferences> get copyWith => _$UpdatePreferencesCopyWithImpl<UpdatePreferences>(this as UpdatePreferences, _$identity);

  /// Serializes this UpdatePreferences to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as UpdatePreferences;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is UpdatePreferences&&(identical(other.expectedVersion, _this.expectedVersion) || other.expectedVersion == _this.expectedVersion)&&(identical(other.locale, _this.locale) || other.locale == _this.locale)&&(identical(other.theme, _this.theme) || other.theme == _this.theme));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as UpdatePreferences;
  return Object.hash(runtimeType,_this.expectedVersion,_this.locale,_this.theme);
}

@override
String toString() {
  final _this = this as UpdatePreferences;
  return 'UpdatePreferences(expectedVersion: ${_this.expectedVersion}, locale: ${_this.locale}, theme: ${_this.theme})';
}


}

/// @nodoc
abstract mixin class $UpdatePreferencesCopyWith<$Res>  {
  factory $UpdatePreferencesCopyWith(UpdatePreferences value, $Res Function(UpdatePreferences) _then) = _$UpdatePreferencesCopyWithImpl;
@useResult
$Res call({
@JsonKey(disallowNullValue: true) int expectedVersion,@JsonKey(disallowNullValue: true) UpdatePreferencesLocale? locale,@JsonKey(disallowNullValue: true) UpdatePreferencesTheme? theme
});




}
/// @nodoc
class _$UpdatePreferencesCopyWithImpl<$Res>
    implements $UpdatePreferencesCopyWith<$Res> {
  _$UpdatePreferencesCopyWithImpl(this._self, this._then);

  final UpdatePreferences _self;
  final $Res Function(UpdatePreferences) _then;

/// Create a copy of UpdatePreferences
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? expectedVersion = null,Object? locale = freezed,Object? theme = freezed,}) {
  return _then(UpdatePreferences(
expectedVersion: null == expectedVersion ? _self.expectedVersion : expectedVersion // ignore: cast_nullable_to_non_nullable
as int,locale: freezed == locale ? _self.locale : locale // ignore: cast_nullable_to_non_nullable
as UpdatePreferencesLocale?,theme: freezed == theme ? _self.theme : theme // ignore: cast_nullable_to_non_nullable
as UpdatePreferencesTheme?,
  ));
}

}


/// Adds pattern-matching-related methods to [UpdatePreferences].
extension UpdatePreferencesPatterns on UpdatePreferences {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _UpdatePreferences value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _UpdatePreferences() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _UpdatePreferences value)  $default,){
final _that = this;
switch (_that) {
case _UpdatePreferences():
return $default(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _UpdatePreferences value)?  $default,){
final _that = this;
switch (_that) {
case _UpdatePreferences() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  int expectedVersion, @JsonKey(disallowNullValue: true)  UpdatePreferencesLocale? locale, @JsonKey(disallowNullValue: true)  UpdatePreferencesTheme? theme)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _UpdatePreferences() when $default != null:
return $default(_that.expectedVersion,_that.locale,_that.theme);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  int expectedVersion, @JsonKey(disallowNullValue: true)  UpdatePreferencesLocale? locale, @JsonKey(disallowNullValue: true)  UpdatePreferencesTheme? theme)  $default,) {final _that = this;
switch (_that) {
case _UpdatePreferences():
return $default(_that.expectedVersion,_that.locale,_that.theme);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(disallowNullValue: true)  int expectedVersion, @JsonKey(disallowNullValue: true)  UpdatePreferencesLocale? locale, @JsonKey(disallowNullValue: true)  UpdatePreferencesTheme? theme)?  $default,) {final _that = this;
switch (_that) {
case _UpdatePreferences() when $default != null:
return $default(_that.expectedVersion,_that.locale,_that.theme);case _:
  return null;

}
}

}

/// @nodoc

@JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
class _UpdatePreferences implements UpdatePreferences {
  const _UpdatePreferences({@JsonKey(disallowNullValue: true) required this.expectedVersion, @JsonKey(disallowNullValue: true) this.locale, @JsonKey(disallowNullValue: true) this.theme});
  factory _UpdatePreferences.fromJson(Map<String, dynamic> json) => _$UpdatePreferencesFromJson(json);

@override@JsonKey(disallowNullValue: true) final  int expectedVersion;
@override@JsonKey(disallowNullValue: true) final  UpdatePreferencesLocale? locale;
@override@JsonKey(disallowNullValue: true) final  UpdatePreferencesTheme? theme;

/// Create a copy of UpdatePreferences
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$UpdatePreferencesCopyWith<_UpdatePreferences> get copyWith => __$UpdatePreferencesCopyWithImpl<_UpdatePreferences>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$UpdatePreferencesToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _UpdatePreferences&&(identical(other.expectedVersion, expectedVersion) || other.expectedVersion == expectedVersion)&&(identical(other.locale, locale) || other.locale == locale)&&(identical(other.theme, theme) || other.theme == theme));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,expectedVersion,locale,theme);
}

@override
String toString() {
    return 'UpdatePreferences(expectedVersion: $expectedVersion, locale: $locale, theme: $theme)';
}


}

/// @nodoc
abstract mixin class _$UpdatePreferencesCopyWith<$Res> implements $UpdatePreferencesCopyWith<$Res> {
  factory _$UpdatePreferencesCopyWith(_UpdatePreferences value, $Res Function(_UpdatePreferences) _then) = __$UpdatePreferencesCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(disallowNullValue: true) int expectedVersion,@JsonKey(disallowNullValue: true) UpdatePreferencesLocale? locale,@JsonKey(disallowNullValue: true) UpdatePreferencesTheme? theme
});




}
/// @nodoc
class __$UpdatePreferencesCopyWithImpl<$Res>
    implements _$UpdatePreferencesCopyWith<$Res> {
  __$UpdatePreferencesCopyWithImpl(this._self, this._then);

  final _UpdatePreferences _self;
  final $Res Function(_UpdatePreferences) _then;

/// Create a copy of UpdatePreferences
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? expectedVersion = null,Object? locale = freezed,Object? theme = freezed,}) {
  return _then(_UpdatePreferences(
expectedVersion: null == expectedVersion ? _self.expectedVersion : expectedVersion // ignore: cast_nullable_to_non_nullable
as int,locale: freezed == locale ? _self.locale : locale // ignore: cast_nullable_to_non_nullable
as UpdatePreferencesLocale?,theme: freezed == theme ? _self.theme : theme // ignore: cast_nullable_to_non_nullable
as UpdatePreferencesTheme?,
  ));
}


}


/// @nodoc
mixin _$ArtifactMetadata {

@JsonKey(disallowNullValue: true) String get id;@JsonKey(disallowNullValue: true) String get createdAt;@JsonKey(disallowNullValue: true) String? get updatedAt;@JsonKey(disallowNullValue: true) String? get deletedAt;@JsonKey(disallowNullValue: true) int get version;@JsonKey(disallowNullValue: true) String get mime;@JsonKey(disallowNullValue: true) int get sizeBytes;@JsonKey(disallowNullValue: true) ArtifactMetadataScanState get scanState;@JsonKey(disallowNullValue: true) bool get downloadable;
/// Create a copy of ArtifactMetadata
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ArtifactMetadataCopyWith<ArtifactMetadata> get copyWith => _$ArtifactMetadataCopyWithImpl<ArtifactMetadata>(this as ArtifactMetadata, _$identity);

  /// Serializes this ArtifactMetadata to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as ArtifactMetadata;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ArtifactMetadata&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.createdAt, _this.createdAt) || other.createdAt == _this.createdAt)&&(identical(other.updatedAt, _this.updatedAt) || other.updatedAt == _this.updatedAt)&&(identical(other.deletedAt, _this.deletedAt) || other.deletedAt == _this.deletedAt)&&(identical(other.version, _this.version) || other.version == _this.version)&&(identical(other.mime, _this.mime) || other.mime == _this.mime)&&(identical(other.sizeBytes, _this.sizeBytes) || other.sizeBytes == _this.sizeBytes)&&(identical(other.scanState, _this.scanState) || other.scanState == _this.scanState)&&(identical(other.downloadable, _this.downloadable) || other.downloadable == _this.downloadable));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as ArtifactMetadata;
  return Object.hash(runtimeType,_this.id,_this.createdAt,_this.updatedAt,_this.deletedAt,_this.version,_this.mime,_this.sizeBytes,_this.scanState,_this.downloadable);
}

@override
String toString() {
  final _this = this as ArtifactMetadata;
  return 'ArtifactMetadata(id: ${_this.id}, createdAt: ${_this.createdAt}, updatedAt: ${_this.updatedAt}, deletedAt: ${_this.deletedAt}, version: ${_this.version}, mime: ${_this.mime}, sizeBytes: ${_this.sizeBytes}, scanState: ${_this.scanState}, downloadable: ${_this.downloadable})';
}


}

/// @nodoc
abstract mixin class $ArtifactMetadataCopyWith<$Res>  {
  factory $ArtifactMetadataCopyWith(ArtifactMetadata value, $Res Function(ArtifactMetadata) _then) = _$ArtifactMetadataCopyWithImpl;
@useResult
$Res call({
@JsonKey(disallowNullValue: true) String id,@JsonKey(disallowNullValue: true) String createdAt,@JsonKey(disallowNullValue: true) String? updatedAt,@JsonKey(disallowNullValue: true) String? deletedAt,@JsonKey(disallowNullValue: true) int version,@JsonKey(disallowNullValue: true) String mime,@JsonKey(disallowNullValue: true) int sizeBytes,@JsonKey(disallowNullValue: true) ArtifactMetadataScanState scanState,@JsonKey(disallowNullValue: true) bool downloadable
});




}
/// @nodoc
class _$ArtifactMetadataCopyWithImpl<$Res>
    implements $ArtifactMetadataCopyWith<$Res> {
  _$ArtifactMetadataCopyWithImpl(this._self, this._then);

  final ArtifactMetadata _self;
  final $Res Function(ArtifactMetadata) _then;

/// Create a copy of ArtifactMetadata
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? createdAt = null,Object? updatedAt = freezed,Object? deletedAt = freezed,Object? version = null,Object? mime = null,Object? sizeBytes = null,Object? scanState = null,Object? downloadable = null,}) {
  return _then(ArtifactMetadata(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as String?,deletedAt: freezed == deletedAt ? _self.deletedAt : deletedAt // ignore: cast_nullable_to_non_nullable
as String?,version: null == version ? _self.version : version // ignore: cast_nullable_to_non_nullable
as int,mime: null == mime ? _self.mime : mime // ignore: cast_nullable_to_non_nullable
as String,sizeBytes: null == sizeBytes ? _self.sizeBytes : sizeBytes // ignore: cast_nullable_to_non_nullable
as int,scanState: null == scanState ? _self.scanState : scanState // ignore: cast_nullable_to_non_nullable
as ArtifactMetadataScanState,downloadable: null == downloadable ? _self.downloadable : downloadable // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [ArtifactMetadata].
extension ArtifactMetadataPatterns on ArtifactMetadata {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ArtifactMetadata value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ArtifactMetadata() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ArtifactMetadata value)  $default,){
final _that = this;
switch (_that) {
case _ArtifactMetadata():
return $default(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ArtifactMetadata value)?  $default,){
final _that = this;
switch (_that) {
case _ArtifactMetadata() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  String id, @JsonKey(disallowNullValue: true)  String createdAt, @JsonKey(disallowNullValue: true)  String? updatedAt, @JsonKey(disallowNullValue: true)  String? deletedAt, @JsonKey(disallowNullValue: true)  int version, @JsonKey(disallowNullValue: true)  String mime, @JsonKey(disallowNullValue: true)  int sizeBytes, @JsonKey(disallowNullValue: true)  ArtifactMetadataScanState scanState, @JsonKey(disallowNullValue: true)  bool downloadable)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ArtifactMetadata() when $default != null:
return $default(_that.id,_that.createdAt,_that.updatedAt,_that.deletedAt,_that.version,_that.mime,_that.sizeBytes,_that.scanState,_that.downloadable);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  String id, @JsonKey(disallowNullValue: true)  String createdAt, @JsonKey(disallowNullValue: true)  String? updatedAt, @JsonKey(disallowNullValue: true)  String? deletedAt, @JsonKey(disallowNullValue: true)  int version, @JsonKey(disallowNullValue: true)  String mime, @JsonKey(disallowNullValue: true)  int sizeBytes, @JsonKey(disallowNullValue: true)  ArtifactMetadataScanState scanState, @JsonKey(disallowNullValue: true)  bool downloadable)  $default,) {final _that = this;
switch (_that) {
case _ArtifactMetadata():
return $default(_that.id,_that.createdAt,_that.updatedAt,_that.deletedAt,_that.version,_that.mime,_that.sizeBytes,_that.scanState,_that.downloadable);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(disallowNullValue: true)  String id, @JsonKey(disallowNullValue: true)  String createdAt, @JsonKey(disallowNullValue: true)  String? updatedAt, @JsonKey(disallowNullValue: true)  String? deletedAt, @JsonKey(disallowNullValue: true)  int version, @JsonKey(disallowNullValue: true)  String mime, @JsonKey(disallowNullValue: true)  int sizeBytes, @JsonKey(disallowNullValue: true)  ArtifactMetadataScanState scanState, @JsonKey(disallowNullValue: true)  bool downloadable)?  $default,) {final _that = this;
switch (_that) {
case _ArtifactMetadata() when $default != null:
return $default(_that.id,_that.createdAt,_that.updatedAt,_that.deletedAt,_that.version,_that.mime,_that.sizeBytes,_that.scanState,_that.downloadable);case _:
  return null;

}
}

}

/// @nodoc

@JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
class _ArtifactMetadata implements ArtifactMetadata {
  const _ArtifactMetadata({@JsonKey(disallowNullValue: true) required this.id, @JsonKey(disallowNullValue: true) required this.createdAt, @JsonKey(disallowNullValue: true) this.updatedAt, @JsonKey(disallowNullValue: true) this.deletedAt, @JsonKey(disallowNullValue: true) required this.version, @JsonKey(disallowNullValue: true) required this.mime, @JsonKey(disallowNullValue: true) required this.sizeBytes, @JsonKey(disallowNullValue: true) required this.scanState, @JsonKey(disallowNullValue: true) required this.downloadable});
  factory _ArtifactMetadata.fromJson(Map<String, dynamic> json) => _$ArtifactMetadataFromJson(json);

@override@JsonKey(disallowNullValue: true) final  String id;
@override@JsonKey(disallowNullValue: true) final  String createdAt;
@override@JsonKey(disallowNullValue: true) final  String? updatedAt;
@override@JsonKey(disallowNullValue: true) final  String? deletedAt;
@override@JsonKey(disallowNullValue: true) final  int version;
@override@JsonKey(disallowNullValue: true) final  String mime;
@override@JsonKey(disallowNullValue: true) final  int sizeBytes;
@override@JsonKey(disallowNullValue: true) final  ArtifactMetadataScanState scanState;
@override@JsonKey(disallowNullValue: true) final  bool downloadable;

/// Create a copy of ArtifactMetadata
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ArtifactMetadataCopyWith<_ArtifactMetadata> get copyWith => __$ArtifactMetadataCopyWithImpl<_ArtifactMetadata>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ArtifactMetadataToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _ArtifactMetadata&&(identical(other.id, id) || other.id == id)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.deletedAt, deletedAt) || other.deletedAt == deletedAt)&&(identical(other.version, version) || other.version == version)&&(identical(other.mime, mime) || other.mime == mime)&&(identical(other.sizeBytes, sizeBytes) || other.sizeBytes == sizeBytes)&&(identical(other.scanState, scanState) || other.scanState == scanState)&&(identical(other.downloadable, downloadable) || other.downloadable == downloadable));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,id,createdAt,updatedAt,deletedAt,version,mime,sizeBytes,scanState,downloadable);
}

@override
String toString() {
    return 'ArtifactMetadata(id: $id, createdAt: $createdAt, updatedAt: $updatedAt, deletedAt: $deletedAt, version: $version, mime: $mime, sizeBytes: $sizeBytes, scanState: $scanState, downloadable: $downloadable)';
}


}

/// @nodoc
abstract mixin class _$ArtifactMetadataCopyWith<$Res> implements $ArtifactMetadataCopyWith<$Res> {
  factory _$ArtifactMetadataCopyWith(_ArtifactMetadata value, $Res Function(_ArtifactMetadata) _then) = __$ArtifactMetadataCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(disallowNullValue: true) String id,@JsonKey(disallowNullValue: true) String createdAt,@JsonKey(disallowNullValue: true) String? updatedAt,@JsonKey(disallowNullValue: true) String? deletedAt,@JsonKey(disallowNullValue: true) int version,@JsonKey(disallowNullValue: true) String mime,@JsonKey(disallowNullValue: true) int sizeBytes,@JsonKey(disallowNullValue: true) ArtifactMetadataScanState scanState,@JsonKey(disallowNullValue: true) bool downloadable
});




}
/// @nodoc
class __$ArtifactMetadataCopyWithImpl<$Res>
    implements _$ArtifactMetadataCopyWith<$Res> {
  __$ArtifactMetadataCopyWithImpl(this._self, this._then);

  final _ArtifactMetadata _self;
  final $Res Function(_ArtifactMetadata) _then;

/// Create a copy of ArtifactMetadata
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? createdAt = null,Object? updatedAt = freezed,Object? deletedAt = freezed,Object? version = null,Object? mime = null,Object? sizeBytes = null,Object? scanState = null,Object? downloadable = null,}) {
  return _then(_ArtifactMetadata(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as String?,deletedAt: freezed == deletedAt ? _self.deletedAt : deletedAt // ignore: cast_nullable_to_non_nullable
as String?,version: null == version ? _self.version : version // ignore: cast_nullable_to_non_nullable
as int,mime: null == mime ? _self.mime : mime // ignore: cast_nullable_to_non_nullable
as String,sizeBytes: null == sizeBytes ? _self.sizeBytes : sizeBytes // ignore: cast_nullable_to_non_nullable
as int,scanState: null == scanState ? _self.scanState : scanState // ignore: cast_nullable_to_non_nullable
as ArtifactMetadataScanState,downloadable: null == downloadable ? _self.downloadable : downloadable // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}


/// @nodoc
mixin _$AuthResultSessionIssuedTokens {

@JsonKey(disallowNullValue: true) String get accessToken;@JsonKey(disallowNullValue: true) String get refreshToken;@JsonKey(disallowNullValue: true) AuthResultSessionIssuedTokensTokenType get tokenType;@JsonKey(disallowNullValue: true) String get accessExpiresAt;@JsonKey(disallowNullValue: true) String get refreshExpiresAt;@JsonKey(disallowNullValue: true) String get sessionId;
/// Create a copy of AuthResultSessionIssuedTokens
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuthResultSessionIssuedTokensCopyWith<AuthResultSessionIssuedTokens> get copyWith => _$AuthResultSessionIssuedTokensCopyWithImpl<AuthResultSessionIssuedTokens>(this as AuthResultSessionIssuedTokens, _$identity);

  /// Serializes this AuthResultSessionIssuedTokens to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as AuthResultSessionIssuedTokens;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthResultSessionIssuedTokens&&(identical(other.accessToken, _this.accessToken) || other.accessToken == _this.accessToken)&&(identical(other.refreshToken, _this.refreshToken) || other.refreshToken == _this.refreshToken)&&(identical(other.tokenType, _this.tokenType) || other.tokenType == _this.tokenType)&&(identical(other.accessExpiresAt, _this.accessExpiresAt) || other.accessExpiresAt == _this.accessExpiresAt)&&(identical(other.refreshExpiresAt, _this.refreshExpiresAt) || other.refreshExpiresAt == _this.refreshExpiresAt)&&(identical(other.sessionId, _this.sessionId) || other.sessionId == _this.sessionId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as AuthResultSessionIssuedTokens;
  return Object.hash(runtimeType,_this.accessToken,_this.refreshToken,_this.tokenType,_this.accessExpiresAt,_this.refreshExpiresAt,_this.sessionId);
}

@override
String toString() {
  final _this = this as AuthResultSessionIssuedTokens;
  return 'AuthResultSessionIssuedTokens(accessToken: ${_this.accessToken}, refreshToken: ${_this.refreshToken}, tokenType: ${_this.tokenType}, accessExpiresAt: ${_this.accessExpiresAt}, refreshExpiresAt: ${_this.refreshExpiresAt}, sessionId: ${_this.sessionId})';
}


}

/// @nodoc
abstract mixin class $AuthResultSessionIssuedTokensCopyWith<$Res>  {
  factory $AuthResultSessionIssuedTokensCopyWith(AuthResultSessionIssuedTokens value, $Res Function(AuthResultSessionIssuedTokens) _then) = _$AuthResultSessionIssuedTokensCopyWithImpl;
@useResult
$Res call({
@JsonKey(disallowNullValue: true) String accessToken,@JsonKey(disallowNullValue: true) String refreshToken,@JsonKey(disallowNullValue: true) AuthResultSessionIssuedTokensTokenType tokenType,@JsonKey(disallowNullValue: true) String accessExpiresAt,@JsonKey(disallowNullValue: true) String refreshExpiresAt,@JsonKey(disallowNullValue: true) String sessionId
});




}
/// @nodoc
class _$AuthResultSessionIssuedTokensCopyWithImpl<$Res>
    implements $AuthResultSessionIssuedTokensCopyWith<$Res> {
  _$AuthResultSessionIssuedTokensCopyWithImpl(this._self, this._then);

  final AuthResultSessionIssuedTokens _self;
  final $Res Function(AuthResultSessionIssuedTokens) _then;

/// Create a copy of AuthResultSessionIssuedTokens
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? accessToken = null,Object? refreshToken = null,Object? tokenType = null,Object? accessExpiresAt = null,Object? refreshExpiresAt = null,Object? sessionId = null,}) {
  return _then(AuthResultSessionIssuedTokens(
accessToken: null == accessToken ? _self.accessToken : accessToken // ignore: cast_nullable_to_non_nullable
as String,refreshToken: null == refreshToken ? _self.refreshToken : refreshToken // ignore: cast_nullable_to_non_nullable
as String,tokenType: null == tokenType ? _self.tokenType : tokenType // ignore: cast_nullable_to_non_nullable
as AuthResultSessionIssuedTokensTokenType,accessExpiresAt: null == accessExpiresAt ? _self.accessExpiresAt : accessExpiresAt // ignore: cast_nullable_to_non_nullable
as String,refreshExpiresAt: null == refreshExpiresAt ? _self.refreshExpiresAt : refreshExpiresAt // ignore: cast_nullable_to_non_nullable
as String,sessionId: null == sessionId ? _self.sessionId : sessionId // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [AuthResultSessionIssuedTokens].
extension AuthResultSessionIssuedTokensPatterns on AuthResultSessionIssuedTokens {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AuthResultSessionIssuedTokens value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AuthResultSessionIssuedTokens() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AuthResultSessionIssuedTokens value)  $default,){
final _that = this;
switch (_that) {
case _AuthResultSessionIssuedTokens():
return $default(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AuthResultSessionIssuedTokens value)?  $default,){
final _that = this;
switch (_that) {
case _AuthResultSessionIssuedTokens() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  String accessToken, @JsonKey(disallowNullValue: true)  String refreshToken, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedTokensTokenType tokenType, @JsonKey(disallowNullValue: true)  String accessExpiresAt, @JsonKey(disallowNullValue: true)  String refreshExpiresAt, @JsonKey(disallowNullValue: true)  String sessionId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AuthResultSessionIssuedTokens() when $default != null:
return $default(_that.accessToken,_that.refreshToken,_that.tokenType,_that.accessExpiresAt,_that.refreshExpiresAt,_that.sessionId);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  String accessToken, @JsonKey(disallowNullValue: true)  String refreshToken, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedTokensTokenType tokenType, @JsonKey(disallowNullValue: true)  String accessExpiresAt, @JsonKey(disallowNullValue: true)  String refreshExpiresAt, @JsonKey(disallowNullValue: true)  String sessionId)  $default,) {final _that = this;
switch (_that) {
case _AuthResultSessionIssuedTokens():
return $default(_that.accessToken,_that.refreshToken,_that.tokenType,_that.accessExpiresAt,_that.refreshExpiresAt,_that.sessionId);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(disallowNullValue: true)  String accessToken, @JsonKey(disallowNullValue: true)  String refreshToken, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedTokensTokenType tokenType, @JsonKey(disallowNullValue: true)  String accessExpiresAt, @JsonKey(disallowNullValue: true)  String refreshExpiresAt, @JsonKey(disallowNullValue: true)  String sessionId)?  $default,) {final _that = this;
switch (_that) {
case _AuthResultSessionIssuedTokens() when $default != null:
return $default(_that.accessToken,_that.refreshToken,_that.tokenType,_that.accessExpiresAt,_that.refreshExpiresAt,_that.sessionId);case _:
  return null;

}
}

}

/// @nodoc

@JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
class _AuthResultSessionIssuedTokens implements AuthResultSessionIssuedTokens {
  const _AuthResultSessionIssuedTokens({@JsonKey(disallowNullValue: true) required this.accessToken, @JsonKey(disallowNullValue: true) required this.refreshToken, @JsonKey(disallowNullValue: true) required this.tokenType, @JsonKey(disallowNullValue: true) required this.accessExpiresAt, @JsonKey(disallowNullValue: true) required this.refreshExpiresAt, @JsonKey(disallowNullValue: true) required this.sessionId});
  factory _AuthResultSessionIssuedTokens.fromJson(Map<String, dynamic> json) => _$AuthResultSessionIssuedTokensFromJson(json);

@override@JsonKey(disallowNullValue: true) final  String accessToken;
@override@JsonKey(disallowNullValue: true) final  String refreshToken;
@override@JsonKey(disallowNullValue: true) final  AuthResultSessionIssuedTokensTokenType tokenType;
@override@JsonKey(disallowNullValue: true) final  String accessExpiresAt;
@override@JsonKey(disallowNullValue: true) final  String refreshExpiresAt;
@override@JsonKey(disallowNullValue: true) final  String sessionId;

/// Create a copy of AuthResultSessionIssuedTokens
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AuthResultSessionIssuedTokensCopyWith<_AuthResultSessionIssuedTokens> get copyWith => __$AuthResultSessionIssuedTokensCopyWithImpl<_AuthResultSessionIssuedTokens>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AuthResultSessionIssuedTokensToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _AuthResultSessionIssuedTokens&&(identical(other.accessToken, accessToken) || other.accessToken == accessToken)&&(identical(other.refreshToken, refreshToken) || other.refreshToken == refreshToken)&&(identical(other.tokenType, tokenType) || other.tokenType == tokenType)&&(identical(other.accessExpiresAt, accessExpiresAt) || other.accessExpiresAt == accessExpiresAt)&&(identical(other.refreshExpiresAt, refreshExpiresAt) || other.refreshExpiresAt == refreshExpiresAt)&&(identical(other.sessionId, sessionId) || other.sessionId == sessionId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,accessToken,refreshToken,tokenType,accessExpiresAt,refreshExpiresAt,sessionId);
}

@override
String toString() {
    return 'AuthResultSessionIssuedTokens(accessToken: $accessToken, refreshToken: $refreshToken, tokenType: $tokenType, accessExpiresAt: $accessExpiresAt, refreshExpiresAt: $refreshExpiresAt, sessionId: $sessionId)';
}


}

/// @nodoc
abstract mixin class _$AuthResultSessionIssuedTokensCopyWith<$Res> implements $AuthResultSessionIssuedTokensCopyWith<$Res> {
  factory _$AuthResultSessionIssuedTokensCopyWith(_AuthResultSessionIssuedTokens value, $Res Function(_AuthResultSessionIssuedTokens) _then) = __$AuthResultSessionIssuedTokensCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(disallowNullValue: true) String accessToken,@JsonKey(disallowNullValue: true) String refreshToken,@JsonKey(disallowNullValue: true) AuthResultSessionIssuedTokensTokenType tokenType,@JsonKey(disallowNullValue: true) String accessExpiresAt,@JsonKey(disallowNullValue: true) String refreshExpiresAt,@JsonKey(disallowNullValue: true) String sessionId
});




}
/// @nodoc
class __$AuthResultSessionIssuedTokensCopyWithImpl<$Res>
    implements _$AuthResultSessionIssuedTokensCopyWith<$Res> {
  __$AuthResultSessionIssuedTokensCopyWithImpl(this._self, this._then);

  final _AuthResultSessionIssuedTokens _self;
  final $Res Function(_AuthResultSessionIssuedTokens) _then;

/// Create a copy of AuthResultSessionIssuedTokens
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? accessToken = null,Object? refreshToken = null,Object? tokenType = null,Object? accessExpiresAt = null,Object? refreshExpiresAt = null,Object? sessionId = null,}) {
  return _then(_AuthResultSessionIssuedTokens(
accessToken: null == accessToken ? _self.accessToken : accessToken // ignore: cast_nullable_to_non_nullable
as String,refreshToken: null == refreshToken ? _self.refreshToken : refreshToken // ignore: cast_nullable_to_non_nullable
as String,tokenType: null == tokenType ? _self.tokenType : tokenType // ignore: cast_nullable_to_non_nullable
as AuthResultSessionIssuedTokensTokenType,accessExpiresAt: null == accessExpiresAt ? _self.accessExpiresAt : accessExpiresAt // ignore: cast_nullable_to_non_nullable
as String,refreshExpiresAt: null == refreshExpiresAt ? _self.refreshExpiresAt : refreshExpiresAt // ignore: cast_nullable_to_non_nullable
as String,sessionId: null == sessionId ? _self.sessionId : sessionId // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$AuthResultSessionIssuedUserMfa {

@JsonKey(disallowNullValue: true) bool get enabled;
/// Create a copy of AuthResultSessionIssuedUserMfa
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuthResultSessionIssuedUserMfaCopyWith<AuthResultSessionIssuedUserMfa> get copyWith => _$AuthResultSessionIssuedUserMfaCopyWithImpl<AuthResultSessionIssuedUserMfa>(this as AuthResultSessionIssuedUserMfa, _$identity);

  /// Serializes this AuthResultSessionIssuedUserMfa to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as AuthResultSessionIssuedUserMfa;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthResultSessionIssuedUserMfa&&(identical(other.enabled, _this.enabled) || other.enabled == _this.enabled));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as AuthResultSessionIssuedUserMfa;
  return Object.hash(runtimeType,_this.enabled);
}

@override
String toString() {
  final _this = this as AuthResultSessionIssuedUserMfa;
  return 'AuthResultSessionIssuedUserMfa(enabled: ${_this.enabled})';
}


}

/// @nodoc
abstract mixin class $AuthResultSessionIssuedUserMfaCopyWith<$Res>  {
  factory $AuthResultSessionIssuedUserMfaCopyWith(AuthResultSessionIssuedUserMfa value, $Res Function(AuthResultSessionIssuedUserMfa) _then) = _$AuthResultSessionIssuedUserMfaCopyWithImpl;
@useResult
$Res call({
@JsonKey(disallowNullValue: true) bool enabled
});




}
/// @nodoc
class _$AuthResultSessionIssuedUserMfaCopyWithImpl<$Res>
    implements $AuthResultSessionIssuedUserMfaCopyWith<$Res> {
  _$AuthResultSessionIssuedUserMfaCopyWithImpl(this._self, this._then);

  final AuthResultSessionIssuedUserMfa _self;
  final $Res Function(AuthResultSessionIssuedUserMfa) _then;

/// Create a copy of AuthResultSessionIssuedUserMfa
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? enabled = null,}) {
  return _then(AuthResultSessionIssuedUserMfa(
enabled: null == enabled ? _self.enabled : enabled // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [AuthResultSessionIssuedUserMfa].
extension AuthResultSessionIssuedUserMfaPatterns on AuthResultSessionIssuedUserMfa {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AuthResultSessionIssuedUserMfa value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AuthResultSessionIssuedUserMfa() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AuthResultSessionIssuedUserMfa value)  $default,){
final _that = this;
switch (_that) {
case _AuthResultSessionIssuedUserMfa():
return $default(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AuthResultSessionIssuedUserMfa value)?  $default,){
final _that = this;
switch (_that) {
case _AuthResultSessionIssuedUserMfa() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  bool enabled)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AuthResultSessionIssuedUserMfa() when $default != null:
return $default(_that.enabled);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  bool enabled)  $default,) {final _that = this;
switch (_that) {
case _AuthResultSessionIssuedUserMfa():
return $default(_that.enabled);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(disallowNullValue: true)  bool enabled)?  $default,) {final _that = this;
switch (_that) {
case _AuthResultSessionIssuedUserMfa() when $default != null:
return $default(_that.enabled);case _:
  return null;

}
}

}

/// @nodoc

@JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
class _AuthResultSessionIssuedUserMfa implements AuthResultSessionIssuedUserMfa {
  const _AuthResultSessionIssuedUserMfa({@JsonKey(disallowNullValue: true) required this.enabled});
  factory _AuthResultSessionIssuedUserMfa.fromJson(Map<String, dynamic> json) => _$AuthResultSessionIssuedUserMfaFromJson(json);

@override@JsonKey(disallowNullValue: true) final  bool enabled;

/// Create a copy of AuthResultSessionIssuedUserMfa
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AuthResultSessionIssuedUserMfaCopyWith<_AuthResultSessionIssuedUserMfa> get copyWith => __$AuthResultSessionIssuedUserMfaCopyWithImpl<_AuthResultSessionIssuedUserMfa>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AuthResultSessionIssuedUserMfaToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _AuthResultSessionIssuedUserMfa&&(identical(other.enabled, enabled) || other.enabled == enabled));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,enabled);
}

@override
String toString() {
    return 'AuthResultSessionIssuedUserMfa(enabled: $enabled)';
}


}

/// @nodoc
abstract mixin class _$AuthResultSessionIssuedUserMfaCopyWith<$Res> implements $AuthResultSessionIssuedUserMfaCopyWith<$Res> {
  factory _$AuthResultSessionIssuedUserMfaCopyWith(_AuthResultSessionIssuedUserMfa value, $Res Function(_AuthResultSessionIssuedUserMfa) _then) = __$AuthResultSessionIssuedUserMfaCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(disallowNullValue: true) bool enabled
});




}
/// @nodoc
class __$AuthResultSessionIssuedUserMfaCopyWithImpl<$Res>
    implements _$AuthResultSessionIssuedUserMfaCopyWith<$Res> {
  __$AuthResultSessionIssuedUserMfaCopyWithImpl(this._self, this._then);

  final _AuthResultSessionIssuedUserMfa _self;
  final $Res Function(_AuthResultSessionIssuedUserMfa) _then;

/// Create a copy of AuthResultSessionIssuedUserMfa
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? enabled = null,}) {
  return _then(_AuthResultSessionIssuedUserMfa(
enabled: null == enabled ? _self.enabled : enabled // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}


/// @nodoc
mixin _$AuthResultSessionIssuedUser {

@JsonKey(disallowNullValue: true) String get id;@JsonKey(disallowNullValue: true) int get version;@JsonKey(disallowNullValue: true) String get email;@JsonKey(disallowNullValue: true) String get emailVerifiedAt;@JsonKey(disallowNullValue: true) List<AuthResultSessionIssuedUserRolesItem> get roles;@JsonKey(disallowNullValue: true) AuthResultSessionIssuedUserLocale get locale;@JsonKey(disallowNullValue: true) AuthResultSessionIssuedUserTheme get theme;@JsonKey(disallowNullValue: true) AuthResultSessionIssuedUserState get state;@JsonKey(disallowNullValue: true) AuthResultSessionIssuedUserMfa get mfa;@JsonKey(disallowNullValue: true) String get createdAt;
/// Create a copy of AuthResultSessionIssuedUser
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuthResultSessionIssuedUserCopyWith<AuthResultSessionIssuedUser> get copyWith => _$AuthResultSessionIssuedUserCopyWithImpl<AuthResultSessionIssuedUser>(this as AuthResultSessionIssuedUser, _$identity);

  /// Serializes this AuthResultSessionIssuedUser to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as AuthResultSessionIssuedUser;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthResultSessionIssuedUser&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.version, _this.version) || other.version == _this.version)&&(identical(other.email, _this.email) || other.email == _this.email)&&(identical(other.emailVerifiedAt, _this.emailVerifiedAt) || other.emailVerifiedAt == _this.emailVerifiedAt)&&const DeepCollectionEquality().equals(other.roles, _this.roles)&&(identical(other.locale, _this.locale) || other.locale == _this.locale)&&(identical(other.theme, _this.theme) || other.theme == _this.theme)&&(identical(other.state, _this.state) || other.state == _this.state)&&(identical(other.mfa, _this.mfa) || other.mfa == _this.mfa)&&(identical(other.createdAt, _this.createdAt) || other.createdAt == _this.createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as AuthResultSessionIssuedUser;
  return Object.hash(runtimeType,_this.id,_this.version,_this.email,_this.emailVerifiedAt,const DeepCollectionEquality().hash(_this.roles),_this.locale,_this.theme,_this.state,_this.mfa,_this.createdAt);
}

@override
String toString() {
  final _this = this as AuthResultSessionIssuedUser;
  return 'AuthResultSessionIssuedUser(id: ${_this.id}, version: ${_this.version}, email: ${_this.email}, emailVerifiedAt: ${_this.emailVerifiedAt}, roles: ${_this.roles}, locale: ${_this.locale}, theme: ${_this.theme}, state: ${_this.state}, mfa: ${_this.mfa}, createdAt: ${_this.createdAt})';
}


}

/// @nodoc
abstract mixin class $AuthResultSessionIssuedUserCopyWith<$Res>  {
  factory $AuthResultSessionIssuedUserCopyWith(AuthResultSessionIssuedUser value, $Res Function(AuthResultSessionIssuedUser) _then) = _$AuthResultSessionIssuedUserCopyWithImpl;
@useResult
$Res call({
@JsonKey(disallowNullValue: true) String id,@JsonKey(disallowNullValue: true) int version,@JsonKey(disallowNullValue: true) String email,@JsonKey(disallowNullValue: true) String emailVerifiedAt,@JsonKey(disallowNullValue: true) List<AuthResultSessionIssuedUserRolesItem> roles,@JsonKey(disallowNullValue: true) AuthResultSessionIssuedUserLocale locale,@JsonKey(disallowNullValue: true) AuthResultSessionIssuedUserTheme theme,@JsonKey(disallowNullValue: true) AuthResultSessionIssuedUserState state,@JsonKey(disallowNullValue: true) AuthResultSessionIssuedUserMfa mfa,@JsonKey(disallowNullValue: true) String createdAt
});


$AuthResultSessionIssuedUserMfaCopyWith<$Res> get mfa;

}
/// @nodoc
class _$AuthResultSessionIssuedUserCopyWithImpl<$Res>
    implements $AuthResultSessionIssuedUserCopyWith<$Res> {
  _$AuthResultSessionIssuedUserCopyWithImpl(this._self, this._then);

  final AuthResultSessionIssuedUser _self;
  final $Res Function(AuthResultSessionIssuedUser) _then;

/// Create a copy of AuthResultSessionIssuedUser
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? version = null,Object? email = null,Object? emailVerifiedAt = null,Object? roles = null,Object? locale = null,Object? theme = null,Object? state = null,Object? mfa = null,Object? createdAt = null,}) {
  return _then(AuthResultSessionIssuedUser(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,version: null == version ? _self.version : version // ignore: cast_nullable_to_non_nullable
as int,email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,emailVerifiedAt: null == emailVerifiedAt ? _self.emailVerifiedAt : emailVerifiedAt // ignore: cast_nullable_to_non_nullable
as String,roles: null == roles ? _self.roles : roles // ignore: cast_nullable_to_non_nullable
as List<AuthResultSessionIssuedUserRolesItem>,locale: null == locale ? _self.locale : locale // ignore: cast_nullable_to_non_nullable
as AuthResultSessionIssuedUserLocale,theme: null == theme ? _self.theme : theme // ignore: cast_nullable_to_non_nullable
as AuthResultSessionIssuedUserTheme,state: null == state ? _self.state : state // ignore: cast_nullable_to_non_nullable
as AuthResultSessionIssuedUserState,mfa: null == mfa ? _self.mfa : mfa // ignore: cast_nullable_to_non_nullable
as AuthResultSessionIssuedUserMfa,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,
  ));
}
/// Create a copy of AuthResultSessionIssuedUser
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$AuthResultSessionIssuedUserMfaCopyWith<$Res> get mfa {

  return $AuthResultSessionIssuedUserMfaCopyWith<$Res>(_self.mfa, (value) {
    return _then(_self.copyWith(mfa: value));
  });
}
}


/// Adds pattern-matching-related methods to [AuthResultSessionIssuedUser].
extension AuthResultSessionIssuedUserPatterns on AuthResultSessionIssuedUser {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AuthResultSessionIssuedUser value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AuthResultSessionIssuedUser() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AuthResultSessionIssuedUser value)  $default,){
final _that = this;
switch (_that) {
case _AuthResultSessionIssuedUser():
return $default(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AuthResultSessionIssuedUser value)?  $default,){
final _that = this;
switch (_that) {
case _AuthResultSessionIssuedUser() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  String id, @JsonKey(disallowNullValue: true)  int version, @JsonKey(disallowNullValue: true)  String email, @JsonKey(disallowNullValue: true)  String emailVerifiedAt, @JsonKey(disallowNullValue: true)  List<AuthResultSessionIssuedUserRolesItem> roles, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedUserLocale locale, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedUserTheme theme, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedUserState state, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedUserMfa mfa, @JsonKey(disallowNullValue: true)  String createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AuthResultSessionIssuedUser() when $default != null:
return $default(_that.id,_that.version,_that.email,_that.emailVerifiedAt,_that.roles,_that.locale,_that.theme,_that.state,_that.mfa,_that.createdAt);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  String id, @JsonKey(disallowNullValue: true)  int version, @JsonKey(disallowNullValue: true)  String email, @JsonKey(disallowNullValue: true)  String emailVerifiedAt, @JsonKey(disallowNullValue: true)  List<AuthResultSessionIssuedUserRolesItem> roles, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedUserLocale locale, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedUserTheme theme, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedUserState state, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedUserMfa mfa, @JsonKey(disallowNullValue: true)  String createdAt)  $default,) {final _that = this;
switch (_that) {
case _AuthResultSessionIssuedUser():
return $default(_that.id,_that.version,_that.email,_that.emailVerifiedAt,_that.roles,_that.locale,_that.theme,_that.state,_that.mfa,_that.createdAt);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(disallowNullValue: true)  String id, @JsonKey(disallowNullValue: true)  int version, @JsonKey(disallowNullValue: true)  String email, @JsonKey(disallowNullValue: true)  String emailVerifiedAt, @JsonKey(disallowNullValue: true)  List<AuthResultSessionIssuedUserRolesItem> roles, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedUserLocale locale, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedUserTheme theme, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedUserState state, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedUserMfa mfa, @JsonKey(disallowNullValue: true)  String createdAt)?  $default,) {final _that = this;
switch (_that) {
case _AuthResultSessionIssuedUser() when $default != null:
return $default(_that.id,_that.version,_that.email,_that.emailVerifiedAt,_that.roles,_that.locale,_that.theme,_that.state,_that.mfa,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc

@JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
class _AuthResultSessionIssuedUser implements AuthResultSessionIssuedUser {
  const _AuthResultSessionIssuedUser({@JsonKey(disallowNullValue: true) required this.id, @JsonKey(disallowNullValue: true) required this.version, @JsonKey(disallowNullValue: true) required this.email, @JsonKey(disallowNullValue: true) required this.emailVerifiedAt, @JsonKey(disallowNullValue: true) required  List<AuthResultSessionIssuedUserRolesItem> roles, @JsonKey(disallowNullValue: true) required this.locale, @JsonKey(disallowNullValue: true) required this.theme, @JsonKey(disallowNullValue: true) required this.state, @JsonKey(disallowNullValue: true) required this.mfa, @JsonKey(disallowNullValue: true) required this.createdAt}): _roles = roles;
  factory _AuthResultSessionIssuedUser.fromJson(Map<String, dynamic> json) => _$AuthResultSessionIssuedUserFromJson(json);

@override@JsonKey(disallowNullValue: true) final  String id;
@override@JsonKey(disallowNullValue: true) final  int version;
@override@JsonKey(disallowNullValue: true) final  String email;
@override@JsonKey(disallowNullValue: true) final  String emailVerifiedAt;
 final  List<AuthResultSessionIssuedUserRolesItem> _roles;
@override@JsonKey(disallowNullValue: true) List<AuthResultSessionIssuedUserRolesItem> get roles {
  if (_roles is EqualUnmodifiableListView) return _roles;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_roles);
}

@override@JsonKey(disallowNullValue: true) final  AuthResultSessionIssuedUserLocale locale;
@override@JsonKey(disallowNullValue: true) final  AuthResultSessionIssuedUserTheme theme;
@override@JsonKey(disallowNullValue: true) final  AuthResultSessionIssuedUserState state;
@override@JsonKey(disallowNullValue: true) final  AuthResultSessionIssuedUserMfa mfa;
@override@JsonKey(disallowNullValue: true) final  String createdAt;

/// Create a copy of AuthResultSessionIssuedUser
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AuthResultSessionIssuedUserCopyWith<_AuthResultSessionIssuedUser> get copyWith => __$AuthResultSessionIssuedUserCopyWithImpl<_AuthResultSessionIssuedUser>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AuthResultSessionIssuedUserToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _AuthResultSessionIssuedUser&&(identical(other.id, id) || other.id == id)&&(identical(other.version, version) || other.version == version)&&(identical(other.email, email) || other.email == email)&&(identical(other.emailVerifiedAt, emailVerifiedAt) || other.emailVerifiedAt == emailVerifiedAt)&&const DeepCollectionEquality().equals(other.roles, _roles)&&(identical(other.locale, locale) || other.locale == locale)&&(identical(other.theme, theme) || other.theme == theme)&&(identical(other.state, state) || other.state == state)&&(identical(other.mfa, mfa) || other.mfa == mfa)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,id,version,email,emailVerifiedAt,const DeepCollectionEquality().hash(_roles),locale,theme,state,mfa,createdAt);
}

@override
String toString() {
    return 'AuthResultSessionIssuedUser(id: $id, version: $version, email: $email, emailVerifiedAt: $emailVerifiedAt, roles: $roles, locale: $locale, theme: $theme, state: $state, mfa: $mfa, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$AuthResultSessionIssuedUserCopyWith<$Res> implements $AuthResultSessionIssuedUserCopyWith<$Res> {
  factory _$AuthResultSessionIssuedUserCopyWith(_AuthResultSessionIssuedUser value, $Res Function(_AuthResultSessionIssuedUser) _then) = __$AuthResultSessionIssuedUserCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(disallowNullValue: true) String id,@JsonKey(disallowNullValue: true) int version,@JsonKey(disallowNullValue: true) String email,@JsonKey(disallowNullValue: true) String emailVerifiedAt,@JsonKey(disallowNullValue: true) List<AuthResultSessionIssuedUserRolesItem> roles,@JsonKey(disallowNullValue: true) AuthResultSessionIssuedUserLocale locale,@JsonKey(disallowNullValue: true) AuthResultSessionIssuedUserTheme theme,@JsonKey(disallowNullValue: true) AuthResultSessionIssuedUserState state,@JsonKey(disallowNullValue: true) AuthResultSessionIssuedUserMfa mfa,@JsonKey(disallowNullValue: true) String createdAt
});


@override $AuthResultSessionIssuedUserMfaCopyWith<$Res> get mfa;

}
/// @nodoc
class __$AuthResultSessionIssuedUserCopyWithImpl<$Res>
    implements _$AuthResultSessionIssuedUserCopyWith<$Res> {
  __$AuthResultSessionIssuedUserCopyWithImpl(this._self, this._then);

  final _AuthResultSessionIssuedUser _self;
  final $Res Function(_AuthResultSessionIssuedUser) _then;

/// Create a copy of AuthResultSessionIssuedUser
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? version = null,Object? email = null,Object? emailVerifiedAt = null,Object? roles = null,Object? locale = null,Object? theme = null,Object? state = null,Object? mfa = null,Object? createdAt = null,}) {
  return _then(_AuthResultSessionIssuedUser(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,version: null == version ? _self.version : version // ignore: cast_nullable_to_non_nullable
as int,email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,emailVerifiedAt: null == emailVerifiedAt ? _self.emailVerifiedAt : emailVerifiedAt // ignore: cast_nullable_to_non_nullable
as String,roles: null == roles ? _self._roles : roles // ignore: cast_nullable_to_non_nullable
as List<AuthResultSessionIssuedUserRolesItem>,locale: null == locale ? _self.locale : locale // ignore: cast_nullable_to_non_nullable
as AuthResultSessionIssuedUserLocale,theme: null == theme ? _self.theme : theme // ignore: cast_nullable_to_non_nullable
as AuthResultSessionIssuedUserTheme,state: null == state ? _self.state : state // ignore: cast_nullable_to_non_nullable
as AuthResultSessionIssuedUserState,mfa: null == mfa ? _self.mfa : mfa // ignore: cast_nullable_to_non_nullable
as AuthResultSessionIssuedUserMfa,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

/// Create a copy of AuthResultSessionIssuedUser
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$AuthResultSessionIssuedUserMfaCopyWith<$Res> get mfa {

  return $AuthResultSessionIssuedUserMfaCopyWith<$Res>(_self.mfa, (value) {
    return _then(_self.copyWith(mfa: value));
  });
}
}

AuthResult _$AuthResultFromJson(
  Map<String, dynamic> json
) {
        switch (json['status']) {
                  case 'session_issued':
          return AuthResultSessionIssued.fromJson(
            json
          );
                case 'challenge_required':
          return AuthResultChallengeRequired.fromJson(
            json
          );

          default:
            throw CheckedFromJsonException(
  json,
  'status',
  'AuthResult',
  'Invalid union type "${json['status']}"!'
);
        }

}

/// @nodoc
mixin _$AuthResult {



  /// Serializes this AuthResult to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthResult);
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'AuthResult()';
}


}

/// @nodoc
class $AuthResultCopyWith<$Res>  {
$AuthResultCopyWith(AuthResult _, $Res Function(AuthResult) __);
}


/// Adds pattern-matching-related methods to [AuthResult].
extension AuthResultPatterns on AuthResult {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( AuthResultSessionIssued value)?  session_issued,TResult Function( AuthResultChallengeRequired value)?  challenge_required,required TResult orElse(),}){
final _that = this;
switch (_that) {
case AuthResultSessionIssued() when session_issued != null:
return session_issued(_that);case AuthResultChallengeRequired() when challenge_required != null:
return challenge_required(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( AuthResultSessionIssued value)  session_issued,required TResult Function( AuthResultChallengeRequired value)  challenge_required,}){
final _that = this;
switch (_that) {
case AuthResultSessionIssued():
return session_issued(_that);case AuthResultChallengeRequired():
return challenge_required(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( AuthResultSessionIssued value)?  session_issued,TResult? Function( AuthResultChallengeRequired value)?  challenge_required,}){
final _that = this;
switch (_that) {
case AuthResultSessionIssued() when session_issued != null:
return session_issued(_that);case AuthResultChallengeRequired() when challenge_required != null:
return challenge_required(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function(@JsonKey(disallowNullValue: true)  AuthResultSessionIssuedTokens tokens, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedUser user)?  session_issued,TResult Function(@JsonKey(disallowNullValue: true)  String challengeId, @JsonKey(disallowNullValue: true)  String expiresAt, @JsonKey(disallowNullValue: true)  List<AuthResultChallengeRequiredMethodsItem> methods)?  challenge_required,required TResult orElse(),}) {final _that = this;
switch (_that) {
case AuthResultSessionIssued() when session_issued != null:
return session_issued(_that.tokens,_that.user);case AuthResultChallengeRequired() when challenge_required != null:
return challenge_required(_that.challengeId,_that.expiresAt,_that.methods);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function(@JsonKey(disallowNullValue: true)  AuthResultSessionIssuedTokens tokens, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedUser user)  session_issued,required TResult Function(@JsonKey(disallowNullValue: true)  String challengeId, @JsonKey(disallowNullValue: true)  String expiresAt, @JsonKey(disallowNullValue: true)  List<AuthResultChallengeRequiredMethodsItem> methods)  challenge_required,}) {final _that = this;
switch (_that) {
case AuthResultSessionIssued():
return session_issued(_that.tokens,_that.user);case AuthResultChallengeRequired():
return challenge_required(_that.challengeId,_that.expiresAt,_that.methods);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function(@JsonKey(disallowNullValue: true)  AuthResultSessionIssuedTokens tokens, @JsonKey(disallowNullValue: true)  AuthResultSessionIssuedUser user)?  session_issued,TResult? Function(@JsonKey(disallowNullValue: true)  String challengeId, @JsonKey(disallowNullValue: true)  String expiresAt, @JsonKey(disallowNullValue: true)  List<AuthResultChallengeRequiredMethodsItem> methods)?  challenge_required,}) {final _that = this;
switch (_that) {
case AuthResultSessionIssued() when session_issued != null:
return session_issued(_that.tokens,_that.user);case AuthResultChallengeRequired() when challenge_required != null:
return challenge_required(_that.challengeId,_that.expiresAt,_that.methods);case _:
  return null;

}
}

}

/// @nodoc

@JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
class AuthResultSessionIssued implements AuthResult {
  const AuthResultSessionIssued({@JsonKey(disallowNullValue: true) required this.tokens, @JsonKey(disallowNullValue: true) required this.user,  String? $type}): $type = $type ?? 'session_issued';
  factory AuthResultSessionIssued.fromJson(Map<String, dynamic> json) => _$AuthResultSessionIssuedFromJson(json);

@JsonKey(disallowNullValue: true) final  AuthResultSessionIssuedTokens tokens;
@JsonKey(disallowNullValue: true) final  AuthResultSessionIssuedUser user;

@JsonKey(name: 'status')
final String $type;


/// Create a copy of AuthResult
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuthResultSessionIssuedCopyWith<AuthResultSessionIssued> get copyWith => _$AuthResultSessionIssuedCopyWithImpl<AuthResultSessionIssued>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AuthResultSessionIssuedToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthResultSessionIssued&&(identical(other.tokens, tokens) || other.tokens == tokens)&&(identical(other.user, user) || other.user == user));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,tokens,user);
}

@override
String toString() {
    return 'AuthResult.session_issued(tokens: $tokens, user: $user)';
}


}

/// @nodoc
abstract mixin class $AuthResultSessionIssuedCopyWith<$Res> implements $AuthResultCopyWith<$Res> {
  factory $AuthResultSessionIssuedCopyWith(AuthResultSessionIssued value, $Res Function(AuthResultSessionIssued) _then) = _$AuthResultSessionIssuedCopyWithImpl;
@useResult
$Res call({
@JsonKey(disallowNullValue: true) AuthResultSessionIssuedTokens tokens,@JsonKey(disallowNullValue: true) AuthResultSessionIssuedUser user
});


$AuthResultSessionIssuedTokensCopyWith<$Res> get tokens;$AuthResultSessionIssuedUserCopyWith<$Res> get user;

}
/// @nodoc
class _$AuthResultSessionIssuedCopyWithImpl<$Res>
    implements $AuthResultSessionIssuedCopyWith<$Res> {
  _$AuthResultSessionIssuedCopyWithImpl(this._self, this._then);

  final AuthResultSessionIssued _self;
  final $Res Function(AuthResultSessionIssued) _then;

/// Create a copy of AuthResult
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? tokens = null,Object? user = null,}) {
  return _then(AuthResultSessionIssued(
tokens: null == tokens ? _self.tokens : tokens // ignore: cast_nullable_to_non_nullable
as AuthResultSessionIssuedTokens,user: null == user ? _self.user : user // ignore: cast_nullable_to_non_nullable
as AuthResultSessionIssuedUser,
  ));
}

/// Create a copy of AuthResult
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$AuthResultSessionIssuedTokensCopyWith<$Res> get tokens {

  return $AuthResultSessionIssuedTokensCopyWith<$Res>(_self.tokens, (value) {
    return _then(_self.copyWith(tokens: value));
  });
}/// Create a copy of AuthResult
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$AuthResultSessionIssuedUserCopyWith<$Res> get user {

  return $AuthResultSessionIssuedUserCopyWith<$Res>(_self.user, (value) {
    return _then(_self.copyWith(user: value));
  });
}
}

/// @nodoc

@JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
class AuthResultChallengeRequired implements AuthResult {
  const AuthResultChallengeRequired({@JsonKey(disallowNullValue: true) required this.challengeId, @JsonKey(disallowNullValue: true) required this.expiresAt, @JsonKey(disallowNullValue: true) required  List<AuthResultChallengeRequiredMethodsItem> methods,  String? $type}): _methods = methods,$type = $type ?? 'challenge_required';
  factory AuthResultChallengeRequired.fromJson(Map<String, dynamic> json) => _$AuthResultChallengeRequiredFromJson(json);

@JsonKey(disallowNullValue: true) final  String challengeId;
@JsonKey(disallowNullValue: true) final  String expiresAt;
 final  List<AuthResultChallengeRequiredMethodsItem> _methods;
@JsonKey(disallowNullValue: true) List<AuthResultChallengeRequiredMethodsItem> get methods {
  if (_methods is EqualUnmodifiableListView) return _methods;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_methods);
}


@JsonKey(name: 'status')
final String $type;


/// Create a copy of AuthResult
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuthResultChallengeRequiredCopyWith<AuthResultChallengeRequired> get copyWith => _$AuthResultChallengeRequiredCopyWithImpl<AuthResultChallengeRequired>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AuthResultChallengeRequiredToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthResultChallengeRequired&&(identical(other.challengeId, challengeId) || other.challengeId == challengeId)&&(identical(other.expiresAt, expiresAt) || other.expiresAt == expiresAt)&&const DeepCollectionEquality().equals(other.methods, _methods));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,challengeId,expiresAt,const DeepCollectionEquality().hash(_methods));
}

@override
String toString() {
    return 'AuthResult.challenge_required(challengeId: $challengeId, expiresAt: $expiresAt, methods: $methods)';
}


}

/// @nodoc
abstract mixin class $AuthResultChallengeRequiredCopyWith<$Res> implements $AuthResultCopyWith<$Res> {
  factory $AuthResultChallengeRequiredCopyWith(AuthResultChallengeRequired value, $Res Function(AuthResultChallengeRequired) _then) = _$AuthResultChallengeRequiredCopyWithImpl;
@useResult
$Res call({
@JsonKey(disallowNullValue: true) String challengeId,@JsonKey(disallowNullValue: true) String expiresAt,@JsonKey(disallowNullValue: true) List<AuthResultChallengeRequiredMethodsItem> methods
});




}
/// @nodoc
class _$AuthResultChallengeRequiredCopyWithImpl<$Res>
    implements $AuthResultChallengeRequiredCopyWith<$Res> {
  _$AuthResultChallengeRequiredCopyWithImpl(this._self, this._then);

  final AuthResultChallengeRequired _self;
  final $Res Function(AuthResultChallengeRequired) _then;

/// Create a copy of AuthResult
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? challengeId = null,Object? expiresAt = null,Object? methods = null,}) {
  return _then(AuthResultChallengeRequired(
challengeId: null == challengeId ? _self.challengeId : challengeId // ignore: cast_nullable_to_non_nullable
as String,expiresAt: null == expiresAt ? _self.expiresAt : expiresAt // ignore: cast_nullable_to_non_nullable
as String,methods: null == methods ? _self._methods : methods // ignore: cast_nullable_to_non_nullable
as List<AuthResultChallengeRequiredMethodsItem>,
  ));
}


}


/// @nodoc
mixin _$ApiErrorErrorFieldErrorsItem {

@JsonKey(disallowNullValue: true) List<Object> get path;@JsonKey(disallowNullValue: true) String get code;
/// Create a copy of ApiErrorErrorFieldErrorsItem
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ApiErrorErrorFieldErrorsItemCopyWith<ApiErrorErrorFieldErrorsItem> get copyWith => _$ApiErrorErrorFieldErrorsItemCopyWithImpl<ApiErrorErrorFieldErrorsItem>(this as ApiErrorErrorFieldErrorsItem, _$identity);

  /// Serializes this ApiErrorErrorFieldErrorsItem to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as ApiErrorErrorFieldErrorsItem;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ApiErrorErrorFieldErrorsItem&&const DeepCollectionEquality().equals(other.path, _this.path)&&(identical(other.code, _this.code) || other.code == _this.code));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as ApiErrorErrorFieldErrorsItem;
  return Object.hash(runtimeType,const DeepCollectionEquality().hash(_this.path),_this.code);
}

@override
String toString() {
  final _this = this as ApiErrorErrorFieldErrorsItem;
  return 'ApiErrorErrorFieldErrorsItem(path: ${_this.path}, code: ${_this.code})';
}


}

/// @nodoc
abstract mixin class $ApiErrorErrorFieldErrorsItemCopyWith<$Res>  {
  factory $ApiErrorErrorFieldErrorsItemCopyWith(ApiErrorErrorFieldErrorsItem value, $Res Function(ApiErrorErrorFieldErrorsItem) _then) = _$ApiErrorErrorFieldErrorsItemCopyWithImpl;
@useResult
$Res call({
@JsonKey(disallowNullValue: true) List<Object> path,@JsonKey(disallowNullValue: true) String code
});




}
/// @nodoc
class _$ApiErrorErrorFieldErrorsItemCopyWithImpl<$Res>
    implements $ApiErrorErrorFieldErrorsItemCopyWith<$Res> {
  _$ApiErrorErrorFieldErrorsItemCopyWithImpl(this._self, this._then);

  final ApiErrorErrorFieldErrorsItem _self;
  final $Res Function(ApiErrorErrorFieldErrorsItem) _then;

/// Create a copy of ApiErrorErrorFieldErrorsItem
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? path = null,Object? code = null,}) {
  return _then(ApiErrorErrorFieldErrorsItem(
path: null == path ? _self.path : path // ignore: cast_nullable_to_non_nullable
as List<Object>,code: null == code ? _self.code : code // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [ApiErrorErrorFieldErrorsItem].
extension ApiErrorErrorFieldErrorsItemPatterns on ApiErrorErrorFieldErrorsItem {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ApiErrorErrorFieldErrorsItem value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ApiErrorErrorFieldErrorsItem() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ApiErrorErrorFieldErrorsItem value)  $default,){
final _that = this;
switch (_that) {
case _ApiErrorErrorFieldErrorsItem():
return $default(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ApiErrorErrorFieldErrorsItem value)?  $default,){
final _that = this;
switch (_that) {
case _ApiErrorErrorFieldErrorsItem() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  List<Object> path, @JsonKey(disallowNullValue: true)  String code)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ApiErrorErrorFieldErrorsItem() when $default != null:
return $default(_that.path,_that.code);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  List<Object> path, @JsonKey(disallowNullValue: true)  String code)  $default,) {final _that = this;
switch (_that) {
case _ApiErrorErrorFieldErrorsItem():
return $default(_that.path,_that.code);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(disallowNullValue: true)  List<Object> path, @JsonKey(disallowNullValue: true)  String code)?  $default,) {final _that = this;
switch (_that) {
case _ApiErrorErrorFieldErrorsItem() when $default != null:
return $default(_that.path,_that.code);case _:
  return null;

}
}

}

/// @nodoc

@JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
class _ApiErrorErrorFieldErrorsItem implements ApiErrorErrorFieldErrorsItem {
  const _ApiErrorErrorFieldErrorsItem({@JsonKey(disallowNullValue: true) required  List<Object> path, @JsonKey(disallowNullValue: true) required this.code}): _path = path;
  factory _ApiErrorErrorFieldErrorsItem.fromJson(Map<String, dynamic> json) => _$ApiErrorErrorFieldErrorsItemFromJson(json);

 final  List<Object> _path;
@override@JsonKey(disallowNullValue: true) List<Object> get path {
  if (_path is EqualUnmodifiableListView) return _path;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_path);
}

@override@JsonKey(disallowNullValue: true) final  String code;

/// Create a copy of ApiErrorErrorFieldErrorsItem
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ApiErrorErrorFieldErrorsItemCopyWith<_ApiErrorErrorFieldErrorsItem> get copyWith => __$ApiErrorErrorFieldErrorsItemCopyWithImpl<_ApiErrorErrorFieldErrorsItem>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ApiErrorErrorFieldErrorsItemToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _ApiErrorErrorFieldErrorsItem&&const DeepCollectionEquality().equals(other.path, _path)&&(identical(other.code, code) || other.code == code));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,const DeepCollectionEquality().hash(_path),code);
}

@override
String toString() {
    return 'ApiErrorErrorFieldErrorsItem(path: $path, code: $code)';
}


}

/// @nodoc
abstract mixin class _$ApiErrorErrorFieldErrorsItemCopyWith<$Res> implements $ApiErrorErrorFieldErrorsItemCopyWith<$Res> {
  factory _$ApiErrorErrorFieldErrorsItemCopyWith(_ApiErrorErrorFieldErrorsItem value, $Res Function(_ApiErrorErrorFieldErrorsItem) _then) = __$ApiErrorErrorFieldErrorsItemCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(disallowNullValue: true) List<Object> path,@JsonKey(disallowNullValue: true) String code
});




}
/// @nodoc
class __$ApiErrorErrorFieldErrorsItemCopyWithImpl<$Res>
    implements _$ApiErrorErrorFieldErrorsItemCopyWith<$Res> {
  __$ApiErrorErrorFieldErrorsItemCopyWithImpl(this._self, this._then);

  final _ApiErrorErrorFieldErrorsItem _self;
  final $Res Function(_ApiErrorErrorFieldErrorsItem) _then;

/// Create a copy of ApiErrorErrorFieldErrorsItem
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? path = null,Object? code = null,}) {
  return _then(_ApiErrorErrorFieldErrorsItem(
path: null == path ? _self._path : path // ignore: cast_nullable_to_non_nullable
as List<Object>,code: null == code ? _self.code : code // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$ApiErrorError {

@JsonKey(disallowNullValue: true) ApiErrorErrorCode get code;@JsonKey(disallowNullValue: true) String get messageKey;@JsonKey(disallowNullValue: true) List<ApiErrorErrorFieldErrorsItem>? get fieldErrors;@JsonKey(disallowNullValue: true) int? get retryAfterSeconds;
/// Create a copy of ApiErrorError
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ApiErrorErrorCopyWith<ApiErrorError> get copyWith => _$ApiErrorErrorCopyWithImpl<ApiErrorError>(this as ApiErrorError, _$identity);

  /// Serializes this ApiErrorError to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as ApiErrorError;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ApiErrorError&&(identical(other.code, _this.code) || other.code == _this.code)&&(identical(other.messageKey, _this.messageKey) || other.messageKey == _this.messageKey)&&const DeepCollectionEquality().equals(other.fieldErrors, _this.fieldErrors)&&(identical(other.retryAfterSeconds, _this.retryAfterSeconds) || other.retryAfterSeconds == _this.retryAfterSeconds));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as ApiErrorError;
  return Object.hash(runtimeType,_this.code,_this.messageKey,const DeepCollectionEquality().hash(_this.fieldErrors),_this.retryAfterSeconds);
}

@override
String toString() {
  final _this = this as ApiErrorError;
  return 'ApiErrorError(code: ${_this.code}, messageKey: ${_this.messageKey}, fieldErrors: ${_this.fieldErrors}, retryAfterSeconds: ${_this.retryAfterSeconds})';
}


}

/// @nodoc
abstract mixin class $ApiErrorErrorCopyWith<$Res>  {
  factory $ApiErrorErrorCopyWith(ApiErrorError value, $Res Function(ApiErrorError) _then) = _$ApiErrorErrorCopyWithImpl;
@useResult
$Res call({
@JsonKey(disallowNullValue: true) ApiErrorErrorCode code,@JsonKey(disallowNullValue: true) String messageKey,@JsonKey(disallowNullValue: true) List<ApiErrorErrorFieldErrorsItem>? fieldErrors,@JsonKey(disallowNullValue: true) int? retryAfterSeconds
});




}
/// @nodoc
class _$ApiErrorErrorCopyWithImpl<$Res>
    implements $ApiErrorErrorCopyWith<$Res> {
  _$ApiErrorErrorCopyWithImpl(this._self, this._then);

  final ApiErrorError _self;
  final $Res Function(ApiErrorError) _then;

/// Create a copy of ApiErrorError
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? code = null,Object? messageKey = null,Object? fieldErrors = freezed,Object? retryAfterSeconds = freezed,}) {
  return _then(ApiErrorError(
code: null == code ? _self.code : code // ignore: cast_nullable_to_non_nullable
as ApiErrorErrorCode,messageKey: null == messageKey ? _self.messageKey : messageKey // ignore: cast_nullable_to_non_nullable
as String,fieldErrors: freezed == fieldErrors ? _self.fieldErrors : fieldErrors // ignore: cast_nullable_to_non_nullable
as List<ApiErrorErrorFieldErrorsItem>?,retryAfterSeconds: freezed == retryAfterSeconds ? _self.retryAfterSeconds : retryAfterSeconds // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}

}


/// Adds pattern-matching-related methods to [ApiErrorError].
extension ApiErrorErrorPatterns on ApiErrorError {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ApiErrorError value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ApiErrorError() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ApiErrorError value)  $default,){
final _that = this;
switch (_that) {
case _ApiErrorError():
return $default(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ApiErrorError value)?  $default,){
final _that = this;
switch (_that) {
case _ApiErrorError() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  ApiErrorErrorCode code, @JsonKey(disallowNullValue: true)  String messageKey, @JsonKey(disallowNullValue: true)  List<ApiErrorErrorFieldErrorsItem>? fieldErrors, @JsonKey(disallowNullValue: true)  int? retryAfterSeconds)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ApiErrorError() when $default != null:
return $default(_that.code,_that.messageKey,_that.fieldErrors,_that.retryAfterSeconds);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  ApiErrorErrorCode code, @JsonKey(disallowNullValue: true)  String messageKey, @JsonKey(disallowNullValue: true)  List<ApiErrorErrorFieldErrorsItem>? fieldErrors, @JsonKey(disallowNullValue: true)  int? retryAfterSeconds)  $default,) {final _that = this;
switch (_that) {
case _ApiErrorError():
return $default(_that.code,_that.messageKey,_that.fieldErrors,_that.retryAfterSeconds);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(disallowNullValue: true)  ApiErrorErrorCode code, @JsonKey(disallowNullValue: true)  String messageKey, @JsonKey(disallowNullValue: true)  List<ApiErrorErrorFieldErrorsItem>? fieldErrors, @JsonKey(disallowNullValue: true)  int? retryAfterSeconds)?  $default,) {final _that = this;
switch (_that) {
case _ApiErrorError() when $default != null:
return $default(_that.code,_that.messageKey,_that.fieldErrors,_that.retryAfterSeconds);case _:
  return null;

}
}

}

/// @nodoc

@JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
class _ApiErrorError implements ApiErrorError {
  const _ApiErrorError({@JsonKey(disallowNullValue: true) required this.code, @JsonKey(disallowNullValue: true) required this.messageKey, @JsonKey(disallowNullValue: true)  List<ApiErrorErrorFieldErrorsItem>? fieldErrors, @JsonKey(disallowNullValue: true) this.retryAfterSeconds}): _fieldErrors = fieldErrors;
  factory _ApiErrorError.fromJson(Map<String, dynamic> json) => _$ApiErrorErrorFromJson(json);

@override@JsonKey(disallowNullValue: true) final  ApiErrorErrorCode code;
@override@JsonKey(disallowNullValue: true) final  String messageKey;
 final  List<ApiErrorErrorFieldErrorsItem>? _fieldErrors;
@override@JsonKey(disallowNullValue: true) List<ApiErrorErrorFieldErrorsItem>? get fieldErrors {
  final value = _fieldErrors;
  if (value == null) return null;
  if (_fieldErrors is EqualUnmodifiableListView) return _fieldErrors;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}

@override@JsonKey(disallowNullValue: true) final  int? retryAfterSeconds;

/// Create a copy of ApiErrorError
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ApiErrorErrorCopyWith<_ApiErrorError> get copyWith => __$ApiErrorErrorCopyWithImpl<_ApiErrorError>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ApiErrorErrorToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _ApiErrorError&&(identical(other.code, code) || other.code == code)&&(identical(other.messageKey, messageKey) || other.messageKey == messageKey)&&const DeepCollectionEquality().equals(other.fieldErrors, _fieldErrors)&&(identical(other.retryAfterSeconds, retryAfterSeconds) || other.retryAfterSeconds == retryAfterSeconds));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,code,messageKey,const DeepCollectionEquality().hash(_fieldErrors),retryAfterSeconds);
}

@override
String toString() {
    return 'ApiErrorError(code: $code, messageKey: $messageKey, fieldErrors: $fieldErrors, retryAfterSeconds: $retryAfterSeconds)';
}


}

/// @nodoc
abstract mixin class _$ApiErrorErrorCopyWith<$Res> implements $ApiErrorErrorCopyWith<$Res> {
  factory _$ApiErrorErrorCopyWith(_ApiErrorError value, $Res Function(_ApiErrorError) _then) = __$ApiErrorErrorCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(disallowNullValue: true) ApiErrorErrorCode code,@JsonKey(disallowNullValue: true) String messageKey,@JsonKey(disallowNullValue: true) List<ApiErrorErrorFieldErrorsItem>? fieldErrors,@JsonKey(disallowNullValue: true) int? retryAfterSeconds
});




}
/// @nodoc
class __$ApiErrorErrorCopyWithImpl<$Res>
    implements _$ApiErrorErrorCopyWith<$Res> {
  __$ApiErrorErrorCopyWithImpl(this._self, this._then);

  final _ApiErrorError _self;
  final $Res Function(_ApiErrorError) _then;

/// Create a copy of ApiErrorError
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? code = null,Object? messageKey = null,Object? fieldErrors = freezed,Object? retryAfterSeconds = freezed,}) {
  return _then(_ApiErrorError(
code: null == code ? _self.code : code // ignore: cast_nullable_to_non_nullable
as ApiErrorErrorCode,messageKey: null == messageKey ? _self.messageKey : messageKey // ignore: cast_nullable_to_non_nullable
as String,fieldErrors: freezed == fieldErrors ? _self._fieldErrors : fieldErrors // ignore: cast_nullable_to_non_nullable
as List<ApiErrorErrorFieldErrorsItem>?,retryAfterSeconds: freezed == retryAfterSeconds ? _self.retryAfterSeconds : retryAfterSeconds // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}


}


/// @nodoc
mixin _$ApiErrorMeta {

@JsonKey(disallowNullValue: true) String get correlationId;
/// Create a copy of ApiErrorMeta
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ApiErrorMetaCopyWith<ApiErrorMeta> get copyWith => _$ApiErrorMetaCopyWithImpl<ApiErrorMeta>(this as ApiErrorMeta, _$identity);

  /// Serializes this ApiErrorMeta to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as ApiErrorMeta;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ApiErrorMeta&&(identical(other.correlationId, _this.correlationId) || other.correlationId == _this.correlationId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as ApiErrorMeta;
  return Object.hash(runtimeType,_this.correlationId);
}

@override
String toString() {
  final _this = this as ApiErrorMeta;
  return 'ApiErrorMeta(correlationId: ${_this.correlationId})';
}


}

/// @nodoc
abstract mixin class $ApiErrorMetaCopyWith<$Res>  {
  factory $ApiErrorMetaCopyWith(ApiErrorMeta value, $Res Function(ApiErrorMeta) _then) = _$ApiErrorMetaCopyWithImpl;
@useResult
$Res call({
@JsonKey(disallowNullValue: true) String correlationId
});




}
/// @nodoc
class _$ApiErrorMetaCopyWithImpl<$Res>
    implements $ApiErrorMetaCopyWith<$Res> {
  _$ApiErrorMetaCopyWithImpl(this._self, this._then);

  final ApiErrorMeta _self;
  final $Res Function(ApiErrorMeta) _then;

/// Create a copy of ApiErrorMeta
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? correlationId = null,}) {
  return _then(ApiErrorMeta(
correlationId: null == correlationId ? _self.correlationId : correlationId // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [ApiErrorMeta].
extension ApiErrorMetaPatterns on ApiErrorMeta {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ApiErrorMeta value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ApiErrorMeta() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ApiErrorMeta value)  $default,){
final _that = this;
switch (_that) {
case _ApiErrorMeta():
return $default(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ApiErrorMeta value)?  $default,){
final _that = this;
switch (_that) {
case _ApiErrorMeta() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  String correlationId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ApiErrorMeta() when $default != null:
return $default(_that.correlationId);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  String correlationId)  $default,) {final _that = this;
switch (_that) {
case _ApiErrorMeta():
return $default(_that.correlationId);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(disallowNullValue: true)  String correlationId)?  $default,) {final _that = this;
switch (_that) {
case _ApiErrorMeta() when $default != null:
return $default(_that.correlationId);case _:
  return null;

}
}

}

/// @nodoc

@JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
class _ApiErrorMeta implements ApiErrorMeta {
  const _ApiErrorMeta({@JsonKey(disallowNullValue: true) required this.correlationId});
  factory _ApiErrorMeta.fromJson(Map<String, dynamic> json) => _$ApiErrorMetaFromJson(json);

@override@JsonKey(disallowNullValue: true) final  String correlationId;

/// Create a copy of ApiErrorMeta
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ApiErrorMetaCopyWith<_ApiErrorMeta> get copyWith => __$ApiErrorMetaCopyWithImpl<_ApiErrorMeta>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ApiErrorMetaToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _ApiErrorMeta&&(identical(other.correlationId, correlationId) || other.correlationId == correlationId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,correlationId);
}

@override
String toString() {
    return 'ApiErrorMeta(correlationId: $correlationId)';
}


}

/// @nodoc
abstract mixin class _$ApiErrorMetaCopyWith<$Res> implements $ApiErrorMetaCopyWith<$Res> {
  factory _$ApiErrorMetaCopyWith(_ApiErrorMeta value, $Res Function(_ApiErrorMeta) _then) = __$ApiErrorMetaCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(disallowNullValue: true) String correlationId
});




}
/// @nodoc
class __$ApiErrorMetaCopyWithImpl<$Res>
    implements _$ApiErrorMetaCopyWith<$Res> {
  __$ApiErrorMetaCopyWithImpl(this._self, this._then);

  final _ApiErrorMeta _self;
  final $Res Function(_ApiErrorMeta) _then;

/// Create a copy of ApiErrorMeta
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? correlationId = null,}) {
  return _then(_ApiErrorMeta(
correlationId: null == correlationId ? _self.correlationId : correlationId // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$ApiError {

@JsonKey(disallowNullValue: true) ApiErrorError get error;@JsonKey(disallowNullValue: true) ApiErrorMeta get meta;
/// Create a copy of ApiError
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ApiErrorCopyWith<ApiError> get copyWith => _$ApiErrorCopyWithImpl<ApiError>(this as ApiError, _$identity);

  /// Serializes this ApiError to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  final _this = this as ApiError;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ApiError&&(identical(other.error, _this.error) || other.error == _this.error)&&(identical(other.meta, _this.meta) || other.meta == _this.meta));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
  final _this = this as ApiError;
  return Object.hash(runtimeType,_this.error,_this.meta);
}

@override
String toString() {
  final _this = this as ApiError;
  return 'ApiError(error: ${_this.error}, meta: ${_this.meta})';
}


}

/// @nodoc
abstract mixin class $ApiErrorCopyWith<$Res>  {
  factory $ApiErrorCopyWith(ApiError value, $Res Function(ApiError) _then) = _$ApiErrorCopyWithImpl;
@useResult
$Res call({
@JsonKey(disallowNullValue: true) ApiErrorError error,@JsonKey(disallowNullValue: true) ApiErrorMeta meta
});


$ApiErrorErrorCopyWith<$Res> get error;$ApiErrorMetaCopyWith<$Res> get meta;

}
/// @nodoc
class _$ApiErrorCopyWithImpl<$Res>
    implements $ApiErrorCopyWith<$Res> {
  _$ApiErrorCopyWithImpl(this._self, this._then);

  final ApiError _self;
  final $Res Function(ApiError) _then;

/// Create a copy of ApiError
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? error = null,Object? meta = null,}) {
  return _then(ApiError(
error: null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as ApiErrorError,meta: null == meta ? _self.meta : meta // ignore: cast_nullable_to_non_nullable
as ApiErrorMeta,
  ));
}
/// Create a copy of ApiError
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ApiErrorErrorCopyWith<$Res> get error {

  return $ApiErrorErrorCopyWith<$Res>(_self.error, (value) {
    return _then(_self.copyWith(error: value));
  });
}/// Create a copy of ApiError
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ApiErrorMetaCopyWith<$Res> get meta {

  return $ApiErrorMetaCopyWith<$Res>(_self.meta, (value) {
    return _then(_self.copyWith(meta: value));
  });
}
}


/// Adds pattern-matching-related methods to [ApiError].
extension ApiErrorPatterns on ApiError {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ApiError value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ApiError() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ApiError value)  $default,){
final _that = this;
switch (_that) {
case _ApiError():
return $default(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ApiError value)?  $default,){
final _that = this;
switch (_that) {
case _ApiError() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  ApiErrorError error, @JsonKey(disallowNullValue: true)  ApiErrorMeta meta)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ApiError() when $default != null:
return $default(_that.error,_that.meta);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(disallowNullValue: true)  ApiErrorError error, @JsonKey(disallowNullValue: true)  ApiErrorMeta meta)  $default,) {final _that = this;
switch (_that) {
case _ApiError():
return $default(_that.error,_that.meta);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(disallowNullValue: true)  ApiErrorError error, @JsonKey(disallowNullValue: true)  ApiErrorMeta meta)?  $default,) {final _that = this;
switch (_that) {
case _ApiError() when $default != null:
return $default(_that.error,_that.meta);case _:
  return null;

}
}

}

/// @nodoc

@JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)
class _ApiError implements ApiError {
  const _ApiError({@JsonKey(disallowNullValue: true) required this.error, @JsonKey(disallowNullValue: true) required this.meta});
  factory _ApiError.fromJson(Map<String, dynamic> json) => _$ApiErrorFromJson(json);

@override@JsonKey(disallowNullValue: true) final  ApiErrorError error;
@override@JsonKey(disallowNullValue: true) final  ApiErrorMeta meta;

/// Create a copy of ApiError
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ApiErrorCopyWith<_ApiError> get copyWith => __$ApiErrorCopyWithImpl<_ApiError>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ApiErrorToJson(this, );
}

@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _ApiError&&(identical(other.error, error) || other.error == error)&&(identical(other.meta, meta) || other.meta == meta));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode {
    return Object.hash(runtimeType,error,meta);
}

@override
String toString() {
    return 'ApiError(error: $error, meta: $meta)';
}


}

/// @nodoc
abstract mixin class _$ApiErrorCopyWith<$Res> implements $ApiErrorCopyWith<$Res> {
  factory _$ApiErrorCopyWith(_ApiError value, $Res Function(_ApiError) _then) = __$ApiErrorCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(disallowNullValue: true) ApiErrorError error,@JsonKey(disallowNullValue: true) ApiErrorMeta meta
});


@override $ApiErrorErrorCopyWith<$Res> get error;@override $ApiErrorMetaCopyWith<$Res> get meta;

}
/// @nodoc
class __$ApiErrorCopyWithImpl<$Res>
    implements _$ApiErrorCopyWith<$Res> {
  __$ApiErrorCopyWithImpl(this._self, this._then);

  final _ApiError _self;
  final $Res Function(_ApiError) _then;

/// Create a copy of ApiError
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? error = null,Object? meta = null,}) {
  return _then(_ApiError(
error: null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as ApiErrorError,meta: null == meta ? _self.meta : meta // ignore: cast_nullable_to_non_nullable
as ApiErrorMeta,
  ));
}

/// Create a copy of ApiError
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ApiErrorErrorCopyWith<$Res> get error {

  return $ApiErrorErrorCopyWith<$Res>(_self.error, (value) {
    return _then(_self.copyWith(error: value));
  });
}/// Create a copy of ApiError
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ApiErrorMetaCopyWith<$Res> get meta {

  return $ApiErrorMetaCopyWith<$Res>(_self.meta, (value) {
    return _then(_self.copyWith(meta: value));
  });
}
}

// dart format on
