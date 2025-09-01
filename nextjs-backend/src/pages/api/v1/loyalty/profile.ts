import { NextApiRequest, NextApiResponse } from 'next';
import { protect } from '@/middleware/auth';
import connectDB from '@/config/database';
import User from '@/models/User';
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

    // Get user data
    const user = await User.findById(userId).select('name email loyaltyPoints');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate loyalty statistics
    const [orderStats, recentOrders] = await Promise.all([
      Order.aggregate([
        { $match: { user: userId, status: { $in: ['completed', 'delivered'] } } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$total' },
            avgOrderValue: { $avg: '$total' }
          }
        }
      ]),
      Order.find({ 
        user: userId, 
        status: { $in: ['completed', 'delivered'] } 
      })
        .select('orderNumber total createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      avgOrderValue: 0
    };

    // Calculate loyalty tier based on total spent
    let tier = 'Bronze';
    let nextTierThreshold: number | null = 10000;
    let tierProgress = 0;

    if (stats.totalSpent >= 50000) {
      tier = 'Platinum';
      nextTierThreshold = null;
      tierProgress = 100;
    } else if (stats.totalSpent >= 25000) {
      tier = 'Gold';
      nextTierThreshold = 50000;
      tierProgress = ((stats.totalSpent - 25000) / 25000) * 100;
    } else if (stats.totalSpent >= 10000) {
      tier = 'Silver';
      nextTierThreshold = 25000;
      tierProgress = ((stats.totalSpent - 10000) / 15000) * 100;
    } else {
      tier = 'Bronze';
      nextTierThreshold = 10000;
      tierProgress = (stats.totalSpent / 10000) * 100;
    }

    // Calculate points earned (1 point per ₹100 spent)
    const pointsEarned = Math.floor(stats.totalSpent / 100);
    const currentPoints = user.loyaltyPoints || 0;

    // Get tier benefits
    const tierBenefits = getTierBenefits(tier);

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email
        },
        loyalty: {
          currentPoints,
          pointsEarned,
          tier,
          tierProgress: Math.round(tierProgress),
          nextTierThreshold,
          benefits: tierBenefits
        },
        statistics: {
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent,
          avgOrderValue: Math.round(stats.avgOrderValue || 0)
        },
        recentOrders: recentOrders.map(order => ({
          orderNumber: order.orderNumber,
          amount: order.total,
          date: order.createdAt,
          pointsEarned: Math.floor(order.total / 100)
        }))
      }
    });

  } catch (error: any) {
    console.error('Get loyalty profile error:', error);
    
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

function getTierBenefits(tier: string) {
  const benefits = {
    Bronze: [
      'Earn 1 point per ₹100 spent',
      'Birthday special offers',
      'Early access to sales'
    ],
    Silver: [
      'Earn 1 point per ₹100 spent',
      'Birthday special offers',
      'Early access to sales',
      '5% discount on orders above ₹2000',
      'Free delivery on orders above ₹1500'
    ],
    Gold: [
      'Earn 1.5 points per ₹100 spent',
      'Birthday special offers',
      'Early access to sales',
      '10% discount on orders above ₹2000',
      'Free delivery on all orders',
      'Priority customer support'
    ],
    Platinum: [
      'Earn 2 points per ₹100 spent',
      'Birthday special offers',
      'Early access to sales',
      '15% discount on orders above ₹2000',
      'Free delivery on all orders',
      'Priority customer support',
      'Exclusive product access',
      'Personal shopping assistant'
    ]
  };

  return benefits[tier as keyof typeof benefits] || benefits.Bronze;
}