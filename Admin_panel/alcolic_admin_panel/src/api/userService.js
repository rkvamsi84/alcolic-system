import { apiService, ENDPOINTS } from './config';

class UserService {
  // Get all users with pagination and filters
  async getUsers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.users.getAll}?${queryString}` : ENDPOINTS.users.getAll;
      const response = await apiService.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await apiService.get(ENDPOINTS.users.getById(userId));
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      const response = await apiService.post(ENDPOINTS.users.create, userData);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await apiService.put(ENDPOINTS.users.update(userId), userData);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await apiService.delete(ENDPOINTS.users.delete(userId));
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  // Activate user
  async activateUser(userId) {
    try {
      const response = await apiService.patch(ENDPOINTS.users.activate(userId));
      return response.data;
    } catch (error) {
      console.error('Activate user error:', error);
      throw error;
    }
  }

  // Deactivate user
  async deactivateUser(userId) {
    try {
      const response = await apiService.patch(ENDPOINTS.users.deactivate(userId));
      return response.data;
    } catch (error) {
      console.error('Deactivate user error:', error);
      throw error;
    }
  }

  // Get customers
  async getCustomers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.users.customers}?${queryString}` : ENDPOINTS.users.customers;
      const response = await apiService.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get customers error:', error);
      throw error;
    }
  }

  // Get delivery men
  async getDeliveryMen(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.users.deliveryMen}?${queryString}` : ENDPOINTS.users.deliveryMen;
      const response = await apiService.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get delivery men error:', error);
      throw error;
    }
  }

  // Search users
  async searchUsers(query, filters = {}) {
    try {
      const params = { ...filters, search: query };
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `${ENDPOINTS.users.getAll}?${queryString}`;
      const response = await apiService.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkActivateUsers(userIds) {
    try {
      const response = await apiService.post(`${ENDPOINTS.users.getAll}/bulk-activate`, { userIds });
      return response.data;
    } catch (error) {
      console.error('Bulk activate users error:', error);
      throw error;
    }
  }

  async bulkDeactivateUsers(userIds) {
    try {
      const response = await apiService.post(`${ENDPOINTS.users.getAll}/bulk-deactivate`, { userIds });
      return response.data;
    } catch (error) {
      console.error('Bulk deactivate users error:', error);
      throw error;
    }
  }

  async bulkDeleteUsers(userIds) {
    try {
      const response = await apiService.post(`${ENDPOINTS.users.getAll}/bulk-delete`, { userIds });
      return response.data;
    } catch (error) {
      console.error('Bulk delete users error:', error);
      throw error;
    }
  }
}

export const userService = new UserService(); 