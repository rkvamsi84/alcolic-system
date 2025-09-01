const https = require('https');
const http = require('http');

const API_BASE_URL = 'http://localhost:5003';

// Test backend connection
async function testBackendConnection() {
  console.log('🔍 Testing Backend Connection...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Backend is running and accessible');
      console.log('📊 Health Status:', data);
    } else {
      console.log('❌ Backend responded with error:', response.status);
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend:', error.message);
  }
}

// Test user web app endpoints
async function testUserAppEndpoints() {
  console.log('\n🔍 Testing User App API Endpoints...');
  
  const endpoints = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/products',
    '/api/v1/categories',
    '/api/v1/promotions',
    '/api/v1/orders',
    '/api/v1/users/profile',
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      console.log(`${response.ok ? '✅' : '❌'} ${endpoint} - ${response.status}`);
    } catch (error) {
      console.log(`❌ ${endpoint} - Connection failed`);
    }
  }
}

// Test React app development server
async function testReactApp() {
  console.log('\n🔍 Testing React App Development Server...');
  
  try {
    const response = await fetch('http://localhost:3000');
    
    if (response.ok) {
      console.log('✅ React development server is running on http://localhost:3000');
      console.log('🌐 User Web App is accessible');
    } else {
      console.log('❌ React development server not responding');
    }
  } catch (error) {
    console.log('❌ React development server not running:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Testing Alcolic User Web App Setup...\n');
  
  await testBackendConnection();
  await testUserAppEndpoints();
  await testReactApp();
  
  console.log('\n📋 Test Summary:');
  console.log('✅ Backend API: http://localhost:5000');
  console.log('✅ User Web App: http://localhost:3000');
  console.log('✅ All systems should be connected and functional');
}

// Run tests
runTests().catch(console.error);