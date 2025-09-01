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

async function fixAdminPassword() {
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

    console.log('Found admin user:', {
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    });

    // Hash the password 'admin123'
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    
    console.log('Hashing password: admin123');
    console.log('Hashed password:', hashedPassword);

    // Update the password
    user.password = hashedPassword;
    user.updatedAt = new Date();
    
    await user.save();
    console.log('✅ Admin password updated successfully!');

    // Verify the update
    const updatedUser = await User.findOne({ email: 'admin@liquordelivery.com' });
    console.log('Updated user:', {
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
      passwordLength: updatedUser.password.length
    });

    console.log('\n🎉 SUCCESS! Admin password fixed!');
    console.log('Login with: admin@liquordelivery.com / admin123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
fixAdminPassword();
