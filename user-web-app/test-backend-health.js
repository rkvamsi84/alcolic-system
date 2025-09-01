const https = require('https');

// Test backend health and available endpoints
const testBackendHealth = async () => {
  console.log('🔍 Testing backend health...');
  
  const baseUrl = 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app';
  const bypassToken = 'x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb';
  
  // Test different endpoints
  const endpoints = [
    '/',
    '/api',
    '/api/v1',
    '/api/v1/auth',
    '/api/v1/auth/login'
  ];
  
  for (const endpoint of endpoints) {
    const url = `${baseUrl}${endpoint}?${bypassToken}`;
    
    try {
      console.log(`\n🔍 Testing: ${endpoint}`);
      
      const result = await new Promise((resolve, reject) => {
        const req = https.request(url, { method: 'GET' }, (res) => {
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
          
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              console.log(`   Response: ${JSON.stringify(response, null, 2)}`);
            } catch (e) {
              console.log(`   Raw response: ${data.substring(0, 200)}...`);
            }
            resolve({ status: res.statusCode, data });
          });
        });

        req.on('error', (error) => {
          console.error(`   Error: ${error.message}`);
          reject(error);
        });

        req.end();
      });
      
    } catch (error) {
      console.error(`   Failed: ${error.message}`);
    }
  }
};

// Test POST to login with different approaches
const testLoginVariations = async () => {
  console.log('\n🔍 Testing login variations...');
  
  const baseUrl = 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app';
  const bypassToken = 'x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb';
  
  const loginData = JSON.stringify({
    email: 'admin@alcolic.com',
    password: 'admin123',
    role: 'customer'
  });
  
  // Test different URL formats
  const urlVariations = [
    `${baseUrl}/api/v1/auth/login?${bypassToken}`,
    `${baseUrl}/api/auth/login?${bypassToken}`,
    `${baseUrl}/auth/login?${bypassToken}`
  ];
  
  for (const url of urlVariations) {
    try {
      console.log(`\n🔍 Testing login URL: ${url}`);
      
      const result = await new Promise((resolve, reject) => {
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
          }
        };
        
        const req = https.request(url, options, (res) => {
          console.log(`   Status: ${res.statusCode}`);
          
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              console.log(`   Response: ${JSON.stringify(response, null, 2)}`);
            } catch (e) {
              console.log(`   Raw response: ${data}`);
            }
            resolve({ status: res.statusCode, data });
          });
        });

        req.on('error', (error) => {
          console.error(`   Error: ${error.message}`);
          reject(error);
        });

        req.write(loginData);
        req.end();
      });
      
    } catch (error) {
      console.error(`   Failed: ${error.message}`);
    }
  }
};

// Run all tests
const runAllTests = async () => {
  try {
    await testBackendHealth();
    await testLoginVariations();
  } catch (error) {
    console.error('❌ Tests failed:', error);
  }
};

runAllTests();