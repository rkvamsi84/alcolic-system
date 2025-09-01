const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890',
  password: 'TestPass123!'
};

let authToken = '';

async function testAPI() {
  console.log('🧪 Starting API tests...\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL.replace('/v1', '')}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);
    
    // Test 2: API Index
    console.log('\n2️⃣ Testing API Index...');
    const indexResponse = await axios.get(`${BASE_URL}`);
    console.log('✅ API Index:', indexResponse.data.message);
    
    // Test 3: User Registration
    console.log('\n3️⃣ Testing User Registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ User Registration:', registerResponse.data.message);
    authToken = registerResponse.data.data.token;
    
    // Test 4: User Login
    console.log('\n4️⃣ Testing User Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ User Login:', loginResponse.data.message);
    authToken = loginResponse.data.data.token;
    
    // Test 5: Get User Profile
    console.log('\n5️⃣ Testing Get User Profile...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get Profile:', profileResponse.data.message);
    
    // Test 6: Get Categories
    console.log('\n6️⃣ Testing Get Categories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
    console.log('✅ Get Categories:', categoriesResponse.data.count, 'categories found');
    
    // Test 7: Get Stores
    console.log('\n7️⃣ Testing Get Stores...');
    const storesResponse = await axios.get(`${BASE_URL}/stores`);
    console.log('✅ Get Stores:', storesResponse.data.count, 'stores found');
    
    // Test 8: Get Products
    console.log('\n8️⃣ Testing Get Products...');
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    console.log('✅ Get Products:', productsResponse.data.count, 'products found');
    
    console.log('\n🎉 All API tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Health Check');
    console.log('   ✅ API Index');
    console.log('   ✅ User Registration');
    console.log('   ✅ User Login');
    console.log('   ✅ Get User Profile');
    console.log('   ✅ Get Categories');
    console.log('   ✅ Get Stores');
    console.log('   ✅ Get Products');
    
  } catch (error) {
    console.error('\n❌ API test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
    
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

testAPI();
