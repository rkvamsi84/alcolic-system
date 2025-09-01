const https = require('https');

console.log('🧪 Testing admin login with working api.php...');

// Test admin login with the working api.php
function testAdminLogin() {
  console.log('🔑 Testing admin login...');
  
  const loginData = JSON.stringify({
    email: 'superadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  const options = {
    hostname: 'alcolic.gnritservices.com',
    port: 443,
    path: '/api.php/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };
  
  console.log('📡 Making request to:', `https://${options.hostname}${options.path}`);
  console.log('📝 Login data:', loginData);
  
  const req = https.request(options, (res) => {
    console.log(`📊 Response status: ${res.statusCode}`);
    console.log('📋 Response headers:', res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 Response body:');
      console.log('='.repeat(50));
      console.log(data);
      console.log('='.repeat(50));
      
      if (data.length === 0) {
        console.log('❌ Empty response');
      } else {
        try {
          const response = JSON.parse(data);
          console.log('✅ Valid JSON response');
          
          if (response.success) {
            console.log('🎉 Admin login successful!');
            console.log('👤 User:', response.data.user.name);
            console.log('📧 Email:', response.data.user.email);
            console.log('🎭 Role:', response.data.user.role);
            console.log('🎫 Token:', response.data.token.substring(0, 50) + '...');
            
            // Test admin endpoint with the token
            testAdminEndpoint(response.data.token);
            
          } else {
            console.log('❌ Login failed:', response.message);
            
            // Try different credentials
            testAlternativeCredentials();
          }
          
        } catch (error) {
          console.log('❌ Invalid JSON response:', error.message);
        }
      }
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
  });
  
  req.write(loginData);
  req.end();
}

function testAlternativeCredentials() {
  console.log('\n🔄 Trying alternative credentials...');
  
  const testCredentials = [
    {
      email: 'admin@alcolic.com',
      password: 'admin123',
      role: 'admin'
    },
    {
      email: 'superadmin@alcolic.com',
      password: 'Admin123',
      role: 'admin'
    },
    {
      email: 'superadmin@alcolic.com',
      password: 'admin123',
      role: 'customer'
    }
  ];
  
  testCredentials.forEach((credential, index) => {
    setTimeout(() => {
      testCredential(credential, index + 1);
    }, index * 2000);
  });
}

function testCredential(credential, testNumber) {
  console.log(`\n🧪 Test ${testNumber}: ${credential.email} / ${credential.password} / ${credential.role}`);
  
  const loginData = JSON.stringify(credential);
  
  const options = {
    hostname: 'alcolic.gnritservices.com',
    port: 443,
    path: '/api.php/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (response.success) {
          console.log(`✅ SUCCESS! Test ${testNumber} worked!`);
          console.log('👤 User:', response.data.user.name);
          console.log('🎭 Role:', response.data.user.role);
          console.log('🎫 Token:', response.data.token.substring(0, 50) + '...');
          
          // Test admin endpoint
          testAdminEndpoint(response.data.token);
          
        } else {
          console.log(`❌ Test ${testNumber} failed:`, response.message);
        }
        
      } catch (error) {
        console.log(`❌ Test ${testNumber} parse error:`, error.message);
      }
    });
  });
  
  req.on('error', (error) => {
    console.log(`❌ Test ${testNumber} request error:`, error.message);
  });
  
  req.write(loginData);
  req.end();
}

function testAdminEndpoint(token) {
  console.log('\n🧪 Testing admin endpoint...');
  
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
    let adminData = '';
    
    res.on('data', (chunk) => {
      adminData += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 Admin endpoint status: ${res.statusCode}`);
      console.log('📄 Admin response:');
      console.log('='.repeat(50));
      console.log(adminData);
      console.log('='.repeat(50));
      
      if (res.statusCode === 200) {
        console.log('✅ Admin endpoint access successful!');
        console.log('🎉 403 errors should be resolved!');
        console.log('🔌 WebSocket connections should work!');
        console.log('\n🎯 Admin credentials found:');
        console.log('📧 Email: (from successful test above)');
        console.log('🔑 Password: (from successful test above)');
        console.log('🎭 Role: admin');
      } else {
        console.log('❌ Admin endpoint failed');
        try {
          const adminResponse = JSON.parse(adminData);
          console.log('💬 Error:', adminResponse.message || 'Unknown error');
        } catch (error) {
          console.log('💬 Raw error:', adminData);
        }
      }
    });
  });
  
  adminReq.on('error', (error) => {
    console.log('❌ Admin request error:', error.message);
  });
  
  adminReq.end();
}

// Start the test
console.log('🚀 Starting admin login test...');
testAdminLogin();
