import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
// Timeline components replaced with standard Material-UI components
import {
  ArrowBack,
  LocationOn,
  LocalShipping,
  Store,
  Person,
  Phone,
  Email,
  AccessTime,
  CheckCircle,
  Schedule,
  Cancel,
  Refresh,
  Message,
  Navigation,
  Timeline as TimelineIcon,
  Info,
  Warning,
  Error,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from 'react-query';
import { apiService, ENDPOINTS } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import OrderTrackingMap from '../widgets/OrderTrackingMap';

const OrderTrackingPage = () => {
  const { trackingCode, orderId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedTab, setSelectedTab] = useState('tracking');
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch tracking data
  const {
    data: trackingData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['order-tracking', trackingCode || orderId],
    async () => {
      if (trackingCode) {
        return await apiService.get(ENDPOINTS.orderTracking.getByTrackingCode(trackingCode));
      } else if (orderId) {
        // Get tracking by order ID - fetch customer tracking data and find matching order
        const trackingResponse = await apiService.get(ENDPOINTS.orderTracking.getCustomerTracking);
        if (trackingResponse.success && trackingResponse.data) {
          const orderTracking = trackingResponse.data.find(tracking => 
            tracking.order?._id === orderId || tracking.order?.id === orderId
          );
          if (orderTracking) {
            return { success: true, data: orderTracking };
          }
        }
        throw new Error('No tracking information found for this order');
      }
      throw new Error('No tracking identifier provided');
    },
    {
      enabled: !!(trackingCode || orderId) && !!user,
      refetchInterval: 30000, // Refresh every 30 seconds for live tracking
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  );

  // Order status configuration
  const statusConfig = {
    pending: {
      label: 'Order Placed',
      color: 'warning',
      icon: <Schedule />,
      description: 'Your order has been placed and is being processed',
    },
    confirmed: {
      label: 'Order Confirmed',
      color: 'info',
      icon: <CheckCircle />,
      description: 'Your order has been confirmed by the store',
    },
    preparing: {
      label: 'Preparing Order',
      color: 'primary',
      icon: <TimelineIcon />,
      description: 'Your order is being prepared',
    },
    ready_for_pickup: {
      label: 'Ready for Pickup',
      color: 'secondary',
      icon: <Store />,
      description: 'Your order is ready and waiting for pickup',
    },
    out_for_delivery: {
      label: 'Out for Delivery',
      color: 'info',
      icon: <LocalShipping />,
      description: 'Your order is on the way to you',
    },
    delivered: {
      label: 'Delivered',
      color: 'success',
      icon: <CheckCircle />,
      description: 'Your order has been delivered successfully',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'error',
      icon: <Cancel />,
      description: 'Your order has been cancelled',
    },
    failed: {
      label: 'Delivery Failed',
      color: 'error',
      icon: <Error />,
      description: 'Delivery attempt failed',
    },
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast.success('Tracking information updated');
    } catch (error) {
      toast.error('Failed to refresh tracking information');
    } finally {
      setRefreshing(false);
    }
  };

  const handleContactDelivery = async () => {
    try {
      // Here you would implement the contact functionality
      // For now, we'll just show a success message
      toast.success('Message sent to delivery partner');
      setShowContactDialog(false);
      setContactMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleString();
  };

  const getEstimatedDeliveryTime = () => {
    if (trackingData?.data?.estimatedDeliveryTime) {
      return formatDateTime(trackingData.data.estimatedDeliveryTime);
    }
    return 'Calculating...';
  };

  const renderTrackingHeader = () => {
    const tracking = trackingData?.data;
    if (!tracking) return null;

    const currentStatus = statusConfig[tracking.status] || statusConfig.pending;

    return (
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Order #{tracking.order?.orderNumber || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Tracking Code: {tracking.trackingCode}
              </Typography>
            </Box>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ color: 'white' }}
            >
              <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Box>

          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              {currentStatus.icon}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {currentStatus.label}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {currentStatus.description}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Estimated Delivery
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {getEstimatedDeliveryTime()}
              </Typography>
            </Box>
            {tracking.order?.totalAmount && (
              <Box textAlign="right">
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Order Total
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  ${tracking.order.totalAmount.toFixed(2)}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderStatusTimeline = () => {
    const tracking = trackingData?.data;
    if (!tracking?.statusHistory) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order Timeline
          </Typography>
          <List>
            {tracking.statusHistory.map((status, index) => {
              const config = statusConfig[status.status] || statusConfig.pending;
              const isActive = index === 0;
              
              return (
                <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                    <Avatar sx={{ bgcolor: isActive ? config.color + '.main' : 'grey.400', mr: 2 }}>
                      {config.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={isActive ? 'bold' : 'normal'}>
                        {config.label}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {formatDateTime(status.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                  {status.notes && (
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 7 }}>
                      {status.notes}
                    </Typography>
                  )}
                  {status.location?.address && (
                      <Typography variant="body2" color="textSecondary">
                        📍 {typeof status.location.address === 'string' 
                          ? status.location.address 
                          : `${status.location.address.street || ''}, ${status.location.address.city || ''}, ${status.location.address.state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Location not specified'
                        }
                      </Typography>
                    )}
                  </ListItem>
              );
            })}
          </List>
        </CardContent>
      </Card>
    );
  };

  const renderCustomerInfo = () => {
    const tracking = trackingData?.data;
    if (!tracking?.customer) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Customer Information
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText
                primary="Name"
                secondary={tracking.customer.name || 'Not available'}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Email />
              </ListItemIcon>
              <ListItemText
                primary="Email"
                secondary={tracking.customer.email || 'Not available'}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Phone />
              </ListItemIcon>
              <ListItemText
                primary="Phone"
                secondary={tracking.customer.phone || 'Not available'}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    );
  };

  const renderStoreInfo = () => {
    const tracking = trackingData?.data;
    if (!tracking?.store) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Store Information
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Store />
              </ListItemIcon>
              <ListItemText
                primary="Store Name"
                secondary={tracking.store.name || 'Not available'}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LocationOn />
              </ListItemIcon>
              <ListItemText
                primary="Address"
                secondary={tracking.store.address || 'Not available'}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Phone />
              </ListItemIcon>
              <ListItemText
                primary="Phone"
                secondary={tracking.store.phone || 'Not available'}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    );
  };

  const renderDeliveryInfo = () => {
    const tracking = trackingData?.data;
    if (!tracking?.deliveryMan) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Delivery Partner
            </Typography>
            {tracking.status === 'out_for_delivery' && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Message />}
                onClick={() => setShowContactDialog(true)}
              >
                Contact
              </Button>
            )}
          </Box>
          <List>
            <ListItem>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText
                primary="Name"
                secondary={tracking.deliveryMan.name || 'Not available'}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Phone />
              </ListItemIcon>
              <ListItemText
                primary="Phone"
                secondary={tracking.deliveryMan.phone || 'Not available'}
              />
            </ListItem>
            {tracking.location && (
              <ListItem>
                <ListItemIcon>
                  <LocationOn />
                </ListItemIcon>
                <ListItemText
                  primary="Current Location"
                  secondary={
                    tracking.location.address 
                      ? (typeof tracking.location.address === 'string' 
                          ? tracking.location.address 
                          : `${tracking.location.address.street || ''}, ${tracking.location.address.city || ''}, ${tracking.location.address.state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Location not specified'
                        )
                      : 'Updating location...'
                  }
                />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>
    );
  };

  const renderOrderItems = () => {
    const tracking = trackingData?.data;
    if (!tracking?.order?.items) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order Items
          </Typography>
          <List>
            {tracking.order.items.map((item, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={item.name || 'Product'}
                  secondary={`Quantity: ${item.quantity || 1} × $${(item.price || 0).toFixed(2)}`}
                />
                <Typography variant="body2" fontWeight="bold">
                  ${((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                </Typography>
              </ListItem>
            ))}
            <Divider />
            <ListItem>
              <ListItemText primary="Total" />
              <Typography variant="h6" fontWeight="bold">
                ${(tracking.order.totalAmount || 0).toFixed(2)}
              </Typography>
            </ListItem>
          </List>
        </CardContent>
      </Card>
    );
  };

  const renderTrackingMap = () => {
    const tracking = trackingData?.data;
    if (!tracking) return null;

    // Prepare location data for the map
    const storeLocation = tracking.store ? {
      lat: tracking.store.latitude || 37.7749,
      lng: tracking.store.longitude || -122.4194,
      address: tracking.store.address,
      name: tracking.store.name,
    } : null;

    const deliveryLocation = tracking.location ? {
      lat: tracking.location.coordinates[1],
      lng: tracking.location.coordinates[0],
      address: tracking.location.address,
      driverName: tracking.deliveryMan?.name,
      phone: tracking.deliveryMan?.phone,
    } : null;

    const customerLocation = tracking.order?.deliveryAddress ? {
      lat: tracking.order.deliveryAddress.latitude || 37.7849,
      lng: tracking.order.deliveryAddress.longitude || -122.4094,
      address: tracking.order.deliveryAddress.address,
    } : null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Live Tracking Map
          </Typography>
          <Box sx={{ height: 400, width: '100%' }}>
            <OrderTrackingMap
              orderData={tracking.order}
              deliveryLocation={deliveryLocation}
              storeLocation={storeLocation}
              customerLocation={customerLocation}
              isLiveTracking={tracking.status === 'out_for_delivery'}
              onLocationUpdate={handleRefresh}
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderContactDialog = () => (
    <Dialog open={showContactDialog} onClose={() => setShowContactDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Contact Delivery Partner</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Message"
          value={contactMessage}
          onChange={(e) => setContactMessage(e.target.value)}
          placeholder="Type your message here..."
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowContactDialog(false)}>Cancel</Button>
        <Button onClick={handleContactDelivery} variant="contained" disabled={!contactMessage.trim()}>
          Send Message
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ ml: 2 }}>
            Order Tracking
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ ml: 2 }}>
            Order Tracking
          </Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message || 'Failed to load tracking information'}
        </Alert>
        <Button variant="contained" onClick={() => refetch()}>
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ ml: 2 }}>
            Order Tracking
          </Typography>
        </Box>

        {/* Tracking Header */}
        {renderTrackingHeader()}

        <Grid container spacing={3}>
          {/* Left Column - Main Content */}
          <Grid item xs={12} md={8}>
            {/* Live Tracking Map */}
            {renderTrackingMap()}
            
            {/* Status Timeline */}
            {renderStatusTimeline()}
            
            {/* Order Items */}
            {renderOrderItems()}
          </Grid>

          {/* Right Column - Information Cards */}
          <Grid item xs={12} md={4}>
            {/* Customer Information */}
            {renderCustomerInfo()}
            
            {/* Store Information */}
            {renderStoreInfo()}
            
            {/* Delivery Information */}
            {renderDeliveryInfo()}
          </Grid>
        </Grid>

        {/* Contact Dialog */}
        {renderContactDialog()}
      </motion.div>
    </Container>
  );
};

export default OrderTrackingPage;