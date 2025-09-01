const https = require('https');

// Test store-admin API connection to Vercel backend
const API_BASE_URL = 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app';
const BYPASS_TOKEN = 'x-vercel-protection-bypass=rkvamsi84gmailcom';

function testAPIConnection() {
  console.log('Testing store-admin API connection to Vercel backend...');
  
  const options = {
    hostname: 'nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app',
    port: 443,
    path: `/api/v1?${BYPASS_TOKEN}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Store-Admin-Test/1.0'
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
          console.log('✅ Store-admin API connection successful!');
          testStoreEndpoint();
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

function testStoreEndpoint() {
  console.log('\nTesting store-specific endpoint...');
  
  const options = {
    hostname: 'nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app',
    port: 443,
    path: `/api/v1/stores?${BYPASS_TOKEN}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Store-Admin-Test/1.0'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Store endpoint status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('Store endpoint response:', JSON.stringify(jsonData, null, 2));
        
        if (res.statusCode === 200) {
          console.log('✅ Store endpoint accessible!');
        } else {
          console.log('❌ Store endpoint failed');
        }
      } catch (error) {
        console.log('Store endpoint response data:', data);
        console.log('Parse error:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Store endpoint request error:', error.message);
  });

  req.end();
}

// Run the test
testAPIConnection();