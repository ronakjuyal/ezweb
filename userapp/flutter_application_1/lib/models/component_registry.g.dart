// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'component_registry.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ComponentRegistry _$ComponentRegistryFromJson(Map<String, dynamic> json) =>
    ComponentRegistry(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String,
      description: json['description'] as String?,
      s3FileUrl: json['s3FileUrl'] as String,
      schema: json['schema'] as String,
      category: json['category'] as String?,
      version: json['version'] as String,
      active: json['active'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$ComponentRegistryToJson(ComponentRegistry instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      's3FileUrl': instance.s3FileUrl,
      'schema': instance.schema,
      'category': instance.category,
      'version': instance.version,
      'active': instance.active,
      'createdAt': instance.createdAt.toIso8601String(),
    };
