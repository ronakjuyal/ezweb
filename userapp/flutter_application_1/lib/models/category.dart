import 'package:json_annotation/json_annotation.dart';
import 'sub_category.dart';

part 'category.g.dart';

@JsonSerializable()
class Category {
  final int? id;
  final int? websiteId;
  final String name;
  final String? description;
  final bool? active;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final List<SubCategory>? subCategories;

  Category({
    this.id,
    this.websiteId,
    required this.name,
    this.description,
    this.active,
    this.createdAt,
    this.updatedAt,
    this.subCategories,
  });

  factory Category.fromJson(Map<String, dynamic> json) => _$CategoryFromJson(json);
  Map<String, dynamic> toJson() => _$CategoryToJson(this);
}
