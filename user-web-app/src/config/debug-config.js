// Debug Configuration - Temporary file to troubleshoot API issues
import { isProduction, getConfig } from './production-config';
import { API_CONFIG } from './api';

export const debugApiConfiguration = () => {
  console.log('🔍 Debugging API Configuration...');
  
  // Environment detection
  console.log('Environment Detection:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- window.location.hostname:', window.location.hostname);
  console.log('- isProduction():', isProduction());
  
  // Configuration objects
  console.log('Configuration Objects:');
  console.log('- API_CONFIG:', API_CONFIG);
  
  if (isProduction()) {
    const prodConfig = getConfig();
    console.log('- Production Config:', prodConfig);
    console.log('- Production API Base URL:', prodConfig.api.baseURL);
  }
  
  // Current API client state
  console.log('API Client State:');
  console.log('- Base URL being used:', API_CONFIG.baseURL);
  
  return {
    environment: process.env.NODE_ENV,
    hostname: window.location.hostname,
    isProduction: isProduction(),
    apiConfig: API_CONFIG,
    productionConfig: isProduction() ? getConfig() : null
  };
};

// Test API connectivity
export const testApiConnectivity = async () => {
  console.log('🧪 Testing API Connectivity...');
  
  try {
    const baseURL = isProduction() ? getConfig().api.baseURL : API_CONFIG.baseURL;
    console.log('Testing URL:', baseURL);
    
    const response = await fetch(`${baseURL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Test Successful:', data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log('❌ API Test Failed:', response.status, errorText);
      return { success: false, status: response.status, error: errorText };
    }
  } catch (error) {
    console.error('❌ API Test Error:', error);
    return { success: false, error: error.message };
  }
};

// Test API client configuration
export const testApiClientConfig = () => {
  console.log('🔧 Testing API Client Configuration...');
  
  try {
    // Get the current configuration from the window object
    const currentConfig = {
      baseURL: window.location.hostname.includes('netlify.app') 
        ? 'https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app/api/v1'
        : 'http://localhost:3000/api/v1',
      hostname: window.location.hostname,
      isNetlify: window.location.hostname.includes('netlify.app')
    };
    
    console.log('📊 Current Configuration:', currentConfig);
    
    // Test the configuration with a simple fetch
    fetch(`${currentConfig.baseURL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => {
      console.log('✅ Configuration Test Response:', response.status, response.ok);
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    })
    .then(data => {
      console.log('✅ Configuration Test Data:', data);
    })
    .catch(error => {
      console.error('❌ Configuration Test Error:', error);
    });
    
    return { success: true, message: 'API client configuration test initiated', config: currentConfig };
  } catch (error) {
    console.error('❌ API Client Config Test Error:', error);
    return { success: false, error: error.message };
  }
};

// Export for use in components
export default {
  debugApiConfiguration,
  testApiConnectivity
};
