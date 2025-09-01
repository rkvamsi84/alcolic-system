import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  Skeleton,
  Alert,
  CircularProgress,
  Fab,
  Snackbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
  LocalShipping as DeliveryIcon,
  ShoppingCart as OrderIcon,
  LocalOffer as PromotionIcon,
  Inventory as ProductIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PriorityHigh as PriorityHighIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

// Utility function to safely format timestamps
const formatTimestamp = (timestamp) => {
  try {
    if (!timestamp) return 'Unknown time';
    
    // Handle different timestamp formats
    let date;
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid time';
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.warn('Error formatting timestamp:', error, timestamp);
    return 'Unknown time';
  }
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    notifications,
    unreadCount,
    settings,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updateSettings,
    fetchNotifications,
  } = useNotifications();

  const [selectedTab, setSelectedTab] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [deletingNotification, setDeletingNotification] = useState(null);

  // Refresh notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <OrderIcon color="primary" />;
      case 'delivery':
        return <DeliveryIcon color="success" />;
      case 'promotion':
        return <PromotionIcon color="warning" />;
      case 'product':
        return <ProductIcon color="info" />;
      case 'payment':
        return <CheckCircleIcon color="success" />;
      case 'refund':
        return <ErrorIcon color="error" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return 'primary';
      case 'delivery':
        return 'success';
      case 'promotion':
        return 'warning';
      case 'product':
        return 'info';
      case 'payment':
        return 'success';
      case 'refund':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <PriorityHighIcon color="error" />;
      case 'high':
        return <PriorityHighIcon color="warning" />;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const filteredNotifications = () => {
    switch (selectedTab) {
      case 0: // All
        return notifications;
      case 1: // Unread
        return notifications.filter(n => !n.read);
      case 2: // Orders
        return notifications.filter(n => n.type === 'order' || n.type === 'delivery');
      case 3: // Promotions
        return notifications.filter(n => n.type === 'promotion');
      default:
        return notifications;
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'order':
      case 'delivery':
        if (notification.data?.orderId) {
          navigate(`/order/${notification.data.orderId}`);
        } else {
          navigate('/orders');
        }
        break;
      case 'promotion':
        navigate('/home');
        break;
      case 'product':
        navigate('/home');
        break;
      default:
        break;
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    setDeletingNotification(notificationId);
    try {
      await deleteNotification(notificationId);
      setSnackbarMessage('Notification deleted successfully');
      setShowSnackbar(true);
    } catch (error) {
      setSnackbarMessage('Failed to delete notification');
      setShowSnackbar(true);
    } finally {
      setDeletingNotification(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setSnackbarMessage('All notifications cleared');
      setShowSnackbar(true);
    } catch (error) {
      setSnackbarMessage('Failed to clear notifications');
      setShowSnackbar(true);
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchNotifications();
      setSnackbarMessage('Notifications refreshed');
      setShowSnackbar(true);
    } catch (error) {
      setSnackbarMessage('Failed to refresh notifications');
      setShowSnackbar(true);
    }
  };

  const renderNotificationItem = (notification) => (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <ListItem
        sx={{
          mb: 1,
          borderRadius: 2,
          backgroundColor: notification.read ? 'transparent' : 'action.hover',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          position: 'relative',
        }}
        onClick={() => handleNotificationClick(notification)}
      >
        <ListItemIcon>
          {notification.read ? (
            <CircleIcon sx={{ color: 'text.disabled' }} />
          ) : (
            <Badge
              badgeContent=""
              color="error"
              variant="dot"
              sx={{ '& .MuiBadge-dot': { backgroundColor: 'primary.main' } }}
            >
              {getNotificationIcon(notification.type)}
            </Badge>
          )}
        </ListItemIcon>
        
        <ListItemText
          primaryTypographyProps={{ component: 'div' }}
          secondaryTypographyProps={{ component: 'div' }}
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography
                component="div"
                sx={{ 
                  flexGrow: 1,
                  fontWeight: notification.read ? 400 : 600,
                  color: notification.read ? 'text.secondary' : 'text.primary',
                  fontSize: '1rem',
                  lineHeight: 1.5
                }}
              >
                {notification.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getPriorityIcon(notification.priority)}
                {getCategoryIcon(notification.category)}
                <Chip
                  label={notification.type}
                  size="small"
                  color={getNotificationColor(notification.type)}
                  variant="outlined"
                />
              </Box>
            </Box>
          }
          secondary={
            <Box>
              <Typography
                component="div"
                sx={{ 
                  display: 'block',
                  mb: 0.5,
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  lineHeight: 1.43
                }}
              >
                {notification.message}
              </Typography>
              <Typography
                component="div"
                sx={{ 
                  display: 'block',
                  color: 'text.disabled',
                  fontSize: '0.75rem',
                  lineHeight: 1.66
                }}
              >
                {formatTimestamp(notification.timestamp)}
              </Typography>
            </Box>
          }
        />
        
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteNotification(notification.id);
            }}
            size="small"
            disabled={deletingNotification === notification.id}
          >
            {deletingNotification === notification.id ? (
              <CircularProgress size={20} />
            ) : (
              <DeleteIcon />
            )}
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    </motion.div>
  );

  const renderSkeleton = () => (
    <Box>
      {[...Array(5)].map((_, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={16} />
              </Box>
            </Box>
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="30%" height={14} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Notifications
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setShowSettings(true)}
          >
            Settings
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              onClick={markAllAsRead}
              disabled={loading}
            >
              Mark All Read
            </Button>
          )}
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab label={`All (${notifications.length})`} />
          <Tab label={`Unread (${unreadCount})`} />
          <Tab label="Orders" />
          <Tab label="Promotions" />
        </Tabs>
      </Card>

      {/* Notifications List */}
      {loading ? (
        renderSkeleton()
      ) : filteredNotifications().length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {selectedTab === 1 ? 'No unread notifications' : 'No notifications'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedTab === 1 
                ? 'You\'re all caught up!' 
                : 'You\'ll see notifications here when they arrive'
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <List sx={{ p: 0 }}>
            <AnimatePresence>
              {filteredNotifications().map((notification, index) => (
                <React.Fragment key={`notification-${notification.id}-${index}`}>
                  {renderNotificationItem(notification)}
                  {index < filteredNotifications().length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </AnimatePresence>
          </List>
        </Card>
      )}

      {/* Clear All Button */}
      {notifications.length > 0 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<ClearIcon />}
            onClick={handleClearAll}
            disabled={loading}
          >
            Clear All Notifications
          </Button>
        </Box>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="h6" gutterBottom>
              Notification Channels
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.pushNotifications}
                  onChange={(e) => updateSettings({ pushNotifications: e.target.checked })}
                />
              }
              label="Push Notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => updateSettings({ emailNotifications: e.target.checked })}
                />
              }
              label="Email Notifications"
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Notification Categories
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.orderUpdates}
                  onChange={(e) => updateSettings({ orderUpdates: e.target.checked })}
                />
              }
              label="Order Updates"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.deliveryUpdates}
                  onChange={(e) => updateSettings({ deliveryUpdates: e.target.checked })}
                />
              }
              label="Delivery Updates"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.promotions}
                  onChange={(e) => updateSettings({ promotions: e.target.checked })}
                />
              }
              label="Promotions & Offers"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.newProducts}
                  onChange={(e) => updateSettings({ newProducts: e.target.checked })}
                />
              }
              label="New Products"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default NotificationsPage; 