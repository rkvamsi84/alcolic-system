const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Creating Frontend Applications...');

// Frontend directories
const adminPanelDir = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/admin-panel';
const storePanelDir = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/store-panel';
const userWebAppDir = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/user-web-app';

function createAdminPanel() {
  console.log('\n👨‍💼 Creating Admin Panel...');
  
  exec(`cd /home/u294447786/domains/alcolic.gnritservices.com/public_html && npx create-react-app admin-panel --yes`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create admin panel:', error.message);
      return;
    }
    
    console.log('✅ Admin panel created');
    installAdminDependencies();
  });
}

function installAdminDependencies() {
  console.log('\n📦 Installing admin panel dependencies...');
  
  const dependencies = [
    'axios',
    'socket.io-client',
    'react-router-dom',
    '@mui/material',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled',
    'recharts',
    'react-hook-form',
    'yup',
    '@hookform/resolvers',
    'date-fns',
    'react-dropzone',
    'react-hot-toast'
  ];
  
  exec(`cd ${adminPanelDir} && npm install ${dependencies.join(' ')}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to install admin dependencies:', error.message);
      return;
    }
    
    console.log('✅ Admin panel dependencies installed');
    createStorePanel();
  });
}

function createStorePanel() {
  console.log('\n🏪 Creating Store Panel...');
  
  exec(`cd /home/u294447786/domains/alcolic.gnritservices.com/public_html && npx create-react-app store-panel --yes`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create store panel:', error.message);
      return;
    }
    
    console.log('✅ Store panel created');
    installStoreDependencies();
  });
}

function installStoreDependencies() {
  console.log('\n📦 Installing store panel dependencies...');
  
  const dependencies = [
    'axios',
    'socket.io-client',
    'react-router-dom',
    '@mui/material',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled',
    'recharts',
    'react-hook-form',
    'yup',
    '@hookform/resolvers',
    'date-fns',
    'react-dropzone',
    'react-hot-toast'
  ];
  
  exec(`cd ${storePanelDir} && npm install ${dependencies.join(' ')}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to install store dependencies:', error.message);
      return;
    }
    
    console.log('✅ Store panel dependencies installed');
    createUserWebApp();
  });
}

function createUserWebApp() {
  console.log('\n🛒 Creating User Web App...');
  
  exec(`cd /home/u294447786/domains/alcolic.gnritservices.com/public_html && npx create-react-app user-web-app --yes`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create user web app:', error.message);
      return;
    }
    
    console.log('✅ User web app created');
    installUserDependencies();
  });
}

function installUserDependencies() {
  console.log('\n📦 Installing user web app dependencies...');
  
  const dependencies = [
    'axios',
    'socket.io-client',
    'react-router-dom',
    '@mui/material',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled',
    'react-hook-form',
    'yup',
    '@hookform/resolvers',
    'react-hot-toast',
    'react-image-gallery',
    'react-slick',
    'slick-carousel'
  ];
  
  exec(`cd ${userWebAppDir} && npm install ${dependencies.join(' ')}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to install user dependencies:', error.message);
      return;
    }
    
    console.log('✅ User web app dependencies installed');
    createApiConfigs();
  });
}

function createApiConfigs() {
  console.log('\n🔧 Creating API configurations...');
  
  // Admin Panel API Config
  const adminApiConfig = `// API Configuration for Admin Panel
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://alcolic.gnritservices.com/api.php',
  socketURL: process.env.REACT_APP_SOCKET_URL || 'https://alcolic.gnritservices.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  credentials: 'omit'
};

// API Client
import axios from 'axios';

const apiClient = axios.create(API_CONFIG);

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;`;
  
  fs.writeFileSync(path.join(adminPanelDir, 'src/api/config.js'), adminApiConfig);
  console.log('✅ Admin panel API config created');
  
  // Store Panel API Config
  const storeApiConfig = `// API Configuration for Store Panel
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://alcolic.gnritservices.com/api.php',
  socketURL: process.env.REACT_APP_SOCKET_URL || 'https://alcolic.gnritservices.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  credentials: 'omit'
};

// API Client
import axios from 'axios';

const apiClient = axios.create(API_CONFIG);

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;`;
  
  fs.writeFileSync(path.join(storePanelDir, 'src/api/config.js'), storeApiConfig);
  console.log('✅ Store panel API config created');
  
  // User Web App API Config
  const userApiConfig = `// API Configuration for User Web App
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://alcolic.gnritservices.com/api.php',
  socketURL: process.env.REACT_APP_SOCKET_URL || 'https://alcolic.gnritservices.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  credentials: 'omit'
};

// API Client
import axios from 'axios';

const apiClient = axios.create(API_CONFIG);

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;`;
  
  fs.writeFileSync(path.join(userWebAppDir, 'src/api/config.js'), userApiConfig);
  console.log('✅ User web app API config created');
  
  createDeploymentFiles();
}

function createDeploymentFiles() {
  console.log('\n🚀 Creating deployment files...');
  
  // API.php for Hostinger
  const apiPhp = `<?php
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
  
  fs.writeFileSync('/home/u294447786/domains/alcolic.gnritservices.com/public_html/api.php', apiPhp);
  console.log('✅ API.php created');
  
  // .htaccess files
  createHtaccessFiles();
}

function createHtaccessFiles() {
  console.log('\n📄 Creating .htaccess files...');
  
  // Main .htaccess
  const mainHtaccess = `# CORS Headers
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, Accept, X-localization"
Header always set Access-Control-Allow-Credentials "false"

# Handle preflight requests
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# React Router for main app
RewriteEngine On
RewriteBase /
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]`;
  
  fs.writeFileSync('/home/u294447786/domains/alcolic.gnritservices.com/public_html/.htaccess', mainHtaccess);
  console.log('✅ Main .htaccess created');
  
  // Admin panel .htaccess
  const adminHtaccess = `# CORS Headers
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, Accept, X-localization"
Header always set Access-Control-Allow-Credentials "false"

# Handle preflight requests
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# React Router for admin panel
RewriteEngine On
RewriteBase /
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]`;
  
  fs.writeFileSync('/home/u294447786/domains/alcolic.gnritservices.com/public_html/admin-panel/.htaccess', adminHtaccess);
  console.log('✅ Admin panel .htaccess created');
  
  // Store panel .htaccess
  const storeHtaccess = `# CORS Headers
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, Accept, X-localization"
Header always set Access-Control-Allow-Credentials "false"

# Handle preflight requests
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# React Router for store panel
RewriteEngine On
RewriteBase /
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]`;
  
  fs.writeFileSync('/home/u294447786/domains/alcolic.gnritservices.com/public_html/store-panel/.htaccess', storeHtaccess);
  console.log('✅ Store panel .htaccess created');
  
  console.log('\n🎉 Frontend applications created successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Build frontend applications');
  console.log('2. Start backend server');
  console.log('3. Configure domains');
  console.log('4. Test the complete system');
}

console.log('🚀 Starting frontend creation...');
createAdminPanel();
