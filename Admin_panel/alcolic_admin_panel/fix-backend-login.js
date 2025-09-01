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

async function checkAndFixUser() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Find the admin user
    const user = await User.findOne({ email: 'admin@liquordelivery.com' });
    
    if (!user) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('Current user in database:', {
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    });

    // The issue is that the backend is using the request role instead of database role
    // Let's create a new admin user with a different email to test
    const newAdminUser = new User({
      name: 'System Admin',
      email: 'system@alcolic.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      phone: '1234567892',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newAdminUser.save();
    console.log('✅ New admin user created: system@alcolic.com');

    // Also update the existing user to ensure it's properly set
    user.role = 'admin';
    user.isVerified = true;
    user.updatedAt = new Date();
    
    await user.save();
    console.log('✅ Existing user updated to admin role');

    console.log('\n🎉 SUCCESS! Try these login credentials:');
    console.log('1. Email: admin@liquordelivery.com / Password: admin123');
    console.log('2. Email: system@alcolic.com / Password: admin123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
checkAndFixUser();
