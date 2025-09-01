import { NextApiRequest, NextApiResponse } from 'next';
import { protect } from '@/middleware/auth';
import connectDB from '@/config/database';
import Order from '@/models/Order';
import { notFoundError, authorizationError } from '@/middleware/errorHandler';

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

    const { id } = req.query;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const order = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('store', 'name address')
      .populate('items.product', 'name price images');

    if (!order) {
      throw notFoundError('Order');
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== userId && userRole !== 'admin') {
      throw authorizationError('Not authorized to access this order');
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error: any) {
    console.error('Get order error:', error);
    
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
