import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '@/middleware/cors';

interface SecuritySettings {
  id: string;
  userId: string;
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number; // in minutes
  allowMultipleSessions: boolean;
  requirePasswordChange: boolean;
  passwordChangeInterval: number; // in days
  trustedDevices: string[];
  ipWhitelist: string[];
  loginAttemptLimit: number;
  accountLockoutDuration: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

// Mock security settings data
const mockSettings: SecuritySettings = {
  id: 'sec_settings_1',
  userId: 'user_1',
  twoFactorEnabled: false,
  loginNotifications: true,
  sessionTimeout: 60, // 1 hour
  allowMultipleSessions: true,
  requirePasswordChange: false,
  passwordChangeInterval: 90, // 90 days
  trustedDevices: ['device_1', 'device_2'],
  ipWhitelist: [],
  loginAttemptLimit: 5,
  accountLockoutDuration: 30, // 30 minutes
  createdAt: '2024-01-01T00:00:00Z',
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
        // Get security settings
        return res.status(200).json({
          success: true,
          data: mockSettings
        });

      case 'PUT':
        // Update security settings
        const {
          twoFactorEnabled,
          loginNotifications,
          sessionTimeout,
          allowMultipleSessions,
          requirePasswordChange,
          passwordChangeInterval,
          loginAttemptLimit,
          accountLockoutDuration
        } = req.body;
        
        const updatedSettings = {
          ...mockSettings,
          ...(twoFactorEnabled !== undefined && { twoFactorEnabled }),
          ...(loginNotifications !== undefined && { loginNotifications }),
          ...(sessionTimeout !== undefined && { sessionTimeout }),
          ...(allowMultipleSessions !== undefined && { allowMultipleSessions }),
          ...(requirePasswordChange !== undefined && { requirePasswordChange }),
          ...(passwordChangeInterval !== undefined && { passwordChangeInterval }),
          ...(loginAttemptLimit !== undefined && { loginAttemptLimit }),
          ...(accountLockoutDuration !== undefined && { accountLockoutDuration }),
          updatedAt: new Date().toISOString()
        };
        
        return res.status(200).json({
          success: true,
          data: updatedSettings,
          message: 'Security settings updated successfully'
        });

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Security settings API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}