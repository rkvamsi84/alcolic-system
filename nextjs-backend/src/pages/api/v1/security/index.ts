import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '../../../../middleware/cors';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number;
  ipRestrictions: string[];
  lastPasswordChange: string;
}

// Mock security data
const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  loginNotifications: true,
  sessionTimeout: 3600,
  ipRestrictions: [],
  lastPasswordChange: new Date().toISOString(),
};

const mockLoginHistory = [
  {
    id: '1',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'New York, US',
    timestamp: new Date().toISOString(),
    success: true,
  },
  {
    id: '2',
    ip: '192.168.1.2',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    location: 'Los Angeles, US',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    success: true,
  },
];

const mockSessions = [
  {
    id: '1',
    device: 'Chrome on Windows',
    ip: '192.168.1.1',
    location: 'New York, US',
    lastActive: new Date().toISOString(),
    current: true,
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    ip: '192.168.1.2',
    location: 'Los Angeles, US',
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    current: false,
  },
];

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await corsMiddleware(req, res);

    if (req.method === 'GET') {
      const { type } = req.query;

      switch (type) {
        case 'settings':
          return res.status(200).json({
            success: true,
            data: mockSecuritySettings,
          });
        
        case 'sessions':
          return res.status(200).json({
            success: true,
            data: mockSessions,
          });
        
        case 'login-history':
          return res.status(200).json({
            success: true,
            data: mockLoginHistory,
          });
        
        case 'statistics':
          return res.status(200).json({
            success: true,
            data: {
              totalLogins: 156,
              failedAttempts: 3,
              activeSessions: 2,
              securityScore: 85,
            },
          });
        
        default:
          return res.status(200).json({
            success: true,
            data: {
              settings: mockSecuritySettings,
              sessions: mockSessions,
              loginHistory: mockLoginHistory,
            },
          });
      }
    }

    if (req.method === 'POST') {
      const { action, ...data } = req.body;

      switch (action) {
        case 'update-settings':
          Object.assign(mockSecuritySettings, data);
          return res.status(200).json({
            success: true,
            data: mockSecuritySettings,
            message: 'Security settings updated successfully',
          });
        
        case 'change-password':
          return res.status(200).json({
            success: true,
            message: 'Password changed successfully',
          });
        
        case 'setup-2fa':
          return res.status(200).json({
            success: true,
            data: {
              qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
              secret: 'JBSWY3DPEHPK3PXP',
            },
            message: '2FA setup initiated',
          });
        
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid action',
          });
      }
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Security API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default handler;