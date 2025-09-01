import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocalShipping as DeliveryIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const WelcomeScreen = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleStoreRegistration = () => {
    navigate('/store/register');
  };

  const handleStoreLogin = () => {
    navigate('/store/login');
  };

  const handleDeliveryLogin = () => {
    navigate('/delivery/login');
  };

  const handleDeliveryRegistration = () => {
    navigate('/delivery/register');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 4,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.2)',
            }}
          >
            <DeliveryIcon
              sx={{
                fontSize: 60,
                color: theme.palette.primary.main,
              }}
            />
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: isMobile ? '2.5rem' : '3.5rem',
            }}
          >
            Welcome to
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Typography
            variant="h1"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: isMobile ? '3rem' : '4rem',
              background: 'linear-gradient(45deg, #FFFFFF 30%, #F0F0F0 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Alcolic Delivery
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              mb: 4,
              maxWidth: 500,
              lineHeight: 1.6,
            }}
          >
            Your favorite drinks delivered to your door in minutes. 
            Fast, secure, and convenient delivery service.
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2,
              justifyContent: 'center',
            }}
          >
            <Button
              onClick={handleLogin}
              variant="outlined"
              size="large"
              sx={{
                color: 'white',
                borderColor: 'white',
                textTransform: 'none',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Login
            </Button>

            <Button
              onClick={handleSignUp}
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                textTransform: 'none',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              Sign Up
            </Button>
          </Box>
        </motion.div>

        {/* Store Options Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Box
            sx={{
              mt: 4,
              p: 3,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
              }}
            >
              Are you a business owner?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: 3,
                opacity: 0.9,
              }}
            >
              Access your store admin panel or register a new store.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2,
                justifyContent: 'center',
              }}
            >
              <Button
                onClick={handleStoreLogin}
                variant="contained"
                startIcon={<StoreIcon />}
                sx={{
                  backgroundColor: 'white',
                  color: theme.palette.primary.main,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                Store Login
              </Button>
              <Button
                onClick={handleStoreRegistration}
                variant="outlined"
                startIcon={<StoreIcon />}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Register Store
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Delivery Partner Options Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <Box
            sx={{
              mt: 3,
              p: 3,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
              }}
            >
              Want to become a delivery partner?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: 3,
                opacity: 0.9,
              }}
            >
              Join our delivery team and start earning by delivering orders.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2,
                justifyContent: 'center',
              }}
            >
              <Button
                onClick={handleDeliveryLogin}
                variant="contained"
                startIcon={<DeliveryIcon />}
                sx={{
                  backgroundColor: 'white',
                  color: theme.palette.primary.main,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                Delivery Login
              </Button>
              <Button
                onClick={handleDeliveryRegistration}
                variant="outlined"
                startIcon={<DeliveryIcon />}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Become Partner
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            opacity: 0.7,
          }}
        >
          <Typography variant="body2">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
};

export default WelcomeScreen;