// API Service Functions
import axios from 'axios';
import { getConfig, isProduction } from './production-config';

// API Configuration
export const API_CONFIG = {
  baseURL: isProduction() 
    ? getConfig().api.baseURL 
    : (process.env.REACT_APP_API_BASE_URL || 'https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app') + '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 30000,
  credentials: 'omit',
  mode: 'cors'
};

// Socket.io configuration
export const SOCKET_CONFIG = {
  url: isProduction() 
    ? getConfig().socket.url 
    : (process.env.REACT_APP_SOCKET_URL || 'https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app'),
  options: {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    withCredentials: false
  },
};

// API Endpoints matching Flutter app
export const ENDPOINTS = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    deliveryRegister: '/auth/delivery-man/store',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    profile: '/auth/profile',
  },

  // User Management
  user: {
    profile: '/user/profile',
    updateProfile: '/user/profile',
    addresses: '/user/addresses',
    addAddress: '/user/addresses',
    updateAddress: '/user/addresses',
    deleteAddress: '/user/addresses',
  },

  // Products
  products: {
    getAll: '/products',
    getById: (id) => `/products/${id}`,
    search: '/products/search',
    categories: '/products/categories',
    byCategory: (categoryId) => `/products/category/${categoryId}`,
    featured: '/products/featured',
    newArrivals: '/products/new-arrivals',
    popular: '/products/popular',
  },

  // Orders
  orders: {
    getAll: '/orders',
    getById: (id) => `/orders/${id}`,
    create: '/orders',
    update: (id) => `/orders/${id}`,
    cancel: (id) => `/orders/${id}/cancel`,
    track: (id) => `/orders/${id}/track`,
    history: '/orders/history',
    active: '/orders/active',
    user: '/orders/user',
  },

  // Order Tracking
  orderTracking: {
    getByTrackingCode: (trackingCode) => `/orderTracking/track/${trackingCode}`,
    getCustomerTracking: '/orderTracking/customer',
    getDeliveryTracking: '/orderTracking/delivery',
    getAdminTracking: '/orderTracking/admin',
    createTracking: '/orderTracking',
    updateStatus: (trackingId) => `/orderTracking/${trackingId}/status`,
    updateLocation: (trackingId) => `/orderTracking/${trackingId}/location`,
    assignDeliveryMan: (trackingId) => `/orderTracking/${trackingId}/assign`,
    getStats: '/orderTracking/stats/overview',
  },

  // Cart
  cart: {
    get: '/cart',
    addItem: '/cart/add',
    updateItem: '/cart/update',
    removeItem: '/cart/remove',
    clear: '/cart/clear',
  },

  // Promotions
  promotions: {
    getAll: '/promotions/customer',
    getById: (id) => `/promotions/${id}`,
    validate: '/promotions/validate',
    apply: '/promotions/apply',
  },

  // Banners
  banners: {
    getAll: '/banners',
    getById: (id) => `/banners/${id}`,
    active: '/banners/active',
  },

  // Payments
  payments: {
    methods: '/payments/methods',
    process: '/payments/process',
    history: '/payments/history',
  },

  // Payment History
  paymentHistory: {
    getAll: '/payment-history',
    getStats: '/payment-history/stats',
    getById: (id) => `/payment-history/${id}`,
    refund: (id) => `/payment-history/${id}/refund`,
  },

  // Notifications
  notifications: {
    getAll: '/notifications',
    getMy: '/notifications/my',
    markAsRead: (id) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
    delete: (id) => `/notifications/${id}`,
    stats: '/notifications/stats',
    test: '/notifications/test',
  },

  // Support
  support: {
    faqs: '/support/faqs',
    knowledgeBase: '/support/knowledge-base',
    tickets: '/support/tickets',
    chat: '/support/chat',
  },

  // Store Registration
  store: {
    register: '/store/register',
    available: '/stores/nearby',
  },

  // Location Services
  location: {
    update: '/location/update',
    history: '/location/history',
    nearby: '/location/nearby',
    deliveryMan: (id) => `/location/delivery-man/${id}`,
    orderTracking: (orderId) => `/location/order/${orderId}`,
    reverseGeocode: '/location/reverse-geocode',
    geocode: '/location/geocode',
  },

  // Zones
  zones: {
    getAll: '/zones',
    getZone: '/zones/zone',
    validateDelivery: '/zones/validate-delivery',
    deliveryInfo: '/zones/delivery-info',
    checkCoverage: '/zones/check-coverage',
    geocode: '/zones/geocode',
  },

  // Stores
  stores: {
    nearby: '/stores/nearby',
    getById: (id) => `/stores/${id}`,
    getAll: '/stores',
  },

  // Security
  security: {
    settings: '/security/settings',
    sessions: '/security/sessions',
    loginHistory: '/security/login-history',
    setup2FA: '/security/2fa/setup',
    verify2FA: '/security/2fa/verify',
    disable2FA: '/security/2fa/disable',
    verify2FAToken: '/security/2fa/verify-token',
    changePassword: '/security/change-password',
    ipRestrictions: '/security/ip-restrictions',
    backupCodes: '/security/2fa/backup-codes',
    auditLog: '/security/audit-log',
    statistics: '/security/statistics'
  },

  // Analytics
  analytics: {
    track: '/analytics/track',
    data: '/analytics/data',
    userJourney: '/analytics/user-journey',
    conversionFunnel: '/analytics/conversion-funnel',
    performance: '/analytics/performance',
    errors: '/analytics/errors',
    businessMetrics: '/analytics/business-metrics',
    overview: '/analytics/overview',
    dashboard: '/analytics/dashboard',
    sales: '/analytics/sales',
    products: '/analytics/products',
    stores: '/analytics/stores',
    financial: '/analytics/financial'
  },

  // Loyalty
  loyalty: {
    profile: '/loyalty/profile',
    history: '/loyalty/history',
    rewards: '/loyalty/rewards',
    redeemReward: '/loyalty/rewards/redeem',
    tier: '/loyalty/tier',
    achievements: '/loyalty/achievements',
    referrals: '/loyalty/referrals',
    applyReferral: '/loyalty/referrals/apply',
  },

  // Categories
  categories: {
    getAll: '/categories',
    getById: (id) => `/categories/${id}`,
    featured: '/categories/featured',
    popular: '/categories/popular',
  },

  // System
  system: {
    health: '/',
    socket: '/socket',
    api: '/',
  },
};



// Create axios instance with dynamic configuration
const createApiClient = () => {
  // Force production configuration for Netlify deployment
  const isNetlify = window.location.hostname.includes('netlify.app');
  const config = isNetlify ? getConfig().api : API_CONFIG;
  
  console.log('🔧 Creating API client with config:', {
    isNetlify,
    hostname: window.location.hostname,
    baseURL: config.baseURL,
    headers: config.headers
  });
  
  return axios.create({
    baseURL: config.baseURL,
    headers: config.headers,
    timeout: config.timeout,
    withCredentials: false
  });
};

let apiClient = createApiClient();

// Request interceptor to add auth token and bypass token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Note: Vercel protection bypass is not needed for production deployment
    // The backend should handle CORS properly without bypass tokens
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('user_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Function to refresh API client with current configuration
const refreshApiClient = () => {
  console.log('🔄 Refreshing API client...');
  apiClient = createApiClient();
  console.log('✅ API client refreshed with new config');
};

// API Service object with all methods
export const apiService = {
  // Refresh API client
  refreshClient: refreshApiClient,
  
  // Get current configuration
  getCurrentConfig: () => ({
    baseURL: apiClient.defaults.baseURL,
    headers: apiClient.defaults.headers,
    timeout: apiClient.defaults.timeout
  }),
  
  // Force production configuration
  forceProductionConfig: () => {
    console.log('🚀 Forcing production configuration...');
    const prodConfig = getConfig().api;
    apiClient.defaults.baseURL = prodConfig.baseURL;
    apiClient.defaults.headers = prodConfig.headers;
    apiClient.defaults.timeout = prodConfig.timeout;
    console.log('✅ Production configuration applied:', prodConfig);
  },
  
  // Token management
  setToken: (token) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Authorization token set');
    }
  },
  
  
  setRefreshToken: (refreshToken) => {
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
      console.log('🔄 Refresh token stored');
    }
  },
  
  removeToken: () => {
    delete apiClient.defaults.headers.common['Authorization'];
    console.log('🔓 Authorization token removed');
  },
  
  // Direct HTTP methods
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),

  // Authentication
  auth: {
    login: (credentials) => apiClient.post(ENDPOINTS.auth.login, credentials),
    register: (userData) => apiClient.post(ENDPOINTS.auth.register, userData),
    logout: () => apiClient.post(ENDPOINTS.auth.logout),
    profile: () => apiClient.get(ENDPOINTS.auth.profile),
    updateProfile: (data) => apiClient.put(ENDPOINTS.auth.profile, data),
    changePassword: (data) => apiClient.put('/auth/change-password', data),
    forgotPassword: (data) => apiClient.post(ENDPOINTS.auth.forgotPassword, data),
    resetPassword: (data) => apiClient.post(ENDPOINTS.auth.resetPassword, data),
  },

  // Users
  users: {
    getProfile: () => apiClient.get(ENDPOINTS.user.profile),
    updateProfile: (data) => apiClient.put(ENDPOINTS.user.updateProfile, data),
    getAddresses: () => apiClient.get(ENDPOINTS.user.addresses),
    addAddress: (address) => apiClient.post(ENDPOINTS.user.addAddress, address),
    updateAddress: (id, address) => apiClient.put(`${ENDPOINTS.user.updateAddress}/${id}`, address),
    deleteAddress: (id) => apiClient.delete(`${ENDPOINTS.user.deleteAddress}/${id}`),
  },

  // Products
  products: {
    getAll: (params) => apiClient.get(ENDPOINTS.products.getAll, { params }),
    getById: (id) => apiClient.get(ENDPOINTS.products.getById(id)),
    search: (query) => apiClient.get(ENDPOINTS.products.search, { params: { q: query } }),
    getByCategory: (categoryId) => apiClient.get(ENDPOINTS.products.byCategory(categoryId)),
    getFeatured: () => apiClient.get(ENDPOINTS.products.featured),
    getNewArrivals: () => apiClient.get(ENDPOINTS.products.newArrivals),
    getPopular: () => apiClient.get(ENDPOINTS.products.popular),
  },

  // Categories
  categories: {
    getAll: () => apiClient.get(ENDPOINTS.categories.getAll),
    getById: (id) => apiClient.get(ENDPOINTS.categories.getById(id)),
    getFeatured: () => apiClient.get(ENDPOINTS.categories.featured),
    getPopular: () => apiClient.get(ENDPOINTS.categories.popular),
  },

  // Stores
  stores: {
    getAll: () => apiClient.get(ENDPOINTS.stores.getAll),
    getById: (id) => apiClient.get(ENDPOINTS.stores.getById(id)),
    getNearby: (params) => apiClient.get(ENDPOINTS.stores.nearby, { params }),
  },

  // Orders
  orders: {
    getAll: () => apiClient.get(ENDPOINTS.orders.getAll),
    getById: (id) => apiClient.get(ENDPOINTS.orders.getById(id)),
    create: (orderData) => apiClient.post(ENDPOINTS.orders.create, orderData),
    update: (id, data) => apiClient.put(ENDPOINTS.orders.update(id), data),
    cancel: (id) => apiClient.post(ENDPOINTS.orders.cancel(id)),
    track: (id) => apiClient.get(ENDPOINTS.orders.track(id)),
    getHistory: () => apiClient.get(ENDPOINTS.orders.history),
    getActive: () => apiClient.get(ENDPOINTS.orders.active),
    getUserOrders: () => apiClient.get(ENDPOINTS.orders.user),
  },

  // Zones
  zones: {
    getAll: () => apiClient.get(ENDPOINTS.zones.getAll),
    getZone: (params) => apiClient.get(ENDPOINTS.zones.getZone, { params }),
    validateDelivery: (data) => apiClient.post(ENDPOINTS.zones.validateDelivery, data),
    getDeliveryInfo: (params) => apiClient.get(ENDPOINTS.zones.deliveryInfo, { params }),
    checkCoverage: (data) => apiClient.post(ENDPOINTS.zones.checkCoverage, data),
    geocode: (data) => apiClient.post(ENDPOINTS.zones.geocode, data),
  },

  // Security
  security: {
    getSettings: () => apiClient.get(ENDPOINTS.security.settings),
    updateSettings: (data) => apiClient.put(ENDPOINTS.security.settings, data),
    getSessions: () => apiClient.get(ENDPOINTS.security.sessions),
    getLoginHistory: () => apiClient.get(ENDPOINTS.security.loginHistory),
    setup2FA: (data) => apiClient.post(ENDPOINTS.security.setup2FA, data),
    verify2FA: (data) => apiClient.post(ENDPOINTS.security.verify2FA, data),
    disable2FA: (data) => apiClient.post(ENDPOINTS.security.disable2FA, data),
    verify2FAToken: (data) => apiClient.post(ENDPOINTS.security.verify2FAToken, data),
    changePassword: (data) => apiClient.put(ENDPOINTS.security.changePassword, data),
    getIpRestrictions: () => apiClient.get(ENDPOINTS.security.ipRestrictions),
    updateIpRestrictions: (data) => apiClient.put(ENDPOINTS.security.ipRestrictions, data),
    getBackupCodes: () => apiClient.get(ENDPOINTS.security.backupCodes),
    getAuditLog: () => apiClient.get(ENDPOINTS.security.auditLog),
    getStatistics: () => apiClient.get(ENDPOINTS.security.statistics),
  },

  // Analytics
  analytics: {
    track: (data) => apiClient.post(ENDPOINTS.analytics.track, data),
    getData: (params) => apiClient.get(ENDPOINTS.analytics.data, { params }),
    getUserJourney: (params) => apiClient.get(ENDPOINTS.analytics.userJourney, { params }),
    getConversionFunnel: (params) => apiClient.get(ENDPOINTS.analytics.conversionFunnel, { params }),
    getPerformance: (params) => apiClient.get(ENDPOINTS.analytics.performance, { params }),
    getErrors: (params) => apiClient.get(ENDPOINTS.analytics.errors, { params }),
    getBusinessMetrics: (params) => apiClient.get(ENDPOINTS.analytics.businessMetrics, { params }),
    getOverview: (params) => apiClient.get(ENDPOINTS.analytics.overview, { params }),
    getDashboard: (params) => apiClient.get(ENDPOINTS.analytics.dashboard, { params }),
    getSales: (params) => apiClient.get(ENDPOINTS.analytics.sales, { params }),
    getProducts: (params) => apiClient.get(ENDPOINTS.analytics.products, { params }),
    getStores: (params) => apiClient.get(ENDPOINTS.analytics.stores, { params }),
    getFinancial: (params) => apiClient.get(ENDPOINTS.analytics.financial, { params }),
  },

  // Loyalty
  loyalty: {
    getProfile: () => apiClient.get(ENDPOINTS.loyalty.profile),
    getHistory: (params) => apiClient.get(ENDPOINTS.loyalty.history, { params }),
    getRewards: () => apiClient.get(ENDPOINTS.loyalty.rewards),
    redeemReward: (data) => apiClient.post(ENDPOINTS.loyalty.redeemReward, data),
    getTier: () => apiClient.get(ENDPOINTS.loyalty.tier),
    getAchievements: () => apiClient.get(ENDPOINTS.loyalty.achievements),
    getReferrals: () => apiClient.get(ENDPOINTS.loyalty.referrals),
    applyReferral: (data) => apiClient.post(ENDPOINTS.loyalty.applyReferral, data),
  },

  // Banners
  banners: {
    getAll: () => apiClient.get(ENDPOINTS.banners.getAll),
    getById: (id) => apiClient.get(ENDPOINTS.banners.getById(id)),
    getActive: () => apiClient.get(ENDPOINTS.banners.active),
  },

  // Notifications
  notifications: {
    getAll: (params) => apiClient.get(ENDPOINTS.notifications.getAll, { params }),
    getMy: (params) => apiClient.get(ENDPOINTS.notifications.getMy, { params }),
    markAsRead: (id) => apiClient.put(ENDPOINTS.notifications.markAsRead(id)),
    markAllAsRead: () => apiClient.put(ENDPOINTS.notifications.markAllRead),
    delete: (id) => apiClient.delete(ENDPOINTS.notifications.delete(id)),
    getStats: () => apiClient.get(ENDPOINTS.notifications.stats),
    test: (data) => apiClient.post(ENDPOINTS.notifications.test, data),
  },

  // Support/FAQ
  support: {
    getFAQs: () => apiClient.get(ENDPOINTS.support.faqs),
    getKnowledgeBase: () => apiClient.get(ENDPOINTS.support.knowledgeBase),
    getTickets: (params) => apiClient.get(ENDPOINTS.support.tickets, { params }),
    createTicket: (data) => apiClient.post(ENDPOINTS.support.tickets, data),
    startChat: (data) => apiClient.post(ENDPOINTS.support.chat, data),
  },

  // Cart
  cart: {
    get: () => apiClient.get(ENDPOINTS.cart.get),
    addItem: (data) => apiClient.post(ENDPOINTS.cart.addItem, data),
    updateItem: (data) => apiClient.put(ENDPOINTS.cart.updateItem, data),
    removeItem: (data) => apiClient.delete(ENDPOINTS.cart.removeItem, { data }),
    clear: () => apiClient.delete(ENDPOINTS.cart.clear),
  },

  // Promotions
  promotions: {
    getAll: () => apiClient.get(ENDPOINTS.promotions.getAll),
    getById: (id) => apiClient.get(ENDPOINTS.promotions.getById(id)),
    validate: (data) => apiClient.post(ENDPOINTS.promotions.validate, data),
    apply: (data) => apiClient.post(ENDPOINTS.promotions.apply, data),
  },

  // Payments
  payments: {
    getMethods: () => apiClient.get(ENDPOINTS.payments.methods),
    process: (data) => apiClient.post(ENDPOINTS.payments.process, data),
    getHistory: (params) => apiClient.get(ENDPOINTS.payments.history, { params }),
  },

  // Payment History
  paymentHistory: {
    getAll: (params) => apiClient.get(ENDPOINTS.paymentHistory.getAll, { params }),
    getStats: (params) => apiClient.get(ENDPOINTS.paymentHistory.getStats, { params }),
  },

  // Location
  location: {
    update: (data) => apiClient.post(ENDPOINTS.location.update, data),
    getHistory: (params) => apiClient.get(ENDPOINTS.location.history, { params }),
    getNearby: (params) => apiClient.get(ENDPOINTS.location.nearby, { params }),
    reverseGeocode: (data) => apiClient.post(ENDPOINTS.location.reverseGeocode, data),
    geocode: (data) => apiClient.post(ENDPOINTS.location.geocode, data),
  },

  // System
  system: {
    health: () => apiClient.get(ENDPOINTS.system.health),
    api: () => apiClient.get(ENDPOINTS.system.api),
  },
};

// Token management methods
apiService.setToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

apiService.setRefreshToken = (refreshToken) => {
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
};

apiService.removeToken = () => {
  delete apiClient.defaults.headers.common['Authorization'];
  localStorage.removeItem('refresh_token');
};

// Export default apiClient for direct use
export default apiClient;
