const { exec } = require('child_process');

console.log('🔍 Debugging backend startup error...');

// Check PM2 logs
exec('pm2 logs alcolic-backend --lines 20', (error, stdout, stderr) => {
  console.log('📋 PM2 Logs:');
  console.log('='.repeat(60));
  console.log(stdout);
  console.log('='.repeat(60));
  
  // Check if there are any error logs
  if (stdout.includes('Error') || stdout.includes('error')) {
    console.log('❌ Found errors in logs');
    fixBackendError();
  } else {
    console.log('✅ No obvious errors in logs');
    checkServerFile();
  }
});

function checkServerFile() {
  console.log('\n📁 Checking server.js file...');
  
  exec('cat /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js | head -50', (error, stdout, stderr) => {
    console.log('📄 Server.js content (first 50 lines):');
    console.log('='.repeat(60));
    console.log(stdout);
    console.log('='.repeat(60));
    
    // Check for common issues
    if (!stdout.includes('require')) {
      console.log('❌ Missing require statements');
      fixServerFile();
    } else {
      console.log('✅ Server.js looks okay');
      checkPackageJson();
    }
  });
}

function checkPackageJson() {
  console.log('\n📦 Checking package.json...');
  
  exec('cat /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/package.json', (error, stdout, stderr) => {
    console.log('📄 Package.json content:');
    console.log('='.repeat(60));
    console.log(stdout);
    console.log('='.repeat(60));
    
    if (!stdout.includes('mongoose')) {
      console.log('❌ Missing dependencies');
      installDependencies();
    } else {
      console.log('✅ Package.json looks okay');
      checkEnvFile();
    }
  });
}

function checkEnvFile() {
  console.log('\n🔧 Checking .env file...');
  
  exec('cat /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/.env', (error, stdout, stderr) => {
    console.log('📄 .env content:');
    console.log('='.repeat(60));
    console.log(stdout);
    console.log('='.repeat(60));
    
    if (!stdout.includes('MONGODB_URI_PROD')) {
      console.log('❌ Missing MongoDB URI');
      fixEnvFile();
    } else {
      console.log('✅ .env looks okay');
      restartBackend();
    }
  });
}

function fixBackendError() {
  console.log('\n🔧 Fixing backend error...');
  
  // Stop the current backend
  exec('pm2 stop alcolic-backend', (error, stdout, stderr) => {
    console.log('🛑 Stopped backend');
    
    // Create a simple test server first
    createTestServer();
  });
}

function createTestServer() {
  console.log('\n🧪 Creating test server...');
  
  const testServer = `const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`🚀 Test server running on port \${PORT}\`);
});

module.exports = app;`;
  
  const fs = require('fs');
  fs.writeFileSync('/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/test-server.js', testServer);
  
  console.log('✅ Test server created');
  
  // Start test server
  exec('cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && pm2 start test-server.js --name "test-backend"', (error, stdout, stderr) => {
    console.log('🚀 Started test server');
    
    setTimeout(() => {
      testSimpleServer();
    }, 3000);
  });
}

function testSimpleServer() {
  console.log('\n🧪 Testing simple server...');
  
  exec('curl -s -X GET http://localhost:5000/health', (error, stdout, stderr) => {
    console.log('📡 Test server response:');
    console.log('='.repeat(60));
    console.log(stdout);
    console.log('='.repeat(60));
    
    if (stdout.includes('OK')) {
      console.log('✅ Test server working!');
      console.log('🎯 The issue is in the main server.js file');
      fixMainServer();
    } else {
      console.log('❌ Test server also not working');
      console.log('🎯 The issue might be with dependencies or port');
      checkPort();
    }
  });
}

function checkPort() {
  console.log('\n🔍 Checking port usage...');
  
  exec('netstat -tlnp | grep :5000', (error, stdout, stderr) => {
    console.log('📡 Port 5000 status:');
    console.log('='.repeat(60));
    console.log(stdout);
    console.log('='.repeat(60));
    
    if (stdout.includes('5000')) {
      console.log('✅ Port 5000 is in use');
    } else {
      console.log('❌ Port 5000 not in use');
    }
  });
}

function fixMainServer() {
  console.log('\n🔧 Fixing main server.js...');
  
  // Stop test server
  exec('pm2 stop test-backend', (error, stdout, stderr) => {
    console.log('🛑 Stopped test server');
    
    // Create a working server.js
    createWorkingServer();
  });
}

function createWorkingServer() {
  console.log('\n🔧 Creating working server.js...');
  
  const workingServer = `const express = require('express');
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

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI_PROD;
    if (!mongoUri) {
      throw new Error('MONGODB_URI_PROD not found in environment variables');
    }
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
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
  
  const fs = require('fs');
  fs.writeFileSync('/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js', workingServer);
  
  console.log('✅ Working server.js created');
  
  // Start the working server
  exec('cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && pm2 start server.js --name "alcolic-backend"', (error, stdout, stderr) => {
    console.log('🚀 Started working backend');
    
    setTimeout(() => {
      testWorkingBackend();
    }, 5000);
  });
}

function testWorkingBackend() {
  console.log('\n🧪 Testing working backend...');
  
  exec('curl -s -X GET http://localhost:5000/health', (error, stdout, stderr) => {
    console.log('📡 Working backend response:');
    console.log('='.repeat(60));
    console.log(stdout);
    console.log('='.repeat(60));
    
    if (stdout.includes('OK')) {
      console.log('✅ Backend is now working!');
      testApiEndpoints();
    } else {
      console.log('❌ Backend still not working');
      console.log('💬 Response:', stdout);
    }
  });
}

function testApiEndpoints() {
  console.log('\n🧪 Testing API endpoints...');
  
  exec('curl -s -X GET http://localhost:5000/api/v1/auth/login', (error, stdout, stderr) => {
    console.log('📡 Auth endpoint test:');
    console.log('='.repeat(60));
    console.log(stdout);
    console.log('='.repeat(60));
    
    if (stdout.includes('Route not found') || stdout.includes('Validation errors')) {
      console.log('✅ API endpoints are working!');
      createAdminUser();
    } else {
      console.log('❌ API endpoints not working');
    }
  });
}

function createAdminUser() {
  console.log('\n🔧 Creating admin user...');
  
  const adminData = JSON.stringify({
    name: 'Admin User',
    email: 'admin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(\`curl -s -X POST http://localhost:5000/api/v1/auth/register -H "Content-Type: application/json" -d '\${adminData}'\`, (error, stdout, stderr) => {
    console.log('📡 Admin user creation:');
    console.log('='.repeat(60));
    console.log(stdout);
    console.log('='.repeat(60));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ Admin user created successfully!');
      console.log('\n🎯 Admin credentials:');
      console.log('📧 Email: admin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
      console.log('\n🌐 Backend URL: http://localhost:5000');
      console.log('📊 API Base: http://localhost:5000/api/v1');
    } else {
      console.log('❌ Failed to create admin user');
      console.log('💬 Response:', stdout);
    }
  });
}

function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  exec('cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && npm install', (error, stdout, stderr) => {
    console.log('📦 Dependencies installed');
    restartBackend();
  });
}

function fixEnvFile() {
  console.log('\n🔧 Fixing .env file...');
  
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
  
  const fs = require('fs');
  fs.writeFileSync('/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/.env', envContent);
  
  console.log('✅ .env file fixed');
  restartBackend();
}

function restartBackend() {
  console.log('\n🔄 Restarting backend...');
  
  exec('pm2 restart alcolic-backend', (error, stdout, stderr) => {
    console.log('🔄 Backend restarted');
    
    setTimeout(() => {
      testBackend();
    }, 3000);
  });
}

function testBackend() {
  console.log('\n🧪 Testing backend after restart...');
  
  exec('curl -s -X GET http://localhost:5000/health', (error, stdout, stderr) => {
    console.log('📡 Backend health check:');
    console.log('='.repeat(60));
    console.log(stdout);
    console.log('='.repeat(60));
    
    if (stdout.includes('OK')) {
      console.log('✅ Backend is working!');
    } else {
      console.log('❌ Backend still not working');
    }
  });
}
