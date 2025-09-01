import io from 'socket.io-client';
import { API_CONFIG } from '../api/config';
// Socket.io configuration with fallback to long-polling
// Direct implementation instead of import to avoid path issues

class AdminSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    try {
      const socketUrl = process.env.REACT_APP_SOCKET_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app';
      
      console.log('🔌 Connecting to WebSocket server:', socketUrl);
      
      this.socket = io(socketUrl, {
        transports: ['polling', 'websocket'], // Prioritize polling over websocket
        upgrade: false, // Disable automatic upgrade to WebSocket
        auth: {
          token: token,
        },
        query: {
          token: token,
        },
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval
      });

      this.setupEventListeners();
      this.socket.connect();
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Admin Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.joinAdminRoom();
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Admin Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Admin Socket connection error:', error);
      this.isConnected = false;
      this.handleReconnect();
    });

    // Listen for new orders
    this.socket.on('new-order', (data) => {
      console.log('🆕 New order received in admin panel:', data);
      this.notifyListeners('new-order', data);
    });

    // Listen for order updates
    this.socket.on('order-updated', (data) => {
      console.log('📦 Order updated in admin panel:', data);
      this.notifyListeners('order-updated', data);
    });

    // Listen for order status updates
    this.socket.on('order_status_update', (data) => {
      console.log('📦 Order status updated in admin panel:', data);
      this.notifyListeners('order-status-update', data);
    });

    // Listen for notifications
    this.socket.on('notification', (data) => {
      console.log('🔔 Notification received in admin panel:', data);
      this.notifyListeners('notification', data);
    });
  }

  joinAdminRoom() {
    if (this.isConnected) {
      this.socket.emit('join-admin', {});
      console.log('👑 Joined admin room');
    }
  }

  joinOrderRoom(orderId) {
    if (this.isConnected && this.socket) {
      this.socket.emit('join-order', { orderId });
      console.log('📦 Joined order room:', orderId);
    }
  }

  updateOrderStatus(orderId, status, note = '') {
    if (this.isConnected && this.socket) {
      const data = {
        orderId,
        status,
        note,
        timestamp: new Date().toISOString(),
      };
      this.socket.emit('update-order-status', data);
      console.log('📦 Order status updated from admin:', data);
    }
  }

  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect admin socket... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        const token = localStorage.getItem('admin_token');
        if (token) {
          this.connect(token);
        }
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached for admin socket');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create singleton instance
const adminSocketService = new AdminSocketService();
export default adminSocketService;