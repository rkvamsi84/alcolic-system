import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '@/middleware/cors';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful: number;
  notHelpful: number;
  views: number;
  priority: number;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// Mock FAQ data
const mockFAQs: FAQ[] = [
  {
    id: 'faq_1',
    question: 'What are your delivery hours?',
    answer: 'We deliver from 9 AM to 11 PM, 7 days a week. Express delivery is available for orders placed before 8 PM.',
    category: 'delivery',
    tags: ['delivery', 'hours', 'timing'],
    helpful: 45,
    notHelpful: 2,
    views: 892,
    priority: 1,
    status: 'published',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: 'faq_2',
    question: 'How can I track my order?',
    answer: 'You can track your order by logging into your account and visiting the "My Orders" section. You will also receive SMS and email updates about your order status.',
    category: 'orders',
    tags: ['tracking', 'orders', 'status'],
    helpful: 38,
    notHelpful: 1,
    views: 756,
    priority: 2,
    status: 'published',
    createdAt: '2024-01-12T11:15:00Z',
    updatedAt: '2024-01-22T14:45:00Z'
  },
  {
    id: 'faq_3',
    question: 'What payment methods do you accept?',
    answer: 'We accept credit/debit cards, digital wallets (PayPal, Apple Pay, Google Pay), and cash on delivery. All online payments are processed securely.',
    category: 'payment',
    tags: ['payment', 'cards', 'wallet', 'cod'],
    helpful: 42,
    notHelpful: 3,
    views: 634,
    priority: 3,
    status: 'published',
    createdAt: '2024-01-08T09:30:00Z',
    updatedAt: '2024-01-18T16:20:00Z'
  },
  {
    id: 'faq_4',
    question: 'Can I cancel or modify my order?',
    answer: 'You can cancel or modify your order within 10 minutes of placing it. After that, please contact our customer support for assistance.',
    category: 'orders',
    tags: ['cancel', 'modify', 'orders'],
    helpful: 29,
    notHelpful: 5,
    views: 523,
    priority: 4,
    status: 'published',
    createdAt: '2024-01-15T13:20:00Z',
    updatedAt: '2024-01-25T10:10:00Z'
  },
  {
    id: 'faq_5',
    question: 'What is your return policy?',
    answer: 'Items can be returned within 24 hours of delivery if they are damaged or incorrect. Refunds are processed within 3-5 business days.',
    category: 'returns',
    tags: ['return', 'refund', 'policy'],
    helpful: 33,
    notHelpful: 2,
    views: 445,
    priority: 5,
    status: 'published',
    createdAt: '2024-01-14T14:45:00Z',
    updatedAt: '2024-01-24T11:30:00Z'
  },
  {
    id: 'faq_6',
    question: 'Do you deliver to my area?',
    answer: 'We deliver to most areas within the city. Enter your address during checkout to check if delivery is available in your area.',
    category: 'delivery',
    tags: ['delivery', 'areas', 'coverage'],
    helpful: 27,
    notHelpful: 4,
    views: 398,
    priority: 6,
    status: 'published',
    createdAt: '2024-01-11T12:00:00Z',
    updatedAt: '2024-01-21T09:15:00Z'
  },
  {
    id: 'faq_7',
    question: 'How do I create an account?',
    answer: 'Click on "Sign Up" at the top of the page, enter your email and phone number, create a password, and verify your account through the confirmation email or SMS.',
    category: 'account',
    tags: ['account', 'signup', 'registration'],
    helpful: 25,
    notHelpful: 1,
    views: 367,
    priority: 7,
    status: 'published',
    createdAt: '2024-01-09T15:30:00Z',
    updatedAt: '2024-01-19T13:45:00Z'
  },
  {
    id: 'faq_8',
    question: 'What if I receive a damaged item?',
    answer: 'If you receive a damaged item, please contact us immediately through the app or call our customer support. We will arrange for a replacement or refund.',
    category: 'returns',
    tags: ['damaged', 'replacement', 'support'],
    helpful: 31,
    notHelpful: 2,
    views: 289,
    priority: 8,
    status: 'published',
    createdAt: '2024-01-13T16:15:00Z',
    updatedAt: '2024-01-23T12:20:00Z'
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
          limit = '20', 
          offset = '0', 
          category, 
          search,
          id 
        } = req.query;
        
        let filteredFAQs = [...mockFAQs];
        
        // Filter by ID if provided
        if (id) {
          const faq = filteredFAQs.find(f => f.id === id);
          if (!faq) {
            return res.status(404).json({
              success: false,
              message: 'FAQ not found'
            });
          }
          
          // Increment view count (in real app, update database)
          faq.views += 1;
          
          return res.status(200).json({
            success: true,
            data: faq
          });
        }
        
        // Filter by category
        if (category && category !== 'all') {
          filteredFAQs = filteredFAQs.filter(f => f.category === category);
        }
        
        // Search functionality
        if (search) {
          const searchTerm = (search as string).toLowerCase();
          filteredFAQs = filteredFAQs.filter(f => 
            f.question.toLowerCase().includes(searchTerm) ||
            f.answer.toLowerCase().includes(searchTerm) ||
            f.tags.some(tag => tag.toLowerCase().includes(searchTerm))
          );
        }
        
        // Sort by priority and helpfulness
        filteredFAQs.sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          return b.helpful - a.helpful;
        });
        
        // Apply pagination
        const startIndex = parseInt(offset as string);
        const limitNum = parseInt(limit as string);
        const paginatedFAQs = filteredFAQs.slice(startIndex, startIndex + limitNum);
        
        return res.status(200).json({
          success: true,
          data: paginatedFAQs,
          pagination: {
            total: filteredFAQs.length,
            limit: limitNum,
            offset: startIndex,
            hasMore: startIndex + limitNum < filteredFAQs.length
          },
          categories: ['delivery', 'orders', 'payment', 'returns', 'account']
        });

      case 'POST':
        // Record FAQ feedback
        const { faqId, helpful } = req.body;
        
        if (!faqId || typeof helpful !== 'boolean') {
          return res.status(400).json({
            success: false,
            message: 'faqId and helpful (boolean) are required'
          });
        }
        
        const faq = mockFAQs.find(f => f.id === faqId);
        if (!faq) {
          return res.status(404).json({
            success: false,
            message: 'FAQ not found'
          });
        }
        
        // Update feedback count (in real app, update database)
        if (helpful) {
          faq.helpful += 1;
        } else {
          faq.notHelpful += 1;
        }
        
        return res.status(200).json({
          success: true,
          message: 'Feedback recorded successfully',
          data: {
            faqId,
            helpful: faq.helpful,
            notHelpful: faq.notHelpful
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
    console.error('FAQs API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}