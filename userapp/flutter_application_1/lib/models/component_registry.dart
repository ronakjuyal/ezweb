import 'package:json_annotation/json_annotation.dart';

part 'component_registry.g.dart';

@JsonSerializable()
class ComponentRegistry {
  final int id;
  final String name;
  final String? description;
  final String s3FileUrl;
  final String schema; // JSON string
  final String? category;
  final String version;
  final bool active;
  final DateTime createdAt;

  ComponentRegistry({
    required this.id,
    required this.name,
    this.description,
    required this.s3FileUrl,
    required this.schema,
    this.category,
    required this.version,
    required this.active,
    required this.createdAt,
  });

  factory ComponentRegistry.fromJson(Map<String, dynamic> json) => _$ComponentRegistryFromJson(json);
  Map<String, dynamic> toJson() => _$ComponentRegistryToJson(this);
}
