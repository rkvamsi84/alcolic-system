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
    const { period = '30' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - Number(period));

    let query: any = {
      paymentStatus: { $in: ['paid', 'failed', 'refunded'] },
      createdAt: { $gte: startDate }
    };
    
    // If user is not admin, only show their payment stats
    if (userRole !== 'admin') {
      query.user = userId;
    }

    // Get payment statistics
    const [totalStats, methodStats, statusStats, dailyStats] = await Promise.all([
      // Total payment amounts by status
      Order.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$paymentStatus',
            totalAmount: { $sum: '$total' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Payment method breakdown
      Order.aggregate([
        { $match: { ...query, paymentStatus: 'paid' } },
        {
          $group: {
            _id: '$paymentMethod',
            totalAmount: { $sum: '$total' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Payment status counts
      Order.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Daily payment trends
      Order.aggregate([
        { $match: { ...query, paymentStatus: 'paid' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            totalAmount: { $sum: '$total' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])
    ]);

    // Calculate summary statistics
    const totalPaid = totalStats.find(s => s._id === 'paid')?.totalAmount || 0;
    const totalFailed = totalStats.find(s => s._id === 'failed')?.count || 0;
    const totalRefunded = totalStats.find(s => s._id === 'refunded')?.totalAmount || 0;
    const totalTransactions = totalStats.reduce((sum, stat) => sum + stat.count, 0);

    // Calculate success rate
    const successfulPayments = totalStats.find(s => s._id === 'paid')?.count || 0;
    const successRate = totalTransactions > 0 ? (successfulPayments / totalTransactions) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue: totalPaid,
          totalTransactions,
          successfulPayments,
          failedPayments: totalFailed,
          refundedAmount: totalRefunded,
          successRate: Math.round(successRate * 100) / 100
        },
        paymentMethods: methodStats.map(method => ({
          method: method._id || 'Unknown',
          amount: method.totalAmount,
          count: method.count,
          percentage: totalPaid > 0 ? Math.round((method.totalAmount / totalPaid) * 100 * 100) / 100 : 0
        })),
        statusBreakdown: statusStats.map(status => ({
          status: status._id,
          count: status.count,
          percentage: totalTransactions > 0 ? Math.round((status.count / totalTransactions) * 100 * 100) / 100 : 0
        })),
        dailyTrends: dailyStats.map(day => ({
          date: `${day._id.year}-${String(day._id.month).padStart(2, '0')}-${String(day._id.day).padStart(2, '0')}`,
          amount: day.totalAmount,
          count: day.count
        })),
        period: Number(period)
      }
    });

  } catch (error: any) {
    console.error('Get payment history stats error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}