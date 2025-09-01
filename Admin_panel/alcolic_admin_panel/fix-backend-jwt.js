const fs = require('fs');
const path = require('path');

// Function to find and fix JWT token generation
function fixBackendJWT() {
  console.log('🔧 Starting automated backend JWT fix...');
  
  // Common backend file paths to check
  const possiblePaths = [
    '../backend/routes/auth.js',
    '../backend/routes/admin.js',
    '../backend/controllers/authController.js',
    '../backend/controllers/adminController.js',
    '../backend/middleware/auth.js'
  ];
  
  let fixedFiles = [];
  
  possiblePaths.forEach(filePath => {
    try {
      const fullPath = path.resolve(__dirname, filePath);
      
      if (fs.existsSync(fullPath)) {
        console.log(`📁 Found file: ${filePath}`);
        
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;
        
        // Pattern to find JWT token generation with request role
        const patterns = [
          // Pattern 1: jwt.sign with req.body.role
          {
            find: /jwt\.sign\s*\(\s*\{\s*[^}]*id[^}]*,\s*role\s*:\s*req\.body\.role[^}]*\}/g,
            replace: (match) => {
              return match.replace(/role\s*:\s*req\.body\.role/, 'role: user.role');
            }
          },
          // Pattern 2: jwt.sign with role: req.body.role
          {
            find: /role\s*:\s*req\.body\.role/g,
            replace: 'role: user.role'
          },
          // Pattern 3: More specific pattern
          {
            find: /const\s+token\s*=\s*jwt\.sign\s*\(\s*\{\s*[^}]*id\s*:\s*user\._id[^}]*,\s*role\s*:\s*req\.body\.role[^}]*\}/g,
            replace: (match) => {
              return match.replace(/role\s*:\s*req\.body\.role/, 'role: user.role');
            }
          }
        ];
        
        let hasChanges = false;
        
        patterns.forEach(pattern => {
          if (pattern.find.test(content)) {
            content = content.replace(pattern.find, pattern.replace);
            hasChanges = true;
          }
        });
        
        if (hasChanges) {
          // Backup original file
          fs.writeFileSync(fullPath + '.backup', originalContent);
          console.log(`💾 Backup created: ${filePath}.backup`);
          
          // Write fixed content
          fs.writeFileSync(fullPath, content);
          console.log(`✅ Fixed: ${filePath}`);
          fixedFiles.push(filePath);
        } else {
          console.log(`ℹ️  No JWT issues found in: ${filePath}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error processing ${filePath}: ${error.message}`);
    }
  });
  
  return fixedFiles;
}

// Function to create a comprehensive fix script
function createFixScript() {
  const scriptContent = `#!/bin/bash

echo "🔧 Automated Backend JWT Fix Script"
echo "=================================="

# Navigate to backend directory
cd /home/u294447786/domains/alcolic.gnritservices.com/public_html/backend

echo "📁 Current directory: \$(pwd)"

# Find all JavaScript files that might contain JWT signing
echo "🔍 Searching for JWT token generation..."

# Find files with jwt.sign
JWT_FILES=\$(grep -r "jwt.sign" --include="*.js" . | cut -d: -f1 | sort | uniq)

if [ -z "\$JWT_FILES" ]; then
    echo "❌ No files with jwt.sign found"
    exit 1
fi

echo "📄 Files with JWT signing found:"
echo "\$JWT_FILES"

# Fix each file
for file in \$JWT_FILES; do
    echo "🔧 Processing: \$file"
    
    # Create backup
    cp "\$file" "\$file.backup"
    echo "💾 Backup created: \$file.backup"
    
    # Fix the JWT token generation
    sed -i 's/role:\\s*req\\.body\\.role/role: user.role/g' "\$file"
    sed -i 's/role: req.body.role/role: user.role/g' "\$file"
    
    echo "✅ Fixed: \$file"
done

echo "🔄 Restarting backend server..."
pm2 restart alcolic-backend

echo "✅ Backend JWT fix completed!"
echo "🎉 Try logging in with: admin@alcolic.com / admin123"
`;

  const scriptPath = path.join(__dirname, 'fix-backend-jwt.sh');
  fs.writeFileSync(scriptPath, scriptContent);
  fs.chmodSync(scriptPath, '755');
  
  console.log(`📝 Created fix script: ${scriptPath}`);
  return scriptPath;
}

// Function to create a Node.js fix script
function createNodeFixScript() {
  const scriptContent = `const fs = require('fs');
const path = require('path');

console.log('🔧 Automated Backend JWT Fix - Node.js Version');

const backendPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend';

function findAndFixJWT() {
  try {
    // Find auth.js file
    const authFile = path.join(backendPath, 'routes', 'auth.js');
    
    if (fs.existsSync(authFile)) {
      console.log('📁 Found auth.js file');
      
      let content = fs.readFileSync(authFile, 'utf8');
      const originalContent = content;
      
      // Fix JWT token generation
      content = content.replace(
        /role:\\s*req\\.body\\.role/g,
        'role: user.role'
      );
      
      content = content.replace(
        /role: req.body.role/g,
        'role: user.role'
      );
      
      if (content !== originalContent) {
        // Create backup
        fs.writeFileSync(authFile + '.backup', originalContent);
        console.log('💾 Backup created: auth.js.backup');
        
        // Write fixed content
        fs.writeFileSync(authFile, content);
        console.log('✅ Fixed auth.js');
        
        return true;
      } else {
        console.log('ℹ️  No changes needed in auth.js');
      }
    }
    
    // Check other potential files
    const filesToCheck = [
      'routes/admin.js',
      'controllers/authController.js',
      'middleware/auth.js'
    ];
    
    filesToCheck.forEach(file => {
      const filePath = path.join(backendPath, file);
      if (fs.existsSync(filePath)) {
        console.log(\`📁 Checking: \${file}\`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Fix JWT token generation
        content = content.replace(
          /role:\\s*req\\.body\\.role/g,
          'role: user.role'
        );
        
        content = content.replace(
          /role: req.body.role/g,
          'role: user.role'
        );
        
        if (content !== originalContent) {
          // Create backup
          fs.writeFileSync(filePath + '.backup', originalContent);
          console.log(\`💾 Backup created: \${file}.backup\`);
          
          // Write fixed content
          fs.writeFileSync(filePath, content);
          console.log(\`✅ Fixed \${file}\`);
        }
      }
    });
    
    console.log('🎉 JWT fix completed!');
    console.log('🔄 Please restart your backend server: pm2 restart alcolic-backend');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findAndFixJWT();
`;

  const scriptPath = path.join(__dirname, 'fix-backend-jwt-node.js');
  fs.writeFileSync(scriptPath, scriptContent);
  
  console.log(`📝 Created Node.js fix script: ${scriptPath}`);
  return scriptPath;
}

// Main execution
console.log('🚀 Creating automated fix scripts...');

const bashScript = createFixScript();
const nodeScript = createNodeFixScript();

console.log('\n✅ Automated fix scripts created!');
console.log('\n📋 To run the fix:');
console.log('1. Upload these files to your Hostinger server');
console.log('2. SSH into your server');
console.log('3. Run one of these commands:');
console.log(`   - bash ${path.basename(bashScript)}`);
console.log(`   - node ${path.basename(nodeScript)}`);
console.log('\n🎯 After running the fix:');
console.log('1. Restart backend: pm2 restart alcolic-backend');
console.log('2. Test login: admin@alcolic.com / admin123');
console.log('3. You should get proper admin role in JWT token');

// Also try to fix locally if backend files exist
console.log('\n🔍 Checking for local backend files...');
const localFixedFiles = fixBackendJWT();

if (localFixedFiles.length > 0) {
  console.log(`\n✅ Fixed ${localFixedFiles.length} local files`);
} else {
  console.log('\nℹ️  No local backend files found to fix');
}
