# 🍺 Alcolic - Alcohol Delivery Platform

A comprehensive alcohol delivery platform with real-time features, built with Next.js backend and React frontends.

## 🏗️ **System Architecture**

### **Backend (Next.js)**
- **URL:** `https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app`
- **Status:** ✅ Deployed and working on Vercel
- **Database:** MongoDB Atlas
- **Features:** Real-time Socket.io, JWT authentication, file uploads

### **Frontend Applications**
- **User Web App:** Customer-facing application
- **Store Admin:** Store management interface
- **Main Admin:** System administration panel

## 🚀 **Quick Start**

### **Backend (Already Deployed)**
```bash
# Backend is already deployed on Vercel
# URL: https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app
# Bypass Token: vghntrxcgvhbjnbvcxfcghvjbnkmhgvb
```

### **Frontend Applications**

#### **User Web App**
```bash
cd user-web-app
npm install
npm start
```

#### **Store Admin**
```bash
cd store-admin
npm install
npm run dev
```

#### **Main Admin**
```bash
cd Admin_panel/alcolic_admin_panel
npm install
npm start
```

## 📱 **Deployment**

### **Backend (Vercel)**
- ✅ Already deployed and working
- **URL:** `https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app`

### **Frontend (Netlify)**
Deploy each application to Netlify:

1. **User Web App:** Upload `user-web-app/build/` folder
2. **Store Admin:** Upload `store-admin/dist/` folder
3. **Main Admin:** Upload `Admin_panel/alcolic_admin_panel/build/` folder

## 🔧 **API Endpoints**

### **Authentication**
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get user profile
- `POST /api/v1/auth/logout` - User logout

### **Products**
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/:id` - Get product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### **Orders**
- `GET /api/v1/orders` - List orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/:id` - Get order
- `PUT /api/v1/orders/:id/status` - Update order status

### **Categories**
- `GET /api/v1/categories` - List categories
- `POST /api/v1/categories` - Create category
- `GET /api/v1/categories/:id` - Get category
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### **Stores**
- `GET /api/v1/stores` - List stores
- `POST /api/v1/stores` - Create store
- `GET /api/v1/stores/:id` - Get store
- `PUT /api/v1/stores/:id` - Update store
- `DELETE /api/v1/stores/:id` - Delete store

### **Users**
- `GET /api/v1/users` - List users
- `GET /api/v1/users/:id` - Get user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## 🔌 **Real-time Features**

### **Socket.io Events**
- `authenticate` - User authentication
- `order_update` - Order status updates
- `new_order` - New order notifications
- `delivery_update` - Delivery status updates

## 🛠️ **Technologies Used**

### **Backend**
- **Framework:** Next.js with TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with refresh tokens
- **Real-time:** Socket.io
- **File Upload:** Sharp, Cloudinary, Formidable
- **Validation:** Express-validator
- **Security:** Helmet, CORS, Rate limiting

### **Frontend**
- **User Web App:** React with Material-UI
- **Store Admin:** React with Vite
- **Main Admin:** React with Material-UI
- **State Management:** React Context
- **HTTP Client:** Axios
- **Real-time:** Socket.io-client

## 📊 **Features**

### **User Web App**
- Product browsing and search
- Shopping cart management
- Order placement and tracking
- User profile management
- Real-time notifications
- Location-based delivery zones

### **Store Admin**
- Product management
- Order processing
- Inventory control
- Analytics dashboard
- Customer management
- Real-time order updates

### **Main Admin**
- User management
- Store management
- System analytics
- Order monitoring
- Category management
- System configuration

## 🔒 **Security**

- JWT authentication with refresh tokens
- Role-based access control
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- XSS and CSRF protection

## 🌐 **Deployment URLs**

### **Backend**
- **Production:** `https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app`
- **Health Check:** `/api/health`
- **API Documentation:** `/api/v1`

### **Frontend (To be deployed on Netlify)**
- **User Web App:** (Deploy `user-web-app/build/` folder)
- **Store Admin:** (Deploy `store-admin/dist/` folder)
- **Main Admin:** (Deploy `Admin_panel/alcolic_admin_panel/build/` folder)

## 📞 **Support**

- **Backend API:** Working perfectly on Vercel
- **Database:** MongoDB Atlas connected
- **Real-time Features:** Socket.io functional
- **Authentication:** JWT system working

## 🎯 **Status**

- ✅ **Backend:** Deployed and working
- ✅ **Database:** Connected and functional
- ✅ **API Endpoints:** All working
- ✅ **Real-time Features:** Functional
- 🔄 **Frontend:** Ready for Netlify deployment

---

**🍺 Your Alcolic alcohol delivery platform is ready for production!**
