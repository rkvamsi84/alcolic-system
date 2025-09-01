import { NextApiRequest, NextApiResponse } from 'next';
import { protect, authorize } from '@/middleware/auth';
import connectDB from '@/config/database';
import Product from '@/models/Product';
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

    const product = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'category', select: 'name' },
      { path: 'store', select: 'name address' }
    ]);

    if (!product) {
      throw notFoundError('Product');
    }

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error: any) {
    console.error('Update product error:', error);
    
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
