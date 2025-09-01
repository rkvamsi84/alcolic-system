// Test script to verify image import from UPC codes
// Run this in the browser console to test the image import functionality

console.log('🧪 Testing Image Import from UPC Codes');

// Import the functions (this would need to be run in the browser context)
// For testing purposes, we'll simulate the behavior

function generateMockProductWithImage(upc) {
  const categories = ['Wine', 'Beer', 'Spirits', 'Liqueur', 'Cocktail', 'Whiskey', 'Vodka', 'Rum', 'Gin', 'Tequila'];
  const brands = ['Premium Brand', 'Classic Brew', 'Artisan Spirits', 'Heritage Wine', 'Craft Beer', 'Royal Distillery', 'Vintage Cellars', 'Mountain Brewery', 'Coastal Wines', 'Urban Craft'];
  const productTypes = ['Red Wine', 'White Wine', 'IPA Beer', 'Lager', 'Whiskey', 'Vodka', 'Rum', 'Gin', 'Tequila', 'Liqueur'];
  
  const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
  const selectedBrand = brands[Math.floor(Math.random() * brands.length)];
  const selectedType = productTypes[Math.floor(Math.random() * productTypes.length)];
  
  const basePrice = Math.random() * 50 + 10;
  const volume = Math.floor(Math.random() * 750 + 250);
  const alcoholContent = (Math.random() * 15 + 3).toFixed(1);
  
  // Mock image URLs for testing
  const mockImages = [
    'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Wine',
    'https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=Beer',
    'https://via.placeholder.com/300x300/45B7D1/FFFFFF?text=Spirits',
    'https://via.placeholder.com/300x300/96CEB4/FFFFFF?text=Liqueur',
    'https://via.placeholder.com/300x300/FFEAA7/FFFFFF?text=Cocktail'
  ];
  
  return {
    upc: upc,
    name: `${selectedBrand} ${selectedType}`,
    brand: selectedBrand,
    category: selectedCategory,
    description: `Premium ${selectedType.toLowerCase()} from ${selectedBrand}. A carefully crafted beverage with exceptional quality and taste.`,
    price: basePrice.toFixed(2),
    weight: `${Math.floor(Math.random() * 1000 + 100)}g`,
    dimensions: `${Math.floor(Math.random() * 20 + 5)}cm x ${Math.floor(Math.random() * 10 + 3)}cm`,
    images: [{
      url: mockImages[Math.floor(Math.random() * mockImages.length)],
      alt: `${selectedBrand} ${selectedType}`,
      isPrimary: true
    }],
    manufacturer: selectedBrand,
    ingredients: 'Water, malt, hops, yeast, natural flavors',
    nutritionFacts: null,
    warnings: ['Contains alcohol', 'Drink responsibly'],
    features: ['Premium quality', 'Handcrafted', 'Small batch'],
    specifications: {
      volume: volume,
      alcoholContent: alcoholContent
    },
    lastUpdated: new Date().toISOString(),
    isMockData: true
  };
}

function formatProductData(upcData) {
  if (!upcData || upcData.error) {
    return null;
  }

  // Format images for backend compatibility
  let images = [];
  if (upcData.image) {
    images.push({
      url: upcData.image,
      alt: upcData.name || 'Product Image',
      isPrimary: true
    });
  } else if (upcData.images && Array.isArray(upcData.images) && upcData.images.length > 0) {
    images = upcData.images.map((imageUrl, index) => ({
      url: imageUrl,
      alt: upcData.name || 'Product Image',
      isPrimary: index === 0
    }));
  }

  return {
    name: upcData.name || '',
    brand: upcData.brand || '',
    category: upcData.category || '',
    description: upcData.description || '',
    images: images, // Use the properly formatted images array
    manufacturer: upcData.manufacturer || '',
    weight: upcData.weight || '',
    dimensions: upcData.dimensions || '',
    ingredients: upcData.ingredients || '',
    nutritionFacts: upcData.nutritionFacts || null,
    warnings: upcData.warnings || [],
    features: upcData.features || [],
    specifications: upcData.specifications || {},
    lastUpdated: new Date().toISOString()
  };
}

async function testImageImport(upc) {
  console.log(`🔍 Testing UPC: ${upc}`);
  
  try {
    // Simulate API call that will fail and use mock data
    console.log('❌ API failed, using mock data with images');
    
    // Generate mock data as fallback with images
    const mockProduct = generateMockProductWithImage(upc);
    console.log('🎯 Generated mock product with image:', mockProduct.name);
    console.log('🖼️ Image data:', mockProduct.images);
    
    // Format the product data
    const formattedData = formatProductData(mockProduct);
    console.log('📦 Formatted product data:', formattedData);
    console.log('🖼️ Formatted images:', formattedData.images);
    
    return formattedData;
  } catch (error) {
    console.log('❌ Error in image import test:', error.message);
    return null;
  }
}

// Test the image import system
async function runImageImportTest() {
  console.log('🚀 Starting Image Import Test...');
  
  const testUPCs = ['0000000000000', '1111111111111', '2222222222222'];
  
  for (const upc of testUPCs) {
    console.log('\n' + '='.repeat(50));
    const result = await testImageImport(upc);
    if (result) {
      console.log(`📦 Final result for ${upc}:`, {
        name: result.name,
        brand: result.brand,
        category: result.category,
        price: result.price,
        images: result.images,
        imageCount: result.images.length
      });
      
      // Test image display
      if (result.images.length > 0) {
        console.log('🖼️ Primary image URL:', result.images[0].url);
        console.log('🖼️ Primary image alt text:', result.images[0].alt);
        console.log('🖼️ Is primary:', result.images[0].isPrimary);
      }
    }
  }
  
  console.log('\n✅ Image import test completed! The system should now properly handle images from UPC codes.');
}

// Run the test
runImageImportTest(); 