const axios = require('axios');

// Test the updated backend URL
const API_BASE_URL = 'https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app/api/v1';

async function testBackendConnection() {
  console.log('🧪 Testing Backend Connection...');
  console.log('📍 Backend URL:', API_BASE_URL);
  
  try {
    // Test health endpoint
    console.log('\n1️⃣ Testing Health Endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/api/health?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb`);
    console.log('✅ Health Check Response:', healthResponse.data);
    
    // Test API index
    console.log('\n2️⃣ Testing API Index...');
    const apiResponse = await axios.get(`${API_BASE_URL}?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb`);
    console.log('✅ API Index Response:', apiResponse.data);
    
    // Test categories endpoint
    console.log('\n3️⃣ Testing Categories Endpoint...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb`);
    console.log('✅ Categories Response:', categoriesResponse.data);
    
    console.log('\n🎉 All Backend Tests Passed! The backend is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Backend Test Failed:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

// Run the test
testBackendConnection();
