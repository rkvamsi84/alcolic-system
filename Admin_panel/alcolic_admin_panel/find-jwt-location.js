const fs = require('fs');
const path = require('path');

console.log('🔍 Finding where JWT token generation actually is...');

const backendPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend';

// Function to search for JWT patterns in a file
function searchForJWT(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Look for JWT patterns
    const patterns = [
      /jwt\.sign/g,
      /role\s*:\s*req\.body\.role/g,
      /role:\s*req\.body\.role/g,
      /login.*jwt/g,
      /token.*jwt/g
    ];
    
    let matches = [];
    patterns.forEach(pattern => {
      const found = content.match(pattern);
      if (found) {
        matches.push(...found);
      }
    });
    
    if (matches.length > 0) {
      return { filePath, matches, content };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Search in all JavaScript files
function searchRecursively(dir) {
  const results = [];
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        results.push(...searchRecursively(filePath));
      } else if (file.endsWith('.js')) {
        const result = searchForJWT(filePath);
        if (result) {
          results.push(result);
        }
      }
    }
  } catch (error) {
    console.log(`❌ Error searching ${dir}: ${error.message}`);
  }
  
  return results;
}

console.log('🔍 Searching for JWT patterns in all files...');
const results = searchRecursively(backendPath);

if (results.length > 0) {
  console.log(`\n🎯 Found ${results.length} files with JWT patterns:`);
  
  results.forEach((result, index) => {
    console.log(`\n📁 File ${index + 1}: ${result.filePath}`);
    console.log(`🔍 Matches: ${result.matches.join(', ')}`);
    
    // Show the relevant lines
    const lines = result.content.split('\n');
    lines.forEach((line, lineIndex) => {
      if (line.includes('jwt') || line.includes('role') || line.includes('login')) {
        console.log(`📝 Line ${lineIndex + 1}: ${line.trim()}`);
      }
    });
  });
  
  // Focus on the most likely file (auth-related)
  const authFiles = results.filter(r => 
    r.filePath.includes('auth') || 
    r.filePath.includes('login') || 
    r.filePath.includes('user')
  );
  
  if (authFiles.length > 0) {
    console.log('\n🎯 Most likely auth files:');
    authFiles.forEach(file => {
      console.log(`📁 ${file.filePath}`);
    });
  }
  
} else {
  console.log('❌ No JWT patterns found in any files');
}

console.log('\n🔍 Also checking for login routes...');

// Check specific files that might contain login logic
const specificFiles = [
  'routes/auth.js',
  'routes/user.js',
  'routes/admin.js',
  'controllers/authController.js',
  'controllers/userController.js',
  'middleware/auth.js',
  'server.js',
  'app.js'
];

specificFiles.forEach(file => {
  const fullPath = path.join(backendPath, file);
  if (fs.existsSync(fullPath)) {
    console.log(`📁 Checking: ${file}`);
    const result = searchForJWT(fullPath);
    if (result) {
      console.log(`✅ Found JWT in: ${file}`);
      console.log(`🔍 Matches: ${result.matches.join(', ')}`);
    } else {
      console.log(`ℹ️  No JWT found in: ${file}`);
    }
  }
});

console.log('\n🎯 Next steps:');
console.log('1. Look at the files above that contain JWT patterns');
console.log('2. Find the login route that generates the token');
console.log('3. Fix the role assignment in that specific file');
