import { NextApiRequest, NextApiResponse } from 'next';
import { body, validationResult } from 'express-validator';
import connectDB from '@/config/database';
import User from '@/models/User';
import { asyncHandler, validationError, conflictError } from '@/middleware/errorHandler';
import { AUTH_CONFIG } from '@/config/constants';
import corsMiddleware from '@/middleware/cors';

// Validation rules
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^\+?[\d\s-]+$/)
    .withMessage('Please provide a valid phone number'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('address.country').optional().trim(),
  body('address.location.coordinates').optional().isArray({ min: 2, max: 2 }),
  body('address.location.coordinates.*').optional().isFloat(),
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply CORS middleware
  corsMiddleware(req, res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Connect to database
    await connectDB();

    // Run validation
    await Promise.all(validateRegistration.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw validationError(errors.array());
    }

    const {
      name,
      email,
      phone,
      password,
      address,
      preferences
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw conflictError('Email already registered');
      } else {
        throw conflictError('Phone number already registered');
      }
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      address: address || {},
      preferences: preferences || {}
    });

    // Generate tokens
    const token = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();

    // Remove password from response
    const userResponse = user.toObject() as any;
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
}
