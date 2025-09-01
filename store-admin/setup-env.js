#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up environment configuration for Store Admin...\n');

// Check if .env already exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('   If you want to update it, please backup your current .env file first.');
  console.log('   Current .env file:', envPath);
  process.exit(1);
}

// Read the example file
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ env.example file not found!');
  process.exit(1);
}

try {
  // Copy env.example to .env
  const envContent = fs.readFileSync(envExamplePath, 'utf8');
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Successfully created .env file!');
  console.log('📁 Location:', envPath);
  console.log('\n📋 Next steps:');
  console.log('1. Review the .env file and update any values as needed');
  console.log('2. Restart your development server');
  console.log('3. Test the Go-UPC API connection');
  console.log('\n🔧 To restart the server:');
  console.log('   npm run dev');
  
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
} 