import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '../../../../middleware/cors';
import { errorHandler } from '../../../../middleware/errorHandler';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  userId?: string;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Welcome to Alcolic',
    message: 'Thank you for joining our platform!',
    type: 'success',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Order Update',
    message: 'Your order has been processed successfully.',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await corsMiddleware(req, res);

    if (req.method === 'GET') {
      // Get all notifications
      return res.status(200).json({
        success: true,
        data: mockNotifications,
        total: mockNotifications.length,
      });
    }

    if (req.method === 'POST') {
      // Create new notification
      const { title, message, type = 'info' } = req.body;
      
      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Title and message are required',
        });
      }

      const newNotification: Notification = {
        id: (mockNotifications.length + 1).toString(),
        title,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString(),
      };

      mockNotifications.push(newNotification);

      return res.status(201).json({
        success: true,
        data: newNotification,
        message: 'Notification created successfully',
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Notifications API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default handler;