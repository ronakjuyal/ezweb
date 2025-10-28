import 'package:flutter/material.dart';
import '../models/category.dart';
import '../models/sub_category.dart';
import '../services/api_service.dart';

class CategoryProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Category> _categories = [];
  bool _isLoading = false;
  String? _error;

  List<Category> get categories => _categories;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Fetch categories for a website
  Future<void> fetchWebsiteCategories(int websiteId, {bool activeOnly = false}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _categories = await _apiService.getWebsiteCategories(websiteId, activeOnly: activeOnly);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = _apiService.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
    }
  }

  // Create category
  Future<bool> createCategory(int websiteId, Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final category = await _apiService.createCategory(websiteId, data);
      _categories.add(category);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = _apiService.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Update category
  Future<bool> updateCategory(int websiteId, int categoryId, Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final updated = await _apiService.updateCategory(websiteId, categoryId, data);
      final index = _categories.indexWhere((c) => c.id == categoryId);
      if (index != -1) {
        _categories[index] = updated;
      }
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = _apiService.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Delete category
  Future<bool> deleteCategory(int websiteId, int categoryId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.deleteCategory(websiteId, categoryId);
      _categories.removeWhere((c) => c.id == categoryId);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = _apiService.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Create sub-category
  Future<bool> createSubCategory(int websiteId, Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final subCategory = await _apiService.createSubCategory(websiteId, data);

      // Add the sub-category to the appropriate category in the local list
      final categoryId = data['categoryId'] as int;
      final categoryIndex = _categories.indexWhere((c) => c.id == categoryId);
      if (categoryIndex != -1) {
        final category = _categories[categoryIndex];
        final updatedSubCategories = List<SubCategory>.from(category.subCategories ?? [])
          ..add(subCategory);

        _categories[categoryIndex] = Category(
          id: category.id,
          websiteId: category.websiteId,
          name: category.name,
          description: category.description,
          active: category.active,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          subCategories: updatedSubCategories,
        );
      }

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = _apiService.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Update sub-category
  Future<bool> updateSubCategory(int websiteId, int subCategoryId, Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final updated = await _apiService.updateSubCategory(websiteId, subCategoryId, data);

      // Update the sub-category in the local list
      for (var i = 0; i < _categories.length; i++) {
        final category = _categories[i];
        if (category.subCategories != null) {
          final subCatIndex = category.subCategories!.indexWhere((sc) => sc.id == subCategoryId);
          if (subCatIndex != -1) {
            final updatedSubCategories = List<SubCategory>.from(category.subCategories!);
            updatedSubCategories[subCatIndex] = updated;

            _categories[i] = Category(
              id: category.id,
              websiteId: category.websiteId,
              name: category.name,
              description: category.description,
              active: category.active,
              createdAt: category.createdAt,
              updatedAt: category.updatedAt,
              subCategories: updatedSubCategories,
            );
            break;
          }
        }
      }

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = _apiService.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Delete sub-category
  Future<bool> deleteSubCategory(int websiteId, int subCategoryId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.deleteSubCategory(websiteId, subCategoryId);

      // Remove the sub-category from the local list
      for (var i = 0; i < _categories.length; i++) {
        final category = _categories[i];
        if (category.subCategories != null) {
          final updatedSubCategories = category.subCategories!
              .where((sc) => sc.id != subCategoryId)
              .toList();

          if (updatedSubCategories.length != category.subCategories!.length) {
            _categories[i] = Category(
              id: category.id,
              websiteId: category.websiteId,
              name: category.name,
              description: category.description,
              active: category.active,
              createdAt: category.createdAt,
              updatedAt: category.updatedAt,
              subCategories: updatedSubCategories,
            );
            break;
          }
        }
      }

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = _apiService.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
