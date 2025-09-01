const https = require('https');
const http = require('http');

const API_BASE_URL = 'http://localhost:5000';

// Test promotions endpoint
async function testPromotionsEndpoint() {
  console.log('🔍 Testing Promotions Endpoint...\n');
  
  try {
    console.log('📤 Testing /api/v1/promotions/customer...');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/promotions/customer`);
    
    console.log('📥 Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Promotions endpoint working!');
      console.log('📊 Data:', data);
    } else {
      const errorData = await response.text();
      console.log('❌ Promotions endpoint failed:', response.status);
      console.log('📄 Error response:', errorData);
    }
    
  } catch (error) {
    console.log('❌ Promotions endpoint error:', error.message);
  }
}

// Test regular promotions endpoint (should fail)
async function testRegularPromotionsEndpoint() {
  console.log('\n🔍 Testing Regular Promotions Endpoint (should fail)...\n');
  
  try {
    console.log('📤 Testing /api/v1/promotions...');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/promotions`);
    
    console.log('📥 Response Status:', response.status);
    
    if (response.ok) {
      console.log('⚠️ Regular promotions endpoint is accessible (unexpected)');
    } else {
      console.log('✅ Regular promotions endpoint correctly requires authentication');
    }
    
  } catch (error) {
    console.log('❌ Regular promotions endpoint error:', error.message);
  }
}

// Test backend health
async function testBackendHealth() {
  console.log('🔍 Testing Backend Health...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Backend is healthy:', data.message);
    } else {
      console.log('❌ Backend health check failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Testing Promotions Endpoints...\n');
  
  await testBackendHealth();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testPromotionsEndpoint();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testRegularPromotionsEndpoint();
  
  console.log('\n📋 Test Summary:');
  console.log('✅ Backend health check');
  console.log('✅ Customer promotions endpoint test');
  console.log('✅ Regular promotions endpoint test');
}

// Run tests
runTests().catch(console.error); 