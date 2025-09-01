import { NextApiRequest, NextApiResponse } from 'next';
import { protect } from '@/middleware/auth';
import connectDB from '@/config/database';
import User from '@/models/User';
import { notFoundError } from '@/middleware/errorHandler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    // Get user from request (set by protect middleware)
    const userId = (req as any).user.id;

    // Find user with populated fields
    const user = await User.findById(userId)
      .select('-password')
      .populate('address')
      .populate('preferences');

    if (!user) {
      throw notFoundError('User');
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });

  } catch (error: any) {
    console.error('Get user error:', error);
    
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
