const https = require('https');

// Test Admin_panel API connection to Vercel backend
const API_BASE_URL = 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app';
const BYPASS_TOKEN = 'x-vercel-protection-bypass=rkvamsi84gmailcom';

function testAPIConnection() {
  console.log('Testing Admin_panel API connection to Vercel backend...');
  
  const options = {
    hostname: 'nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app',
    port: 443,
    path: `/api/v1?${BYPASS_TOKEN}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Admin-Panel-Test/1.0'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('API Response:', JSON.stringify(jsonData, null, 2));
        
        if (res.statusCode === 200) {
          console.log('✅ Admin_panel API connection successful!');
          testAdminEndpoint();
        } else {
          console.log('❌ API connection failed');
        }
      } catch (error) {
        console.log('Response data:', data);
        console.log('Parse error:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });

  req.end();
}

function testAdminEndpoint() {
  console.log('\nTesting admin-specific endpoint...');
  
  const options = {
    hostname: 'nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app',
    port: 443,
    path: `/api/v1/users?${BYPASS_TOKEN}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Admin-Panel-Test/1.0'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Admin endpoint status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('Admin endpoint response:', JSON.stringify(jsonData, null, 2));
        
        if (res.statusCode === 200) {
          console.log('✅ Admin endpoint accessible!');
        } else if (res.statusCode === 401) {
          console.log('⚠️  Admin endpoint requires authentication (expected for admin routes)');
        } else {
          console.log('❌ Admin endpoint failed');
        }
      } catch (error) {
        console.log('Admin endpoint response data:', data);
        console.log('Parse error:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Admin endpoint request error:', error.message);
  });

  req.end();
}

// Run the test
testAPIConnection();