const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing auth route properly...');

const authFile = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/auth.js';

try {
  // Read the current file
  let content = fs.readFileSync(authFile, 'utf8');
  const originalContent = content;
  
  console.log('📁 Reading auth.js file...');
  
  // Look for the specific JWT token generation pattern
  // We need to be more careful about the replacement
  
  // Pattern 1: Find jwt.sign with role: req.body.role
  const jwtPattern1 = /jwt\.sign\s*\(\s*\{\s*[^}]*id\s*:\s*[^,}]+[^}]*,\s*role\s*:\s*req\.body\.role[^}]*\}/g;
  
  // Pattern 2: Find role: req.body.role in any context
  const jwtPattern2 = /role\s*:\s*req\.body\.role/g;
  
  let hasChanges = false;
  
  // First, let's see what we're working with
  console.log('🔍 Looking for JWT patterns...');
  
  if (jwtPattern1.test(content)) {
    console.log('✅ Found JWT pattern 1');
    content = content.replace(jwtPattern1, (match) => {
      return match.replace(/role\s*:\s*req\.body\.role/, 'role: user.role');
    });
    hasChanges = true;
  }
  
  if (jwtPattern2.test(content)) {
    console.log('✅ Found JWT pattern 2');
    content = content.replace(jwtPattern2, 'role: user.role');
    hasChanges = true;
  }
  
  if (hasChanges) {
    // Create backup
    fs.writeFileSync(authFile + '.backup2', originalContent);
    console.log('💾 Backup created: auth.js.backup2');
    
    // Write fixed content
    fs.writeFileSync(authFile, content);
    console.log('✅ Fixed auth.js properly');
    
    // Show the specific lines that were changed
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('jwt.sign') || line.includes('role:')) {
        console.log(`📝 Line ${index + 1}: ${line.trim()}`);
      }
    });
    
  } else {
    console.log('ℹ️  No JWT patterns found to fix');
    
    // Let's show what the file contains
    console.log('📄 File contents (first 20 lines):');
    const lines = content.split('\n').slice(0, 20);
    lines.forEach((line, index) => {
      console.log(`${index + 1}: ${line}`);
    });
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  
  // Try to restore from backup
  try {
    if (fs.existsSync(authFile + '.backup')) {
      fs.copyFileSync(authFile + '.backup', authFile);
      console.log('🔄 Restored from backup');
    }
  } catch (restoreError) {
    console.error('❌ Could not restore from backup:', restoreError.message);
  }
}

console.log('\n🔄 Please restart your backend: pm2 restart alcolic-backend');
console.log('🎉 Then test login again with: admin@alcolic.com / admin123');
