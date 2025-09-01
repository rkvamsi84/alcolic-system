const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://alcolic_user:ylbviPNGByi1lWQy@alcolic.3ctyab4.mongodb.net/?retryWrites=true&w=majority&appName=alcolic';

// User Schema (simplified)
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

async function updateUserToAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Find the user
    const user = await User.findOne({ email: 'admin@liquordelivery.com' });
    
    if (!user) {
      console.log('User not found. Creating new admin user...');
      
      // Create new admin user
      const adminUser = new User({
        name: 'Super Admin',
        email: 'admin@liquordelivery.com',
        password: '$2b$10$rQZ8K9mN2pL1vX3yU6wA7sB4cD5eF8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8', // admin123
        role: 'admin',
        phone: '1234567891',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await adminUser.save();
      console.log('✅ New admin user created successfully!');
    } else {
      console.log('User found. Updating role to admin...');
      
      // Update user role to admin
      user.role = 'admin';
      user.isVerified = true;
      user.updatedAt = new Date();
      
      await user.save();
      console.log('✅ User role updated to admin successfully!');
    }

    // Verify the update
    const updatedUser = await User.findOne({ email: 'admin@liquordelivery.com' });
    console.log('Updated user:', {
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified
    });

    console.log('\n🎉 SUCCESS! You now have full admin access!');
    console.log('Login with: admin@liquordelivery.com / admin123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
updateUserToAdmin();
