import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Home,
  Email,
  Schedule,
  Visibility,
  Store,
  Person,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const StoreRegistrationSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { storeData, message } = location.state || {};

  if (!storeData) {
    navigate('/register-store');
    return null;
  }

  const nextSteps = [
    {
      icon: <Email />,
      title: 'Check Your Email',
      description: 'We\'ll send you updates about your application status'
    },
    {
      icon: <Schedule />,
      title: 'Review Process',
      description: 'Our team will review your application within 2-3 business days'
    },
    {
      icon: <Visibility />,
      title: 'Verification',
      description: 'We may contact you for additional verification documents'
    },
    {
      icon: <CheckCircle />,
      title: 'Approval',
      description: 'Once approved, you\'ll receive login credentials for the store admin panel'
    }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Success Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle 
              sx={{ 
                fontSize: 80, 
                color: 'success.main', 
                mb: 2 
              }} 
            />
          </motion.div>
          <Typography variant="h3" component="h1" gutterBottom>
            Registration Submitted!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {message || 'Your store registration has been submitted successfully.'}
          </Typography>
        </Box>

        {/* Success Alert */}
        <Alert severity="success" sx={{ mb: 4 }}>
          <Typography variant="body1">
            <strong>Application ID:</strong> {storeData.store._id}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please save this ID for your records. You can use it to track your application status.
          </Typography>
        </Alert>

        {/* Store Information Summary */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Application Summary
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Store sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Store Details
                </Typography>
                <Typography><strong>Name:</strong> {storeData.store.name}</Typography>
                <Typography><strong>Status:</strong> 
                  <Box component="span" sx={{ 
                    ml: 1, 
                    px: 1, 
                    py: 0.5, 
                    bgcolor: 'warning.light', 
                    color: 'warning.contrastText',
                    borderRadius: 1,
                    fontSize: '0.75rem'
                  }}>
                    {storeData.store.status.toUpperCase()}
                  </Box>
                </Typography>
                <Typography><strong>Email:</strong> {storeData.store.contactInfo.email}</Typography>
                <Typography><strong>Phone:</strong> {storeData.store.contactInfo.phone}</Typography>
                <Typography><strong>Address:</strong> {storeData.store.address.street}, {storeData.store.address.city}, {storeData.store.address.state} {storeData.store.address.zipCode}</Typography>
              </CardContent>
            </Card>
          </Box>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                Owner Information
              </Typography>
              <Typography><strong>Name:</strong> {storeData.owner.name}</Typography>
              <Typography><strong>Email:</strong> {storeData.owner.email}</Typography>
              <Typography><strong>Phone:</strong> {storeData.owner.phone}</Typography>
            </CardContent>
          </Card>
        </Paper>

        {/* Next Steps */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            What Happens Next?
          </Typography>
          
          <List>
            {nextSteps.map((step, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    <Box sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white', 
                      borderRadius: '50%', 
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {step.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={step.title}
                    secondary={step.description}
                  />
                </ListItem>
                {index < nextSteps.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {/* Important Information */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Important Information:</strong>
          </Typography>
          <Typography variant="body2">
            • Keep your application ID safe for future reference<br />
            • Check your email regularly for updates<br />
            • Ensure your phone is available for verification calls<br />
            • Have your business documents ready if requested<br />
            • You'll receive store admin panel access once approved
          </Typography>
        </Alert>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            size="large"
          >
            Back to Home
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/register-store')}
            size="large"
          >
            Register Another Store
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
};

export default StoreRegistrationSuccessPage;