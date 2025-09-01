import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '@/middleware/cors';

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  author: string;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// Mock knowledge base articles
const mockArticles: KnowledgeBaseArticle[] = [
  {
    id: 'kb_1',
    title: 'How to Place an Order',
    content: 'To place an order, follow these simple steps: 1. Browse our products and add items to your cart. 2. Review your cart and proceed to checkout. 3. Enter your delivery address and payment information. 4. Confirm your order and wait for delivery.',
    summary: 'Step-by-step guide on how to place an order on our platform.',
    category: 'ordering',
    tags: ['order', 'checkout', 'cart', 'delivery'],
    views: 1250,
    helpful: 45,
    notHelpful: 3,
    author: 'Support Team',
    status: 'published',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 'kb_2',
    title: 'Delivery Areas and Times',
    content: 'We deliver to most areas within the city. Our standard delivery hours are 9 AM to 11 PM, 7 days a week. Express delivery is available for orders placed before 8 PM. Delivery fees vary by location and order value.',
    summary: 'Information about our delivery coverage, timing, and fees.',
    category: 'delivery',
    tags: ['delivery', 'timing', 'areas', 'fees'],
    views: 890,
    helpful: 32,
    notHelpful: 5,
    author: 'Support Team',
    status: 'published',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-25T16:45:00Z'
  },
  {
    id: 'kb_3',
    title: 'Payment Methods',
    content: 'We accept various payment methods including credit/debit cards, digital wallets, and cash on delivery. All online payments are processed securely through encrypted channels. You can save your payment methods for faster checkout.',
    summary: 'Overview of accepted payment methods and security measures.',
    category: 'payment',
    tags: ['payment', 'cards', 'wallet', 'security', 'cod'],
    views: 675,
    helpful: 28,
    notHelpful: 2,
    author: 'Support Team',
    status: 'published',
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-22T13:15:00Z'
  },
  {
    id: 'kb_4',
    title: 'Return and Refund Policy',
    content: 'Items can be returned within 24 hours of delivery if they are damaged or incorrect. Refunds are processed within 3-5 business days. For perishable items, please contact us immediately if there are any issues.',
    summary: 'Guidelines for returns, refunds, and handling damaged items.',
    category: 'returns',
    tags: ['return', 'refund', 'policy', 'damaged'],
    views: 543,
    helpful: 22,
    notHelpful: 4,
    author: 'Support Team',
    status: 'published',
    createdAt: '2024-01-08T15:20:00Z',
    updatedAt: '2024-01-18T10:10:00Z'
  },
  {
    id: 'kb_5',
    title: 'Account Management',
    content: 'Manage your account by updating personal information, changing passwords, and setting notification preferences. You can also view your order history and track current orders from your account dashboard.',
    summary: 'How to manage your account settings and preferences.',
    category: 'account',
    tags: ['account', 'profile', 'settings', 'password'],
    views: 432,
    helpful: 19,
    notHelpful: 1,
    author: 'Support Team',
    status: 'published',
    createdAt: '2024-01-14T12:45:00Z',
    updatedAt: '2024-01-24T09:30:00Z'
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
        
        let filteredArticles = [...mockArticles];
        
        // Filter by ID if provided
        if (id) {
          const article = filteredArticles.find(a => a.id === id);
          if (!article) {
            return res.status(404).json({
              success: false,
              message: 'Article not found'
            });
          }
          
          // Increment view count (in real app, update database)
          article.views += 1;
          
          return res.status(200).json({
            success: true,
            data: article
          });
        }
        
        // Filter by category
        if (category && category !== 'all') {
          filteredArticles = filteredArticles.filter(a => a.category === category);
        }
        
        // Search functionality
        if (search) {
          const searchTerm = (search as string).toLowerCase();
          filteredArticles = filteredArticles.filter(a => 
            a.title.toLowerCase().includes(searchTerm) ||
            a.content.toLowerCase().includes(searchTerm) ||
            a.tags.some(tag => tag.toLowerCase().includes(searchTerm))
          );
        }
        
        // Sort by views (most popular first)
        filteredArticles.sort((a, b) => b.views - a.views);
        
        // Apply pagination
        const startIndex = parseInt(offset as string);
        const limitNum = parseInt(limit as string);
        const paginatedArticles = filteredArticles.slice(startIndex, startIndex + limitNum);
        
        return res.status(200).json({
          success: true,
          data: paginatedArticles,
          pagination: {
            total: filteredArticles.length,
            limit: limitNum,
            offset: startIndex,
            hasMore: startIndex + limitNum < filteredArticles.length
          },
          categories: ['ordering', 'delivery', 'payment', 'returns', 'account']
        });

      case 'POST':
        // Record article feedback
        const { articleId, helpful } = req.body;
        
        if (!articleId || typeof helpful !== 'boolean') {
          return res.status(400).json({
            success: false,
            message: 'articleId and helpful (boolean) are required'
          });
        }
        
        const article = mockArticles.find(a => a.id === articleId);
        if (!article) {
          return res.status(404).json({
            success: false,
            message: 'Article not found'
          });
        }
        
        // Update feedback count (in real app, update database)
        if (helpful) {
          article.helpful += 1;
        } else {
          article.notHelpful += 1;
        }
        
        return res.status(200).json({
          success: true,
          message: 'Feedback recorded successfully',
          data: {
            articleId,
            helpful: article.helpful,
            notHelpful: article.notHelpful
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
    console.error('Knowledge base API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}