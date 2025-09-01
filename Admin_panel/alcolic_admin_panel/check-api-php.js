const { exec } = require('child_process');

console.log('🔍 Checking api.php configuration...');

const apiPhpPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php';

// Check if api.php exists
exec(`ls -la ${apiPhpPath}`, (error, stdout, stderr) => {
  if (error) {
    console.log('❌ api.php not found:', error.message);
    return;
  }
  
  console.log('✅ api.php found');
  console.log('📋 File info:');
  console.log(stdout);
  
  // Read api.php content
  exec(`cat ${apiPhpPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to read api.php:', error.message);
      return;
    }
    
    console.log('\n📄 api.php content:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    // Check if it's properly configured
    if (stdout.includes('localhost:5000')) {
      console.log('\n✅ api.php is configured for localhost:5000');
      
      // Check if backend is running on port 5000
      checkBackendPort();
      
    } else {
      console.log('\n❌ api.php is not configured for localhost:5000');
      console.log('🔄 Need to fix api.php configuration');
      fixApiPhp();
    }
  });
});

function checkBackendPort() {
  console.log('\n🔍 Checking if backend is running on port 5000...');
  
  exec('curl -s http://localhost:5000/api/v1/auth/login -X POST -H "Content-Type: application/json" -d \'{"email":"test","password":"test","role":"admin"}\' || echo "Backend not responding"', (error, stdout, stderr) => {
    console.log('📡 Backend test result:');
    console.log(stdout);
    
    if (stdout.includes('Backend not responding') || stdout.includes('curl: (7)')) {
      console.log('❌ Backend not responding on localhost:5000');
      checkBackendStatus();
    } else {
      console.log('✅ Backend is responding on localhost:5000');
      console.log('🎯 The issue is with api.php routing');
      fixApiPhp();
    }
  });
}

function checkBackendStatus() {
  console.log('\n🔍 Checking backend status...');
  
  exec('pm2 status', (error, stdout, stderr) => {
    console.log('📊 PM2 Status:');
    console.log(stdout);
    
    if (stdout.includes('alcolic-backend') && stdout.includes('online')) {
      console.log('✅ Backend is running in PM2');
      console.log('🔄 Restarting backend...');
      restartBackend();
    } else {
      console.log('❌ Backend is not running');
      console.log('🔄 Starting backend...');
      startBackend();
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
      checkBackendPort();
    }, 3000);
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
      checkBackendPort();
    }, 3000);
  });
}

function fixApiPhp() {
  console.log('\n🔧 Creating proper api.php file...');
  
  const apiPhpContent = `<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, X-localization');
header('Access-Control-Allow-Credentials: false');
header('Access-Control-Max-Age: 86400');

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
  echo json_encode(['error' => 'Backend connection failed: ' . curl_error($ch)]);
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

  // Write the new api.php file
  exec(`echo '${apiPhpContent}' > ${apiPhpPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to write api.php:', error.message);
      return;
    }
    
    console.log('✅ api.php updated successfully');
    console.log('🔄 Testing the fix...');
    
    // Test the fix
    setTimeout(() => {
      testApiPhp();
    }, 1000);
  });
}

function testApiPhp() {
  console.log('\n🧪 Testing api.php fix...');
  
  exec('curl -s https://alcolic.gnritservices.com/api.php/auth/login -X POST -H "Content-Type: application/json" -d \'{"email":"test","password":"test","role":"admin"}\' || echo "Test failed"', (error, stdout, stderr) => {
    console.log('📡 Test result:');
    console.log(stdout);
    
    if (stdout.includes('Test failed') || stdout.includes('curl: (7)')) {
      console.log('❌ api.php still not working');
    } else {
      console.log('✅ api.php is working!');
      console.log('🎉 Auth routes should now be accessible');
      console.log('\n🎯 Next steps:');
      console.log('1. Test admin login again');
      console.log('2. Check admin endpoints');
    }
  });
}

console.log('🚀 Starting api.php check...');
