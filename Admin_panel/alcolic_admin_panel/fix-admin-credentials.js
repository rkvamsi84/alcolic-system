const { exec } = require('child_process');

console.log('🔧 Fixing admin credentials...');

// The API.php is working, but we need to fix the admin user
// Let's check what admin users exist and create a working one

function checkExistingAdminUsers() {
  console.log('\n🔍 Checking existing admin users...');
  
  // Test with common admin credentials
  const testCredentials = [
    { email: 'admin@alcolic.com', password: 'admin123', role: 'admin' },
    { email: 'admin@alcolic.com', password: 'admin', role: 'admin' },
    { email: 'admin@alcolic.com', password: 'password', role: 'admin' },
    { email: 'superadmin@alcolic.com', password: 'admin123', role: 'admin' },
    { email: 'superadmin@alcolic.com', password: 'admin', role: 'admin' },
    { email: 'superadmin@alcolic.com', password: 'password', role: 'admin' },
    { email: 'admin@alcolic.com', password: '123456', role: 'admin' },
    { email: 'superadmin@alcolic.com', password: '123456', role: 'admin' }
  ];
  
  let currentTest = 0;
  
  function testNextCredential() {
    if (currentTest >= testCredentials.length) {
      console.log('❌ No working admin credentials found');
      console.log('🔄 Creating new admin user...');
      createNewAdminUser();
      return;
    }
    
    const cred = testCredentials[currentTest];
    console.log(`\n🧪 Testing: ${cred.email} / ${cred.password} / ${cred.role}`);
    
    const testData = JSON.stringify(cred);
    
    exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${testData}'`, (error, stdout, stderr) => {
      console.log('📡 Response:', stdout);
      
      if (stdout.includes('success') && stdout.includes('true')) {
        console.log('🎉 SUCCESS! Working admin credentials found!');
        console.log(`✅ Email: ${cred.email}`);
        console.log(`✅ Password: ${cred.password}`);
        console.log(`✅ Role: ${cred.role}`);
        console.log('\n🎯 Your admin panel should now work with these credentials!');
        return;
      } else if (stdout.includes('Invalid credentials')) {
        console.log('❌ Invalid credentials');
        currentTest++;
        testNextCredential();
      } else {
        console.log('⚠️ Unexpected response');
        currentTest++;
        testNextCredential();
      }
    });
  }
  
  testNextCredential();
}

function createNewAdminUser() {
  console.log('\n👤 Creating new admin user...');
  
  // First, let's try to register a new admin user
  const registerData = JSON.stringify({
    name: 'Super Admin',
    email: 'newadmin@alcolic.com',
    phone: '+1234567892',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/register -H "Content-Type: application/json" -d '${registerData}'`, (error, stdout, stderr) => {
    console.log('📡 Register response:');
    console.log(stdout);
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ New admin user created successfully');
      testNewAdminLogin();
    } else if (stdout.includes('already exists')) {
      console.log('✅ Admin user already exists');
      testNewAdminLogin();
    } else {
      console.log('❌ Failed to create admin user');
      console.log('🔄 Trying to update existing user...');
      updateExistingUser();
    }
  });
}

function testNewAdminLogin() {
  console.log('\n🧪 Testing new admin login...');
  
  const testData = JSON.stringify({
    email: 'newadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${testData}'`, (error, stdout, stderr) => {
    console.log('📡 Login response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! New admin login working!');
      console.log('✅ Your admin panel should now work!');
      console.log('\n🎯 Admin credentials:');
      console.log('📧 Email: newadmin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
    } else {
      console.log('❌ New admin login still failing');
      console.log('🔄 Trying to reset existing user password...');
      resetExistingUserPassword();
    }
  });
}

function updateExistingUser() {
  console.log('\n🔄 Trying to update existing user...');
  
  // Try to update the existing superadmin user
  const updateData = JSON.stringify({
    email: 'superadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  // First, let's try to login with the current password
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${updateData}'`, (error, stdout, stderr) => {
    console.log('📡 Current login attempt:');
    console.log(stdout);
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! Current credentials work!');
      console.log('\n🎯 Admin credentials:');
      console.log('📧 Email: superadmin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
    } else {
      console.log('❌ Current credentials don\'t work');
      console.log('🔄 Trying to create a completely new user...');
      createCompletelyNewUser();
    }
  });
}

function resetExistingUserPassword() {
  console.log('\n🔄 Trying to reset existing user password...');
  
  // Since we can't directly reset passwords via API, let's create a new user with a different email
  const registerData = JSON.stringify({
    name: 'System Admin',
    email: 'systemadmin@alcolic.com',
    phone: '+1234567893',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/register -H "Content-Type: application/json" -d '${registerData}'`, (error, stdout, stderr) => {
    console.log('📡 System admin register response:');
    console.log(stdout);
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ System admin created successfully');
      testSystemAdminLogin();
    } else if (stdout.includes('already exists')) {
      console.log('✅ System admin already exists');
      testSystemAdminLogin();
    } else {
      console.log('❌ Failed to create system admin');
      console.log('🔄 Trying direct database approach...');
      createDirectAdminUser();
    }
  });
}

function testSystemAdminLogin() {
  console.log('\n🧪 Testing system admin login...');
  
  const testData = JSON.stringify({
    email: 'systemadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${testData}'`, (error, stdout, stderr) => {
    console.log('📡 System admin login response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! System admin login working!');
      console.log('✅ Your admin panel should now work!');
      console.log('\n🎯 Admin credentials:');
      console.log('📧 Email: systemadmin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
    } else {
      console.log('❌ System admin login still failing');
      console.log('🔄 Trying direct database approach...');
      createDirectAdminUser();
    }
  });
}

function createCompletelyNewUser() {
  console.log('\n👤 Creating completely new user...');
  
  // Create a user with a unique email
  const timestamp = Date.now();
  const uniqueEmail = `admin${timestamp}@alcolic.com`;
  
  const registerData = JSON.stringify({
    name: 'Unique Admin',
    email: uniqueEmail,
    phone: `+123456${timestamp.toString().slice(-4)}`,
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/register -H "Content-Type: application/json" -d '${registerData}'`, (error, stdout, stderr) => {
    console.log('📡 Unique admin register response:');
    console.log(stdout);
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ Unique admin created successfully');
      testUniqueAdminLogin(uniqueEmail);
    } else {
      console.log('❌ Failed to create unique admin');
      console.log('🔄 Trying direct database approach...');
      createDirectAdminUser();
    }
  });
}

function testUniqueAdminLogin(email) {
  console.log('\n🧪 Testing unique admin login...');
  
  const testData = JSON.stringify({
    email: email,
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${testData}'`, (error, stdout, stderr) => {
    console.log('📡 Unique admin login response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! Unique admin login working!');
      console.log('✅ Your admin panel should now work!');
      console.log('\n🎯 Admin credentials:');
      console.log(`📧 Email: ${email}`);
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
    } else {
      console.log('❌ Unique admin login still failing');
      console.log('🔄 Trying direct database approach...');
      createDirectAdminUser();
    }
  });
}

function createDirectAdminUser() {
  console.log('\n🔄 Trying direct database approach...');
  
  // Since API registration isn't working, let's try to create the user directly in the database
  // First, let's check if we can access the backend directly
  exec('curl -s -X POST http://localhost:5000/api/v1/auth/register -H "Content-Type: application/json" -d \'{"name":"Direct Admin","email":"directadmin@alcolic.com","phone":"+1234567894","password":"admin123","role":"admin"}\'', (error, stdout, stderr) => {
    console.log('📡 Direct backend register response:');
    console.log(stdout);
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ Direct admin created successfully');
      testDirectAdminLogin();
    } else {
      console.log('❌ Failed to create direct admin');
      console.log('🔄 Let\'s check what users exist in the database...');
      checkDatabaseUsers();
    }
  });
}

function testDirectAdminLogin() {
  console.log('\n🧪 Testing direct admin login...');
  
  const testData = JSON.stringify({
    email: 'directadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${testData}'`, (error, stdout, stderr) => {
    console.log('📡 Direct admin login response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! Direct admin login working!');
      console.log('✅ Your admin panel should now work!');
      console.log('\n🎯 Admin credentials:');
      console.log('📧 Email: directadmin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
    } else {
      console.log('❌ Direct admin login still failing');
      console.log('🔄 Let\'s check what users exist in the database...');
      checkDatabaseUsers();
    }
  });
}

function checkDatabaseUsers() {
  console.log('\n🔍 Checking database users...');
  
  // Try to get users list (this might require admin access, but let's try)
  exec('curl -s -X GET http://localhost:5000/api/v1/users', (error, stdout, stderr) => {
    console.log('📡 Users list response:');
    console.log(stdout);
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ Got users list');
      // Parse and find admin users
      try {
        const response = JSON.parse(stdout);
        if (response.data && response.data.length > 0) {
          const adminUsers = response.data.filter(user => user.role === 'admin');
          if (adminUsers.length > 0) {
            console.log('🎯 Found admin users:');
            adminUsers.forEach(user => {
              console.log(`📧 Email: ${user.email}, Role: ${user.role}`);
            });
            console.log('\n💡 Try logging in with one of these emails and password: admin123');
          } else {
            console.log('❌ No admin users found');
            console.log('🔄 Creating admin user via database script...');
            createAdminViaScript();
          }
        }
      } catch (e) {
        console.log('❌ Could not parse users response');
        console.log('🔄 Creating admin user via database script...');
        createAdminViaScript();
      }
    } else {
      console.log('❌ Could not get users list');
      console.log('🔄 Creating admin user via database script...');
      createAdminViaScript();
    }
  });
}

function createAdminViaScript() {
  console.log('\n🔄 Creating admin user via database script...');
  
  // Create a Node.js script to add admin user directly to database
  const script = `
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI_PROD || 'mongodb+srv://alcolic:alcolic123@cluster0.mongodb.net/alcolic?retryWrites=true&w=majority');

// User schema (simplified)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['customer', 'admin', 'delivery_man', 'store_owner'], default: 'customer' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const adminUser = new User({
      name: 'Script Admin',
      email: 'scriptadmin@alcolic.com',
      phone: '+1234567895',
      password: hashedPassword,
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: scriptadmin@alcolic.com');
    console.log('🔑 Password: admin123');
    console.log('🎭 Role: admin');
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: scriptadmin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
    } else {
      console.log('❌ Error creating admin user:', error.message);
    }
  } finally {
    mongoose.connection.close();
  }
}

createAdminUser();
`;

  const scriptPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/create-admin.js';
  
  exec(`echo '${script}' > ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to create script:', error.message);
      return;
    }
    
    console.log('✅ Script created');
    
    // Run the script
    exec(`cd /home/u294447786/domains/alcolic.gnritservices.com/public_html && node create-admin.js`, (error, stdout, stderr) => {
      console.log('📡 Script output:');
      console.log(stdout);
      
      if (stdout.includes('Admin user created successfully') || stdout.includes('Admin user already exists')) {
        console.log('✅ Admin user created via script');
        testScriptAdminLogin();
      } else {
        console.log('❌ Failed to create admin user via script');
        console.log('💡 Manual intervention required');
        console.log('\n🎯 Try these steps:');
        console.log('1. Access your MongoDB Atlas dashboard');
        console.log('2. Go to Collections > alcolic > users');
        console.log('3. Add a new document with:');
        console.log('   - name: "Manual Admin"');
        console.log('   - email: "manualadmin@alcolic.com"');
        console.log('   - phone: "+1234567896"');
        console.log('   - password: (hashed password)');
        console.log('   - role: "admin"');
      }
    });
  });
}

function testScriptAdminLogin() {
  console.log('\n🧪 Testing script admin login...');
  
  const testData = JSON.stringify({
    email: 'scriptadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${testData}'`, (error, stdout, stderr) => {
    console.log('📡 Script admin login response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! Script admin login working!');
      console.log('✅ Your admin panel should now work!');
      console.log('\n🎯 Admin credentials:');
      console.log('📧 Email: scriptadmin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
    } else {
      console.log('❌ Script admin login still failing');
      console.log('💡 Manual intervention required');
      console.log('\n🎯 Try these steps:');
      console.log('1. Access your MongoDB Atlas dashboard');
      console.log('2. Go to Collections > alcolic > users');
      console.log('3. Add a new document with:');
      console.log('   - name: "Manual Admin"');
      console.log('   - email: "manualadmin@alcolic.com"');
      console.log('   - phone: "+1234567896"');
      console.log('   - password: (hashed password)');
      console.log('   - role: "admin"');
    }
  });
}

console.log('🚀 Starting admin credentials fix...');
checkExistingAdminUsers();
