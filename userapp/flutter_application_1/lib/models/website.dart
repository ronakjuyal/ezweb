import 'package:json_annotation/json_annotation.dart';

part 'website.g.dart';

@JsonSerializable()
class Website {
  final int id;
  final String subdomain;
  final String title;
  final String? description;
  final bool published;
  final DateTime createdAt;
  final DateTime updatedAt;

  Website({
    required this.id,
    required this.subdomain,
    required this.title,
    this.description,
    required this.published,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Website.fromJson(Map<String, dynamic> json) => _$WebsiteFromJson(json);
  Map<String, dynamic> toJson() => _$WebsiteToJson(this);
}
