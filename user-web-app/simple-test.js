const https = require('https');
const http = require('http');

async function testPromotions() {
  console.log('🔍 Testing promotions endpoint...');
  
  try {
    const response = await fetch('http://localhost:5000/api/v1/promotions/customer');
    console.log('📥 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success!');
      console.log('📊 Data:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('❌ Failed:', text);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testPromotions(); 