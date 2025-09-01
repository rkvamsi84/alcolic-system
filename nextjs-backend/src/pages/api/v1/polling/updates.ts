import { NextApiRequest, NextApiResponse } from 'next';
import { protect } from '@/middleware/auth';
import connectDB from '@/config/database';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { corsMiddleware } from '@/middleware/cors';

// Mock notifications data (same as in notifications/my.ts)
const mockNotifications = [
  {
    id: 'notif_1',
    userId: 'user_1',
    title: 'Order Confirmed',
    message: 'Your order #12345 has been confirmed and is being prepared.',
    type: 'order',
    read: false,
    priority: 'high',
    actionUrl: '/orders/12345',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'notif_2',
    userId: 'user_1',
    title: 'Special Offer',
    message: 'Get 20% off on your next order! Use code SAVE20',
    type: 'promotion',
    read: true,
    priority: 'medium',
    actionUrl: '/promotions',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    readAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  },
  {
    id: 'notif_3',
    userId: 'user_1',
    title: 'Delivery Update',
    message: 'Your order is out for delivery and will arrive in 30 minutes.',
    type: 'delivery',
    read: false,
    priority: 'high',
    actionUrl: '/orders/12344/track',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply CORS middleware
  await corsMiddleware(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Protect route
    await new Promise((resolve, reject) => {
      protect(req, res, (err?: any) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    // Connect to database
    await connectDB();

    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const { 
      lastOrderUpdate, 
      lastNotificationUpdate, 
      lastProductUpdate,
      includeOrders = 'true',
      includeNotifications = 'true',
      includeProducts = 'true'
    } = req.query;

    const updates: any = {
      hasUpdates: false,
      timestamp: new Date().toISOString()
    };

    // Check for order updates
    if (includeOrders === 'true') {
      let orderQuery: any = {};
      
      if (userRole !== 'admin') {
        orderQuery.user = userId;
      }
      
      if (lastOrderUpdate) {
        orderQuery.updatedAt = { $gt: new Date(lastOrderUpdate as string) };
      }

      const orderUpdates = await Order.find(orderQuery)
        .populate('user', 'name email phone')
        .populate('store', 'name address')
        .populate('items.product', 'name price images')
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean();

      if (orderUpdates.length > 0) {
        updates.hasUpdates = true;
        updates.orders = orderUpdates;
      }
    }

    // Check for notification updates
    if (includeNotifications === 'true') {
      let notificationUpdates = [...mockNotifications];
      
      if (lastNotificationUpdate) {
        const lastUpdatedDate = new Date(lastNotificationUpdate as string);
        notificationUpdates = notificationUpdates.filter(n => 
          new Date(n.createdAt) > lastUpdatedDate || 
          (n.readAt && new Date(n.readAt) > lastUpdatedDate)
        );
      }

      if (notificationUpdates.length > 0) {
        updates.hasUpdates = true;
        updates.notifications = notificationUpdates;
      }
    }

    // Check for product updates
    if (includeProducts === 'true') {
      let productQuery: any = {
        isActive: true
      };
      
      if (lastProductUpdate) {
        productQuery.updatedAt = { $gt: new Date(lastProductUpdate as string) };
      }

      const productUpdates = await Product.find(productQuery)
        .populate('category', 'name')
        .populate('store', 'name address')
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean();

      if (productUpdates.length > 0) {
        updates.hasUpdates = true;
        updates.products = productUpdates.map(product => ({
          ...product,
          finalPrice: product.isOnSale && product.salePercentage 
            ? product.price * (1 - product.salePercentage / 100)
            : product.price
        }));
      }
    }

    res.status(200).json({
      success: true,
      data: updates
    });

  } catch (error: any) {
    console.error('Polling updates error:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}