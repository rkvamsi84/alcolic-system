# 🚀 **ALCOLIC HOSTINGER DEPLOYMENT**

## 📁 **File Structure**
```
hostinger-deployment/
├── backend/                 # Next.js backend server
│   ├── .next/              # Built Next.js application
│   ├── .env                # Environment configuration
│   ├── package.json        # Dependencies
│   ├── manage-server.sh    # Server management script
│   └── hostinger-start.sh  # Alternative startup script
├── user-web-app/           # User frontend application
├── store-admin/            # Store admin frontend
├── main-admin/             # Main admin frontend
├── .htaccess              # Subdomain routing configuration
└── README.md              # This file
```

## 🚀 **Quick Start**

### **1. Upload to Hostinger**
Upload all files to your Hostinger `public_html` directory.

### **2. Start the Backend Server**
```bash
cd backend
./manage-server.sh start
```

### **3. Check Server Status**
```bash
./manage-server.sh status
```

### **4. Test Your Applications**
- **User Web App:** `https://alcolic.gnritservices.com`
- **Store Admin:** `https://store.alcolic.gnritservices.com`
- **Main Admin:** `https://admin.alcolic.gnritservices.com`
- **API Backend:** `https://api.alcolic.gnritservices.com`

## 🔧 **Server Management**

### **Available Commands:**
```bash
./manage-server.sh start    # Start server
./manage-server.sh stop     # Stop server
./manage-server.sh status   # Check status
./manage-server.sh restart  # Restart server
./manage-server.sh logs     # View logs
./manage-server.sh test     # Test API
```

### **Alternative Startup:**
```bash
./hostinger-start.sh
```

## 🌐 **Subdomain Configuration**

The `.htaccess` file routes:
- `api.alcolic.gnritservices.com` → Backend API
- `store.alcolic.gnritservices.com` → Store Admin
- `admin.alcolic.gnritservices.com` → Main Admin
- `alcolic.gnritservices.com` → User Web App

## 🔒 **Environment Variables**

Make sure your `.env` file contains:
- MongoDB connection string
- JWT secrets
- Other configuration variables

## 📞 **Support**

If you encounter issues:
1. Check server logs: `./manage-server.sh logs`
2. Verify Node.js is available on your Hostinger plan
3. Contact Hostinger support if Node.js is not available

---

**🎉 Your Alcolic system is ready for deployment!**
