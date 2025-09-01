// Test registration with new user data using fetch
async function testRegistration() {
  const testData = {
    name: 'Debug Test User',
    email: 'debugtest789@example.com',
    phone: '+1555123456',
    password: 'TestPass123!'
  };

  console.log('Testing registration with data:', testData);
  console.log('Backend URL: https://nextjs-backend-dkg32ika1-rkvamsi84-gmailcoms-projects.vercel.app/api/v1/auth/register');

  try {
    const response = await fetch(
      'https://nextjs-backend-dkg32ika1-rkvamsi84-gmailcoms-projects.vercel.app/api/v1/auth/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(testData)
      }
    );

    const responseData = await response.json();

    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('Status:', response.status);
      console.log('Response data:', JSON.stringify(responseData, null, 2));
    } else {
      console.log('❌ Registration failed!');
      console.log('Status:', response.status);
      console.log('Response data:', JSON.stringify(responseData, null, 2));
      
      if (response.status === 409) {
        console.log('\n🔍 This is a 409 Conflict error - user already exists');
        console.log('Try with a different email address');
      }
    }
  } catch (error) {
    console.log('❌ Network or parsing error!');
    console.log('Error message:', error.message);
  }
}

testRegistration();