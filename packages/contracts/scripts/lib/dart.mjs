// Deliberately bounded generator for the representative fixture subset, not a full Dart SDK.
export function generateDart(openapi) {
  const selected = [
    "RegisterRequest",
    "UpdatePreferences",
    "ArtifactMetadata",
    "AuthResult",
    "ApiError",
  ];
  const schemas = {},
    declarations = [];
  const pascal = (s) =>
    s.replace(/(^|_)([a-z])/g, (_, a, b) => b.toUpperCase());
  const quote = (s) => JSON.stringify(s);
  function type(s, name) {
    if (s.enum || s.const !== undefined) {
      const values = s.enum ?? [s.const];
      if (values.every((v) => typeof v === "string")) {
        declarations.push(
          `enum ${name} {\n${values.map((v, i) => `  @JsonValue(${quote(v)})\n  value${i},`).join("\n")}\n}`,
        );
        return name;
      }
    }
    if (s.type === "object") return model(name, s);
    if (s.type === "array") return `List<${type(s.items, name + "Item")}>`;
    if (s.type === "string") return "String";
    if (s.type === "integer") return "int";
    if (s.type === "number") return "double";
    if (s.type === "boolean") return "bool";
    if (s.anyOf?.every((v) => ["string", "integer"].includes(v.type)))
      return "Object";
    throw Error(
      `Unsupported representative type ${name}: ${JSON.stringify(s)}`,
    );
  }
  function fields(s, name, skipStatus = false) {
    return Object.entries(s.properties)
      .filter(([k]) => !skipStatus || k !== "status")
      .map(([k, v]) => {
        const t = type(v, name + pascal(k));
        const required = s.required?.includes(k);
        const annotation = "@JsonKey(disallowNullValue: true) ";
        if (!required && v.default !== undefined) {
          const value = v.enum
            ? `${t}.value${v.enum.indexOf(v.default)}`
            : quote(v.default);
          return `    ${annotation}@Default(${value}) ${t} ${k},`;
        }
        return `    ${annotation}${required ? "required " : ""}${t}${required ? "" : "?"} ${k},`;
      })
      .join("\n");
  }
  function model(name, s) {
    schemas[name] = s;
    let constructors;
    if (s.oneOf) {
      constructors = s.oneOf
        .map((v) => {
          const status = v.properties.status.const;
          return `  @FreezedUnionValue(${quote(status)})\n  @JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)\n  const factory ${name}.${status}({\n${fields(v, name + pascal(status), true)}\n  }) = ${name}${pascal(status)};`;
        })
        .join("\n");
    } else
      constructors = `  @JsonSerializable(checked: true, disallowUnrecognizedKeys: true, explicitToJson: true, includeIfNull: false)\n  const factory ${name}({\n${fields(s, name)}\n  }) = _${name};`;
    declarations.push(
      `${s.oneOf ? '@Freezed(unionKey: "status", fromJson: true, toJson: true)' : "@Freezed(fromJson: true, toJson: true)"}\nsealed class ${name} with _$${name} {\n${constructors}\n  factory ${name}.fromJson(Map<String, dynamic> json) {\n    validateWire(${quote(name)}, json);\n    return _$${name}FromJson(json);\n  }\n}`,
    );
    return name;
  }
  for (const name of selected) model(name, openapi.components.schemas[name]);
  const output = `// GENERATED from generated/openapi.json; edit canonical Zod schemas and regenerate.\n// ignore_for_file: invalid_annotation_target\nimport 'package:freezed_annotation/freezed_annotation.dart';\nimport 'wire_validation.dart';\npart 'models.freezed.dart';\npart 'models.g.dart';\n\n${declarations.join("\n\n")}\n`;
  const schemaOutput = `// GENERATED validation subset from the same OpenAPI component schemas.\nimport 'dart:convert';\nfinal Map<String, dynamic> wireSchemas = jsonDecode(r'''${JSON.stringify(schemas)}''') as Map<String, dynamic>;\n`;
  // Format via pinned Dart after generation; drift checks compare its formatter output below.
  return [
    ["compat/dart/lib/models.dart", output],
    ["compat/dart/lib/wire_schemas.dart", schemaOutput],
  ];
}
