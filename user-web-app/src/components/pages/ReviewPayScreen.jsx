import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  ArrowBack,
  ShoppingCart,
  LocationOn,
  Payment,
  Receipt,
  CheckCircle,
  Edit,
  LocalShipping,
  Security,
  CreditCard,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { apiService } from '../../config/api';
import { getPlaceholderImageUrl } from '../../utils/imageUtils';
import PaymentSystem from './PaymentSystem';

const ReviewPayScreen = ({ orderData, onOrderSuccess }) => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const { selectedStore, getSelectedStoreId, hasSelectedStore } = useStore();
  
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState(null);
  const [showPaymentSystem, setShowPaymentSystem] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    return orderData?.deliveryOption === 'express' ? 10 : 
           orderData?.deliveryOption === 'same-day' ? 15 : 5;
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    if (!orderData?.deliveryAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsPlacingOrder(true);
    setPlaceOrderError(null);

    try {
      // Validate store selection before placing order
      const storeId = getSelectedStoreId();
      if (!storeId) {
        toast.error('Please select a store before placing your order');
        setIsPlacingOrder(false);
        return;
      }

      const orderPayload = {
        store: storeId, // Use dynamically selected store ID
        items: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        deliveryAddress: orderData.deliveryAddress,
        payment: {
          method: 'pending', // Will be updated after payment
          amount: {
            subtotal: calculateSubtotal(),
            tax: calculateTax(),
            deliveryFee: calculateShipping(),
            discount: 0,
            total: calculateTotal(),
          }
        },
        deliveryInfo: {
          method: 'delivery',
          fee: calculateShipping(),
        },
        specialInstructions: specialInstructions.trim(),
      };

      console.log('Creating order with payload:', orderPayload);

      const response = await apiService.post('/orders', orderPayload);

      if (response.success) {
        setOrderId(response.data._id);
        toast.success('Order created successfully! Proceeding to payment...');
        setShowPaymentSystem(true);
      } else {
        setPlaceOrderError(response.message || 'Failed to create order');
        toast.error(response.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setPlaceOrderError('Failed to create order. Please try again.');
      toast.error('Failed to create order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    toast.success('Payment successful! Your order has been confirmed.');
    clearCart();
    if (onOrderSuccess) {
      onOrderSuccess({ orderId, paymentData });
    } else {
      navigate('/profile');
    }
  };

  const handlePaymentFailure = (error) => {
    toast.error('Payment failed. Please try again.');
    setShowPaymentSystem(false);
  };

  const renderOrderSummary = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        <List>
          {cartItems.map((item, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar
                                      src={item.image || getPlaceholderImageUrl('product')}
                  alt={item.name}
                  variant="rounded"
                />
              </ListItemAvatar>
              <ListItemText
                primary={item.name}
                secondary={`Quantity: ${item.quantity}`}
              />
              <Typography variant="subtitle1" color="primary">
                ${(item.price * item.quantity).toFixed(2)}
              </Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderDeliveryAddress = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LocationOn color="primary" />
          <Typography variant="h6">Delivery Address</Typography>
        </Box>
        <Typography variant="body1" gutterBottom>
          {orderData?.deliveryAddress?.address}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {orderData?.deliveryAddress?.city}, {orderData?.deliveryAddress?.state} {orderData?.deliveryAddress?.zipCode}
        </Typography>
        <Button
          startIcon={<Edit />}
          size="small"
          onClick={() => navigate('/checkout')}
          sx={{ mt: 1 }}
        >
          Change Address
        </Button>
      </CardContent>
    </Card>
  );

  const renderPaymentSummary = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Payment Summary
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Subtotal:</Typography>
          <Typography>${calculateSubtotal().toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Shipping:</Typography>
          <Typography>${calculateShipping().toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Tax:</Typography>
          <Typography>${calculateTax().toFixed(2)}</Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Total:</Typography>
          <Typography variant="h6" color="primary">
            ${calculateTotal().toFixed(2)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderSpecialInstructions = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Special Instructions
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Any special instructions for delivery..."
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
        />
      </CardContent>
    </Card>
  );

  const renderTermsAndConditions = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <FormControlLabel
          control={
            <Checkbox
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => window.open('/terms', '_blank')}
                sx={{ p: 0, minWidth: 'auto' }}
              >
                Terms and Conditions
              </Button>
              {' '}and{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => window.open('/privacy', '_blank')}
                sx={{ p: 0, minWidth: 'auto' }}
              >
                Privacy Policy
              </Button>
            </Typography>
          }
        />
      </CardContent>
    </Card>
  );

  if (showPaymentSystem && orderId) {
    return (
      <PaymentSystem
        orderData={{
          orderId,
          total: calculateTotal(),
          items: cartItems,
        }}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Review & Pay
        </Typography>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={4}>
          {/* Left Column - Order Details */}
          <Grid item xs={12} md={8}>
            {renderOrderSummary()}
            {renderDeliveryAddress()}
            {renderSpecialInstructions()}
            {renderTermsAndConditions()}

            {placeOrderError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {placeOrderError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                disabled={isPlacingOrder}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !agreeToTerms}
                startIcon={isPlacingOrder ? <CircularProgress size={20} /> : <Payment />}
                sx={{ flexGrow: 1 }}
              >
                {isPlacingOrder ? 'Creating Order...' : 'Place Order & Pay'}
              </Button>
            </Box>
          </Grid>

          {/* Right Column - Payment Summary */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              {renderPaymentSummary()}
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Secure Payment
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Your payment information is encrypted and secure.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Chip icon={<CreditCard />} label="Visa" size="small" />
                    <Chip icon={<CreditCard />} label="MasterCard" size="small" />
                    <Chip icon={<CreditCard />} label="PayPal" size="small" />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default ReviewPayScreen;