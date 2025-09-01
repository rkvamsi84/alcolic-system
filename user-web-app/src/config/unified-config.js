// Unified Alcolic Web App Configuration
// Aligned with UNIFIED_SYSTEM_CONFIGURATION.md

export const WEB_CONFIG = {
  appName: 'Alcolic Web',
  version: '1.0.0',
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app/api/v1',
  
  // Navigation Structure
  navigation: {
    main: ['Home', 'Products', 'Categories', 'Offers'],
    user: ['Cart', 'Favorites', 'Orders', 'Profile']
  },
  
  // Feature Flags
  features: {
    realTimeNotifications: true,
    advancedSearch: true,
    socialLogin: true,
    guestCheckout: true
  }
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

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Authentication Headers
export const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'X-User-Type': 'customer',
  'X-App-Version': WEB_CONFIG.version,
  'X-Platform': 'web'
});

// Notification Types
export const NOTIFICATION_TYPES = {
  // Order Related
  ORDER_PLACED: 'order_placed',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_PREPARING: 'order_preparing',
  ORDER_READY: 'order_ready',
  ORDER_PICKED_UP: 'order_picked_up',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  
  // System Related
  PROMOTION_AVAILABLE: 'promotion_available',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  ACCOUNT_UPDATE: 'account_update'
};

// Analytics Events
export const ANALYTICS_EVENTS = {
  // User Events
  USER_REGISTRATION: 'user_registration',
  USER_LOGIN: 'user_login',
  PRODUCT_VIEW: 'product_view',
  ADD_TO_CART: 'add_to_cart',
  CHECKOUT_START: 'checkout_start',
  ORDER_COMPLETE: 'order_complete',
  
  // Business Events
  REVENUE_GENERATED: 'revenue_generated',
  ORDER_FULFILLMENT: 'order_fulfillment',
  CUSTOMER_SATISFACTION: 'customer_satisfaction'
};

// Theme Configuration for Material-UI
export const createUnifiedTheme = () => ({
  palette: {
    primary: {
      main: ALCOLIC_COLORS.primary,
      light: ALCOLIC_COLORS.primaryLight,
      dark: ALCOLIC_COLORS.primaryDark,
    },
    secondary: {
      main: ALCOLIC_COLORS.secondary,
    },
    error: {
      main: ALCOLIC_COLORS.error,
    },
    warning: {
      main: ALCOLIC_COLORS.warning,
    },
    info: {
      main: ALCOLIC_COLORS.info,
    },
    success: {
      main: ALCOLIC_COLORS.success,
    },
    text: {
      primary: ALCOLIC_COLORS.textPrimary,
      secondary: ALCOLIC_COLORS.textSecondary,
    },
    background: {
      default: ALCOLIC_COLORS.background,
      paper: ALCOLIC_COLORS.surface,
    },
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamily,
    h1: {
      fontSize: TYPOGRAPHY.sizes.h1,
      fontWeight: TYPOGRAPHY.weights.bold,
    },
    h2: {
      fontSize: TYPOGRAPHY.sizes.h2,
      fontWeight: TYPOGRAPHY.weights.semibold,
    },
    h3: {
      fontSize: TYPOGRAPHY.sizes.h3,
      fontWeight: TYPOGRAPHY.weights.semibold,
    },
    h4: {
      fontSize: TYPOGRAPHY.sizes.h4,
      fontWeight: TYPOGRAPHY.weights.semibold,
    },
    h5: {
      fontSize: TYPOGRAPHY.sizes.h5,
      fontWeight: TYPOGRAPHY.weights.semibold,
    },
    h6: {
      fontSize: TYPOGRAPHY.sizes.h6,
      fontWeight: TYPOGRAPHY.weights.semibold,
    },
    body1: {
      fontSize: TYPOGRAPHY.sizes.body1,
      fontWeight: TYPOGRAPHY.weights.regular,
    },
    body2: {
      fontSize: TYPOGRAPHY.sizes.body2,
      fontWeight: TYPOGRAPHY.weights.regular,
    },
    button: {
      textTransform: 'none',
      fontWeight: TYPOGRAPHY.weights.semibold,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: TYPOGRAPHY.weights.semibold,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: `0px 4px 8px rgba(141, 20, 67, 0.3)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: ALCOLIC_COLORS.background,
          color: ALCOLIC_COLORS.textPrimary,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});