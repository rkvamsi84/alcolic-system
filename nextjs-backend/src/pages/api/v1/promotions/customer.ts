import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '@/middleware/cors';

interface CustomerPromotion {
  id: string;
  title: string;
  description: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_one_get_one';
  value: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  startDate: string;
  endDate: string;
  active: boolean;
  featured: boolean;
  terms?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock customer promotions data
const mockCustomerPromotions: CustomerPromotion[] = [
  {
    id: '1',
    title: 'Welcome Offer',
    description: 'Get 20% off on your first order',
    code: 'WELCOME20',
    type: 'percentage',
    value: 20,
    minimumOrderAmount: 50,
    maximumDiscount: 100,
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-12-31T23:59:59.000Z',
    active: true,
    featured: true,
    terms: 'Valid for new customers only. Minimum order $50.',
    imageUrl: '/images/promotions/welcome-offer.jpg',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    title: 'Free Delivery Weekend',
    description: 'Free delivery on all orders this weekend',
    code: 'FREEDEL',
    type: 'free_shipping',
    value: 0,
    minimumOrderAmount: 25,
    startDate: '2024-01-20T00:00:00.000Z',
    endDate: '2024-01-21T23:59:59.000Z',
    active: true,
    featured: true,
    terms: 'Valid on weekends only. Minimum order $25.',
    imageUrl: '/images/promotions/free-delivery.jpg',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '3',
    title: 'Buy 2 Get 1 Free',
    description: 'Buy 2 bottles of wine, get 1 free',
    code: 'WINE3FOR2',
    type: 'buy_one_get_one',
    value: 1,
    minimumOrderAmount: 0,
    startDate: '2024-01-10T00:00:00.000Z',
    endDate: '2024-01-31T23:59:59.000Z',
    active: true,
    featured: false,
    terms: 'Valid on selected wine bottles only.',
    imageUrl: '/images/promotions/wine-offer.jpg',
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z'
  },
  {
    id: '4',
    title: 'Happy Hour Special',
    description: '$10 off on orders above $100',
    code: 'HAPPY10',
    type: 'fixed_amount',
    value: 10,
    minimumOrderAmount: 100,
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-02-29T23:59:59.000Z',
    active: true,
    featured: true,
    terms: 'Valid between 5 PM - 8 PM only.',
    imageUrl: '/images/promotions/happy-hour.jpg',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
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
        // Get customer promotions (public endpoint)
        const activePromotions = mockCustomerPromotions.filter(promo => {
          const now = new Date();
          const startDate = new Date(promo.startDate);
          const endDate = new Date(promo.endDate);
          return promo.active && now >= startDate && now <= endDate;
        });

        return res.status(200).json({
          success: true,
          data: activePromotions,
          message: 'Customer promotions retrieved successfully'
        });

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Customer promotions API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}