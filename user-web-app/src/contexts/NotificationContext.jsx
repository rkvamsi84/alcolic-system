import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { apiService } from '../config/api';
import io from 'socket.io-client';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    orderUpdates: true,
    promotions: true,
    newProducts: false,
    deliveryUpdates: true,
  });
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const lastToastTime = useRef(0);
  const toastThrottleDelay = 2000; // 2 seconds between toasts

  // Initialize WebSocket connection
  const initializeSocket = () => {
    try {
      const token = localStorage.getItem('user_token');
      if (!token) return;

      // Close existing connection if any
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Connect to WebSocket server with fallback
      const wsUrl = process.env.REACT_APP_WS_URL || 'https://nextjs-backend-iurx7hqju-rkvamsi84-gmailcoms-projects.vercel.app';
      console.log('🔌 Attempting WebSocket connection to:', wsUrl);
      
      socketRef.current = io(wsUrl, {
        auth: {
          token: token
        },
        transports: ['polling', 'websocket'], // Prioritize polling over websocket for shared hosting compatibility
        reconnection: true,
        reconnectionDelay: 5000,
        reconnectionAttempts: 5,
        timeout: 10000,
        path: '/socket.io/',
        forceNew: true,
        upgrade: false, // Disable upgrade to prevent WebSocket connection issues
        rememberUpgrade: false
      });

      // Socket event listeners
      socketRef.current.on('connect', () => {
        console.log('WebSocket connected');
        setError(null);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        // Only show error for unexpected disconnections
        if (reason === 'io server disconnect' || reason === 'transport close') {
          setError('Connection to notification service lost');
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.log('🔌 WebSocket connection error (this is normal if server is not running):', error.message);
        // Don't set error state for connection errors to avoid UI spam
        // setError('Failed to connect to real-time notifications');
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log('WebSocket reconnected after', attemptNumber, 'attempts');
        setError(null);
      });

      socketRef.current.on('reconnect_failed', () => {
        console.error('WebSocket reconnection failed');
        setError('Unable to reconnect to notification service');
      });

      // Listen for new notifications
      socketRef.current.on('notification', (notification) => {
        addNotification(notification);
      });

      // Listen for notification updates
      socketRef.current.on('notification_update', (updatedNotification) => {
        updateNotification(updatedNotification);
      });

      // Listen for order status updates
      socketRef.current.on('order_status_update', (orderUpdate) => {
        handleOrderStatusUpdate(orderUpdate);
      });

    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      setError('Failed to initialize real-time notifications');
    }
  };

  // Cleanup WebSocket connection
  const cleanupSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get('/notifications/my');
      
      if (response && response.success) {
        const { notifications: fetchedNotifications, unreadCount: fetchedUnreadCount } = response.data;
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedUnreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notification settings from API
  const fetchSettings = async () => {
    try {
      const response = await apiService.get('/notifications/settings');
      
      if (response && response.success) {
        setSettings(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  // Add new notification
  const addNotification = (notification) => {
    console.log('NotificationContext: Adding notification:', notification);
    
    // Ensure timestamp is valid
    let timestamp;
    try {
      if (notification.createdAt) {
        const date = new Date(notification.createdAt);
        if (!isNaN(date.getTime())) {
          timestamp = date.toISOString();
        } else {
          timestamp = new Date().toISOString();
        }
      } else {
        timestamp = new Date().toISOString();
      }
    } catch (error) {
      console.warn('Invalid timestamp in notification:', notification.createdAt);
      timestamp = new Date().toISOString();
    }

    const newNotification = {
      id: notification._id || notification.id || Date.now(),
      timestamp: timestamp,
      read: notification.isRead || false,
      type: notification.type || 'system',
      title: notification.title,
      message: notification.message,
      category: notification.category || 'info',
      priority: notification.priority || 'medium',
      data: notification.data || {},
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    if (!newNotification.read) {
      setUnreadCount(prev => prev + 1);
    }

    // Show toast notification if enabled and not throttled
    if (settings.pushNotifications) {
      const now = Date.now();
      if (now - lastToastTime.current > toastThrottleDelay) {
        toast(newNotification.message, {
          icon: getNotificationIcon(newNotification.type),
          duration: 4000,
          onClick: () => {
            handleNotificationClick(newNotification);
          },
        });
        lastToastTime.current = now;
      }
    }
  };

  // Update existing notification
  const updateNotification = (updatedNotification) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === updatedNotification._id
          ? { ...notification, ...updatedNotification }
          : notification
      )
    );
  };

  // Handle order status updates
  const handleOrderStatusUpdate = (orderUpdate) => {
    const notification = {
      _id: Date.now(),
      type: 'order',
      title: `Order ${orderUpdate.status}`,
      message: `Your order #${orderUpdate.orderNumber} is now ${orderUpdate.status}`,
      category: 'info',
      priority: 'medium',
      data: { orderId: orderUpdate.orderId },
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    
    addNotification(notification);
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return '📦';
      case 'delivery': return '🚚';
      case 'promotion': return '🎉';
      case 'payment': return '💳';
      case 'system': return '🔔';
      case 'refund': return '💰';
      default: return '🔔';
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    console.log('NotificationContext: Marking notification as read, ID:', notificationId);
    
    if (!notificationId) {
      console.error('NotificationContext: Cannot mark notification as read - ID is undefined');
      return;
    }
    
    try {
      await apiService.patch(`/notifications/${notificationId}/read`);
      
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await apiService.patch('/notifications/read-all');
      
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!notificationId) {
      console.error('NotificationContext: Cannot delete notification - ID is undefined');
      return;
    }
    
    try {
      await apiService.delete(`/notifications/${notificationId}`);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.read ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      // Delete all notifications from API
      const deletePromises = notifications.map(notification => 
        apiService.delete(`/notifications/${notification.id}`)
      );
      await Promise.all(deletePromises);
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Update notification settings
  const updateSettings = async (newSettings) => {
    try {
      await apiService.patch('/notifications/settings', newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  // Initialize on mount
  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (token) {
      fetchNotifications();
      fetchSettings();
      initializeSocket();
    }

    return () => {
      cleanupSocket();
    };
  }, []);

  // Reinitialize when token changes
  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (token) {
      initializeSocket();
    } else {
      cleanupSocket();
    }
  }, [localStorage.getItem('user_token')]);

  const value = {
    notifications,
    unreadCount,
    settings,
    loading,
    error,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updateSettings,
    fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};