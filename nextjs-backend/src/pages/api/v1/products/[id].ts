import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/config/database';
import Product from '@/models/Product';
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

    const { id } = req.query;

    const product = await Product.findById(id)
      .populate('category', 'name')
      .populate('store', 'name address');

    if (!product) {
      throw notFoundError('Product');
    }

    // Product found successfully

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error: any) {
    console.error('Get product error:', error);
    
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
