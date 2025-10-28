// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'website.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Website _$WebsiteFromJson(Map<String, dynamic> json) => Website(
  id: (json['id'] as num).toInt(),
  subdomain: json['subdomain'] as String,
  title: json['title'] as String,
  description: json['description'] as String?,
  published: json['published'] as bool,
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$WebsiteToJson(Website instance) => <String, dynamic>{
  'id': instance.id,
  'subdomain': instance.subdomain,
  'title': instance.title,
  'description': instance.description,
  'published': instance.published,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};
