import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/config/database';
import { APP_CONFIG } from '@/config/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Check database connection
    let dbStatus = 'disconnected';
    try {
      await connectDB();
      dbStatus = 'connected';
    } catch (error) {
      console.error('Database connection error:', error);
      dbStatus = 'error';
    }

    // Get system info
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    };

    res.status(200).json({
      success: true,
      message: `${APP_CONFIG.NAME} API is running - V${APP_CONFIG.VERSION}`,
      data: {
        version: APP_CONFIG.VERSION,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        system: systemInfo,
        endpoints: {
          auth: '/api/v1/auth',
          users: '/api/v1/users',
          stores: '/api/v1/stores',
          products: '/api/v1/products',
          orders: '/api/v1/orders',
          categories: '/api/v1/categories'
        }
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
