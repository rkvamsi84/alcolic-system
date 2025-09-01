import axios from 'axios';
import { API_CONFIG } from './config';

class AnalyticsService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
  }

  // Get auth headers
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Get dashboard analytics
  async getDashboardAnalytics() {
    try {
      const response = await axios.get(`${this.baseURL}/analytics/dashboard`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  }

  // Get sales analytics
  async getSalesAnalytics() {
    try {
      const response = await axios.get(`${this.baseURL}/analytics/sales`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      throw error;
    }
  }

  // Get product analytics
  async getProductAnalytics() {
    try {
      const response = await axios.get(`${this.baseURL}/analytics/products`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      throw error;
    }
  }

  // Get customer analytics
  async getCustomerAnalytics() {
    try {
      const response = await axios.get(`${this.baseURL}/analytics/customers`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      throw error;
    }
  }

  // Get delivery analytics
  async getDeliveryAnalytics() {
    try {
      const response = await axios.get(`${this.baseURL}/analytics/delivery`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery analytics:', error);
      throw error;
    }
  }

  // Get financial analytics
  async getFinancialAnalytics() {
    try {
      const response = await axios.get(`${this.baseURL}/analytics/financial`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching financial analytics:', error);
      throw error;
    }
  }

  // Get top products
  async getTopProducts() {
    try {
      const response = await axios.get(`${this.baseURL}/analytics/top-products`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  }

  // Get recent orders
  async getRecentOrders(limit = 5) {
    try {
      const response = await axios.get(`${this.baseURL}/orders?limit=${limit}&sortBy=createdAt&sortOrder=desc`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw error;
    }
  }

  // Get comprehensive analytics (all data in one request)
  async getComprehensiveAnalytics(timeRange = '6months') {
    try {
      const response = await axios.get(`${this.baseURL}/analytics/comprehensive?timeRange=${timeRange}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching comprehensive analytics:', error);
      throw error;
    }
  }

  // Get real-time analytics
  async getRealTimeAnalytics() {
    try {
      const response = await axios.get(`${this.baseURL}/analytics/realtime`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
      throw error;
    }
  }

  // Get overview analytics
  async getOverviewAnalytics() {
    try {
      const response = await axios.get(`${this.baseURL}/analytics/overview`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching overview analytics:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();