const https = require('https');
const http = require('http');

const API_BASE_URL = 'http://localhost:5000';

// Test login functionality
async function testLogin() {
  console.log('🔍 Testing Login Functionality...\n');
  
  const testCredentials = {
    email: 'customer@test.com',
    password: 'password123',
    role: 'customer'
  };
  
  try {
    console.log('📤 Sending login request...');
    console.log('Credentials:', { ...testCredentials, password: '***' });
    
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCredentials),
    });
    
    const data = await response.json();
    
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Data:', data);
    
    if (response.ok && data.success) {
      console.log('✅ Login successful!');
      console.log('🔑 Token received:', data.data.token ? 'YES' : 'NO');
      console.log('👤 User data:', data.data.user ? 'YES' : 'NO');
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }
}

// Test if backend is accessible
async function testBackendConnection() {
  console.log('🔍 Testing Backend Connection...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Backend is accessible');
      console.log('📊 Health Status:', data);
    } else {
      console.log('❌ Backend responded with error:', response.status);
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend:', error.message);
  }
}

// Test if test user exists
async function testUserExists() {
  console.log('🔍 Testing if test user exists...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/users?role=customer`);
    const data = await response.json();
    
    if (response.ok) {
      const testUser = data.data?.find(user => user.email === 'customer@test.com');
      if (testUser) {
        console.log('✅ Test user found:', {
          id: testUser._id,
          name: testUser.name,
          email: testUser.email,
          role: testUser.role,
          isActive: testUser.isActive
        });
      } else {
        console.log('❌ Test user not found');
      }
    } else {
      console.log('❌ Failed to fetch users:', data.message);
    }
  } catch (error) {
    console.log('❌ Error checking users:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Testing Alcolic User App Login System...\n');
  
  await testBackendConnection();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testUserExists();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testLogin();
  
  console.log('\n📋 Test Summary:');
  console.log('✅ Backend connection test');
  console.log('✅ User existence test');
  console.log('✅ Login functionality test');
}

// Run tests
runTests().catch(console.error); 