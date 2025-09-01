import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/config/database';
import Product from '@/models/Product';
import { optionalAuth } from '@/middleware/auth';
import { corsMiddleware } from '@/middleware/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply CORS middleware
  await corsMiddleware(req, res);

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
      limit = 20,
      store,
      category,
      search,
      minPrice,
      maxPrice,
      brand,
      inStock,
      featured,
      onSale,
      sort = 'createdAt',
      order = 'desc',
      lastUpdated
    } = req.query;

    // Build query
    const query: any = {
      isActive: true
    };

    // Add timestamp filter for polling
    if (lastUpdated) {
      query.updatedAt = { $gt: new Date(lastUpdated as string) };
    }

    // Store filter
    if (store) {
      query.store = store;
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
    }

    // Brand filter
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // On sale filter
    if (onSale === 'true') {
      query.isOnSale = true;
    }

    // Build sort object
    const sortObj: any = {};
    if (sort === 'price') {
      sortObj.price = order === 'desc' ? -1 : 1;
    } else if (sort === 'rating') {
      sortObj['ratings.average'] = order === 'desc' ? -1 : 1;
    } else if (sort === 'name') {
      sortObj.name = order === 'desc' ? -1 : 1;
    } else if (sort === 'featured') {
      sortObj.isFeatured = order === 'desc' ? -1 : 1;
    } else {
      sortObj.createdAt = order === 'desc' ? -1 : 1;
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('store', 'name address')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await Product.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Calculate final prices for products on sale
    const productsWithFinalPrice = products.map(product => ({
      ...product,
      finalPrice: product.isOnSale && product.salePercentage 
        ? product.price * (1 - product.salePercentage / 100)
        : product.price
    }));

    res.status(200).json({
      success: true,
      data: {
        products: productsWithFinalPrice,
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
    console.error('Get products error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}
