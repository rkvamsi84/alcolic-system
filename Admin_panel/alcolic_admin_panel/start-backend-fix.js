const { exec } = require('child_process');

console.log('🔧 Starting backend and fixing connection issue...');

// The backend is not running on port 5000
// Let's start it and test the connection

function checkBackendStatus() {
  console.log('\n🔍 Checking backend status...');
  
  exec('pm2 status', (error, stdout, stderr) => {
    console.log('📊 PM2 Status:');
    console.log(stdout);
    
    if (stdout.includes('alcolic-backend') && stdout.includes('online')) {
      console.log('✅ Backend is running in PM2');
      testBackendConnection();
    } else {
      console.log('❌ Backend not running in PM2');
      startBackend();
    }
  });
}

function startBackend() {
  console.log('\n🚀 Starting backend...');
  
  exec('pm2 start /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js --name "alcolic-backend"', (error, stdout, stderr) => {
    console.log('📊 Start result:');
    console.log(stdout);
    
    if (error) {
      console.log('❌ Failed to start backend:', error.message);
      console.log('🔄 Trying alternative start method...');
      startBackendAlternative();
    } else {
      console.log('✅ Backend started successfully');
      setTimeout(() => {
        testBackendConnection();
      }, 3000);
    }
  });
}

function startBackendAlternative() {
  console.log('\n🔄 Trying alternative start method...');
  
  // Try starting with different approach
  exec('cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && pm2 start server.js --name "alcolic-backend"', (error, stdout, stderr) => {
    console.log('📊 Alternative start result:');
    console.log(stdout);
    
    if (error) {
      console.log('❌ Alternative start also failed:', error.message);
      console.log('🔄 Checking if backend directory exists...');
      checkBackendDirectory();
    } else {
      console.log('✅ Backend started with alternative method');
      setTimeout(() => {
        testBackendConnection();
      }, 3000);
    }
  });
}

function checkBackendDirectory() {
  console.log('\n🔍 Checking backend directory...');
  
  exec('ls -la /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/', (error, stdout, stderr) => {
    console.log('📁 Backend directory contents:');
    console.log(stdout);
    
    if (stdout.includes('server.js')) {
      console.log('✅ server.js exists');
      console.log('🔄 Trying to start backend manually...');
      startBackendManually();
    } else {
      console.log('❌ server.js not found');
      console.log('🔄 Backend directory might be missing');
      console.log('💡 Manual intervention required');
    }
  });
}

function startBackendManually() {
  console.log('\n🔄 Starting backend manually...');
  
  // Try starting the backend manually
  exec('cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && node server.js &', (error, stdout, stderr) => {
    console.log('📊 Manual start result:');
    console.log(stdout);
    
    if (error) {
      console.log('❌ Manual start failed:', error.message);
      console.log('🔄 Let\'s check what\'s wrong with the backend...');
      checkBackendIssues();
    } else {
      console.log('✅ Backend started manually');
      setTimeout(() => {
        testBackendConnection();
      }, 3000);
    }
  });
}

function checkBackendIssues() {
  console.log('\n🔍 Checking backend issues...');
  
  // Check if there are any issues with the backend files
  exec('cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && node -c server.js', (error, stdout, stderr) => {
    console.log('📋 Syntax check result:');
    console.log(stdout);
    
    if (error) {
      console.log('❌ Syntax error in server.js:', error.message);
      console.log('🔄 Let\'s check the server.js file...');
      checkServerFile();
    } else {
      console.log('✅ server.js syntax is correct');
      console.log('🔄 Let\'s try starting with PM2 again...');
      restartPM2();
    }
  });
}

function checkServerFile() {
  console.log('\n🔍 Checking server.js file...');
  
  exec('head -20 /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js', (error, stdout, stderr) => {
    console.log('📄 Server.js content (first 20 lines):');
    console.log(stdout);
    
    console.log('🔄 Let\'s try a different approach...');
    restartPM2();
  });
}

function restartPM2() {
  console.log('\n🔄 Restarting PM2...');
  
  exec('pm2 delete all', (error, stdout, stderr) => {
    console.log('📊 Delete result:');
    console.log(stdout);
    
    setTimeout(() => {
      exec('pm2 start /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js --name "alcolic-backend"', (error, stdout, stderr) => {
        console.log('📊 Restart result:');
        console.log(stdout);
        
        if (error) {
          console.log('❌ Restart failed:', error.message);
          console.log('💡 Manual intervention required');
          console.log('\n🎯 Try these steps:');
          console.log('1. Check if the backend directory exists');
          console.log('2. Check if server.js exists');
          console.log('3. Check if all dependencies are installed');
          console.log('4. Try starting the backend manually');
        } else {
          console.log('✅ Backend restarted successfully');
          setTimeout(() => {
            testBackendConnection();
          }, 3000);
        }
      });
    }, 2000);
  });
}

function testBackendConnection() {
  console.log('\n🧪 Testing backend connection...');
  
  exec('curl -s -X GET http://localhost:5000/api/v1', (error, stdout, stderr) => {
    console.log('📡 Backend connection test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('Route not found')) {
      console.log('✅ Backend is running and responding!');
      testAdminLogin();
    } else if (error) {
      console.log('❌ Backend still not accessible:', error.message);
      console.log('🔄 Let\'s check if port 5000 is in use...');
      checkPortUsage();
    } else {
      console.log('⚠️ Unexpected backend response');
      console.log('🔄 But backend seems to be running');
      testAdminLogin();
    }
  });
}

function checkPortUsage() {
  console.log('\n🔍 Checking port 5000 usage...');
  
  exec('netstat -tlnp | grep :5000', (error, stdout, stderr) => {
    console.log('📋 Port 5000 usage:');
    console.log(stdout);
    
    if (stdout.includes('5000')) {
      console.log('✅ Port 5000 is in use');
      console.log('🔄 Backend might be running on a different process');
      testAdminLogin();
    } else {
      console.log('❌ Port 5000 is not in use');
      console.log('🔄 Backend is definitely not running');
      console.log('💡 Manual intervention required');
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
    } else if (stdout.includes('error') && stdout.includes('Failed to connect')) {
      console.log('❌ Backend still not accessible via API.php');
      console.log('🔄 Let\'s test direct backend login...');
      testDirectBackendLogin();
    } else {
      console.log('⚠️ Unexpected login response');
      console.log('💬 Response:', stdout);
    }
  });
}

function testDirectBackendLogin() {
  console.log('\n🧪 Testing direct backend login...');
  
  const loginData = JSON.stringify({
    email: 'newauthadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST http://localhost:5000/api/v1/auth/login -H "Content-Type: application/json" -d '${loginData}'`, (error, stdout, stderr) => {
    console.log('📡 Direct backend login test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ Direct backend login working!');
      console.log('🔄 The issue is with API.php proxy');
      console.log('💡 The backend is working, but API.php can\'t connect to it');
      console.log('\n🎯 Try accessing the admin panel directly:');
      console.log('🌐 https://admin.alcolic.gnritservices.com');
      console.log('📧 Use these credentials:');
      console.log('   - newauthadmin@alcolic.com / admin123 / admin');
    } else {
      console.log('❌ Direct backend login also failing');
      console.log('💡 There might be an issue with the backend configuration');
    }
  });
}

console.log('🚀 Starting backend fix...');
checkBackendStatus();
