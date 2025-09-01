// Main Admin Panel Configuration for Vercel Deployment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb/api/v1';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb';

// API Configuration
export const API_CONFIG = {
  baseURL: "https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb",
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  credentials: 'include', // Updated for Vercel deployment
  mode: 'cors'
};

// Socket.io Configuration
export const SOCKET_CONFIG = {
  url: "https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb",
  options: {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    withCredentials: true
  },
};

// App Configuration
export const APP_CONFIG = {
  name: 'Alcolic Main Admin',
  version: '1.0.0',
  apiBaseUrl: API_BASE_URL,
  socketUrl: SOCKET_URL,
  environment: process.env.NODE_ENV || 'development',
  
  // Features
  enableRealTime: true,
  enableNotifications: true,
  enableAnalytics: true,
  enableFinancialReports: true,
  enableSystemManagement: true,
  
  // Storage keys
  authTokenKey: 'alcolic_main_auth_token',
  adminDataKey: 'alcolic_admin_data',
  settingsKey: 'alcolic_admin_settings',
  
  // Default settings
  defaultLanguage: 'en',
  defaultCurrency: 'USD',
  defaultTimezone: 'UTC',
  
  // Admin Management
  maxUsersPerPage: 100,
  maxStoresPerPage: 50,
  maxOrdersPerPage: 100,
  autoRefreshInterval: 30000,
  
  // Security
  sessionTimeout: 3600000, // 1 hour
  maxLoginAttempts: 5,
  lockoutDuration: 900000 // 15 minutes
};

// Design System
export const ALCOLIC_COLORS = {
  primary: '#3B82F6',
  secondary: '#64748B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
  light: '#F8FAFC',
  dark: '#1E293B',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

export const TYPOGRAPHY = {
  fontFamily: {
    primary: 'Inter, system-ui, sans-serif',
    secondary: 'Roboto, system-ui, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }
};

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

// Auth Headers Helper
export const getAuthHeaders = () => {
  const token = localStorage.getItem(APP_CONFIG.authTokenKey);
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  STORE: 'store',
  DELIVERY: 'delivery',
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
  HEALTH: '/health',
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
      const token = localStorage.getItem(APP_CONFIG.authTokenKey);
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
