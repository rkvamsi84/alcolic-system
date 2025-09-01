#!/bin/bash

# Alcolic Next.js Backend Deployment Script for Hostinger
# Version: 4.0.0

echo "🚀 Starting Alcolic Next.js Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm version: $(npm -v)${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp env.example .env
    echo -e "${YELLOW}⚠️  Please update .env file with your configuration before deployment${NC}"
fi

# Build the application
echo -e "${BLUE}🔨 Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Create deployment package
echo -e "${BLUE}📦 Creating deployment package...${NC}"

# Create deployment directory
DEPLOY_DIR="deployment-$(date +%Y%m%d-%H%M%S)"
mkdir -p $DEPLOY_DIR

# Copy necessary files
cp -r .next $DEPLOY_DIR/
cp -r public $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/
cp next.config.js $DEPLOY_DIR/
cp .htaccess $DEPLOY_DIR/
cp .env $DEPLOY_DIR/

# Create deployment info
cat > $DEPLOY_DIR/DEPLOYMENT_INFO.txt << EOF
Alcolic Next.js Backend Deployment
Version: 4.0.0
Deployment Date: $(date)
Node.js Version: $(node -v)
npm Version: $(npm -v)
Build Time: $(date)

Deployment Instructions:
1. Upload all files to your Hostinger hosting directory
2. Set up environment variables in Hostinger control panel
3. Configure domain and SSL certificate
4. Test the API endpoints

API Endpoints:
- Health Check: /api/health
- Authentication: /api/v1/auth/*
- Users: /api/v1/users/*
- Stores: /api/v1/stores/*
- Products: /api/v1/products/*
- Orders: /api/v1/orders/*
- Categories: /api/v1/categories/*

Socket.io Endpoint: /api/socket

For support, contact: alcolic-support@example.com
EOF

# Create ZIP file
ZIP_FILE="alcolic-backend-$(date +%Y%m%d-%H%M%S).zip"
zip -r $ZIP_FILE $DEPLOY_DIR

echo -e "${GREEN}✅ Deployment package created: $ZIP_FILE${NC}"

# Cleanup
rm -rf $DEPLOY_DIR

echo -e "${GREEN}🎉 Deployment package ready!${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "1. Upload $ZIP_FILE to your Hostinger hosting"
echo -e "2. Extract the files in your hosting directory"
echo -e "3. Configure environment variables in Hostinger control panel"
echo -e "4. Set up your domain and SSL certificate"
echo -e "5. Test the API endpoints"

echo -e "${YELLOW}⚠️  Important: Make sure to update your .env file with production values before uploading!${NC}"

echo -e "${GREEN}✅ Deployment script completed successfully!${NC}"
