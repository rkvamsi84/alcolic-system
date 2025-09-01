// Unified Alcolic Store Admin Configuration for new backend
export const UNIFIED_CONFIG = {
  // API Configuration
  apiBaseUrl: process.env.VITE_API_BASE_URL || 'https://alcolic-backend.onrender.com/api/v1',
  socketURL: process.env.VITE_SOCKET_URL || 'https://alcolic-backend.onrender.com',
  
  // App Configuration
  appName: 'Alcolic Store Admin',
  version: '1.0.0',
  
  // Module Structure
  modules: [
    'Dashboard', 'Products', 'Orders', 'Analytics', 
    'Promotions', 'Customers', 'Settings'
  ],
  
  // Permissions
  permissions: {
    canManageProducts: true,
    canViewAnalytics: true,
    canManageOrders: true,
    canManagePromotions: true
  },
  
  // API Settings
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Socket Settings
  socketOptions: {
    transports: ['websocket', 'polling'],
    timeout: 20000,
  }
};
