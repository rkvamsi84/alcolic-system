import io from 'socket.io-client';
import { API_CONFIG } from '../api/config';
// Socket.io configuration with fallback to long-polling
// Direct implementation instead of import to avoid path issues

class SocketService {
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

    console.log('🔌 Connecting to socket server:', API_CONFIG.socketURL);
    console.log('🔑 Using token:', token ? 'Token provided' : 'No token');

    try {
      this.socket = io(process.env.VITE_SOCKET_URL || 'https://nextjs-backend-lghye3ro6-rkvamsi84-gmailcoms-projects.vercel.app', {
        auth: {
          token: token
        },
        transports: ['polling', 'websocket'], // Prioritize polling over websocket
        upgrade: false, // Disable automatic upgrade to WebSocket
        timeout: 20000,
        forceNew: true
      });

      this.setupEventListeners();
      this.socket.connect();
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.joinStoreRoom();
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.isConnected = false;
      this.handleReconnect();
    });

    // Listen for order updates
    this.socket.on('order-updated', (data) => {
      console.log('📦 Order updated:', data);
      this.notifyListeners('order-updated', data);
    });

    // Listen for new orders
    this.socket.on('new-order', (data) => {
      console.log('🆕 NEW ORDER EVENT RECEIVED!');
      console.log('📦 Order data:', data);
      console.log('🏪 Order store ID:', data.store?._id || data.store);
      console.log('🏪 Current store ID:', localStorage.getItem('store_id'));
      console.log('👂 Number of listeners:', this.listeners.has('new-order') ? this.listeners.get('new-order').length : 0);
      console.log('🔍 All listeners:', Array.from(this.listeners.keys()));
      
      // Check if this order belongs to our store
      const currentStoreId = localStorage.getItem('store_id');
      const orderStoreId = data.store?._id || data.store;
      
      console.log('🔍 Store ID comparison:');
      console.log('   Current store ID (localStorage):', currentStoreId);
      console.log('   Order store ID:', orderStoreId);
      console.log('   Types - Current:', typeof currentStoreId, 'Order:', typeof orderStoreId);
      console.log('   Direct comparison:', currentStoreId === orderStoreId);
      console.log('   String comparison:', String(currentStoreId) === String(orderStoreId));
      
      // Use string comparison for more reliable matching
      if (String(currentStoreId) === String(orderStoreId)) {
        console.log('✅ Order belongs to our store - processing...');
        this.notifyListeners('new-order', data);
      } else {
        console.log('❌ Order does not belong to our store - ignoring');
        console.log('   Expected store ID:', currentStoreId);
        console.log('   Order store ID:', orderStoreId);
      }
    });

    // Listen for inventory updates
    this.socket.on('inventory-updated', (data) => {
      console.log('📦 Inventory updated:', data);
      this.notifyListeners('inventory-updated', data);
    });

    // Listen for delivery updates
    this.socket.on('delivery-updated', (data) => {
      console.log('🚚 Delivery updated:', data);
      this.notifyListeners('delivery-updated', data);
    });

    // Listen for notifications
    this.socket.on('notification', (data) => {
      console.log('🔔 Notification received:', data);
      this.notifyListeners('notification', data);
    });

    // Listen for chat messages
    this.socket.on('new-message', (data) => {
      console.log('💬 New message:', data);
      this.notifyListeners('new-message', data);
    });
  }

  joinStoreRoom() {
    const storeId = localStorage.getItem('store_id');
    console.log('🏪 Attempting to join store room...');
    console.log('📋 Store ID from localStorage:', storeId);
    console.log('🔗 Socket connected:', this.isConnected);
    console.log('🔗 Socket object exists:', !!this.socket);
    
    if (storeId && this.isConnected && this.socket) {
      this.socket.emit('join-store', { storeId });
      console.log('✅ Emitted join-store event for room: store-' + storeId);
      
      // Verify room joining
      setTimeout(() => {
        console.log('🔍 Verifying store room membership...');
        console.log('🏪 Store ID for room verification:', storeId);
      }, 1000);
    } else {
      console.warn('❌ Cannot join store room:');
      console.warn('   - Store ID:', storeId ? 'Present' : 'Missing');
      console.warn('   - Socket connected:', this.isConnected);
      console.warn('   - Socket object:', this.socket ? 'Exists' : 'Missing');
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
      console.log('📦 Order status updated:', data);
    }
  }

  updateInventory(productId, quantity) {
    if (this.isConnected && this.socket) {
      const data = {
        productId,
        quantity,
        timestamp: new Date().toISOString(),
      };
      this.socket.emit('update-inventory', data);
      console.log('📦 Inventory updated:', data);
    }
  }

  sendMessage(conversationId, message) {
    if (this.isConnected && this.socket) {
      const data = {
        conversationId,
        message,
        timestamp: new Date().toISOString(),
      };
      this.socket.emit('send-message', data);
      console.log('💬 Message sent:', data);
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
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        const token = localStorage.getItem('store_token');
        if (token) {
          this.connect(token);
        }
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
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
const socketService = new SocketService();
export default socketService;