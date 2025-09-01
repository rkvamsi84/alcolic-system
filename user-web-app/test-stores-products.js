const http = require('http');

const API_BASE = 'http://localhost:5003';

// Test API endpoint
function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5003,
      path: `/api/v1${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: parsedData,
            raw: responseData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            success: false,
            data: null,
            raw: responseData,
            error: 'Invalid JSON response'
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        statusCode: 0,
        success: false,
        data: null,
        error: error.message
      });
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testStoresAndProducts() {
  console.log('🚀 Testing Stores and Products API Endpoints...');
  console.log('=' .repeat(60));
  
  // Test 1: Backend Health
  console.log('\n1️⃣ Testing Backend Health...');
  const healthResult = await testEndpoint('/health');
  console.log(`Status: ${healthResult.statusCode}`);
  if (healthResult.success) {
    console.log('✅ Backend is healthy');
  } else {
    console.log('❌ Backend health check failed');
    console.log('Error:', healthResult.error || healthResult.raw);
    return;
  }
  
  // Test 2: Stores API
  console.log('\n2️⃣ Testing Stores API...');
  
  // Test nearby stores
  console.log('\n📍 Testing nearby stores endpoint...');
  const nearbyStoresResult = await testEndpoint('/stores/nearby?latitude=19.0760&longitude=72.8777');
  console.log(`Status: ${nearbyStoresResult.statusCode}`);
  if (nearbyStoresResult.success) {
    console.log('✅ Nearby stores endpoint working');
    console.log(`📊 Stores found: ${nearbyStoresResult.data?.data?.length || 0}`);
    if (nearbyStoresResult.data?.data?.length > 0) {
      const firstStore = nearbyStoresResult.data.data[0];
      console.log(`📍 First store: ${firstStore.name}`);
      console.log(`📍 Distance: ${firstStore.distance?.toFixed(2) || 'N/A'} meters`);
    }
  } else {
    console.log('❌ Nearby stores endpoint failed');
    console.log('Error:', nearbyStoresResult.error || nearbyStoresResult.raw);
  }
  
  // Test 3: Products API
  console.log('\n3️⃣ Testing Products API...');
  const productsResult = await testEndpoint('/products');
  console.log(`Status: ${productsResult.statusCode}`);
  if (productsResult.success) {
    console.log('✅ Products endpoint working');
    const products = productsResult.data?.data?.products || productsResult.data?.data || [];
    console.log(`📊 Products found: ${products.length}`);
    if (products.length > 0) {
      const firstProduct = products[0];
      console.log(`🍷 First product: ${firstProduct.name}`);
      console.log(`💰 Price: $${firstProduct.price?.regular || firstProduct.price || 'N/A'}`);
      console.log(`📦 Stock: ${firstProduct.inventory?.quantity || firstProduct.stockQuantity || 'N/A'}`);
    }
  } else {
    console.log('❌ Products endpoint failed');
    console.log('Error:', productsResult.error || productsResult.raw);
  }
  
  // Test 4: Categories API
  console.log('\n4️⃣ Testing Categories API...');
  const categoriesResult = await testEndpoint('/products/categories');
  console.log(`Status: ${categoriesResult.statusCode}`);
  if (categoriesResult.success) {
    console.log('✅ Categories endpoint working');
    const categories = categoriesResult.data?.data || [];
    console.log(`📊 Categories found: ${categories.length}`);
    if (categories.length > 0) {
      console.log(`📂 Categories: ${categories.map(c => c.name || c).join(', ')}`);
    }
  } else {
    console.log('❌ Categories endpoint failed');
    console.log('Error:', categoriesResult.error || categoriesResult.raw);
  }
  
  // Test 5: Test with Authentication
  console.log('\n5️⃣ Testing with Customer Authentication...');
  
  // First login to get token
  const loginResult = await testEndpoint('/auth/login', 'POST', {
    email: 'customer@test.com',
    password: 'password123',
    role: 'customer'
  });
  
  if (loginResult.success && loginResult.data?.data?.token) {
    console.log('✅ Customer login successful');
    const token = loginResult.data.data.token;
    
    // Test authenticated products endpoint
    const authProductsResult = await testEndpoint('/products');
    console.log(`Authenticated products status: ${authProductsResult.statusCode}`);
    if (authProductsResult.success) {
      console.log('✅ Authenticated products access working');
    }
  } else {
    console.log('❌ Customer login failed');
    console.log('Error:', loginResult.error || loginResult.raw);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 SUMMARY');
  console.log('=' .repeat(60));
  console.log('✅ Backend: Running on port 5003');
  console.log(`${nearbyStoresResult.success ? '✅' : '❌'} Stores API: ${nearbyStoresResult.success ? 'Working' : 'Failed'}`);
  console.log(`${productsResult.success ? '✅' : '❌'} Products API: ${productsResult.success ? 'Working' : 'Failed'}`);
  console.log(`${categoriesResult.success ? '✅' : '❌'} Categories API: ${categoriesResult.success ? 'Working' : 'Failed'}`);
  
  if (!nearbyStoresResult.success || !productsResult.success) {
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Check if backend server is running on port 5003');
    console.log('2. Verify database connection and data');
    console.log('3. Check API routes are properly mounted');
    console.log('4. Verify CORS configuration');
    console.log('5. Check for authentication requirements');
  } else {
    console.log('\n🚀 All APIs are working! The issue might be in the frontend.');
    console.log('Check the React app at http://localhost:3001');
  }
}

// Run the test
testStoresAndProducts().catch(console.error);