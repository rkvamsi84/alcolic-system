// API Configuration for Admin Panel
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1',
socketURL: process.env.REACT_APP_SOCKET_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app', // Use same domain as API
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  credentials: 'include', // Changed to include for CORS credentials
  mode: 'cors' // Explicitly set CORS mode
};

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    profile: '/auth/profile'
  },

  // Users Management
  users: {
    getAll: '/admin/users',
    getById: (id) => `/admin/users/${id}`,
    create: '/admin/users',
    update: (id) => `/admin/users/${id}`,
    delete: (id) => `/admin/users/${id}`,
    activate: (id) => `/admin/users/${id}/activate`,
    deactivate: (id) => `/admin/users/${id}/deactivate`,
    customers: '/admin/users/customers',
    deliveryMen: '/admin/users/delivery-men'
  },

  // Stores Management
  stores: {
    getAll: '/admin/stores',
    getById: (id) => `/admin/stores/${id}`,
    create: '/admin/stores',
    update: (id) => `/admin/stores/${id}`,
    delete: (id) => `/admin/stores/${id}`,
    activate: (id) => `/admin/stores/${id}/activate`,
    deactivate: (id) => `/admin/stores/${id}/deactivate`,
    analytics: (id) => `/admin/stores/${id}/analytics`
  },

  // Products Management
  products: {
    getAll: '/products',
    getById: (id) => `/products/${id}`,
    create: '/products',
    update: (id) => `/products/${id}`,
    delete: (id) => `/products/${id}`,
    categories: '/products/categories',
    byStore: (storeId) => `/products/store/${storeId}`
  },

  // Orders Management
  orders: {
    getAll: '/admin/orders',
    getById: (id) => `/admin/orders/${id}`,
    create: '/admin/orders',
    update: (id) => `/admin/orders/${id}`,
    delete: (id) => `/admin/orders/${id}`,
    updateStatus: (id) => `/admin/orders/${id}/status`,
    assignDelivery: (id) => `/admin/orders/${id}/assign-delivery`,
    analytics: '/admin/orders/analytics'
  },

  // Delivery Management
  delivery: {
    getAll: '/admin/delivery-men',
    getById: (id) => `/admin/delivery-men/${id}`,
    create: '/admin/delivery-men',
    update: (id) => `/admin/delivery-men/${id}`,
    delete: (id) => `/admin/delivery-men/${id}`,
    activate: (id) => `/admin/delivery-men/${id}/activate`,
    deactivate: (id) => `/admin/delivery-men/${id}/deactivate`,
    assignOrder: (id) => `/admin/delivery-men/${id}/assign-order`,
    location: (id) => `/admin/delivery-men/${id}/location`,
    byStore: (storeId) => `/admin/delivery-men/store/${storeId}`
  },

  // Analytics
  analytics: {
    dashboard: '/analytics/dashboard',
    sales: '/analytics/sales',
    orders: '/analytics/orders',
    users: '/analytics/users',
    stores: '/analytics/stores',
    delivery: '/analytics/delivery'
  },

  // Payments
  payments: {
    getAll: '/payments',
    getById: (id) => `/payments/${id}`,
    process: '/payments/process',
    refund: (id) => `/payments/${id}/refund`,
    analytics: '/payments/analytics'
  },

  // Notifications
  notifications: {
    getAll: '/notifications',
    getById: (id) => `/notifications/${id}`,
    send: '/notifications/send',
    markRead: (id) => `/notifications/${id}/read`,
    markAllRead: '/notifications/mark-all-read'
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

  // Categories
  categories: {
    getAll: '/products/categories',
    getById: (id) => `/products/categories/${id}`,
    create: '/products/categories',
    update: (id) => `/products/categories/${id}`,
    delete: (id) => `/products/categories/${id}`
  },

  // Promotions
  promotions: {
    getAll: '/promotions',
    getById: (id) => `/promotions/${id}`,
    create: '/promotions',
    update: (id) => `/promotions/${id}`,
    delete: (id) => `/promotions/${id}`,
    updateStatus: (id) => `/promotions/${id}/status`,
    validate: '/promotions/validate',
    analytics: '/promotions/analytics'
  },

  // Banners
  banners: {
    getAll: '/banners',
    getById: (id) => `/banners/${id}`,
    create: '/banners',
    update: (id) => `/banners/${id}`,
    delete: (id) => `/banners/${id}`,
    updateStatus: (id) => `/banners/${id}/status`,
    analytics: '/banners/analytics',
    trackClick: (id) => `/banners/${id}/click`,
    trackImpression: (id) => `/banners/${id}/impression`
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  INVALID_INPUT: 'Invalid input provided. Please check your data and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.'
};

// API Service Class
export class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.token = localStorage.getItem('admin_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('admin_token', token);
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem('admin_token');
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem('admin_token');
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
      credentials: 'include', // Changed to include for CORS credentials
      ...options
    };

    try {
      const response = await fetch(urlWithBypass, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          // Don't redirect, let the auth context handle it
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
}

// Create global API service instance
export const apiService = new ApiService();