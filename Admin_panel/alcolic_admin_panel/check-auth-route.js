const fs = require('fs');
const path = require('path');

console.log('🔍 Checking auth route file...');

const authFile = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/auth.js';

if (fs.existsSync(authFile)) {
  console.log('📁 Found auth.js file');
  const content = fs.readFileSync(authFile, 'utf8');
  
  console.log('📄 File contents:');
  console.log('='.repeat(50));
  
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    console.log(`${index + 1}: ${line}`);
  });
  
  console.log('='.repeat(50));
  
  // Look for specific patterns
  console.log('\n🔍 Looking for specific patterns:');
  
  // Look for login route
  const loginRoute = content.match(/router\.(post|get|put|delete)\s*\([^)]*login[^)]*\)/g);
  if (loginRoute) {
    console.log('🎯 Login routes found:');
    loginRoute.forEach(route => console.log(`  ${route}`));
  }
  
  // Look for JWT token generation
  if (content.includes('jwt.sign')) {
    console.log('🎯 JWT token generation found:');
    lines.forEach((line, index) => {
      if (line.includes('jwt.sign') || line.includes('role:')) {
        console.log(`📝 Line ${index + 1}: ${line.trim()}`);
      }
    });
  }
  
  // Look for role assignment
  if (content.includes('role')) {
    console.log('🎯 Role-related code found:');
    lines.forEach((line, index) => {
      if (line.includes('role') && (line.includes('req.body') || line.includes('user.'))) {
        console.log(`📝 Line ${index + 1}: ${line.trim()}`);
      }
    });
  }
  
} else {
  console.log('❌ auth.js file not found');
}

console.log('\n🎯 Next steps:');
console.log('1. Look at the auth route file above');
console.log('2. Find the login endpoint and JWT token generation');
console.log('3. Fix the role assignment in the login route');
