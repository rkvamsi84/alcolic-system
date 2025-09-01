const { exec } = require('child_process');

console.log('🔧 Fixing API.php routing...');

// The issue is that API.php is not properly extracting the path
// Let's create a fixed version that correctly routes to the backend

const fixedApiPhp = `<?php
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

// Get the request path correctly
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove /api.php from the path to get the actual API endpoint
$api_path = str_replace('/api.php', '', $path);

// If no path specified, default to /api/v1
if (empty($api_path) || $api_path === '/') {
  $api_path = '/api/v1';
}

// Build the backend URL
$backend_url = 'http://localhost:5000' . $api_path;

// Get query string if any
$query_string = $_SERVER['QUERY_STRING'];
if (!empty($query_string)) {
  $backend_url .= '?' . $query_string;
}

// Log the routing for debugging
error_log("API Request: " . $_SERVER['REQUEST_METHOD'] . " " . $request_uri . " -> " . $backend_url);

// Prepare cURL request
$ch = curl_init();

// Set the URL
curl_setopt($ch, CURLOPT_URL, $backend_url);

// Set the request method
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);

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

// Set other options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

// Execute the request
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

// Output the response
echo $response;
?>`;

const apiPhpPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php';

// Create the fixed api.php
exec(`echo '${fixedApiPhp}' > ${apiPhpPath}`, (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Failed to create fixed api.php:', error.message);
    return;
  }
  
  console.log('✅ Fixed api.php created successfully');
  
  // Test the fix
  testFixedApi();
});

function testFixedApi() {
  console.log('\n🧪 Testing fixed API.php...');
  
  // Test with valid admin credentials
  const testData = JSON.stringify({
    email: 'superadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  console.log('📝 Testing with valid credentials:', testData);
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${testData}'`, (error, stdout, stderr) => {
    console.log('📡 Response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('Route not found')) {
      console.log('❌ Still getting "Route not found"');
      console.log('🔄 Testing different path formats...');
      testPathFormats();
    } else if (stdout.includes('Invalid credentials')) {
      console.log('✅ API routing is working! (Getting validation error)');
      console.log('🎯 Now test with correct credentials');
      testWithCorrectCredentials();
    } else if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! Admin login working!');
      console.log('✅ API.php routing is fixed!');
      console.log('\n🎯 Admin credentials:');
      console.log('📧 Email: superadmin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
    } else {
      console.log('⚠️ Unexpected response');
      console.log('🔄 Testing with different approach...');
      testPathFormats();
    }
  });
}

function testPathFormats() {
  console.log('\n🧪 Testing different path formats...');
  
  const testPaths = [
    '/api.php/auth/login',
    '/api.php/api/v1/auth/login',
    '/api.php/v1/auth/login'
  ];
  
  const testData = JSON.stringify({
    email: 'superadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  testPaths.forEach((path, index) => {
    setTimeout(() => {
      testPath(path, testData, index + 1);
    }, index * 1000);
  });
}

function testPath(path, testData, testNumber) {
  console.log(`\n🧪 Test ${testNumber}: ${path}`);
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com${path} -H "Content-Type: application/json" -d '${testData}'`, (error, stdout, stderr) => {
    console.log('📡 Response:');
    console.log(stdout);
    
    if (stdout.includes('Route not found')) {
      console.log(`❌ Test ${testNumber} still returns "Route not found"`);
    } else if (stdout.includes('Invalid credentials')) {
      console.log(`✅ Test ${testNumber} working! (Getting validation error)`);
    } else if (stdout.includes('success') && stdout.includes('true')) {
      console.log(`🎉 Test ${testNumber} SUCCESS! Login working!`);
    } else {
      console.log(`⚠️ Test ${testNumber} unexpected response`);
    }
  });
}

function testWithCorrectCredentials() {
  console.log('\n🧪 Testing with correct credentials...');
  
  // First, let's create the admin user if it doesn't exist
  const registerData = JSON.stringify({
    name: 'Super Admin',
    email: 'superadmin@alcolic.com',
    phone: '+1234567891',
    password: 'admin123',
    role: 'admin'
  });
  
  console.log('📝 Creating admin user...');
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/register -H "Content-Type: application/json" -d '${registerData}'`, (error, stdout, stderr) => {
    console.log('📡 Register response:');
    console.log(stdout);
    
    if (stdout.includes('already exists')) {
      console.log('✅ Admin user already exists');
    } else if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ Admin user created successfully');
    }
    
    // Now test login
    setTimeout(() => {
      testLogin();
    }, 1000);
  });
}

function testLogin() {
  console.log('\n🧪 Testing admin login...');
  
  const loginData = JSON.stringify({
    email: 'superadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${loginData}'`, (error, stdout, stderr) => {
    console.log('📡 Login response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! Admin login working!');
      console.log('✅ API.php routing is completely fixed!');
      console.log('\n🎯 Your admin panel should now work with:');
      console.log('📧 Email: superadmin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
    } else {
      console.log('❌ Login still failing');
      console.log('🔄 Checking what went wrong...');
      console.log('💬 Response:', stdout);
    }
  });
}

console.log('🚀 Starting API routing fix...');
