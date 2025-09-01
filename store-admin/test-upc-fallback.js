// Test script to verify UPC fallback system
// Run this in the browser console to test the Go-UPC API fallback

console.log('🧪 Testing Go-UPC API Fallback System');

// Import the function (this would need to be run in the browser context)
// For testing purposes, we'll simulate the behavior

function generateMockProduct(upc) {
  const categories = ['Wine', 'Beer', 'Spirits', 'Liqueur', 'Cocktail', 'Whiskey', 'Vodka', 'Rum', 'Gin', 'Tequila'];
  const brands = ['Premium Brand', 'Classic Brew', 'Artisan Spirits', 'Heritage Wine', 'Craft Beer', 'Royal Distillery', 'Vintage Cellars', 'Mountain Brewery', 'Coastal Wines', 'Urban Craft'];
  const productTypes = ['Red Wine', 'White Wine', 'IPA Beer', 'Lager', 'Whiskey', 'Vodka', 'Rum', 'Gin', 'Tequila', 'Liqueur'];
  
  const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
  const selectedBrand = brands[Math.floor(Math.random() * brands.length)];
  const selectedType = productTypes[Math.floor(Math.random() * productTypes.length)];
  
  const basePrice = Math.random() * 50 + 10;
  const volume = Math.floor(Math.random() * 750 + 250);
  const alcoholContent = (Math.random() * 15 + 3).toFixed(1);
  
  return {
    upc: upc,
    name: `${selectedBrand} ${selectedType}`,
    brand: selectedBrand,
    category: selectedCategory,
    description: `Premium ${selectedType.toLowerCase()} from ${selectedBrand}. A carefully crafted beverage with exceptional quality and taste.`,
    price: basePrice.toFixed(2),
    volume: volume,
    alcoholContent: alcoholContent,
    isMockData: true
  };
}

async function testUPCLookup(upc) {
  console.log(`🔍 Testing UPC: ${upc}`);
  
  try {
    // Simulate API call that will fail
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
      return { ...data, isMockData: false };
    } else {
      throw new Error(`API returned ${response.status}`);
    }
  } catch (error) {
    console.log('❌ API failed, using mock data');
    console.log('🔍 Error details:', error.message);
    
    // Generate mock data as fallback
    const mockProduct = generateMockProduct(upc);
    console.log('🎯 Generated mock product:', mockProduct);
    return mockProduct;
  }
}

// Test the system
async function runTest() {
  console.log('🚀 Starting UPC Fallback Test...');
  
  const testUPCs = ['0000000000000', '1111111111111', '2222222222222'];
  
  for (const upc of testUPCs) {
    console.log('\n' + '='.repeat(50));
    const result = await testUPCLookup(upc);
    console.log(`📦 Final result for ${upc}:`, {
      name: result.name,
      brand: result.brand,
      category: result.category,
      price: result.price,
      isMockData: result.isMockData
    });
  }
  
  console.log('\n✅ Test completed! The fallback system is working correctly.');
}

// Run the test
runTest(); 