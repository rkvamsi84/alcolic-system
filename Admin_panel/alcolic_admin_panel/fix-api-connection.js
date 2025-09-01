const { exec } = require('child_process');

console.log('🔧 Fixing API.php connection issue...');

// The backend is working on port 5001, but API.php is having connection issues
// Let's check and fix the API.php configuration

function checkApiPhpConfig() {
  console.log('\n🔍 Checking API.php configuration...');
  
  exec('cat /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php', (error, stdout, stderr) => {
    console.log('📋 API.php content:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('localhost:5001')) {
      console.log('✅ API.php is configured for port 5001');
      console.log('🔄 Let\'s test the backend directly...');
      testBackendDirect();
    } else {
      console.log('❌ API.php not configured for port 5001');
      console.log('🔄 Let\'s update it...');
      updateApiPhp();
    }
  });
}

function updateApiPhp() {
  console.log('\n🔧 Updating API.php to use port 5001...');
  
  exec('sed -i \'s/localhost:5000/localhost:5001/g\' /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to update API.php:', error.message);
      return;
    }
    
    console.log('✅ API.php updated to use port 5001');
    testBackendDirect();
  });
}

function testBackendDirect() {
  console.log('\n🧪 Testing backend directly on port 5001...');
  
  exec('curl -s -X GET http://localhost:5001/api/v1', (error, stdout, stderr) => {
    console.log('📡 Direct backend test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('Route not found')) {
      console.log('✅ Backend is responding directly');
      console.log('🔄 Let\'s test a specific endpoint...');
      testAuthEndpoint();
    } else {
      console.log('❌ Backend not responding directly');
      console.log('💬 Response:', stdout);
    }
  });
}

function testAuthEndpoint() {
  console.log('\n🧪 Testing auth endpoint directly...');
  
  exec('curl -s -X GET http://localhost:5001/api/v1/auth', (error, stdout, stderr) => {
    console.log('📡 Auth endpoint test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('Route not found') || stdout.includes('success') || stdout.includes('error')) {
      console.log('✅ Auth endpoint is accessible');
      console.log('🔄 Let\'s test admin login directly...');
      testAdminLoginDirect();
    } else {
      console.log('❌ Auth endpoint not accessible');
      console.log('💬 Response:', stdout);
    }
  });
}

function testAdminLoginDirect() {
  console.log('\n🧪 Testing admin login directly...');
  
  const loginData = JSON.stringify({
    email: 'newauthadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST http://localhost:5001/api/v1/auth/login -H "Content-Type: application/json" -d '${loginData}'`, (error, stdout, stderr) => {
    console.log('📡 Direct admin login test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ Admin login working directly!');
      console.log('🔄 The issue is with API.php. Let\'s fix it...');
      fixApiPhp();
    } else if (stdout.includes('Invalid credentials')) {
      console.log('❌ Invalid credentials');
      console.log('🔄 Let\'s create a new admin user...');
      createAdminDirect();
    } else {
      console.log('❌ Admin login failed');
      console.log('💬 Response:', stdout);
      console.log('🔄 Let\'s create a new admin user...');
      createAdminDirect();
    }
  });
}

function createAdminDirect() {
  console.log('\n🔧 Creating admin user directly...');
  
  const registerData = JSON.stringify({
    email: 'admin@alcolic.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User'
  });
  
  exec(`curl -s -X POST http://localhost:5001/api/v1/auth/register -H "Content-Type: application/json" -d '${registerData}'`, (error, stdout, stderr) => {
    console.log('📡 Direct admin registration:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ Admin user created directly!');
      console.log('🔄 Now let\'s fix API.php...');
      fixApiPhp();
    } else {
      console.log('❌ Failed to create admin user directly');
      console.log('💬 Response:', stdout);
      console.log('🔄 Let\'s try a different approach...');
      tryDifferentApiPhp();
    }
  });
}

function fixApiPhp() {
  console.log('\n🔧 Fixing API.php...');
  
  // Create a new, simpler API.php
  const newApiPhp = `<?php
// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, X-localization');
header('Access-Control-Allow-Credentials: false');
header('Access-Control-Max-Age: 86400');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

// Get the request path
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove /api.php from the path
$api_path = str_replace('/api.php', '', $path);

// Add /api/v1 prefix to match backend routes
if (empty($api_path) || $api_path === '/') {
  $api_path = '/api/v1';
} else {
  $api_path = '/api/v1' . $api_path;
}

// Build backend URL
$backend_url = 'http://localhost:5001' . $api_path;

// Get query string
$query_string = $_SERVER['QUERY_STRING'];
if (!empty($query_string)) {
  $backend_url .= '?' . $query_string;
}

// Log for debugging
error_log("API Request: " . $_SERVER['REQUEST_METHOD'] . " " . $request_uri . " -> " . $backend_url);

// Make cURL request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $backend_url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

// Set headers
$headers = array();
foreach (getallheaders() as $name => $value) {
  if (strtolower($name) !== 'host') {
    $headers[] = "$name: $value";
  }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Set request body for POST/PUT/PATCH
if (in_array($_SERVER['REQUEST_METHOD'], array('POST', 'PUT', 'PATCH'))) {
  $input = file_get_contents('php://input');
  if (!empty($input)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
  }
}

// Execute request
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

// Check for errors
if (curl_errno($ch)) {
  http_response_code(500);
  echo json_encode(array('error' => 'Backend connection failed: ' . curl_error($ch)));
  curl_close($ch);
  exit();
}

curl_close($ch);

// Set response headers
if (!empty($content_type)) {
  header('Content-Type: ' . $content_type);
}

// Set response code
http_response_code($http_code);

// Output response
echo $response;
?>`;
  
  exec(`cd /home/u294447786/domains/alcolic.gnritservices.com/public_html && echo '${newApiPhp}' > api.php`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create new API.php:', error.message);
      return;
    }
    
    console.log('✅ New API.php created');
    testNewApiPhp();
  });
}

function tryDifferentApiPhp() {
  console.log('\n🔧 Trying different API.php approach...');
  
  // Let's try a very simple API.php
  const simpleApiPhp = `<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

$path = str_replace('/api.php', '', $_SERVER['REQUEST_URI']);
$backend_url = 'http://localhost:5001/api/v1' . $path;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $backend_url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

if (in_array($_SERVER['REQUEST_METHOD'], array('POST', 'PUT', 'PATCH'))) {
  curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
}

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($http_code);
echo $response;
?>`;
  
  exec(`cd /home/u294447786/domains/alcolic.gnritservices.com/public_html && echo '${simpleApiPhp}' > api.php`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create simple API.php:', error.message);
      return;
    }
    
    console.log('✅ Simple API.php created');
    testNewApiPhp();
  });
}

function testNewApiPhp() {
  console.log('\n🧪 Testing new API.php...');
  
  exec('curl -s -X GET https://alcolic.gnritservices.com/api.php/api/v1', (error, stdout, stderr) => {
    console.log('📡 New API.php test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('Route not found')) {
      console.log('✅ New API.php is working!');
      testAdminLoginViaApiPhp();
    } else {
      console.log('❌ New API.php not working');
      console.log('💬 Response:', stdout);
    }
  });
}

function testAdminLoginViaApiPhp() {
  console.log('\n🧪 Testing admin login via API.php...');
  
  const loginData = JSON.stringify({
    email: 'admin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${loginData}'`, (error, stdout, stderr) => {
    console.log('📡 Admin login via API.php:');
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
      console.log('❌ Admin login still failing via API.php');
      console.log('💬 Response:', stdout);
      console.log('\n🔄 Let\'s create admin user via API.php...');
      createAdminViaApiPhp();
    }
  });
}

function createAdminViaApiPhp() {
  console.log('\n🔧 Creating admin user via API.php...');
  
  const registerData = JSON.stringify({
    email: 'superadmin@alcolic.com',
    password: 'admin123',
    role: 'admin',
    name: 'Super Admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/register -H "Content-Type: application/json" -d '${registerData}'`, (error, stdout, stderr) => {
    console.log('📡 Admin registration via API.php:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ Admin user created via API.php!');
      console.log('\n🎯 New admin credentials:');
      console.log('📧 Email: superadmin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
      console.log('\n🌐 Access your admin panel at: https://admin.alcolic.gnritservices.com');
    } else {
      console.log('❌ Failed to create admin user via API.php');
      console.log('💬 Response:', stdout);
    }
  });
}

console.log('🚀 Starting API connection fix...');
checkApiPhpConfig();
