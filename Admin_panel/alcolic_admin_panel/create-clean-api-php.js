const { exec } = require('child_process');

console.log('🧹 Creating clean api.php file...');

// Create a completely clean api.php file
const cleanApiPhp = `<?php
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

// Remove the old file first
exec(`rm -f ${apiPhpPath}`, (error, stdout, stderr) => {
  if (error) {
    console.log('⚠️ Could not remove old file:', error.message);
  } else {
    console.log('✅ Old api.php removed');
  }
  
  // Create the new file
  exec(`echo '${cleanApiPhp}' > ${apiPhpPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create api.php:', error.message);
      return;
    }
    
    console.log('✅ Clean api.php created successfully');
    
    // Check syntax
    checkSyntax();
  });
});

function checkSyntax() {
  console.log('\n🔍 Checking PHP syntax...');
  
  exec(`php -l ${apiPhpPath}`, (error, stdout, stderr) => {
    console.log('📋 Syntax check:');
    console.log(stdout);
    
    if (error) {
      console.log('❌ Syntax error found');
      console.log('stderr:', stderr);
    } else {
      console.log('✅ Syntax is valid');
      
      // Test the file
      testApiPhp();
    }
  });
}

function testApiPhp() {
  console.log('\n🧪 Testing clean api.php...');
  
  exec('curl -s https://alcolic.gnritservices.com/api.php/products', (error, stdout, stderr) => {
    console.log('📡 Test result:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.length === 0) {
      console.log('❌ Still getting empty response');
      console.log('🔄 Testing with verbose curl...');
      testVerbose();
    } else {
      console.log('✅ api.php is working!');
      console.log('🎉 API routes should now be accessible');
      console.log('\n🎯 Next steps:');
      console.log('1. Test admin login');
      console.log('2. Check admin endpoints');
    }
  });
}

function testVerbose() {
  console.log('\n🔍 Verbose test...');
  
  exec('curl -v https://alcolic.gnritservices.com/api.php/products 2>&1', (error, stdout, stderr) => {
    console.log('📡 Verbose result:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('500')) {
      console.log('❌ Still getting 500 error');
      console.log('🔄 Checking if backend is running...');
      checkBackend();
    } else {
      console.log('✅ Verbose test shows improvement');
    }
  });
}

function checkBackend() {
  console.log('\n🔍 Checking backend status...');
  
  exec('pm2 status', (error, stdout, stderr) => {
    console.log('📊 PM2 Status:');
    console.log(stdout);
    
    if (stdout.includes('alcolic-backend') && stdout.includes('online')) {
      console.log('✅ Backend is running');
      console.log('🔄 Testing direct backend connection...');
      testDirectBackend();
    } else {
      console.log('❌ Backend is not running');
      console.log('🔄 Starting backend...');
      startBackend();
    }
  });
}

function testDirectBackend() {
  console.log('\n🧪 Testing direct backend...');
  
  exec('curl -s http://localhost:5000/api/v1/products', (error, stdout, stderr) => {
    console.log('📡 Direct backend result:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.length === 0) {
      console.log('❌ Backend not responding');
    } else {
      console.log('✅ Backend is responding');
      console.log('🎯 Issue is with api.php routing');
    }
  });
}

function startBackend() {
  console.log('\n🚀 Starting backend...');
  
  const backendPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend';
  
  exec(`cd ${backendPath} && pm2 start server.js --name "alcolic-backend"`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to start backend:', error.message);
      return;
    }
    
    console.log('✅ Backend started successfully');
    console.log(stdout);
    
    // Wait and test again
    setTimeout(() => {
      testApiPhp();
    }, 3000);
  });
}

console.log('🚀 Starting clean api.php creation...');
