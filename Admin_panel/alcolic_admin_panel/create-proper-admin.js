const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://alcolic_user:ylbviPNGByi1lWQy@alcolic.3ctyab4.mongodb.net/?retryWrites=true&w=majority&appName=alcolic';

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['customer', 'admin', 'delivery_man', 'store_owner'],
    default: 'customer'
  },
  phone: String,
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

async function createProperAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@alcolic.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating...');
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      existingAdmin.updatedAt = new Date();
      await existingAdmin.save();
      console.log('✅ Admin user updated');
    } else {
      // Create new admin user
      const adminUser = new User({
        name: 'Alcolic Admin',
        email: 'admin@alcolic.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        phone: '1234567890',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await adminUser.save();
      console.log('✅ New admin user created: admin@alcolic.com');
    }

    // Also create a store owner for testing
    const storeOwner = new User({
      name: 'Store Owner',
      email: 'store@alcolic.com',
      password: await bcrypt.hash('store123', 10),
      role: 'store_owner',
      phone: '1234567891',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await storeOwner.save();
    console.log('✅ Store owner created: store@alcolic.com');

    // Create delivery man
    const deliveryMan = new User({
      name: 'Delivery Man',
      email: 'delivery@alcolic.com',
      password: await bcrypt.hash('delivery123', 10),
      role: 'delivery_man',
      phone: '1234567892',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await deliveryMan.save();
    console.log('✅ Delivery man created: delivery@alcolic.com');

    console.log('\n🎉 SUCCESS! All users created with proper roles:');
    console.log('1. Admin Panel: admin@alcolic.com / admin123 (role: admin)');
    console.log('2. Store Panel: store@alcolic.com / store123 (role: store_owner)');
    console.log('3. Delivery App: delivery@alcolic.com / delivery123 (role: delivery_man)');
    console.log('4. Customer App: admin@liquordelivery.com / admin123 (role: customer)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
createProperAdmin();
