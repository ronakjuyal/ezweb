import 'package:shared_preferences/shared_preferences.dart';
import '../config/config.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Token Management
  Future<void> saveAccessToken(String token) async {
    await _prefs?.setString(AppConfig.accessTokenKey, token);
  }

  String? getAccessToken() {
    return _prefs?.getString(AppConfig.accessTokenKey);
  }

  Future<void> saveRefreshToken(String token) async {
    await _prefs?.setString(AppConfig.refreshTokenKey, token);
  }

  String? getRefreshToken() {
    return _prefs?.getString(AppConfig.refreshTokenKey);
  }

  // User Data
  Future<void> saveUserId(int id) async {
    await _prefs?.setInt(AppConfig.userIdKey, id);
  }

  int? getUserId() {
    return _prefs?.getInt(AppConfig.userIdKey);
  }

  Future<void> saveUsername(String username) async {
    await _prefs?.setString(AppConfig.usernameKey, username);
  }

  String? getUsername() {
    return _prefs?.getString(AppConfig.usernameKey);
  }

  Future<void> saveEmail(String email) async {
    await _prefs?.setString(AppConfig.emailKey, email);
  }

  String? getEmail() {
    return _prefs?.getString(AppConfig.emailKey);
  }

  // Check if user is logged in
  bool isLoggedIn() {
    final token = getAccessToken();
    return token != null && token.isNotEmpty;
  }

  // Clear all data (logout)
  Future<void> clearAll() async {
    await _prefs?.remove(AppConfig.accessTokenKey);
    await _prefs?.remove(AppConfig.refreshTokenKey);
    await _prefs?.remove(AppConfig.userIdKey);
    await _prefs?.remove(AppConfig.usernameKey);
    await _prefs?.remove(AppConfig.emailKey);
  }
}
