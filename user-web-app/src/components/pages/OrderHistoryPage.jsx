import React, { useState } from 'react';
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
  Divider,
  Skeleton,
  Tabs,
  Tab,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
} from '@mui/material';
import {
  ArrowBack,
  ShoppingBag,
  LocalShipping,
  CheckCircle,
  Cancel,
  Schedule,
  Visibility,
  ExpandMore,
  ExpandLess,
  Receipt,
  LocationOn,
  Payment,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { apiService, ENDPOINTS } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { getPlaceholderImageUrl } from '../../utils/imageUtils';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Fetch user orders
  const {
    data: orders,
    isLoading,
    error,
  } = useQuery(
    ['user-orders'],
    async () => {
      const response = await apiService.get(ENDPOINTS.orders.user);
      return response;
    },
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filterOrders = (orders, status) => {
    if (!orders) return [];
    if (status === 'all') return orders;
    return orders.filter(order => (order.status?.current || order.status) === status);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await apiService.put(`/orders/${orderId}/cancel`);
      if (response.success) {
        // Refetch orders to update the list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const renderOrderCard = (order) => {
    const isExpanded = expandedOrder === order._id;

    return (
      <motion.div
        key={order._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card sx={{ mb: 2, cursor: 'pointer' }} onClick={() => handleOrderExpand(order._id)}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Order #{order.orderNumber || order._id.slice(-8)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(order.createdAt)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={getStatusIcon(order.status?.current || order.status)}
                  label={(order.status?.current || order.status) ? (order.status?.current || order.status).charAt(0).toUpperCase() + (order.status?.current || order.status).slice(1) : 'Unknown'}
                  color={getStatusColor(order.status?.current || order.status)}
                  variant="outlined"
                />
                <IconButton size="small">
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ShoppingBag color="primary" />
                  <Typography variant="body2">
                    {order.items?.length || 0} items
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Payment color="primary" />
                  <Typography variant="body2">
                    {order.payment?.method ? order.payment.method.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Unknown'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  ${order.payment?.amount?.total?.toFixed(2) || '0.00'}
                </Typography>
              </Grid>
            </Grid>

            <Collapse in={isExpanded}>
              <Divider sx={{ my: 2 }} />
              
              {/* Order Items */}
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              <List dense>
                {order.items?.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <Box
                      component="img"
                                              src={item.product?.image || getPlaceholderImageUrl('product')}
                      alt={item.product?.name}
                      sx={{
                        width: 50,
                        height: 50,
                        objectFit: 'cover',
                        borderRadius: 1,
                        mr: 2,
                      }}
                    />
                    <ListItemText
                      primary={item.product?.name}
                      secondary={`Quantity: ${item.quantity} × $${(item.price || 0).toFixed(2)}`}
                    />
                    <Typography variant="body2" fontWeight="bold">
                      ${((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Order Details */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Delivery Details
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOn color="primary" />
                    <Typography variant="body2">
                      {order.deliveryAddress?.address || 'Address not specified'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {order.deliveryInfo?.method ? order.deliveryInfo.method.charAt(0).toUpperCase() + order.deliveryInfo.method.slice(1) : 'Standard'} Delivery
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Payment Summary
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">${order.payment?.amount?.subtotal?.toFixed(2) || '0.00'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Delivery Fee:</Typography>
                    <Typography variant="body2">${order.payment?.amount?.deliveryFee?.toFixed(2) || order.deliveryInfo?.fee?.toFixed(2) || '0.00'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Tax:</Typography>
                    <Typography variant="body2">${order.payment?.amount?.tax?.toFixed(2) || '0.00'}</Typography>
                  </Box>
                  {order.payment?.amount?.discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Discount:</Typography>
                      <Typography variant="body2" color="success.main">-${order.payment?.amount?.discount?.toFixed(2)}</Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" fontWeight="bold">Total:</Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      ${order.payment?.amount?.total?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => navigate(`/order/${order._id}`)}
                >
                  View Details
                </Button>
                {(order.status?.current || order.status) === 'pending' && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    Cancel Order
                  </Button>
                )}
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderSkeleton = () => (
    <Grid container spacing={2}>
      {[...Array(3)].map((_, index) => (
        <Grid item xs={12} key={index}>
          <Card>
            <CardContent>
              <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                </Grid>
                <Grid item xs={6}>
                  <Skeleton variant="text" height={32} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            Please login to view your orders
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

  const filteredOrders = filterOrders(orders?.data?.orders, selectedTab === 0 ? 'all' : 
    selectedTab === 1 ? 'pending' : 
    selectedTab === 2 ? 'shipped' : 
    selectedTab === 3 ? 'delivered' : 'cancelled');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Order History
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label={`All (${orders?.data?.orders?.length || 0})`} />
        <Tab label={`Pending (${filterOrders(orders?.data?.orders, 'pending').length})`} />
        <Tab label={`Shipped (${filterOrders(orders?.data?.orders, 'shipped').length})`} />
        <Tab label={`Delivered (${filterOrders(orders?.data?.orders, 'delivered').length})`} />
        <Tab label={`Cancelled (${filterOrders(orders?.data?.orders, 'cancelled').length})`} />
      </Tabs>

      {/* Orders List */}
      {isLoading ? (
        renderSkeleton()
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Failed to load orders
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      ) : filteredOrders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No orders found
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedTab === 0 
              ? "You haven't placed any orders yet."
              : `No ${selectedTab === 1 ? 'pending' : selectedTab === 2 ? 'shipped' : selectedTab === 3 ? 'delivered' : 'cancelled'} orders.`
            }
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/home')}
            sx={{ mt: 2 }}
          >
            Start Shopping
          </Button>
        </Box>
      ) : (
        <Box>
          {filteredOrders.map(renderOrderCard)}
        </Box>
      )}
    </Container>
  );
};

export default OrderHistoryPage;