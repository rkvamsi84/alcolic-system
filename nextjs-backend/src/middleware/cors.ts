import { NextApiRequest, NextApiResponse } from 'next';

export function corsMiddleware(req: NextApiRequest, res: NextApiResponse, next?: () => void) {
  // Get the origin from the request
  const origin = req.headers.origin;
  
  // Define allowed origins from environment variable
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001,http://localhost:3002';
  const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());
  
  // Add additional origins for development and production
  const additionalOrigins = [
    'https://alcolic-user-web-app.vercel.app',
    'https://alcolic-admin-panel.vercel.app',
    'https://alcolic-store-admin.vercel.app',
    'https://alcolic.gnritservices.com',
    'https://www.alcolic.gnritservices.com'
  ];
  
  const allAllowedOrigins = [...allowedOrigins, ...additionalOrigins];

  // Set CORS headers
  if (origin && allAllowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For requests without origin (like Postman) or non-browser requests
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, authorization, X-Requested-With, x-vercel-protection-bypass');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Continue to the next middleware or handler
  if (next) {
    next();
  }
}

export default corsMiddleware;
