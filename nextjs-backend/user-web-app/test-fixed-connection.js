const https = require('https');

// Test the fixed API configuration
const API_BASE_URL = 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1?x-vercel-protection-bypass=rkvamsi84gmailcom';
const SOCKET_URL = 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app?x-vercel-protection-bypass=rkvamsi84gmailcom';

function testFixedAPIConnection() {
  console.log('Testing FIXED nextjs-backend/user-web-app API connection...');
  console.log('API URL:', API_BASE_URL);
  
  const url = new URL(API_BASE_URL);
  
  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname + url.search,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'NextJS-UserWebApp-Test/1.0'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`\n✅ Connection Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('\n📋 API Response:');
        console.log(JSON.stringify(jsonData, null, 2));
        
        if (res.statusCode === 200) {
          console.log('\n🎉 SUCCESS: nextjs-backend/user-web-app API connection is now working!');
          testAuthEndpoint();
        } else {
          console.log('\n❌ FAILED: API connection still has issues');
        }
      } catch (error) {
        console.log('\n📄 Raw Response:', data);
        console.log('❌ Parse Error:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('\n❌ Request Error:', error.message);
  });

  req.end();
}

function testAuthEndpoint() {
  console.log('\n🔐 Testing Auth Endpoint...');
  
  const authURL = 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1/auth/login?x-vercel-protection-bypass=rkvamsi84gmailcom';
  const url = new URL(authURL);
  
  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Auth endpoint status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('Auth endpoint response:', JSON.stringify(jsonData, null, 2));
        
        if (res.statusCode === 400 || res.statusCode === 422) {
          console.log('✅ Auth endpoint is accessible (validation error expected without credentials)');
        } else {
          console.log('ℹ️  Auth endpoint response received');
        }
      } catch (error) {
        console.log('Auth endpoint raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Auth endpoint error:', error.message);
  });

  req.end(JSON.stringify({})); // Send empty body to test endpoint
}

// Run the test
console.log('🚀 Starting nextjs-backend/user-web-app connection test...');
testFixedAPIConnection();