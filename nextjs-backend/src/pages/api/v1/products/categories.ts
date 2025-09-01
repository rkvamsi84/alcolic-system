import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '@/middleware/cors';
import connectDB from '@/config/database';
import Product from '@/models/Product';
import { optionalAuth } from '@/middleware/auth';

interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock categories data
const mockCategories: ProductCategory[] = [
  {
    id: '1',
    name: 'Wine',
    description: 'Premium wines from around the world',
    imageUrl: '/images/categories/wine.jpg',
    productCount: 45,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Beer',
    description: 'Craft and premium beers',
    imageUrl: '/images/categories/beer.jpg',
    productCount: 32,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'Spirits',
    description: 'Premium spirits and liquors',
    imageUrl: '/images/categories/spirits.jpg',
    productCount: 28,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '4',
    name: 'Champagne',
    description: 'Luxury champagnes and sparkling wines',
    imageUrl: '/images/categories/champagne.jpg',
    productCount: 15,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '5',
    name: 'Cocktail Mixers',
    description: 'Premium mixers and cocktail ingredients',
    imageUrl: '/images/categories/mixers.jpg',
    productCount: 12,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

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

    const { includeInactive = false } = req.query;

    // Filter categories based on active status
    let categories = mockCategories;
    if (!includeInactive) {
      categories = categories.filter(category => category.isActive);
    }

    // Sort categories by name
    categories.sort((a, b) => a.name.localeCompare(b.name));

    return res.status(200).json({
      success: true,
      data: categories,
      message: 'Product categories retrieved successfully'
    });

  } catch (error) {
    console.error('Product categories API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}