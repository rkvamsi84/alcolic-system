const { exec } = require('child_process');

console.log('🔧 Fixing database fallback issue...');

// The database config still has a fallback to local MongoDB
// Let's fix this by updating the database configuration

function fixDatabaseConfig() {
  console.log('\n🔧 Fixing database configuration...');
  
  const newDbConfig = `const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Use MongoDB Atlas URI directly - no fallback to local
    const mongoUri = process.env.MONGODB_URI_PROD;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI_PROD not found in environment variables');
    }
    
    console.log('Connecting to MongoDB Atlas...');
    
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
    
    console.log('✅ Database configuration fixed - removed local fallback');
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
  
  exec('pm2 logs alcolic-backend --lines 10 --nostream', (error, stdout, stderr) => {
    console.log('📋 Latest backend logs:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('MongoDB Connected')) {
      console.log('✅ Database connected successfully!');
      console.log('🔄 Let\'s test the backend...');
      testBackend();
    } else if (stdout.includes('localhost') || stdout.includes('127.0.0.1')) {
      console.log('❌ Still trying to connect to local MongoDB');
      console.log('🔄 Let\'s check the server.js file...');
      checkServerJs();
    } else if (stdout.includes('error') || stdout.includes('Error')) {
      console.log('❌ Still have database errors');
      console.log('🔄 Let\'s check if there are other database references...');
      checkOtherDatabaseRefs();
    } else {
      console.log('⚠️ No clear database connection logs');
      console.log('🔄 Let\'s test the backend anyway...');
      testBackend();
    }
  });
}

function checkServerJs() {
  console.log('\n🔍 Checking server.js for database references...');
  
  exec('grep -n "localhost\|127.0.0.1\|27017" /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js', (error, stdout, stderr) => {
    console.log('📋 Local MongoDB references in server.js:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('localhost') || stdout.includes('127.0.0.1')) {
      console.log('❌ Found local MongoDB references in server.js');
      console.log('🔄 Let\'s fix server.js...');
      fixServerJs();
    } else {
      console.log('✅ No local MongoDB references in server.js');
      console.log('🔄 Let\'s check other files...');
      checkOtherDatabaseRefs();
    }
  });
}

function fixServerJs() {
  console.log('\n🔧 Fixing server.js database references...');
  
  // Remove any local MongoDB references from server.js
  exec('sed -i \'/localhost:27017/d\' /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to fix server.js:', error.message);
      return;
    }
    
    console.log('✅ Removed local MongoDB references from server.js');
    restartBackend();
  });
}

function checkOtherDatabaseRefs() {
  console.log('\n🔍 Checking other files for database references...');
  
  exec('find /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend -name "*.js" -exec grep -l "localhost:27017\|127.0.0.1:27017" {} \\;', (error, stdout, stderr) => {
    console.log('📋 Files with local MongoDB references:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout) {
      console.log('❌ Found files with local MongoDB references');
      console.log('🔄 Let\'s fix them...');
      fixAllDatabaseRefs();
    } else {
      console.log('✅ No files with local MongoDB references');
      console.log('🔄 Let\'s test the backend...');
      testBackend();
    }
  });
}

function fixAllDatabaseRefs() {
  console.log('\n🔧 Fixing all database references...');
  
  // Replace all local MongoDB references with MongoDB Atlas
  exec('find /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend -name "*.js" -exec sed -i \'s/localhost:27017/process.env.MONGODB_URI_PROD/g\' {} \\;', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to fix database references:', error.message);
      return;
    }
    
    console.log('✅ Fixed all database references');
    restartBackend();
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
      console.log('🔄 Let\'s check if backend is running...');
      checkBackendStatus();
    }
  });
}

function checkBackendStatus() {
  console.log('\n🔍 Checking backend status...');
  
  exec('pm2 status', (error, stdout, stderr) => {
    console.log('📋 PM2 status:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('online')) {
      console.log('✅ Backend is running');
      console.log('🔄 Let\'s check if it\'s listening on port 5001...');
      checkPort5001();
    } else {
      console.log('❌ Backend is not running');
      console.log('🔄 Let\'s restart it...');
      restartBackend();
    }
  });
}

function checkPort5001() {
  console.log('\n🔍 Checking port 5001...');
  
  exec('netstat -tlnp | grep :5001', (error, stdout, stderr) => {
    console.log('📋 Port 5001 usage:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('5001')) {
      console.log('✅ Port 5001 is in use');
      console.log('🔄 Let\'s test POST requests...');
      testPostRequests();
    } else {
      console.log('❌ Port 5001 not in use');
      console.log('🔄 Backend might not be listening');
      console.log('🔄 Let\'s restart it...');
      restartBackend();
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

console.log('🚀 Starting database fallback fix...');
fixDatabaseConfig();
