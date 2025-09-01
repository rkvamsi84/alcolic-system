import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Switch,
  FormControlLabel,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  LocalShipping,
  Assignment,
  CheckCircle,
  ExitToApp,
  Person,
  LocationOn,
  Phone,
  Email,
  DirectionsCar,
  Star,
  Refresh,
  Visibility,
  PlayArrow,
  Pause,
  Navigation,
  AccessTime,
  MonetizationOn,
  NotificationsActive,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService, ENDPOINTS } from '../../config/api';
import { toast } from 'react-hot-toast';
import OrderTrackingMap from '../widgets/OrderTrackingMap';

const DeliveryDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [locationUpdateInterval, setLocationUpdateInterval] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [storeLocation, setStoreLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);

  // Fetch delivery profile
  const fetchProfile = async () => {
    try {
      const response = await apiService.get(ENDPOINTS.delivery.profile);
      if (response.success) {
        setProfile(response.data);
        setIsOnline(response.data.active === 1);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  // Fetch available orders
  const fetchAvailableOrders = async () => {
    try {
      // Add cache-busting parameter
      const cacheBuster = `?t=${Date.now()}`;
      const response = await apiService.get(ENDPOINTS.delivery.availableOrders + cacheBuster);
      console.log('DEBUG - Available Orders API Response:', response);
      if (response.success) {
        console.log('DEBUG - Available Orders Data:', response.data);
        if (response.data && response.data.length > 0) {
          console.log('DEBUG - First Order Structure:', response.data[0]);
          console.log('DEBUG - First Order Fields:', {
            order_number: response.data[0].order_number,
            total_amount: response.data[0].total_amount,
            customer: response.data[0].customer,
            customer_name: response.data[0].customer?.name
          });
        }
        setAvailableOrders(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching available orders:', error);
    }
  };

  // Fetch assigned orders
  const fetchOrders = async () => {
    try {
      const response = await apiService.get(ENDPOINTS.delivery.orders);
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    }
  };

  // Fetch current order
  const fetchCurrentOrder = async () => {
    try {
      // Add cache-busting parameter
      const cacheBuster = `?t=${Date.now()}`;
      const response = await apiService.get(ENDPOINTS.delivery.currentOrder + cacheBuster);
      if (response.success) {
        setCurrentOrder(response.data);
      }
    } catch (error) {
      console.error('Error fetching current order:', error);
    }
  };

  // Fetch earnings
  const fetchEarnings = async () => {
    try {
      // Fetch earnings for different periods
      const [todayResponse, weekResponse, monthResponse, totalResponse] = await Promise.all([
        apiService.get(`${ENDPOINTS.delivery.earnings}?period=today`),
        apiService.get(`${ENDPOINTS.delivery.earnings}?period=week`),
        apiService.get(`${ENDPOINTS.delivery.earnings}?period=month`),
        apiService.get(ENDPOINTS.delivery.earnings)
      ]);
      
      const earningsData = {
        // Today's earnings
        todayEarnings: todayResponse.success ? todayResponse.data.earnings.totalEarnings : 0,
        todayOrders: todayResponse.success ? todayResponse.data.earnings.totalOrders : 0,
        
        // Week's earnings
        weekEarnings: weekResponse.success ? weekResponse.data.earnings.totalEarnings : 0,
        weekOrders: weekResponse.success ? weekResponse.data.earnings.totalOrders : 0,
        
        // Month's earnings
        monthEarnings: monthResponse.success ? monthResponse.data.earnings.totalEarnings : 0,
        monthOrders: monthResponse.success ? monthResponse.data.earnings.totalOrders : 0,
        
        // Total earnings and stats
        totalEarnings: totalResponse.success ? totalResponse.data.earnings.totalEarnings : 0,
        totalOrders: totalResponse.success ? totalResponse.data.earnings.totalOrders : 0,
        deliveredOrders: totalResponse.success ? totalResponse.data.earnings.deliveredOrders : 0,
        averageEarningsPerOrder: totalResponse.success ? totalResponse.data.earnings.averageEarningsPerOrder : 0
      };
      
      setEarnings(earningsData);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  // Fetch performance
  const fetchPerformance = async () => {
    try {
      const response = await apiService.get(ENDPOINTS.delivery.performance);
      if (response.success) {
        setPerformance(response.data);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
    }
  };

  // Toggle online status
  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      const response = await apiService.post(ENDPOINTS.delivery.activeStatus, {
        isAvailable: newStatus
      });
      if (response.success) {
        setIsOnline(newStatus);
        toast.success(`You are now ${newStatus ? 'online' : 'offline'}`);
        
        // Start/stop location updates
        if (newStatus) {
          startLocationUpdates();
        } else {
          stopLocationUpdates();
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Start location updates
  const startLocationUpdates = () => {
    if (navigator.geolocation) {
      const interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              await apiService.patch(ENDPOINTS.delivery.location, {
                coordinates: [position.coords.longitude, position.coords.latitude]
              });
            } catch (error) {
              console.error('Error updating location:', error);
            }
          },
          (error) => console.error('Geolocation error:', error)
        );
      }, 30000); // Update every 30 seconds
      setLocationUpdateInterval(interval);
    }
  };

  // Stop location updates
  const stopLocationUpdates = () => {
    if (locationUpdateInterval) {
      clearInterval(locationUpdateInterval);
      setLocationUpdateInterval(null);
    }
  };

  // Accept order
  const acceptOrder = async (orderId) => {
    try {
      const response = await apiService.put(ENDPOINTS.delivery.acceptOrder, {
        order_id: orderId
      });
      if (response.success) {
        toast.success('Order accepted successfully!');
        await refreshData();
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order');
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await apiService.patch(ENDPOINTS.delivery.updateOrderStatus(orderId), {
        status
      });
      
      if (response.success) {
        toast.success('Order status updated successfully!');
        await refreshData();
      } else {
        toast.error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchProfile(),
      fetchOrders(),
      fetchAvailableOrders(),
      fetchCurrentOrder(),
      fetchEarnings(),
      fetchPerformance()
    ]);
    setRefreshing(false);
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    loadData();

    // Cleanup on unmount
    return () => {
      stopLocationUpdates();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle logout
  const handleLogout = () => {
    stopLocationUpdates();
    logout();
    navigate('/welcome');
  };

  // Show order details
  const showOrderDetails = async (order) => {
    
    console.log('🔍 Order details:', {
      id: order.id || order._id,
      status: order.status?.current || order.status,
      isInOrders: orders.find(o => o.id === order.id || o._id === order.id || o.id === order._id) ? 'Yes' : 'No',
      canStartDelivery: ['confirmed', 'preparing', 'ready_for_pickup', 'pending'].includes(order.status?.current || order.status),
      canCompleteDelivery: (order.status?.current === 'out_for_delivery' || order.status === 'out_for_delivery')
    });
    
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
    
    // Fetch tracking data for the order
    try {
      // Get all tracking data for this delivery user
      const trackingResponse = await apiService.get(ENDPOINTS.orderTracking.getDeliveryTracking);
      
      if (trackingResponse.success && trackingResponse.data) {
        // Find tracking data that matches this order
        const orderTracking = trackingResponse.data.find(tracking => 
          tracking.order?._id === order.id || tracking.order?.id === order.id
        );
        
        if (orderTracking) {
          setTrackingData(orderTracking);
          
          // Set locations for map
          setStoreLocation(orderTracking.store?.location);
          setCustomerLocation(orderTracking.customer?.address?.location);
          setDeliveryLocation(orderTracking.location);
        } else {
          console.warn('No tracking data found for order:', order.id);
          toast.error('Tracking information not available for this order');
        }
      } else {
        console.warn('Failed to fetch tracking data');
        toast.error('Unable to load tracking information');
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      if (error.response?.status === 404) {
        toast.error('No tracking information found for this order');
      } else {
        toast.error('Failed to load tracking information');
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
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
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Delivery Partner Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {profile?.f_name || user?.name}!
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={refreshData} disabled={refreshing}>
                {refreshing ? <CircularProgress size={20} /> : <Refresh />}
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Box>

        {/* Online Status Toggle */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: isOnline ? 'success.light' : 'grey.100' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: isOnline ? 'success.main' : 'grey.500' }}>
                {isOnline ? <PlayArrow /> : <Pause />}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  You are {isOnline ? 'Online' : 'Offline'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isOnline ? 'Ready to receive orders' : 'Not receiving orders'}
                </Typography>
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={isOnline}
                  onChange={toggleOnlineStatus}
                  color="success"
                />
              }
              label={isOnline ? 'Go Offline' : 'Go Online'}
            />
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{profile?.order_count || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Orders
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <MonetizationOn />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">${earnings?.totalEarnings?.toFixed(2) || '0.00'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Earnings
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <AccessTime />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{profile?.todays_order_count || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Today's Orders
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <Star />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{profile?.avg_rating || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Rating
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Detailed Earnings Section */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            <MonetizationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
            Earnings Breakdown
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                <CardContent>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      ${earnings?.todayEarnings?.toFixed(2) || '0.00'}
                    </Typography>
                    <Typography variant="body1">
                      Today's Earnings
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {earnings?.todayOrders || 0} orders completed
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                <CardContent>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      ${earnings?.weekEarnings?.toFixed(2) || '0.00'}
                    </Typography>
                    <Typography variant="body1">
                      This Week's Earnings
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {earnings?.weekOrders || 0} orders completed
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <CardContent>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      ${earnings?.monthEarnings?.toFixed(2) || '0.00'}
                    </Typography>
                    <Typography variant="body1">
                      This Month's Earnings
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {earnings?.monthOrders || 0} orders completed
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Earnings Statistics */}
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Average per Order</Typography>
                  <Typography variant="h6" color="success.main">
                    ${earnings?.averageEarningsPerOrder?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Delivery Success Rate</Typography>
                  <Typography variant="h6" color="primary.main">
                    {earnings?.totalOrders > 0 ? Math.round((earnings?.deliveredOrders / earnings?.totalOrders) * 100) : 0}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Current Order */}
        {currentOrder && (
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'warning.light' }}>
            <Typography variant="h6" gutterBottom>
              <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
              Current Active Order
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="body1">
                  <strong>Order #{currentOrder.order_number}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customer: {currentOrder.customer?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Address: {currentOrder.delivery_address?.address}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => updateOrderStatus(currentOrder.id, 'out_for_delivery')}
                  >
                    Mark Out for Delivery
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => updateOrderStatus(currentOrder.id, 'delivered')}
                  >
                    Mark Delivered
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        <Grid container spacing={3}>
          {/* Available Orders */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '400px', overflow: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  <Badge badgeContent={availableOrders.length} color="primary">
                    <NotificationsActive />
                  </Badge>
                  <span style={{ marginLeft: 8 }}>Available Orders</span>
                </Typography>
              </Box>
              {availableOrders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No available orders at the moment
                  </Typography>
                </Box>
              ) : (
                <List>
                  {availableOrders.map((order) => (
                    <ListItem key={order.id} divider>
                      <ListItemIcon>
                        <Assignment />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Order #${order.order_number}`}
                        secondary={`Customer: ${order.customer?.name} • Amount: $${order.total_amount}`}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => showOrderDetails(order)}
                        >
                          <Visibility />
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => acceptOrder(order.id)}
                        >
                          Accept
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* My Orders */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '400px', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                My Orders
              </Typography>
              {orders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No assigned orders
                  </Typography>
                </Box>
              ) : (
                <List>
                  {orders.map((order) => (
                    <ListItem key={order.id} divider>
                      <ListItemIcon>
                        <LocalShipping />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Order #${order.order_number}`}
                        secondary={`Status: ${order.status?.current || order.status} • Customer: ${order.customer?.name}`}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => showOrderDetails(order)}
                      >
                        <Visibility />
                      </Button>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Profile Section */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
            Profile Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 60, height: 60 }}>
                  {profile?.f_name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{profile?.f_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Delivery Partner
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Email fontSize="small" />
                <Typography variant="body2">{profile?.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Phone fontSize="small" />
                <Typography variant="body2">{profile?.phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DirectionsCar fontSize="small" />
                <Typography variant="body2">Vehicle: Bike</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Performance Metrics
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Member since: {profile?.member_since_days} days</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((profile?.member_since_days || 0) / 365 * 100, 100)} 
                  sx={{ mt: 1 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">This week orders: {profile?.this_week_order_count || 0}</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((profile?.this_week_order_count || 0) / 50 * 100, 100)} 
                  sx={{ mt: 1 }}
                />
              </Box>
              <Box>
                <Typography variant="body2">This month earnings: ${profile?.this_month_earning || 0}</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((profile?.this_month_earning || 0) / 1000 * 100, 100)} 
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Order Details Dialog */}
        <Dialog
          open={orderDetailsOpen}
          onClose={() => setOrderDetailsOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Order Details - #{selectedOrder?.order_number}
            {trackingData?.trackingCode && (
              <Chip 
                label={`Tracking: ${trackingData.trackingCode}`} 
                size="small" 
                sx={{ ml: 2 }}
              />
            )}
          </DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Grid container spacing={3}>
                {/* Customer Information */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: 'fit-content' }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Customer Details
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedOrder.customer?.name || trackingData?.customer?.name}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        <Phone sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        {selectedOrder.customer?.phone || trackingData?.customer?.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        <Email sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        {selectedOrder.customer?.email || trackingData?.customer?.email}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="h6" gutterBottom color="primary">
                      <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Delivery Address
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.delivery_address?.address || 
                       (trackingData?.customer?.address?.street 
                         ? `${trackingData.customer.address.street}${trackingData.customer.address.city ? ', ' + trackingData.customer.address.city : ''}${trackingData.customer.address.state ? ', ' + trackingData.customer.address.state : ''}${trackingData.customer.address.zipCode ? ' ' + trackingData.customer.address.zipCode : ''}`
                         : 'Address not available')}
                    </Typography>
                    
                    {trackingData?.store && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom color="primary">
                          Store Information
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {typeof trackingData.store.name === 'string' ? trackingData.store.name : 'Store name not available'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {typeof trackingData.store.address === 'string' 
                            ? trackingData.store.address 
                            : trackingData.store.address?.street 
                              ? `${trackingData.store.address.street}, ${trackingData.store.address.city || ''}, ${trackingData.store.address.state || ''} ${trackingData.store.address.zipCode || ''}`
                              : 'Address not available'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Phone: {typeof trackingData.store.phone === 'string' ? trackingData.store.phone : trackingData.store.phone?.number || 'Not available'}
                        </Typography>
                      </>
                    )}
                  </Paper>
                </Grid>
                
                {/* Order Information */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: 'fit-content' }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Order Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={selectedOrder.status?.current || selectedOrder.status}
                        color={selectedOrder.status?.current === 'delivered' ? 'success' : 'primary'}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                      <Typography variant="h6" color="success.main">
                        ${selectedOrder.total_amount}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                      <Typography variant="body1">{typeof selectedOrder.payment_method === 'string' ? selectedOrder.payment_method : 'Payment method not available'}</Typography>
                    </Box>
                    
                    {trackingData?.estimated_delivery_time && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Estimated Delivery</Typography>
                        <Typography variant="body1">
                          {new Date(trackingData.estimated_delivery_time).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Order Items
                    </Typography>
                    {selectedOrder.items?.map((item, index) => (
                      <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {typeof item.product?.name === 'string' ? item.product.name : 'Product name not available'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Quantity: {item.quantity} × ${(item.price || 0).toFixed(2)} = ${((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
                
                {/* Map Section */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: '400px' }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      <Navigation sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Delivery Map
                    </Typography>
                    {(storeLocation || customerLocation || deliveryLocation) ? (
                      <Box sx={{ height: '320px', borderRadius: 1, overflow: 'hidden' }}>
                        <OrderTrackingMap
                          orderData={selectedOrder}
                          deliveryLocation={deliveryLocation}
                          storeLocation={storeLocation}
                          customerLocation={customerLocation}
                          isLiveTracking={true}
                          onLocationUpdate={(location) => {
                            setDeliveryLocation(location);
                          }}
                        />
                      </Box>
                    ) : (
                      <Box sx={{ 
                        height: '320px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                        borderRadius: 1
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          Map will load when location data is available
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOrderDetailsOpen(false);
              setTrackingData(null);
              setDeliveryLocation(null);
              setStoreLocation(null);
              setCustomerLocation(null);
            }}>Close</Button>
            {selectedOrder && !orders.find(o => o.id === selectedOrder.id) && (
              <Button
                variant="contained"
                onClick={() => {
                  acceptOrder(selectedOrder.id);
                  setOrderDetailsOpen(false);
                }}
              >
                Accept Order
              </Button>
            )}
            {selectedOrder && orders.find(o => o.id === selectedOrder.id || o._id === selectedOrder.id || o.id === selectedOrder._id) && 
             ['confirmed', 'preparing', 'ready_for_pickup', 'pending'].includes(selectedOrder.status?.current || selectedOrder.status) && (
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  console.log('Start Delivery button clicked!');
                  updateOrderStatus(selectedOrder.id || selectedOrder._id, 'out_for_delivery');
                  setOrderDetailsOpen(false);
                }}
              >
                Start Delivery
              </Button>
            )}
            {selectedOrder && orders.find(o => o.id === selectedOrder.id || o._id === selectedOrder.id || o.id === selectedOrder._id) && 
             (selectedOrder.status?.current === 'out_for_delivery' || selectedOrder.status === 'out_for_delivery') && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  console.log('Complete Delivery button clicked!');
                  updateOrderStatus(selectedOrder.id || selectedOrder._id, 'delivered');
                  setOrderDetailsOpen(false);
                }}
              >
                Complete Delivery
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default DeliveryDashboard;