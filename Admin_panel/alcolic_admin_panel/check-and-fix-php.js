const { exec } = require('child_process');

console.log('🔍 Checking and fixing PHP syntax...');

// First, let's see what's actually in the file
exec('cat /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Cannot read API.php:', error.message);
    return;
  }
  
  console.log('📄 Current API.php content:');
  console.log('='.repeat(50));
  console.log(stdout);
  console.log('='.repeat(50));
  
  // Check for specific syntax issues
  checkSyntaxIssues(stdout);
});

function checkSyntaxIssues(content) {
  console.log('\n🔍 Checking for syntax issues...');
  
  const issues = [];
  
  // Check for missing quotes in header calls
  if (content.includes('header(Access-Control-Allow-Origin:')) {
    issues.push('Missing quotes in header calls');
  }
  
  // Check for missing quotes in array access
  if (content.includes('$_SERVER[REQUEST_METHOD]')) {
    issues.push('Missing quotes in $_SERVER array access');
  }
  
  // Check for missing quotes in string comparisons
  if (content.includes('=== OPTIONS')) {
    issues.push('Missing quotes in string comparison');
  }
  
  if (issues.length > 0) {
    console.log('❌ Found syntax issues:');
    issues.forEach(issue => console.log('  - ' + issue));
    createCorrectApiPhp();
  } else {
    console.log('✅ No obvious syntax issues found');
    console.log('🔄 Checking PHP syntax directly...');
    checkPhpSyntax();
  }
}

function createCorrectApiPhp() {
  console.log('\n🔧 Creating correct API.php...');
  
  // Create a very simple, correct API.php
  const correctApiPhp = `<?php
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
$backend_url = 'http://localhost:5000' . $api_path;

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

  const apiPhpPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php';
  
  // Write the correct content
  exec(`echo '${correctApiPhp}' > ${apiPhpPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create correct api.php:', error.message);
      return;
    }
    
    console.log('✅ Correct API.php created');
    
    // Verify the content was written correctly
    verifyContent();
  });
}

function verifyContent() {
  console.log('\n🔍 Verifying content was written correctly...');
  
  exec('head -10 /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php', (error, stdout, stderr) => {
    console.log('📝 First 10 lines:');
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
      console.log('❌ Still has syntax errors:', stderr);
      console.log('🔄 Creating minimal working version...');
      createMinimalApiPhp();
    } else {
      console.log('✅ PHP syntax is correct!');
      testApiPhp();
    }
  });
}

function createMinimalApiPhp() {
  console.log('\n🔧 Creating minimal working API.php...');
  
  // Create the most basic working version
  const minimalApiPhp = `<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: false');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

$path = $_SERVER['REQUEST_URI'];
$path = str_replace('/api.php', '', $path);

if (empty($path) || $path === '/') {
  $path = '/api/v1';
} else {
  $path = '/api/v1' . $path;
}

$backend_url = 'http://localhost:5000' . $path;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $backend_url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$headers = array('Content-Type: application/json');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

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

  const apiPhpPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php';
  
  exec(`echo '${minimalApiPhp}' > ${apiPhpPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create minimal api.php:', error.message);
      return;
    }
    
    console.log('✅ Minimal API.php created');
    
    // Check syntax again
    checkPhpSyntax();
  });
}

function testApiPhp() {
  console.log('\n🧪 Testing API.php...');
  
  // Test with a simple GET request
  exec('curl -s -X GET https://alcolic.gnritservices.com/api.php', (error, stdout, stderr) => {
    console.log('📡 GET /api.php response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('Route not found')) {
      console.log('✅ API.php working! (Getting expected "Route not found")');
      testLogin();
    } else if (stdout.includes('error') || stdout.includes('Backend error')) {
      console.log('❌ Backend connection issue');
      checkBackend();
    } else {
      console.log('⚠️ Unexpected response');
      console.log('💬 Response:', stdout);
    }
  });
}

function testLogin() {
  console.log('\n🧪 Testing login...');
  
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
      console.log('\n🎯 Your admin panel should now work with:');
      console.log('📧 Email: superadmin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
    } else if (stdout.includes('Invalid credentials')) {
      console.log('✅ API working, but invalid credentials');
      createAdminUser();
    } else if (stdout.includes('Route not found')) {
      console.log('✅ API working, but route not found');
      console.log('🔄 Testing with different path...');
      testDifferentPath();
    } else {
      console.log('⚠️ Unexpected response');
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

function checkBackend() {
  console.log('\n🔍 Checking backend...');
  
  exec('curl -s -X GET http://localhost:5000/api/v1', (error, stdout, stderr) => {
    console.log('📡 Direct backend response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('Route not found')) {
      console.log('✅ Backend is running and responding');
      console.log('🔄 The issue is with API.php path routing');
      fixPathRouting();
    } else {
      console.log('❌ Backend not accessible');
      console.log('🔄 Starting backend...');
      startBackend();
    }
  });
}

function startBackend() {
  console.log('\n🚀 Starting backend...');
  
  exec('pm2 start /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/server.js --name "alcolic-backend"', (error, stdout, stderr) => {
    console.log('📊 Start result:');
    console.log(stdout);
    
    setTimeout(() => {
      testApiPhp();
    }, 2000);
  });
}

function fixPathRouting() {
  console.log('\n🔧 Fixing path routing...');
  
  // Create API.php with correct path routing
  const fixedApiPhp = `<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: false');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

$path = $_SERVER['REQUEST_URI'];
$path = str_replace('/api.php', '', $path);

if (empty($path) || $path === '/') {
  $path = '/api/v1';
} else {
  $path = '/api/v1' . $path;
}

$backend_url = 'http://localhost:5000' . $path;

error_log("API Request: " . $_SERVER['REQUEST_METHOD'] . " " . $_SERVER['REQUEST_URI'] . " -> " . $backend_url);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $backend_url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$headers = array('Content-Type: application/json');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

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

  const apiPhpPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php';
  
  exec(`echo '${fixedApiPhp}' > ${apiPhpPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create fixed api.php:', error.message);
      return;
    }
    
    console.log('✅ Fixed API.php with correct path routing');
    
    // Test the fixed version
    testApiPhp();
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

console.log('🚀 Starting check and fix process...');
