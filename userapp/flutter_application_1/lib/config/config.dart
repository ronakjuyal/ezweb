class AppConfig {
  // API Configuration
  static const String apiBaseUrl = 'http://10.0.2.2:8080/api'; // Android emulator
  // For iOS simulator use: 'http://localhost:8080/api'
  // For physical device use: 'http://YOUR_IP:8080/api'

  // App Configuration
  static const String appName = 'EZWeb';
  static const String appVersion = '1.0.0';

  // Storage Keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userIdKey = 'user_id';
  static const String usernameKey = 'username';
  static const String emailKey = 'email';

  // API Timeouts (in seconds)
  static const int connectTimeout = 30;
  static const int receiveTimeout = 30;

  // Pagination
  static const int defaultPageSize = 20;
}
