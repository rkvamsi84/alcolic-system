import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  ArrowBack,
  Payment,
  CreditCard,
  AccountBalance,
  LocalShipping,
  CheckCircle,
  Error,
  Receipt,
  Security,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiService } from '../../config/api';

const PaymentSystem = ({ orderData, onPaymentSuccess, onPaymentFailure }) => {
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(null);
  
  // Card payment fields
  const [cardData, setCardData] = useState({
    holderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  // PayPal fields
  const [paypalEmail, setPaypalEmail] = useState('');

  // UPI fields
  const [upiId, setUpiId] = useState('');

  const paymentMethods = [
    {
      value: 'card',
      label: 'Credit/Debit Card',
      icon: <CreditCard />,
      description: 'Pay with Visa, MasterCard, or American Express',
    },
    {
      value: 'paypal',
      label: 'PayPal',
      icon: <AccountBalance />,
      description: 'Pay with your PayPal account',
    },
    {
      value: 'upi',
      label: 'UPI',
      icon: <Payment />,
      description: 'Pay using UPI ID',
    },
    {
      value: 'cash',
      label: 'Cash on Delivery',
      icon: <LocalShipping />,
      description: 'Pay when you receive your order',
    },
  ];

  const steps = [
    'Payment Method',
    'Payment Details',
    'Confirmation',
  ];

  const validateCardData = () => {
    if (selectedPaymentMethod !== 'card') return true;
    
    const { holderName, cardNumber, expiryDate, cvv } = cardData;
    
    if (!holderName.trim()) {
      toast.error('Please enter card holder name');
      return false;
    }
    
    if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      toast.error('Please enter a valid 16-digit card number');
      return false;
    }
    
    if (!expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      toast.error('Please enter expiry date in MM/YY format');
      return false;
    }
    
    if (!cvv.match(/^\d{3,4}$/)) {
      toast.error('Please enter a valid CVV');
      return false;
    }
    
    return true;
  };

  const validatePaypalData = () => {
    if (selectedPaymentMethod !== 'paypal') return true;
    
    if (!paypalEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Please enter a valid PayPal email');
      return false;
    }
    
    return true;
  };

  const validateUpiData = () => {
    if (selectedPaymentMethod !== 'upi') return true;
    
    if (!upiId.match(/^[a-zA-Z0-9._-]+@[a-zA-Z]{2,}$/)) {
      toast.error('Please enter a valid UPI ID');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!selectedPaymentMethod) {
        toast.error('Please select a payment method');
        return;
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      if (!validateCardData() || !validatePaypalData() || !validateUpiData()) {
        return;
      }
      setActiveStep(2);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    
    switch (field) {
      case 'cardNumber':
        formattedValue = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
        break;
      case 'expiryDate':
        formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
        break;
      case 'cvv':
        formattedValue = value.replace(/\D/g, '');
        break;
      default:
        break;
    }
    
    setCardData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const processPayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const paymentData = {
        orderId: orderData.orderId,
        method: selectedPaymentMethod,
        amount: orderData.total,
        ...(selectedPaymentMethod === 'card' && {
          cardData: {
            holderName: cardData.holderName,
            cardNumber: cardData.cardNumber.replace(/\s/g, ''),
            expiryDate: cardData.expiryDate,
            cvv: cardData.cvv,
          }
        }),
        ...(selectedPaymentMethod === 'paypal' && {
          paypalEmail: paypalEmail
        }),
        ...(selectedPaymentMethod === 'upi' && {
          upiId: upiId
        })
      };

      const response = await apiService.post('/orders/payment', paymentData);

      if (response.success) {
        setPaymentStatus('success');
        toast.success('Payment processed successfully!');
        onPaymentSuccess(response.data);
      } else {
        setPaymentStatus('failed');
        toast.error(response.message || 'Payment failed');
        onPaymentFailure(response.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      toast.error('Payment failed. Please try again.');
      onPaymentFailure(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentMethodStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Payment Method
      </Typography>
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          value={selectedPaymentMethod}
          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
        >
          {paymentMethods.map((method) => (
            <Card key={method.value} sx={{ mb: 2 }}>
              <CardContent>
                <FormControlLabel
                  value={method.value}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {method.icon}
                      <Box>
                        <Typography variant="subtitle1">{method.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {method.description}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );

  const renderPaymentDetailsStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>
      
      {selectedPaymentMethod === 'card' && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Card Holder Name"
              value={cardData.holderName}
              onChange={(e) => handleCardInputChange('holderName', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Card Number"
              value={cardData.cardNumber}
              onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
              placeholder="1234 5678 9012 3456"
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Expiry Date"
              value={cardData.expiryDate}
              onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
              placeholder="MM/YY"
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="CVV"
              value={cardData.cvv}
              onChange={(e) => handleCardInputChange('cvv', e.target.value)}
              placeholder="123"
              required
            />
          </Grid>
        </Grid>
      )}

      {selectedPaymentMethod === 'paypal' && (
        <TextField
          fullWidth
          label="PayPal Email"
          value={paypalEmail}
          onChange={(e) => setPaypalEmail(e.target.value)}
          placeholder="your-email@paypal.com"
          required
        />
      )}

      {selectedPaymentMethod === 'upi' && (
        <TextField
          fullWidth
          label="UPI ID"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="username@upi"
          required
        />
      )}

      {selectedPaymentMethod === 'cash' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          You will pay when you receive your order. No payment information is required.
        </Alert>
      )}
    </Box>
  );

  const renderConfirmationStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Payment Method: {paymentMethods.find(m => m.value === selectedPaymentMethod)?.label}
          </Typography>
          <Typography variant="h6" color="primary">
            Total Amount: ${orderData.total}
          </Typography>
        </CardContent>
      </Card>

      {paymentStatus === 'processing' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Processing payment...</Typography>
        </Box>
      )}

      {paymentStatus === 'success' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Payment successful! Your order has been confirmed.
        </Alert>
      )}

      {paymentStatus === 'failed' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Payment failed. Please try again.
        </Alert>
      )}
    </Box>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderPaymentMethodStep();
      case 1:
        return renderPaymentDetailsStep();
      case 2:
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Payment
        </Typography>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                  <StepContent>
                    {renderStepContent(index)}
                    <Box sx={{ mb: 2, mt: 2 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={index === steps.length - 1 ? processPayment : handleNext}
                          disabled={isProcessing}
                          sx={{ mr: 1 }}
                        >
                          {index === steps.length - 1 ? 'Process Payment' : 'Continue'}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          sx={{ mr: 1 }}
                        >
                          Back
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default PaymentSystem; 