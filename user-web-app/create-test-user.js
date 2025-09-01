// Create Test User for Frontend Testing
const https = require('https');

// Register a new test user
async function registerTestUser() {
  console.log('🔍 Creating new test user...');
  
  const userData = {
    name: 'Test User Frontend',
    email: 'testfrontend@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
    phone: '+1987654321',
    role: 'customer'
  };
  
  const postData = JSON.stringify(userData);
  const url = 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app/api/v1/auth/register?x-vercel-protection-bypass=vghntrxcgvhbjnbvcxfcghvjbnkmhgvb';
  
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
          console.log('📊 Registration Status Code:', response.statusCode);
          console.log('📄 Registration Response:', result);
          resolve(result);
        } catch (error) {
          console.log('❌ Registration JSON Parse Error:', error.message);
          console.log('📄 Raw Registration Response:', data);
          reject(error);
        }
      });
    });
    
    request.on('error', (error) => {
      console.log('❌ Registration Request Error:', error.message);
      reject(error);
    });
    
    request.write(postData);
    request.end();
  });
}

// Test login with new user
async function testNewUserLogin() {
  console.log('\n🔐 Testing login with new user...');
  
  const loginData = {
    email: 'testfrontend@example.com',
    password: 'Password123',
    role: 'customer'
  };
  
  const postData = JSON.stringify(loginData);
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
  console.log('🚀 Creating Test User for Frontend...\n');
  
  try {
    const registrationResult = await registerTestUser();
    if (registrationResult.success) {
      console.log('✅ User registration successful!');
      
      // Wait a moment then test login
      setTimeout(async () => {
        try {
          const loginResult = await testNewUserLogin();
          if (loginResult.success) {
            console.log('✅ Login test successful!');
            console.log('🎯 Frontend can now use these credentials:');
            console.log('   📧 Email: testfrontend@example.com');
            console.log('   🔐 Password: Password123');
          } else {
            console.log('❌ Login test failed:', loginResult.message);
          }
        } catch (error) {
          console.log('❌ Login test error:', error.message);
        }
      }, 2000);
    } else {
      console.log('❌ User registration failed:', registrationResult.message);
      if (registrationResult.message && registrationResult.message.includes('already exists')) {
        console.log('🔄 User already exists, testing login...');
        await testNewUserLogin();
      }
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
  }
}

runTests().catch(console.error);