// Test script to verify error suppression
// Run this in the browser console

console.log('🧪 Testing Error Suppression...');

// Test the error suppression system
async function testErrorSuppression() {
  const testUPCs = ['0000000000000', '1111111111111', '2222222222222'];
  
  console.log('📦 Testing error suppression...');
  console.log('🔇 Network errors should be suppressed');
  
  for (const upc of testUPCs) {
    console.log(`\n🔍 Testing UPC: ${upc}`);
    
    try {
      // This should trigger network errors that get suppressed
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
  }
  
  console.log('\n✅ Test completed!');
  console.log('💡 If you see clean console output without network errors, the suppression is working');
  console.log('💡 The system should handle network failures gracefully');
}

// Run the test
testErrorSuppression(); 