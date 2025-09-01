import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '../../../../middleware/cors';

interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string;
  type: 'promotional' | 'informational' | 'seasonal';
  position: 'hero' | 'sidebar' | 'footer' | 'popup';
  active: boolean;
  startDate: string;
  endDate?: string;
  priority: number;
  clickCount: number;
  impressions: number;
  createdAt: string;
  updatedAt: string;
}

// Mock banners data
const mockBanners: Banner[] = [
  {
    id: '1',
    title: 'Welcome to Alcolic',
    description: 'Discover premium alcoholic beverages delivered to your door',
    imageUrl: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&h=400&fit=crop',
    linkUrl: '/products',
    type: 'promotional',
    position: 'hero',
    active: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 1,
    clickCount: 245,
    impressions: 1250,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Weekend Special',
    description: 'Get 20% off on all wine collections this weekend',
    imageUrl: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800&h=400&fit=crop',
    linkUrl: '/products?category=wine',
    type: 'promotional',
    position: 'hero',
    active: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 2,
    clickCount: 189,
    impressions: 890,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'New Arrivals',
    description: 'Check out our latest collection of craft beers',
    imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&h=400&fit=crop',
    linkUrl: '/products/new-arrivals',
    type: 'informational',
    position: 'sidebar',
    active: true,
    startDate: new Date().toISOString(),
    priority: 3,
    clickCount: 67,
    impressions: 456,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Holiday Season',
    description: 'Special holiday packages available now',
    imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop',
    linkUrl: '/products?category=holiday',
    type: 'seasonal',
    position: 'hero',
    active: false,
    startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 1,
    clickCount: 0,
    impressions: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await corsMiddleware(req, res);

    if (req.method === 'GET') {
      const { id, active, position, type } = req.query;

      // Get specific banner by ID
      if (id) {
        const banner = mockBanners.find(b => b.id === id);
        if (!banner) {
          return res.status(404).json({
            success: false,
            message: 'Banner not found',
          });
        }
        
        // Increment impressions
        banner.impressions += 1;
        
        return res.status(200).json({
          success: true,
          data: banner,
        });
      }

      // Filter banners based on query parameters
      let filteredBanners = mockBanners;

      if (active !== undefined) {
        const isActive = active === 'true';
        filteredBanners = filteredBanners.filter(banner => banner.active === isActive);
      }

      if (position) {
        filteredBanners = filteredBanners.filter(banner => banner.position === position);
      }

      if (type) {
        filteredBanners = filteredBanners.filter(banner => banner.type === type);
      }

      // Sort by priority
      filteredBanners.sort((a, b) => a.priority - b.priority);

      return res.status(200).json({
        success: true,
        data: filteredBanners,
        total: filteredBanners.length,
      });
    }

    if (req.method === 'POST') {
      const { action, bannerId } = req.body;

      if (action === 'click' && bannerId) {
        const banner = mockBanners.find(b => b.id === bannerId);
        if (!banner) {
          return res.status(404).json({
            success: false,
            message: 'Banner not found',
          });
        }

        // Increment click count
        banner.clickCount += 1;
        banner.updatedAt = new Date().toISOString();

        return res.status(200).json({
          success: true,
          data: banner,
          message: 'Click recorded successfully',
        });
      }

      // Create new banner
      const {
        title,
        description,
        imageUrl,
        linkUrl,
        type = 'informational',
        position = 'sidebar',
        active = true,
        startDate,
        endDate,
        priority = 999
      } = req.body;

      if (!title || !description || !imageUrl) {
        return res.status(400).json({
          success: false,
          message: 'Title, description, and imageUrl are required',
        });
      }

      const newBanner: Banner = {
        id: (mockBanners.length + 1).toString(),
        title,
        description,
        imageUrl,
        linkUrl,
        type,
        position,
        active,
        startDate: startDate || new Date().toISOString(),
        endDate,
        priority,
        clickCount: 0,
        impressions: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockBanners.push(newBanner);

      return res.status(201).json({
        success: true,
        data: newBanner,
        message: 'Banner created successfully',
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Banners API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default handler;