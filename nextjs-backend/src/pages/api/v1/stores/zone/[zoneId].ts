import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/config/database';
import Store from '@/models/Store';
import { optionalAuth } from '@/middleware/auth';
import { corsMiddleware } from '@/middleware/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await corsMiddleware(req, res);

    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

    // Connect to database
    await connectDB();

    // Optional authentication
    await new Promise((resolve, reject) => {
      optionalAuth(req, res, (err?: any) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    const { zoneId } = req.query;
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sort = 'rating',
      order = 'desc'
    } = req.query;

    if (!zoneId) {
      return res.status(400).json({
        success: false,
        message: 'Zone ID is required'
      });
    }

    // Build query for stores in the specified zone
    const query: any = {
      isActive: true,
      isVerified: true,
      deliveryZones: zoneId // Assuming stores have a deliveryZones field
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

    // Build sort object
    const sortObj: any = {};
    if (sort === 'rating') {
      sortObj['rating.average'] = order === 'desc' ? -1 : 1;
    } else if (sort === 'name') {
      sortObj.name = order === 'desc' ? -1 : 1;
    } else if (sort === 'created') {
      sortObj.createdAt = order === 'desc' ? -1 : 1;
    } else {
      sortObj['rating.average'] = -1; // Default sort by rating
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get stores with pagination
    const stores = await Store.find(query)
      .populate('categories', 'name description image')
      .populate('owner', 'name email phone')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await Store.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Transform stores data
    const transformedStores = stores.map(store => ({
      id: store._id,
      name: store.name,
      description: store.description,
      images: store.images,
      logo: store.logo,
      address: store.address,
      contact: store.contact,
      rating: store.rating,
      categories: store.categories,
      deliveryFee: store.deliveryFee,
      minimumOrder: store.minimumOrder,
      deliveryRadius: store.deliveryRadius,
      isOpen: store.isOpen,
      hours: store.hours,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt
    }));

    return res.status(200).json({
      success: true,
      data: {
        stores: transformedStores,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        },
        zoneId
      },
      message: `Found ${transformedStores.length} stores in zone ${zoneId}`
    });

  } catch (error) {
    console.error('Error fetching stores for zone:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}