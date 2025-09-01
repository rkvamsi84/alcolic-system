// API Configuration for new Next.js backend
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 30000,
  credentials: 'include',
  mode: 'cors'
};

// Socket.io configuration
export const SOCKET_CONFIG = {
  url: process.env.REACT_APP_SOCKET_URL || 'https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app',
  options: {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  },
}
