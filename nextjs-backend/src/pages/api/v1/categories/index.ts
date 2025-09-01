import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/config/database';
import Category from '@/models/Category';

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

    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .populate('parent', 'name')
      .populate('children', 'name');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });

  } catch (error: any) {
    console.error('Get categories error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}
