const mongoose = require('mongoose');
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Store = require('./src/models/Store');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

require('dotenv').config();

async function migrateData() {
  try {
    console.log('🔄 Starting data migration...\n');
    
    // Check if old database URI is provided
    const oldMongoUri = process.env.OLD_MONGODB_URI;
    const newMongoUri = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI;
    
    if (!oldMongoUri) {
      console.log('⚠️  OLD_MONGODB_URI not found in .env file');
      console.log('📝 To migrate data from your old Node.js backend:');
      console.log('   1. Add OLD_MONGODB_URI=your_old_mongodb_connection_string to .env');
      console.log('   2. Run: node migrate-data.js');
      return;
    }
    
    if (!newMongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    console.log('🔗 Connecting to old database...');
    const oldConnection = await mongoose.createConnection(oldMongoUri);
    
    console.log('🔗 Connecting to new database...');
    const newConnection = await mongoose.createConnection(newMongoUri);
    
    console.log('✅ Connected to both databases successfully\n');
    
    const migrationResults = {
      users: { migrated: 0, skipped: 0, errors: 0 },
      categories: { migrated: 0, skipped: 0, errors: 0 },
      stores: { migrated: 0, skipped: 0, errors: 0 },
      products: { migrated: 0, skipped: 0, errors: 0 },
      orders: { migrated: 0, skipped: 0, errors: 0 }
    };
    
    // Migrate Users
    console.log('👥 Migrating users...');
    try {
      const oldUsers = await oldConnection.db.collection('users').find({}).toArray();
      
      for (const oldUser of oldUsers) {
        try {
          // Check if user already exists
          const existingUser = await User.findOne({
            $or: [{ email: oldUser.email }, { phone: oldUser.phone }]
          });
          
          if (existingUser) {
            migrationResults.users.skipped++;
            continue;
          }
          
          // Create new user
          const newUser = new User({
            name: oldUser.name || 'Unknown User',
            email: oldUser.email,
            phone: oldUser.phone,
            password: oldUser.password || 'DefaultPassword123!',
            role: oldUser.role || 'user',
            isActive: oldUser.isActive !== false,
            isVerified: oldUser.isVerified || false,
            address: oldUser.address || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'US',
              location: {
                type: 'Point',
                coordinates: [0, 0]
              }
            },
            preferences: oldUser.preferences || {},
            createdAt: oldUser.createdAt || new Date(),
            updatedAt: oldUser.updatedAt || new Date()
          });
          
          await newUser.save();
          migrationResults.users.migrated++;
          
        } catch (error) {
          console.error(`❌ Error migrating user ${oldUser.email}:`, error.message);
          migrationResults.users.errors++;
        }
      }
    } catch (error) {
      console.error('❌ Error accessing old users collection:', error.message);
    }
    
    // Migrate Categories
    console.log('📂 Migrating categories...');
    try {
      const oldCategories = await oldConnection.db.collection('categories').find({}).toArray();
      
      for (const oldCategory of oldCategories) {
        try {
          // Check if category already exists
          const existingCategory = await Category.findOne({ name: oldCategory.name });
          
          if (existingCategory) {
            migrationResults.categories.skipped++;
            continue;
          }
          
          // Create new category
          const newCategory = new Category({
            name: oldCategory.name,
            description: oldCategory.description || '',
            image: oldCategory.image || '',
            icon: oldCategory.icon || '📦',
            color: oldCategory.color || '#000000',
            isActive: oldCategory.isActive !== false,
            isFeatured: oldCategory.isFeatured || false,
            parent: oldCategory.parent || null,
            children: oldCategory.children || [],
            sortOrder: oldCategory.sortOrder || 0,
            createdAt: oldCategory.createdAt || new Date(),
            updatedAt: oldCategory.updatedAt || new Date()
          });
          
          await newCategory.save();
          migrationResults.categories.migrated++;
          
        } catch (error) {
          console.error(`❌ Error migrating category ${oldCategory.name}:`, error.message);
          migrationResults.categories.errors++;
        }
      }
    } catch (error) {
      console.error('❌ Error accessing old categories collection:', error.message);
    }
    
    // Migrate Stores
    console.log('🏪 Migrating stores...');
    try {
      const oldStores = await oldConnection.db.collection('stores').find({}).toArray();
      
      for (const oldStore of oldStores) {
        try {
          // Check if store already exists
          const existingStore = await Store.findOne({ 
            name: oldStore.name,
            owner: oldStore.owner 
          });
          
          if (existingStore) {
            migrationResults.stores.skipped++;
            continue;
          }
          
          // Create new store
          const newStore = new Store({
            name: oldStore.name,
            description: oldStore.description || '',
            owner: oldStore.owner,
            address: oldStore.address || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'US',
              location: {
                type: 'Point',
                coordinates: [0, 0]
              }
            },
            contact: oldStore.contact || {},
            hours: oldStore.hours || {},
            images: oldStore.images || [],
            logo: oldStore.logo || '',
            isActive: oldStore.isActive !== false,
            isVerified: oldStore.isVerified || false,
            rating: oldStore.rating || 0,
            deliveryRadius: oldStore.deliveryRadius || 5,
            deliveryFee: oldStore.deliveryFee || 0,
            minimumOrder: oldStore.minimumOrder || 0,
            categories: oldStore.categories || [],
            createdAt: oldStore.createdAt || new Date(),
            updatedAt: oldStore.updatedAt || new Date()
          });
          
          await newStore.save();
          migrationResults.stores.migrated++;
          
        } catch (error) {
          console.error(`❌ Error migrating store ${oldStore.name}:`, error.message);
          migrationResults.stores.errors++;
        }
      }
    } catch (error) {
      console.error('❌ Error accessing old stores collection:', error.message);
    }
    
    // Migrate Products
    console.log('📦 Migrating products...');
    try {
      const oldProducts = await oldConnection.db.collection('products').find({}).toArray();
      
      for (const oldProduct of oldProducts) {
        try {
          // Check if product already exists
          const existingProduct = await Product.findOne({ 
            name: oldProduct.name,
            store: oldProduct.store 
          });
          
          if (existingProduct) {
            migrationResults.products.skipped++;
            continue;
          }
          
          // Create new product
          const newProduct = new Product({
            name: oldProduct.name,
            description: oldProduct.description || '',
            price: oldProduct.price || 0,
            originalPrice: oldProduct.originalPrice || oldProduct.price || 0,
            category: oldProduct.category,
            images: oldProduct.images || [],
            brand: oldProduct.brand || '',
            alcoholContent: oldProduct.alcoholContent || 0,
            volume: oldProduct.volume || 0,
            unit: oldProduct.unit || 'ml',
            stock: oldProduct.stock || 0,
            sku: oldProduct.sku || '',
            barcode: oldProduct.barcode || '',
            isActive: oldProduct.isActive !== false,
            isFeatured: oldProduct.isFeatured || false,
            isOnSale: oldProduct.isOnSale || false,
            salePercentage: oldProduct.salePercentage || 0,
            tags: oldProduct.tags || [],
            ratings: oldProduct.ratings || [],
            store: oldProduct.store,
            createdAt: oldProduct.createdAt || new Date(),
            updatedAt: oldProduct.updatedAt || new Date()
          });
          
          await newProduct.save();
          migrationResults.products.migrated++;
          
        } catch (error) {
          console.error(`❌ Error migrating product ${oldProduct.name}:`, error.message);
          migrationResults.products.errors++;
        }
      }
    } catch (error) {
      console.error('❌ Error accessing old products collection:', error.message);
    }
    
    // Migrate Orders
    console.log('📋 Migrating orders...');
    try {
      const oldOrders = await oldConnection.db.collection('orders').find({}).toArray();
      
      for (const oldOrder of oldOrders) {
        try {
          // Check if order already exists
          const existingOrder = await Order.findOne({ orderNumber: oldOrder.orderNumber });
          
          if (existingOrder) {
            migrationResults.orders.skipped++;
            continue;
          }
          
          // Create new order
          const newOrder = new Order({
            user: oldOrder.user,
            store: oldOrder.store,
            orderNumber: oldOrder.orderNumber,
            items: oldOrder.items || [],
            subtotal: oldOrder.subtotal || 0,
            tax: oldOrder.tax || 0,
            shipping: oldOrder.shipping || 0,
            discount: oldOrder.discount || 0,
            total: oldOrder.total || 0,
            status: oldOrder.status || 'pending',
            paymentStatus: oldOrder.paymentStatus || 'pending',
            paymentMethod: oldOrder.paymentMethod || '',
            shippingAddress: oldOrder.shippingAddress || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'US',
              location: {
                type: 'Point',
                coordinates: [0, 0]
              }
            },
            billingAddress: oldOrder.billingAddress || {},
            deliveryInstructions: oldOrder.deliveryInstructions || '',
            estimatedDelivery: oldOrder.estimatedDelivery,
            actualDelivery: oldOrder.actualDelivery,
            trackingNumber: oldOrder.trackingNumber || '',
            notes: oldOrder.notes || '',
            createdAt: oldOrder.createdAt || new Date(),
            updatedAt: oldOrder.updatedAt || new Date()
          });
          
          await newOrder.save();
          migrationResults.orders.migrated++;
          
        } catch (error) {
          console.error(`❌ Error migrating order ${oldOrder.orderNumber}:`, error.message);
          migrationResults.orders.errors++;
        }
      }
    } catch (error) {
      console.error('❌ Error accessing old orders collection:', error.message);
    }
    
    // Close connections
    await oldConnection.close();
    await newConnection.close();
    
    // Print migration summary
    console.log('\n📊 Migration Summary:');
    console.log('=====================');
    
    for (const [collection, results] of Object.entries(migrationResults)) {
      console.log(`${collection.toUpperCase()}:`);
      console.log(`  ✅ Migrated: ${results.migrated}`);
      console.log(`  ⏭️  Skipped: ${results.skipped}`);
      console.log(`  ❌ Errors: ${results.errors}`);
      console.log('');
    }
    
    const totalMigrated = Object.values(migrationResults).reduce((sum, r) => sum + r.migrated, 0);
    const totalErrors = Object.values(migrationResults).reduce((sum, r) => sum + r.errors, 0);
    
    if (totalErrors === 0) {
      console.log('🎉 Migration completed successfully!');
    } else {
      console.log('⚠️  Migration completed with some errors. Check the logs above.');
    }
    
    console.log(`📈 Total records migrated: ${totalMigrated}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateData();
