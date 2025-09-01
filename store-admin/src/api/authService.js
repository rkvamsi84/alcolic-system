import { apiService, ENDPOINTS } from './config';

class AuthService {
  // Login
  async login(email, password) {
    try {
      const response = await apiService.post(ENDPOINTS.auth.login, {
        email,
        password,
        role: 'store'
      });
      
      if (response.success && response.data.token) {
        apiService.setToken(response.data.token);
        return response.data;
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register (for creating new store accounts)
  async register(storeData) {
    try {
      const response = await apiService.post(ENDPOINTS.auth.register, {
        ...storeData,
        role: 'store'
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      await apiService.post(ENDPOINTS.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiService.removeToken();
    }
  }

  // Get current store profile
  async getProfile() {
    try {
      const response = await apiService.get('/store/profile/me');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update store profile
  async updateProfile(profileData) {
    try {
      const response = await apiService.put(ENDPOINTS.store.update, profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Get store analytics
  async getAnalytics(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `${ENDPOINTS.store.analytics}?${queryString}` : ENDPOINTS.store.analytics;
      const response = await apiService.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Get analytics error:', error);
      throw error;
    }
  }

  // Get store settings
  async getSettings() {
    try {
      const response = await apiService.get(ENDPOINTS.store.settings);
      return response.data;
    } catch (error) {
      console.error('Get settings error:', error);
      throw error;
    }
  }

  // Update store settings
  async updateSettings(settingsData) {
    try {
      const response = await apiService.put(ENDPOINTS.store.settings, settingsData);
      return response.data;
    } catch (error) {
      console.error('Update settings error:', error);
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiService.post(ENDPOINTS.auth.forgotPassword, { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await apiService.post(ENDPOINTS.auth.resetPassword, {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await apiService.post(ENDPOINTS.auth.refresh);
      if (response.success && response.data.token) {
        apiService.setToken(response.data.token);
        return response.data;
      }
      throw new Error(response.message || 'Token refresh failed');
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!apiService.getToken();
  }

  // Get stored token
  getToken() {
    return apiService.getToken();
  }
}

export const authService = new AuthService(); 