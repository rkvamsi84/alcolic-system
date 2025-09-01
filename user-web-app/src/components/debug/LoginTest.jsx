import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const LoginTest = () => {
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'TestPass123!'
  });

  // Test with working credentials
  const testWorkingLogin = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      const result = await login('testuser1756713371311@alcolic.com', 'TestPass123!');
      if (result.success) {
        setTestResult('✅ Login successful with working credentials!');
        toast.success('Login test passed!');
      } else {
        setTestResult(`❌ Login failed: ${result.message}`);
        toast.error('Login test failed');
      }
    } catch (error) {
      setTestResult(`❌ Login error: ${error.message}`);
      toast.error('Login test error');
    } finally {
      setLoading(false);
    }
  };

  // Test with invalid credentials
  const testInvalidLogin = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      const result = await login('test@alcolic.com', 'password123');
      if (result.success) {
        setTestResult('⚠️ Unexpected: Invalid credentials worked!');
      } else {
        setTestResult(`✅ Expected failure: ${result.message}`);
        toast.success('Invalid credentials properly rejected');
      }
    } catch (error) {
      setTestResult(`✅ Expected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Register a new user
  const registerNewUser = async () => {
    if (!newUserData.name || !newUserData.email || !newUserData.phone) {
      toast.error('Please fill in all fields');
      return;
    }

    setRegisterLoading(true);
    setTestResult('');
    
    try {
      const result = await register({
        ...newUserData,
        role: 'customer'
      });
      
      if (result.success) {
        setTestResult(`✅ Registration successful! You can now login with: ${newUserData.email}`);
        toast.success('Registration successful!');
        
        // Clear form
        setNewUserData({
          name: '',
          email: '',
          phone: '',
          password: 'TestPass123!'
        });
      } else {
        setTestResult(`❌ Registration failed: ${result.message}`);
        toast.error('Registration failed');
      }
    } catch (error) {
      setTestResult(`❌ Registration error: ${error.message}`);
      toast.error('Registration error');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        🔐 Login Authentication Test
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
        Test the authentication system with different scenarios
      </Typography>

      {/* Test Results */}
      {testResult && (
        <Alert 
          severity={testResult.includes('✅') ? 'success' : testResult.includes('⚠️') ? 'warning' : 'error'} 
          sx={{ mb: 3 }}
        >
          {testResult}
        </Alert>
      )}

      {/* Test Buttons */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Authentication Tests
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="success"
              onClick={testWorkingLogin}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Test Working Login
            </Button>
            
            <Button
              variant="outlined"
              color="warning"
              onClick={testInvalidLogin}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Test Invalid Login
            </Button>
          </Box>
          
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            • Working Login: Tests with valid registered credentials<br/>
            • Invalid Login: Tests with non-existent credentials (should fail)
          </Typography>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Registration Form */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Register New User
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Create a new account to test login functionality
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full Name"
              value={newUserData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              fullWidth
            />
            
            <TextField
              label="Email"
              type="email"
              value={newUserData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              fullWidth
              placeholder="user@example.com"
            />
            
            <TextField
              label="Phone Number"
              value={newUserData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              fullWidth
              placeholder="+1234567890"
            />
            
            <TextField
              label="Password"
              value={newUserData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              fullWidth
              disabled
              helperText="Password is set to TestPass123! (meets requirements)"
            />
            
            <Button
              variant="contained"
              onClick={registerNewUser}
              disabled={registerLoading}
              startIcon={registerLoading ? <CircularProgress size={20} /> : null}
              sx={{ mt: 1 }}
            >
              Register New User
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
        💡 After registering, you can use the new credentials to login in the main app
      </Typography>
    </Box>
  );
};

export default LoginTest;