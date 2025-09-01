const { exec } = require('child_process');

console.log('🔧 Fixing backend POST request handling...');

// The backend is responding to GET requests but not POST requests
// Let's check the backend configuration and fix it

function checkBackendLogs() {
  console.log('\n🔍 Checking backend logs for POST request issues...');
  
  exec('pm2 logs alcolic-backend --lines 10 --nostream', (error, stdout, stderr) => {
    console.log('📋 Backend logs:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('error') || stdout.includes('Error')) {
      console.log('❌ Found errors in backend logs');
      console.log('🔄 Let\'s check the server.js configuration...');
      checkServerConfig();
    } else {
      console.log('✅ No errors in backend logs');
      console.log('🔄 Let\'s test POST requests directly...');
      testPostRequests();
    }
  });
}

function checkServerConfig() {
  console.log('\n🔍 Checking server.js configuration...');
  
  exec('grep -n -A 5 -B 5 "app.use.*json\|bodyParser\|express.json" /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js', (error, stdout, stderr) => {
    console.log('📋 JSON middleware configuration:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('express.json') || stdout.includes('bodyParser')) {
      console.log('✅ JSON middleware is configured');
      console.log('🔄 Let\'s test POST requests...');
      testPostRequests();
    } else {
      console.log('❌ JSON middleware not found');
      console.log('🔄 Let\'s add JSON middleware...');
      addJsonMiddleware();
    }
  });
}

function addJsonMiddleware() {
  console.log('\n🔧 Adding JSON middleware to server.js...');
  
  // Let's check where to add the middleware
  exec('grep -n "app.use" /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js | head -5', (error, stdout, stderr) => {
    console.log('📋 Current middleware setup:');
    console.log(stdout);
    
    // Add JSON middleware after the first app.use
    exec('sed -i \'/app.use/a\\app.use(express.json());\\napp.use(express.urlencoded({ extended: true }));\' /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Failed to add JSON middleware:', error.message);
        console.log('🔄 Let\'s try a different approach...');
        testPostRequests();
        return;
      }
      
      console.log('✅ JSON middleware added');
      restartBackend();
    });
  });
}

function testPostRequests() {
  console.log('\n🧪 Testing POST requests directly...');
  
  // Test a simple POST request
  const testData = JSON.stringify({ test: 'data' });
  
  exec(`curl -s -X POST http://localhost:5001/api/v1/auth/login -H "Content-Type: application/json" -d '${testData}'`, (error, stdout, stderr) => {
    console.log('📡 POST request test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('validation') || stdout.includes('email') || stdout.includes('password')) {
      console.log('✅ POST requests are working!');
      console.log('🔄 The backend is expecting proper data');
      testAdminLogin();
    } else if (stdout.includes('Route not found')) {
      console.log('❌ Route not found for POST');
      console.log('🔄 Let\'s check the auth routes...');
      checkAuthRoutes();
    } else {
      console.log('❌ POST request failed');
      console.log('💬 Response:', stdout);
      console.log('🔄 Let\'s check the auth routes...');
      checkAuthRoutes();
    }
  });
}

function checkAuthRoutes() {
  console.log('\n🔍 Checking auth routes...');
  
  exec('grep -n -A 3 -B 3 "router.post.*login\|app.post.*login" /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js', (error, stdout, stderr) => {
    console.log('📋 Auth routes configuration:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('router.post') || stdout.includes('app.post')) {
      console.log('✅ Auth routes are configured');
      console.log('🔄 Let\'s check if routes are properly mounted...');
      checkRouteMounting();
    } else {
      console.log('❌ Auth routes not found in server.js');
      console.log('🔄 Let\'s check the routes directory...');
      checkRoutesDirectory();
    }
  });
}

function checkRouteMounting() {
  console.log('\n🔍 Checking route mounting...');
  
  exec('grep -n -A 2 -B 2 "app.use.*auth\|app.use.*api" /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js', (error, stdout, stderr) => {
    console.log('📋 Route mounting:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('app.use') && (stdout.includes('auth') || stdout.includes('api'))) {
      console.log('✅ Routes are mounted');
      console.log('🔄 Let\'s test admin login...');
      testAdminLogin();
    } else {
      console.log('❌ Routes not properly mounted');
      console.log('🔄 Let\'s check the routes directory...');
      checkRoutesDirectory();
    }
  });
}

function checkRoutesDirectory() {
  console.log('\n🔍 Checking routes directory...');
  
  exec('ls -la /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/', (error, stdout, stderr) => {
    console.log('📋 Routes directory:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('auth.js')) {
      console.log('✅ Auth routes file exists');
      console.log('🔄 Let\'s check the auth routes file...');
      checkAuthRoutesFile();
    } else {
      console.log('❌ Auth routes file not found');
      console.log('🔄 Let\'s check what routes exist...');
      listAllRoutes();
    }
  });
}

function checkAuthRoutesFile() {
  console.log('\n🔍 Checking auth routes file...');
  
  exec('head -20 /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/auth.js', (error, stdout, stderr) => {
    console.log('📋 Auth routes file:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('router.post') || stdout.includes('router.get')) {
      console.log('✅ Auth routes file has routes');
      console.log('🔄 Let\'s check if it\'s properly exported...');
      checkAuthExport();
    } else {
      console.log('❌ Auth routes file is empty or malformed');
      console.log('🔄 Let\'s check the end of the file...');
      checkAuthFileEnd();
    }
  });
}

function checkAuthExport() {
  console.log('\n🔍 Checking auth routes export...');
  
  exec('tail -5 /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/auth.js', (error, stdout, stderr) => {
    console.log('📋 Auth routes export:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('module.exports') || stdout.includes('export')) {
      console.log('✅ Auth routes are exported');
      console.log('🔄 Let\'s test admin login...');
      testAdminLogin();
    } else {
      console.log('❌ Auth routes not exported');
      console.log('🔄 Let\'s fix the auth routes file...');
      fixAuthRoutes();
    }
  });
}

function checkAuthFileEnd() {
  console.log('\n🔍 Checking end of auth routes file...');
  
  exec('tail -10 /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/auth.js', (error, stdout, stderr) => {
    console.log('📋 End of auth routes file:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('module.exports')) {
      console.log('✅ Auth routes are exported');
      console.log('🔄 Let\'s test admin login...');
      testAdminLogin();
    } else {
      console.log('❌ Auth routes not exported');
      console.log('🔄 Let\'s fix the auth routes file...');
      fixAuthRoutes();
    }
  });
}

function listAllRoutes() {
  console.log('\n🔍 Listing all routes...');
  
  exec('find /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/ -name "*.js" -exec grep -l "router.post\|router.get" {} \\;', (error, stdout, stderr) => {
    console.log('📋 Available route files:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('auth.js')) {
      console.log('✅ Auth routes file found');
      console.log('🔄 Let\'s check the auth routes file...');
      checkAuthRoutesFile();
    } else {
      console.log('❌ No auth routes found');
      console.log('🔄 Let\'s create auth routes...');
      createAuthRoutes();
    }
  });
}

function fixAuthRoutes() {
  console.log('\n🔧 Fixing auth routes file...');
  
  // Let's check the current content and fix it
  exec('cat /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/auth.js', (error, stdout, stderr) => {
    console.log('📋 Current auth routes content:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('router.post') && !stdout.includes('module.exports')) {
      console.log('🔄 Adding module.exports to auth routes...');
      exec('echo "module.exports = router;" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/auth.js', (error, stdout, stderr) => {
        console.log('✅ Module exports added');
        restartBackend();
      });
    } else {
      console.log('🔄 Let\'s test admin login...');
      testAdminLogin();
    }
  });
}

function createAuthRoutes() {
  console.log('\n🔧 Creating auth routes...');
  
  const authRoutes = `const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    user = new User({
      email,
      password: hashedPassword,
      role: role || 'customer',
      name: name || 'User'
    });
    
    await user.save();
    
    // Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
    
    res.json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Check role if specified
    if (role && user.role !== role) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    
    // Create token
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
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;`;
  
  exec(`cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes && echo '${authRoutes}' > auth.js`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create auth routes:', error.message);
      return;
    }
    
    console.log('✅ Auth routes created');
    restartBackend();
  });
}

function restartBackend() {
  console.log('\n🔄 Restarting backend...');
  
  exec('pm2 restart alcolic-backend', (error, stdout, stderr) => {
    console.log('📊 Restart result:');
    console.log(stdout);
    
    setTimeout(() => {
      testAdminLogin();
    }, 5000);
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

console.log('🚀 Starting backend POST fix...');
checkBackendLogs();
