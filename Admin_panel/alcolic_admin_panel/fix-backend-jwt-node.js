const fs = require('fs');
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
        /role:\s*req\.body\.role/g,
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
        console.log(`📁 Checking: ${file}`);
        
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Fix JWT token generation
        content = content.replace(
          /role:\s*req\.body\.role/g,
          'role: user.role'
        );
        
        content = content.replace(
          /role: req.body.role/g,
          'role: user.role'
        );
        
        if (content !== originalContent) {
          // Create backup
          fs.writeFileSync(filePath + '.backup', originalContent);
          console.log(`💾 Backup created: ${file}.backup`);
          
          // Write fixed content
          fs.writeFileSync(filePath, content);
          console.log(`✅ Fixed ${file}`);
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
