const fs = require('fs');

console.log('🔧 Fixing role bug in auth route...');

const authFile = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/auth.js';

if (fs.existsSync(authFile)) {
  console.log('📁 Found auth.js file');
  
  // Read the file
  let content = fs.readFileSync(authFile, 'utf8');
  
  console.log('🔍 Looking for the bug on line 146...');
  
  // Find the problematic line
  const lines = content.split('\n');
  const bugLine = lines[145]; // Line 146 (0-indexed)
  
  console.log('🐛 Buggy line 146:', bugLine);
  
  // Fix the bug - replace user.role with req.body.role
  const fixedContent = content.replace(
    /role: user\.role,/g,
    'role: req.body.role,'
  );
  
  // Check if the fix was applied
  if (fixedContent !== content) {
    console.log('✅ Fix applied!');
    
    // Write the fixed content back
    fs.writeFileSync(authFile, fixedContent, 'utf8');
    
    console.log('💾 File updated successfully');
    
    // Show the fixed line
    const fixedLines = fixedContent.split('\n');
    console.log('🔧 Fixed line 146:', fixedLines[145]);
    
  } else {
    console.log('❌ No changes needed or fix not applied');
  }
  
} else {
  console.log('❌ auth.js file not found');
}

console.log('\n🎯 Next steps:');
console.log('1. Restart the backend server');
console.log('2. Test admin login again');
console.log('3. Check if 403 errors are resolved');
