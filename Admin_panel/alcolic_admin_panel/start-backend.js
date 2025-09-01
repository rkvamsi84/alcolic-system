const { exec } = require('child_process');

console.log('🚀 Starting backend server...');

// Check if backend directory exists
const backendPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend';

console.log('📁 Checking backend directory...');
exec(`ls -la ${backendPath}`, (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Backend directory not found:', error.message);
    return;
  }
  
  console.log('✅ Backend directory exists');
  console.log('📋 Directory contents:');
  console.log(stdout);
  
  // Check if server.js exists
  exec(`ls -la ${backendPath}/server.js`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ server.js not found:', error.message);
      return;
    }
    
    console.log('✅ server.js found');
    
    // Check if package.json exists
    exec(`ls -la ${backendPath}/package.json`, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ package.json not found:', error.message);
        return;
      }
      
      console.log('✅ package.json found');
      
      // Install dependencies if node_modules doesn't exist
      exec(`ls -la ${backendPath}/node_modules`, (error, stdout, stderr) => {
        if (error) {
          console.log('📦 Installing dependencies...');
          installDependencies();
        } else {
          console.log('✅ Dependencies already installed');
          startServer();
        }
      });
    });
  });
});

function installDependencies() {
  console.log('📦 Running npm install...');
  
  exec(`cd ${backendPath} && npm install`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to install dependencies:', error.message);
      return;
    }
    
    console.log('✅ Dependencies installed successfully');
    console.log(stdout);
    
    startServer();
  });
}

function startServer() {
  console.log('🚀 Starting backend server with PM2...');
  
  exec(`cd ${backendPath} && pm2 start server.js --name "alcolic-backend"`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to start server:', error.message);
      console.log('stderr:', stderr);
      return;
    }
    
    console.log('✅ Backend server started successfully');
    console.log(stdout);
    
    // Wait a moment and check status
    setTimeout(() => {
      checkServerStatus();
    }, 3000);
  });
}

function checkServerStatus() {
  console.log('\n📊 Checking server status...');
  
  exec('pm2 status', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ PM2 status error:', error.message);
      return;
    }
    
    console.log('📋 PM2 Status:');
    console.log(stdout);
    
    if (stdout.includes('alcolic-backend') && stdout.includes('online')) {
      console.log('✅ Backend is running successfully!');
      
      // Test the connection
      testConnection();
    } else {
      console.log('❌ Backend is not running properly');
      console.log('🔄 Checking logs...');
      checkLogs();
    }
  });
}

function testConnection() {
  console.log('\n🧪 Testing backend connection...');
  
  exec('curl -s http://localhost:5000/api/v1/auth/login -X POST -H "Content-Type: application/json" -d \'{"email":"test","password":"test","role":"admin"}\' || echo "Connection failed"', (error, stdout, stderr) => {
    console.log('📡 Connection test result:');
    console.log(stdout);
    
    if (stdout.includes('Connection failed') || stdout.includes('curl: (7)')) {
      console.log('❌ Backend not responding');
      checkLogs();
    } else {
      console.log('✅ Backend is responding!');
      console.log('🎉 Backend is ready for admin user creation');
      console.log('\n🎯 Next steps:');
      console.log('1. Run: node create-admin-user.js');
      console.log('2. Test admin login');
      console.log('3. Check admin panel');
    }
  });
}

function checkLogs() {
  console.log('\n📋 Checking PM2 logs...');
  
  exec('pm2 logs alcolic-backend --lines 20', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to get logs:', error.message);
      return;
    }
    
    console.log('📄 Recent logs:');
    console.log(stdout);
  });
}

console.log('🚀 Starting backend setup...');
