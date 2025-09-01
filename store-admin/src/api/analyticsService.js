import { apiService, ENDPOINTS } from './config';

class AnalyticsService {
  // Get dashboard analytics
  async getDashboard(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.dashboard}?${queryString}` : ENDPOINTS.analytics.dashboard;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get dashboard analytics error:', error);
      throw error;
    }
  }

  // Get sales analytics
  async getSales(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.sales}?${queryString}` : ENDPOINTS.analytics.sales;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get sales analytics error:', error);
      throw error;
    }
  }

  // Get product analytics
  async getProducts(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.products}?${queryString}` : ENDPOINTS.analytics.products;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get product analytics error:', error);
      throw error;
    }
  }

  // Get store analytics
  async getStores(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.stores}?${queryString}` : ENDPOINTS.analytics.stores;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get store analytics error:', error);
      throw error;
    }
  }

  // Get overview analytics
  async getOverview(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.overview}?${queryString}` : ENDPOINTS.analytics.overview;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get overview analytics error:', error);
      throw error;
    }
  }

  // Get real-time analytics
  async getRealtime(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.realtime}?${queryString}` : ENDPOINTS.analytics.realtime;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get real-time analytics error:', error);
      throw error;
    }
  }

  // Get customer analytics
  async getCustomers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.customers}?${queryString}` : ENDPOINTS.analytics.customers;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get customer analytics error:', error);
      throw error;
    }
  }

  // Get delivery analytics
  async getDelivery(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.delivery}?${queryString}` : ENDPOINTS.analytics.delivery;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get delivery analytics error:', error);
      throw error;
    }
  }

  // Get financial analytics
  async getFinancial(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.financial}?${queryString}` : ENDPOINTS.analytics.financial;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get financial analytics error:', error);
      throw error;
    }
  }

  // Get sales data
  async getSalesData(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.salesData}?${queryString}` : ENDPOINTS.analytics.salesData;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get sales data error:', error);
      throw error;
    }
  }

  // Get top products
  async getTopProducts(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.topProducts}?${queryString}` : ENDPOINTS.analytics.topProducts;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get top products error:', error);
      throw error;
    }
  }

  // Get top stores
  async getTopStores(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.topStores}?${queryString}` : ENDPOINTS.analytics.topStores;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get top stores error:', error);
      throw error;
    }
  }

  // Get customer segments
  async getCustomerSegments(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.customerSegments}?${queryString}` : ENDPOINTS.analytics.customerSegments;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get customer segments error:', error);
      throw error;
    }
  }

  // Get delivery metrics
  async getDeliveryMetrics(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.deliveryMetrics}?${queryString}` : ENDPOINTS.analytics.deliveryMetrics;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get delivery metrics error:', error);
      throw error;
    }
  }

  // Export analytics data
  async exportAnalytics(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.export}?${queryString}` : ENDPOINTS.analytics.export;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Export analytics error:', error);
      throw error;
    }
  }

  // Get comprehensive analytics
  async getComprehensive(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.comprehensive}?${queryString}` : ENDPOINTS.analytics.comprehensive;
      const response = await apiService.get(endpoint);
      return response;
    } catch (error) {
      console.error('Get comprehensive analytics error:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService(); 