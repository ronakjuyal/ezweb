import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final StorageService _storage = StorageService();

  bool _isLoading = false;
  bool _isAuthenticated = false;
  String? _username;
  String? _email;
  int? _userId;
  String? _errorMessage;

  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get username => _username;
  String? get email => _email;
  int? get userId => _userId;
  String? get errorMessage => _errorMessage;

  // Check if user is already logged in
  Future<void> checkAuthStatus() async {
    _isAuthenticated = _storage.isLoggedIn();
    if (_isAuthenticated) {
      _userId = _storage.getUserId();
      _username = _storage.getUsername();
      _email = _storage.getEmail();
    }
    notifyListeners();
  }

  // Register
  Future<bool> register(String username, String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final authResponse = await _apiService.register(username, email, password);

      // Save tokens and user data
      await _storage.saveAccessToken(authResponse.accessToken);
      await _storage.saveRefreshToken(authResponse.refreshToken);
      await _storage.saveUserId(authResponse.userId);
      await _storage.saveUsername(authResponse.username);
      await _storage.saveEmail(authResponse.email);

      _isAuthenticated = true;
      _userId = authResponse.userId;
      _username = authResponse.username;
      _email = authResponse.email;

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

  // Login
  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final authResponse = await _apiService.login(username, password);

      // Save tokens and user data
      await _storage.saveAccessToken(authResponse.accessToken);
      await _storage.saveRefreshToken(authResponse.refreshToken);
      await _storage.saveUserId(authResponse.userId);
      await _storage.saveUsername(authResponse.username);
      await _storage.saveEmail(authResponse.email);

      _isAuthenticated = true;
      _userId = authResponse.userId;
      _username = authResponse.username;
      _email = authResponse.email;

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

  // Logout
  Future<void> logout() async {
    await _storage.clearAll();
    _isAuthenticated = false;
    _userId = null;
    _username = null;
    _email = null;
    _errorMessage = null;
    notifyListeners();
  }

  // Clear error
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
