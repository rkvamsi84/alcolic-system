import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';
import { API_CONFIG, SOCKET_CONFIG } from '../../config/api';
import { debugApiConfiguration, testApiConnectivity, testApiClientConfig } from '../../config/debug-config';

const ConfigDebug = () => {
  const [config, setConfig] = useState({});
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    // Get current configuration
    setConfig({
      apiBaseUrl: API_CONFIG.baseURL,
      socketUrl: SOCKET_CONFIG.url,
      environment: process.env.NODE_ENV,
      apiBaseUrlEnv: process.env.REACT_APP_API_BASE_URL,
      socketUrlEnv: process.env.REACT_APP_SOCKET_URL,
    });
  }, []);

  const testBackendConnection = async () => {
    try {
      setTestResult({ loading: true, success: false, error: null });
      
      const response = await fetch(`${API_CONFIG.baseURL}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult({ 
          loading: false, 
          success: true, 
          data: data,
          status: response.status 
        });
      } else {
        setTestResult({ 
          loading: false, 
          success: false, 
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status 
        });
      }
    } catch (error) {
      setTestResult({ 
        loading: false, 
        success: false, 
        error: error.message 
      });
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🔍 Configuration Debug
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Configuration
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            API Base URL:
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
            {config.apiBaseUrl}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Socket URL:
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
            {config.socketUrl}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Environment Variables:
          </Typography>
          <Typography variant="body2">
            REACT_APP_API_BASE_URL: {config.apiBaseUrlEnv || 'NOT SET'}
          </Typography>
          <Typography variant="body2">
            REACT_APP_SOCKET_URL: {config.socketUrlEnv || 'NOT SET'}
          </Typography>
          <Typography variant="body2">
            NODE_ENV: {config.environment || 'NOT SET'}
          </Typography>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Backend Connection Test
        </Typography>
        
        <Button 
          variant="contained" 
          onClick={testBackendConnection}
          disabled={testResult?.loading}
          sx={{ mb: 2 }}
        >
          {testResult?.loading ? 'Testing...' : 'Test Backend Connection'}
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={() => {
            const debugInfo = debugApiConfiguration();
            console.log('Debug Info:', debugInfo);
            setTestResult({ 
              loading: false, 
              success: true, 
              data: debugInfo,
              status: 'Debug Info Logged to Console'
            });
          }}
          sx={{ mb: 2, ml: 2 }}
        >
          Debug API Config
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={async () => {
            setTestResult({ loading: true, success: false, error: null });
            const result = await testApiConnectivity();
            setTestResult({ 
              loading: false, 
              success: result.success, 
              data: result.data,
              error: result.error,
              status: result.status
            });
          }}
          sx={{ mb: 2, ml: 2 }}
        >
          Test API Connectivity
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={async () => {
            setTestResult({ loading: true, success: false, error: null });
            const result = testApiClientConfig();
            setTestResult({ 
              loading: false, 
              success: result.success, 
              message: result.message,
              error: result.error
            });
          }}
          sx={{ mb: 2, ml: 2 }}
        >
          Test API Client Config
        </Button>
        
        {testResult && (
          <Box>
            {testResult.loading && (
              <Alert severity="info">Testing connection...</Alert>
            )}
            
            {testResult.success && (
              <Alert severity="success">
                ✅ Backend connection successful! (Status: {testResult.status})
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Response: {JSON.stringify(testResult.data, null, 2)}
                </Typography>
              </Alert>
            )}
            
            {testResult.error && (
              <Alert severity="error">
                ❌ Backend connection failed: {testResult.error}
              </Alert>
            )}
          </Box>
        )}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Expected Configuration
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          The frontend should be using these URLs:
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ✅ Correct API Base URL:
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: 'green.100', p: 1, borderRadius: 1 }}>
            https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app/api/v1
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ✅ Correct Socket URL:
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: 'green.100', p: 1, borderRadius: 1 }}>
            https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app
          </Typography>
        </Box>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          If the URLs above don't match the current configuration, the development server needs to be restarted.
        </Alert>
      </Paper>
    </Box>
  );
};

export default ConfigDebug;
