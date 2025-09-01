import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/config/database';
import Category from '@/models/Category';
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

    const category = await Category.findById(id)
      .populate('parent', 'name')
      .populate('children', 'name');

    if (!category) {
      throw notFoundError('Category');
    }

    res.status(200).json({
      success: true,
      data: category
    });

  } catch (error: any) {
    console.error('Get category error:', error);
    
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
