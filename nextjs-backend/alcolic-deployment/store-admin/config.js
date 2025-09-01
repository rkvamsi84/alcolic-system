// Store Admin Panel Configuration for Subdomain Structure
window.STORE_ADMIN_CONFIG = {
  // API Configuration
  API_BASE_URL: 'https://api.alcolic.gnritservices.com/api/v1',
  SOCKET_URL: 'https://api.alcolic.gnritservices.com',
  
  // App URLs
  MAIN_DOMAIN: 'https://alcolic.gnritservices.com',
  STORE_ADMIN_URL: 'https://store.alcolic.gnritservices.com',
  MAIN_ADMIN_URL: 'https://admin.alcolic.gnritservices.com',
  
  // App Settings
  APP_NAME: 'Alcolic Store Admin',
  VERSION: '1.0.0',
  
  // Features
  ENABLE_REAL_TIME: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
  
  // Timeouts
  API_TIMEOUT: 30000,
  SOCKET_TIMEOUT: 20000,
  
  // Storage Keys
  AUTH_TOKEN_KEY: 'alcolic_store_auth_token',
  STORE_DATA_KEY: 'alcolic_store_data',
  SETTINGS_KEY: 'alcolic_store_settings',
  
  // Default Settings
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_CURRENCY: 'USD',
  DEFAULT_TIMEZONE: 'UTC',
  
  // Store Management
  MAX_PRODUCTS: 1000,
  MAX_ORDERS_PER_PAGE: 50,
  AUTO_REFRESH_INTERVAL: 30000
};
