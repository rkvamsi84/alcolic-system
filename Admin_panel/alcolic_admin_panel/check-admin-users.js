const https = require('https');

console.log('🔍 Checking admin users in database...');

// Test different admin credentials
const testCredentials = [
  {
    email: 'admin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    email: 'admin@alcolic.com',
    password: 'admin123',
    role: 'customer'
  },
  {
    email: 'admin@alcolic.com',
    password: 'admin123',
    role: 'store'
  },
  {
    email: 'admin@alcolic.com',
    password: 'admin123',
    role: 'delivery'
  },
  {
    email: 'admin@alcolic.com',
    password: 'Admin123',
    role: 'admin'
  },
  {
    email: 'admin@alcolic.com',
    password: 'Admin@123',
    role: 'admin'
  }
];

async function testCredential(credential, index) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Test ${index + 1}: ${credential.email} / ${credential.password} / ${credential.role}`);
    
    const testData = JSON.stringify(credential);
    
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
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.success) {
            console.log(`✅ SUCCESS! Status: ${res.statusCode}`);
            console.log(`👤 User: ${response.data.user.name} (${response.data.user.role})`);
            console.log(`🆔 ID: ${response.data.user.id}`);
            console.log(`📧 Email: ${response.data.user.email}`);
            console.log(`🎫 Token: ${response.data.token.substring(0, 50)}...`);
            
            // Test admin endpoint
            testAdminEndpoint(response.data.token, credential.role);
            
          } else {
            console.log(`❌ Failed: ${response.message}`);
          }
          
        } catch (error) {
          console.log(`❌ Parse error: ${data}`);
        }
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Request error: ${error.message}`);
      resolve();
    });
    
    req.write(testData);
    req.end();
  });
}

function testAdminEndpoint(token, role) {
  console.log(`\n🧪 Testing admin endpoint with ${role} role...`);
  
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
        } else {
          console.log(`❌ Admin endpoint failed: ${adminResponse.message || 'Unknown error'}`);
        }
        
      } catch (error) {
        console.log('❌ Failed to parse admin response');
      }
    });
  });
  
  adminReq.on('error', (error) => {
    console.log(`❌ Admin request error: ${error.message}`);
  });
  
  adminReq.end();
}

async function runAllTests() {
  console.log('🚀 Testing all possible admin credentials...');
  
  for (let i = 0; i < testCredentials.length; i++) {
    await testCredential(testCredentials[i], i);
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎯 Summary:');
  console.log('If none of these work, we need to create an admin user');
  console.log('Run: node create-admin-user.js');
}

runAllTests();
