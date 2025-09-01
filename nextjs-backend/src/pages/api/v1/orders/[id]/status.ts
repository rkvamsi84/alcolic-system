import { NextApiRequest, NextApiResponse } from 'next';
import { protect, authorize } from '@/middleware/auth';
import connectDB from '@/config/database';
import Order from '@/models/Order';
import { notFoundError } from '@/middleware/errorHandler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
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

    // Authorize admin
    await new Promise((resolve, reject) => {
      authorize('admin')(req, res, (err?: any) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    // Connect to database
    await connectDB();

    const { id } = req.query;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate([
      { path: 'user', select: 'name email phone' },
      { path: 'store', select: 'name address' },
      { path: 'items.product', select: 'name price images' }
    ]);

    if (!order) {
      throw notFoundError('Order');
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error: any) {
    console.error('Update order status error:', error);
    
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
