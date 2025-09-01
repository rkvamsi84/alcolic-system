const http = require('http');

function testEndpoint(path, description) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5003,
      path: `/api/v1${path}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`\n=== ${description} ===`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response:`, data);
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.log(`\n=== ${description} - ERROR ===`);
      console.log('Error:', error.message);
      resolve({ error: error.message });
    });

    req.end();
  });
}

async function testBothEndpoints() {
  console.log('Testing store endpoints...');
  
  await testEndpoint('/store/available', 'Store Available Endpoint');
  await testEndpoint('/stores/nearby?lat=19.0760&lng=72.8777&radius=50', 'Stores Nearby Endpoint');
  
  console.log('\n=== Test Complete ===');
}

testBothEndpoints().catch(console.error);