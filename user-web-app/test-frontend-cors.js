// Test script to verify frontend can connect to backend without CORS issues
const API_BASE_URL = 'https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app/api/v1';

// Test function to simulate frontend API call
async function testFrontendConnection() {
  console.log('🧪 Testing Frontend Connection to Backend...');
  console.log('📍 Backend URL:', API_BASE_URL);
  
  try {
    // Test 1: Basic API call without bypass token (should work for public endpoints)
    console.log('\n1️⃣ Testing Public API Endpoint (Categories)...');
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Categories API Response:', data);
    } else {
      console.log('⚠️ Categories API Response Status:', response.status);
      const errorText = await response.text();
      console.log('Error Details:', errorText);
    }
    
    // Test 2: API Index endpoint
    console.log('\n2️⃣ Testing API Index Endpoint...');
    const indexResponse = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (indexResponse.ok) {
      const indexData = await indexResponse.json();
      console.log('✅ API Index Response:', indexData);
    } else {
      console.log('⚠️ API Index Response Status:', indexResponse.status);
    }
    
    // Test 3: Health endpoint
    console.log('\n3️⃣ Testing Health Endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health API Response:', healthData);
    } else {
      console.log('⚠️ Health API Response Status:', healthResponse.status);
    }
    
    console.log('\n🎉 Frontend Connection Test Completed!');
    
  } catch (error) {
    console.error('\n❌ Frontend Connection Test Failed:', error.message);
    console.error('Error Details:', error);
  }
}

// Run the test
testFrontendConnection();
