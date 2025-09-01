const https = require('https');

console.log('👑 Creating admin user...');

// Admin user data
const adminData = JSON.stringify({
  name: 'Admin User',
  email: 'admin@alcolic.com',
  phone: '+1234567890',
  password: 'admin123',
  role: 'admin'
});

// Request options for registration
const options = {
  hostname: 'alcolic.gnritservices.com',
  port: 443,
  path: '/api.php/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(adminData)
  }
};

console.log('📡 Making registration request...');
console.log('📝 Admin data:', adminData);

// Make the registration request
const req = https.request(options, (res) => {
  console.log('📊 Response status:', res.statusCode);
  
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
      
      if (jsonResponse.success) {
        console.log('\n✅ Admin user created successfully!');
        console.log('👤 User ID:', jsonResponse.data.user.id);
        console.log('📧 Email:', jsonResponse.data.user.email);
        console.log('🎭 Role:', jsonResponse.data.user.role);
        console.log('🎫 Token:', jsonResponse.data.token.substring(0, 50) + '...');
        
        // Test login with the new admin user
        testAdminLogin();
        
      } else {
        console.log('\n❌ Failed to create admin user');
        console.log('💬 Message:', jsonResponse.message);
        
        if (jsonResponse.message.includes('already exists')) {
          console.log('🔄 Admin user already exists, testing login...');
          testAdminLogin();
        }
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

req.write(adminData);
req.end();

// Function to test admin login
function testAdminLogin() {
  console.log('\n🧪 Testing admin login...');
  
  const loginData = JSON.stringify({
    email: 'admin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  const loginOptions = {
    hostname: 'alcolic.gnritservices.com',
    port: 443,
    path: '/api.php/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };
  
  const loginReq = https.request(loginOptions, (res) => {
    let loginResponse = '';
    
    res.on('data', (chunk) => {
      loginResponse += chunk;
    });
    
    res.on('end', () => {
      try {
        const loginJson = JSON.parse(loginResponse);
        
        if (loginJson.success) {
          console.log('✅ Admin login successful!');
          console.log('🎫 Token:', loginJson.data.token.substring(0, 50) + '...');
          console.log('👤 Role:', loginJson.data.user.role);
          
          // Test admin endpoint
          testAdminEndpoint(loginJson.data.token);
          
        } else {
          console.log('❌ Admin login failed:', loginJson.message);
        }
        
      } catch (error) {
        console.log('❌ Failed to parse login response:', loginResponse);
      }
    });
  });
  
  loginReq.on('error', (error) => {
    console.log('❌ Login request error:', error.message);
  });
  
  loginReq.write(loginData);
  loginReq.end();
}

// Function to test admin endpoint
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
      console.log('📊 Admin endpoint status:', res.statusCode);
      
      try {
        const adminResponse = JSON.parse(adminData);
        
        if (res.statusCode === 200) {
          console.log('✅ Admin endpoint access successful!');
          console.log('🎉 403 errors should be resolved!');
          console.log('🔌 WebSocket connections should work!');
        } else {
          console.log('❌ Admin endpoint failed:', adminResponse.message);
        }
        
      } catch (error) {
        console.log('❌ Failed to parse admin response:', adminData);
      }
    });
  });
  
  adminReq.on('error', (error) => {
    console.log('❌ Admin request error:', error.message);
  });
  
  adminReq.end();
}

console.log('🚀 Starting admin user creation...');
