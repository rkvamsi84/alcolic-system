// Simple mock auth context for role-based access
import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_CONFIG } from '../api/config';
import socketService from '../services/socketService';

const AuthContext = createContext(null);

// In a real application, this would be handled by a backend service
const ADMIN_CREDENTIALS = {
  email: 'admin@liquorstore.com',
  password: 'admin123',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and user in localStorage
    const savedToken = localStorage.getItem('store_token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Verify token is still valid by making a test request
        fetch(`${API_CONFIG.baseURL}/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          }
        }).then(response => {
          if (response.ok) {
            setUser(parsedUser);
            setToken(savedToken);
            console.log('🔌 Initializing socket connection for existing user');
            socketService.connect(savedToken);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('store_token');
            localStorage.removeItem('user');
            localStorage.removeItem('store_id');
          }
        }).catch(() => {
          // Network error, clear storage
          localStorage.removeItem('store_token');
          localStorage.removeItem('user');
          localStorage.removeItem('store_id');
        });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('store_token');
        localStorage.removeItem('user');
        localStorage.removeItem('store_id');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const loginUrl = `${API_CONFIG.baseURL}/auth/login`;
      console.log('🔧 Attempting login to:', loginUrl);
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, role: 'store' }) // Force role to 'store'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Login failed');
      
      setUser(data.data.user);
      setToken(data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('store_token', data.data.token);
      localStorage.setItem('store_id', data.data.user.storeId || data.data.user._id);
      
      // Initialize socket connection after successful login
      socketService.connect(data.data.token);
      
      return data.data.user;
    } catch (err) {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('store_token');
    localStorage.removeItem('store_id');
    
    // Disconnect socket on logout
    socketService.disconnect();
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
