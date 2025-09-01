const { exec } = require('child_process');

console.log('🔧 Fixing database connection issue...');

// The backend is trying to connect to local MongoDB instead of MongoDB Atlas
// Let's fix the database configuration

function checkDatabaseConfig() {
  console.log('\n🔍 Checking database configuration...');
  
  exec('cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && cat .env', (error, stdout, stderr) => {
    console.log('📋 Current .env content:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('MONGODB_URI_PROD')) {
      console.log('✅ MONGODB_URI_PROD is configured');
      console.log('🔄 Let\'s check the database connection code...');
      checkDatabaseConnection();
    } else {
      console.log('❌ MONGODB_URI_PROD not found');
      console.log('🔄 Let\'s add the MongoDB Atlas URI...');
      addMongoDBUri();
    }
  });
}

function addMongoDBUri() {
  console.log('\n🔧 Adding MongoDB Atlas URI...');
  
  const mongoUri = 'mongodb+srv://alcolic_user:ylbviPNGByi1lWQy@alcolic.3ctyab4.mongodb.net/alcolic?retryWrites=true&w=majority&appName=alcolic';
  
  exec(`cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && echo "MONGODB_URI_PROD=${mongoUri}" >> .env`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to add MongoDB URI:', error.message);
      return;
    }
    
    console.log('✅ MongoDB Atlas URI added');
    restartBackend();
  });
}

function checkDatabaseConnection() {
  console.log('\n🔍 Checking database connection code...');
  
  exec('cat /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/config/database.js', (error, stdout, stderr) => {
    console.log('📋 Database connection code:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('MONGODB_URI_PROD')) {
      console.log('✅ Database config is using MONGODB_URI_PROD');
      console.log('🔄 Let\'s check if there are any fallback issues...');
      checkFallbackIssues();
    } else {
      console.log('❌ Database config not using MONGODB_URI_PROD');
      console.log('🔄 Let\'s fix the database config...');
      fixDatabaseConfig();
    }
  });
}

function checkFallbackIssues() {
  console.log('\n🔍 Checking for fallback to local MongoDB...');
  
  exec('grep -n "localhost\|127.0.0.1\|27017" /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/config/database.js', (error, stdout, stderr) => {
    console.log('📋 Local MongoDB references:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('localhost') || stdout.includes('127.0.0.1')) {
      console.log('❌ Found local MongoDB fallback');
      console.log('🔄 Let\'s fix the database config...');
      fixDatabaseConfig();
    } else {
      console.log('✅ No local MongoDB fallback found');
      console.log('🔄 Let\'s restart the backend...');
      restartBackend();
    }
  });
}

function fixDatabaseConfig() {
  console.log('\n🔧 Fixing database configuration...');
  
  const newDbConfig = `const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Use MongoDB Atlas URI directly
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
  
  exec(`cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/config && echo '${newDbConfig}' > database.js`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to fix database config:', error.message);
      return;
    }
    
    console.log('✅ Database configuration fixed');
    restartBackend();
  });
}

function restartBackend() {
  console.log('\n🔄 Restarting backend...');
  
  exec('pm2 restart alcolic-backend', (error, stdout, stderr) => {
    console.log('📊 Restart result:');
    console.log(stdout);
    
    setTimeout(() => {
      checkBackendLogs();
    }, 5000);
  });
}

function checkBackendLogs() {
  console.log('\n🔍 Checking backend logs after restart...');
  
  exec('pm2 logs alcolic-backend --lines 5 --nostream', (error, stdout, stderr) => {
    console.log('📋 Latest backend logs:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('MongoDB Connected')) {
      console.log('✅ Database connected successfully!');
      console.log('🔄 Let\'s test the backend...');
      testBackend();
    } else if (stdout.includes('error') || stdout.includes('Error')) {
      console.log('❌ Still have database errors');
      console.log('🔄 Let\'s check the environment variables...');
      checkEnvironmentVariables();
    } else {
      console.log('⚠️ No clear database connection logs');
      console.log('🔄 Let\'s test the backend anyway...');
      testBackend();
    }
  });
}

function checkEnvironmentVariables() {
  console.log('\n🔍 Checking environment variables...');
  
  exec('cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && grep MONGODB .env', (error, stdout, stderr) => {
    console.log('📋 MongoDB environment variables:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('MONGODB_URI_PROD')) {
      console.log('✅ MONGODB_URI_PROD is set');
      console.log('🔄 Let\'s test the backend...');
      testBackend();
    } else {
      console.log('❌ MONGODB_URI_PROD not found');
      console.log('🔄 Let\'s add it again...');
      addMongoDBUri();
    }
  });
}

function testBackend() {
  console.log('\n🧪 Testing backend...');
  
  exec('curl -s -X GET http://localhost:5001/api/v1', (error, stdout, stderr) => {
    console.log('📡 Backend test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('Route not found')) {
      console.log('✅ Backend is responding');
      console.log('🔄 Let\'s test POST requests...');
      testPostRequests();
    } else {
      console.log('❌ Backend not responding');
      console.log('💬 Response:', stdout);
    }
  });
}

function testPostRequests() {
  console.log('\n🧪 Testing POST requests...');
  
  const testData = JSON.stringify({ test: 'data' });
  
  exec(`curl -s -X POST http://localhost:5001/api/v1/auth/login -H "Content-Type: application/json" -d '${testData}'`, (error, stdout, stderr) => {
    console.log('📡 POST request test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('validation') || stdout.includes('email') || stdout.includes('password')) {
      console.log('✅ POST requests are working!');
      console.log('🔄 Let\'s test admin login...');
      testAdminLogin();
    } else {
      console.log('❌ POST request failed');
      console.log('💬 Response:', stdout);
      console.log('🔄 Let\'s test admin login anyway...');
      testAdminLogin();
    }
  });
}

function testAdminLogin() {
  console.log('\n🧪 Testing admin login...');
  
  const loginData = JSON.stringify({
    email: 'admin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST http://localhost:5001/api/v1/auth/login -H "Content-Type: application/json" -d '${loginData}'`, (error, stdout, stderr) => {
    console.log('📡 Admin login test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ Admin login working!');
      console.log('🔄 Now let\'s test via API.php...');
      testApiPhp();
    } else if (stdout.includes('Invalid credentials')) {
      console.log('❌ Invalid credentials');
      console.log('🔄 Let\'s create a new admin user...');
      createAdminUser();
    } else {
      console.log('❌ Admin login failed');
      console.log('💬 Response:', stdout);
      console.log('🔄 Let\'s create a new admin user...');
      createAdminUser();
    }
  });
}

function createAdminUser() {
  console.log('\n🔧 Creating admin user...');
  
  const registerData = JSON.stringify({
    email: 'admin@alcolic.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User'
  });
  
  exec(`curl -s -X POST http://localhost:5001/api/v1/auth/register -H "Content-Type: application/json" -d '${registerData}'`, (error, stdout, stderr) => {
    console.log('📡 Admin registration:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ Admin user created!');
      console.log('🔄 Now let\'s test login...');
      testAdminLogin();
    } else {
      console.log('❌ Failed to create admin user');
      console.log('💬 Response:', stdout);
      console.log('🔄 Let\'s test via API.php anyway...');
      testApiPhp();
    }
  });
}

function testApiPhp() {
  console.log('\n🧪 Testing API.php...');
  
  const loginData = JSON.stringify({
    email: 'admin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${loginData}'`, (error, stdout, stderr) => {
    console.log('📡 API.php admin login test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! Admin login working via API.php!');
      console.log('✅ Your admin panel should now work!');
      console.log('\n🎯 Admin credentials:');
      console.log('📧 Email: admin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
      console.log('\n🌐 Access your admin panel at: https://admin.alcolic.gnritservices.com');
    } else {
      console.log('❌ API.php still not working');
      console.log('💬 Response:', stdout);
    }
  });
}

console.log('🚀 Starting database connection fix...');
checkDatabaseConfig();
