#!/usr/bin/env node

/**
 * Alcolic Project - Render.com Deployment Script
 * This script helps automate the deployment process to Render.com
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Alcolic Project - Render.com Deployment Helper');
console.log('=' .repeat(60));

// Check if all required files exist
const requiredFiles = [
  'render.yaml',
  'nextjs-backend/package.json',
  'user-web-app/package.json',
  'store-admin/package.json',
  'Admin_panel/alcolic_admin_panel/package.json'
];

console.log('\n📋 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please ensure all components are properly set up.');
  process.exit(1);
}

console.log('\n✅ All required files found!');

// Display deployment information
console.log('\n🌐 Deployment Configuration:');
console.log('=' .repeat(40));
console.log('Backend API: https://alcolic-backend-api.onrender.com');
console.log('Frontend: https://alcolic-frontend.onrender.com');
console.log('Store Admin: https://alcolic-store-admin.onrender.com');
console.log('Main Admin: https://alcolic-main-admin.onrender.com');

console.log('\n📝 Environment Variables Required:');
console.log('=' .repeat(40));
console.log('Backend:');
console.log('  - NODE_ENV: production');
console.log('  - PORT: 10000');
console.log('  - JWT_SECRET: (auto-generated)');
console.log('  - MONGODB_URI: mongodb+srv://alcolic:alcolic123@cluster0.mongodb.net/alcolic_db');
console.log('  - CORS_ORIGIN: (auto-configured)');

console.log('\nFrontend:');
console.log('  - REACT_APP_API_URL: https://alcolic-backend-api.onrender.com');
console.log('  - REACT_APP_SOCKET_URL: https://alcolic-backend-api.onrender.com');

console.log('\nStore Admin:');
console.log('  - VITE_API_URL: https://alcolic-backend-api.onrender.com');
console.log('  - VITE_APP_NAME: Alcolic Store Admin');

console.log('\n🔧 Deployment Steps:');
console.log('=' .repeat(40));
console.log('1. Go to https://dashboard.render.com/');
console.log('2. Sign up or log in to your Render account');
console.log('3. Click "New" → "Blueprint"');
console.log('4. Connect your GitHub repository containing this project');
console.log('5. Render will automatically detect the render.yaml file');
console.log('6. Review the services and click "Apply"');
console.log('7. Wait for all services to deploy (this may take 10-15 minutes)');

console.log('\n⚠️  Important Notes:');
console.log('=' .repeat(40));
console.log('- Free tier services may take longer to start up');
console.log('- Services will sleep after 15 minutes of inactivity');
console.log('- Database connection string is pre-configured for MongoDB Atlas');
console.log('- All services are configured to work together automatically');

console.log('\n🔗 Quick Access Links:');
console.log('=' .repeat(40));
console.log('Render Dashboard: https://dashboard.render.com/');
console.log('Render Documentation: https://render.com/docs');
console.log('Blueprint Guide: https://render.com/docs/blueprint-spec');

console.log('\n✨ Deployment script completed successfully!');
console.log('\n📧 For support, contact the development team.');

// Create a simple HTML file for easy access
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alcolic Project - Render Deployment</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #0066cc; color: white; padding: 20px; border-radius: 8px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .link { color: #0066cc; text-decoration: none; font-weight: bold; }
        .link:hover { text-decoration: underline; }
        .service { background: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Alcolic Project - Render Deployment</h1>
        <p>Complete deployment configuration for Render.com</p>
    </div>
    
    <div class="section">
        <h2>🌐 Service URLs (After Deployment)</h2>
        <div class="service">Backend API: <a href="https://alcolic-backend-api.onrender.com" class="link">https://alcolic-backend-api.onrender.com</a></div>
        <div class="service">Frontend: <a href="https://alcolic-frontend.onrender.com" class="link">https://alcolic-frontend.onrender.com</a></div>
        <div class="service">Store Admin: <a href="https://alcolic-store-admin.onrender.com" class="link">https://alcolic-store-admin.onrender.com</a></div>
        <div class="service">Main Admin: <a href="https://alcolic-main-admin.onrender.com" class="link">https://alcolic-main-admin.onrender.com</a></div>
    </div>
    
    <div class="section">
        <h2>🔧 Deployment Steps</h2>
        <ol>
            <li>Go to <a href="https://dashboard.render.com/" class="link">Render Dashboard</a></li>
            <li>Sign up or log in to your account</li>
            <li>Click "New" → "Blueprint"</li>
            <li>Connect your GitHub repository</li>
            <li>Render will detect the render.yaml file automatically</li>
            <li>Review services and click "Apply"</li>
            <li>Wait for deployment (10-15 minutes)</li>
        </ol>
    </div>
    
    <div class="section">
        <h2>📋 Quick Links</h2>
        <p><a href="https://dashboard.render.com/" class="link">Render Dashboard</a></p>
        <p><a href="https://render.com/docs" class="link">Render Documentation</a></p>
        <p><a href="https://render.com/docs/blueprint-spec" class="link">Blueprint Specification</a></p>
    </div>
</body>
</html>
`;

fs.writeFileSync('render-deployment-guide.html', htmlContent);
console.log('\n📄 Created render-deployment-guide.html for easy reference');