import { apiService } from '../config/api';

class AnalyticsService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.performanceObserver = null;
    this.errorObserver = null;
    this.requestQueue = [];
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.minRequestInterval = 2000; // 2 seconds between requests
    // Disable automatic tracking to prevent rate limiting
    // this.initPerformanceTracking();
    // this.initErrorTracking();
  }

  // Generate unique session ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Throttle requests to prevent rate limiting
  async throttleRequest() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  // Queue requests to prevent overwhelming the server
  async queueRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const { requestFn, resolve, reject } = this.requestQueue.shift();
      
      try {
        await this.throttleRequest();
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.isProcessing = false;
  }

  // Get device information
  getDeviceInfo() {
    const userAgent = navigator.userAgent;
    const screen = window.screen;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Detect device type
    let deviceType = 'unknown';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent)) {
      deviceType = 'tablet';
    } else {
      deviceType = 'desktop';
    }

    // Detect browser
    let browser = 'unknown';
    let browserVersion = '';
    if (userAgent.includes('Chrome')) {
      browser = 'Chrome';
      browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || '';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
      browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || '';
    } else if (userAgent.includes('Safari')) {
      browser = 'Safari';
      browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || '';
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge';
      browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || '';
    }

    // Detect OS
    let os = 'unknown';
    let osVersion = '';
    if (userAgent.includes('Windows')) {
      os = 'Windows';
      osVersion = userAgent.match(/Windows NT (\d+\.\d+)/)?.[1] || '';
    } else if (userAgent.includes('Mac OS')) {
      os = 'macOS';
      osVersion = userAgent.match(/Mac OS X (\d+_\d+)/)?.[1] || '';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    } else if (userAgent.includes('Android')) {
      os = 'Android';
      osVersion = userAgent.match(/Android (\d+\.\d+)/)?.[1] || '';
    } else if (userAgent.includes('iOS')) {
      os = 'iOS';
      osVersion = userAgent.match(/OS (\d+_\d+)/)?.[1] || '';
    }

    return {
      type: deviceType,
      browser,
      browserVersion,
      os,
      osVersion,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${viewport.width}x${viewport.height}`
    };
  }

  // Get page information
  getPageInfo() {
    return {
      url: window.location.href,
      referrer: document.referrer,
      title: document.title,
      path: window.location.pathname,
      query: Object.fromEntries(new URLSearchParams(window.location.search))
    };
  }

  // Get client-side performance metrics
  getClientPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    const layoutShift = performance.getEntriesByType('layout-shift');
    const firstInput = performance.getEntriesByType('first-input');

    const metrics = {
      loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : null,
      renderTime: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : null,
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : null,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || null,
      largestContentfulPaint: paint.find(p => p.name === 'largest-contentful-paint')?.startTime || null,
      cumulativeLayoutShift: layoutShift.reduce((sum, entry) => sum + entry.value, 0),
      firstInputDelay: firstInput[0]?.processingStart - firstInput[0]?.startTime || null
    };

    return metrics;
  }

  // Initialize performance tracking
  initPerformanceTracking() {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            this.trackEvent('performance_metric', {
              performance: {
                largestContentfulPaint: entry.startTime
              }
            });
          }
        }
      });

      try {
        this.performanceObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('PerformanceObserver not supported');
      }
    }
  }

  // Initialize error tracking
  initErrorTracking() {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackEvent('error_occurred', {
        error: {
          message: event.message,
          stack: event.error?.stack,
          type: 'javascript_error',
          severity: this.getErrorSeverity(event.error)
        }
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('error_occurred', {
        error: {
          message: event.reason?.message || 'Unhandled Promise Rejection',
          stack: event.reason?.stack,
          type: 'promise_rejection',
          severity: 'high'
        }
      });
    });
  }

  // Get error severity
  getErrorSeverity(error) {
    if (error?.message?.includes('NetworkError') || error?.message?.includes('fetch')) {
      return 'medium';
    }
    if (error?.message?.includes('SyntaxError') || error?.message?.includes('ReferenceError')) {
      return 'high';
    }
    return 'low';
  }

  // Track page view
  trackPageView() {
    this.trackEvent('page_view', {
      pageInfo: this.getPageInfo(),
      performance: this.getClientPerformanceMetrics()
    });
  }

  // Track user event
  trackEvent(eventType, eventData = {}) {
    // Only track events if user is authenticated
    const token = apiService.getToken();
    if (!token) {
      // Skip analytics for unauthenticated users
      if (process.env.NODE_ENV === 'development') {
        console.log('Skipping analytics event (no auth):', eventType);
      }
      return;
    }

    const analyticsData = {
      eventType,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      deviceInfo: this.getDeviceInfo(),
      pageInfo: this.getPageInfo(),
      performance: this.getClientPerformanceMetrics(),
      timestamp: new Date(),
      ...eventData
    };

    // Send to backend
    this.sendAnalyticsEvent(analyticsData);

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', eventType, analyticsData);
    }
  }

  // Send analytics event to backend
  async sendAnalyticsEvent(data) {
    try {
      // Only send analytics if user is authenticated
      const token = apiService.getToken();
      if (!token) {
        // Skip analytics for unauthenticated users
        return;
      }
      
      await this.queueRequest(async () => {
        await this.throttleRequest();
        return await apiService.post('/analytics/track', data);
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  // Track business events
  trackProductView(productId, productData = {}) {
    this.trackEvent('product_view', {
      businessMetrics: {
        productId,
        ...productData
      }
    });
  }

  trackAddToCart(productId, quantity, price) {
    this.trackEvent('add_to_cart', {
      businessMetrics: {
        productId,
        orderValue: quantity * price
      },
      eventData: {
        quantity,
        price
      }
    });
  }

  trackPurchase(orderId, totalAmount, items) {
    this.trackEvent('purchase', {
      businessMetrics: {
        orderValue: totalAmount
      },
      eventData: {
        orderId,
        items
      }
    });
  }

  trackSearch(query, filters = {}) {
    this.trackEvent('search', {
      businessMetrics: {
        searchQuery: query,
        filterCriteria: filters
      }
    });
  }

  trackFilter(filters) {
    this.trackEvent('filter', {
      businessMetrics: {
        filterCriteria: filters
      }
    });
  }

  trackReviewSubmit(productId, rating) {
    this.trackEvent('review_submit', {
      businessMetrics: {
        productId
      },
      eventData: {
        rating
      }
    });
  }

  trackFavoriteAdd(productId) {
    this.trackEvent('favorite_add', {
      businessMetrics: {
        productId
      }
    });
  }

  trackFavoriteRemove(productId) {
    this.trackEvent('favorite_remove', {
      businessMetrics: {
        productId
      }
    });
  }

  trackLogin(method = 'email') {
    this.trackEvent('login', {
      eventData: {
        method
      }
    });
  }

  trackLogout() {
    this.trackEvent('logout');
  }

  trackRegistration(method = 'email') {
    this.trackEvent('registration', {
      eventData: {
        method
      }
    });
  }

  trackProfileUpdate(fields = []) {
    this.trackEvent('profile_update', {
      eventData: {
        fields
      }
    });
  }

  trackAddressAdd() {
    this.trackEvent('address_add');
  }

  trackAddressUpdate() {
    this.trackEvent('address_update');
  }

  trackPaymentAttempt(method, amount) {
    this.trackEvent('payment_attempt', {
      businessMetrics: {
        paymentMethod: method,
        orderValue: amount
      }
    });
  }

  trackPaymentSuccess(method, amount) {
    this.trackEvent('payment_success', {
      businessMetrics: {
        paymentMethod: method,
        orderValue: amount
      }
    });
  }

  trackPaymentFailure(method, amount, error) {
    this.trackEvent('payment_failure', {
      businessMetrics: {
        paymentMethod: method,
        orderValue: amount
      },
      error: {
        message: error.message,
        type: 'payment_error',
        severity: 'medium'
      }
    });
  }

  trackOrderCancel(orderId) {
    this.trackEvent('order_cancel', {
      eventData: {
        orderId
      }
    });
  }

  trackOrderTrack(orderId) {
    this.trackEvent('order_track', {
      eventData: {
        orderId
      }
    });
  }

  trackNotificationView(notificationId, type) {
    this.trackEvent('notification_view', {
      eventData: {
        notificationId,
        type
      }
    });
  }

  trackNotificationClick(notificationId, type) {
    this.trackEvent('notification_click', {
      eventData: {
        notificationId,
        type
      }
    });
  }

  trackPromotionApply(code, discount) {
    this.trackEvent('promotion_apply', {
      businessMetrics: {
        promotionCode: code
      },
      eventData: {
        discount
      }
    });
  }

  trackPromotionView(code) {
    this.trackEvent('promotion_view', {
      businessMetrics: {
        promotionCode: code
      }
    });
  }

  trackLocationUpdate(coordinates) {
    this.trackEvent('location_update', {
      location: {
        coordinates
      }
    });
  }

  trackZoneCheck(zoneId, isCovered) {
    this.trackEvent('zone_check', {
      businessMetrics: {
        deliveryZone: zoneId
      },
      eventData: {
        isCovered
      }
    });
  }

  trackSessionStart() {
    this.trackEvent('session_start');
  }

  trackSessionEnd() {
    this.trackEvent('session_end');
  }

  // Get analytics data
  async getAnalyticsData(filters = {}) {
    try {
      const response = await apiService.get('/analytics/data', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Failed to get analytics data:', error);
      return null;
    }
  }

  // Get user journey
  async getUserJourney(userId, startDate, endDate) {
    try {
      const response = await apiService.get('/analytics/user-journey', {
        params: { userId, startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get user journey:', error);
      return null;
    }
  }

  // Get conversion funnel
  async getConversionFunnel(startDate, endDate, filters = {}) {
    try {
      const response = await apiService.get('/analytics/conversion-funnel', {
        params: { startDate, endDate, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get conversion funnel:', error);
      return null;
    }
  }

  // Get performance metrics
  async getPerformanceMetrics(startDate, endDate) {
    try {
      return await this.queueRequest(async () => {
        await this.throttleRequest();
        const response = await apiService.get('/analytics/performance', {
          params: { startDate, endDate }
        });
        return response.data;
      });
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return null;
    }
  }

  // Get error analytics
  async getErrorAnalytics(startDate, endDate) {
    try {
      const response = await apiService.get('/analytics/errors', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get error analytics:', error);
      return null;
    }
  }

  // Get business metrics
  async getBusinessMetrics(startDate, endDate) {
    try {
      const response = await apiService.get('/analytics/business-metrics', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get business metrics:', error);
      return null;
    }
  }

  // Cleanup
  destroy() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    this.trackSessionEnd();
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;