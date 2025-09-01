import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/config/database';
import Store from '@/models/Store';
import { optionalAuth } from '@/middleware/auth';

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

    const {
      page = 1,
      limit = 10,
      category,
      search,
      lat,
      lng,
      radius = 10,
      sort = 'rating',
      order = 'desc'
    } = req.query;

    // Build query
    const query: any = {
      isActive: true,
      isVerified: true
    };

    // Category filter
    if (category) {
      query.categories = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Location filter
    if (lat && lng) {
      const coordinates = [parseFloat(lng as string), parseFloat(lat as string)];
      query['address.location'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: parseFloat(radius as string) * 1000 // Convert km to meters
        }
      };
    }

    // Build sort object
    const sortObj: any = {};
    if (sort === 'rating') {
      sortObj['rating.average'] = order === 'desc' ? -1 : 1;
    } else if (sort === 'distance' && lat && lng) {
      // Distance sorting is handled by $near query
    } else if (sort === 'name') {
      sortObj.name = order === 'desc' ? -1 : 1;
    } else {
      sortObj.createdAt = order === 'desc' ? -1 : 1;
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const stores = await Store.find(query)
      .populate('categories', 'name')
      .populate('owner', 'name email phone')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await Store.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        stores,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error: any) {
    console.error('Get stores error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}
