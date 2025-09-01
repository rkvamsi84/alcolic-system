import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '@/middleware/cors';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'security' | 'system' | 'delivery';
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}

// Mock user notifications data
const mockNotifications: Notification[] = [
  {
    id: 'notif_1',
    userId: 'user_1',
    title: 'Order Confirmed',
    message: 'Your order #12345 has been confirmed and is being prepared.',
    type: 'order',
    read: false,
    priority: 'high',
    actionUrl: '/orders/12345',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    readAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
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
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
  },
  {
    id: 'notif_4',
    userId: 'user_1',
    title: 'Security Alert',
    message: 'New login detected from a different device.',
    type: 'security',
    read: true,
    priority: 'high',
    actionUrl: '/security/sessions',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString() // 23 hours ago
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply CORS middleware
  await corsMiddleware(req, res);

  try {
    switch (req.method) {
      case 'GET':
        const { limit = '10', offset = '0', unread = 'false', lastUpdated } = req.query;
        
        let filteredNotifications = [...mockNotifications];
        
        // Filter by timestamp for polling
        if (lastUpdated) {
          const lastUpdatedDate = new Date(lastUpdated as string);
          filteredNotifications = filteredNotifications.filter(n => 
            new Date(n.createdAt) > lastUpdatedDate || 
            (n.readAt && new Date(n.readAt) > lastUpdatedDate)
          );
        }
        
        // Filter by unread if requested
        if (unread === 'true') {
          filteredNotifications = filteredNotifications.filter(n => !n.read);
        }
        
        // Apply pagination
        const startIndex = parseInt(offset as string);
        const limitNum = parseInt(limit as string);
        const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + limitNum);
        
        return res.status(200).json({
          success: true,
          data: paginatedNotifications,
          pagination: {
            total: filteredNotifications.length,
            limit: limitNum,
            offset: startIndex,
            hasMore: startIndex + limitNum < filteredNotifications.length
          }
        });

      case 'PUT':
        // Mark notifications as read
        const { notificationIds } = req.body;
        
        if (!notificationIds || !Array.isArray(notificationIds)) {
          return res.status(400).json({
            success: false,
            message: 'notificationIds array is required'
          });
        }
        
        // In a real app, you would update the database
        const updatedCount = notificationIds.length;
        
        return res.status(200).json({
          success: true,
          message: `${updatedCount} notifications marked as read`,
          data: { updatedCount }
        });

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('My notifications API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}