import 'package:flutter/material.dart';
import '../models/component_registry.dart';
import '../models/website_component.dart';
import '../services/api_service.dart';

class ComponentProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<ComponentRegistry> _availableComponents = [];
  List<WebsiteComponent> _websiteComponents = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<ComponentRegistry> get availableComponents => _availableComponents;
  List<WebsiteComponent> get websiteComponents => _websiteComponents;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Fetch available components from registry
  Future<void> fetchAvailableComponents() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _availableComponents = await _apiService.getActiveComponents();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = _apiService.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch components for a specific website
  Future<void> fetchWebsiteComponents(int websiteId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _websiteComponents = await _apiService.getWebsiteComponents(websiteId);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = _apiService.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
    }
  }

  // Add component to website
  Future<bool> addComponentToWebsite(
    int websiteId,
    int componentRegistryId,
    String schemaData,
    int position,
  ) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final component = await _apiService.addComponentToWebsite(websiteId, {
        'componentRegistryId': componentRegistryId,
        'schemaData': schemaData,
        'position': position,
        'visible': true,
      });

      _websiteComponents.add(component);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = _apiService.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Update component
  Future<bool> updateWebsiteComponent(
    int websiteId,
    int componentId,
    String schemaData,
    int position,
    bool visible,
  ) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final updated = await _apiService.updateWebsiteComponent(
        websiteId,
        componentId,
        {
          'componentRegistryId': _websiteComponents
              .firstWhere((c) => c.id == componentId)
              .componentRegistry
              .id,
          'schemaData': schemaData,
          'position': position,
          'visible': visible,
        },
      );

      final index = _websiteComponents.indexWhere((c) => c.id == componentId);
      if (index != -1) {
        _websiteComponents[index] = updated;
      }

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = _apiService.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Delete component
  Future<bool> deleteWebsiteComponent(int websiteId, int componentId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _apiService.deleteWebsiteComponent(websiteId, componentId);
      _websiteComponents.removeWhere((c) => c.id == componentId);

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = _apiService.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Reorder components
  Future<bool> reorderComponents(int websiteId, List<int> componentIds) async {
    try {
      await _apiService.reorderComponents(websiteId, componentIds);
      await fetchWebsiteComponents(websiteId);
      return true;
    } catch (e) {
      _errorMessage = _apiService.getErrorMessage(e);
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
