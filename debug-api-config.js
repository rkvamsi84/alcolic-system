const axios = require('axios');

// Test the API configuration
const API_BASE_URL = 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1';
const BYPASS_TOKEN = 'vghntrxcgvhbjnbvcxfcghvjbnkmhgvb';

// Create axios instance similar to the frontend
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log('Original config.url:', config.url);
    console.log('Base URL:', config.baseURL);
    
    // Add Vercel protection bypass token
    if (!config.params) {
      config.params = {};
    }
    config.params['x-vercel-protection-bypass'] = BYPASS_TOKEN;
    
    console.log('Final params:', config.params);
    console.log('Final URL will be:', config.baseURL + config.url);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

async function testAPIConnection() {
  try {
    console.log('Testing API health check...');
    const healthResponse = await apiClient.get('/');
    console.log('Health check successful:', healthResponse.status);
    
    console.log('\nTesting login endpoint...');
    const loginResponse = await apiClient.post('/auth/login', {
      email: 'test@example.com',
      password: 'testpassword'
    });
    console.log('Login response:', loginResponse.status);
    
  } catch (error) {
    console.error('Error details:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
    console.error('URL:', error.config?.url);
    console.error('Full URL:', error.config?.baseURL + error.config?.url);
    console.error('Params:', error.config?.params);
  }
}

testAPIConnection();