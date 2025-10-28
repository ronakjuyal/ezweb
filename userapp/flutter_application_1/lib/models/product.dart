import 'package:json_annotation/json_annotation.dart';

part 'product.g.dart';

@JsonSerializable()
class Product {
  final int id;
  final int websiteId;
  final String name;
  final String? description;
  final double price;
  final String? imageUrl;
  final List<String>? imageUrls;  // Multiple images (max 5)
  final int stock;
  final bool available;
  final String? category;
  final String? sku;
  final DateTime createdAt;
  final DateTime updatedAt;

  Product({
    required this.id,
    required this.websiteId,
    required this.name,
    this.description,
    required this.price,
    this.imageUrl,
    this.imageUrls,
    required this.stock,
    required this.available,
    this.category,
    this.sku,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) => _$ProductFromJson(json);
  Map<String, dynamic> toJson() => _$ProductToJson(this);
}
