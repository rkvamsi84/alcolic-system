import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/config/database';
import Store from '@/models/Store';
import Product from '@/models/Product';
import { optionalAuth } from '@/middleware/auth';
import { notFoundError } from '@/middleware/errorHandler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Connect to database
    await connectDB();

    // Optional authentication
    await new Promise((resolve, reject) => {
      optionalAuth(req, res, (err?: any) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    const { id } = req.query;

    // Find store with populated fields
    const store = await Store.findById(id)
      .populate('categories', 'name description image')
      .populate('owner', 'name email phone')
      .lean();

    if (!store) {
      throw notFoundError('Store');
    }

    // Check if store is active and verified
    if (!store.isActive || !store.isVerified) {
      throw notFoundError('Store');
    }

    // Get store products
    const products = await Product.find({
      store: id,
      isActive: true
    })
    .populate('category', 'name')
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(20)
    .lean();

    // Get store statistics
    const stats = await Product.aggregate([
      { $match: { store: store._id, isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalStock: { $sum: '$stock' }
        }
      }
    ]);

    const storeStats = stats[0] || {
      totalProducts: 0,
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      totalStock: 0
    };

    res.status(200).json({
      success: true,
      data: {
        store: {
          ...store,
          stats: storeStats
        },
        products
      }
    });

  } catch (error: any) {
    console.error('Get store error:', error);
    
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
