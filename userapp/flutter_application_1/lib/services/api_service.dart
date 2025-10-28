import 'dart:io';
import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart' as http_parser;
import '../config/config.dart';
import '../models/user.dart';
import '../models/website.dart';
import '../models/component_registry.dart';
import '../models/website_component.dart';
import '../models/product.dart';
import '../models/category.dart';
import '../models/sub_category.dart';
import 'storage_service.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  late Dio _dio;
  final _storage = StorageService();

  void init() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: Duration(seconds: AppConfig.connectTimeout),
      receiveTimeout: Duration(seconds: AppConfig.receiveTimeout),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    // Add interceptors
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Add auth token to requests
        final token = _storage.getAccessToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        // Handle 401 errors (unauthorized)
        if (error.response?.statusCode == 401) {
          // Try to refresh token
          final refreshed = await _refreshToken();
          if (refreshed) {
            // Retry the request
            final opts = error.requestOptions;
            final token = _storage.getAccessToken();
            opts.headers['Authorization'] = 'Bearer $token';
            try {
              final response = await _dio.request(
                opts.path,
                options: Options(
                  method: opts.method,
                  headers: opts.headers,
                ),
                data: opts.data,
                queryParameters: opts.queryParameters,
              );
              return handler.resolve(response);
            } catch (e) {
              return handler.next(error);
            }
          }
        }
        return handler.next(error);
      },
    ));
  }

  // Refresh token
  Future<bool> _refreshToken() async {
    try {
      final refreshToken = _storage.getRefreshToken();
      if (refreshToken == null) return false;

      final response = await _dio.post(
        '/auth/refresh',
        queryParameters: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200) {
        final authResponse = AuthResponse.fromJson(response.data);
        await _storage.saveAccessToken(authResponse.accessToken);
        await _storage.saveRefreshToken(authResponse.refreshToken);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // Authentication APIs
  Future<AuthResponse> register(String username, String email, String password) async {
    try {
      final response = await _dio.post('/auth/register', data: {
        'username': username,
        'email': email,
        'password': password,
      });
      return AuthResponse.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<AuthResponse> login(String username, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'username': username,
        'password': password,
      });
      return AuthResponse.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  // Website APIs
  Future<List<Website>> getWebsites() async {
    try {
      final response = await _dio.get('/websites');
      return (response.data as List)
          .map((json) => Website.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<Website> getWebsiteById(int id) async {
    try {
      final response = await _dio.get('/websites/$id');
      return Website.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Website> createWebsite(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/websites', data: data);
      return Website.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Website> updateWebsite(int id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.put('/websites/$id', data: data);
      return Website.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteWebsite(int id) async {
    try {
      await _dio.delete('/websites/$id');
    } catch (e) {
      rethrow;
    }
  }

  // Component Registry APIs
  Future<List<ComponentRegistry>> getActiveComponents() async {
    try {
      final response = await _dio.get('/components');
      return (response.data as List)
          .map((json) => ComponentRegistry.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<ComponentRegistry>> getComponentsByCategory(String category) async {
    try {
      final response = await _dio.get('/components/category/$category');
      return (response.data as List)
          .map((json) => ComponentRegistry.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  // Website Component APIs
  Future<List<WebsiteComponent>> getWebsiteComponents(int websiteId) async {
    try {
      final response = await _dio.get('/websites/$websiteId/components');
      return (response.data as List)
          .map((json) => WebsiteComponent.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<WebsiteComponent> addComponentToWebsite(
    int websiteId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _dio.post('/websites/$websiteId/components', data: data);
      return WebsiteComponent.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<WebsiteComponent> updateWebsiteComponent(
    int websiteId,
    int componentId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _dio.put(
        '/websites/$websiteId/components/$componentId',
        data: data,
      );
      return WebsiteComponent.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteWebsiteComponent(int websiteId, int componentId) async {
    try {
      await _dio.delete('/websites/$websiteId/components/$componentId');
    } catch (e) {
      rethrow;
    }
  }

  Future<void> reorderComponents(int websiteId, List<int> componentIds) async {
    try {
      await _dio.put('/websites/$websiteId/components/reorder', data: componentIds);
    } catch (e) {
      rethrow;
    }
  }

  // Product APIs
  Future<List<Product>> getWebsiteProducts(int websiteId) async {
    try {
      final response = await _dio.get('/websites/$websiteId/products');
      return (response.data as List)
          .map((json) => Product.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<Product> createProduct(int websiteId, Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/websites/$websiteId/products', data: data);
      return Product.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Product> updateProduct(
    int websiteId,
    int productId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _dio.put(
        '/websites/$websiteId/products/$productId',
        data: data,
      );
      return Product.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteProduct(int websiteId, int productId) async {
    try {
      await _dio.delete('/websites/$websiteId/products/$productId');
    } catch (e) {
      rethrow;
    }
  }

  // Media Upload
  Future<Map<String, dynamic>> uploadMediaFile(int websiteId, File file) async {
    try {
      final fileName = file.path.split('/').last;
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(file.path, filename: fileName),
      });

      final response = await _dio.post(
        '/websites/$websiteId/media',
        data: formData,
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  // Upload media from bytes (for component form builder)
  Future<String> uploadMedia(
    List<int> bytes,
    String fileName,
    String mimeType,
    String folder,
  ) async {
    try {
      final formData = FormData.fromMap({
        'file': MultipartFile.fromBytes(
          bytes,
          filename: fileName,
          contentType: http_parser.MediaType.parse(mimeType),
        ),
        'folder': folder,
      });

      final response = await _dio.post(
        '/media/upload',
        data: formData,
      );

      // Return the S3 URL from response
      if (response.data is Map && response.data.containsKey('s3Url')) {
        return response.data['s3Url'];
      } else if (response.data is Map && response.data.containsKey('url')) {
        return response.data['url'];
      }

      return response.data.toString();
    } catch (e) {
      rethrow;
    }
  }

  // Category APIs
  Future<List<Category>> getWebsiteCategories(int websiteId, {bool activeOnly = false}) async {
    try {
      final response = await _dio.get(
        '/websites/$websiteId/categories',
        queryParameters: activeOnly ? {'activeOnly': true} : null,
      );
      return (response.data as List)
          .map((json) => Category.fromJson(json))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<Category> createCategory(int websiteId, Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/websites/$websiteId/categories', data: data);
      return Category.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Category> updateCategory(
    int websiteId,
    int categoryId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _dio.put(
        '/websites/$websiteId/categories/$categoryId',
        data: data,
      );
      return Category.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteCategory(int websiteId, int categoryId) async {
    try {
      await _dio.delete('/websites/$websiteId/categories/$categoryId');
    } catch (e) {
      rethrow;
    }
  }

  // Sub-Category APIs
  Future<SubCategory> createSubCategory(int websiteId, Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/websites/$websiteId/categories/sub-categories', data: data);
      return SubCategory.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<SubCategory> updateSubCategory(
    int websiteId,
    int subCategoryId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _dio.put(
        '/websites/$websiteId/categories/sub-categories/$subCategoryId',
        data: data,
      );
      return SubCategory.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteSubCategory(int websiteId, int subCategoryId) async {
    try {
      await _dio.delete('/websites/$websiteId/categories/sub-categories/$subCategoryId');
    } catch (e) {
      rethrow;
    }
  }

  // Error handling helper
  String getErrorMessage(dynamic error) {
    if (error is DioException) {
      if (error.response != null) {
        final data = error.response!.data;
        if (data is Map && data.containsKey('message')) {
          return data['message'];
        }
        return error.response!.statusMessage ?? 'An error occurred';
      }
      return 'Network error. Please check your connection.';
    }
    return error.toString();
  }
}
