import { NextApiRequest, NextApiResponse } from 'next';

export function corsMiddleware(req: NextApiRequest, res: NextApiResponse, next?: () => void) {
  // Get the origin from the request
  const origin = req.headers.origin;
  
  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'https://alcolic-user-web-app.vercel.app',
    'https://alcolic-admin-panel.vercel.app',
    'https://alcolic-store-admin.vercel.app',
    'https://alcolic.gnritservices.com',
    'https://www.alcolic.gnritservices.com'
  ];

  // Set CORS headers
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For requests without origin (like Postman) or non-browser requests
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3005');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-vercel-protection-bypass');
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
