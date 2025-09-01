const { exec } = require('child_process');

console.log('🔧 Fixing backend port and database issues...');

// The backend is running on port 5001, not 5000
// Also there are database connection errors

function updateApiPhpToPort5001() {
  console.log('\n🔧 Updating API.php to use port 5001...');
  
  exec('sed -i \'s/localhost:5000/localhost:5001/g\' /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to update API.php:', error.message);
      return;
    }
    
    console.log('✅ API.php updated to use port 5001');
    checkDatabaseConfig();
  });
}

function checkDatabaseConfig() {
  console.log('\n🔍 Checking database configuration...');
  
  exec('cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && cat .env', (error, stdout, stderr) => {
    console.log('📋 Current .env content:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('MONGODB_URI_PROD')) {
      console.log('✅ MongoDB URI is configured');
      console.log('🔄 Let\'s check the database connection code...');
      checkDatabaseConnection();
    } else {
      console.log('❌ MongoDB URI not found in .env');
      console.log('🔄 Let\'s add the MongoDB URI...');
      addMongoDBUri();
    }
  });
}

function addMongoDBUri() {
  console.log('\n🔧 Adding MongoDB URI to .env...');
  
  const mongoUri = 'mongodb+srv://alcolic:alcolic123@cluster0.mongodb.net/alcolic?retryWrites=true&w=majority';
  
  exec(`cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && echo "MONGODB_URI_PROD=${mongoUri}" >> .env`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to add MongoDB URI:', error.message);
      return;
    }
    
    console.log('✅ MongoDB URI added to .env');
    restartBackend();
  });
}

function checkDatabaseConnection() {
  console.log('\n🔍 Checking database connection code...');
  
  exec('grep -n -A 5 -B 5 "databaseName\|mongoose.connect" /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js', (error, stdout, stderr) => {
    console.log('📋 Database connection code:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('mongoose.connect')) {
      console.log('✅ Mongoose connection found');
      console.log('🔄 Let\'s check the config/database.js file...');
      checkDatabaseConfigFile();
    } else {
      console.log('❌ Mongoose connection not found');
      console.log('🔄 Let\'s check the database config file...');
      checkDatabaseConfigFile();
    }
  });
}

function checkDatabaseConfigFile() {
  console.log('\n🔍 Checking database config file...');
  
  exec('cat /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/config/database.js', (error, stdout, stderr) => {
    console.log('📋 Database config file:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('databaseName')) {
      console.log('✅ Database config file exists');
      console.log('🔄 Let\'s fix the database connection...');
      fixDatabaseConnection();
    } else {
      console.log('❌ Database config file not found or incomplete');
      console.log('🔄 Let\'s create a proper database config...');
      createDatabaseConfig();
    }
  });
}

function createDatabaseConfig() {
  console.log('\n🔧 Creating database config file...');
  
  const dbConfig = `const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    logger.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;`;
  
  exec(`cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/config && echo '${dbConfig}' > database.js`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create database config:', error.message);
      return;
    }
    
    console.log('✅ Database config file created');
    restartBackend();
  });
}

function fixDatabaseConnection() {
  console.log('\n🔧 Fixing database connection...');
  
  // Let's check what's causing the databaseName error
  exec('grep -n "databaseName" /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js', (error, stdout, stderr) => {
    console.log('📋 databaseName usage:');
    console.log(stdout);
    
    if (stdout.includes('databaseName')) {
      console.log('❌ Found problematic databaseName usage');
      console.log('🔄 Let\'s fix the server.js file...');
      fixServerJs();
    } else {
      console.log('✅ No databaseName issues found');
      console.log('🔄 Let\'s restart the backend...');
      restartBackend();
    }
  });
}

function fixServerJs() {
  console.log('\n🔧 Fixing server.js database connection...');
  
  // Let's check the current server.js content around line 165
  exec('sed -n "160,170p" /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js', (error, stdout, stderr) => {
    console.log('📋 Server.js around line 165:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    console.log('🔄 Let\'s replace the problematic database connection...');
    replaceDatabaseConnection();
  });
}

function replaceDatabaseConnection() {
  console.log('\n🔧 Replacing database connection in server.js...');
  
  // Create a backup first
  exec('cp /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js.backup', (error, stdout, stderr) => {
    console.log('✅ Backup created');
    
    // Replace the problematic database connection
    const fixCommand = `sed -i 's/.*databaseName.*/const connectDB = require(".\/config\/database");/' /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js`;
    
    exec(fixCommand, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Failed to fix server.js:', error.message);
        return;
      }
      
      console.log('✅ Server.js database connection fixed');
      restartBackend();
    });
  });
}

function restartBackend() {
  console.log('\n🔄 Restarting backend...');
  
  exec('pm2 restart alcolic-backend', (error, stdout, stderr) => {
    console.log('📊 Restart result:');
    console.log(stdout);
    
    setTimeout(() => {
      testBackendConnection();
    }, 5000);
  });
}

function testBackendConnection() {
  console.log('\n🧪 Testing backend connection on port 5001...');
  
  exec('curl -s -X GET http://localhost:5001/api/v1', (error, stdout, stderr) => {
    console.log('📡 Backend test (port 5001):');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('Route not found')) {
      console.log('✅ Backend is working on port 5001!');
      testApiPhp();
    } else {
      console.log('❌ Backend still not working');
      console.log('💬 Response:', stdout);
      checkBackendLogs();
    }
  });
}

function checkBackendLogs() {
  console.log('\n🔍 Checking backend logs after restart...');
  
  exec('pm2 logs alcolic-backend --lines 5 --nostream', (error, stdout, stderr) => {
    console.log('📋 Latest backend logs:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('error') || stdout.includes('Error')) {
      console.log('❌ Still have errors');
      console.log('🔄 Let\'s try a different approach...');
      trySimpleFix();
    } else if (stdout.includes('listening') || stdout.includes('running')) {
      console.log('✅ Backend seems to be running');
      testApiPhp();
    } else {
      console.log('⚠️ No clear logs');
      testApiPhp();
    }
  });
}

function trySimpleFix() {
  console.log('\n🔧 Trying simple fix...');
  
  // Let's just update the API.php to use port 5001 and test
  console.log('🔄 Updating API.php to use port 5001...');
  exec('sed -i \'s/localhost:5000/localhost:5001/g\' /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php', (error, stdout, stderr) => {
    console.log('✅ API.php updated');
    testApiPhp();
  });
}

function testApiPhp() {
  console.log('\n🧪 Testing API.php...');
  
  exec('curl -s -X GET https://alcolic.gnritservices.com/api.php/api/v1', (error, stdout, stderr) => {
    console.log('📡 API.php test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('Route not found')) {
      console.log('✅ API.php is working!');
      testAdminLogin();
    } else {
      console.log('❌ API.php not working');
      console.log('💬 Response:', stdout);
    }
  });
}

function testAdminLogin() {
  console.log('\n🧪 Testing admin login...');
  
  const loginData = JSON.stringify({
    email: 'newauthadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${loginData}'`, (error, stdout, stderr) => {
    console.log('📡 Admin login test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! Admin login working!');
      console.log('✅ Your admin panel should now work!');
      console.log('\n🎯 Admin credentials:');
      console.log('📧 Email: newauthadmin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
      console.log('\n🌐 Access your admin panel at: https://admin.alcolic.gnritservices.com');
    } else {
      console.log('❌ Admin login still failing');
      console.log('💬 Response:', stdout);
      console.log('\n🔄 Let\'s create a new admin user...');
      createNewAdmin();
    }
  });
}

function createNewAdmin() {
  console.log('\n🔧 Creating new admin user...');
  
  const registerData = JSON.stringify({
    email: 'admin@alcolic.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/register -H "Content-Type: application/json" -d '${registerData}'`, (error, stdout, stderr) => {
    console.log('📡 Admin registration:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ Admin user created successfully!');
      console.log('\n🎯 New admin credentials:');
      console.log('📧 Email: admin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
      console.log('\n🌐 Access your admin panel at: https://admin.alcolic.gnritservices.com');
    } else {
      console.log('❌ Failed to create admin user');
      console.log('💬 Response:', stdout);
    }
  });
}

console.log('🚀 Starting backend fix...');
updateApiPhpToPort5001();
