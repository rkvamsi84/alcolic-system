import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { AUTH_CONFIG, SOCKET_CONFIG } from '@/config/constants';
import User from '@/models/User';
import connectDB from '@/config/database';

class SocketServer {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: SOCKET_CONFIG.CORS_ORIGIN,
        credentials: true
      },
      pingTimeout: SOCKET_CONFIG.PING_TIMEOUT,
      pingInterval: SOCKET_CONFIG.PING_INTERVAL,
      maxHttpBufferSize: SOCKET_CONFIG.MAX_HTTP_BUFFER_SIZE
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: any) => {
      console.log(`User connected: ${socket.id}`);
      
      // Handle authentication
      socket.on('authenticate', async (data: any) => {
        try {
          const token = data.token;
          if (!token) {
            socket.emit('auth_error', 'Token required');
            return;
          }

          // Verify token
          const decoded = jwt.verify(token, AUTH_CONFIG.JWT_SECRET) as any;
          
          // Connect to database
          await connectDB();
          
          // Get user
          const user = await User.findById(decoded.id).select('-password');
          
          if (!user || !user.isActive) {
            socket.emit('auth_error', 'Invalid user');
            return;
          }

          // Store user info in socket
          socket.user = user;
          socket.userId = (user as any)._id.toString();
          socket.userRole = (user as any).role;
          
          // Store connected user
          this.connectedUsers.set(socket.userId, socket.id);

          // Join user to their role-specific room
          socket.join(`role:${socket.userRole}`);
          
          // Join user to their personal room
          socket.join(`user:${socket.userId}`);

          console.log(`User authenticated: ${socket.userId} (${socket.userRole})`);

          // Handle role-specific connections
          if (socket.userRole === 'store') {
            this.handleStoreConnection(socket);
          } else if (socket.userRole === 'delivery') {
            this.handleDeliveryConnection(socket);
          } else if (socket.userRole === 'admin') {
            this.handleAdminConnection(socket);
          } else if (socket.userRole === 'user') {
            this.handleUserConnection(socket);
          }

          socket.emit('authenticated', { userId: socket.userId, role: socket.userRole });
        } catch (error) {
          socket.emit('auth_error', 'Invalid token');
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        if (socket.userId) {
          console.log(`User disconnected: ${socket.userId}`);
          this.connectedUsers.delete(socket.userId);
        }
      });

      // Handle errors
      socket.on('error', (error: any) => {
        console.error('Socket error:', error);
      });
    });
  }

  private handleStoreConnection(socket: any) {
    // Join store-specific room
    socket.join(`store:${socket.userId}`);

    // Handle order updates
    socket.on('order:update', (data: any) => {
      const { orderId, status, userId } = data;
      
      // Notify customer about order update
      this.io.to(`user:${userId}`).emit('order:updated', {
        orderId,
        status,
        timestamp: new Date()
      });

      // Notify admins
      this.io.to('role:admin').emit('order:updated', {
        orderId,
        status,
        storeId: socket.userId,
        timestamp: new Date()
      });
    });

    // Handle store status updates
    socket.on('store:status', (data: any) => {
      const { isOpen, message } = data;
      
      // Notify nearby users
      this.io.to('role:user').emit('store:status:updated', {
        storeId: socket.userId,
        isOpen,
        message,
        timestamp: new Date()
      });
    });
  }

  private handleDeliveryConnection(socket: any) {
    // Join delivery-specific room
    socket.join(`delivery:${socket.userId}`);

    // Handle location updates
    socket.on('location:update', (data: any) => {
      const { latitude, longitude, orderId } = data;
      
      // Notify customer about delivery location
      if (orderId) {
        this.io.to(`order:${orderId}`).emit('delivery:location', {
          deliveryId: socket.userId,
          latitude,
          longitude,
          timestamp: new Date()
        });
      }
    });

    // Handle delivery status updates
    socket.on('delivery:status', (data: any) => {
      const { orderId, status, message } = data;
      
      // Notify customer
      this.io.to(`order:${orderId}`).emit('delivery:updated', {
        deliveryId: socket.userId,
        status,
        message,
        timestamp: new Date()
      });

      // Notify store
      this.io.to(`order:${orderId}`).emit('delivery:updated', {
        deliveryId: socket.userId,
        status,
        message,
        timestamp: new Date()
      });
    });
  }

  private handleAdminConnection(socket: any) {
    // Join admin-specific rooms
    socket.join('admin:orders');
    socket.join('admin:stores');
    socket.join('admin:users');

    // Handle admin notifications
    socket.on('admin:notification', (data: any) => {
      const { type, message, data: notificationData } = data;
      
      this.io.to('role:admin').emit('admin:notification', {
        type,
        message,
        data: notificationData,
        timestamp: new Date()
      });
    });
  }

  private handleUserConnection(socket: any) {
    // Handle order tracking
    socket.on('order:track', (data: any) => {
      const { orderId } = data;
      socket.join(`order:${orderId}`);
    });

    // Handle chat messages
    socket.on('chat:message', (data: any) => {
      const { storeId, message } = data;
      
      // Send message to store
      this.io.to(`store:${storeId}`).emit('chat:message', {
        userId: socket.userId,
        message,
        timestamp: new Date()
      });
    });
  }

  // Public methods for external use
  public getIO() {
    return this.io;
  }

  public emitToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  public emitToStore(storeId: string, event: string, data: any) {
    this.io.to(`store:${storeId}`).emit(event, data);
  }

  public emitToRole(role: string, event: string, data: any) {
    this.io.to(`role:${role}`).emit(event, data);
  }

  public emitToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  public getConnectedUsers() {
    return this.connectedUsers;
  }

  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

export default SocketServer;
