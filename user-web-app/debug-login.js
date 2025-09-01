// Debug script to test login API directly
const axios = require('axios');

// API Configuration
const API_BASE_URL = 'https://nextjs-backend-e50dnzh8r-rkvamsi84-gmailcoms-projects.vercel.app/api/v1';

// Test login function
async function testLogin() {
  try {
    console.log('🔐 Testing login with test credentials...');
    
    const response = await axios.post(`${API_BASE_URL}/auth/login?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb`, {
      email: 'test@alcolic.com',
      password: 'password123',
      role: 'customer'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 30000
    });
    
    console.log('✅ Login successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Login failed!');
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.message);
    
    if (error.response) {
      console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received:', error.request);
    } else {
      console.log('Request setup error:', error.message);
    }
  }
}

// Test with different credentials
async function testWithValidCredentials() {
  try {
    console.log('\n🔐 Testing login with potentially valid credentials...');
    
    const response = await axios.post(`${API_BASE_URL}/auth/login?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb`, {
      email: 'admin@alcolic.com',
      password: 'Admin123!',
      role: 'customer'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 30000
    });
    
    console.log('✅ Login successful with admin credentials!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Admin login also failed!');
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.message);
    
    if (error.response) {
      console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Test backend health
async function testBackendHealth() {
  try {
    console.log('\n🏥 Testing backend health...');
    
    const response = await axios.get(`${API_BASE_URL}/health?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb`, {
      headers: {
        'Accept': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Backend is healthy!');
    console.log('Health response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Backend health check failed!');
    console.log('Error:', error.message);
    
    if (error.response) {
      console.log('Health error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting login debug tests...\n');
  
  await testBackendHealth();
  await testLogin();
  await testWithValidCredentials();
  
  console.log('\n🏁 Debug tests completed!');
}

runTests();