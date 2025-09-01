import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '@/middleware/cors';

interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  securityAlerts: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock notification settings data
const mockSettings: NotificationSettings = {
  id: 'settings_1',
  userId: 'user_1',
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  orderUpdates: true,
  promotions: true,
  newsletter: false,
  securityAlerts: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply CORS middleware
  await corsMiddleware(req, res);

  try {
    switch (req.method) {
      case 'GET':
        // Get notification settings
        return res.status(200).json({
          success: true,
          data: mockSettings
        });

      case 'PUT':
        // Update notification settings
        const updatedSettings = {
          ...mockSettings,
          ...req.body,
          updatedAt: new Date().toISOString()
        };
        
        return res.status(200).json({
          success: true,
          data: updatedSettings,
          message: 'Notification settings updated successfully'
        });

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Notification settings API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}