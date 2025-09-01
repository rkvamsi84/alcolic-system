import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/config/database';
import Order from '@/models/Order';
import { protect } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import corsMiddleware from '@/middleware/cors';

export default asyncHandler(async (req: NextApiRequest & { user?: any }, res: NextApiResponse) => {
  // Apply CORS middleware
  await corsMiddleware(req, res, () => {});

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    await connectDB();

    // Apply authentication middleware
    await new Promise<void>((resolve, reject) => {
      protect(req, res, () => resolve());
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const { period = '30' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period as string));

    // Build query for orders with payment information
    const query: any = {
      user: userId,
      paymentStatus: { $in: ['paid', 'failed', 'refunded', 'pending'] },
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };

    // Get payment history data (using orders with payment info)
    const payments = await Order.find(query)
      .populate('user', 'name email')
      .populate('store', 'name')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalTransactions = payments.length;
    const totalRevenue = payments.reduce((sum: number, payment: any) => sum + (payment.total || 0), 0);
    const successfulTransactions = payments.filter((p: any) => p.paymentStatus === 'paid').length;
    const failedTransactions = payments.filter((p: any) => p.paymentStatus === 'failed').length;
    const pendingTransactions = payments.filter((p: any) => p.paymentStatus === 'pending').length;
    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;

    // Payment method breakdown
    const methodBreakdown = payments.reduce((acc: any, payment: any) => {
      const method = payment.paymentMethod || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as any);

    // Status breakdown
    const statusBreakdown = {
      completed: successfulTransactions,
      failed: failedTransactions,
      pending: pendingTransactions,
      refunded: payments.filter((p: any) => p.paymentStatus === 'refunded').length
    };

    // Daily trends (last 7 days)
    const dailyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayPayments = payments.filter((p: any) => 
        p.createdAt >= date && p.createdAt < nextDate
      );
      
      dailyTrends.push({
        date: date.toISOString().split('T')[0],
        transactions: dayPayments.length,
        revenue: dayPayments.reduce((sum: number, p: any) => sum + (p.total || 0), 0),
        successRate: dayPayments.length > 0 
          ? (dayPayments.filter((p: any) => p.paymentStatus === 'paid').length / dayPayments.length) * 100 
          : 0
      });
    }

    // Average transaction amount
    const averageTransactionAmount = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const stats = {
      period: `${period} days`,
      totalTransactions,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageTransactionAmount: Math.round(averageTransactionAmount * 100) / 100,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
      successRate: Math.round(successRate * 100) / 100,
      methodBreakdown,
      statusBreakdown,
      dailyTrends
    };

    res.status(200).json({
      success: true,
      message: 'Payment history statistics retrieved successfully',
      data: stats
    });

  } catch (error: any) {
    console.error('Payment history stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});