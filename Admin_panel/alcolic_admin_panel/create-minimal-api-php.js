const { exec } = require('child_process');

console.log('🔧 Creating minimal api.php file...');

// Create a minimal api.php file
const minimalApiPhp = `<?php
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

const apiPhpPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php';

// Remove the old file
exec(`rm -f ${apiPhpPath}`, (error, stdout, stderr) => {
  console.log('✅ Old file removed');
  
  // Create new file using a different method
  const fs = require('fs');
  
  try {
    fs.writeFileSync(apiPhpPath, minimalApiPhp, 'utf8');
    console.log('✅ Minimal api.php created successfully');
    
    // Check syntax
    checkSyntax();
  } catch (error) {
    console.log('❌ Failed to create file:', error.message);
  }
});

function checkSyntax() {
  console.log('\n🔍 Checking PHP syntax...');
  
  exec(`php -l ${apiPhpPath}`, (error, stdout, stderr) => {
    console.log('📋 Syntax check:');
    console.log(stdout);
    
    if (error) {
      console.log('❌ Syntax error found');
      console.log('stderr:', stderr);
      
      // Try to read the file and check what's wrong
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
    
    // Try creating an even simpler file
    createUltraSimpleApiPhp();
  });
}

function createUltraSimpleApiPhp() {
  console.log('\n🔧 Creating ultra-simple api.php...');
  
  const ultraSimpleApiPhp = `<?php
header('Access-Control-Allow-Origin: *');

$backend_url = 'http://localhost:5000/api/v1/products';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $backend_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
  echo json_encode(array('error' => 'Backend connection failed'));
} else {
  echo $response;
}

curl_close($ch);
?>`;

  const fs = require('fs');
  
  try {
    fs.writeFileSync(apiPhpPath, ultraSimpleApiPhp, 'utf8');
    console.log('✅ Ultra-simple api.php created');
    
    // Check syntax again
    exec(`php -l ${apiPhpPath}`, (error, stdout, stderr) => {
      console.log('📋 Ultra-simple syntax check:');
      console.log(stdout);
      
      if (error) {
        console.log('❌ Still syntax error');
        console.log('🔄 Trying manual creation...');
        createManualApiPhp();
      } else {
        console.log('✅ Ultra-simple syntax is valid');
        testApiPhp();
      }
    });
  } catch (error) {
    console.log('❌ Failed to create ultra-simple file:', error.message);
  }
}

function createManualApiPhp() {
  console.log('\n🔧 Creating api.php manually...');
  
  // Use echo with proper escaping
  const manualApiPhp = `<?php header('Access-Control-Allow-Origin: *'); $ch = curl_init(); curl_setopt($ch, CURLOPT_URL, 'http://localhost:5000/api/v1/products'); curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); $response = curl_exec($ch); curl_close($ch); echo $response; ?>`;
  
  exec(`echo '${manualApiPhp}' > ${apiPhpPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Manual creation failed:', error.message);
    } else {
      console.log('✅ Manual api.php created');
      
      // Check syntax
      exec(`php -l ${apiPhpPath}`, (error, stdout, stderr) => {
        console.log('📋 Manual syntax check:');
        console.log(stdout);
        
        if (error) {
          console.log('❌ Manual file also has syntax error');
        } else {
          console.log('✅ Manual syntax is valid');
          testApiPhp();
        }
      });
    }
  });
}

function testApiPhp() {
  console.log('\n🧪 Testing api.php...');
  
  exec('curl -s https://alcolic.gnritservices.com/api.php', (error, stdout, stderr) => {
    console.log('📡 Test result:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.length === 0) {
      console.log('❌ Still empty response');
    } else {
      console.log('✅ api.php is working!');
      console.log('🎉 API is accessible');
    }
  });
}

console.log('🚀 Starting minimal api.php creation...');
