const mongoose = require('mongoose');
require('dotenv').config();

async function setupDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');
    
    // Define schemas inline for setup
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, lowercase: true },
      phone: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['user', 'admin', 'store', 'delivery'], default: 'user' },
      isActive: { type: Boolean, default: true },
      isVerified: { type: Boolean, default: false },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        location: {
          type: { type: String, enum: ['Point'], default: 'Point' },
          coordinates: [Number]
        }
      },
      preferences: {
        notifications: { type: Boolean, default: true },
        emailUpdates: { type: Boolean, default: true },
        smsUpdates: { type: Boolean, default: false }
      },
      loginAttempts: { type: Number, default: 0 },
      lockUntil: Date,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const categorySchema = new mongoose.Schema({
      name: { type: String, required: true, unique: true },
      description: String,
      icon: String,
      color: String,
      parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      isActive: { type: Boolean, default: true },
      isFeatured: { type: Boolean, default: false },
      sortOrder: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const storeSchema = new mongoose.Schema({
      name: { type: String, required: true },
      description: String,
      owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
        location: {
          type: { type: String, enum: ['Point'], default: 'Point' },
          coordinates: [Number]
        }
      },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      website: String,
      categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      operatingHours: {
        monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        sunday: { open: String, close: String, isOpen: { type: Boolean, default: true } }
      },
      isActive: { type: Boolean, default: true },
      isVerified: { type: Boolean, default: false },
      rating: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
      deliveryRadius: { type: Number, default: 10 },
      minimumOrder: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const productSchema = new mongoose.Schema({
      name: { type: String, required: true },
      description: String,
      price: { type: Number, required: true, min: 0 },
      originalPrice: { type: Number, min: 0 },
      category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
      store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
      brand: String,
      sku: { type: String, unique: true },
      barcode: String,
      images: [String],
      stock: { type: Number, default: 0, min: 0 },
      isActive: { type: Boolean, default: true },
      isFeatured: { type: Boolean, default: false },
      isOnSale: { type: Boolean, default: false },
      salePercentage: { type: Number, min: 0, max: 100 },
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number
      },
      alcoholContent: Number,
      volume: Number,
      tags: [String],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const orderSchema = new mongoose.Schema({
      orderNumber: { type: String, required: true, unique: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
      items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 }
      }],
      subtotal: { type: Number, required: true, min: 0 },
      tax: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      total: { type: Number, required: true, min: 0 },
      status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'], default: 'pending' },
      paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
      paymentMethod: { type: String, enum: ['cash', 'card', 'online'], default: 'cash' },
      shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
        location: {
          type: { type: String, enum: ['Point'], default: 'Point' },
          coordinates: [Number]
        }
      },
      deliveryInstructions: String,
      estimatedDelivery: Date,
      actualDelivery: Date,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    // Create models
    const User = mongoose.model('User', userSchema);
    const Category = mongoose.model('Category', categorySchema);
    const Store = mongoose.model('Store', storeSchema);
    const Product = mongoose.model('Product', productSchema);
    const Order = mongoose.model('Order', orderSchema);
    
    console.log('📊 Checking database indexes...');
    
    // Create indexes with error handling
    const createIndexSafely = async (collection, indexSpec, options = {}) => {
      try {
        await collection.createIndex(indexSpec, options);
        console.log(`✅ Index created: ${JSON.stringify(indexSpec)}`);
      } catch (error) {
        if (error.code === 85) { // Index already exists
          console.log(`ℹ️  Index already exists: ${JSON.stringify(indexSpec)}`);
        } else {
          console.log(`⚠️  Index creation skipped: ${error.message}`);
        }
      }
    };
    
    // User indexes
    await createIndexSafely(User.collection, { email: 1 }, { unique: true });
    await createIndexSafely(User.collection, { phone: 1 }, { unique: true });
    await createIndexSafely(User.collection, { 'address.location': '2dsphere' });
    await createIndexSafely(User.collection, { role: 1 });
    await createIndexSafely(User.collection, { isActive: 1 });
    await createIndexSafely(User.collection, { createdAt: -1 });
    
    // Store indexes
    await createIndexSafely(Store.collection, { 'address.location': '2dsphere' });
    await createIndexSafely(Store.collection, { owner: 1 });
    await createIndexSafely(Store.collection, { isActive: 1 });
    await createIndexSafely(Store.collection, { isVerified: 1 });
    await createIndexSafely(Store.collection, { categories: 1 });
    await createIndexSafely(Store.collection, { rating: -1 });
    await createIndexSafely(Store.collection, { createdAt: -1 });
    
    // Product indexes
    await createIndexSafely(Product.collection, { name: 'text', description: 'text', brand: 'text' });
    await createIndexSafely(Product.collection, { category: 1 });
    await createIndexSafely(Product.collection, { store: 1 });
    await createIndexSafely(Product.collection, { isActive: 1 });
    await createIndexSafely(Product.collection, { isFeatured: 1 });
    await createIndexSafely(Product.collection, { price: 1 });
    await createIndexSafely(Product.collection, { stock: 1 });
    await createIndexSafely(Product.collection, { sku: 1 }, { unique: true });
    await createIndexSafely(Product.collection, { barcode: 1 });
    await createIndexSafely(Product.collection, { createdAt: -1 });
    
    // Order indexes
    await createIndexSafely(Order.collection, { user: 1 });
    await createIndexSafely(Order.collection, { store: 1 });
    await createIndexSafely(Order.collection, { orderNumber: 1 }, { unique: true });
    await createIndexSafely(Order.collection, { status: 1 });
    await createIndexSafely(Order.collection, { paymentStatus: 1 });
    await createIndexSafely(Order.collection, { 'shippingAddress.location': '2dsphere' });
    await createIndexSafely(Order.collection, { createdAt: -1 });
    
    // Category indexes
    await createIndexSafely(Category.collection, { name: 1 });
    await createIndexSafely(Category.collection, { parent: 1 });
    await createIndexSafely(Category.collection, { isActive: 1 });
    await createIndexSafely(Category.collection, { isFeatured: 1 });
    await createIndexSafely(Category.collection, { sortOrder: 1 });
    
    console.log('✅ Database indexes checked successfully');
    
    // Create admin user if it doesn't exist
    console.log('👤 Checking for admin user...');
    const adminExists = await User.findOne({ email: 'admin@alcolic.com' });
    
    if (!adminExists) {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@alcolic.com',
        phone: '+1234567890',
        password: 'Admin@123',
        role: 'admin',
        isActive: true,
        isVerified: true,
        address: {
          street: '123 Admin Street',
          city: 'Admin City',
          state: 'AS',
          zipCode: '12345',
          country: 'US',
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128] // New York coordinates
          }
        }
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@alcolic.com');
      console.log('🔑 Password: Admin@123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    // Create sample categories
    console.log('📂 Creating sample categories...');
    const categories = [
      { name: 'Beer', description: 'Various types of beer', icon: '🍺', color: '#FFD700' },
      { name: 'Wine', description: 'Red, white, and sparkling wines', icon: '🍷', color: '#8B0000' },
      { name: 'Spirits', description: 'Vodka, whiskey, rum, and more', icon: '🥃', color: '#8B4513' },
      { name: 'Liqueurs', description: 'Sweet alcoholic beverages', icon: '🍸', color: '#FF69B4' },
      { name: 'Mixers', description: 'Non-alcoholic mixers', icon: '🥤', color: '#00CED1' }
    ];
    
    for (const catData of categories) {
      const existingCategory = await Category.findOne({ name: catData.name });
      if (!existingCategory) {
        const category = new Category(catData);
        await category.save();
        console.log(`✅ Created category: ${catData.name}`);
      } else {
        console.log(`ℹ️  Category already exists: ${catData.name}`);
      }
    }
    
    console.log('✅ Database setup completed successfully');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

setupDatabase();
