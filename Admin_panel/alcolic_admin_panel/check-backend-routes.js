const { exec } = require('child_process');

console.log('🔍 Checking backend routes...');

// Check if backend routes are properly set up
function checkBackendRoutes() {
  console.log('🔍 Checking backend route files...');
  
  const backendPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend';
  
  // Check if routes directory exists
  exec(`ls -la ${backendPath}/routes/`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Routes directory not found:', error.message);
      return;
    }
    
    console.log('✅ Routes directory found');
    console.log('📋 Routes files:');
    console.log(stdout);
    
    // Check if auth.js exists
    checkAuthRoute();
  });
}

function checkAuthRoute() {
  console.log('\n🔍 Checking auth route...');
  
  const authPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/auth.js';
  
  exec(`ls -la ${authPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ auth.js not found:', error.message);
      return;
    }
    
    console.log('✅ auth.js found');
    console.log('📋 Auth file info:');
    console.log(stdout);
    
    // Check auth route content
    checkAuthContent();
  });
}

function checkAuthContent() {
  console.log('\n🔍 Checking auth route content...');
  
  const authPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/auth.js';
  
  exec(`head -50 ${authPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Could not read auth.js:', error.message);
      return;
    }
    
    console.log('📄 Auth route content (first 50 lines):');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    // Check if login route exists
    checkLoginRoute();
  });
}

function checkLoginRoute() {
  console.log('\n🔍 Checking for login route...');
  
  const authPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/auth.js';
  
  exec(`grep -n "router.post.*login" ${authPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Login route not found in auth.js');
      console.log('🔄 Checking server.js route setup...');
      checkServerRoutes();
    } else {
      console.log('✅ Login route found:');
      console.log(stdout);
      
      // Test direct backend connection
      testDirectBackend();
    }
  });
}

function checkServerRoutes() {
  console.log('\n🔍 Checking server.js route setup...');
  
  const serverPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js';
  
  exec(`grep -n "app.use.*auth" ${serverPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Auth routes not found in server.js');
      console.log('🔄 Checking all route imports...');
      checkAllRouteImports();
    } else {
      console.log('✅ Auth routes found in server.js:');
      console.log(stdout);
      
      // Check if backend is using the right server file
      checkBackendServer();
    }
  });
}

function checkAllRouteImports() {
  console.log('\n🔍 Checking all route imports...');
  
  const serverPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js';
  
  exec(`grep -n "require.*routes" ${serverPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ No route imports found');
      console.log('🔄 Checking if server.js exists...');
      checkServerFile();
    } else {
      console.log('📋 Route imports found:');
      console.log(stdout);
      
      // Check which server file is being used
      checkBackendServer();
    }
  });
}

function checkServerFile() {
  console.log('\n🔍 Checking server.js file...');
  
  const serverPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js';
  
  exec(`ls -la ${serverPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ server.js not found:', error.message);
      console.log('🔄 Looking for other server files...');
      findServerFiles();
    } else {
      console.log('✅ server.js found');
      console.log('📋 Server file info:');
      console.log(stdout);
      
      // Check server content
      checkServerContent();
    }
  });
}

function findServerFiles() {
  console.log('\n🔍 Looking for server files...');
  
  const backendPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend';
  
  exec(`find ${backendPath} -name "*server*" -type f`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ No server files found:', error.message);
      return;
    }
    
    console.log('📋 Server files found:');
    console.log(stdout);
    
    // Check which one is being used by PM2
    checkPm2Server();
  });
}

function checkPm2Server() {
  console.log('\n🔍 Checking which server PM2 is using...');
  
  exec('pm2 show alcolic-backend', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Could not get PM2 info:', error.message);
      return;
    }
    
    console.log('📋 PM2 process info:');
    console.log(stdout);
    
    // Check if backend is running the right file
    checkBackendLogs();
  });
}

function checkBackendLogs() {
  console.log('\n🔍 Checking backend logs...');
  
  exec('pm2 logs alcolic-backend --lines 20', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Could not get logs:', error.message);
      return;
    }
    
    console.log('📋 Recent backend logs:');
    console.log(stdout);
    
    // Test direct backend connection
    testDirectBackend();
  });
}

function testDirectBackend() {
  console.log('\n🧪 Testing direct backend connection...');
  
  exec('curl -s http://localhost:5000/api/v1/auth/login -X POST -H "Content-Type: application/json" -d \'{"email":"test","password":"test","role":"admin"}\'', (error, stdout, stderr) => {
    console.log('📡 Direct backend response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('Route not found')) {
      console.log('❌ Backend returning "Route not found"');
      console.log('🔄 Need to fix backend route setup');
      fixBackendRoutes();
    } else if (stdout.includes('Invalid credentials')) {
      console.log('✅ Backend routes are working (returning validation error)');
      console.log('🎯 The issue is with the API proxy routing');
      fixApiPhpRouting();
    } else {
      console.log('⚠️ Unexpected backend response');
      console.log('🔄 Checking backend status...');
      restartBackend();
    }
  });
}

function fixBackendRoutes() {
  console.log('\n🔧 Fixing backend routes...');
  
  const backendPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend';
  
  // Check if there's a working server file
  exec(`ls -la ${backendPath}/server*.js`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ No server files found');
      return;
    }
    
    console.log('📋 Available server files:');
    console.log(stdout);
    
    // Try to restart with a different server file
    restartWithWorkingServer();
  });
}

function restartWithWorkingServer() {
  console.log('\n🔄 Restarting backend with working server...');
  
  const backendPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend';
  
  // Stop current backend
  exec('pm2 stop alcolic-backend', (error, stdout, stderr) => {
    console.log('✅ Backend stopped');
    
    // Try starting with server-cors-fixed.js if it exists
    exec(`ls -la ${backendPath}/server-cors-fixed.js`, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ server-cors-fixed.js not found');
        // Start with regular server.js
        startBackend('server.js');
      } else {
        console.log('✅ server-cors-fixed.js found, using it');
        startBackend('server-cors-fixed.js');
      }
    });
  });
}

function startBackend(serverFile) {
  console.log(`\n🚀 Starting backend with ${serverFile}...`);
  
  const backendPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend';
  
  exec(`cd ${backendPath} && pm2 start ${serverFile} --name "alcolic-backend"`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to start backend:', error.message);
      return;
    }
    
    console.log('✅ Backend started successfully');
    console.log(stdout);
    
    // Wait and test again
    setTimeout(() => {
      testDirectBackend();
    }, 3000);
  });
}

function fixApiPhpRouting() {
  console.log('\n🔧 Fixing API.php routing...');
  
  // The issue might be with the path extraction in api.php
  console.log('🎯 The backend is working, but API.php routing might be wrong');
  console.log('🔄 Testing with different API paths...');
  
  testApiPaths();
}

function testApiPaths() {
  console.log('\n🧪 Testing different API paths...');
  
  const testPaths = [
    '/api.php/api/v1/auth/login',
    '/api.php/v1/auth/login',
    '/api.php/auth/login'
  ];
  
  testPaths.forEach((path, index) => {
    setTimeout(() => {
      testPath(path, index + 1);
    }, index * 1000);
  });
}

function testPath(path, testNumber) {
  console.log(`\n🧪 Test ${testNumber}: ${path}`);
  
  exec(`curl -s https://alcolic.gnritservices.com${path} -X POST -H "Content-Type: application/json" -d '{"email":"test","password":"test","role":"admin"}'`, (error, stdout, stderr) => {
    console.log('📡 Response:');
    console.log(stdout);
    
    if (!stdout.includes('Route not found')) {
      console.log(`✅ Path ${path} works!`);
    } else {
      console.log(`❌ Path ${path} still returns "Route not found"`);
    }
  });
}

function restartBackend() {
  console.log('\n🔄 Restarting backend...');
  
  exec('pm2 restart alcolic-backend', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to restart backend:', error.message);
      return;
    }
    
    console.log('✅ Backend restarted successfully');
    console.log(stdout);
    
    // Wait and test again
    setTimeout(() => {
      testDirectBackend();
    }, 3000);
  });
}

// Start the process
console.log('🚀 Starting backend route check...');
checkBackendRoutes();
