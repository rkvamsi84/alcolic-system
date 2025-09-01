const axios = require('axios');

// Test registration with the deployed backend
async function testRegistration() {
  const testData = {
    name: 'Test User ' + Date.now(),
    email: `test${Date.now()}@example.com`,
    phone: `+1555${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
    password: 'TestPass123',
    role: 'customer'
  };

  console.log('Testing registration with data:', testData);

  try {
    const response = await axios.post(
      'https://nextjs-backend-dkg32ika1-rkvamsi84-gmailcoms-projects.vercel.app/api/v1/auth/register',
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 30000,
        withCredentials: true
      }
    );

    console.log('✅ Registration successful!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Registration failed!');
    console.log('Status:', error.response?.status);
    console.log('Error message:', error.response?.data?.message);
    console.log('Full error data:', error.response?.data);
    console.log('Error details:', error.message);
  }
}

testRegistration();