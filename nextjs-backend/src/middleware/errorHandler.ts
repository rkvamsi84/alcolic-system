import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Custom error class
export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  err: AppError,
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
    headers: req.headers
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new CustomError(message, 404);
  }

  // Mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    const message = `Duplicate field value: ${field}`;
    error = new CustomError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = new CustomError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new CustomError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new CustomError(message, 401);
  }

  // Multer errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    
    switch ((err as any).code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
    }
    
    error = new CustomError(message, 400);
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler
export const notFound = (req: NextApiRequest, res: NextApiResponse) => {
  const error = new CustomError(`Not found - ${req.method} ${req.url}`, 404);
  res.status(404).json({
    success: false,
    error: error.message
  });
};

// Validation error handler
export const validationError = (errors: any[]) => {
  const message = errors.map(err => err.msg).join(', ');
  return new CustomError(message, 400);
};

// Database connection error handler
export const handleDBError = (err: any) => {
  console.error('Database connection error:', err);
  
  if (err.name === 'MongoNetworkError') {
    return new CustomError('Database connection failed', 500);
  }
  
  if (err.name === 'MongoServerSelectionError') {
    return new CustomError('Database server selection failed', 500);
  }
  
  return new CustomError('Database error', 500);
};

// Rate limit error
export const rateLimitError = () => {
  return new CustomError('Too many requests, please try again later', 429);
};

// Authentication error
export const authError = (message: string = 'Authentication failed') => {
  return new CustomError(message, 401);
};

// Authorization error
export const authorizationError = (message: string = 'Not authorized') => {
  return new CustomError(message, 403);
};

// Resource not found error
export const notFoundError = (resource: string = 'Resource') => {
  return new CustomError(`${resource} not found`, 404);
};

// Bad request error
export const badRequestError = (message: string = 'Bad request') => {
  return new CustomError(message, 400);
};

// Conflict error
export const conflictError = (message: string = 'Resource conflict') => {
  return new CustomError(message, 409);
};

// Unprocessable entity error
export const unprocessableEntityError = (message: string = 'Unprocessable entity') => {
  return new CustomError(message, 422);
};

// Internal server error
export const internalServerError = (message: string = 'Internal server error') => {
  return new CustomError(message, 500);
};

export default {
  errorHandler,
  asyncHandler,
  notFound,
  validationError,
  handleDBError,
  rateLimitError,
  authError,
  authorizationError,
  notFoundError,
  badRequestError,
  conflictError,
  unprocessableEntityError,
  internalServerError,
  CustomError
};
