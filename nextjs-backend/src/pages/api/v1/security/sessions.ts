import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '@/middleware/cors';

interface ActiveSession {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  location: {
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  loginTime: string;
  lastActivity: string;
  isCurrentSession: boolean;
  isTrustedDevice: boolean;
  sessionToken: string;
  expiresAt: string;
}

// Mock active sessions data
const mockSessions: ActiveSession[] = [
  {
    id: 'session_1',
    userId: 'user_1',
    deviceId: 'device_iphone_1',
    deviceName: 'iPhone 15 Pro',
    deviceType: 'mobile',
    browser: 'Safari 17.0',
    operatingSystem: 'iOS 17.0',
    ipAddress: '192.168.1.100',
    location: {
      city: 'New York',
      country: 'United States',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    loginTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    lastActivity: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 minutes ago
    isCurrentSession: true,
    isTrustedDevice: true,
    sessionToken: 'sess_token_current_123',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() // 24 hours from now
  },
  {
    id: 'session_2',
    userId: 'user_1',
    deviceId: 'device_macbook_1',
    deviceName: 'MacBook Pro',
    deviceType: 'desktop',
    browser: 'Chrome 120.0',
    operatingSystem: 'macOS 14.0',
    ipAddress: '10.0.0.50',
    location: {
      city: 'New York',
      country: 'United States',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    loginTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    lastActivity: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    isCurrentSession: false,
    isTrustedDevice: true,
    sessionToken: 'sess_token_macbook_456',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString() // 22 hours from now
  },
  {
    id: 'session_3',
    userId: 'user_1',
    deviceId: 'device_windows_1',
    deviceName: 'Windows PC',
    deviceType: 'desktop',
    browser: 'Edge 120.0',
    operatingSystem: 'Windows 11',
    ipAddress: '203.0.113.45',
    location: {
      city: 'Los Angeles',
      country: 'United States',
      coordinates: { lat: 34.0522, lng: -118.2437 }
    },
    loginTime: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    isCurrentSession: false,
    isTrustedDevice: false,
    sessionToken: 'sess_token_windows_789',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString() // 18 hours from now
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
        const { includeExpired = 'false' } = req.query;
        
        let filteredSessions = [...mockSessions];
        
        // Filter out expired sessions unless requested
        if (includeExpired !== 'true') {
          const now = new Date();
          filteredSessions = filteredSessions.filter(s => 
            new Date(s.expiresAt) > now
          );
        }
        
        // Sort by last activity (most recent first)
        filteredSessions.sort((a, b) => 
          new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        );
        
        // Calculate statistics
        const stats = {
          totalActiveSessions: filteredSessions.length,
          trustedDevices: filteredSessions.filter(s => s.isTrustedDevice).length,
          untrustedDevices: filteredSessions.filter(s => !s.isTrustedDevice).length,
          deviceTypes: {
            mobile: filteredSessions.filter(s => s.deviceType === 'mobile').length,
            desktop: filteredSessions.filter(s => s.deviceType === 'desktop').length,
            tablet: filteredSessions.filter(s => s.deviceType === 'tablet').length,
            unknown: filteredSessions.filter(s => s.deviceType === 'unknown').length
          },
          uniqueLocations: new Set(filteredSessions.map(s => `${s.location.city}, ${s.location.country}`)).size
        };
        
        return res.status(200).json({
          success: true,
          data: filteredSessions,
          statistics: stats
        });

      case 'DELETE':
        // Terminate specific session(s)
        const { sessionId, sessionIds, terminateAll = false } = req.body;
        
        if (terminateAll) {
          // Terminate all sessions except current
          const terminatedCount = mockSessions.filter(s => !s.isCurrentSession).length;
          
          return res.status(200).json({
            success: true,
            message: `${terminatedCount} sessions terminated successfully`,
            data: { terminatedCount }
          });
        }
        
        if (sessionId) {
          // Terminate single session
          const session = mockSessions.find(s => s.id === sessionId);
          if (!session) {
            return res.status(404).json({
              success: false,
              message: 'Session not found'
            });
          }
          
          if (session.isCurrentSession) {
            return res.status(400).json({
              success: false,
              message: 'Cannot terminate current session'
            });
          }
          
          return res.status(200).json({
            success: true,
            message: 'Session terminated successfully',
            data: { sessionId }
          });
        }
        
        if (sessionIds && Array.isArray(sessionIds)) {
          // Terminate multiple sessions
          const validSessions = sessionIds.filter(id => 
            mockSessions.find(s => s.id === id && !s.isCurrentSession)
          );
          
          return res.status(200).json({
            success: true,
            message: `${validSessions.length} sessions terminated successfully`,
            data: { terminatedCount: validSessions.length }
          });
        }
        
        return res.status(400).json({
          success: false,
          message: 'sessionId, sessionIds array, or terminateAll flag is required'
        });

      default:
        res.setHeader('Allow', ['GET', 'DELETE']);
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Active sessions API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}