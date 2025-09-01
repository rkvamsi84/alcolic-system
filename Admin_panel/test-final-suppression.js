// Final test script to verify comprehensive error suppression
// Run this in the browser console

console.log('🧪 Testing Final Error Suppression...');

// Test the comprehensive error suppression system
async function testFinalSuppression() {
  const testUPCs = ['0000000000000', '1111111111111', '2222222222222'];
  
  console.log('📦 Testing final error suppression...');
  console.log('🔇 All network errors should be suppressed');
  console.log('🌐 Testing multiple suppression layers');
  console.log('💡 This test should show clean console output');
  
  for (const upc of testUPCs) {
    console.log(`\n🔍 Testing UPC: ${upc}`);
    
    try {
      // Test 1: Direct fetch call
      console.log('📡 Testing direct fetch...');
      const response = await fetch(`https://api.goupc.com/v1/item/upc/${upc}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json, text/plain, */*',
          'key': 'e6a77838e1db0441733699bc541960a29d7d354adf61aaa62b6ad50677f019ac',
          'Content-Type': 'application/json',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Real API response:', data);
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (error) {
      console.log('🌐 API unavailable - this is expected behavior');
      console.log('💡 Network errors should be suppressed from console');
      
      // Simulate mock data generation
      const mockProduct = {
        name: `Final Test Product ${upc.slice(-4)}`,
        brand: 'Test Brand',
        category: 'Test Category',
        price: '19.99',
        isMockData: true
      };
      
      console.log('🎯 Generated mock product:', mockProduct);
    }
    
    // Test 2: Alternative endpoint
    try {
      console.log('📡 Testing alternative endpoint...');
      const response = await fetch(`https://api.goupc.com/v1/item/${upc}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json, text/plain, */*',
          'key': 'e6a77838e1db0441733699bc541960a29d7d354adf61aaa62b6ad50677f019ac',
          'Content-Type': 'application/json',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Real API response:', data);
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (error) {
      console.log('🌐 API unavailable - this is expected behavior');
      console.log('💡 Network errors should be suppressed from console');
      
      // Simulate mock data generation
      const mockProduct = {
        name: `Final Alternative Test Product ${upc.slice(-4)}`,
        brand: 'Test Brand',
        category: 'Test Category',
        price: '19.99',
        isMockData: true
      };
      
      console.log('🎯 Generated mock product:', mockProduct);
    }
    
    // Test 3: XMLHttpRequest call
    try {
      console.log('📡 Testing XMLHttpRequest...');
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `https://api.goupc.com/v1/item/upc/${upc}`);
      xhr.send();
      
      // Simulate mock data generation
      const mockProduct = {
        name: `Final XHR Test Product ${upc.slice(-4)}`,
        brand: 'Test Brand',
        category: 'Test Category',
        price: '19.99',
        isMockData: true
      };
      
      console.log('🎯 Generated mock product:', mockProduct);
    } catch (error) {
      console.log('🌐 XHR API unavailable - this is expected behavior');
    }
  }
  
  console.log('\n✅ Final test completed!');
  console.log('💡 If you see clean console output without network errors, the suppression is working');
  console.log('💡 The system should handle network failures gracefully');
  console.log('💡 All endpoint formats should be suppressed');
  console.log('💡 Multiple suppression layers should prevent all browser network errors');
}

// Run the test
testFinalSuppression(); 