// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'website_component.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WebsiteComponent _$WebsiteComponentFromJson(Map<String, dynamic> json) =>
    WebsiteComponent(
      id: (json['id'] as num).toInt(),
      websiteId: (json['websiteId'] as num).toInt(),
      componentRegistry: ComponentRegistry.fromJson(
        json['componentRegistry'] as Map<String, dynamic>,
      ),
      schemaData: json['schemaData'] as String,
      position: (json['position'] as num).toInt(),
      visible: json['visible'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$WebsiteComponentToJson(WebsiteComponent instance) =>
    <String, dynamic>{
      'id': instance.id,
      'websiteId': instance.websiteId,
      'componentRegistry': instance.componentRegistry,
      'schemaData': instance.schemaData,
      'position': instance.position,
      'visible': instance.visible,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };
