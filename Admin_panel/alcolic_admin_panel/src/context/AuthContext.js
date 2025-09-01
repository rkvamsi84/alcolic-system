import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const storedToken = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    console.log('AuthContext: Checking authentication on load');
    console.log('AuthContext: Token exists:', !!storedToken);
    console.log('AuthContext: User data exists:', !!userData);
    if (storedToken && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      setToken(storedToken);
      console.log('AuthContext: User authenticated on load');
    } else {
      console.log('AuthContext: No stored authentication found');
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    console.log('AuthContext: login called with userData:', userData);
    console.log('AuthContext: token received:', !!token);
    setIsAuthenticated(true);
    setUser(userData);
    setToken(token);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('admin_token', token);
      console.log('AuthContext: Token stored in localStorage');
    }
    console.log('AuthContext: isAuthenticated set to true');
    console.log('AuthContext: User data stored in localStorage');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  const value = {
    isAuthenticated,
    user,
    token,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 