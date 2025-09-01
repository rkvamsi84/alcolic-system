const https = require('https');

console.log('🔍 Checking admin routes...');

// Test different admin endpoints
const adminEndpoints = [
  '/api.php/admin/dashboard',
  '/api.php/admin/users',
  '/api.php/admin/orders',
  '/api.php/admin/products',
  '/api.php/admin/stores',
  '/api.php/admin/analytics',
  '/api.php/admin/settings'
];

// First, get a valid token
function getAdminToken() {
  console.log('🔑 Getting admin token...');
  
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
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (response.success) {
          console.log('✅ Admin login successful!');
          console.log(`🎫 Token: ${response.data.token.substring(0, 50)}...`);
          
          // Test all admin endpoints
          testAdminEndpoints(response.data.token);
          
        } else {
          console.log('❌ Admin login failed:', response.message);
        }
        
      } catch (error) {
        console.log('❌ Parse error:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
  });
  
  req.write(loginData);
  req.end();
}

function testAdminEndpoints(token) {
  console.log('\n🧪 Testing admin endpoints...');
  
  adminEndpoints.forEach((endpoint, index) => {
    setTimeout(() => {
      testEndpoint(endpoint, token, index + 1);
    }, index * 500);
  });
}

function testEndpoint(endpoint, token, testNumber) {
  console.log(`\n🧪 Test ${testNumber}: ${endpoint}`);
  
  const options = {
    hostname: 'alcolic.gnritservices.com',
    port: 443,
    path: endpoint,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('✅ Endpoint working!');
        try {
          const response = JSON.parse(data);
          console.log('📄 Response type:', typeof response);
        } catch (error) {
          console.log('📄 Raw response received');
        }
      } else if (res.statusCode === 404) {
        console.log('❌ Route not found');
      } else if (res.statusCode === 403) {
        console.log('❌ Forbidden - Role issue');
      } else if (res.statusCode === 401) {
        console.log('❌ Unauthorized - Token issue');
      } else {
        console.log(`❌ Error: ${res.statusCode}`);
        try {
          const response = JSON.parse(data);
          console.log('💬 Message:', response.message || 'Unknown error');
        } catch (error) {
          console.log('💬 Raw error:', data.substring(0, 100));
        }
      }
    });
  });
  
  req.on('error', (error) => {
    console.log(`❌ Request error: ${error.message}`);
  });
  
  req.end();
}

// Test basic API endpoints without auth
function testBasicEndpoints() {
  console.log('\n🔍 Testing basic API endpoints...');
  
  const basicEndpoints = [
    '/api.php/auth/login',
    '/api.php/auth/register',
    '/api.php/products',
    '/api.php/orders',
    '/api.php/stores'
  ];
  
  basicEndpoints.forEach((endpoint, index) => {
    setTimeout(() => {
      testBasicEndpoint(endpoint, index + 1);
    }, index * 300);
  });
}

function testBasicEndpoint(endpoint, testNumber) {
  console.log(`\n🧪 Basic Test ${testNumber}: ${endpoint}`);
  
  const options = {
    hostname: 'alcolic.gnritservices.com',
    port: 443,
    path: endpoint,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Endpoint accessible');
    } else if (res.statusCode === 404) {
      console.log('❌ Route not found');
    } else if (res.statusCode === 401) {
      console.log('✅ Endpoint exists (requires auth)');
    } else {
      console.log(`⚠️ Status: ${res.statusCode}`);
    }
  });
  
  req.on('error', (error) => {
    console.log(`❌ Request error: ${error.message}`);
  });
  
  req.end();
}

// Start the process
console.log('🚀 Starting admin route check...');

// First test basic endpoints
testBasicEndpoints();

// Then test admin endpoints
setTimeout(() => {
  getAdminToken();
}, 3000);
