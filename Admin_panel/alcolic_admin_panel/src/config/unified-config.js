// Unified Alcolic Main Admin Configuration
// Aligned with UNIFIED_SYSTEM_CONFIGURATION.md

export const ADMIN_CONFIG = {
  appName: 'Alcolic Admin',
  version: '1.0.0',
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb',
  
  // Module Structure
  modules: [
    'Dashboard', 'Stores', 'Users', 'Delivery', 
    'Analytics', 'Finance', 'System', 'Security'
  ],
  
  // Full System Permissions
  permissions: {
    fullSystemAccess: true,
    canManageStores: true,
    canManageUsers: true,
    canViewFinancials: true,
    canConfigureSystem: true
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
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  credentials: 'omit' // Updated for new backend
};

// Socket.io configuration
export const SOCKET_CONFIG = {
  url: 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb',
  options: {
    transports: ['websocket', 'polling'],
    timeout: 20000,
  },
};

// Authentication Headers
export const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'X-User-Type': 'admin',
  'X-App-Version': ADMIN_CONFIG.version,
  'X-Platform': 'web'
});

// Notification Types
export const NOTIFICATION_TYPES = {
  // System Related
  SYSTEM_ALERT: 'system_alert',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SECURITY_BREACH: 'security_breach',
  
  // Business Related
  NEW_STORE_REGISTRATION: 'new_store_registration',
  HIGH_VALUE_ORDER: 'high_value_order',
  DELIVERY_ISSUE: 'delivery_issue',
  CUSTOMER_COMPLAINT: 'customer_complaint',
  
  // Financial Related
  PAYMENT_FAILED: 'payment_failed',
  REFUND_REQUEST: 'refund_request',
  REVENUE_MILESTONE: 'revenue_milestone',
  
  // User Related
  NEW_USER_REGISTRATION: 'new_user_registration',
  ACCOUNT_SUSPENDED: 'account_suspended',
  BULK_USER_ACTION: 'bulk_user_action'
};

// Analytics Events
export const ANALYTICS_EVENTS = {
  // System Events
  ADMIN_LOGIN: 'admin_login',
  SYSTEM_CONFIG_CHANGE: 'system_config_change',
  BULK_OPERATION: 'bulk_operation',
  
  // Business Events
  STORE_APPROVED: 'store_approved',
  USER_BANNED: 'user_banned',
  FINANCIAL_REPORT_GENERATED: 'financial_report_generated',
  SYSTEM_BACKUP_COMPLETED: 'system_backup_completed'
};

// Theme Configuration for Material-UI
export const createAdminTheme = () => ({
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
      default: '#FAFAFA', // Slightly different for admin
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
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: ALCOLIC_COLORS.surface,
          borderRight: `1px solid ${ALCOLIC_COLORS.border}`,
        },
      },
    },
  },
});

// Navigation Configuration
export const NAVIGATION_CONFIG = {
  main: [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: 'dashboard',
      color: ALCOLIC_COLORS.primary,
      description: 'System overview and key metrics'
    },
    {
      title: 'Stores',
      path: '/stores',
      icon: 'store',
      color: ALCOLIC_COLORS.secondary,
      description: 'Manage partner stores'
    },
    {
      title: 'Users',
      path: '/users',
      icon: 'people',
      color: ALCOLIC_COLORS.accent,
      description: 'Customer and user management'
    },
    {
      title: 'Delivery',
      path: '/delivery',
      icon: 'local_shipping',
      color: ALCOLIC_COLORS.info,
      description: 'Delivery personnel and logistics'
    },
    {
      title: 'Analytics',
      path: '/analytics',
      icon: 'analytics',
      color: ALCOLIC_COLORS.success,
      description: 'Business intelligence and reports'
    },
    {
      title: 'Finance',
      path: '/finance',
      icon: 'account_balance',
      color: ALCOLIC_COLORS.warning,
      description: 'Financial management and reporting'
    },
    {
      title: 'System',
      path: '/system',
      icon: 'settings',
      color: ALCOLIC_COLORS.textSecondary,
      description: 'System configuration and maintenance'
    },
    {
      title: 'Security',
      path: '/security',
      icon: 'security',
      color: ALCOLIC_COLORS.error,
      description: 'Security settings and audit logs'
    }
  ]
};

// Dashboard Widgets Configuration
export const DASHBOARD_WIDGETS = {
  metrics: [
    {
      title: 'Total Revenue',
      key: 'total_revenue',
      icon: 'attach_money',
      color: ALCOLIC_COLORS.success,
      format: 'currency'
    },
    {
      title: 'Active Orders',
      key: 'active_orders',
      icon: 'shopping_cart',
      color: ALCOLIC_COLORS.primary,
      format: 'number'
    },
    {
      title: 'Total Users',
      key: 'total_users',
      icon: 'people',
      color: ALCOLIC_COLORS.secondary,
      format: 'number'
    },
    {
      title: 'Active Stores',
      key: 'active_stores',
      icon: 'store',
      color: ALCOLIC_COLORS.accent,
      format: 'number'
    }
  ],
  charts: [
    {
      title: 'Revenue Trend',
      type: 'line',
      dataKey: 'revenue_trend',
      color: ALCOLIC_COLORS.success
    },
    {
      title: 'Order Distribution',
      type: 'pie',
      dataKey: 'order_distribution',
      color: ALCOLIC_COLORS.primary
    },
    {
      title: 'User Growth',
      type: 'bar',
      dataKey: 'user_growth',
      color: ALCOLIC_COLORS.secondary
    }
  ]
};