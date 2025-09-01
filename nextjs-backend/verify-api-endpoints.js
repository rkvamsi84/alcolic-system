#!/usr/bin/env node

/**
 * API Endpoints Verification Script
 * Tests all API endpoints to ensure they work correctly
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'https://alcolic-api.vercel.app';
const API_VERSION = 'v1';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  total: 0,
  errors: []
};

// Helper function to make HTTP requests
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const protocol = urlObj.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test function
async function testEndpoint(name, endpoint, method = 'GET', data = null, expectedStatus = 200) {
  const url = `${API_BASE_URL}${endpoint}`;
  results.total++;
  
  try {
    console.log(`${colors.blue}Testing:${colors.reset} ${name}`);
    console.log(`${colors.cyan}URL:${colors.reset} ${url}`);
    
    const response = await makeRequest(url, method, data);
    
    if (response.status === expectedStatus) {
      console.log(`${colors.green}✅ PASSED${colors.reset} - Status: ${response.status}`);
      results.passed++;
    } else {
      console.log(`${colors.red}❌ FAILED${colors.reset} - Expected: ${expectedStatus}, Got: ${response.status}`);
      results.failed++;
      results.errors.push({
        name,
        url,
        expected: expectedStatus,
        actual: response.status,
        response: response.data
      });
    }
    
    // Show response data for successful requests
    if (response.status === expectedStatus && response.data) {
      if (response.data.success !== undefined) {
        console.log(`${colors.yellow}Response:${colors.reset} Success: ${response.data.success}`);
      }
      if (response.data.count !== undefined) {
        console.log(`${colors.yellow}Count:${colors.reset} ${response.data.count}`);
      }
    }
    
  } catch (error) {
    console.log(`${colors.red}❌ ERROR${colors.reset} - ${error.message}`);
    results.failed++;
    results.errors.push({
      name,
      url,
      error: error.message
    });
  }
  
  console.log(''); // Empty line for readability
}

// Main test function
async function runTests() {
  console.log(`${colors.bright}${colors.blue}🚀 ALCOLIC API ENDPOINTS VERIFICATION${colors.reset}\n`);
  console.log(`${colors.cyan}API Base URL:${colors.reset} ${API_BASE_URL}`);
  console.log(`${colors.cyan}API Version:${colors.reset} ${API_VERSION}\n`);
  
  // Health check
  await testEndpoint('Health Check', '/api/health');
  
  // Public endpoints
  await testEndpoint('Categories List', '/api/v1/categories');
  await testEndpoint('Products List', '/api/v1/products');
  await testEndpoint('Stores List', '/api/v1/stores');
  
  // Test with authentication (using a test token)
  const testToken = 'test-token'; // This will fail but test the endpoint structure
  
  // Test login endpoint
  await testEndpoint('Login Endpoint', '/api/v1/auth/login', 'POST', {
    email: 'test@example.com',
    password: 'testpassword'
  }, 400); // Expected to fail with invalid credentials
  
  // Test protected endpoints (will fail without valid token)
  await testEndpoint('Protected Profile', '/api/v1/auth/me', 'GET', null, 401);
  await testEndpoint('Protected Orders', '/api/v1/orders', 'GET', null, 401);
  await testEndpoint('Protected Users', '/api/v1/users', 'GET', null, 401);
  
  // Test specific endpoints
  await testEndpoint('Category by ID (First)', '/api/v1/categories/689ecfbf6a33dae8b0aaf024');
  
  // Test API index
  await testEndpoint('API Index', '/api/v1');
  
  // Socket.io endpoint
  await testEndpoint('Socket.io Endpoint', '/api/socket', 'GET', null, 200);
  
  // Print results
  console.log(`${colors.bright}${colors.blue}📊 TEST RESULTS${colors.reset}\n`);
  console.log(`${colors.green}✅ Passed:${colors.reset} ${results.passed}`);
  console.log(`${colors.red}❌ Failed:${colors.reset} ${results.failed}`);
  console.log(`${colors.cyan}📊 Total:${colors.reset} ${results.total}`);
  console.log(`${colors.yellow}📈 Success Rate:${colors.reset} ${((results.passed / results.total) * 100).toFixed(1)}%\n`);
  
  if (results.errors.length > 0) {
    console.log(`${colors.red}🔍 ERROR DETAILS:${colors.reset}\n`);
    results.errors.forEach((error, index) => {
      console.log(`${colors.red}${index + 1}. ${error.name}${colors.reset}`);
      console.log(`   URL: ${error.url}`);
      if (error.expected) {
        console.log(`   Expected: ${error.expected}, Actual: ${error.actual}`);
      }
      if (error.error) {
        console.log(`   Error: ${error.error}`);
      }
      console.log('');
    });
  }
  
  // Final status
  if (results.failed === 0) {
    console.log(`${colors.green}${colors.bright}🎉 ALL TESTS PASSED! Your API is working perfectly!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}${colors.bright}⚠️  Some tests failed. Check the error details above.${colors.reset}`);
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testEndpoint };
