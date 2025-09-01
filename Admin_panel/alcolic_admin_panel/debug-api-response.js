const https = require('https');

console.log('🔍 Debugging API response...');

// Test 1: Simple GET request to see if API is working
function testSimpleGet() {
  console.log('\n🧪 Test 1: Simple GET request');
  
  const options = {
    hostname: 'alcolic.gnritservices.com',
    port: 443,
    path: '/api.php/products',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    console.log('📋 Headers:', res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
      console.log('📄 Chunk received:', chunk.length, 'bytes');
    });
    
    res.on('end', () => {
      console.log('📄 Total data length:', data.length);
      console.log('📄 Raw response:');
      console.log('='.repeat(50));
      console.log(data);
      console.log('='.repeat(50));
      
      if (data.length === 0) {
        console.log('❌ Empty response received');
      } else {
        console.log('✅ Response received');
        try {
          const json = JSON.parse(data);
          console.log('✅ Valid JSON response');
        } catch (error) {
          console.log('❌ Invalid JSON:', error.message);
        }
      }
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
  });
  
  req.end();
}

// Test 2: Auth login with detailed logging
function testAuthLogin() {
  console.log('\n🧪 Test 2: Auth login with detailed logging');
  
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
  
  console.log('📡 Request details:');
  console.log('URL:', `https://${options.hostname}${options.path}`);
  console.log('Method:', options.method);
  console.log('Headers:', options.headers);
  console.log('Data:', loginData);
  
  const req = https.request(options, (res) => {
    console.log(`\n📊 Response status: ${res.statusCode}`);
    console.log('📋 Response headers:', res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
      console.log('📄 Chunk received:', chunk.length, 'bytes');
    });
    
    res.on('end', () => {
      console.log('\n📄 Total response length:', data.length);
      console.log('📄 Raw response:');
      console.log('='.repeat(50));
      console.log(data);
      console.log('='.repeat(50));
      
      if (data.length === 0) {
        console.log('❌ Empty response - API not working');
      } else {
        console.log('✅ Response received');
        try {
          const json = JSON.parse(data);
          console.log('✅ Valid JSON response:');
          console.log(JSON.stringify(json, null, 2));
          
          if (json.success) {
            console.log('🎉 Login successful!');
          } else {
            console.log('❌ Login failed:', json.message);
          }
        } catch (error) {
          console.log('❌ Invalid JSON:', error.message);
        }
      }
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
  });
  
  req.write(loginData);
  req.end();
}

// Test 3: Direct backend test
function testDirectBackend() {
  console.log('\n🧪 Test 3: Direct backend test (localhost)');
  
  const { exec } = require('child_process');
  
  exec('curl -s http://localhost:5000/api/v1/auth/login -X POST -H "Content-Type: application/json" -d \'{"email":"superadmin@alcolic.com","password":"admin123","role":"admin"}\'', (error, stdout, stderr) => {
    console.log('📡 Direct backend response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (error) {
      console.log('❌ Direct backend error:', error.message);
    } else if (stdout.length === 0) {
      console.log('❌ Empty response from direct backend');
    } else {
      console.log('✅ Direct backend responding');
      try {
        const json = JSON.parse(stdout);
        console.log('✅ Valid JSON from direct backend');
      } catch (error) {
        console.log('❌ Invalid JSON from direct backend:', error.message);
      }
    }
  });
}

// Test 4: Check if api.php is accessible
function testApiPhpAccess() {
  console.log('\n🧪 Test 4: Check api.php accessibility');
  
  const options = {
    hostname: 'alcolic.gnritservices.com',
    port: 443,
    path: '/api.php',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    console.log('📋 Headers:', res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 Response length:', data.length);
      console.log('📄 Response preview:', data.substring(0, 200));
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
  });
  
  req.end();
}

// Run all tests
console.log('🚀 Starting API debug tests...');

setTimeout(() => testSimpleGet(), 1000);
setTimeout(() => testAuthLogin(), 3000);
setTimeout(() => testDirectBackend(), 6000);
setTimeout(() => testApiPhpAccess(), 9000);
