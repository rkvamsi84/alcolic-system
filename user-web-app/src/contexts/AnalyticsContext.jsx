import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import analyticsService from '../services/analyticsService';
import { useAuth } from './AuthContext';
import { apiService } from '../config/api';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [userJourney, setUserJourney] = useState([]);
  const [conversionFunnel, setConversionFunnel] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  const [errorAnalytics, setErrorAnalytics] = useState([]);
  const [businessMetrics, setBusinessMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    endDate: new Date()
  });

  // Initialize analytics tracking
  useEffect(() => {
    // Only track analytics if user is authenticated and has customer role
    if (user && token && user.role === 'customer') {
      // Additional check to ensure token is valid
      const tokenExists = typeof token === 'string' && token.length > 0;
      if (!tokenExists) {
        console.log('Skipping analytics - invalid token');
        return;
      }

      // Add a longer delay to ensure token is properly synchronized with apiService
      const initTimer = setTimeout(() => {
        // Ensure apiService has the token before tracking
        if (apiService.getToken()) {
          // Track session start only once
          analyticsService.trackSessionStart();

          // Track page view with additional delay
          const pageViewTimer = setTimeout(() => {
            analyticsService.trackPageView();
          }, 2000); // Additional 2 second delay for page view

          return () => {
            clearTimeout(pageViewTimer);
          };
        } else {
          console.log('Skipping analytics - apiService token not ready');
        }
      }, 3000); // 3 second delay to ensure token synchronization

      // Cleanup on unmount
      return () => {
        clearTimeout(initTimer);
        analyticsService.destroy();
      };
    }
  }, [user, token]);

  // Update user ID when user changes
  useEffect(() => {
    if (user?._id) {
      // Update analytics service with user ID
      analyticsService.userId = user._id;
    }
  }, [user]);

  // Load analytics data
  const loadAnalyticsData = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await analyticsService.getAnalyticsData({
        ...filters,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString()
      });
      if (data) {
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Load user journey
  const loadUserJourney = async (userId, startDate, endDate) => {
    try {
      setLoading(true);
      const journey = await analyticsService.getUserJourney(userId, startDate, endDate);
      if (journey) {
        setUserJourney(journey);
      }
    } catch (error) {
      console.error('Error loading user journey:', error);
      toast.error('Failed to load user journey');
    } finally {
      setLoading(false);
    }
  };

  // Load conversion funnel
  const loadConversionFunnel = async (filters = {}) => {
    try {
      setLoading(true);
      const funnel = await analyticsService.getConversionFunnel(
        dateRange.startDate.toISOString(),
        dateRange.endDate.toISOString(),
        filters
      );
      if (funnel) {
        setConversionFunnel(funnel);
      }
    } catch (error) {
      console.error('Error loading conversion funnel:', error);
      toast.error('Failed to load conversion funnel');
    } finally {
      setLoading(false);
    }
  };

  // Load performance metrics
  const loadPerformanceMetrics = async () => {
    try {
      setLoading(true);
      const metrics = await analyticsService.getPerformanceMetrics(
        dateRange.startDate.toISOString(),
        dateRange.endDate.toISOString()
      );
      if (metrics) {
        setPerformanceMetrics(metrics);
      }
    } catch (error) {
      console.error('Error loading performance metrics:', error);
      toast.error('Failed to load performance metrics');
    } finally {
      setLoading(false);
    }
  };

  // Load error analytics
  const loadErrorAnalytics = async () => {
    try {
      setLoading(true);
      const errors = await analyticsService.getErrorAnalytics(
        dateRange.startDate.toISOString(),
        dateRange.endDate.toISOString()
      );
      if (errors) {
        setErrorAnalytics(errors);
      }
    } catch (error) {
      console.error('Error loading error analytics:', error);
      toast.error('Failed to load error analytics');
    } finally {
      setLoading(false);
    }
  };

  // Load business metrics
  const loadBusinessMetrics = async () => {
    try {
      setLoading(true);
      const metrics = await analyticsService.getBusinessMetrics(
        dateRange.startDate.toISOString(),
        dateRange.endDate.toISOString()
      );
      if (metrics) {
        setBusinessMetrics(metrics);
      }
    } catch (error) {
      console.error('Error loading business metrics:', error);
      toast.error('Failed to load business metrics');
    } finally {
      setLoading(false);
    }
  };

  // Update date range
  const updateDateRange = (startDate, endDate) => {
    setDateRange({ startDate, endDate });
  };

  // Track page view
  const trackPageView = () => {
    analyticsService.trackPageView();
  };

  // Track product view
  const trackProductView = (productId, productData = {}) => {
    analyticsService.trackProductView(productId, productData);
  };

  // Track add to cart
  const trackAddToCart = (productId, quantity, price) => {
    analyticsService.trackAddToCart(productId, quantity, price);
  };

  // Track purchase
  const trackPurchase = (orderId, totalAmount, items) => {
    analyticsService.trackPurchase(orderId, totalAmount, items);
  };

  // Track search
  const trackSearch = (query, filters = {}) => {
    analyticsService.trackSearch(query, filters);
  };

  // Track filter
  const trackFilter = (filters) => {
    analyticsService.trackFilter(filters);
  };

  // Track review submit
  const trackReviewSubmit = (productId, rating) => {
    analyticsService.trackReviewSubmit(productId, rating);
  };

  // Track favorite add
  const trackFavoriteAdd = (productId) => {
    analyticsService.trackFavoriteAdd(productId);
  };

  // Track favorite remove
  const trackFavoriteRemove = (productId) => {
    analyticsService.trackFavoriteRemove(productId);
  };

  // Track login
  const trackLogin = (method = 'email') => {
    analyticsService.trackLogin(method);
  };

  // Track logout
  const trackLogout = () => {
    analyticsService.trackLogout();
  };

  // Track registration
  const trackRegistration = (method = 'email') => {
    analyticsService.trackRegistration(method);
  };

  // Track profile update
  const trackProfileUpdate = (fields = []) => {
    analyticsService.trackProfileUpdate(fields);
  };

  // Track address add
  const trackAddressAdd = () => {
    analyticsService.trackAddressAdd();
  };

  // Track address update
  const trackAddressUpdate = () => {
    analyticsService.trackAddressUpdate();
  };

  // Track payment attempt
  const trackPaymentAttempt = (method, amount) => {
    analyticsService.trackPaymentAttempt(method, amount);
  };

  // Track payment success
  const trackPaymentSuccess = (method, amount) => {
    analyticsService.trackPaymentSuccess(method, amount);
  };

  // Track payment failure
  const trackPaymentFailure = (method, amount, error) => {
    analyticsService.trackPaymentFailure(method, amount, error);
  };

  // Track order cancel
  const trackOrderCancel = (orderId) => {
    analyticsService.trackOrderCancel(orderId);
  };

  // Track order track
  const trackOrderTrack = (orderId) => {
    analyticsService.trackOrderTrack(orderId);
  };

  // Track notification view
  const trackNotificationView = (notificationId, type) => {
    analyticsService.trackNotificationView(notificationId, type);
  };

  // Track notification click
  const trackNotificationClick = (notificationId, type) => {
    analyticsService.trackNotificationClick(notificationId, type);
  };

  // Track promotion apply
  const trackPromotionApply = (code, discount) => {
    analyticsService.trackPromotionApply(code, discount);
  };

  // Track promotion view
  const trackPromotionView = (code) => {
    analyticsService.trackPromotionView(code);
  };

  // Track location update
  const trackLocationUpdate = (coordinates) => {
    analyticsService.trackLocationUpdate(coordinates);
  };

  // Track zone check
  const trackZoneCheck = (zoneId, isCovered) => {
    analyticsService.trackZoneCheck(zoneId, isCovered);
  };

  // Get analytics summary
  const getAnalyticsSummary = () => {
    if (!analyticsData) return null;

    const summary = {
      totalEvents: analyticsData.totalEvents || 0,
      uniqueUsers: analyticsData.uniqueUsers || 0,
      totalSessions: analyticsData.totalSessions || 0,
      averageSessionDuration: analyticsData.averageSessionDuration || 0,
      conversionRate: analyticsData.conversionRate || 0,
      topEvents: analyticsData.topEvents || [],
      topPages: analyticsData.topPages || [],
      deviceBreakdown: analyticsData.deviceBreakdown || {},
      browserBreakdown: analyticsData.browserBreakdown || {},
      locationBreakdown: analyticsData.locationBreakdown || {}
    };

    return summary;
  };

  // Get conversion funnel data
  const getConversionFunnelData = () => {
    if (!conversionFunnel.length) return null;

    const funnelSteps = [
      'page_view',
      'product_view',
      'add_to_cart',
      'purchase'
    ];

    const funnelData = funnelSteps.map(step => {
      const stepData = conversionFunnel.find(item => item._id === step);
      return {
        step,
        count: stepData?.count || 0,
        uniqueUsers: stepData?.uniqueUserCount || 0
      };
    });

    return funnelData;
  };

  // Get performance summary
  const getPerformanceSummary = () => {
    if (!performanceMetrics.length) return null;

    const summary = {
      averageLoadTime: 0,
      averageRenderTime: 0,
      averageFirstContentfulPaint: 0,
      averageLargestContentfulPaint: 0,
      averageCumulativeLayoutShift: 0,
      averageFirstInputDelay: 0,
      totalPageViews: 0
    };

    performanceMetrics.forEach(metric => {
      summary.averageLoadTime += metric.avgLoadTime || 0;
      summary.averageRenderTime += metric.avgRenderTime || 0;
      summary.averageFirstContentfulPaint += metric.avgFirstContentfulPaint || 0;
      summary.averageLargestContentfulPaint += metric.avgLargestContentfulPaint || 0;
      summary.averageCumulativeLayoutShift += metric.avgCumulativeLayoutShift || 0;
      summary.averageFirstInputDelay += metric.avgFirstInputDelay || 0;
      summary.totalPageViews += metric.count || 0;
    });

    const count = performanceMetrics.length;
    if (count > 0) {
      summary.averageLoadTime /= count;
      summary.averageRenderTime /= count;
      summary.averageFirstContentfulPaint /= count;
      summary.averageLargestContentfulPaint /= count;
      summary.averageCumulativeLayoutShift /= count;
      summary.averageFirstInputDelay /= count;
    }

    return summary;
  };

  // Get error summary
  const getErrorSummary = () => {
    if (!errorAnalytics.length) return null;

    const summary = {
      totalErrors: 0,
      uniqueUsers: 0,
      affectedPages: 0,
      errorTypes: {},
      severityBreakdown: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      }
    };

    errorAnalytics.forEach(error => {
      summary.totalErrors += error.count || 0;
      summary.uniqueUsers += error.uniqueUserCount || 0;
      summary.affectedPages += error.affectedPages || 0;

      const type = error._id?.type || 'unknown';
      summary.errorTypes[type] = (summary.errorTypes[type] || 0) + (error.count || 0);

      const severity = error._id?.severity || 'low';
      summary.severityBreakdown[severity] = (summary.severityBreakdown[severity] || 0) + (error.count || 0);
    });

    return summary;
  };

  const value = {
    // State
    analyticsData,
    userJourney,
    conversionFunnel,
    performanceMetrics,
    errorAnalytics,
    businessMetrics,
    loading,
    dateRange,

    // Actions
    loadAnalyticsData,
    loadUserJourney,
    loadConversionFunnel,
    loadPerformanceMetrics,
    loadErrorAnalytics,
    loadBusinessMetrics,
    updateDateRange,
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackPurchase,
    trackSearch,
    trackFilter,
    trackReviewSubmit,
    trackFavoriteAdd,
    trackFavoriteRemove,
    trackLogin,
    trackLogout,
    trackRegistration,
    trackProfileUpdate,
    trackAddressAdd,
    trackAddressUpdate,
    trackPaymentAttempt,
    trackPaymentSuccess,
    trackPaymentFailure,
    trackOrderCancel,
    trackOrderTrack,
    trackNotificationView,
    trackNotificationClick,
    trackPromotionApply,
    trackPromotionView,
    trackLocationUpdate,
    trackZoneCheck,

    // Computed
    getAnalyticsSummary,
    getConversionFunnelData,
    getPerformanceSummary,
    getErrorSummary
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};