import { NextApiRequest, NextApiResponse } from 'next';
import { body, validationResult } from 'express-validator';
import connectDB from '@/config/database';
import User from '@/models/User';
import { validationError, authError } from '@/middleware/errorHandler';
import corsMiddleware from '@/middleware/cors';

// Validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
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
    await Promise.all(validateLogin.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw validationError(errors.array());
    }

    const { email, password } = req.body;

    // Find user by email and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw authError('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw authError('Account is deactivated');
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw authError('Account is temporarily locked due to multiple failed login attempts');
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      user.incrementLoginAttempts();
      await user.save();

      throw authError('Invalid credentials');
    }

    // Reset login attempts on successful login
    user.resetLoginAttempts();
    await user.save();

    // Generate tokens
    const token = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();

    // Remove password from response
    const userResponse = user.toObject() as any;
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
}
