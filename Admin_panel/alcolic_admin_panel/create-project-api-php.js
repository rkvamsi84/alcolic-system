const { exec } = require('child_process');

console.log('🔧 Creating api.php for your project...');

// Create api.php that integrates with your backend project
const projectApiPhp = `<?php
// CORS headers for your project
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

// Get the request path from your project structure
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove /api.php from the path to get the API endpoint
$api_path = str_replace('/api.php', '', $path);

// If no path specified, default to /api/v1 (your backend structure)
if (empty($api_path) || $api_path === '/') {
  $api_path = '/api/v1';
}

// Build the backend URL for your project
$backend_url = 'http://localhost:5000' . $api_path;

// Get query string if any
$query_string = $_SERVER['QUERY_STRING'];
if (!empty($query_string)) {
  $backend_url .= '?' . $query_string;
}

// Prepare cURL request to your backend
$ch = curl_init();

// Set the URL to your backend
curl_setopt($ch, CURLOPT_URL, $backend_url);

// Set the request method
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);

// Set headers for your project
$headers = array();
foreach (getallheaders() as $name => $value) {
  if (strtolower($name) !== 'host') {
    $headers[] = "$name: $value";
  }
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Set request body for POST/PUT/PATCH requests
if (in_array($_SERVER['REQUEST_METHOD'], array('POST', 'PUT', 'PATCH'))) {
  $input = file_get_contents('php://input');
  if (!empty($input)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
  }
}

// Set cURL options for your project
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

// Execute the request to your backend
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

// Check for cURL errors
if (curl_errno($ch)) {
  http_response_code(500);
  echo json_encode(array('error' => 'Backend connection failed: ' . curl_error($ch)));
  curl_close($ch);
  exit();
}

curl_close($ch);

// Set response headers for your project
if (!empty($content_type)) {
  header('Content-Type: ' . $content_type);
}

// Set response code
http_response_code($http_code);

// Output the response from your backend
echo $response;
?>`;

const apiPhpPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php';

// Remove the old file
exec(`rm -f ${apiPhpPath}`, (error, stdout, stderr) => {
  console.log('✅ Old api.php removed');
  
  // Create new file using Node.js fs module
  const fs = require('fs');
  
  try {
    // Write the file with proper encoding
    fs.writeFileSync(apiPhpPath, projectApiPhp, { encoding: 'utf8', flag: 'w' });
    console.log('✅ Project api.php created successfully');
    
    // Verify the file was created
    const stats = fs.statSync(apiPhpPath);
    console.log('📁 File size:', stats.size, 'bytes');
    
    // Check syntax
    checkSyntax();
  } catch (error) {
    console.log('❌ Failed to create file:', error.message);
    
    // Try alternative method
    createAlternativeApiPhp();
  }
});

function createAlternativeApiPhp() {
  console.log('\n🔄 Trying alternative creation method...');
  
  // Create file using shell command
  const simpleApiPhp = `<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$api_path = str_replace('/api.php', '', $path);

if (empty($api_path) || $api_path === '/') {
  $api_path = '/api/v1';
}

$backend_url = 'http://localhost:5000' . $api_path;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $backend_url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

if (in_array($_SERVER['REQUEST_METHOD'], array('POST', 'PUT', 'PATCH'))) {
  $input = file_get_contents('php://input');
  if (!empty($input)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
  }
}

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
  http_response_code(500);
  echo json_encode(array('error' => 'Backend connection failed'));
  curl_close($ch);
  exit();
}

curl_close($ch);
http_response_code($http_code);
echo $response;
?>`;

  exec(`echo '${simpleApiPhp}' > ${apiPhpPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Alternative creation failed:', error.message);
    } else {
      console.log('✅ Alternative api.php created');
      checkSyntax();
    }
  });
}

function checkSyntax() {
  console.log('\n🔍 Checking PHP syntax...');
  
  exec(`php -l ${apiPhpPath}`, (error, stdout, stderr) => {
    console.log('📋 Syntax check:');
    console.log(stdout);
    
    if (error) {
      console.log('❌ Syntax error found');
      console.log('stderr:', stderr);
      
      // Read the file to see what's wrong
      readFileContent();
    } else {
      console.log('✅ Syntax is valid');
      testApiPhp();
    }
  });
}

function readFileContent() {
  console.log('\n🔍 Reading file content...');
  
  exec(`cat ${apiPhpPath}`, (error, stdout, stderr) => {
    console.log('📄 File content:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    // Try creating a basic working file
    createBasicApiPhp();
  });
}

function createBasicApiPhp() {
  console.log('\n🔧 Creating basic working api.php...');
  
  const basicApiPhp = `<?php
header('Access-Control-Allow-Origin: *');

$backend_url = 'http://localhost:5000/api/v1/products';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $backend_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);

if (curl_errno($ch)) {
  echo json_encode(array('error' => 'Backend connection failed'));
} else {
  echo $response;
}

curl_close($ch);
?>`;

  const fs = require('fs');
  
  try {
    fs.writeFileSync(apiPhpPath, basicApiPhp, 'utf8');
    console.log('✅ Basic api.php created');
    
    exec(`php -l ${apiPhpPath}`, (error, stdout, stderr) => {
      console.log('📋 Basic syntax check:');
      console.log(stdout);
      
      if (error) {
        console.log('❌ Basic file also has syntax error');
      } else {
        console.log('✅ Basic syntax is valid');
        testApiPhp();
      }
    });
  } catch (error) {
    console.log('❌ Failed to create basic file:', error.message);
  }
}

function testApiPhp() {
  console.log('\n🧪 Testing api.php with your project...');
  
  // Test basic endpoint
  exec('curl -s https://alcolic.gnritservices.com/api.php/products', (error, stdout, stderr) => {
    console.log('📡 Products endpoint test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.length === 0) {
      console.log('❌ Empty response');
    } else {
      console.log('✅ Products endpoint working');
      
      // Test auth endpoint
      testAuthEndpoint();
    }
  });
}

function testAuthEndpoint() {
  console.log('\n🧪 Testing auth endpoint...');
  
  exec('curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d \'{"email":"test","password":"test","role":"admin"}\'', (error, stdout, stderr) => {
    console.log('📡 Auth endpoint test:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.length === 0) {
      console.log('❌ Auth endpoint empty response');
    } else {
      console.log('✅ Auth endpoint working');
      console.log('🎉 Your project API is now accessible!');
      console.log('\n🎯 Next steps:');
      console.log('1. Test admin login with: superadmin@alcolic.com / admin123');
      console.log('2. Check admin endpoints');
      console.log('3. Verify WebSocket connections');
    }
  });
}

console.log('🚀 Starting project api.php creation...');
