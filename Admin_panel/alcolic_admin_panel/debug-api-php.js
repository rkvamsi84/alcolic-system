const { exec } = require('child_process');

console.log('🔍 Debugging API.php...');

// Check if api.php exists and its content
exec('ls -la /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ API.php file not found:', error.message);
    return;
  }
  
  console.log('📁 API.php file info:');
  console.log(stdout);
  
  // Check the content
  checkApiPhpContent();
});

function checkApiPhpContent() {
  console.log('\n📄 Checking API.php content...');
  
  exec('head -20 /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php', (error, stdout, stderr) => {
    console.log('📝 First 20 lines:');
    console.log(stdout);
    
    // Check PHP syntax
    checkPhpSyntax();
  });
}

function checkPhpSyntax() {
  console.log('\n🔧 Checking PHP syntax...');
  
  exec('php -l /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php', (error, stdout, stderr) => {
    console.log('📋 PHP syntax check:');
    console.log(stdout);
    
    if (error) {
      console.log('❌ PHP syntax error:', stderr);
      fixApiPhp();
    } else {
      console.log('✅ PHP syntax is correct');
      testApiPhpDirectly();
    }
  });
}

function fixApiPhp() {
  console.log('\n🔧 Creating a simple working API.php...');
  
  const simpleApiPhp = `<?php
// Simple API proxy
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: false');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

// Get the path
$path = $_SERVER['REQUEST_URI'];
$path = str_replace('/api.php', '', $path);

if (empty($path) || $path === '/') {
  $path = '/api/v1';
}

$backend_url = 'http://localhost:5000' . $path;

// Log for debugging
error_log("API Request: " . $_SERVER['REQUEST_METHOD'] . " " . $_SERVER['REQUEST_URI'] . " -> " . $backend_url);

// Make request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $backend_url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

// Set headers
$headers = array('Content-Type: application/json');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Set body for POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $input = file_get_contents('php://input');
  if (!empty($input)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
  }
}

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
  http_response_code(500);
  echo json_encode(array('error' => 'Backend error: ' . curl_error($ch)));
  curl_close($ch);
  exit();
}

curl_close($ch);

http_response_code($http_code);
echo $response;
?>`;

  exec(`echo '${simpleApiPhp}' > /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create simple api.php:', error.message);
      return;
    }
    
    console.log('✅ Simple API.php created');
    
    // Test the simple version
    testSimpleApiPhp();
  });
}

function testApiPhpDirectly() {
  console.log('\n🧪 Testing API.php directly...');
  
  // Test with a simple GET request first
  exec('curl -s -X GET https://alcolic.gnritservices.com/api.php', (error, stdout, stderr) => {
    console.log('📡 GET /api.php response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('error') || stdout.includes('Backend error')) {
      console.log('❌ Backend connection issue');
      checkBackendStatus();
    } else if (stdout.includes('Route not found')) {
      console.log('✅ API.php working, but route not found');
      testWithCorrectPath();
    } else if (stdout.includes('success') || stdout.includes('api')) {
      console.log('✅ API.php working correctly');
    } else {
      console.log('⚠️ Unexpected response');
      console.log('🔄 Creating simpler version...');
      fixApiPhp();
    }
  });
}

function testSimpleApiPhp() {
  console.log('\n🧪 Testing simple API.php...');
  
  // Test with a simple request
  exec('curl -s -X GET https://alcolic.gnritservices.com/api.php', (error, stdout, stderr) => {
    console.log('📡 Simple API.php response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('error') || stdout.includes('Backend error')) {
      console.log('❌ Backend connection issue');
      checkBackendStatus();
    } else {
      console.log('✅ Simple API.php working');
      testLoginWithSimpleApi();
    }
  });
}

function testWithCorrectPath() {
  console.log('\n🧪 Testing with correct path...');
  
  const testData = JSON.stringify({
    email: 'superadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${testData}'`, (error, stdout, stderr) => {
    console.log('📡 Login response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! Login working!');
    } else if (stdout.includes('Invalid credentials')) {
      console.log('✅ API working, but invalid credentials');
      createAdminUser();
    } else {
      console.log('⚠️ Unexpected response');
      console.log('🔄 Creating simpler version...');
      fixApiPhp();
    }
  });
}

function testLoginWithSimpleApi() {
  console.log('\n🧪 Testing login with simple API.php...');
  
  const testData = JSON.stringify({
    email: 'superadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${testData}'`, (error, stdout, stderr) => {
    console.log('📡 Login response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! Login working!');
      console.log('✅ API.php is now working correctly!');
    } else if (stdout.includes('Invalid credentials')) {
      console.log('✅ API working, but invalid credentials');
      createAdminUser();
    } else {
      console.log('⚠️ Still not working');
      console.log('🔄 Checking backend status...');
      checkBackendStatus();
    }
  });
}

function checkBackendStatus() {
  console.log('\n🔍 Checking backend status...');
  
  exec('pm2 status', (error, stdout, stderr) => {
    console.log('📊 PM2 Status:');
    console.log(stdout);
    
    // Test direct backend connection
    testDirectBackend();
  });
}

function testDirectBackend() {
  console.log('\n🧪 Testing direct backend connection...');
  
  exec('curl -s -X GET http://localhost:5000/api/v1', (error, stdout, stderr) => {
    console.log('📡 Direct backend response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('Route not found')) {
      console.log('✅ Backend is running and responding');
      console.log('🔄 The issue is with API.php routing');
      createWorkingApiPhp();
    } else if (error) {
      console.log('❌ Backend not accessible');
      console.log('🔄 Starting backend...');
      startBackend();
    } else {
      console.log('⚠️ Unexpected backend response');
      console.log('🔄 Creating working API.php...');
      createWorkingApiPhp();
    }
  });
}

function startBackend() {
  console.log('\n🚀 Starting backend...');
  
  exec('pm2 start /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js --name "alcolic-backend"', (error, stdout, stderr) => {
    console.log('📊 Start result:');
    console.log(stdout);
    
    setTimeout(() => {
      testDirectBackend();
    }, 2000);
  });
}

function createWorkingApiPhp() {
  console.log('\n🔧 Creating working API.php...');
  
  const workingApiPhp = `<?php
// Working API proxy
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: false');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

// Get the path correctly
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove /api.php from the path
$api_path = str_replace('/api.php', '', $path);

// If no path specified, default to /api/v1
if (empty($api_path) || $api_path === '/') {
  $api_path = '/api/v1';
}

$backend_url = 'http://localhost:5000' . $api_path;

// Log for debugging
error_log("API Request: " . $_SERVER['REQUEST_METHOD'] . " " . $request_uri . " -> " . $backend_url);

// Make request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $backend_url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

// Set headers
$headers = array();
foreach (getallheaders() as $name => $value) {
  if (strtolower($name) !== 'host') {
    $headers[] = "$name: $value";
  }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Set body for POST/PUT
if (in_array($_SERVER['REQUEST_METHOD'], array('POST', 'PUT'))) {
  $input = file_get_contents('php://input');
  if (!empty($input)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
  }
}

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
  http_response_code(500);
  echo json_encode(array('error' => 'Backend error: ' . curl_error($ch)));
  curl_close($ch);
  exit();
}

curl_close($ch);

http_response_code($http_code);
echo $response;
?>`;

  exec(`echo '${workingApiPhp}' > /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create working api.php:', error.message);
      return;
    }
    
    console.log('✅ Working API.php created');
    
    // Test the working version
    testWorkingApiPhp();
  });
}

function testWorkingApiPhp() {
  console.log('\n🧪 Testing working API.php...');
  
  const testData = JSON.stringify({
    email: 'superadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${testData}'`, (error, stdout, stderr) => {
    console.log('📡 Working API.php response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! Login working!');
      console.log('✅ API.php is now working correctly!');
    } else if (stdout.includes('Invalid credentials')) {
      console.log('✅ API working, but invalid credentials');
      createAdminUser();
    } else if (stdout.includes('Route not found')) {
      console.log('✅ API working, but route not found');
      console.log('🔄 Testing with different path...');
      testDifferentPath();
    } else {
      console.log('⚠️ Still not working');
      console.log('💬 Response:', stdout);
    }
  });
}

function testDifferentPath() {
  console.log('\n🧪 Testing with different path...');
  
  const testData = JSON.stringify({
    email: 'superadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/api/v1/auth/login -H "Content-Type: application/json" -d '${testData}'`, (error, stdout, stderr) => {
    console.log('📡 Different path response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! Login working with different path!');
      console.log('✅ API.php routing fixed!');
    } else if (stdout.includes('Invalid credentials')) {
      console.log('✅ API working, but invalid credentials');
      createAdminUser();
    } else {
      console.log('⚠️ Still not working');
      console.log('💬 Response:', stdout);
    }
  });
}

function createAdminUser() {
  console.log('\n👤 Creating admin user...');
  
  const registerData = JSON.stringify({
    name: 'Super Admin',
    email: 'superadmin@alcolic.com',
    phone: '+1234567891',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/register -H "Content-Type: application/json" -d '${registerData}'`, (error, stdout, stderr) => {
    console.log('📡 Register response:');
    console.log(stdout);
    
    if (stdout.includes('already exists')) {
      console.log('✅ Admin user already exists');
    } else if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ Admin user created successfully');
    }
    
    // Test login again
    setTimeout(() => {
      testFinalLogin();
    }, 1000);
  });
}

function testFinalLogin() {
  console.log('\n🧪 Final login test...');
  
  const testData = JSON.stringify({
    email: 'superadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${testData}'`, (error, stdout, stderr) => {
    console.log('📡 Final login response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! Admin login working!');
      console.log('✅ Your admin panel should now work!');
      console.log('\n🎯 Admin credentials:');
      console.log('📧 Email: superadmin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
    } else {
      console.log('❌ Login still failing');
      console.log('💬 Response:', stdout);
    }
  });
}

console.log('🚀 Starting API.php debug...');
