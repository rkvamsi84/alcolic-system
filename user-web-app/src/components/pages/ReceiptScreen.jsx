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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Receipt,
  LocalShipping,
  Payment,
  LocationOn,
  Print,
  Share,
  Download,
  Email,
  Phone,
  Schedule,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiService } from '../../config/api';
import { ALCOLIC_COLORS, TYPOGRAPHY, WEB_CONFIG } from '../../config/unified-config';
import { getPlaceholderImageUrl } from '../../utils/imageUtils';

const ReceiptScreen = ({ orderData, paymentData }) => {
  const navigate = useNavigate();
  const [order, setOrder] = useState(orderData);
  const [isLoading, setIsLoading] = useState(false);

  const orderSteps = [
    {
      label: 'Order Placed',
      description: 'Your order has been confirmed',
      completed: true,
      timestamp: new Date(),
    },
    {
      label: 'Payment Confirmed',
      description: 'Payment has been processed successfully',
      completed: true,
      timestamp: new Date(),
    },
    {
      label: 'Preparing',
      description: 'Your order is being prepared',
      completed: false,
      timestamp: null,
    },
    {
      label: 'Out for Delivery',
      description: 'Your order is on its way',
      completed: false,
      timestamp: null,
    },
    {
      label: 'Delivered',
      description: 'Order delivered successfully',
      completed: false,
      timestamp: null,
    },
  ];

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleShareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Order Confirmation',
        text: `Order #${order?.orderNumber} has been placed successfully!`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Order #${order?.orderNumber} - ${window.location.href}`);
      toast.success('Order link copied to clipboard!');
    }
  };

  const handleDownloadReceipt = () => {
    // Generate PDF receipt (simplified version)
    const receiptContent = `
      Order Receipt
      =============
      Order Number: ${order?.orderNumber}
      Date: ${new Date().toLocaleDateString()}
      Total: $${order?.payment?.amount?.total}
      
      Items:
      ${order?.items?.map(item => `${item.product?.name} x${item.quantity} - $${item.total}`).join('\n')}
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order?.orderNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded!');
  };

  const handleEmailReceipt = () => {
    const subject = `Order Receipt - ${order?.orderNumber}`;
    const body = `Thank you for your order!\n\nOrder Number: ${order?.orderNumber}\nTotal: $${order?.payment?.amount?.total}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const renderOrderHeader = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CheckCircle color="success" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" sx={{ color: ALCOLIC_COLORS.primary, fontWeight: TYPOGRAPHY.weights.bold }}>
              🍷 Order Confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Thank you for choosing Alcolic - Your premium wine delivery service
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Order Number
            </Typography>
            <Typography variant="h5" sx={{ color: ALCOLIC_COLORS.primary, fontFamily: 'monospace', fontWeight: TYPOGRAPHY.weights.bold }}>
              #{order?.orderNumber}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Order Date
            </Typography>
            <Typography variant="body1">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderOrderItems = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        <List>
          {order?.items?.map((item, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar
                                        src={item.product?.image || getPlaceholderImageUrl('product')}
                  alt={item.product?.name}
                  variant="rounded"
                />
              </ListItemAvatar>
              <ListItemText
                primary={item.product?.name}
                secondary={`Quantity: ${item.quantity}`}
              />
              <Typography variant="subtitle1" color="primary">
                ${item.total?.toFixed(2)}
              </Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderPaymentDetails = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Payment Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Payment Method
            </Typography>
            <Typography variant="body1">
              {paymentData?.method === 'card' && 'Credit/Debit Card'}
              {paymentData?.method === 'paypal' && 'PayPal'}
              {paymentData?.method === 'upi' && 'UPI'}
              {paymentData?.method === 'cash' && 'Cash on Delivery'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Payment Status
            </Typography>
            <Chip
              label="Paid"
              color="success"
              size="small"
              icon={<CheckCircle />}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography>${order?.payment?.amount?.subtotal?.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Shipping:</Typography>
              <Typography>${order?.payment?.amount?.deliveryFee?.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Tax:</Typography>
              <Typography>${order?.payment?.amount?.tax?.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">
                ${order?.payment?.amount?.total?.toFixed(2)}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LocationOn color="primary" />
          <Typography variant="subtitle1">Delivery Address</Typography>
        </Box>
        <Typography variant="body1" gutterBottom>
          {order?.deliveryAddress?.address}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {order?.deliveryAddress?.city}, {order?.deliveryAddress?.state} {order?.deliveryAddress?.zipCode}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <Schedule color="primary" />
          <Typography variant="subtitle1">Estimated Delivery</Typography>
        </Box>
        <Typography variant="body1">
          {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderOrderTracking = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Order Status
        </Typography>
        <Stepper orientation="vertical">
          {orderSteps.map((step, index) => (
            <Step key={index} active={step.completed}>
              <StepLabel
                icon={step.completed ? <CheckCircle color="success" /> : index + 1}
              >
                {step.label}
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
                {step.timestamp && (
                  <Typography variant="caption" color="text.secondary">
                    {step.timestamp.toLocaleTimeString()}
                  </Typography>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );

  const renderActionButtons = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Print />}
              onClick={handlePrintReceipt}
            >
              Print
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Share />}
              onClick={handleShareOrder}
            >
              Share
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadReceipt}
            >
              Download
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Email />}
              onClick={handleEmailReceipt}
            >
              Email
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderSupportInfo = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Need Help?
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          If you have any questions about your order, please contact our support team.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <Phone color="primary" />
          <Typography variant="body1">+1 (555) 123-4567</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Email color="primary" />
          <Typography variant="body1">support@alcolic.com</Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate('/profile')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Order Receipt
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
            {renderOrderHeader()}
            {renderOrderItems()}
            {renderPaymentDetails()}
            {renderDeliveryInfo()}
            {renderOrderTracking()}
          </Grid>

          {/* Right Column - Actions & Support */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              {renderActionButtons()}
              {renderSupportInfo()}
              
              <Box sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/profile')}
                  sx={{ mb: 2 }}
                >
                  View All Orders
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/home')}
                >
                  Continue Shopping
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default ReceiptScreen;