// Test Frontend API Connection
const https = require('https');
const http = require('http');

// Test API endpoint
async function testAPI() {
  console.log('🔍 Testing Frontend API Connection...');
  
  const url = 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb';
  
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ API Response:', result);
          console.log('📊 Status Code:', response.statusCode);
          resolve(result);
        } catch (error) {
          console.log('❌ JSON Parse Error:', error.message);
          console.log('📄 Raw Response:', data);
          reject(error);
        }
      });
    });
    
    request.on('error', (error) => {
      console.log('❌ Request Error:', error.message);
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      console.log('❌ Request Timeout');
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test login endpoint
async function testLogin() {
  console.log('\n🔐 Testing Login Endpoint...');
  
  const postData = JSON.stringify({
    email: 'customer@test.com',
    password: 'password123',
    role: 'customer'
  });
  
  const url = 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1/auth/login?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb';
  
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const request = https.request(url, options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('📊 Login Status Code:', response.statusCode);
          console.log('📄 Login Response:', result);
          resolve(result);
        } catch (error) {
          console.log('❌ Login JSON Parse Error:', error.message);
          console.log('📄 Raw Login Response:', data);
          reject(error);
        }
      });
    });
    
    request.on('error', (error) => {
      console.log('❌ Login Request Error:', error.message);
      reject(error);
    });
    
    request.write(postData);
    request.end();
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Testing User Web App API Connection...\n');
  
  try {
    await testAPI();
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  try {
    await testLogin();
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
  }
  
  console.log('\n✅ API tests completed!');
}

runTests().catch(console.error);