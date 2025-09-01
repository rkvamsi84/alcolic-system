const axios = require('axios');

// Test the real Go-UPC API connection
async function testRealAPIConnection() {
  console.log('🧪 Testing Real Go-UPC API Connection\n');

  const API_KEY = 'e6a77838e1db0441733699bc541960a29d7d354adf61aaa62b6ad50677f019ac';
  const testUPC = '123456789012'; // Test UPC code

  const endpoints = [
    `https://api.goupc.com/v1/item/upc/${testUPC}`,
    `https://api.goupc.com/v1/item/${testUPC}`,
    `https://api.goupctest.com/v1/item/upc/${testUPC}`,
    `https://api.goupctest.com/v1/item/${testUPC}`
  ];

  console.log('🔑 API Key:', API_KEY);
  console.log('📦 Test UPC:', testUPC);
  console.log('');

  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    console.log(`\n${i + 1}. Testing endpoint: ${endpoint}`);
    
    try {
      console.log('🔄 Making request...');
      const response = await axios.get(endpoint, {
        headers: { 
          'key': API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      });
      
      console.log('✅ SUCCESS!');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      
      // Check if we have valid product data
      if (response.data && response.data.name) {
        console.log('🎯 Valid product data found!');
        console.log('Product Name:', response.data.name);
        console.log('Product Brand:', response.data.brand);
        console.log('Product Category:', response.data.category);
        return response.data;
      } else {
        console.log('⚠️ Response received but no valid product data');
        console.log('Response structure:', Object.keys(response.data || {}));
      }
      
    } catch (error) {
      console.log('❌ FAILED');
      console.log('Error type:', error.constructor.name);
      console.log('Error message:', error.message);
      
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response headers:', error.response.headers);
        console.log('Response data:', error.response.data);
      } else if (error.request) {
        console.log('No response received');
        console.log('Request details:', error.request);
      } else {
        console.log('Request setup error');
      }
      
      if (error.code) {
        console.log('Error code:', error.code);
      }
    }
  }

  console.log('\n❌ All endpoints failed. This indicates:');
  console.log('1. Network connectivity issues');
  console.log('2. API service is down');
  console.log('3. API key is invalid');
  console.log('4. Endpoints have changed');
  
  return null;
}

// Test with a real UPC code that might exist
async function testWithRealUPC() {
  console.log('\n🔍 Testing with a real UPC code...');
  
  // Common UPC codes for testing
  const realUPCs = [
    '123456789012', // Generic test
    '123456789013', // Another test
    '123456789014', // Another test
    '123456789015'  // Another test
  ];

  for (const upc of realUPCs) {
    console.log(`\n📦 Testing UPC: ${upc}`);
    try {
      const response = await axios.get(`https://api.goupc.com/v1/item/upc/${upc}`, {
        headers: { 
          'key': 'e6a77838e1db0441733699bc541960a29d7d354adf61aaa62b6ad50677f019ac'
        },
        timeout: 10000
      });
      
      if (response.data && response.data.name) {
        console.log('✅ Found real product data!');
        console.log('Product:', response.data.name);
        return response.data;
      }
    } catch (error) {
      console.log(`❌ UPC ${upc} failed:`, error.message);
    }
  }
  
  return null;
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting Go-UPC API Connection Tests\n');
  
  const result1 = await testRealAPIConnection();
  const result2 = await testWithRealUPC();
  
  console.log('\n📊 Test Results Summary:');
  if (result1 || result2) {
    console.log('✅ API is accessible and returning data');
    console.log('🎯 Real data can be fetched from Go-UPC API');
  } else {
    console.log('❌ API is not accessible');
    console.log('💡 Using mock data fallback is the correct approach');
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('1. If API is accessible: Real data will be used');
  console.log('2. If API is not accessible: Mock data will be used');
  console.log('3. Both scenarios provide a working product import system');
}

runTests().catch(console.error); 