import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '@/middleware/cors';

interface LoginHistory {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  device: string;
  location: {
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  loginTime: string;
  logoutTime?: string;
  status: 'success' | 'failed' | 'blocked';
  failureReason?: string;
  sessionDuration?: number; // in minutes
  isTrustedDevice: boolean;
}

// Mock login history data
const mockLoginHistory: LoginHistory[] = [
  {
    id: 'login_1',
    userId: 'user_1',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    device: 'iPhone 15 Pro',
    location: {
      city: 'New York',
      country: 'United States',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    loginTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    status: 'success',
    isTrustedDevice: true
  },
  {
    id: 'login_2',
    userId: 'user_1',
    ipAddress: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    device: 'MacBook Pro',
    location: {
      city: 'New York',
      country: 'United States',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    loginTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    logoutTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    status: 'success',
    sessionDuration: 75,
    isTrustedDevice: true
  },
  {
    id: 'login_3',
    userId: 'user_1',
    ipAddress: '203.0.113.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    device: 'Windows PC',
    location: {
      city: 'Los Angeles',
      country: 'United States',
      coordinates: { lat: 34.0522, lng: -118.2437 }
    },
    loginTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    logoutTime: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(), // 23 hours ago
    status: 'success',
    sessionDuration: 60,
    isTrustedDevice: false
  },
  {
    id: 'login_4',
    userId: 'user_1',
    ipAddress: '198.51.100.25',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    device: 'Linux Desktop',
    location: {
      city: 'Unknown',
      country: 'Unknown'
    },
    loginTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    status: 'failed',
    failureReason: 'Invalid password',
    isTrustedDevice: false
  },
  {
    id: 'login_5',
    userId: 'user_1',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    device: 'iPhone 15 Pro',
    location: {
      city: 'New York',
      country: 'United States',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    loginTime: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    logoutTime: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(), // 70 hours ago
    status: 'success',
    sessionDuration: 120,
    isTrustedDevice: true
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
        const { 
          limit = '20', 
          offset = '0', 
          status,
          days = '30'
        } = req.query;
        
        let filteredHistory = [...mockLoginHistory];
        
        // Filter by status if provided
        if (status && status !== 'all') {
          filteredHistory = filteredHistory.filter(h => h.status === status);
        }
        
        // Filter by date range
        const daysNum = parseInt(days as string);
        const cutoffDate = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);
        filteredHistory = filteredHistory.filter(h => 
          new Date(h.loginTime) >= cutoffDate
        );
        
        // Sort by login time (most recent first)
        filteredHistory.sort((a, b) => 
          new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime()
        );
        
        // Apply pagination
        const startIndex = parseInt(offset as string);
        const limitNum = parseInt(limit as string);
        const paginatedHistory = filteredHistory.slice(startIndex, startIndex + limitNum);
        
        // Calculate statistics
        const stats = {
          totalLogins: filteredHistory.length,
          successfulLogins: filteredHistory.filter(h => h.status === 'success').length,
          failedLogins: filteredHistory.filter(h => h.status === 'failed').length,
          blockedLogins: filteredHistory.filter(h => h.status === 'blocked').length,
          uniqueDevices: new Set(filteredHistory.map(h => h.device)).size,
          uniqueLocations: new Set(filteredHistory.map(h => `${h.location.city}, ${h.location.country}`)).size
        };
        
        return res.status(200).json({
          success: true,
          data: paginatedHistory,
          pagination: {
            total: filteredHistory.length,
            limit: limitNum,
            offset: startIndex,
            hasMore: startIndex + limitNum < filteredHistory.length
          },
          statistics: stats
        });

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Login history API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}