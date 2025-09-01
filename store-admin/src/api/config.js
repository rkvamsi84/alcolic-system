/**
 * Main API configuration file
 * Contains all API-related configuration and initialization
 */

// Base API configuration
export const API_CONFIG = {
  baseURL: process.env.VITE_API_BASE_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1',
socketURL: process.env.VITE_SOCKET_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app', // Socket.IO server URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  credentials: 'include', // Enable credentials for CORS
  mode: 'cors' // Explicitly set CORS mode
};

// Debug: Log the actual API base URL being used
console.log('🔧 API_CONFIG.baseURL:', API_CONFIG.baseURL);
console.log('🔧 Using hardcoded API URL for now');

// Authentication configuration
export const AUTH_CONFIG = {
  domain: import.meta.env.VITE_AUTH_DOMAIN,
  clientId: import.meta.env.VITE_AUTH_CLIENT_ID,
  audience: `https://${import.meta.env.VITE_AUTH_DOMAIN}/api/v2/`,
  scope: 'read:current_user update:current_user_metadata'
};

// Stripe configuration
export const STRIPE_CONFIG = {
  publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
  webhookSecret: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET
};

// AI Services configuration
export const AI_CONFIG = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    model: 'gpt-4', // or your preferred model
    maxTokens: 2000
  },
  googleVision: {
    credentials: import.meta.env.VITE_GOOGLE_APPLICATION_CREDENTIALS
  }
};

// API Endpoints
export const ENDPOINTS = {
  // Authentication endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    profile: '/auth/profile'
  },

  // Store management
  store: {
    profile: '/store/profile',
    update: '/store/update',
    analytics: '/store/analytics',
    settings: '/store/settings'
  },

  // Analytics endpoints
  analytics: {
    dashboard: '/analytics/dashboard',
    sales: '/analytics/sales',
    products: '/analytics/products',
    stores: '/analytics/stores',
    overview: '/analytics/overview',
    realtime: '/analytics/realtime',
    customers: '/analytics/customers',
    delivery: '/analytics/delivery',
    financial: '/analytics/financial',
    salesData: '/analytics/sales-data',
    topProducts: '/analytics/top-products',
    topStores: '/analytics/top-stores',
    customerSegments: '/analytics/customer-segments',
    deliveryMetrics: '/analytics/delivery-metrics',
    export: '/analytics/export',
    comprehensive: '/analytics/comprehensive'
  },

  // Inventory/Products endpoints
  products: {
    base: '/products',
    getAll: '/products',
    getById: (id) => `/products/${id}`,
    create: '/products',
    update: (id) => `/products/${id}`,
    delete: (id) => `/products/${id}`,
    search: '/products/search',
    categories: '/products/categories',
    import: '/products/import',
    export: '/products/export',
    bulkUpdate: '/products/bulk-update'
  },

  // Orders endpoints
  orders: {
    base: '/orders',
    getAll: '/orders',
    getById: (id) => `/orders/${id}`,
    create: '/orders',
    update: (id) => `/orders/${id}`,
    updateStatus: (id) => `/orders/${id}/status`,
    assignDelivery: (id) => `/orders/${id}/assign-delivery`,
    analytics: '/orders/analytics',
    byStatus: (status) => `/orders/status/${status}`
  },

  // Delivery management
  delivery: {
    getAll: '/delivery',
    getById: (id) => `/delivery/${id}`,
    create: '/delivery',
    update: (id) => `/delivery/${id}`,
    delete: (id) => `/delivery/${id}`,
    activate: (id) => `/delivery/${id}/activate`,
    deactivate: (id) => `/delivery/${id}/deactivate`,
    assignOrder: (id) => `/delivery/${id}/assign-order`,
    location: (id) => `/delivery/${id}/location`,
    byStore: (storeId) => `/delivery/store/${storeId}`
  },

  // Sales endpoints
  sales: {
    base: '/sales',
    getAll: '/sales',
    create: '/sales',
    getById: (id) => `/sales/${id}`,
    analytics: '/sales/analytics',
    report: '/sales/report',
    daily: '/sales/daily',
    monthly: '/sales/monthly'
  },

  // Customer endpoints
  customers: {
    base: '/customers',
    getAll: '/customers',
    getById: (id) => `/customers/${id}`,
    create: '/customers',
    update: (id) => `/customers/${id}`,
    delete: (id) => `/customers/${id}`,
    search: '/customers/search',
    analytics: '/customers/analytics'
  },

  // Payments
  payments: {
    getAll: '/payments',
    getById: (id) => `/payments/${id}`,
    process: '/payments/process',
    refund: (id) => `/payments/${id}/refund`,
    analytics: '/payments/analytics',
    methods: '/payments/methods'
  },

  // Notifications
  notifications: {
    getAll: '/notifications',
    getById: (id) => `/notifications/${id}`,
    send: '/notifications/send',
    markRead: (id) => `/notifications/${id}/read`,
    markAllRead: '/notifications/mark-all-read',
    settings: '/notifications/settings'
  },

  // Chat
  chat: {
    getAll: '/chat',
    getById: (id) => `/chat/${id}`,
    create: '/chat/create',
    sendMessage: (id) => `/chat/${id}/messages`,
    markRead: (id) => `/chat/${id}/read`,
    unreadCount: '/chat/unread/count'
  },

  // AI Analytics endpoints
  ai: {
    analyzeSales: '/ai/analyze-sales',
    predictInventory: '/ai/predict-inventory',
    customerBehavior: '/ai/customer-behavior',
    priceOptimization: '/ai/price-optimization',
    imageAnalysis: '/ai/image-analysis',
    demandForecast: '/ai/demand-forecast'
  },

  // Categories
  categories: {
    getAll: '/categories',
    getById: (id) => `/categories/${id}`,
    create: '/categories',
    update: (id) => `/categories/${id}`,
    delete: (id) => `/categories/${id}`
  }
};

// API Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  maxRequests: 100, // requests per window
  timeWindow: 60000, // time window in milliseconds (1 minute)
  enableRetry: true,
  maxRetries: 3,
  retryDelay: 1000 // milliseconds
};

// Cache Configuration
export const CACHE_CONFIG = {
  enabled: true,
  ttl: 300000, // Time to live: 5 minutes
  maxSize: 100, // Maximum number of items to cache
  invalidateOnMutation: true
};

// Websocket Configuration
export const WEBSOCKET_CONFIG = {
  enabled: true,
  reconnectAttempts: 5,
  reconnectInterval: 1000,
  endpoints: {
    orders: '/ws/orders',
    inventory: '/ws/inventory',
    notifications: '/ws/notifications',
    chat: '/ws/chat'
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  INVALID_INPUT: 'Invalid input provided. Please check your data and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.'
};

// API Service Class
export class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.token = localStorage.getItem('store_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('store_token', token);
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem('store_token');
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem('store_token');
  }

  getMockData(endpoint) {
    // Mock data for admin panel integration
    const mockResponses = {
      '/analytics/dashboard': {
        success: true,
        data: {
          totalRevenue: 125000,
          totalOrders: 1250,
          totalProducts: 450,
          totalCustomers: 890,
          revenueGrowth: 12.5,
          orderGrowth: 8.3,
          productGrowth: 5.2,
          customerGrowth: 15.7
        }
      },
      '/products': {
        success: true,
        data: {
          products: [],
          total: 0,
          page: 1,
          limit: 10
        }
      },
      '/orders': {
        success: true,
        data: {
          orders: [],
          total: 0,
          page: 1,
          limit: 10
        }
      },
      '/analytics/sales': {
        success: true,
        data: {
          dailySales: [],
          monthlySales: [],
          totalSales: 0
        }
      }
    };

    return Promise.resolve(mockResponses[endpoint] || {
      success: true,
      data: {},
      message: 'Mock data for admin panel integration'
    });
  }

  // Get headers with authentication
  getHeaders() {
    const headers = { ...API_CONFIG.headers };
    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  // Make API request
  async request(endpoint, options = {}) {
    // Add Vercel protection bypass token to URL
    const separator = endpoint.includes('?') ? '&' : '?';
    const urlWithBypass = `${this.baseURL}${endpoint}${separator}x-vercel-protection-bypass=7tnVjZLFaUsLN9JVFaUsLN9JV`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      // Check if using mock token for admin panel integration
      const token = this.getToken();
      if (token === 'mock-admin-token') {
        // Return mock data for admin panel integration
        return this.getMockData(endpoint);
      }

      const response = await fetch(urlWithBypass, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          window.location.href = '/login';
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload file
  async upload(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: formData
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          window.location.href = '/login';
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }
}

// Create global API service instance
export const apiService = new ApiService();

// Response Interceptor
export const createResponseInterceptor = (axios) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        // Handle specific error cases
        switch (error.response.status) {
          case 401:
            // Handle unauthorized
            throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
          case 404:
            // Handle not found
            throw new Error(ERROR_MESSAGES.NOT_FOUND);
          case 429:
            // Handle rate limit
            throw new Error(ERROR_MESSAGES.RATE_LIMIT);
          default:
            // Handle other errors
            throw new Error(ERROR_MESSAGES.SERVER_ERROR);
        }
      } else if (error.request) {
        // Handle network errors
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      throw error;
    }
  );
};

// Request Interceptor
export const createRequestInterceptor = (axios) => {
  axios.interceptors.request.use(
    (config) => {
      // Add timestamp to prevent caching
      config.params = {
        ...config.params,
        _t: Date.now()
      };
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};