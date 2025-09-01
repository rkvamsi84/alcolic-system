import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '../../../../middleware/cors';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

// Mock FAQs data
const mockFAQs: FAQ[] = [
  {
    id: '1',
    question: 'How do I place an order?',
    answer: 'To place an order, browse our products, add items to your cart, and proceed to checkout. You can pay using various methods including credit cards and digital wallets.',
    category: 'Orders',
    helpful: 25,
    notHelpful: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    question: 'What are your delivery hours?',
    answer: 'We deliver from 9 AM to 11 PM, 7 days a week. Express delivery is available for orders placed before 8 PM.',
    category: 'Delivery',
    helpful: 18,
    notHelpful: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    question: 'How can I track my order?',
    answer: 'You can track your order in real-time through the app or website. You will receive SMS and email notifications with tracking updates.',
    category: 'Orders',
    helpful: 32,
    notHelpful: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Knowledge Base articles
const mockKnowledgeBase: KnowledgeBaseArticle[] = [
  {
    id: '1',
    title: 'Getting Started with Alcolic',
    content: 'Welcome to Alcolic! This comprehensive guide will help you get started with our platform. Learn how to create an account, browse products, and place your first order.',
    category: 'Getting Started',
    tags: ['beginner', 'setup', 'account'],
    views: 1250,
    helpful: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Payment Methods and Security',
    content: 'Learn about our secure payment options including credit cards, debit cards, digital wallets, and cash on delivery. We use industry-standard encryption to protect your financial information.',
    category: 'Payments',
    tags: ['payment', 'security', 'cards'],
    views: 890,
    helpful: 38,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await corsMiddleware(req, res);

    if (req.method === 'GET') {
      const { type, id, category } = req.query;

      switch (type) {
        case 'faqs':
          let faqs = mockFAQs;
          if (category) {
            faqs = faqs.filter(faq => faq.category.toLowerCase() === (category as string).toLowerCase());
          }
          if (id) {
            const faq = faqs.find(f => f.id === id);
            if (!faq) {
              return res.status(404).json({
                success: false,
                message: 'FAQ not found',
              });
            }
            return res.status(200).json({
              success: true,
              data: faq,
            });
          }
          return res.status(200).json({
            success: true,
            data: faqs,
            total: faqs.length,
          });
        
        case 'knowledge-base':
          let articles = mockKnowledgeBase;
          if (category) {
            articles = articles.filter(article => article.category.toLowerCase() === (category as string).toLowerCase());
          }
          if (id) {
            const article = articles.find(a => a.id === id);
            if (!article) {
              return res.status(404).json({
                success: false,
                message: 'Article not found',
              });
            }
            // Increment view count
            article.views += 1;
            return res.status(200).json({
              success: true,
              data: article,
            });
          }
          return res.status(200).json({
            success: true,
            data: articles,
            total: articles.length,
          });
        
        default:
          return res.status(200).json({
            success: true,
            data: {
              faqs: mockFAQs,
              knowledgeBase: mockKnowledgeBase,
            },
          });
      }
    }

    if (req.method === 'POST') {
      const { action, faqId, helpful } = req.body;

      if (action === 'mark-helpful' && faqId) {
        const faq = mockFAQs.find(f => f.id === faqId);
        if (!faq) {
          return res.status(404).json({
            success: false,
            message: 'FAQ not found',
          });
        }

        if (helpful) {
          faq.helpful += 1;
        } else {
          faq.notHelpful += 1;
        }

        return res.status(200).json({
          success: true,
          data: faq,
          message: 'Feedback recorded successfully',
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid action or missing parameters',
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Support API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default handler;