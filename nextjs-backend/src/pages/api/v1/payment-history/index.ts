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
    const { status, method, limit = 50, page = 1 } = req.query;

    let query: any = {
      paymentStatus: { $in: ['paid', 'failed', 'refunded'] } // Only show payment transactions
    };
    
    // If user is not admin, only show their payment history
    if (userRole !== 'admin') {
      query.user = userId;
    }

    // Filter by payment status if provided
    if (status && typeof status === 'string') {
      query.paymentStatus = status;
    }

    // Filter by payment method if provided
    if (method && typeof method === 'string') {
      query.paymentMethod = method;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email phone')
        .populate('store', 'name address')
        .select('orderNumber total paymentStatus paymentMethod createdAt updatedAt user store')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skip),
      Order.countDocuments(query)
    ]);

    // Transform data for payment history format
    const paymentHistory = payments.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      amount: order.total,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      transactionDate: order.createdAt,
      lastUpdated: order.updatedAt,
      user: order.user,
      store: order.store
    }));

    res.status(200).json({
      success: true,
      count: paymentHistory.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: paymentHistory
    });

  } catch (error: any) {
    console.error('Get payment history error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}