// Test script to verify the fixed login functionality
const axios = require('axios');

// Test configuration
const API_BASE_URL = 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1';
const BYPASS_TOKEN = 'vghntrxcgvhbjnbvcxfcghvjbnkmhgvb';

// Test credentials
const testCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

async function testLogin() {
  console.log('🔧 Testing fixed login configuration...');
  console.log('📍 API Base URL:', API_BASE_URL);
  console.log('🔑 Using bypass token:', BYPASS_TOKEN);
  
  try {
    // Test the login endpoint with proper query parameter
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      testCredentials,
      {
        params: {
          'x-vercel-protection-bypass': BYPASS_TOKEN
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('✅ Login request successful!');
    console.log('📊 Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('🎉 Login functionality is working correctly!');
    } else {
      console.log('⚠️ Login request succeeded but returned failure:', response.data.message);
    }
    
  } catch (error) {
    console.log('❌ Login test failed:');
    console.log('🔍 Error type:', error.name);
    console.log('📝 Error message:', error.message);
    
    if (error.response) {
      console.log('📊 Response status:', error.response.status);
      console.log('📋 Response data:', JSON.stringify(error.response.data, null, 2));
      console.log('🔗 Response headers:', JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      console.log('📡 No response received');
      console.log('🔗 Request config:', JSON.stringify(error.config, null, 2));
    }
  }
}

// Test API health first
async function testAPIHealth() {
  console.log('🏥 Testing API health...');
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}`,
      {
        params: {
          'x-vercel-protection-bypass': BYPASS_TOKEN
        },
        timeout: 10000
      }
    );
    
    console.log('✅ API is healthy!');
    console.log('📊 Response status:', response.status);
    console.log('📋 API info:', JSON.stringify(response.data, null, 2));
    return true;
    
  } catch (error) {
    console.log('❌ API health check failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting login functionality tests...');
  console.log('=' .repeat(50));
  
  // Test API health first
  const isHealthy = await testAPIHealth();
  console.log('\n' + '=' .repeat(50));
  
  if (isHealthy) {
    // Test login functionality
    await testLogin();
  } else {
    console.log('⚠️ Skipping login test due to API health issues');
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Test completed!');
}

runTests().catch(console.error);