import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../config/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('user_token'));

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔍 Checking auth status...');
        console.log('🔍 Token exists:', !!token);
        
        if (token) {
          // Set the token in API service
          apiService.setToken(token);
          
          // Try to get user profile from localStorage
          const storedUser = localStorage.getItem('user_data');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            console.log('🔍 Found stored user:', userData);
            setUser(userData);
          } else {
            console.log('🔍 No stored user data found, clearing token');
            // Clear invalid token without calling logout to avoid redirect loop
            setToken(null);
            setUser(null);
            localStorage.removeItem('user_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
            apiService.setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear auth state without calling logout to avoid redirect loop
        setToken(null);
        setUser(null);
        localStorage.removeItem('user_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        apiService.setToken(null);
      } finally {
        setLoading(false);
      }
    };

    // Check if user is already logged in
    if (token) {
      initAuth();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Listen for auth failure events from API service
  useEffect(() => {
    const handleAuthFailure = () => {
      console.log('🔓 Auth failure event received, logging out user');
      logout();
    };

    window.addEventListener('authFailure', handleAuthFailure);
    
    return () => {
      window.removeEventListener('authFailure', handleAuthFailure);
    };
  }, []);

  const login = async (email, password, role = 'customer') => {
    try {
      setLoading(true);
      console.log('🔐 Attempting login with:', { email, password: '***', role });
      
      const response = await apiService.auth.login({
        email,
        password,
        role, // Support both customer and delivery roles
      });

      console.log('🔐 Login response:', response);

      if (response && response.success) {
        // Extract data based on API response structure
        const authToken = response.data.token || response.token;
        const refreshToken = response.data.refreshToken || response.refreshToken;
        const userData = response.data.user || response.user;
        
        // Store tokens in localStorage
        localStorage.setItem('user_token', authToken);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        
        // Set tokens in API service
        apiService.setToken(authToken);
        if (refreshToken) {
          apiService.setRefreshToken(refreshToken);
        }
        
        // Update state
        setToken(authToken);
        setUser(userData);
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        console.log('🔐 Login successful, token stored:', !!authToken);
        toast.success('Login successful!');
        return { success: true };
      } else {
        const errorMessage = response?.message || 'Login failed';
        console.log('🔐 Login failed:', errorMessage);
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('🔐 Login error:', error);
      
      // Handle detailed error information
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || errorMessage;
        console.log('Error response data:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else if (error.data && error.data.message) {
        // Error has data property with message
        errorMessage = error.data.message;
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || errorMessage;
      }
      
      if (error.data) {
        if (error.data.message) {
          errorMessage = error.data.message;
        } else if (error.data.errors && error.data.errors.length > 0) {
          // Display first validation error
          errorMessage = error.data.errors[0].msg;
        }
      }
      
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('🔄 Registering user with data:', userData);
      const response = await apiService.auth.register(userData);
      console.log('📥 Registration response:', response);

      // Handle axios response structure
      const responseData = response.data || response;
      
      if (responseData.success) {
        const { token: authToken, refreshToken, user: newUser } = responseData.data;
        
        // Store tokens in localStorage first
        localStorage.setItem('user_token', authToken);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        
        // Set tokens in API service
        apiService.setToken(authToken);
        if (refreshToken) {
          apiService.setRefreshToken(refreshToken);
        }
        
        // Update state
        setToken(authToken);
        setUser(newUser);
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user_data', JSON.stringify(newUser));
        
        console.log('🔐 Registration successful, token stored:', !!authToken);
        toast.success('Registration successful!');
        return { success: true };
      } else {
        toast.error(responseData.message || 'Registration failed');
        return { success: false, message: responseData.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle detailed error information
      let errorMessage = 'Registration failed. Please try again.';
      
      // Handle 409 Conflict errors specifically
      if (error.response?.status === 409) {
        const conflictMessage = error.response?.data?.message;
        if (conflictMessage?.includes('Email already registered')) {
          errorMessage = 'This email is already registered. Please use a different email or try logging in.';
        } else if (conflictMessage?.includes('Phone number already registered')) {
          errorMessage = 'This phone number is already registered. Please use a different phone number or try logging in.';
        } else {
          errorMessage = 'An account with these details already exists. Please try logging in instead.';
        }
      } else if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors && error.response.data.errors.length > 0) {
          // Display first validation error
          errorMessage = error.response.data.errors[0].msg;
        }
      } else if (error.data) {
        if (error.data.message) {
          errorMessage = error.data.message;
        } else if (error.data.errors && error.data.errors.length > 0) {
          // Display first validation error
          errorMessage = error.data.errors[0].msg;
        }
      }
      
      toast.error(errorMessage);
      return { success: false, message: errorMessage, errors: error.response?.data?.errors || error.data?.errors || [] };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🔓 Logging out...');
    apiService.removeToken();
    setToken(null);
    setUser(null);
    localStorage.removeItem('user_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('cart_items');
    localStorage.removeItem('favorites');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await apiService.users.updateProfile(profileData);

      if (response.success) {
        setUser(response.data);
        toast.success('Profile updated successfully!');
        return { success: true };
      } else {
        toast.error(response.message || 'Profile update failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profile update failed. Please try again.');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await apiService.auth.forgotPassword({ email });

      if (response.success) {
        toast.success('Password reset instructions sent to your email');
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to send reset instructions');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Failed to send reset instructions. Please try again.');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      const response = await apiService.auth.resetPassword({
        token,
        password: newPassword,
      });

      if (response.success) {
        toast.success('Password reset successfully!');
        return { success: true };
      } else {
        toast.error(response.message || 'Password reset failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Password reset failed. Please try again.');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};