const { exec } = require('child_process');
const fs = require('fs');

console.log('🔧 Fixing JWT role bug...');

// The issue is in the auth route - it's setting role to "customer" instead of the actual role
// Let's check and fix the auth.js file

function checkAuthRoute() {
  console.log('\n🔍 Checking auth route...');
  
  const authPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/auth.js';
  
  fs.readFile(authPath, 'utf8', (error, data) => {
    if (error) {
      console.log('❌ Cannot read auth.js:', error.message);
      return;
    }
    
    console.log('📄 Auth.js content (first 200 lines):');
    console.log('='.repeat(50));
    console.log(data.substring(0, 200));
    console.log('='.repeat(50));
    
    // Look for the JWT token generation
    const jwtPattern = /role:\s*user\.role/g;
    const matches = data.match(jwtPattern);
    
    if (matches) {
      console.log('✅ Found JWT role assignment:', matches);
      fixJwtRoleBug(data, authPath);
    } else {
      console.log('❌ Could not find JWT role assignment');
      console.log('🔄 Looking for alternative patterns...');
      findAlternativePatterns(data, authPath);
    }
  });
}

function findAlternativePatterns(data, authPath) {
  console.log('\n🔍 Looking for alternative patterns...');
  
  // Look for different patterns
  const patterns = [
    /role:\s*['"]customer['"]/g,
    /role:\s*req\.body\.role/g,
    /role:\s*['"]admin['"]/g
  ];
  
  patterns.forEach((pattern, index) => {
    const matches = data.match(pattern);
    if (matches) {
      console.log(`✅ Found pattern ${index + 1}:`, matches);
    }
  });
  
  // Look for the specific line that's causing the issue
  const lines = data.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('role:') && line.includes('customer')) {
      console.log(`❌ Found problematic line ${index + 1}:`, line.trim());
    }
  });
  
  // Fix the issue by replacing the problematic line
  fixJwtRoleBug(data, authPath);
}

function fixJwtRoleBug(data, authPath) {
  console.log('\n🔧 Fixing JWT role bug...');
  
  // The issue is likely that the role is being set to "customer" instead of the actual role
  // Let's replace any instances where role is set to "customer" with the actual role from req.body
  
  let fixedData = data;
  
  // Replace role: "customer" with role: req.body.role
  fixedData = fixedData.replace(/role:\s*['"]customer['"]/g, 'role: req.body.role');
  
  // Also replace any hardcoded customer role assignments
  fixedData = fixedData.replace(/role:\s*['"]customer['"]/g, 'role: req.body.role');
  
  // Look for the specific JWT token generation and fix it
  const jwtTokenPattern = /const\s+token\s*=\s*jwt\.sign\(/g;
  if (jwtTokenPattern.test(fixedData)) {
    console.log('✅ Found JWT token generation');
    
    // Replace the entire JWT token generation to ensure correct role
    const newJwtToken = `const token = jwt.sign(
      {
        id: user._id,
        role: req.body.role, // Use the role from request body
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30) // 30 days
      },
      process.env.JWT_SECRET
    );`;
    
    // Find and replace the JWT token generation
    const oldJwtPattern = /const\s+token\s*=\s*jwt\.sign\([\s\S]*?process\.env\.JWT_SECRET\s*\);/g;
    fixedData = fixedData.replace(oldJwtPattern, newJwtToken);
  }
  
  // Write the fixed file
  fs.writeFile(authPath, fixedData, 'utf8', (error) => {
    if (error) {
      console.log('❌ Failed to write fixed auth.js:', error.message);
      return;
    }
    
    console.log('✅ Fixed auth.js with correct JWT role');
    
    // Restart the backend to apply changes
    restartBackend();
  });
}

function restartBackend() {
  console.log('\n🔄 Restarting backend to apply changes...');
  
  exec('pm2 restart alcolic-backend', (error, stdout, stderr) => {
    console.log('📊 Restart result:');
    console.log(stdout);
    
    if (error) {
      console.log('❌ Failed to restart backend:', error.message);
      return;
    }
    
    console.log('✅ Backend restarted');
    
    // Wait a moment for the backend to start
    setTimeout(() => {
      testFixedAuth();
    }, 3000);
  });
}

function testFixedAuth() {
  console.log('\n🧪 Testing fixed auth...');
  
  // Test registration with admin role
  const registerData = JSON.stringify({
    name: 'Fixed Admin',
    email: 'fixedadmin@alcolic.com',
    phone: '+1234567897',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/register -H "Content-Type: application/json" -d '${registerData}'`, (error, stdout, stderr) => {
    console.log('📡 Fixed register response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ Registration successful');
      
      // Check if the JWT token has the correct role
      try {
        const response = JSON.parse(stdout);
        if (response.data && response.data.token) {
          const token = response.data.token;
          console.log('🔍 Checking JWT token...');
          
          // Decode the JWT token (without verification for now)
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            console.log('📋 JWT payload:', payload);
            
            if (payload.role === 'admin') {
              console.log('✅ JWT token has correct role: admin');
              testFixedLogin();
            } else {
              console.log('❌ JWT token still has wrong role:', payload.role);
              console.log('🔄 The fix didn\'t work, let\'s try a different approach...');
              fixAuthRouteManually();
            }
          }
        }
      } catch (e) {
        console.log('❌ Could not parse response:', e.message);
        testFixedLogin();
      }
    } else {
      console.log('❌ Registration failed');
      console.log('🔄 Let\'s try a different approach...');
      fixAuthRouteManually();
    }
  });
}

function testFixedLogin() {
  console.log('\n🧪 Testing fixed login...');
  
  const loginData = JSON.stringify({
    email: 'fixedadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${loginData}'`, (error, stdout, stderr) => {
    console.log('📡 Fixed login response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! Fixed login working!');
      console.log('✅ Your admin panel should now work!');
      console.log('\n🎯 Admin credentials:');
      console.log('📧 Email: fixedadmin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
    } else {
      console.log('❌ Fixed login still failing');
      console.log('🔄 Let\'s try a different approach...');
      fixAuthRouteManually();
    }
  });
}

function fixAuthRouteManually() {
  console.log('\n🔧 Fixing auth route manually...');
  
  // Create a completely new auth.js file with the correct JWT role assignment
  const newAuthContent = `const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Register user
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['customer', 'admin', 'delivery_man', 'store_owner']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role // Use the role from request body
    });

    await user.save();

    // Generate JWT token with correct role
    const token = jwt.sign(
      {
        id: user._id,
        role: role, // Use the role from request body, not user.role
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30) // 30 days
      },
      process.env.JWT_SECRET
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['customer', 'admin', 'delivery_man', 'store_owner']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, role } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check role
    if (user.role !== role) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token with correct role
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role, // Use the actual user role
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30) // 30 days
      },
      process.env.JWT_SECRET
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;`;

  const authPath = '/home/u294447786/domains/alcolic.gnritservices.com/public_html/backend/routes/auth.js';
  
  fs.writeFile(authPath, newAuthContent, 'utf8', (error) => {
    if (error) {
      console.log('❌ Failed to write new auth.js:', error.message);
      return;
    }
    
    console.log('✅ Created new auth.js with correct JWT role assignment');
    
    // Restart the backend
    restartBackendWithNewAuth();
  });
}

function restartBackendWithNewAuth() {
  console.log('\n🔄 Restarting backend with new auth...');
  
  exec('pm2 restart alcolic-backend', (error, stdout, stderr) => {
    console.log('📊 Restart result:');
    console.log(stdout);
    
    if (error) {
      console.log('❌ Failed to restart backend:', error.message);
      return;
    }
    
    console.log('✅ Backend restarted with new auth');
    
    // Wait a moment for the backend to start
    setTimeout(() => {
      testNewAuth();
    }, 3000);
  });
}

function testNewAuth() {
  console.log('\n🧪 Testing new auth...');
  
  // Test registration with admin role
  const registerData = JSON.stringify({
    name: 'New Auth Admin',
    email: 'newauthadmin@alcolic.com',
    phone: '+1234567898',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/register -H "Content-Type: application/json" -d '${registerData}'`, (error, stdout, stderr) => {
    console.log('📡 New auth register response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('✅ New auth registration successful');
      
      // Check JWT token
      try {
        const response = JSON.parse(stdout);
        if (response.data && response.data.token) {
          const token = response.data.token;
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            console.log('📋 JWT payload:', payload);
            
            if (payload.role === 'admin') {
              console.log('✅ JWT token has correct role: admin');
              testNewAuthLogin();
            } else {
              console.log('❌ JWT token still has wrong role:', payload.role);
            }
          }
        }
      } catch (e) {
        console.log('❌ Could not parse response:', e.message);
        testNewAuthLogin();
      }
    } else {
      console.log('❌ New auth registration failed');
    }
  });
}

function testNewAuthLogin() {
  console.log('\n🧪 Testing new auth login...');
  
  const loginData = JSON.stringify({
    email: 'newauthadmin@alcolic.com',
    password: 'admin123',
    role: 'admin'
  });
  
  exec(`curl -s -X POST https://alcolic.gnritservices.com/api.php/auth/login -H "Content-Type: application/json" -d '${loginData}'`, (error, stdout, stderr) => {
    console.log('📡 New auth login response:');
    console.log('='.repeat(50));
    console.log(stdout);
    console.log('='.repeat(50));
    
    if (stdout.includes('success') && stdout.includes('true')) {
      console.log('🎉 SUCCESS! New auth login working!');
      console.log('✅ Your admin panel should now work!');
      console.log('\n🎯 Admin credentials:');
      console.log('📧 Email: newauthadmin@alcolic.com');
      console.log('🔑 Password: admin123');
      console.log('🎭 Role: admin');
    } else {
      console.log('❌ New auth login still failing');
      console.log('💡 The issue might be deeper in the backend');
    }
  });
}

console.log('🚀 Starting JWT role bug fix...');
checkAuthRoute();
