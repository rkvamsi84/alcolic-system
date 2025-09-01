const { exec } = require('child_process');

console.log('🔍 Debugging PHP syntax error...');

// Let's see what's actually in the file and get the specific error
exec('cat /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Cannot read API.php:', error.message);
    return;
  }
  
  console.log('📄 Current API.php content:');
  console.log('='.repeat(50));
  console.log(stdout);
  console.log('='.repeat(50));
  
  // Get the specific PHP syntax error
  getPhpSyntaxError();
});

function getPhpSyntaxError() {
  console.log('\n🔍 Getting specific PHP syntax error...');
  
  exec('php -l /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php 2>&1', (error, stdout, stderr) => {
    console.log('📋 Full PHP syntax check output:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stderr) {
      console.log('📋 Error output:');
      console.log('='.repeat(50));
      console.log(stderr);
      console.log('='.repeat(50));
    }
    
    // Create a very simple test file
    createSimpleTestFile();
  });
}

function createSimpleTestFile() {
  console.log('\n🔧 Creating a very simple test file...');
  
  // Create the simplest possible PHP file
  const simpleTest = `<?php
echo "Hello World";
?>`;

  const testPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/test.php';
  
  exec(`echo '${simpleTest}' > ${testPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create test file:', error.message);
      return;
    }
    
    console.log('✅ Simple test file created');
    
    // Test the simple file
    testSimpleFile();
  });
}

function testSimpleFile() {
  console.log('\n🧪 Testing simple PHP file...');
  
  exec('php -l /home/u294447786/domains/alcolic.gnritservices.com/public_html/test.php', (error, stdout, stderr) => {
    console.log('📋 Simple file syntax check:');
    console.log(stdout);
    
    if (error) {
      console.log('❌ Even simple PHP file has syntax errors');
      console.log('🔄 This suggests a PHP configuration issue');
      checkPhpVersion();
    } else {
      console.log('✅ Simple PHP file works');
      console.log('🔄 The issue is with the API.php content');
      createWorkingApiPhp();
    }
  });
}

function checkPhpVersion() {
  console.log('\n🔍 Checking PHP version...');
  
  exec('php -v', (error, stdout, stderr) => {
    console.log('📋 PHP version:');
    console.log(stdout);
    
    // Try creating API.php with different approach
    createApiPhpWithFileWrite();
  });
}

function createApiPhpWithFileWrite() {
  console.log('\n🔧 Creating API.php using file write...');
  
  // Use a different approach to write the file
  const apiPhpContent = `<?php
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
  
  // Use printf to write the file (more reliable)
  exec(`printf '%s' '${apiPhpContent}' > ${apiPhpPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create API.php with printf:', error.message);
      console.log('🔄 Trying with cat...');
      createApiPhpWithCat();
    } else {
      console.log('✅ API.php created with printf');
      checkApiPhpSyntax();
    }
  });
}

function createApiPhpWithCat() {
  console.log('\n🔧 Creating API.php using cat...');
  
  const apiPhpPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php';
  
  // Create a temporary file first
  const tempContent = `<?php
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

  // Write to a temporary file first
  exec(`echo '${tempContent}' > /tmp/api_temp.php`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create temp file:', error.message);
      return;
    }
    
    console.log('✅ Temp file created');
    
    // Copy to the actual location
    exec(`cp /tmp/api_temp.php ${apiPhpPath}`, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Failed to copy file:', error.message);
        return;
      }
      
      console.log('✅ API.php copied from temp file');
      checkApiPhpSyntax();
    });
  });
}

function createWorkingApiPhp() {
  console.log('\n🔧 Creating working API.php...');
  
  const apiPhpPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php';
  
  // Create a very simple working version
  const workingApiPhp = `<?php
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

  // Use a different method to write the file
  exec(`cat > ${apiPhpPath} << 'EOF'
${workingApiPhp}
EOF`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create API.php with cat:', error.message);
      console.log('🔄 Trying manual creation...');
      createManualApiPhp();
    } else {
      console.log('✅ API.php created with cat');
      checkApiPhpSyntax();
    }
  });
}

function createManualApiPhp() {
  console.log('\n🔧 Creating API.php manually...');
  
  // Create the file line by line
  const commands = [
    'echo "<?php" > /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "header(\'Access-Control-Allow-Origin: *\');" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "header(\'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\');" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "header(\'Access-Control-Allow-Headers: Content-Type, Authorization\');" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "header(\'Access-Control-Allow-Credentials: false\');" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "if (\$_SERVER[\'REQUEST_METHOD\'] === \'OPTIONS\') {" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "  http_response_code(200);" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "  exit();" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "}" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "\$path = \$_SERVER[\'REQUEST_URI\'];" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "\$path = str_replace(\'/api.php\', \'\', \$path);" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "if (empty(\$path) || \$path === \'/\') {" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "  \$path = \'/api/v1\';" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "} else {" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "  \$path = \'/api/v1\' . \$path;" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "}" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "\$backend_url = \'http://localhost:5000\' . \$path;" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "\$ch = curl_init();" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "curl_setopt(\$ch, CURLOPT_URL, \$backend_url);" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "curl_setopt(\$ch, CURLOPT_CUSTOMREQUEST, \$_SERVER[\'REQUEST_METHOD\']);" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "curl_setopt(\$ch, CURLOPT_RETURNTRANSFER, true);" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "curl_setopt(\$ch, CURLOPT_TIMEOUT, 10);" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "curl_setopt(\$ch, CURLOPT_SSL_VERIFYPEER, false);" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "\$headers = array(\'Content-Type: application/json\');" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "curl_setopt(\$ch, CURLOPT_HTTPHEADER, \$headers);" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "if (\$_SERVER[\'REQUEST_METHOD\'] === \'POST\') {" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "  \$input = file_get_contents(\'php://input\');" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "  if (!empty(\$input)) {" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "    curl_setopt(\$ch, CURLOPT_POSTFIELDS, \$input);" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "  }" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "}" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "\$response = curl_exec(\$ch);" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "\$http_code = curl_getinfo(\$ch, CURLINFO_HTTP_CODE);" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "if (curl_errno(\$ch)) {" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "  http_response_code(500);" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "  echo json_encode(array(\'error\' => \'Backend error: \' . curl_error(\$ch)));" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "  curl_close(\$ch);" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "  exit();" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "}" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "curl_close(\$ch);" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "http_response_code(\$http_code);" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "echo \$response;" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php',
    'echo "?>" >> /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php'
  ];
  
  let currentCommand = 0;
  
  function executeNextCommand() {
    if (currentCommand >= commands.length) {
      console.log('✅ API.php created manually');
      checkApiPhpSyntax();
      return;
    }
    
    exec(commands[currentCommand], (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ Failed to execute command ${currentCommand + 1}:`, error.message);
        return;
      }
      
      currentCommand++;
      executeNextCommand();
    });
  }
  
  executeNextCommand();
}

function checkApiPhpSyntax() {
  console.log('\n🔧 Checking API.php syntax...');
  
  exec('php -l /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php', (error, stdout, stderr) => {
    console.log('📋 API.php syntax check:');
    console.log(stdout);
    
    if (error) {
      console.log('❌ Still has syntax errors');
      console.log('🔄 Let\'s see what\'s in the file now...');
      checkCurrentContent();
    } else {
      console.log('✅ API.php syntax is correct!');
      testApiPhp();
    }
  });
}

function checkCurrentContent() {
  console.log('\n🔍 Checking current API.php content...');
  
  exec('cat /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php', (error, stdout, stderr) => {
    console.log('📄 Current content:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    console.log('🔄 The issue might be with special characters');
    console.log('🔄 Let\'s try a different approach...');
    createUltraSimpleApiPhp();
  });
}

function createUltraSimpleApiPhp() {
  console.log('\n🔧 Creating ultra simple API.php...');
  
  const ultraSimple = `<?php
echo "Hello World";
?>`;

  const apiPhpPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php';
  
  exec(`echo '${ultraSimple}' > ${apiPhpPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create ultra simple API.php:', error.message);
      return;
    }
    
    console.log('✅ Ultra simple API.php created');
    
    // Test the ultra simple version
    exec('php -l /home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php', (error, stdout, stderr) => {
      console.log('📋 Ultra simple syntax check:');
      console.log(stdout);
      
      if (error) {
        console.log('❌ Even ultra simple version has syntax errors');
        console.log('🔄 This suggests a fundamental PHP issue');
        console.log('💡 Try accessing the file directly in browser');
      } else {
        console.log('✅ Ultra simple version works');
        console.log('🔄 Now let\'s build it up step by step...');
        buildApiPhpStepByStep();
      }
    });
  });
}

function buildApiPhpStepByStep() {
  console.log('\n🔧 Building API.php step by step...');
  
  // Start with the ultra simple version and add one line at a time
  const steps = [
    '<?php',
    'header(\'Access-Control-Allow-Origin: *\');',
    'header(\'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\');',
    'header(\'Access-Control-Allow-Headers: Content-Type, Authorization\');',
    'header(\'Access-Control-Allow-Credentials: false\');',
    '',
    'if ($_SERVER[\'REQUEST_METHOD\'] === \'OPTIONS\') {',
    '  http_response_code(200);',
    '  exit();',
    '}',
    '',
    '$path = $_SERVER[\'REQUEST_URI\'];',
    '$path = str_replace(\'/api.php\', \'\', $path);',
    '',
    'if (empty($path) || $path === \'/\') {',
    '  $path = \'/api/v1\';',
    '} else {',
    '  $path = \'/api/v1\' . $path;',
    '}',
    '',
    '$backend_url = \'http://localhost:5000\' . $path;',
    '',
    '$ch = curl_init();',
    'curl_setopt($ch, CURLOPT_URL, $backend_url);',
    'curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER[\'REQUEST_METHOD\']);',
    'curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);',
    'curl_setopt($ch, CURLOPT_TIMEOUT, 10);',
    'curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);',
    '',
    '$headers = array(\'Content-Type: application/json\');',
    'curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);',
    '',
    'if ($_SERVER[\'REQUEST_METHOD\'] === \'POST\') {',
    '  $input = file_get_contents(\'php://input\');',
    '  if (!empty($input)) {',
    '    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);',
    '  }',
    '}',
    '',
    '$response = curl_exec($ch);',
    '$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);',
    '',
    'if (curl_errno($ch)) {',
    '  http_response_code(500);',
    '  echo json_encode(array(\'error\' => \'Backend error: \' . curl_error($ch)));',
    '  curl_close($ch);',
    '  exit();',
    '}',
    '',
    'curl_close($ch);',
    '',
    'http_response_code($http_code);',
    'echo $response;',
    '?>'
  ];
  
  const apiPhpPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php';
  
  // Build the file step by step
  let currentStep = 0;
  
  function addNextStep() {
    if (currentStep >= steps.length) {
      console.log('✅ API.php built step by step');
      checkApiPhpSyntax();
      return;
    }
    
    const command = currentStep === 0 ? 
      `echo '${steps[currentStep]}' > ${apiPhpPath}` :
      `echo '${steps[currentStep]}' >> ${apiPhpPath}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ Failed to add step ${currentStep + 1}:`, error.message);
        return;
      }
      
      currentStep++;
      addNextStep();
    });
  }
  
  addNextStep();
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

console.log('🚀 Starting PHP error debug...');
