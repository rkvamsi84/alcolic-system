import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from '@/config/constants';
import User from '@/models/User';
import connectDB from '@/config/database';

interface AuthenticatedRequest extends NextApiRequest {
  user?: any;
}

export interface JWTPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

// Protect routes - require authentication
export const protect = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    let token: string | undefined;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, AUTH_CONFIG.JWT_SECRET) as JWTPayload;

      // Connect to database
      await connectDB();

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    let token: string | undefined;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        // Verify token
        const decoded = jwt.verify(token, AUTH_CONFIG.JWT_SECRET) as JWTPayload;

        // Connect to database
        await connectDB();

        // Get user from token
        const user = await User.findById(decoded.id).select('-password');

        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Invalid token in optional auth:', error);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Verify refresh token
export const verifyRefreshToken = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, AUTH_CONFIG.JWT_REFRESH_SECRET) as JWTPayload;

      // Connect to database
      await connectDB();

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Rate limiting for authentication attempts
export const authRateLimit = (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
  // This would typically use Redis or a similar store
  // For now, we'll implement a simple in-memory solution
  // In production, use Redis for distributed rate limiting
  
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  
  // Simple rate limiting - 5 attempts per 15 minutes
  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  // In a real implementation, you'd store this in Redis
  // For now, we'll just pass through
  next();
};

export default {
  protect,
  authorize,
  optionalAuth,
  verifyRefreshToken,
  authRateLimit
};
