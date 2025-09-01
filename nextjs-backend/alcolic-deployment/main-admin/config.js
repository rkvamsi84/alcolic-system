// Main Admin Panel Configuration for Subdomain Structure
window.MAIN_ADMIN_CONFIG = {
  // API Configuration
  API_BASE_URL: 'https://api.alcolic.gnritservices.com/api/v1',
  SOCKET_URL: 'https://api.alcolic.gnritservices.com',
  
  // App URLs
  MAIN_DOMAIN: 'https://alcolic.gnritservices.com',
  STORE_ADMIN_URL: 'https://store.alcolic.gnritservices.com',
  MAIN_ADMIN_URL: 'https://admin.alcolic.gnritservices.com',
  
  // App Settings
  APP_NAME: 'Alcolic Main Admin',
  VERSION: '1.0.0',
  
  // Features
  ENABLE_REAL_TIME: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_FINANCIAL_REPORTS: true,
  ENABLE_SYSTEM_MANAGEMENT: true,
  
  // Timeouts
  API_TIMEOUT: 30000,
  SOCKET_TIMEOUT: 20000,
  
  // Storage Keys
  AUTH_TOKEN_KEY: 'alcolic_main_auth_token',
  ADMIN_DATA_KEY: 'alcolic_admin_data',
  SETTINGS_KEY: 'alcolic_admin_settings',
  
  // Default Settings
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_CURRENCY: 'USD',
  DEFAULT_TIMEZONE: 'UTC',
  
  // Admin Management
  MAX_USERS_PER_PAGE: 100,
  MAX_STORES_PER_PAGE: 50,
  MAX_ORDERS_PER_PAGE: 100,
  AUTO_REFRESH_INTERVAL: 30000,
  
  // Security
  SESSION_TIMEOUT: 3600000, // 1 hour
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900000 // 15 minutes
};
