const fs = require('fs');
const path = require('path');

console.log('🔍 Checking main server file and routes...');

const backendPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend';

// Check main server file
const serverFile = path.join(backendPath, 'server.js');
if (fs.existsSync(serverFile)) {
  console.log('📁 Found server.js, checking routes...');
  const serverContent = fs.readFileSync(serverFile, 'utf8');
  
  // Look for route imports
  const routeMatches = serverContent.match(/require\(['"]([^'"]*routes[^'"]*)['"]\)/g);
  if (routeMatches) {
    console.log('🔍 Route imports found:');
    routeMatches.forEach(match => console.log(`  ${match}`));
  }
  
  // Look for app.use statements
  const appUseMatches = serverContent.match(/app\.use\([^)]*\)/g);
  if (appUseMatches) {
    console.log('🔍 App.use statements:');
    appUseMatches.forEach(match => console.log(`  ${match}`));
  }
}

// Check if there's a main app file
const appFile = path.join(backendPath, 'app.js');
if (fs.existsSync(appFile)) {
  console.log('📁 Found app.js, checking routes...');
  const appContent = fs.readFileSync(appFile, 'utf8');
  
  // Look for route imports
  const routeMatches = appContent.match(/require\(['"]([^'"]*routes[^'"]*)['"]\)/g);
  if (routeMatches) {
    console.log('🔍 Route imports found:');
    routeMatches.forEach(match => console.log(`  ${match}`));
  }
}

// Check all route files
const routesDir = path.join(backendPath, 'routes');
if (fs.existsSync(routesDir)) {
  console.log('\n📁 Checking all route files:');
  const routeFiles = fs.readdirSync(routesDir);
  
  routeFiles.forEach(file => {
    if (file.endsWith('.js')) {
      const filePath = path.join(routesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Look for login routes
      const loginRoutes = content.match(/app\.(post|get|put|delete)\s*\([^)]*login[^)]*\)/g);
      if (loginRoutes) {
        console.log(`\n🎯 Found login routes in ${file}:`);
        loginRoutes.forEach(route => console.log(`  ${route}`));
        
        // Show the login function
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('login') && (line.includes('app.') || line.includes('router.'))) {
            console.log(`📝 Line ${index + 1}: ${line.trim()}`);
            
            // Show the next few lines to see the function
            for (let i = 1; i <= 10; i++) {
              if (lines[index + i]) {
                console.log(`📝 Line ${index + i + 1}: ${lines[index + i].trim()}`);
              }
            }
          }
        });
      }
      
      // Look for JWT token generation
      if (content.includes('jwt.sign')) {
        console.log(`\n🎯 Found JWT in ${file}:`);
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('jwt.sign') || line.includes('role:')) {
            console.log(`📝 Line ${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  });
}

// Check if there are any other server files
console.log('\n🔍 Looking for other server files...');
const allFiles = fs.readdirSync(backendPath);
const serverFiles = allFiles.filter(file => 
  file.includes('server') || 
  file.includes('app') || 
  file.includes('index')
);

serverFiles.forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(backendPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('app.listen') || content.includes('server.listen')) {
      console.log(`📁 Found server file: ${file}`);
      
      // Look for route imports
      const routeMatches = content.match(/require\(['"]([^'"]*routes[^'"]*)['"]\)/g);
      if (routeMatches) {
        console.log(`🔍 Route imports in ${file}:`);
        routeMatches.forEach(match => console.log(`  ${match}`));
      }
    }
  }
});

console.log('\n🎯 Next steps:');
console.log('1. Check which route file contains the actual login endpoint');
console.log('2. Look for the JWT token generation in that file');
console.log('3. Fix the role assignment in the login route');
