// Unified Alcolic Store Admin Configuration for new backend
export const UNIFIED_CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.VITE_API_BASE_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1',
  SOCKET_URL: process.env.VITE_SOCKET_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app',
  
  // App Configuration
  appName: 'Alcolic Store Admin',
  version: '1.0.0',
  apiBaseUrl: process.env.VITE_API_BASE_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1',
  
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
  }
};

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.VITE_API_BASE_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Socket.io configuration
export const SOCKET_CONFIG = {
  url: process.env.VITE_SOCKET_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app',
  options: {
    transports: ['websocket', 'polling'],
    timeout: 20000,
  },
};

// Unified Color Palette
export const ALCOLIC_COLORS = {
  // Primary Colors
  primary: '#8D1443',        // Wine Red - Main brand color
  primaryLight: '#FAF2F4',   // Light Pink - Background accents
  primaryDark: '#78173D',    // Dark Wine - Hover states
  
  // Secondary Colors
  secondary: '#0D6EFD',      // Blue - Action buttons
  accent: '#FF6B35',         // Orange - Notifications/alerts
  
  // Neutral Colors
  textPrimary: '#222227',    // Dark text
  textSecondary: '#686868',  // Light text
  background: '#FFFFFF',     // Main background
  surface: '#F8F9FA',       // Card backgrounds
  border: '#F1F1F4',        // Borders and dividers
  
  // Status Colors
  success: '#28A745',        // Success states
  warning: '#FFC107',        // Warning states
  error: '#EC121D',          // Error states
  info: '#17A2B8'            // Info states
};

// Typography System
export const TYPOGRAPHY = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  sizes: {
    h1: '2.5rem',    // 40px - Page titles
    h2: '2rem',      // 32px - Section headers
    h3: '1.75rem',   // 28px - Subsection headers
    h4: '1.5rem',    // 24px - Card titles
    h5: '1.25rem',   // 20px - List headers
    h6: '1rem',      // 16px - Small headers
    body1: '1rem',   // 16px - Main text
    body2: '0.875rem', // 14px - Secondary text
    caption: '0.75rem' // 12px - Captions
  },
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
};

// Spacing System (8px Grid)
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px'
};

// Authentication Headers
export const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'X-User-Type': 'store-admin',
  'X-App-Version': STORE_CONFIG.version,
  'X-Platform': 'web'
});

// Notification Types
export const NOTIFICATION_TYPES = {
  ORDER_NEW: 'order_new',
  ORDER_UPDATED: 'order_updated',
  ORDER_CANCELLED: 'order_cancelled',
  PRODUCT_LOW_STOCK: 'product_low_stock',
  SYSTEM_ALERT: 'system_alert',
  PROMOTION_EXPIRING: 'promotion_expiring',
  DELIVERY_UPDATE: 'delivery_update',
  PAYMENT_RECEIVED: 'payment_received',
  CUSTOMER_FEEDBACK: 'customer_feedback',
  INVENTORY_ALERT: 'inventory_alert'
};

// Order Status Types
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Payment Status Types
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STORE: 'store',
  DELIVERY: 'delivery',
  USER: 'user'
};

// Theme creation function
export const createStoreTheme = () => ({
  palette: {
    primary: {
      main: ALCOLIC_COLORS.primary,
      light: ALCOLIC_COLORS.primaryLight,
      dark: ALCOLIC_COLORS.primaryDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: ALCOLIC_COLORS.secondary,
      contrastText: '#FFFFFF',
    },
    error: {
      main: ALCOLIC_COLORS.error,
    },
    warning: {
      main: ALCOLIC_COLORS.warning,
    },
    success: {
      main: ALCOLIC_COLORS.success,
    },
    info: {
      main: ALCOLIC_COLORS.info,
    },
    text: {
      primary: ALCOLIC_COLORS.textPrimary,
      secondary: ALCOLIC_COLORS.textSecondary,
    },
    background: {
      default: ALCOLIC_COLORS.background,
      paper: ALCOLIC_COLORS.surface,
    },
    divider: ALCOLIC_COLORS.border,
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamily,
    h1: {
      fontSize: TYPOGRAPHY.sizes.h1,
      fontWeight: TYPOGRAPHY.weights.bold,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: TYPOGRAPHY.sizes.h2,
      fontWeight: TYPOGRAPHY.weights.semibold,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: TYPOGRAPHY.sizes.h3,
      fontWeight: TYPOGRAPHY.weights.semibold,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: TYPOGRAPHY.sizes.h4,
      fontWeight: TYPOGRAPHY.weights.medium,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: TYPOGRAPHY.sizes.h5,
      fontWeight: TYPOGRAPHY.weights.medium,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: TYPOGRAPHY.sizes.h6,
      fontWeight: TYPOGRAPHY.weights.medium,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: TYPOGRAPHY.sizes.body1,
      fontWeight: TYPOGRAPHY.weights.regular,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: TYPOGRAPHY.sizes.body2,
      fontWeight: TYPOGRAPHY.weights.regular,
      lineHeight: 1.6,
    },
    caption: {
      fontSize: TYPOGRAPHY.sizes.caption,
      fontWeight: TYPOGRAPHY.weights.regular,
      lineHeight: 1.4,
    },
  },
  spacing: (factor) => `${8 * factor}px`,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: TYPOGRAPHY.weights.medium,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
