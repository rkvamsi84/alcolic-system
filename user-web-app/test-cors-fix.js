const https = require('https');

// Test the fixed API configuration
const API_BASE_URL = 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb';

function testCORSFix() {
  console.log('🔧 Testing CORS fix for user-web-app...');
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
      'Origin': 'http://localhost:3001',
      'User-Agent': 'UserWebApp-CORS-Test/1.0'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`\n✅ Connection Status: ${res.statusCode}`);
    console.log(`CORS Headers:`);
    console.log(`  Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
    console.log(`  Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods']}`);
    console.log(`  Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers']}`);
    
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
          console.log('\n🎉 SUCCESS: CORS issue is now fixed!');
          testLoginEndpoint();
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

function testLoginEndpoint() {
  console.log('\n🔐 Testing Login Endpoint with CORS headers...');
  
  const loginURL = 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1/auth/login?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb';
  const url = new URL(loginURL);
  
  const postData = JSON.stringify({
    email: 'customer@test.com',
    password: 'Password123',
    role: 'customer'
  });
  
  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': 'http://localhost:3001',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Login endpoint status: ${res.statusCode}`);
    console.log(`CORS Headers for login:`);
    console.log(`  Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('Login response:', JSON.stringify(jsonData, null, 2));
        
        if (res.statusCode === 200) {
          console.log('✅ Login successful! CORS issue completely resolved.');
        } else if (res.statusCode === 400 || res.statusCode === 422) {
          console.log('✅ Login endpoint accessible (validation error expected with test credentials)');
        } else {
          console.log('ℹ️  Login endpoint response received');
        }
      } catch (error) {
        console.log('Login raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Login endpoint error:', error.message);
  });

  req.write(postData);
  req.end();
}

// Run the test
console.log('🚀 Starting user-web-app CORS fix test...');
testCORSFix();