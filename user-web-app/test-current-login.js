const https = require('https');
const http = require('http');

// Test current login functionality
const testLogin = async () => {
  console.log('🔍 Testing current login functionality...');
  
  const loginData = JSON.stringify({
    email: 'admin@alcolic.com',
    password: 'admin123',
    role: 'customer'
  });

  const url = 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1/auth/login?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb';
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': 'http://localhost:3001',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      console.log('📋 Headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📦 Response:', response);
          resolve(response);
        } catch (e) {
          console.log('📄 Raw response:', data);
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.write(loginData);
    req.end();
  });
};

// Test OPTIONS preflight request
const testPreflight = async () => {
  console.log('\n🔍 Testing OPTIONS preflight request...');
  
  const url = 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1/auth/login?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb';
  
  const options = {
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:3001',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type,accept,x-requested-with'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      console.log(`✅ Preflight Status: ${res.statusCode}`);
      console.log('📋 Preflight Headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 Preflight Response:', data || 'Empty');
        resolve({ status: res.statusCode, headers: res.headers, data });
      });
    });

    req.on('error', (error) => {
      console.error('❌ Preflight error:', error.message);
      reject(error);
    });

    req.end();
  });
};

// Run tests
const runTests = async () => {
  try {
    await testPreflight();
    await testLogin();
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

runTests();