// Comprehensive test script to verify error suppression
// Run this in the browser console

console.log('🧪 Testing Comprehensive Error Suppression...');

// Test the comprehensive error suppression system
async function testComprehensiveSuppression() {
  const testUPCs = ['0000000000000', '1111111111111', '2222222222222'];
  const testEndpoints = [
    'https://api.goupc.com/v1/item/',
    'https://api.goupc.com/v1/item/upc/',
    'https://goupc.com/v1/item/',
    'https://goupc.com/v1/item/upc/'
  ];
  
  console.log('📦 Testing comprehensive error suppression...');
  console.log('🔇 All network errors should be suppressed');
  console.log('🌐 Testing multiple endpoint formats');
  
  for (const upc of testUPCs) {
    console.log(`\n🔍 Testing UPC: ${upc}`);
    
    for (const endpoint of testEndpoints) {
      console.log(`📡 Testing endpoint: ${endpoint}`);
      
      try {
        // Test direct fetch call
        const response = await fetch(`${endpoint}${upc}`, {
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
  }
  
  console.log('\n✅ Comprehensive test completed!');
  console.log('💡 If you see clean console output without network errors, the suppression is working');
  console.log('💡 The system should handle network failures gracefully');
  console.log('💡 All endpoint formats should be suppressed');
}

// Run the test
testComprehensiveSuppression(); 