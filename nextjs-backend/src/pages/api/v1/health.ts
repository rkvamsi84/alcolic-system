import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '@/middleware/cors';
import connectDB from '@/config/database';
import { APP_CONFIG } from '@/config/constants';

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API and database connection
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 database:
 *                   type: string
 *                   example: "connected"
 *       500:
 *         description: Server error
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply CORS middleware
  await corsMiddleware(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Test database connection
    let dbStatus = 'disconnected';
    try {
      await connectDB();
      dbStatus = 'connected';
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      dbStatus = 'error';
    }

    const healthData = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: APP_CONFIG.VERSION,
      name: APP_CONFIG.NAME,
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    };

    return res.status(200).json(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Internal server error'
    });
  }
}