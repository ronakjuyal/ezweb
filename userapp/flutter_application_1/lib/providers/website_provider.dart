import 'package:flutter/material.dart';
import '../models/website.dart';
import '../services/api_service.dart';

class WebsiteProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Website> _websites = [];
  Website? _selectedWebsite;
  bool _isLoading = false;
  String? _errorMessage;

  List<Website> get websites => _websites;
  Website? get selectedWebsite => _selectedWebsite;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Fetch all websites
  Future<void> fetchWebsites() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _websites = await _apiService.getWebsites();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = _apiService.getErrorMessage(e);
      _isLoading = false;
      notifyListeners();
    }
  }

  // Select a website
  void selectWebsite(Website website) {
    _selectedWebsite = website;
    notifyListeners();
  }

  // Create website
  Future<bool> createWebsite({
    required String subdomain,
    required String title,
    String? description,
    bool published = false,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final website = await _apiService.createWebsite({
        'subdomain': subdomain,
        'title': title,
        'description': description,
        'published': published,
      });

      _websites.add(website);
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

  // Update website
  Future<bool> updateWebsite({
    required int id,
    required String subdomain,
    required String title,
    String? description,
    required bool published,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final updatedWebsite = await _apiService.updateWebsite(id, {
        'subdomain': subdomain,
        'title': title,
        'description': description,
        'published': published,
      });

      final index = _websites.indexWhere((w) => w.id == id);
      if (index != -1) {
        _websites[index] = updatedWebsite;
        if (_selectedWebsite?.id == id) {
          _selectedWebsite = updatedWebsite;
        }
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

  // Delete website
  Future<bool> deleteWebsite(int id) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _apiService.deleteWebsite(id);
      _websites.removeWhere((w) => w.id == id);
      if (_selectedWebsite?.id == id) {
        _selectedWebsite = null;
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

  // Clear error
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
