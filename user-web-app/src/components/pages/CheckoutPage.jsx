import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  ShoppingCart,
  CreditCard,
  AccountBalance,
  LocalShipping,
  Add as AddIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePromotion } from '../../contexts/PromotionContext';
import { useStore } from '../../contexts/StoreContext';
import { apiService } from '../../config/api';
import { toast } from 'react-hot-toast';
import { getProductImageUrl, getPlaceholderImageUrl } from '../../utils/imageUtils';
import PromotionCodeInput from '../widgets/PromotionCodeInput';
import LocationSelector from '../widgets/LocationSelector';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user, token } = useAuth();
  const { appliedPromotion } = usePromotion();
  const { selectedStore, getSelectedStoreId, hasSelectedStore } = useStore();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.price?.sale || item.price?.regular || item.price || 0;
      return total + (Number(itemPrice) * item.quantity);
    }, 0);
  };

  const calculateShipping = () => {
    if (deliveryOption === 'express') return 10;
    if (deliveryOption === 'same-day') return 15;
    return 5;
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const tax = calculateTax();
    const discount = appliedPromotion ? appliedPromotion.discountAmount : 0;
    return subtotal + shipping + tax - discount;
  };

  const calculateDiscount = () => {
    return appliedPromotion ? appliedPromotion.discountAmount : 0;
  };

  // Mock addresses for demonstration
  const mockAddresses = [
    {
      id: 1,
      type: 'home',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      isDefault: true,
    },
    {
      id: 2,
      type: 'work',
      address: '456 Business Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      isDefault: false,
    },
  ];

  useEffect(() => {
    // Simulate API call to fetch addresses
    setAddresses(mockAddresses);
    if (mockAddresses.length > 0) {
      setSelectedAddress(mockAddresses.find(addr => addr.isDefault) || mockAddresses[0]);
    }
  }, []);

  const handlePlaceOrder = async () => {
    // Check if user is logged in
    if (!user || !token) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    // Check if token is valid
    const storedToken = localStorage.getItem('user_token');
    if (!storedToken) {
      toast.error('Authentication expired. Please login again.');
      navigate('/login');
      return;
    }

    // Ensure API service has the token
    apiService.setToken(storedToken);

    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    setIsPlacingOrder(true);

        try {
      console.log('🔍 Order placement debug:', {
        user: !!user,
        userRole: user?.role,
        userEmail: user?.email,
        token: !!token,
        storedToken: !!localStorage.getItem('user_token'),
        cartItems: cartItems.length
      });
      
      // Check if user has correct role for placing orders
      if (user?.role !== 'customer') {
        console.error('❌ User role issue:', user?.role);
        toast.error(`Cannot place order: You are logged in as ${user?.role}. Please log in as a customer.`);
        setIsPlacingOrder(false);
        return;
      }

      // Validate store selection before placing order
      const storeId = getSelectedStoreId();
      console.log('🔍 Selected store ID:', storeId);
      console.log('🔍 Selected store object:', selectedStore);
      
      if (!storeId) {
        toast.error('Please select a store before placing your order');
        setIsPlacingOrder(false);
        return;
      }

      // Validate that the store ID is valid
      if (!selectedStore || !selectedStore._id) {
        toast.error('Invalid store selection. Please select a store again.');
        setIsPlacingOrder(false);
        return;
      }

      // CRITICAL: Validate that all cart items belong to the selected store
      console.log('🔍 Validating cart items store consistency...');
      for (const item of cartItems) {
        console.log(`🔍 Cart item: ${item.name} - Store: ${item.store || 'No store'}`);
        
        if (item.store && item.store !== storeId) {
          console.error(`❌ Cart item ${item.name} belongs to store ${item.store}, but selected store is ${storeId}`);
          toast.error(`Product ${item.name} does not belong to the selected store. Please update your cart.`);
          setIsPlacingOrder(false);
          return;
        }
      }
      console.log('✅ All cart items validated - store consistency confirmed');

      const orderData = {
        store: storeId, // Use dynamically selected store ID
        items: cartItems.map(item => {
           const itemPrice = item.price?.sale || item.price?.regular || item.price || 0;
           return {
             product: item._id,
             quantity: item.quantity,
             price: Number(itemPrice),
             total: Number(itemPrice) * item.quantity
           };
         }),
         deliveryAddress: {
           type: selectedAddress.type,
           address: selectedAddress.address,
           city: selectedAddress.city,
           state: selectedAddress.state,
           zipCode: selectedAddress.zipCode,
           location: {
             type: 'Point',
             coordinates: [0, 0] // Mock coordinates
           }
         },
         deliveryInfo: {
           method: 'delivery',
           fee: calculateShipping()
         },
         payment: {
           method: selectedPaymentMethod,
           amount: {
             subtotal: calculateSubtotal(),
             tax: calculateTax(),
             deliveryFee: calculateShipping(),
             discount: calculateDiscount(),
             total: calculateTotal()
           }
                   }
        };

      console.log('🔍 Order data being sent:', JSON.stringify(orderData, null, 2));
      console.log('🔍 Store in order data:', orderData.store);
      console.log('🔍 Store validation:', orderData.store === storeId ? '✅ Match' : '❌ Mismatch');

      const response = await apiService.post('/orders', orderData);

      if (response.success) {
        toast.success('Order placed successfully!');
        clearCart();
        // Navigate to order details page with the order ID
        if (response.data && response.data._id) {
          navigate(`/order/${response.data._id}`);
        } else {
          navigate('/profile');
        }
      } else {
        toast.error(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/home')}
            sx={{ mt: 2 }}
          >
            Continue Shopping
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
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Checkout
        </Typography>
        {user && (
          <Chip
            label={`Logged in as: ${user.role}`}
            color={user.role === 'customer' ? 'success' : 'warning'}
            variant="outlined"
            size="small"
          />
        )}
      </Box>

      {/* Role Warning */}
      {user && user.role !== 'customer' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Cannot place orders:</strong> You are logged in as a {user.role} user. 
          Only customers can place orders. Please log out and log in with a customer account.
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Column - Order Details */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Delivery Location */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Delivery Location
                </Typography>
                <LocationSelector showAsCard={false} compact={true} />
              </CardContent>
            </Card>

            {/* Cart Items */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Items ({cartItems.length})
                </Typography>
                {cartItems.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                         <Box
                       component="img"
                       src={getProductImageUrl(item) || getPlaceholderImageUrl('product')}
                       alt={item.name}
                       sx={{
                         width: 60,
                         height: 60,
                         objectFit: 'cover',
                         borderRadius: 1,
                         mr: 2,
                       }}
                     />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {item.quantity} × ${(item.price?.sale || item.price?.regular || item.price || 0).toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="bold">
                      ${((item.price?.sale || item.price?.regular || item.price || 0) * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

                         {/* Delivery Address */}
             <Card sx={{ mb: 3 }}>
               <CardContent>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                   <Typography variant="h6" gutterBottom>
                     Delivery Address
                   </Typography>
                   <Button
                     variant="outlined"
                     size="small"
                     startIcon={<AddIcon />}
                     onClick={() => navigate('/addresses')}
                   >
                     Manage Addresses
                   </Button>
                 </Box>
                 
                 {addresses.length === 0 ? (
                   <Alert severity="info" sx={{ mb: 2 }}>
                     No addresses found. Please add a delivery address.
                   </Alert>
                 ) : (
                   <FormControl component="fieldset" sx={{ width: '100%' }}>
                     <RadioGroup value={selectedAddress?.id || ''} onChange={(e) => {
                       const address = addresses.find(addr => addr.id === parseInt(e.target.value));
                       setSelectedAddress(address);
                     }}>
                       {addresses.map((address) => (
                         <FormControlLabel
                           key={address.id}
                           value={address.id}
                           control={<Radio />}
                           label={
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                               <LocationOn color="primary" />
                               <Box sx={{ flex: 1 }}>
                                 <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                   <Typography variant="body1" fontWeight="medium">
                                     {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                                   </Typography>
                                   {address.isDefault && (
                                     <Chip
                                       label="Default"
                                       size="small"
                                       color="primary"
                                       variant="outlined"
                                       sx={{ ml: 1 }}
                                     />
                                   )}
                                 </Box>
                                 <Typography variant="body2" color="text.secondary">
                                   {address.address}
                                 </Typography>
                                 <Typography variant="body2" color="text.secondary">
                                   {address.city}, {address.state} {address.zipCode}
                                 </Typography>
                               </Box>
                             </Box>
                           }
                         />
                       ))}
                     </RadioGroup>
                   </FormControl>
                 )}
               </CardContent>
             </Card>

             {/* Payment Method */}
             <Card sx={{ mb: 3 }}>
               <CardContent>
                 <Typography variant="h6" gutterBottom>
                   Payment Method
                 </Typography>
                 <FormControl component="fieldset" sx={{ width: '100%' }}>
                   <RadioGroup value={selectedPaymentMethod} onChange={(e) => setSelectedPaymentMethod(e.target.value)}>
                     <FormControlLabel
                       value="card"
                       control={<Radio />}
                       label={
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <CreditCard />
                           <Typography>Credit/Debit Card</Typography>
                         </Box>
                       }
                     />
                     <FormControlLabel
                       value="paypal"
                       control={<Radio />}
                       label={
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <AccountBalance />
                           <Typography>PayPal</Typography>
                         </Box>
                       }
                     />
                     <FormControlLabel
                       value="cash"
                       control={<Radio />}
                       label={
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <LocalShipping />
                           <Typography>Cash on Delivery</Typography>
                         </Box>
                       }
                     />
                   </RadioGroup>
                 </FormControl>
               </CardContent>
             </Card>

            {/* Delivery Options */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Delivery Options
                </Typography>
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <RadioGroup value={deliveryOption} onChange={(e) => setDeliveryOption(e.target.value)}>
                    <FormControlLabel
                      value="standard"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <Typography>Standard Delivery (2-3 days)</Typography>
                          <Typography>${calculateShipping().toFixed(2)}</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="express"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <Typography>Express Delivery (1-2 days)</Typography>
                          <Typography>${calculateShipping().toFixed(2)}</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="same-day"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <Typography>Same Day Delivery</Typography>
                          <Typography>${calculateShipping().toFixed(2)}</Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Right Column - Order Summary */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>

                {/* Promotion Code Input */}
                <PromotionCodeInput 
                  orderAmount={calculateSubtotal()}
                  onPromotionApplied={() => {
                    // Force re-render to update totals
                    setSelectedPaymentMethod(selectedPaymentMethod);
                  }}
                />

                <Box sx={{ mb: 3 }}>
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
                  {appliedPromotion && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography color="success.main">Discount:</Typography>
                      <Typography color="success.main">-${calculateDiscount().toFixed(2)}</Typography>
                    </Box>
                  )}
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Total:
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      ${calculateTotal().toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                  Please review your order before placing it.
                </Alert>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || (user && user.role !== 'customer')}
                  startIcon={isPlacingOrder ? <CircularProgress size={20} /> : null}
                >
                  {isPlacingOrder ? 'Placing Order...' : 
                   (user && user.role !== 'customer') ? `Cannot Place Order (${user.role})` : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;