import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { apiService } from '../config/api';
import { useAuth } from './AuthContext';

const SecurityContext = createContext();

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [securitySettings, setSecuritySettings] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load security settings
  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/security/settings');
      if (response.success) {
        setSecuritySettings(response.data);
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load active sessions
  const loadActiveSessions = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/security/sessions');
      if (response.success) {
        setActiveSessions(response.data);
      }
    } catch (error) {
      console.error('Error loading active sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load login history
  const loadLoginHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/security/login-history');
      if (response.success) {
        setLoginHistory(response.data);
      }
    } catch (error) {
      console.error('Error loading login history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Setup 2FA
  const setup2FA = async () => {
    try {
      setLoading(true);
      const response = await apiService.post('/security/2fa/setup');
      if (response.success) {
        toast.success('2FA setup initiated');
        await loadSecuritySettings();
        return response.data;
      }
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast.error(error.message || 'Failed to setup 2FA');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verify and enable 2FA
  const verify2FA = async (token) => {
    try {
      setLoading(true);
      const response = await apiService.post('/security/2fa/verify', { token });
      if (response.success) {
        toast.success('Two-factor authentication enabled successfully');
        await loadSecuritySettings();
        return true;
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast.error(error.message || 'Failed to verify 2FA');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Disable 2FA
  const disable2FA = async (token) => {
    try {
      setLoading(true);
      const response = await apiService.post('/security/2fa/disable', { token });
      if (response.success) {
        toast.success('Two-factor authentication disabled successfully');
        await loadSecuritySettings();
        return true;
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error(error.message || 'Failed to disable 2FA');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verify 2FA token
  const verify2FAToken = async (token) => {
    try {
      const response = await apiService.post('/security/2fa/verify-token', { token });
      if (response.success) {
        return true;
      }
    } catch (error) {
      console.error('Error verifying 2FA token:', error);
      throw error;
    }
  };

  // Update security preferences
  const updateSecurityPreferences = async (preferences) => {
    try {
      setLoading(true);
      const response = await apiService.put('/security/settings', {
        securityPreferences: preferences
      });
      if (response.success) {
        toast.success('Security preferences updated successfully');
        await loadSecuritySettings();
        return true;
      }
    } catch (error) {
      console.error('Error updating security preferences:', error);
      toast.error(error.message || 'Failed to update security preferences');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Revoke session
  const revokeSession = async (sessionId) => {
    try {
      setLoading(true);
      const response = await apiService.delete(`/security/sessions/${sessionId}`);
      if (response.success) {
        toast.success('Session revoked successfully');
        await loadActiveSessions();
        return true;
      }
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error(error.message || 'Failed to revoke session');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Revoke all sessions except current
  const revokeAllOtherSessions = async () => {
    try {
      setLoading(true);
      const response = await apiService.delete('/security/sessions');
      if (response.success) {
        toast.success('All other sessions revoked successfully');
        await loadActiveSessions();
        return true;
      }
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      toast.error(error.message || 'Failed to revoke sessions');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Change password with security validation
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      const response = await apiService.put('/security/change-password', {
        currentPassword,
        newPassword
      });
      if (response.success) {
        toast.success('Password changed successfully');
        return true;
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update IP restrictions
  const updateIPRestrictions = async (allowedIPs, blockedIPs) => {
    try {
      setLoading(true);
      const response = await apiService.put('/security/ip-restrictions', {
        allowedIPs,
        blockedIPs
      });
      if (response.success) {
        toast.success('IP restrictions updated successfully');
        await loadSecuritySettings();
        return true;
      }
    } catch (error) {
      console.error('Error updating IP restrictions:', error);
      toast.error(error.message || 'Failed to update IP restrictions');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Generate new backup codes
  const generateBackupCodes = async () => {
    try {
      setLoading(true);
      const response = await apiService.post('/security/2fa/backup-codes');
      if (response.success) {
        toast.success('New backup codes generated successfully');
        return response.data.backupCodes;
      }
    } catch (error) {
      console.error('Error generating backup codes:', error);
      toast.error(error.message || 'Failed to generate backup codes');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Validate password strength
  const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      score: [
        password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      ].filter(Boolean).length
    };
  };

  // Initialize security data
  useEffect(() => {
    // Only load security data if user is authenticated
    if (user && token) {
      loadSecuritySettings();
      loadActiveSessions();
      loadLoginHistory();
    }
  }, [user, token]);

  const value = {
    securitySettings,
    activeSessions,
    loginHistory,
    loading,
    loadSecuritySettings,
    loadActiveSessions,
    loadLoginHistory,
    setup2FA,
    verify2FA,
    disable2FA,
    verify2FAToken,
    updateSecurityPreferences,
    revokeSession,
    revokeAllOtherSessions,
    changePassword,
    updateIPRestrictions,
    generateBackupCodes,
    validatePasswordStrength
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}; 