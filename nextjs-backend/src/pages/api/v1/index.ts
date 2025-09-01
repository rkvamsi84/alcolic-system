import { NextApiRequest, NextApiResponse } from 'next';
import { APP_CONFIG } from '@/config/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  res.status(200).json({
    success: true,
    message: `${APP_CONFIG.NAME} API - V${APP_CONFIG.VERSION}`,
    data: {
      version: APP_CONFIG.VERSION,
      description: APP_CONFIG.DESCRIPTION,
      endpoints: {
        auth: {
          register: 'POST /api/v1/auth/register',
          login: 'POST /api/v1/auth/login',
          me: 'GET /api/v1/auth/me',
          profile: 'PUT /api/v1/auth/profile',
          'change-password': 'PUT /api/v1/auth/change-password',
          logout: 'POST /api/v1/auth/logout'
        },
        users: {
          list: 'GET /api/v1/users'
        },
        stores: {
          list: 'GET /api/v1/stores',
          detail: 'GET /api/v1/stores/[id]'
        },
        products: {
          list: 'GET /api/v1/products',
          detail: 'GET /api/v1/products/[id]',
          create: 'POST /api/v1/products/create',
          update: 'PUT /api/v1/products/[id]/update'
        },
        orders: {
          list: 'GET /api/v1/orders',
          detail: 'GET /api/v1/orders/[id]',
          create: 'POST /api/v1/orders/create',
          'update-status': 'PUT /api/v1/orders/[id]/status'
        },
        'payment-history': {
          list: 'GET /api/v1/payment-history'
        },
        categories: {
          list: 'GET /api/v1/categories',
          detail: 'GET /api/v1/categories/[id]'
        },
        system: {
          health: 'GET /api/health',
          socket: 'GET /api/socket'
        }
      },
      authentication: {
        type: 'JWT Bearer Token',
        header: 'Authorization: Bearer <token>'
      },
      response_format: {
        success: 'boolean',
        message: 'string',
        data: 'object|array',
        errors: 'array (on validation errors)'
      },
      pagination: {
        page: 'number (default: 1)',
        limit: 'number (default: 10)',
        total: 'number',
        totalPages: 'number',
        hasNextPage: 'boolean',
        hasPrevPage: 'boolean'
      },
      error_codes: {
        400: 'Bad Request - Validation errors',
        401: 'Unauthorized - Invalid or missing token',
        403: 'Forbidden - Insufficient permissions',
        404: 'Not Found - Resource not found',
        405: 'Method Not Allowed - Invalid HTTP method',
        500: 'Internal Server Error - Server error'
      }
    }
  });
}
