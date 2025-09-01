const { exec } = require('child_process');

console.log('🔧 Fixing API.php 500 error...');

// Check PHP error logs
function checkPhpErrors() {
  console.log('🔍 Checking PHP error logs...');
  
  // Try different possible error log locations
  const errorLogPaths = [
    '/home/u294447786/domains/alcolic.gnritservices.com/public_html/error_log',
    '/home/u294447786/domains/alcolic.gnritservices.com/logs/error_log',
    '/home/u294447786/logs/error_log',
    '/var/log/php_errors.log'
  ];
  
  errorLogPaths.forEach((path, index) => {
    exec(`tail -20 ${path} 2>/dev/null || echo "Log not found: ${path}"`, (error, stdout, stderr) => {
      console.log(`\n📋 Error log ${index + 1} (${path}):`);
      console.log(stdout);
    });
  });
}

// Check current api.php syntax
function checkApiPhpSyntax() {
  console.log('\n🔍 Checking api.php syntax...');
  
  const apiPhpPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php';
  
  exec(`php -l ${apiPhpPath}`, (error, stdout, stderr) => {
    console.log('📋 PHP syntax check:');
    console.log(stdout);
    
    if (error) {
      console.log('❌ PHP syntax error found');
      console.log('stderr:', stderr);
    } else {
      console.log('✅ PHP syntax is valid');
    }
  });
}

// Create a simpler, working api.php
function createSimpleApiPhp() {
  console.log('\n🔧 Creating simple, working api.php...');
  
  const simpleApiPhp = `<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

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

try {
  // Get the request path
  $request_uri = $_SERVER['REQUEST_URI'];
  $path = parse_url($request_uri, PHP_URL_PATH);
  
  // Remove /api.php from the path
  $api_path = str_replace('/api.php', '', $path);
  
  // If no path specified, default to /api/v1
  if (empty($api_path) || $api_path === '/') {
    $api_path = '/api/v1';
  }
  
  // Build the backend URL
  $backend_url = 'http://localhost:5000' . $api_path;
  
  // Get the query string
  $query_string = $_SERVER['QUERY_STRING'];
  if (!empty($query_string)) {
    $backend_url .= '?' . $query_string;
  }
  
  // Log the request for debugging
  error_log("API Request: " . $_SERVER['REQUEST_METHOD'] . " " . $backend_url);
  
  // Prepare cURL request
  $ch = curl_init();
  
  // Set the URL
  curl_setopt($ch, CURLOPT_URL, $backend_url);
  
  // Set the request method
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
  
  // Set headers
  $headers = [];
  foreach (getallheaders() as $name => $value) {
    if (strtolower($name) !== 'host') {
      $headers[] = "$name: $value";
    }
  }
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
  
  // Set request body for POST/PUT/PATCH
  if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH'])) {
    $input = file_get_contents('php://input');
    if (!empty($input)) {
      curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
      error_log("Request body: " . $input);
    }
  }
  
  // Set other options
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 30);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($ch, CURLOPT_VERBOSE, true);
  
  // Execute the request
  $response = curl_exec($ch);
  $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
  
  // Log response for debugging
  error_log("Backend response code: " . $http_code);
  error_log("Backend response: " . substr($response, 0, 200));
  
  // Check for errors
  if (curl_errno($ch)) {
    $error_msg = 'Backend connection failed: ' . curl_error($ch);
    error_log($error_msg);
    http_response_code(500);
    echo json_encode(['error' => $error_msg]);
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
  
} catch (Exception $e) {
  error_log("API.php error: " . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
?>`;

  const apiPhpPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php';
  
  // Write the new api.php file
  exec(`echo '${simpleApiPhp}' > ${apiPhpPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to write api.php:', error.message);
      return;
    }
    
    console.log('✅ Simple api.php created successfully');
    console.log('🔄 Testing the fix...');
    
    // Test the fix
    setTimeout(() => {
      testApiPhpFix();
    }, 1000);
  });
}

function testApiPhpFix() {
  console.log('\n🧪 Testing api.php fix...');
  
  exec('curl -s https://alcolic.gnritservices.com/api.php/products || echo "Test failed"', (error, stdout, stderr) => {
    console.log('📡 Test result:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('Test failed') || stdout.length === 0) {
      console.log('❌ api.php still not working');
      console.log('🔄 Checking PHP error logs again...');
      checkPhpErrors();
    } else {
      console.log('✅ api.php is working!');
      console.log('🎉 API routes should now be accessible');
      console.log('\n🎯 Next steps:');
      console.log('1. Test admin login');
      console.log('2. Check admin endpoints');
    }
  });
}

// Start the process
console.log('🚀 Starting API.php fix process...');

// First check current errors
checkPhpErrors();

// Then check syntax
setTimeout(() => {
  checkApiPhpSyntax();
}, 2000);

// Then create simple api.php
setTimeout(() => {
  createSimpleApiPhp();
}, 4000);
