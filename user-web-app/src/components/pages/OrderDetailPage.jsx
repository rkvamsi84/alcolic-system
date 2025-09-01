import React from 'react';
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
  Skeleton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
} from '@mui/material';
// Timeline components replaced with standard Material-UI components
import {
  ArrowBack,
  ShoppingBag,
  LocalShipping,
  CheckCircle,
  Cancel,
  Schedule,
  Receipt,
  LocationOn,
  Payment,
  Phone,
  Email,
  AccessTime,
  LocalOffer,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { apiService } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { getPlaceholderImageUrl } from '../../utils/imageUtils';
import OrderTrackingMap from '../widgets/OrderTrackingMap';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch order details
  const {
    data: order,
    isLoading,
    error,
  } = useQuery(
    ['order-details', orderId],
    async () => {
      const response = await apiService.get(`/orders/${orderId}`);
      return response;
    },
    {
      enabled: !!orderId && !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Schedule />;
      case 'confirmed':
        return <CheckCircle />;
      case 'shipped':
        return <LocalShipping />;
      case 'delivered':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <Schedule />;
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancelOrder = async () => {
    try {
      const response = await apiService.put(`/orders/${orderId}/cancel`);
      if (response.success) {
        toast.success('Order cancelled successfully');
        // Refetch order data
        window.location.reload();
      } else {
        toast.error(response.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order. Please try again.');
    }
  };

  const renderTimeline = () => {
    const steps = [
      { label: 'Order Placed', description: 'Your order has been placed successfully' },
      { label: 'Order Confirmed', description: 'Your order has been confirmed and is being processed' },
      { label: 'Order Shipped', description: 'Your order has been shipped and is on its way' },
      { label: 'Order Delivered', description: 'Your order has been delivered successfully' },
    ];

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order Status
          </Typography>
          <Stepper activeStep={getStatusStep(order?.data?.status?.current)} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel>{step.label}</StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
    );
  };

  const renderOrderItems = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        <List>
          {order?.data?.items?.map((item, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <Box
                component="img"
                                        src={item.product?.image || getPlaceholderImageUrl('product')}
                alt={item.product?.name}
                sx={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: 1,
                  mr: 2,
                }}
              />
              <ListItemText
                primary={item.product?.name}
                secondary={`Quantity: ${item.quantity} × $${(item.price || 0).toFixed(2)}`}
              />
              <Typography variant="body1" fontWeight="bold">
                ${((item.quantity || 1) * (item.price || 0)).toFixed(2)}
              </Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderOrderSummary = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2">${order?.data?.payment?.amount?.subtotal?.toFixed(2) || '0.00'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Delivery Fee:</Typography>
              <Typography variant="body2">${order?.data?.payment?.amount?.deliveryFee?.toFixed(2) || order?.data?.deliveryInfo?.fee?.toFixed(2) || '0.00'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Tax:</Typography>
              <Typography variant="body2">${order?.data?.payment?.amount?.tax?.toFixed(2) || '0.00'}</Typography>
            </Box>
            {order?.data?.payment?.amount?.discount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Discount:</Typography>
                <Typography variant="body2" color="success.main">-${order?.data?.payment?.amount?.discount?.toFixed(2)}</Typography>
              </Box>
            )}
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="bold">Total:</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                ${order?.data?.payment?.amount?.total?.toFixed(2) || '0.00'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Payment color="primary" />
              <Typography variant="body2">
                {order?.data?.payment?.method ? order.data.payment.method.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Unknown'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocalShipping color="primary" />
              <Typography variant="body2">
                {order?.data?.deliveryInfo?.method ? order.data.deliveryInfo.method.charAt(0).toUpperCase() + order.data.deliveryInfo.method.slice(1) : 'Standard'} Delivery
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime color="primary" />
              <Typography variant="body2">
                Ordered on {formatDate(order?.data?.createdAt)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderDeliveryInfo = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Delivery Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LocationOn color="primary" />
              <Typography variant="body1" fontWeight="medium">
                Delivery Address
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              {order?.data?.deliveryAddress?.address || 'Address not specified'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              {order?.data?.deliveryAddress?.city}, {order?.data?.deliveryAddress?.state} {order?.data?.deliveryAddress?.zipCode}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Phone color="primary" />
              <Typography variant="body1" fontWeight="medium">
                Contact Information
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              {user?.phone || 'Phone not provided'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              {user?.email || 'Email not provided'}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => (
    <Box>
      <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={150} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={100} />
    </Box>
  );

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            Please login to view order details
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </Box>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Skeleton variant="text" height={40} sx={{ flexGrow: 1 }} />
        </Box>
        {renderSkeleton()}
      </Container>
    );
  }

  if (error || !order?.data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Failed to load order details
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            Order Details
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Order #{order?.data?.orderNumber || order?.data?._id?.slice(-8)}
          </Typography>
        </Box>
        <Chip
          icon={getStatusIcon(order?.data?.status?.current)}
          label={order?.data?.status?.current ? order.data.status.current.charAt(0).toUpperCase() + order.data.status.current.slice(1) : 'Unknown'}
          color={getStatusColor(order?.data?.status?.current)}
          variant="outlined"
        />
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {renderTimeline()}
            {renderOrderItems()}
            {renderOrderSummary()}
            {renderDeliveryInfo()}
            
            {/* Order Tracking Map */}
            <OrderTrackingMap
              orderData={order.data}
              deliveryLocation={order?.data?.deliveryLocation}
        storeLocation={order?.data?.storeLocation}
        customerLocation={order?.data?.deliveryAddress}
        isLiveTracking={order?.data?.status?.current === 'out_for_delivery'}
              onLocationUpdate={() => {
                // Refresh order data
                window.location.reload();
              }}
            />
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Actions
                </Typography>
                
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 2 }}
                  onClick={() => navigate('/orders')}
                >
                  Back to Orders
                </Button>

                {order?.data?.status?.current === 'pending' && (
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={handleCancelOrder}
                  >
                    Cancel Order
                  </Button>
                )}

                {order?.data?.status?.current === 'delivered' && (
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mb: 2 }}
                    onClick={() => navigate(`/product/${order?.data?.items?.[0]?.product?._id}`)}
                  >
                    Reorder
                  </Button>
                )}

                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="text.secondary">
                  Need help? Contact our support team
                </Typography>
                <Button
                  variant="text"
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() => navigate('/support')}
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default OrderDetailPage;