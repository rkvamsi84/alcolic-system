// Production Configuration for Netlify Deployment
// This file overrides development settings for production builds

export const PRODUCTION_CONFIG = {
  // Backend API Configuration
  API_BASE_URL: 'https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app',
  SOCKET_URL: 'https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app',
  WS_URL: 'https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app',
  
  // App Configuration
  APP_NAME: 'Alcolic User Web App',
  APP_VERSION: '1.0.0',
  ENVIRONMENT: 'production',
  
  // Feature Flags
  ENABLE_ANALYTICS: true,
  ENABLE_DEBUG_LOGGING: false,
  ENABLE_DEVELOPMENT_TOOLS: false,
  
  // API Settings
  API_TIMEOUT: 30000,
  API_RETRY_ATTEMPTS: 3,
  
  // CORS Settings
  CORS_MODE: 'cors',
  CORS_CREDENTIALS: 'omit',
  
  // Socket Settings
  SOCKET_TIMEOUT: 20000,
  SOCKET_RECONNECTION_ATTEMPTS: 5,
  SOCKET_RECONNECTION_DELAY: 5000,
};

// Override API configuration for production
export const getProductionApiConfig = () => ({
  baseURL: `${PRODUCTION_CONFIG.API_BASE_URL}/api/v1`,
  timeout: PRODUCTION_CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
    // Minimal headers to avoid CORS issues
  },
  mode: PRODUCTION_CONFIG.CORS_MODE,
  credentials: PRODUCTION_CONFIG.CORS_CREDENTIALS,
});

// Override Socket configuration for production
export const getProductionSocketConfig = () => ({
  url: PRODUCTION_CONFIG.SOCKET_URL,
  options: {
    transports: ['websocket', 'polling'],
    timeout: PRODUCTION_CONFIG.SOCKET_TIMEOUT,
    reconnection: true,
    reconnectionAttempts: PRODUCTION_CONFIG.SOCKET_RECONNECTION_ATTEMPTS,
    reconnectionDelay: PRODUCTION_CONFIG.SOCKET_RECONNECTION_DELAY,
    withCredentials: false,
    forceNew: true,
    upgrade: true,
    rememberUpgrade: false,
  },
});

// Production-specific API endpoints
export const PRODUCTION_ENDPOINTS = {
  // Health check
  health: `${PRODUCTION_CONFIG.API_BASE_URL}/api/health`,
  
  // API base
  api: `${PRODUCTION_CONFIG.API_BASE_URL}/api/v1`,
  
  // Categories (for testing)
  categories: `${PRODUCTION_CONFIG.API_BASE_URL}/api/v1/categories`,
  
  // Authentication
  auth: {
    login: `${PRODUCTION_CONFIG.API_BASE_URL}/api/v1/auth/login`,
    register: `${PRODUCTION_CONFIG.API_BASE_URL}/api/v1/auth/register`,
    profile: `${PRODUCTION_CONFIG.API_BASE_URL}/api/v1/auth/profile`,
  },
};

// Production environment check
export const isProduction = () => {
  return process.env.NODE_ENV === 'production' || 
         window.location.hostname !== 'localhost';
};

// Get appropriate configuration based on environment
export const getConfig = () => {
  if (isProduction()) {
    return {
      api: getProductionApiConfig(),
      socket: getProductionSocketConfig(),
      endpoints: PRODUCTION_ENDPOINTS,
      ...PRODUCTION_CONFIG,
    };
  }
  
  // Fallback to development config
  return {
    api: {
      baseURL: process.env.REACT_APP_API_BASE_URL || 'https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app/api/v1',
    },
    socket: {
      url: process.env.REACT_APP_SOCKET_URL || 'https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app',
    },
  };
};
