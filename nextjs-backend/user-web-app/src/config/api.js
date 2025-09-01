// User Web App API Configuration for Vercel Deployment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1?x-vercel-protection-bypass=rkvamsi84gmailcom';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app?x-vercel-protection-bypass=rkvamsi84gmailcom';

// API Configuration
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  credentials: 'omit', // Fixed for Vercel CORS policy
  mode: 'cors'
};

// Socket.io Configuration
export const SOCKET_CONFIG = {
  url: SOCKET_URL,
  options: {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    withCredentials: false
  },
};

// API Endpoints
export const ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/change-password',
  
  // User endpoints
  USERS: '/users',
  
  // Store endpoints
  STORES: '/stores',
  STORE_BY_ID: (id) => `/stores/${id}`,
  
  // Product endpoints
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id) => `/products/${id}`,
  PRODUCT_CREATE: '/products/create',
  PRODUCT_UPDATE: (id) => `/products/${id}/update`,
  
  // Category endpoints
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: (id) => `/categories/${id}`,
  
  // Order endpoints
  ORDERS: '/orders',
  ORDER_BY_ID: (id) => `/orders/${id}`,
  ORDER_CREATE: '/orders/create',
  ORDER_STATUS: (id) => `/orders/${id}/status`,
  
  // Health check
  HEALTH: '/',
};

// API Service with error handling
export const apiService = {
  async request(endpoint, options = {}) {
    try {
      const url = `${API_CONFIG.baseURL}${endpoint}`;
      const config = {
        ...API_CONFIG,
        ...options,
        headers: {
          ...API_CONFIG.headers,
          ...options.headers,
        },
      };

      // Add auth token if available
      const token = localStorage.getItem('alcolic_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};

// App Configuration
export const APP_CONFIG = {
  name: 'Alcolic',
  version: '1.0.0',
  apiBaseUrl: API_BASE_URL,
  socketUrl: SOCKET_URL,
  environment: process.env.NODE_ENV || 'development',
  
  // Features
  enableRealTime: true,
  enableNotifications: true,
  enablePayments: true,
  
  // Storage keys
  authTokenKey: 'alcolic_auth_token',
  userDataKey: 'alcolic_user_data',
  cartKey: 'alcolic_cart',
  
  // Default settings
  defaultLanguage: 'en',
  defaultCurrency: 'USD',
  defaultTimezone: 'UTC',
};
