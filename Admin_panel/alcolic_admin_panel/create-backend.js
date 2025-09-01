const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Creating Real Backend...');

// Backend directory
const backendDir = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend';

function createBackend() {
  console.log('\n📦 Creating package.json...');
  
  const packageJson = {
    "name": "alcolic-backend",
    "version": "1.0.0",
    "description": "Alcolic Backend API",
    "main": "server.js",
    "scripts": {
      "start": "node server.js",
      "dev": "nodemon server.js"
    },
    "dependencies": {
      "express": "^4.18.2",
      "mongoose": "^7.5.0",
      "cors": "^2.8.5",
      "helmet": "^7.0.0",
      "bcryptjs": "^2.4.3",
      "jsonwebtoken": "^9.0.2",
      "dotenv": "^16.3.1",
      "multer": "^1.4.5-lts.1",
      "socket.io": "^4.7.2",
      "nodemailer": "^6.9.4",
      "stripe": "^13.5.0",
      "twilio": "^4.15.0",
      "firebase-admin": "^11.10.1",
      "express-rate-limit": "^6.10.0",
      "express-validator": "^7.0.1",
      "compression": "^1.7.4",
      "morgan": "^1.10.0"
    },
    "devDependencies": {
      "nodemon": "^3.0.1"
    }
  };
  
  fs.writeFileSync(path.join(backendDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json created');
  
  createEnvFile();
}

function createEnvFile() {
  console.log('\n🔧 Creating .env file...');
  
  const envContent = `NODE_ENV=production
PORT=5000
MONGODB_URI_PROD=mongodb+srv://alcolic_user:ylbviPNGByi1lWQy@alcolic.3ctyab4.mongodb.net/alcolic?retryWrites=true&w=majority&appName=alcolic
JWT_SECRET=alcolic-super-secret-jwt-key-2024
JWT_EXPIRE=30d
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email`;
  
  fs.writeFileSync(path.join(backendDir, '.env'), envContent);
  console.log('✅ .env file created');
  
  createServerJs();
}

function createServerJs() {
  console.log('\n🖥️ Creating server.js...');
  
  const serverJs = `const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const categoryRoutes = require('./routes/categories');
const storeRoutes = require('./routes/stores');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');
const paymentRoutes = require('./routes/payments');

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { adminAuth } = require('./middleware/adminAuth');
const { storeAuth } = require('./middleware/storeAuth');

// Import database connection
const connectDB = require('./config/database');

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS
app.use(cors({
  origin: ['https://admin.alcolic.gnritservices.com', 'https://store.alcolic.gnritservices.com', 'https://alcolic.gnritservices.com'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authenticateToken, userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', authenticateToken, orderRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/admin', authenticateToken, adminAuth, adminRoutes);
app.use('/api/v1/analytics', authenticateToken, adminAuth, analyticsRoutes);
app.use('/api/v1/notifications', authenticateToken, notificationRoutes);
app.use('/api/v1/payments', authenticateToken, paymentRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log('User joined room:', room);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT} in \${process.env.NODE_ENV} mode\`);
});

module.exports = { app, io };`;
  
  fs.writeFileSync(path.join(backendDir, 'server.js'), serverJs);
  console.log('✅ server.js created');
  
  createDirectories();
}

function createDirectories() {
  console.log('\n📁 Creating directories...');
  
  const dirs = [
    'config',
    'middleware',
    'models',
    'routes',
    'utils',
    'uploads',
    'uploads/products',
    'uploads/categories',
    'uploads/stores',
    'uploads/users'
  ];
  
  dirs.forEach(dir => {
    fs.mkdirSync(path.join(backendDir, dir), { recursive: true });
  });
  
  console.log('✅ Directories created');
  
  createDatabaseConfig();
}

function createDatabaseConfig() {
  console.log('\n🗄️ Creating database config...');
  
  const dbConfig = `const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI_PROD;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI_PROD not found in environment variables');
    }
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(\`MongoDB Connected: \${conn.connection.host}\`);
    logger.info(\`Database: \${conn.connection.db.databaseName}\`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;`;
  
  fs.writeFileSync(path.join(backendDir, 'config/database.js'), dbConfig);
  console.log('✅ Database config created');
  
  createLogger();
}

function createLogger() {
  console.log('\n📝 Creating logger...');
  
  const logger = `const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'alcolic-api' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log') 
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;`;
  
  fs.mkdirSync(path.join(backendDir, 'logs'), { recursive: true });
  fs.writeFileSync(path.join(backendDir, 'utils/logger.js'), logger);
  console.log('✅ Logger created');
  
  createModels();
}

function createModels() {
  console.log('\n📊 Creating database models...');
  
  // User Model
  const userModel = `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'delivery_man', 'store_owner'],
    default: 'customer'
  },
  phone: {
    type: String,
    match: [/^[+]?[1-9]\\d{1,14}$/, 'Please provide a valid phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  avatar: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'USD' }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);`;
  
  fs.writeFileSync(path.join(backendDir, 'models/User.js'), userModel);
  console.log('✅ User model created');
  
  // Continue with other models...
  createMoreModels();
}

function createMoreModels() {
  // Product Model
  const productModel = `const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide a category']
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'Please provide a store']
  },
  images: [{
    type: String,
    required: [true, 'Please provide at least one image']
  }],
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  specifications: {
    type: Map,
    of: String
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const total = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = total / this.ratings.length;
    this.totalRatings = this.ratings.length;
  }
};

module.exports = mongoose.model('Product', productSchema);`;
  
  fs.writeFileSync(path.join(backendDir, 'models/Product.js'), productModel);
  console.log('✅ Product model created');
  
  createRoutes();
}

function createRoutes() {
  console.log('\n🛣️ Creating API routes...');
  
  // Auth Routes
  const authRoutes = `const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const logger = require('../utils/logger');

// Register user
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['customer', 'admin', 'delivery_man', 'store_owner']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, role = 'customer', phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      phone
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password, role } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check role if specified
    if (role && user.role !== role) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role for this account'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences
      }
    });

  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;`;
  
  fs.writeFileSync(path.join(backendDir, 'routes/auth.js'), authRoutes);
  console.log('✅ Auth routes created');
  
  installDependencies();
}

function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  exec(`cd ${backendDir} && npm install`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to install dependencies:', error.message);
      return;
    }
    
    console.log('✅ Dependencies installed');
    console.log('🎉 Backend created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Create frontend applications');
    console.log('2. Set up deployment');
    console.log('3. Configure domains');
  });
}

console.log('🚀 Starting backend creation...');
createBackend();
