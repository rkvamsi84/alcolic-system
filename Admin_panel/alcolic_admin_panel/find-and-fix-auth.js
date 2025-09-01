const fs = require('fs');
const path = require('path');

console.log('🔍 Finding and fixing the actual auth route...');

// Function to search for JWT token generation in files
function searchForJWTInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Look for JWT token generation patterns
    const jwtPatterns = [
      /jwt\.sign\s*\(\s*\{[^}]*role[^}]*\}/g,
      /role\s*:\s*req\.body\.role/g,
      /role:\s*req\.body\.role/g
    ];
    
    let hasJWT = false;
    jwtPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasJWT = true;
      }
    });
    
    return hasJWT;
  } catch (error) {
    return false;
  }
}

// Function to fix JWT token generation
function fixJWTInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    console.log(`📁 Checking: ${filePath}`);
    
    // Fix patterns
    content = content.replace(
      /role\s*:\s*req\.body\.role/g,
      'role: user.role'
    );
    
    content = content.replace(
      /role:\s*req\.body\.role/g,
      'role: user.role'
    );
    
    if (content !== originalContent) {
      // Create backup
      fs.writeFileSync(filePath + '.backup', originalContent);
      console.log(`💾 Backup created: ${filePath}.backup`);
      
      // Write fixed content
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`❌ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

// Search in common locations
const searchPaths = [
  '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/auth.js',
  '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/admin.js',
  '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/controllers/authController.js',
  '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/controllers/adminController.js',
  '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/middleware/auth.js',
  '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/user.js',
  '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/index.js'
];

console.log('🔍 Searching for auth files...');

let foundFiles = [];
searchPaths.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`📁 Found: ${filePath}`);
    if (searchForJWTInFile(filePath)) {
      console.log(`🎯 Contains JWT: ${filePath}`);
      foundFiles.push(filePath);
    }
  }
});

// Also search recursively in routes directory
const routesDir = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes';
if (fs.existsSync(routesDir)) {
  console.log('🔍 Searching recursively in routes directory...');
  
  function searchRecursively(dir) {
    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          searchRecursively(filePath);
        } else if (file.endsWith('.js')) {
          if (searchForJWTInFile(filePath)) {
            console.log(`🎯 Found JWT in: ${filePath}`);
            foundFiles.push(filePath);
          }
        }
      });
    } catch (error) {
      console.log(`❌ Error searching ${dir}: ${error.message}`);
    }
  }
  
  searchRecursively(routesDir);
}

console.log('\n🔧 Fixing found files...');
let fixedCount = 0;
foundFiles.forEach(filePath => {
  if (fixJWTInFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
console.log('🔄 Please restart your backend: pm2 restart alcolic-backend');
console.log('🎉 Then test login again with: admin@alcolic.com / admin123');
