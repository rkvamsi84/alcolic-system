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

    const {
      latitude,
      longitude,
      radius = 10000, // Default 10km radius in meters
      page = 1,
      limit = 20,
      category,
      search,
      sort = 'distance',
      order = 'asc'
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const radiusNum = parseInt(radius as string);
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude values'
      });
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat] // GeoJSON uses [longitude, latitude]
          },
          distanceField: 'distance',
          maxDistance: radiusNum,
          spherical: true,
          query: {
            isActive: true,
            isVerified: true
          }
        }
      }
    ];

    // Add category filter if provided
    if (category) {
      pipeline.push({
        $match: {
          categories: category
        }
      });
    }

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add sorting
    const sortObj: any = {};
    if (sort === 'distance') {
      sortObj.distance = order === 'desc' ? -1 : 1;
    } else if (sort === 'rating') {
      sortObj['rating.average'] = order === 'desc' ? -1 : 1;
    } else if (sort === 'name') {
      sortObj.name = order === 'desc' ? -1 : 1;
    } else {
      sortObj.createdAt = order === 'desc' ? -1 : 1;
    }

    pipeline.push({ $sort: sortObj });

    // Add pagination
    const skip = (pageNum - 1) * limitNum;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    // Add projection to transform the data
    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        images: 1,
        logo: 1,
        'contact.phone': 1,
        'contact.email': 1,
        'address.street': 1,
        'address.city': 1,
        'address.state': 1,
        'address.zipCode': 1,
        'address.country': 1,
        'address.location': 1,
        deliveryRadius: 1,
        deliveryFee: 1,
        minimumOrder: 1,
        hours: 1,
        rating: 1,
        categories: 1,
        isActive: 1,
        isVerified: 1,
        distance: { $round: ['$distance', 0] }, // Round distance to nearest meter
        createdAt: 1,
        updatedAt: 1
      }
    });

    // Execute the aggregation
    const stores = await Store.aggregate(pipeline);

    // Get total count for pagination (without limit)
    const countPipeline = pipeline.slice(0, -2); // Remove skip and limit
    countPipeline.push({ $count: 'total' });
    const countResult = await Store.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Transform stores data
    const transformedStores = stores.map(store => ({
      id: store._id,
      name: store.name,
      description: store.description,
      images: store.images || [],
      logo: store.logo,
      phone: store.contact?.phone,
      email: store.contact?.email,
      address: {
        street: store.address?.street,
        city: store.address?.city,
        state: store.address?.state,
        zipCode: store.address?.zipCode,
        country: store.address?.country,
        coordinates: store.address?.location?.coordinates
      },
      deliveryRadius: store.deliveryRadius,
      deliveryFee: store.deliveryFee,
      minimumOrder: store.minimumOrder,
      hours: store.hours,
      rating: {
        average: store.rating?.average || 0,
        count: store.rating?.count || 0
      },
      categories: store.categories,
      distance: store.distance, // Distance in meters
      distanceKm: Math.round((store.distance / 1000) * 100) / 100, // Distance in km, rounded to 2 decimals
      isActive: store.isActive,
      isVerified: store.isVerified,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt
    }));

    return res.status(200).json({
      success: true,
      data: transformedStores,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage
      },
      searchParams: {
        latitude: lat,
        longitude: lng,
        radius: radiusNum,
        category,
        search
      },
      message: `Found ${transformedStores.length} stores within ${radiusNum/1000}km`
    });

  } catch (error) {
    console.error('Error fetching nearby stores:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}