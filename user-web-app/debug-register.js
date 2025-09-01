// Debug script to test user registration with unique data
const axios = require('axios');

// API Configuration
const API_BASE_URL = 'https://nextjs-backend-e50dnzh8r-rkvamsi84-gmailcoms-projects.vercel.app/api/v1';

// Generate unique data
const timestamp = Date.now();
const uniqueEmail = `testuser${timestamp}@alcolic.com`;
const uniquePhone = `+1${timestamp.toString().slice(-10)}`;

// Test registration function
async function testRegistration() {
  try {
    console.log('📝 Testing user registration with unique data...');
    console.log('Email:', uniqueEmail);
    console.log('Phone:', uniquePhone);
    
    const userData = {
      name: 'Test User',
      email: uniqueEmail,
      phone: uniquePhone,
      password: 'TestPass123!',
      role: 'customer'
    };
    
    const response = await axios.post(`${API_BASE_URL}/auth/register?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb`, userData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 30000
    });
    
    console.log('✅ Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Now try to login with the registered user
    await testLoginWithNewUser(userData.email, userData.password);
    
  } catch (error) {
    console.log('❌ Registration failed!');
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.message);
    
    if (error.response) {
      console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Test login with newly registered user
async function testLoginWithNewUser(email, password) {
  try {
    console.log('\n🔐 Testing login with newly registered user...');
    console.log('Login email:', email);
    
    const response = await axios.post(`${API_BASE_URL}/auth/login?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb`, {
      email: email,
      password: password,
      role: 'customer'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 30000
    });
    
    console.log('✅ Login successful with new user!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Login failed with new user!');
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.message);
    
    if (error.response) {
      console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Test what happens with the old test credentials
async function testOldCredentials() {
  try {
    console.log('\n🔐 Testing with old test credentials again...');
    
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
    
    console.log('✅ Old credentials work!');
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Old credentials still fail!');
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.response?.data?.message || error.message);
  }
}

// Run registration tests
async function runRegistrationTests() {
  console.log('🚀 Starting registration debug tests...\n');
  
  await testRegistration();
  await testOldCredentials();
  
  console.log('\n🏁 Registration debug tests completed!');
  console.log('\n💡 Summary: The login error occurs because the test credentials (test@alcolic.com / password123) do not exist in the production database.');
  console.log('💡 Solution: Either register new users or update the test credentials in the frontend.');
}

runRegistrationTests();