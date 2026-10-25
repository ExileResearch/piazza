import 'wire_schemas.dart';

/// Structural validation for this generated fixture subset. Server-only
/// refinements and live authority are deliberately outside this validator.
void validateWire(String name, Map<String, dynamic> value) {
  _validate(wireSchemas[name] as Map<String, dynamic>, value);
}

void _validate(Map<String, dynamic> schema, dynamic value) {
  Never fail() => throw const FormatException('Invalid contract value');
  for (final unionKey in ['oneOf', 'anyOf']) {
    if (schema.containsKey(unionKey)) {
      var matches = 0;
      for (final branch in schema[unionKey] as List) {
        try {
          _validate(branch as Map<String, dynamic>, value);
          matches++;
        } on FormatException { /* Try the next bounded branch. */ }
      }
      if (matches == 0 || (unionKey == 'oneOf' && matches != 1)) fail();
      return;
    }
  }
  if (value == null) fail();
  if (schema.containsKey('const') && value != schema['const']) fail();
  if (schema['enum'] != null && !(schema['enum'] as List).contains(value)) fail();
  switch (schema['type']) {
    case 'object':
      if (value is! Map<String, dynamic>) fail();
      final props = schema['properties'] as Map<String, dynamic>;
      if (schema['additionalProperties'] == false && value.keys.any((key) => !props.containsKey(key))) fail();
      for (final key in (schema['required'] as List? ?? [])) {
        if (!value.containsKey(key)) fail();
      }
      for (final key in value.keys) {
        if (props.containsKey(key)) _validate(props[key] as Map<String, dynamic>, value[key]);
      }
    case 'array':
      if (value is! List) fail();
      if (value.length < (schema['minItems'] as int? ?? 0) || value.length > (schema['maxItems'] as int? ?? 9007199254740991)) fail();
      for (final item in value) { _validate(schema['items'] as Map<String, dynamic>, item); }
    case 'string':
      if (value is! String) fail();
      if (value.length < (schema['minLength'] as int? ?? 0) || value.length > (schema['maxLength'] as int? ?? 9007199254740991)) fail();
      if (schema['pattern'] != null && !RegExp(schema['pattern'] as String).hasMatch(value)) fail();
      if (schema['format'] == 'date-time') {
        final date = DateTime.tryParse(value);
        if (date == null || date.toUtc().toIso8601String() != value) fail();
      }
    case 'integer':
      if (value is! int) fail();
      if (value < (schema['minimum'] as num? ?? double.negativeInfinity) || value > (schema['maximum'] as num? ?? double.infinity)) fail();
    case 'boolean':
      if (value is! bool) fail();
    default:
      fail();
  }
}
