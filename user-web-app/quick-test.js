const fetch = require('node-fetch');

async function testEndpoint() {
  try {
    console.log('Testing /api/v1/promotions/customer...');
    const response = await fetch('http://localhost:5000/api/v1/promotions/customer');
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Data:', data);
    } else {
      const text = await response.text();
      console.log('❌ Failed:', text);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testEndpoint(); 