const { exec } = require('child_process');

console.log('🔧 Debugging backend startup issue...');

// The backend started in PM2 but isn't listening on port 5000
// Let's check what's happening

function checkBackendLogs() {
  console.log('\n🔍 Checking backend logs...');
  
  exec('pm2 logs alcolic-backend --lines 20', (error, stdout, stderr) => {
    console.log('📋 Backend logs:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('error') || stdout.includes('Error')) {
      console.log('❌ Found errors in backend logs');
      console.log('🔄 Let\'s check the backend configuration...');
      checkBackendConfig();
    } else if (stdout.includes('listening') || stdout.includes('started')) {
      console.log('✅ Backend seems to be running');
      console.log('🔄 Let\'s check if it\'s listening on a different port...');
      checkDifferentPorts();
    } else {
      console.log('⚠️ No clear indication in logs');
      console.log('🔄 Let\'s check the backend configuration...');
      checkBackendConfig();
    }
  });
}

function checkBackendConfig() {
  console.log('\n🔍 Checking backend configuration...');
  
  // Check the server.js file to see what port it's configured to use
  exec('grep -n "port\|PORT" /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js', (error, stdout, stderr) => {
    console.log('📋 Port configuration:');
    console.log(stdout);
    
    if (stdout.includes('5000')) {
      console.log('✅ Port 5000 is configured');
      console.log('🔄 Let\'s check if there are any startup errors...');
      checkStartupErrors();
    } else if (stdout.includes('process.env.PORT')) {
      console.log('✅ Using environment variable for port');
      console.log('🔄 Let\'s check the environment variables...');
      checkEnvironmentVariables();
    } else {
      console.log('❌ Port configuration not found');
      console.log('🔄 Let\'s check the server.js file...');
      checkServerFile();
    }
  });
}

function checkEnvironmentVariables() {
  console.log('\n🔍 Checking environment variables...');
  
  exec('cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && cat .env', (error, stdout, stderr) => {
    console.log('📋 Environment variables:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('PORT=5000')) {
      console.log('✅ PORT=5000 is set in .env');
      console.log('🔄 Let\'s check if there are any startup errors...');
      checkStartupErrors();
    } else if (stdout.includes('PORT=')) {
      console.log('⚠️ PORT is set to a different value');
      console.log('🔄 Let\'s check what port it\'s using...');
      checkDifferentPorts();
    } else {
      console.log('❌ PORT not found in .env');
      console.log('🔄 Let\'s check if there are any startup errors...');
      checkStartupErrors();
    }
  });
}

function checkStartupErrors() {
  console.log('\n🔍 Checking for startup errors...');
  
  // Check if the backend process is actually running
  exec('ps aux | grep "node.*server.js"', (error, stdout, stderr) => {
    console.log('📋 Node.js processes:');
    console.log(stdout);
    
    if (stdout.includes('server.js')) {
      console.log('✅ Node.js server process is running');
      console.log('🔄 Let\'s check if it\'s listening on a different port...');
      checkDifferentPorts();
    } else {
      console.log('❌ Node.js server process not found');
      console.log('🔄 The backend might have crashed on startup');
      console.log('🔄 Let\'s restart it and check for errors...');
      restartBackendWithDebug();
    }
  });
}

function checkDifferentPorts() {
  console.log('\n🔍 Checking different ports...');
  
  // Check common ports that the backend might be using
  const ports = [3000, 5000, 8000, 8080, 3001, 5001];
  
  let currentPort = 0;
  
  function testNextPort() {
    if (currentPort >= ports.length) {
      console.log('❌ Backend not found on any common ports');
      console.log('🔄 Let\'s restart the backend with debug output...');
      restartBackendWithDebug();
      return;
    }
    
    const port = ports[currentPort];
    console.log(`\n🧪 Testing port ${port}...`);
    
    exec(`curl -s -X GET http://localhost:${port}/api/v1`, (error, stdout, stderr) => {
      if (stdout.includes('Route not found') || stdout.includes('success') || stdout.includes('error')) {
        console.log(`✅ Backend found on port ${port}!`);
        console.log('📡 Response:', stdout);
        console.log(`🔄 The backend is running on port ${port}, not 5000`);
        updateApiPhpPort(port);
      } else {
        console.log(`❌ Port ${port} not responding`);
        currentPort++;
        testNextPort();
      }
    });
  }
  
  testNextPort();
}

function updateApiPhpPort(port) {
  console.log(`\n🔧 Updating API.php to use port ${port}...`);
  
  // Update the API.php file to use the correct port
  exec(`sed -i 's/localhost:5000/localhost:${port}/g' /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to update API.php:', error.message);
      return;
    }
    
    console.log(`✅ API.php updated to use port ${port}`);
    testUpdatedApiPhp();
  });
}

function testUpdatedApiPhp() {
  console.log('\n🧪 Testing updated API.php...');
  
  const loginData = JSON.stringify({
    email: 'newauthadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${loginData}'`, (error, stdout, stderr) => {
    console.log('📡 Updated API.php test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! API.php now working!');
      console.log('✅ Your admin panel should now work!');
      console.log('\n🎯 Admin credentials:');
      console.log('📧 Email: newauthadmin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
      console.log('\n🌐 Access your admin panel at: https://admin.alcolic.gnritservices.com');
    } else if (stdout.includes('error') && stdout.includes('Failed to connect')) {
      console.log('❌ Still getting connection error');
      console.log('🔄 Let\'s restart the backend with debug output...');
      restartBackendWithDebug();
    } else {
      console.log('⚠️ Unexpected response');
      console.log('💬 Response:', stdout);
    }
  });
}

function restartBackendWithDebug() {
  console.log('\n🔄 Restarting backend with debug output...');
  
  // Stop the current backend
  exec('pm2 stop alcolic-backend', (error, stdout, stderr) => {
    console.log('📊 Stop result:', stdout);
    
    // Start the backend manually to see any startup errors
    exec('cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && node server.js', (error, stdout, stderr) => {
      console.log('📋 Manual startup output:');
      console.log('='.repeat(50));
      console.log(stdout);
      console.log('='.repeat(50));
      
      if (stderr) {
        console.log('📋 Error output:');
        console.log('='.repeat(50));
        console.log(stderr);
        console.log('='.repeat(50));
      }
      
      if (error) {
        console.log('❌ Backend failed to start:', error.message);
        console.log('🔄 Let\'s check the server.js file for issues...');
        checkServerFile();
      } else if (stdout.includes('listening') || stdout.includes('started')) {
        console.log('✅ Backend started successfully');
        console.log('🔄 Let\'s check what port it\'s using...');
        checkDifferentPorts();
      } else {
        console.log('⚠️ Backend started but no clear indication of port');
        console.log('🔄 Let\'s check what port it\'s using...');
        checkDifferentPorts();
      }
    });
  });
}

function checkServerFile() {
  console.log('\n🔍 Checking server.js file...');
  
  exec('head -30 /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js', (error, stdout, stderr) => {
    console.log('📄 Server.js content (first 30 lines):');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('app.listen')) {
      console.log('✅ Found app.listen in server.js');
      console.log('🔄 Let\'s check the exact port configuration...');
      checkPortConfiguration();
    } else {
      console.log('❌ app.listen not found in server.js');
      console.log('🔄 The server.js might be incomplete');
      console.log('💡 Manual intervention required');
    }
  });
}

function checkPortConfiguration() {
  console.log('\n🔍 Checking port configuration...');
  
  exec('grep -A 5 -B 5 "app.listen\|listen\|PORT" /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js', (error, stdout, stderr) => {
    console.log('📋 Port configuration details:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('5000')) {
      console.log('✅ Port 5000 is configured in server.js');
      console.log('🔄 The issue might be with dependencies or environment');
      console.log('🔄 Let\'s check if all dependencies are installed...');
      checkDependencies();
    } else if (stdout.includes('process.env.PORT')) {
      console.log('✅ Using environment variable for port');
      console.log('🔄 Let\'s check the .env file...');
      checkEnvFile();
    } else {
      console.log('❌ Port configuration not clear');
      console.log('🔄 Let\'s check dependencies...');
      checkDependencies();
    }
  });
}

function checkDependencies() {
  console.log('\n🔍 Checking dependencies...');
  
  exec('cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && ls -la node_modules', (error, stdout, stderr) => {
    console.log('📋 Node modules:');
    console.log(stdout);
    
    if (stdout.includes('No such file')) {
      console.log('❌ Node modules not installed');
      console.log('🔄 Installing dependencies...');
      installDependencies();
    } else {
      console.log('✅ Node modules exist');
      console.log('🔄 Let\'s check the .env file...');
      checkEnvFile();
    }
  });
}

function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  exec('cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && npm install', (error, stdout, stderr) => {
    console.log('📋 Install result:');
    console.log(stdout);
    
    if (error) {
      console.log('❌ Failed to install dependencies:', error.message);
      console.log('💡 Manual intervention required');
    } else {
      console.log('✅ Dependencies installed');
      console.log('🔄 Let\'s restart the backend...');
      restartBackend();
    }
  });
}

function checkEnvFile() {
  console.log('\n🔍 Checking .env file...');
  
  exec('cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && cat .env', (error, stdout, stderr) => {
    console.log('📋 .env file content:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('PORT=')) {
      console.log('✅ PORT is configured in .env');
      console.log('🔄 Let\'s restart the backend...');
      restartBackend();
    } else {
      console.log('❌ PORT not found in .env');
      console.log('🔄 Let\'s add PORT configuration...');
      addPortConfiguration();
    }
  });
}

function addPortConfiguration() {
  console.log('\n🔧 Adding PORT configuration...');
  
  exec('cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend && echo "PORT=5000" >> .env', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to add PORT configuration:', error.message);
      return;
    }
    
    console.log('✅ PORT configuration added');
    console.log('🔄 Let\'s restart the backend...');
    restartBackend();
  });
}

function restartBackend() {
  console.log('\n🔄 Restarting backend...');
  
  exec('pm2 restart alcolic-backend', (error, stdout, stderr) => {
    console.log('📊 Restart result:');
    console.log(stdout);
    
    setTimeout(() => {
      testBackendConnection();
    }, 3000);
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
    } else {
      console.log('❌ Backend still not accessible');
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
    } else {
      console.log('❌ Admin login still failing');
      console.log('💬 Response:', stdout);
    }
  });
}

console.log('🚀 Starting backend debug...');
checkBackendLogs();
