import { NextApiRequest, NextApiResponse } from 'next';
import { protect } from '@/middleware/auth';
import connectDB from '@/config/database';
import Order from '@/models/Order';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

    const order = await Order.create({
      ...req.body,
      user: userId
    });

    // Populate the order with related data
    await order.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'store', select: 'name address' },
      { path: 'items.product', select: 'name price images' }
    ]);

    res.status(201).json({
      success: true,
      data: order
    });

  } catch (error: any) {
    console.error('Create order error:', error);
    
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
