import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Skeleton,
  Alert,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  LocalShipping,
  CheckCircle,
  Schedule,
  LocationOn,
  Phone,
  Message,
  Refresh,
  Visibility,
  Cancel,
  Receipt,
  Star,
  Timeline,
  AccessTime,
  Done,
  Error,
  Warning,
  Info
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { apiService, ENDPOINTS } from '../../config/api';
import { toast } from 'react-hot-toast';
import OrderTrackingMap from '../widgets/OrderTrackingMap';

const ActiveOrdersPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Order status configuration
  const orderStatuses = {
    'pending': {
      label: 'Pending',
      color: 'warning',
      icon: <Schedule />,
      progress: 10
    },
    'confirmed': {
      label: 'Confirmed',
      color: 'info',
      icon: <CheckCircle />,
      progress: 25
    },
    'preparing': {
      label: 'Preparing',
      color: 'primary',
      icon: <Timeline />,
      progress: 50
    },
    'ready': {
      label: 'Ready for Pickup',
      color: 'secondary',
      icon: <Done />,
      progress: 75
    },
    'out_for_delivery': {
      label: 'Out for Delivery',
      color: 'info',
      icon: <LocalShipping />,
      progress: 90
    },
    'delivered': {
      label: 'Delivered',
      color: 'success',
      icon: <CheckCircle />,
      progress: 100
    },
    'cancelled': {
      label: 'Cancelled',
      color: 'error',
      icon: <Cancel />,
      progress: 0
    }
  };

  // Fetch active orders
  const fetchActiveOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(ENDPOINTS.orders.active);
      if (response.success) {
        setActiveOrders(response.data.orders || []);
      } else {
        toast.error('Failed to load active orders');
      }
    } catch (error) {
      console.error('Error fetching active orders:', error);
      toast.error('Failed to load active orders');
    } finally {
      setLoading(false);
    }
  };

  // Refresh orders
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchActiveOrders();
    setRefreshing(false);
    toast.success('Orders refreshed');
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchActiveOrders();
    
    const interval = setInterval(() => {
      if (!refreshing) {
        fetchActiveOrders();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle order details view
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      const response = await apiService.put(`/orders/${orderId}/cancel`);
      if (response.success) {
        toast.success('Order cancelled successfully');
        fetchActiveOrders();
      } else {
        toast.error('Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  // Format order date
  const formatOrderDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate estimated delivery time
  const getEstimatedDelivery = (order) => {
    const orderDate = new Date(order.createdAt);
    const estimatedTime = new Date(orderDate.getTime() + (60 * 60 * 1000)); // 1 hour from order
    return estimatedTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render order status stepper
  const renderOrderStatus = (order) => {
    const currentStatus = order.status?.current || order.status || 'pending';
    const status = orderStatuses[currentStatus] || orderStatuses['pending'];
    const steps = [
      'pending',
      'confirmed', 
      'preparing',
      'ready',
      'out_for_delivery',
      'delivered'
    ];

    const currentStepIndex = steps.indexOf(currentStatus);
    const isCancelled = currentStatus === 'cancelled';

    if (isCancelled) {
      return (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Error color="error" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6" color="error">
            Order Cancelled
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {order.cancellationReason || 'Order was cancelled'}
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {status.icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {status.label}
          </Typography>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={status.progress} 
          sx={{ height: 8, borderRadius: 4 }}
        />
        
        <Stepper orientation="vertical" sx={{ mt: 2 }}>
          {steps.map((step, index) => {
            const stepStatus = orderStatuses[step];
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <Step key={step} active={isCurrent} completed={isCompleted}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: isCompleted ? 'success.main' : 'grey.300',
                      color: isCompleted ? 'white' : 'grey.600'
                    }}>
                      {isCompleted ? <CheckCircle sx={{ fontSize: 16 }} /> : index + 1}
                    </Box>
                  )}
                >
                  <Typography variant="body2" fontWeight={isCurrent ? 'bold' : 'normal'}>
                    {stepStatus.label}
                  </Typography>
                  {isCurrent && (
                    <Typography variant="caption" color="text.secondary">
                      {order.statusNote || 'Processing your order...'}
                    </Typography>
                  )}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    );
  };

  // Render order card
  const renderOrderCard = (order) => {
    const currentStatus = order.status?.current || order.status || 'pending';
    const status = orderStatuses[currentStatus] || orderStatuses['pending'];
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card sx={{ mb: 3, '&:hover': { boxShadow: 4 } }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Order #{order.orderNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatOrderDate(order.createdAt)}
                </Typography>
              </Box>
              
              <Chip
                label={status.label}
                color={status.color}
                icon={status.icon}
                size="small"
              />
            </Box>

            {/* Order Items Summary */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Items ({order.items?.length || 0})
              </Typography>
              <List dense>
                {order.items?.slice(0, 3).map((item, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemText
                      primary={item.product?.name || 'Product'}
                      secondary={`Qty: ${item.quantity} • $${(item.price || 0).toFixed(2)}`}
                    />
                  </ListItem>
                ))}
                {order.items?.length > 3 && (
                  <ListItem sx={{ py: 0 }}>
                    <ListItemText
                      primary={`+${order.items.length - 3} more items`}
                      sx={{ fontStyle: 'italic' }}
                    />
                  </ListItem>
                )}
              </List>
            </Box>

            {/* Order Total */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" color="primary">
                Total: ${order.payment?.amount?.total?.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Est. Delivery: {getEstimatedDelivery(order)}
              </Typography>
            </Box>

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                  Delivery Address
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.deliveryAddress.street}, {order.deliveryAddress.city}
                </Typography>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Visibility />}
                onClick={() => handleViewOrderDetails(order)}
              >
                View Details
              </Button>
              
                             {currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
                 <Button
                   variant="outlined"
                   color="error"
                   size="small"
                   startIcon={<Cancel />}
                   onClick={() => handleCancelOrder(order._id)}
                 >
                   Cancel Order
                 </Button>
               )}
               
               {currentStatus === 'delivered' && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<Star />}
                  onClick={() => navigate(`/product/${order.items[0]?.product?._id}`)}
                >
                  Leave Review
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Render order details dialog
  const renderOrderDetailsDialog = () => (
    <Dialog
      open={showOrderDetails}
      onClose={() => setShowOrderDetails(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Order Details #{selectedOrder?.orderNumber}
          </Typography>
          <IconButton onClick={() => setShowOrderDetails(false)}>
            <Cancel />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {selectedOrder && (
          <Grid container spacing={3}>
            {/* Order Status */}
            <Grid item xs={12}>
              {renderOrderStatus(selectedOrder)}
            </Grid>
            
            {/* Order Items */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              <List>
                {selectedOrder.items?.map((item, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <Avatar src={item.product?.image} alt={item.product?.name} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.product?.name}
                      secondary={`Qty: ${item.quantity} • $${(item.price || 0).toFixed(2)}`}
                    />
                    <Typography variant="body2" fontWeight="bold">
                      ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            {/* Order Summary */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>${selectedOrder.payment?.amount?.subtotal?.toFixed(2) || '0.00'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Delivery Fee:</Typography>
                  <Typography>${selectedOrder.payment?.amount?.deliveryFee?.toFixed(2) || selectedOrder.deliveryInfo?.fee?.toFixed(2) || '0.00'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax:</Typography>
                  <Typography>${selectedOrder.payment?.amount?.tax?.toFixed(2) || '0.00'}</Typography>
                </Box>
                {selectedOrder.payment?.amount?.discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="success.main">Discount:</Typography>
                    <Typography color="success.main">-${selectedOrder.payment?.amount?.discount?.toFixed(2)}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary">
                    ${selectedOrder.payment?.amount?.total?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            {/* Order Tracking Map */}
            <Grid item xs={12}>
              <OrderTrackingMap
                orderData={selectedOrder}
                deliveryLocation={selectedOrder.deliveryLocation}
                storeLocation={selectedOrder.storeLocation}
                customerLocation={selectedOrder.deliveryAddress}
                isLiveTracking={selectedOrder.status?.current === 'out_for_delivery'}
                onLocationUpdate={() => {
                  // Refresh order data
                  fetchActiveOrders();
                }}
              />
            </Grid>
            
            {/* Delivery Information */}
            {selectedOrder.deliveryAddress && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Delivery Information
                </Typography>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    {selectedOrder.deliveryAddress.street}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.zipCode}
                  </Typography>
                  {selectedOrder.deliveryAddress.phone && (
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Phone sx={{ mr: 1, fontSize: 16 }} />
                      {selectedOrder.deliveryAddress.phone}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => setShowOrderDetails(false)}>
          Close
        </Button>
        {(selectedOrder?.status?.current || selectedOrder?.status) === 'delivered' && (
          <Button
            variant="contained"
            startIcon={<Star />}
            onClick={() => {
              setShowOrderDetails(false);
              navigate(`/product/${selectedOrder.items[0]?.product?._id}`);
            }}
          >
            Leave Review
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Active Orders
          </Typography>
          <Skeleton variant="rectangular" width={100} height={40} />
        </Box>
        
        <Grid container spacing={3}>
          {[...Array(3)].map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="rectangular" height={100} sx={{ my: 2 }} />
                  <Skeleton variant="text" height={24} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Active Orders
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* No Active Orders */}
      {activeOrders.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LocalShipping sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Active Orders
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You don't have any active orders at the moment.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/home')}
            startIcon={<Receipt />}
          >
            Start Shopping
          </Button>
        </Box>
      )}

      {/* Active Orders */}
      <AnimatePresence>
        {activeOrders.length > 0 && (
          <Grid container spacing={3}>
            {activeOrders.map((order) => (
              <Grid item xs={12} md={6} key={order._id}>
                {renderOrderCard(order)}
              </Grid>
            ))}
          </Grid>
        )}
      </AnimatePresence>

      {/* Order Details Dialog */}
      {renderOrderDetailsDialog()}
    </Container>
  );
};

export default ActiveOrdersPage;