const { exec } = require('child_process');

console.log('🔧 Quick backend debug...');

// Simple checks to identify the issue quickly

function checkPM2Logs() {
  console.log('\n🔍 Checking PM2 logs (last 10 lines)...');
  
  exec('pm2 logs alcolic-backend --lines 10 --nostream', (error, stdout, stderr) => {
    console.log('📋 PM2 logs:');
    console.log('='.repeat(50));
    console.log(stdout || 'No logs found');
    console.log('='.repeat(50));
    
    if (stdout.includes('error') || stdout.includes('Error')) {
      console.log('❌ Found errors in PM2 logs');
    } else if (stdout.includes('listening') || stdout.includes('started')) {
      console.log('✅ Backend seems to be running');
    } else {
      console.log('⚠️ No clear logs found');
    }
    
    checkPortUsage();
  });
}

function checkPortUsage() {
  console.log('\n🔍 Checking port usage...');
  
  exec('netstat -tlnp | grep :5000', (error, stdout, stderr) => {
    console.log('📋 Port 5000 usage:');
    console.log(stdout || 'Port 5000 not in use');
    
    if (stdout.includes('5000')) {
      console.log('✅ Port 5000 is in use');
      testBackendDirect();
    } else {
      console.log('❌ Port 5000 not in use');
      checkOtherPorts();
    }
  });
}

function checkOtherPorts() {
  console.log('\n🔍 Checking other common ports...');
  
  const ports = [3000, 8000, 8080, 3001, 5001];
  let checked = 0;
  
  ports.forEach(port => {
    exec(`netstat -tlnp | grep :${port}`, (error, stdout, stderr) => {
      checked++;
      if (stdout.includes(port.toString())) {
        console.log(`✅ Port ${port} is in use`);
        console.log(`🔄 Backend might be running on port ${port}`);
        updateApiPhpPort(port);
        return;
      }
      
      if (checked === ports.length) {
        console.log('❌ No backend found on common ports');
        checkBackendProcess();
      }
    });
  });
}

function updateApiPhpPort(port) {
  console.log(`\n🔧 Updating API.php to use port ${port}...`);
  
  exec(`sed -i 's/localhost:5000/localhost:${port}/g' /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to update API.php:', error.message);
      return;
    }
    
    console.log(`✅ API.php updated to use port ${port}`);
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
    }
  });
}

function checkBackendProcess() {
  console.log('\n🔍 Checking backend process...');
  
  exec('ps aux | grep "node.*server.js"', (error, stdout, stderr) => {
    console.log('📋 Node.js processes:');
    console.log(stdout);
    
    if (stdout.includes('server.js')) {
      console.log('✅ Node.js server process is running');
      console.log('🔄 Let\'s check if it\'s listening on any port...');
      checkAllPorts();
    } else {
      console.log('❌ Node.js server process not found');
      console.log('🔄 Backend is not running');
      restartBackend();
    }
  });
}

function checkAllPorts() {
  console.log('\n🔍 Checking all listening ports...');
  
  exec('netstat -tlnp | grep LISTEN', (error, stdout, stderr) => {
    console.log('📋 All listening ports:');
    console.log(stdout);
    
    // Look for any port that might be our backend
    if (stdout.includes('node')) {
      console.log('✅ Found Node.js listening on a port');
      // Extract the port and update API.php
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.includes('node') && line.includes('LISTEN')) {
          const match = line.match(/:(\d+)/);
          if (match) {
            const port = match[1];
            console.log(`🔄 Found Node.js on port ${port}`);
            updateApiPhpPort(port);
            return;
          }
        }
      }
    } else {
      console.log('❌ No Node.js processes listening');
      restartBackend();
    }
  });
}

function restartBackend() {
  console.log('\n🔄 Restarting backend...');
  
  exec('pm2 restart alcolic-backend', (error, stdout, stderr) => {
    console.log('📊 Restart result:');
    console.log(stdout);
    
    setTimeout(() => {
      console.log('\n🧪 Testing backend after restart...');
      exec('curl -s -X GET http://localhost:5000/api/v1', (error, stdout, stderr) => {
        console.log('📡 Backend test:');
        console.log('='.repeat(50));
        console.log(stdout);
        console.log('='.repeat(50));
        
        if (stdout.includes('Route not found')) {
          console.log('✅ Backend is now working!');
          testApiPhp();
        } else {
          console.log('❌ Backend still not working');
          console.log('💡 Manual intervention required');
        }
      });
    }, 5000);
  });
}

function testBackendDirect() {
  console.log('\n🧪 Testing backend directly...');
  
  exec('curl -s -X GET http://localhost:5000/api/v1', (error, stdout, stderr) => {
    console.log('📡 Direct backend test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('Route not found')) {
      console.log('✅ Backend is working on port 5000!');
      testApiPhp();
    } else {
      console.log('❌ Backend not responding correctly');
      console.log('💬 Response:', stdout);
    }
  });
}

console.log('🚀 Starting quick backend debug...');
checkPM2Logs();
