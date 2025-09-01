const https = require('https');

console.log('🧪 Testing admin login after role fix...');

// Test data
const testData = JSON.stringify({
  email: 'admin@alcolic.com',
  password: 'admin123',
  role: 'admin'
});

// Request options
const options = {
  hostname: 'alcolic.gnritservices.com',
  port: 443,
  path: '/api.php/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('📡 Making request to:', `https://${options.hostname}${options.path}`);
console.log('📝 Request data:', testData);

// Make the request
const req = https.request(options, (res) => {
  console.log('📊 Response status:', res.statusCode);
  console.log('📋 Response headers:', res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response body:');
    console.log('='.repeat(50));
    
    try {
      const jsonResponse = JSON.parse(data);
      console.log(JSON.stringify(jsonResponse, null, 2));
      
      // Check if login was successful
      if (jsonResponse.success && jsonResponse.data && jsonResponse.data.token) {
        console.log('\n✅ Login successful!');
        console.log('🎫 Token received:', jsonResponse.data.token.substring(0, 50) + '...');
        console.log('👤 User role:', jsonResponse.data.user.role);
        console.log('🆔 User ID:', jsonResponse.data.user.id);
        
        // Test admin endpoint with the token
        testAdminEndpoint(jsonResponse.data.token);
        
      } else {
        console.log('\n❌ Login failed!');
        console.log('💬 Message:', jsonResponse.message || 'Unknown error');
      }
      
    } catch (error) {
      console.log('❌ Failed to parse JSON response:');
      console.log(data);
    }
    
    console.log('='.repeat(50));
  });
});

req.on('error', (error) => {
  console.log('❌ Request error:', error.message);
});

req.write(testData);
req.end();

// Function to test admin endpoint
function testAdminEndpoint(token) {
  console.log('\n🧪 Testing admin endpoint with token...');
  
  const adminOptions = {
    hostname: 'alcolic.gnritservices.com',
    port: 443,
    path: '/api.php/admin/dashboard',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const adminReq = https.request(adminOptions, (res) => {
    console.log('📊 Admin endpoint status:', res.statusCode);
    
    let adminData = '';
    
    res.on('data', (chunk) => {
      adminData += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 Admin endpoint response:');
      console.log('='.repeat(50));
      
      try {
        const adminResponse = JSON.parse(adminData);
        console.log(JSON.stringify(adminResponse, null, 2));
        
        if (res.statusCode === 200) {
          console.log('\n✅ Admin endpoint access successful!');
          console.log('🎉 403 errors should be resolved!');
        } else {
          console.log('\n❌ Admin endpoint still has issues');
          console.log('💬 Status:', res.statusCode);
        }
        
      } catch (error) {
        console.log('❌ Failed to parse admin response:');
        console.log(adminData);
      }
      
      console.log('='.repeat(50));
    });
  });
  
  adminReq.on('error', (error) => {
    console.log('❌ Admin request error:', error.message);
  });
  
  adminReq.end();
}

console.log('🚀 Starting test...');
