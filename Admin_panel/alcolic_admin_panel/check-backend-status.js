const { exec } = require('child_process');

console.log('🔍 Checking backend server status...');

// Check PM2 status
exec('pm2 status', (error, stdout, stderr) => {
  console.log('📊 PM2 Status:');
  console.log(stdout);
  
  if (error) {
    console.log('❌ PM2 error:', error.message);
  }
  
  // Check if backend is running
  if (stdout.includes('alcolic-backend') && stdout.includes('online')) {
    console.log('✅ Backend is running in PM2');
    
    // Check what port it's using
    checkBackendPort();
    
  } else {
    console.log('❌ Backend is not running in PM2');
    console.log('🔄 Starting backend...');
    startBackend();
  }
});

function checkBackendPort() {
  console.log('\n🔍 Checking backend port...');
  
  // Check if port 5000 is in use
  exec('netstat -tlnp 2>/dev/null | grep :5000 || echo "Port 5000 not found"', (error, stdout, stderr) => {
    console.log('📡 Port 5000 status:');
    console.log(stdout);
    
    if (stdout.includes('5000')) {
      console.log('✅ Port 5000 is in use');
      testBackendConnection();
    } else {
      console.log('❌ Port 5000 is not in use');
      console.log('🔄 Restarting backend on correct port...');
      restartBackend();
    }
  });
}

function testBackendConnection() {
  console.log('\n🧪 Testing backend connection...');
  
  // Test localhost:5000
  exec('curl -s http://localhost:5000/api/v1/auth/login -X POST -H "Content-Type: application/json" -d \'{"email":"test","password":"test","role":"admin"}\' || echo "Connection failed"', (error, stdout, stderr) => {
    console.log('📡 Backend connection test:');
    console.log(stdout);
    
    if (stdout.includes('Connection failed') || stdout.includes('curl: (7)')) {
      console.log('❌ Backend not responding on localhost:5000');
      restartBackend();
    } else {
      console.log('✅ Backend is responding');
      console.log('🎯 The issue might be with the PHP proxy (api.php)');
      checkApiPhp();
    }
  });
}

function checkApiPhp() {
  console.log('\n🔍 Checking api.php configuration...');
  
  const apiPhpPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php';
  
  exec(`cat ${apiPhpPath} | head -20`, (error, stdout, stderr) => {
    console.log('📄 api.php first 20 lines:');
    console.log(stdout);
    
    if (stdout.includes('localhost:5000')) {
      console.log('✅ api.php is configured for localhost:5000');
      console.log('🎯 Backend should be working. Try the admin creation again.');
    } else {
      console.log('❌ api.php might have wrong backend URL');
      console.log('🔄 Need to check api.php configuration');
    }
  });
}

function startBackend() {
  console.log('\n🚀 Starting backend server...');
  
  const backendPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend';
  
  // Check if backend directory exists
  exec(`ls -la ${backendPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Backend directory not found:', error.message);
      return;
    }
    
    console.log('📁 Backend directory exists');
    
    // Start backend with PM2
    exec(`cd ${backendPath} && pm2 start server.js --name "alcolic-backend"`, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Failed to start backend:', error.message);
        return;
      }
      
      console.log('✅ Backend started successfully');
      console.log(stdout);
      
      // Wait a moment and check status
      setTimeout(() => {
        exec('pm2 status', (error, stdout, stderr) => {
          console.log('\n📊 Updated PM2 Status:');
          console.log(stdout);
        });
      }, 2000);
    });
  });
}

function restartBackend() {
  console.log('\n🔄 Restarting backend server...');
  
  exec('pm2 restart alcolic-backend', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to restart backend:', error.message);
      return;
    }
    
    console.log('✅ Backend restarted successfully');
    console.log(stdout);
    
    // Wait a moment and test connection
    setTimeout(() => {
      testBackendConnection();
    }, 3000);
  });
}

console.log('🚀 Starting backend status check...');
