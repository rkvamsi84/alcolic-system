import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocalShipping as DeliveryIcon,
  Security as SecurityIcon,
  FlashOn as SpeedIcon,
  Favorite as QualityIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const OnboardingScreen = ({ onComplete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Fast Delivery',
      subtitle: 'Get your favorite drinks delivered to your door in minutes',
      icon: <DeliveryIcon sx={{ fontSize: 80, color: 'white' }} />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Secure Payments',
      subtitle: 'Safe and secure payment methods for your convenience',
      icon: <SecurityIcon sx={{ fontSize: 80, color: 'white' }} />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'Quick & Easy',
      subtitle: 'Order with just a few taps and track your delivery in real-time',
      icon: <SpeedIcon sx={{ fontSize: 80, color: 'white' }} />,
      color: '#4CAF50',
    },
    {
      title: 'Premium Quality',
      subtitle: 'Only the finest selection of drinks from top brands',
      icon: <QualityIcon sx={{ fontSize: 80, color: 'white' }} />,
      color: '#FF9800',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('onboarding_seen', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_seen', 'true');
    onComplete();
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: steps[currentStep].color,
        color: 'white',
        overflow: 'hidden',
      }}
    >
      {/* Skip Button */}
      <Box sx={{ p: 3, textAlign: 'right' }}>
        <Button
          onClick={handleSkip}
          sx={{
            color: 'white',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Skip
        </Button>
      </Box>

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
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ mb: 4 }}>
              {steps[currentStep].icon}
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: isMobile ? '2rem' : '3rem',
              }}
            >
              {steps[currentStep].title}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                opacity: 0.9,
                mb: 4,
                maxWidth: 400,
                lineHeight: 1.5,
              }}
            >
              {steps[currentStep].subtitle}
            </Typography>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Navigation */}
      <Box sx={{ p: 4 }}>
        {/* Dots */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mb: 3,
          }}
        >
          {steps.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: index === currentStep ? 'white' : 'rgba(255, 255, 255, 0.3)',
                transition: 'background-color 0.3s',
              }}
            />
          ))}
        </Box>

        {/* Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            sx={{
              color: 'white',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&:disabled': {
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Previous
          </Button>

          <Button
            onClick={handleNext}
            variant="contained"
            sx={{
              backgroundColor: 'white',
              color: steps[currentStep].color,
              textTransform: 'none',
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default OnboardingScreen; 