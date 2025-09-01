// Test script to verify enhanced error suppression
// Run this in the browser console

console.log('🧪 Testing Enhanced Error Suppression...');

// Test the enhanced error suppression system
async function testEnhancedSuppression() {
  const testUPCs = ['0000000000000', '1111111111111', '2222222222222'];
  
  console.log('📦 Testing enhanced error suppression...');
  console.log('🔇 All network errors should be suppressed');
  console.log('🌐 Testing multiple error suppression layers');
  
  for (const upc of testUPCs) {
    console.log(`\n🔍 Testing UPC: ${upc}`);
    
    try {
      // Test 1: Direct fetch call
      console.log('📡 Testing direct fetch...');
      const response = await fetch(`https://api.goupc.com/v1/item/${upc}`, {
        method: 'GET',
        headers: {
          'key': 'test-key',
          'Content-Type': 'application/json'
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
        name: `Test Product ${upc.slice(-4)}`,
        brand: 'Test Brand',
        category: 'Test Category',
        price: '19.99',
        isMockData: true
      };
      
      console.log('🎯 Generated mock product:', mockProduct);
    }
    
    // Test 2: XMLHttpRequest call
    try {
      console.log('📡 Testing XMLHttpRequest...');
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `https://api.goupc.com/v1/item/${upc}`);
      xhr.send();
      
      // Simulate mock data generation
      const mockProduct = {
        name: `XHR Test Product ${upc.slice(-4)}`,
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
  
  console.log('\n✅ Enhanced test completed!');
  console.log('💡 If you see clean console output without network errors, the suppression is working');
  console.log('💡 The system should handle network failures gracefully');
  console.log('💡 Multiple suppression layers should prevent all browser network errors');
}

// Run the test
testEnhancedSuppression(); 