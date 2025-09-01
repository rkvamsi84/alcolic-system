import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  LocalShipping,
  Home,
  Email,
  Phone,
  Schedule,
  Assignment,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const DeliveryManRegistrationSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { deliveryManData } = location.state || {};

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          {/* Success Icon */}
          <Box sx={{ mb: 3 }}>
            <CheckCircle
              sx={{
                fontSize: 80,
                color: 'success.main',
                mb: 2,
              }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              Application Submitted Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Thank you for applying to become a delivery partner with Alcolic Delivery.
            </Typography>
          </Box>

          {/* Application Details */}
          {deliveryManData && (
            <Card sx={{ mb: 3, textAlign: 'left' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Application Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Application ID
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {deliveryManData._id || 'DM-' + Date.now()}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Applicant Name
                  </Typography>
                  <Typography variant="body1">
                    {deliveryManData.name}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body1">
                    {deliveryManData.email}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Vehicle Type
                  </Typography>
                  <Typography variant="body1">
                    {deliveryManData.vehicleType}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Application Status
                  </Typography>
                  <Chip
                    label="Under Review"
                    color="warning"
                    size="small"
                    icon={<Schedule />}
                  />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="h6" gutterBottom>
              What happens next?
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0 }}>
              <li>
                <Typography variant="body2">
                  Our team will review your application within 2-3 business days
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  You will receive an email notification about your application status
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  If approved, you'll receive onboarding instructions and access to the delivery app
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Background verification and document validation will be conducted
                </Typography>
              </li>
            </Box>
          </Alert>

          {/* Contact Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Need Help?
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                If you have any questions about your application, please contact us:
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  support@alcolic.com
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  +1 (555) 123-4567
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={handleGoHome}
              startIcon={<Home />}
              size="large"
            >
              Go to Home
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleGoToLogin}
              size="large"
            >
              Login to Account
            </Button>
          </Box>

          {/* Additional Information */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <LocalShipping sx={{ mr: 1, verticalAlign: 'middle', fontSize: 18 }} />
              Join thousands of delivery partners earning flexible income with Alcolic Delivery
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default DeliveryManRegistrationSuccessPage;