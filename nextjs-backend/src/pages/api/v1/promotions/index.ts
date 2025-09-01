import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '../../../../middleware/cors';

interface Promotion {
  id: string;
  title: string;
  description: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_one_get_one';
  value: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number;
  startDate: string;
  endDate: string;
  active: boolean;
  featured: boolean;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock promotions data
const mockPromotions: Promotion[] = [
  {
    id: '1',
    title: 'Welcome Discount',
    description: 'Get 15% off on your first order',
    code: 'WELCOME15',
    type: 'percentage',
    value: 15,
    minimumOrderAmount: 50,
    maximumDiscount: 25,
    usageLimit: 1000,
    usageCount: 245,
    userUsageLimit: 1,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
    featured: true,
    terms: 'Valid for new customers only. Cannot be combined with other offers.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Weekend Special',
    description: '$10 off on orders above $75',
    code: 'WEEKEND10',
    type: 'fixed_amount',
    value: 10,
    minimumOrderAmount: 75,
    usageLimit: 500,
    usageCount: 89,
    userUsageLimit: 2,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
    featured: true,
    terms: 'Valid on weekends only. Expires Sunday midnight.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Free Delivery',
    description: 'Free shipping on all orders',
    code: 'FREESHIP',
    type: 'free_shipping',
    value: 0,
    minimumOrderAmount: 25,
    usageLimit: 2000,
    usageCount: 567,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
    featured: false,
    terms: 'Free standard delivery. Express delivery charges may apply.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Wine Wednesday',
    description: 'Buy one wine, get one 50% off',
    code: 'WINEWED',
    type: 'buy_one_get_one',
    value: 50,
    applicableCategories: ['wine'],
    usageLimit: 100,
    usageCount: 23,
    userUsageLimit: 1,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
    featured: true,
    terms: 'Valid on Wednesdays only. Applies to wine category products.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Holiday Special',
    description: '25% off on premium spirits',
    code: 'HOLIDAY25',
    type: 'percentage',
    value: 25,
    minimumOrderAmount: 100,
    maximumDiscount: 50,
    applicableCategories: ['spirits', 'whiskey', 'vodka'],
    usageLimit: 200,
    usageCount: 0,
    userUsageLimit: 1,
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    active: false,
    featured: false,
    terms: 'Valid during holiday season. Premium spirits only.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper function to validate promotion code
function validatePromotionCode(code: string, userId?: string, orderAmount?: number): {
  valid: boolean;
  promotion?: Promotion;
  message?: string;
} {
  const promotion = mockPromotions.find(p => p.code.toLowerCase() === code.toLowerCase());
  
  if (!promotion) {
    return { valid: false, message: 'Invalid promotion code' };
  }
  
  if (!promotion.active) {
    return { valid: false, message: 'This promotion is no longer active' };
  }
  
  const now = new Date();
  const startDate = new Date(promotion.startDate);
  const endDate = new Date(promotion.endDate);
  
  if (now < startDate) {
    return { valid: false, message: 'This promotion has not started yet' };
  }
  
  if (now > endDate) {
    return { valid: false, message: 'This promotion has expired' };
  }
  
  if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
    return { valid: false, message: 'This promotion has reached its usage limit' };
  }
  
  if (orderAmount && promotion.minimumOrderAmount && orderAmount < promotion.minimumOrderAmount) {
    return { 
      valid: false, 
      message: `Minimum order amount of $${promotion.minimumOrderAmount} required` 
    };
  }
  
  return { valid: true, promotion };
}

// Helper function to calculate discount
function calculateDiscount(promotion: Promotion, orderAmount: number): number {
  let discount = 0;
  
  switch (promotion.type) {
    case 'percentage':
      discount = (orderAmount * promotion.value) / 100;
      if (promotion.maximumDiscount) {
        discount = Math.min(discount, promotion.maximumDiscount);
      }
      break;
    
    case 'fixed_amount':
      discount = promotion.value;
      break;
    
    case 'free_shipping':
      // This would typically be the shipping cost
      discount = 5.99; // Mock shipping cost
      break;
    
    case 'buy_one_get_one':
      // This would require more complex logic based on cart items
      discount = orderAmount * 0.25; // Mock 25% discount
      break;
    
    default:
      discount = 0;
  }
  
  return Math.round(discount * 100) / 100;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await corsMiddleware(req, res);

    if (req.method === 'GET') {
      const { id, featured, active, category } = req.query;

      // Get specific promotion by ID
      if (id) {
        const promotion = mockPromotions.find(p => p.id === id);
        if (!promotion) {
          return res.status(404).json({
            success: false,
            message: 'Promotion not found',
          });
        }
        
        return res.status(200).json({
          success: true,
          data: promotion,
        });
      }

      // Filter promotions based on query parameters
      let filteredPromotions = mockPromotions;

      if (featured !== undefined) {
        const isFeatured = featured === 'true';
        filteredPromotions = filteredPromotions.filter(p => p.featured === isFeatured);
      }

      if (active !== undefined) {
        const isActive = active === 'true';
        filteredPromotions = filteredPromotions.filter(p => p.active === isActive);
      }

      if (category) {
        filteredPromotions = filteredPromotions.filter(p => 
          p.applicableCategories?.includes(category as string)
        );
      }

      // Filter out expired promotions for customer view
      const now = new Date();
      filteredPromotions = filteredPromotions.filter(p => {
        const endDate = new Date(p.endDate);
        return endDate > now;
      });

      return res.status(200).json({
        success: true,
        data: filteredPromotions,
        total: filteredPromotions.length,
      });
    }

    if (req.method === 'POST') {
      const { action, code, userId, orderAmount } = req.body;

      if (action === 'validate') {
        if (!code) {
          return res.status(400).json({
            success: false,
            message: 'Promotion code is required',
          });
        }

        const validation = validatePromotionCode(code, userId, orderAmount);
        
        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            message: validation.message,
          });
        }

        const discount = orderAmount ? calculateDiscount(validation.promotion!, orderAmount) : 0;

        return res.status(200).json({
          success: true,
          data: {
            promotion: validation.promotion,
            discount,
            finalAmount: orderAmount ? orderAmount - discount : 0,
          },
          message: 'Promotion code is valid',
        });
      }

      if (action === 'apply') {
        if (!code || !orderAmount) {
          return res.status(400).json({
            success: false,
            message: 'Promotion code and order amount are required',
          });
        }

        const validation = validatePromotionCode(code, userId, orderAmount);
        
        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            message: validation.message,
          });
        }

        const discount = calculateDiscount(validation.promotion!, orderAmount);
        
        // Increment usage count
        validation.promotion!.usageCount += 1;
        validation.promotion!.updatedAt = new Date().toISOString();

        return res.status(200).json({
          success: true,
          data: {
            promotion: validation.promotion,
            discount,
            finalAmount: orderAmount - discount,
          },
          message: 'Promotion applied successfully',
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid action',
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Promotions API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default handler;