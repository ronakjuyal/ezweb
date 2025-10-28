import 'package:json_annotation/json_annotation.dart';
import 'component_registry.dart';

part 'website_component.g.dart';

@JsonSerializable()
class WebsiteComponent {
  final int id;
  final int websiteId;
  final ComponentRegistry componentRegistry;
  final String schemaData; // JSON string with customized values
  final int position;
  final bool visible;
  final DateTime createdAt;
  final DateTime updatedAt;

  WebsiteComponent({
    required this.id,
    required this.websiteId,
    required this.componentRegistry,
    required this.schemaData,
    required this.position,
    required this.visible,
    required this.createdAt,
    required this.updatedAt,
  });

  factory WebsiteComponent.fromJson(Map<String, dynamic> json) => _$WebsiteComponentFromJson(json);
  Map<String, dynamic> toJson() => _$WebsiteComponentToJson(this);
}
