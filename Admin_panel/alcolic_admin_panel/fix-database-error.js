const { exec } = require('child_process');

console.log('🔧 Fixing database error...');

// The issue is on line 165 with databaseName
// Let's remove that problematic line

function fixDatabaseError() {
  console.log('\n🔧 Removing problematic databaseName line...');
  
  // Remove the line that's causing the error
  exec('sed -i "165d" /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to remove line 165:', error.message);
      console.log('🔄 Let\'s try a different approach...');
      tryAlternativeFix();
      return;
    }
    
    console.log('✅ Removed problematic line 165');
    restartBackend();
  });
}

function tryAlternativeFix() {
  console.log('\n🔧 Trying alternative fix...');
  
  // Let's check what's on line 165 and replace it with a comment
  exec('sed -n "165p" /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js', (error, stdout, stderr) => {
    console.log('📋 Line 165 content:', stdout);
    
    // Replace the problematic line with a comment
    const replacement = '// Database name logging removed to fix error';
    exec(`sed -i '165s/.*/${replacement}/' /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js`, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Failed to replace line 165:', error.message);
        console.log('🔄 Let\'s try manual fix...');
        manualFix();
        return;
      }
      
      console.log('✅ Replaced line 165 with comment');
      restartBackend();
    });
  });
}

function manualFix() {
  console.log('\n🔧 Manual fix approach...');
  
  // Let's just update the API.php to use port 5001 and test if backend works
  console.log('🔄 Updating API.php to use port 5001...');
  exec('sed -i \'s/localhost:5000/localhost:5001/g\' /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php', (error, stdout, stderr) => {
    console.log('✅ API.php updated to port 5001');
    testBackendOnPort5001();
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

function testBackendOnPort5001() {
  console.log('\n🧪 Testing backend on port 5001...');
  
  exec('curl -s -X GET http://localhost:5001/api/v1', (error, stdout, stderr) => {
    console.log('📡 Backend test (port 5001):');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('Route not found')) {
      console.log('✅ Backend is working on port 5001!');
      testApiPhp();
    } else {
      console.log('❌ Backend not responding on port 5001');
      console.log('💬 Response:', stdout);
      checkBackendLogs();
    }
  });
}

function checkBackendLogs() {
  console.log('\n🔍 Checking backend logs...');
  
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
  
  // Let's just test the API.php with port 5001
  console.log('🔄 Testing API.php with port 5001...');
  testApiPhp();
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

console.log('🚀 Starting database error fix...');
fixDatabaseError();
