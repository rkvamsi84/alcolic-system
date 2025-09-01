import { apiService, ENDPOINTS } from './config';

class CustomersService {
  // Get all customers
  async getCustomers(params = {}) {
    try {
      const queryString = new URLSearchParams({ ...params, role: 'customer' }).toString();
      const endpoint = `/users?${queryString}`;
      const response = await apiService.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get customers error:', error);
      throw error;
    }
  }

  // Get customer by ID
  async getCustomerById(id) {
    try {
      const response = await apiService.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get customer by ID error:', error);
      throw error;
    }
  }

  // Create new customer
  async createCustomer(customerData) {
    try {
      const response = await apiService.post('/users', {
        ...customerData,
        role: 'customer'
      });
      return response.data;
    } catch (error) {
      console.error('Create customer error:', error);
      throw error;
    }
  }

  // Update customer
  async updateCustomer(id, customerData) {
    try {
      const response = await apiService.put(`/users/${id}`, customerData);
      return response.data;
    } catch (error) {
      console.error('Update customer error:', error);
      throw error;
    }
  }

  // Delete customer
  async deleteCustomer(id) {
    try {
      const response = await apiService.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete customer error:', error);
      throw error;
    }
  }

  // Search customers
  async searchCustomers(query) {
    try {
      const response = await apiService.get(`/users/search?q=${query}&role=customer`);
      return response.data;
    } catch (error) {
      console.error('Search customers error:', error);
      throw error;
    }
  }

  // Update customer status
  async updateCustomerStatus(id, isActive) {
    try {
      const response = await apiService.patch(`/users/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Update customer status error:', error);
      throw error;
    }
  }

  // Get customer analytics
  async getCustomerAnalytics(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.customers}?${queryString}` : ENDPOINTS.analytics.customers;
      const response = await apiService.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get customer analytics error:', error);
      throw error;
    }
  }

  // Get customer segments
  async getCustomerSegments(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.analytics.customerSegments}?${queryString}` : ENDPOINTS.analytics.customerSegments;
      const response = await apiService.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get customer segments error:', error);
      throw error;
    }
  }

  // Get customer orders
  async getCustomerOrders(customerId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/users/${customerId}/orders?${queryString}` : `/users/${customerId}/orders`;
      const response = await apiService.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get customer orders error:', error);
      throw error;
    }
  }

  // Get customer statistics
  async getCustomerStats() {
    try {
      const response = await apiService.get('/users?role=customer');
      const customers = response.data.data || [];
      
      const stats = {
        totalCustomers: customers.length,
        activeCustomers: customers.filter(c => c.isActive).length,
        inactiveCustomers: customers.filter(c => !c.isActive).length,
        newCustomers: customers.filter(c => {
          const createdAt = new Date(c.createdAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdAt >= thirtyDaysAgo;
        }).length,
        averageOrdersPerCustomer: customers.reduce((sum, c) => sum + (c.orderCount || 0), 0) / customers.length || 0,
        totalRevenue: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
      };
      
      return { success: true, data: stats };
    } catch (error) {
      console.error('Get customer stats error:', error);
      throw error;
    }
  }
}

export const customersService = new CustomersService(); 