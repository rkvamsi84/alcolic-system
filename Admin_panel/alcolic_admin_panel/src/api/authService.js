import { apiService, ENDPOINTS } from './config';

class AuthService {
  // Login
  async login(email, password, role = 'customer') {
    try {
      const response = await apiService.post(ENDPOINTS.auth.login, {
        email,
        password,
        role: role
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

  // Register (for creating new admin users)
  async register(userData) {
    try {
      const response = await apiService.post(ENDPOINTS.auth.register, {
        ...userData,
        role: 'admin'
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

  // Get current user profile
  async getProfile() {
    try {
      const response = await apiService.get(ENDPOINTS.auth.profile);
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update profile
  async updateProfile(profileData) {
    try {
      const response = await apiService.put(ENDPOINTS.auth.profile, profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
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