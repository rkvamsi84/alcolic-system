import { NextApiRequest, NextApiResponse } from 'next';
import { protect } from '@/middleware/auth';
import connectDB from '@/config/database';
import Order from '@/models/Order';

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

    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    let query: any = {
      status: { $in: ['pending', 'confirmed', 'preparing', 'out_for_delivery'] }
    };
    
    // If user is not admin, only show their orders
    if (userRole !== 'admin') {
      query.user = userId;
    }

    const activeOrders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('store', 'name address phone')
      .populate('items.product', 'name price images')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: activeOrders.length,
      data: activeOrders
    });

  } catch (error: any) {
    console.error('Get active orders error:', error);
    
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