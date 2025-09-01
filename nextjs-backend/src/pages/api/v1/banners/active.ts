import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '@/middleware/cors';

interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  actionText: string;
  actionUrl: string;
  backgroundColor: string;
  textColor: string;
  position: 'top' | 'middle' | 'bottom';
  priority: number;
  targetAudience: 'all' | 'new_users' | 'returning_users' | 'premium_users';
  startDate: string;
  endDate: string;
  isActive: boolean;
  clicks: number;
  impressions: number;
  createdAt: string;
  updatedAt: string;
}

// Mock active banners data
const mockBanners: Banner[] = [
  {
    id: 'banner_1',
    title: 'Welcome Offer!',
    description: 'Get 25% off on your first order. Limited time offer!',
    imageUrl: 'https://via.placeholder.com/800x200/FF6B6B/FFFFFF?text=Welcome+Offer',
    actionText: 'Shop Now',
    actionUrl: '/products',
    backgroundColor: '#FF6B6B',
    textColor: '#FFFFFF',
    position: 'top',
    priority: 1,
    targetAudience: 'new_users',
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
    isActive: true,
    clicks: 245,
    impressions: 1850,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 'banner_2',
    title: 'Free Delivery Weekend',
    description: 'Enjoy free delivery on all orders this weekend!',
    imageUrl: 'https://via.placeholder.com/800x200/4ECDC4/FFFFFF?text=Free+Delivery',
    actionText: 'Order Now',
    actionUrl: '/products?category=all',
    backgroundColor: '#4ECDC4',
    textColor: '#FFFFFF',
    position: 'middle',
    priority: 2,
    targetAudience: 'all',
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
    isActive: true,
    clicks: 189,
    impressions: 1420,
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-22T16:45:00Z'
  },
  {
    id: 'banner_3',
    title: 'Premium Membership',
    description: 'Upgrade to Premium and save more on every order!',
    imageUrl: 'https://via.placeholder.com/800x200/FFD93D/333333?text=Premium+Membership',
    actionText: 'Learn More',
    actionUrl: '/premium',
    backgroundColor: '#FFD93D',
    textColor: '#333333',
    position: 'bottom',
    priority: 3,
    targetAudience: 'returning_users',
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days from now
    isActive: true,
    clicks: 156,
    impressions: 980,
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-25T13:15:00Z'
  },
  {
    id: 'banner_4',
    title: 'Flash Sale Alert!',
    description: 'Limited time flash sale - Up to 50% off selected items!',
    imageUrl: 'https://via.placeholder.com/800x200/E74C3C/FFFFFF?text=Flash+Sale',
    actionText: 'Shop Sale',
    actionUrl: '/products?sale=true',
    backgroundColor: '#E74C3C',
    textColor: '#FFFFFF',
    position: 'top',
    priority: 1,
    targetAudience: 'all',
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), // 18 hours from now
    isActive: true,
    clicks: 89,
    impressions: 567,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply CORS middleware
  await corsMiddleware(req, res);

  try {
    switch (req.method) {
      case 'GET':
        const { 
          position, 
          targetAudience = 'all',
          limit = '10'
        } = req.query;
        
        const now = new Date();
        let activeBanners = mockBanners.filter(banner => 
          banner.isActive &&
          new Date(banner.startDate) <= now &&
          new Date(banner.endDate) >= now
        );
        
        // Filter by position if specified
        if (position && position !== 'all') {
          activeBanners = activeBanners.filter(banner => banner.position === position);
        }
        
        // Filter by target audience
        if (targetAudience !== 'all') {
          activeBanners = activeBanners.filter(banner => 
            banner.targetAudience === 'all' || banner.targetAudience === targetAudience
          );
        }
        
        // Sort by priority (lower number = higher priority)
        activeBanners.sort((a, b) => a.priority - b.priority);
        
        // Apply limit
        const limitNum = parseInt(limit as string);
        const limitedBanners = activeBanners.slice(0, limitNum);
        
        // Increment impressions for returned banners (in real app, update database)
        limitedBanners.forEach(banner => {
          banner.impressions += 1;
        });
        
        return res.status(200).json({
          success: true,
          data: limitedBanners,
          meta: {
            total: activeBanners.length,
            returned: limitedBanners.length,
            positions: ['top', 'middle', 'bottom'],
            audiences: ['all', 'new_users', 'returning_users', 'premium_users']
          }
        });

      case 'POST':
        // Record banner click
        const { bannerId } = req.body;
        
        if (!bannerId) {
          return res.status(400).json({
            success: false,
            message: 'bannerId is required'
          });
        }
        
        const banner = mockBanners.find(b => b.id === bannerId);
        if (!banner) {
          return res.status(404).json({
            success: false,
            message: 'Banner not found'
          });
        }
        
        // Increment click count (in real app, update database)
        banner.clicks += 1;
        
        return res.status(200).json({
          success: true,
          message: 'Banner click recorded successfully',
          data: {
            bannerId,
            clicks: banner.clicks,
            impressions: banner.impressions,
            clickThroughRate: ((banner.clicks / banner.impressions) * 100).toFixed(2) + '%'
          }
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Active banners API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}