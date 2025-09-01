export const APP_CONFIG = {
  NAME: 'Alcolic',
  VERSION: '4.0.0',
  DESCRIPTION: 'Alcohol Delivery Platform',
  AUTHOR: 'Alcolic Team',
  LICENSE: 'MIT',
};

export const API_CONFIG = {
  PREFIX: '/api/v1',
  TIMEOUT: 30000,
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(','),
};

export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '30d',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
};

export const SECURITY_CONFIG = {
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  BRUTE_FORCE_MAX_ATTEMPTS: parseInt(process.env.BRUTE_FORCE_MAX_ATTEMPTS || '5'),
  BRUTE_FORCE_LOCKOUT_TIME: parseInt(process.env.BRUTE_FORCE_LOCKOUT_TIME || '300000'),
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
};

export const CORS_CONFIG = {
  ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005').split(','),
  CREDENTIALS: true,
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  ALLOWED_HEADERS: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
  ],
};

export const SOCKET_CONFIG = {
  CORS_ORIGIN: (process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005').split(','),
  PING_TIMEOUT: parseInt(process.env.SOCKET_PING_TIMEOUT || '60000'),
  PING_INTERVAL: parseInt(process.env.SOCKET_PING_INTERVAL || '25000'),
  MAX_HTTP_BUFFER_SIZE: 1e6,
  TRANSPORTS: ['websocket', 'polling'] as const,
};

export const EMAIL_CONFIG = {
  HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  PORT: parseInt(process.env.EMAIL_PORT || '587'),
  USER: process.env.EMAIL_USER || '',
  PASS: process.env.EMAIL_PASS || '',
  FROM: process.env.EMAIL_FROM || 'noreply@alcolic.com',
  SECURE: true,
};

export const PAYMENT_CONFIG = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  CURRENCY: 'usd',
  MIN_AMOUNT: 100, // $1.00
  MAX_AMOUNT: 1000000, // $10,000.00
};

export const UPLOAD_CONFIG = {
  PATH: process.env.UPLOAD_PATH || './uploads',
  MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  ALLOWED_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(','),
  COMPRESS_QUALITY: 80,
  THUMBNAIL_SIZE: { width: 300, height: 300 },
};

export const LOGGING_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  FILE: process.env.LOG_FILE || './logs/app.log',
  MAX_SIZE: '20m',
  MAX_FILES: '14d',
  COLORIZE: process.env.NODE_ENV !== 'production',
};

export const MONITORING_CONFIG = {
  ENABLED: process.env.ENABLE_MONITORING === 'true',
  PORT: parseInt(process.env.MONITORING_PORT || '3001'),
  PATH: '/status',
  TITLE: 'Alcolic API Status',
};

export const PRODUCTION_CONFIG = {
  ENABLE_COMPRESSION: process.env.ENABLE_COMPRESSION !== 'false',
  ENABLE_HELMET: process.env.ENABLE_HELMET !== 'false',
  ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING !== 'false',
  ENABLE_CORS: process.env.ENABLE_CORS !== 'false',
  ENABLE_LOGGING: process.env.ENABLE_LOGGING !== 'false',
};

export const HOSTINGER_CONFIG = {
  DOMAIN: process.env.HOSTINGER_DOMAIN || '',
  SSL: process.env.HOSTINGER_SSL === 'true',
  CDN: process.env.HOSTINGER_CDN === 'true',
  STATIC_PATH: '/public',
  UPLOAD_PATH: '/uploads',
};
