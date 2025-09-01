# Alcolic Next.js Backend

A production-ready Next.js backend for the Alcolic alcohol delivery platform, optimized for Hostinger deployment.

## 🚀 Features

- **Next.js 14** with TypeScript for type safety
- **MongoDB** with Mongoose for data persistence
- **Socket.io** for real-time features
- **JWT Authentication** with refresh tokens
- **Role-based Authorization** (user, store, delivery, admin)
- **File Upload** with image optimization
- **Rate Limiting** and security middleware
- **CORS** configuration for cross-origin requests
- **Error Handling** with custom error classes
- **Logging** and monitoring
- **Production Optimizations** for Hostinger

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB database (local or cloud)
- Hostinger hosting account

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextjs-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/alcolic
   MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/alcolic
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-refresh-token-secret
   
   # Server
   NODE_ENV=production
   PORT=3000
   
   # CORS
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   
   # Email (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Payment (optional)
   STRIPE_SECRET_KEY=sk_test_your_stripe_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
   ```

4. **Development**
   ```bash
   npm run dev
   ```

5. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## 🏗️ Project Structure

```
nextjs-backend/
├── src/
│   ├── config/           # Configuration files
│   ├── models/           # MongoDB models
│   ├── middleware/       # Custom middleware
│   ├── lib/             # Utility libraries
│   ├── types/           # TypeScript types
│   └── pages/api/       # API routes
├── public/              # Static files
├── .htaccess           # Hostinger configuration
├── next.config.js      # Next.js configuration
├── package.json        # Dependencies
└── deploy.sh          # Deployment script
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

### Stores
- `GET /api/v1/stores` - List stores with filters
- `GET /api/v1/stores/[id]` - Get store details

### Products
- `GET /api/v1/products` - List products with filters
- `GET /api/v1/products/[id]` - Get product details

### Orders
- `GET /api/v1/orders` - List orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/[id]` - Get order details
- `PUT /api/v1/orders/[id]` - Update order

### Categories
- `GET /api/v1/categories` - List categories
- `GET /api/v1/categories/[id]` - Get category details

### Health Check
- `GET /api/health` - System health status

### Socket.io
- `/api/socket` - WebSocket endpoint

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** with bcrypt
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Input Validation** with express-validator
- **SQL Injection Protection** (MongoDB)
- **XSS Protection** headers
- **CSRF Protection** measures
- **File Upload Security** with type validation

## 🚀 Deployment to Hostinger

### Method 1: Automated Deployment

1. **Run the deployment script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. **Upload the generated ZIP file** to your Hostinger hosting

3. **Extract the files** in your hosting directory

4. **Configure environment variables** in Hostinger control panel

### Method 2: Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Upload files** to Hostinger:
   - `.next/` directory
   - `public/` directory
   - `package.json`
   - `package-lock.json`
   - `next.config.js`
   - `.htaccess`
   - `.env` (with production values)

3. **Install dependencies** on Hostinger:
   ```bash
   npm install --production
   ```

4. **Start the application**:
   ```bash
   npm start
   ```

## ⚙️ Hostinger Configuration

### Environment Variables
Set these in your Hostinger control panel:
- `MONGODB_URI_PROD` - Your MongoDB connection string
- `JWT_SECRET` - Secure JWT secret key
- `NODE_ENV` - Set to "production"
- `CORS_ORIGINS` - Your domain URLs

### Domain Configuration
1. Point your domain to the hosting directory
2. Enable SSL certificate
3. Configure subdomain if needed (api.yourdomain.com)

### Performance Optimization
- Enable Hostinger's CDN
- Configure caching rules
- Enable compression
- Use Hostinger's Node.js hosting plan

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Database Setup
1. Create MongoDB database
2. Set up indexes for performance
3. Configure connection pooling
4. Set up backup strategy

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring

### Health Check
Monitor your API health:
```bash
curl https://yourdomain.com/api/health
```

### Logs
Check application logs in Hostinger control panel:
- Error logs
- Access logs
- Performance metrics

### Performance
- Monitor response times
- Track database queries
- Monitor memory usage
- Check error rates

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS_ORIGINS configuration
   - Verify domain settings

2. **Database Connection**
   - Verify MongoDB URI
   - Check network connectivity
   - Validate credentials

3. **JWT Errors**
   - Check JWT_SECRET configuration
   - Verify token expiration
   - Check token format

4. **File Upload Issues**
   - Check file size limits
   - Verify file types
   - Check upload directory permissions

### Debug Mode
Enable debug logging:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

## 🔄 Updates

### Updating the Application
1. Pull latest changes
2. Update dependencies: `npm install`
3. Rebuild: `npm run build`
4. Restart the application

### Database Migrations
1. Backup your database
2. Run migration scripts
3. Update indexes if needed
4. Test thoroughly

## 📞 Support

For technical support:
- Email: alcolic-support@example.com
- Documentation: [API Docs](https://docs.alcolic.com)
- Issues: [GitHub Issues](https://github.com/alcolic/backend/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**Version:** 4.0.0  
**Last Updated:** December 2024  
**Compatibility:** Node.js 18+, Next.js 14, MongoDB 6+
