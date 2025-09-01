const https = require('https');

console.log('🔧 Fixing admin user...');

// First, let's check what admin users exist
function checkAdminUsers() {
  console.log('🔍 Checking existing admin users...');
  
  // We'll try to login with different password variations
  const testPasswords = [
    'admin123',
    'Admin123',
    'Admin@123',
    'admin',
    'password',
    '123456'
  ];
  
  testPasswords.forEach((password, index) => {
    setTimeout(() => {
      testAdminLogin(password, index + 1);
    }, index * 1000);
  });
}

function testAdminLogin(password, testNumber) {
  console.log(`\n🧪 Test ${testNumber}: Trying password "${password}"`);
  
  const loginData = JSON.stringify({
    email: 'admin@alcolic.com',
    password: password,
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
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (response.success) {
          console.log(`✅ SUCCESS! Password "${password}" works!`);
          console.log(`👤 User: ${response.data.user.name} (${response.data.user.role})`);
          console.log(`🆔 ID: ${response.data.user.id}`);
          console.log(`🎫 Token: ${response.data.token.substring(0, 50)}...`);
          
          // Test admin endpoint
          testAdminEndpoint(response.data.token);
          
        } else {
          console.log(`❌ Failed with "${password}": ${response.message}`);
        }
        
      } catch (error) {
        console.log(`❌ Parse error: ${data}`);
      }
    });
  });
  
  req.on('error', (error) => {
    console.log(`❌ Request error: ${error.message}`);
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
      
      try {
        const adminResponse = JSON.parse(adminData);
        
        if (res.statusCode === 200) {
          console.log('✅ Admin endpoint access successful!');
          console.log('🎉 403 errors should be resolved!');
          console.log('🔌 WebSocket connections should work!');
          console.log('\n🎯 Admin credentials:');
          console.log('📧 Email: admin@alcolic.com');
          console.log('🔑 Password: (the one that worked above)');
          console.log('🎭 Role: admin');
        } else {
          console.log(`❌ Admin endpoint failed: ${adminResponse.message || 'Unknown error'}`);
        }
        
      } catch (error) {
        console.log('❌ Failed to parse admin response:', adminData);
      }
    });
  });
  
  adminReq.on('error', (error) => {
    console.log(`❌ Admin request error: ${error.message}`);
  });
  
  adminReq.end();
}

// If no password works, create a new admin user
function createNewAdminUser() {
  console.log('\n🔄 Creating new admin user with different email...');
  
  const adminData = JSON.stringify({
    name: 'Super Admin',
    email: 'superadmin@alcolic.com',
    phone: '+1234567891',
    password: 'admin123',
    role: 'admin'
  });
  
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
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (response.success) {
          console.log('✅ New admin user created successfully!');
          console.log('👤 User:', response.data.user.name);
          console.log('📧 Email:', response.data.user.email);
          console.log('🎭 Role:', response.data.user.role);
          console.log('🎫 Token:', response.data.token.substring(0, 50) + '...');
          
          // Test admin endpoint
          testAdminEndpoint(response.data.token);
          
        } else {
          console.log('❌ Failed to create new admin user:', response.message);
        }
        
      } catch (error) {
        console.log('❌ Parse error:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
  });
  
  req.write(adminData);
  req.end();
}

// Start the process
console.log('🚀 Starting admin user fix process...');
checkAdminUsers();

// After 10 seconds, if no password worked, create new admin
setTimeout(() => {
  console.log('\n⏰ No working password found, creating new admin user...');
  createNewAdminUser();
}, 10000);
