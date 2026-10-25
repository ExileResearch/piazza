import 'dart:convert';
import 'dart:io';
import 'package:piazza_contract_parity/models.dart';

void main(List<String> args) {
  final fixtures = jsonDecode(File(args.single).readAsStringSync()) as List;
  for (var i = 0; i < fixtures.length; i++) {
    final fixture = fixtures[i] as Map<String, dynamic>;
    final value = fixture['value'] as Map<String, dynamic>;
    dynamic model;
    Object? error;
    try {
      model = switch (fixture['schema']) {
        'RegisterRequest' => RegisterRequest.fromJson(value),
        'UpdatePreferences' => UpdatePreferences.fromJson(value),
        'ArtifactMetadata' => ArtifactMetadata.fromJson(value),
        'AuthResult' => AuthResult.fromJson(value),
        'ApiError' => ApiError.fromJson(value),
        _ => throw StateError('Unknown fixture schema'),
      };
    } catch (e) { error = e; }
    if ((error == null) != fixture['valid']) {
      throw StateError('Fixture $i disagrees: $error');
    }
    if (error == null && _canonical(model.toJson()) != _canonical(fixture['expected'] ?? value)) {
      throw StateError('Fixture $i changed the wire representation');
    }
  }
  stdout.writeln('Dart/Freezed parity: ${fixtures.length} fixtures passed');
}
String _canonical(dynamic value) {
  if (value is Map) {
    final keys = value.keys.cast<String>().toList()..sort();
    return '{${keys.map((key) => '${jsonEncode(key)}:${_canonical(value[key])}').join(',')}}';
  }
  if (value is List) return '[${value.map(_canonical).join(',')}]';
  return jsonEncode(value);
}
