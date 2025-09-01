import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const PageContainer = ({ title, children }) => {
  const theme = useTheme();

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        gap: 2,
        p: { xs: 1, sm: 2 },
      }}
    >
      {title && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            py: 1,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}
          >
            {title}
          </Typography>
        </Box>
      )}

      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        sx={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          borderRadius: theme.shape.borderRadius,
          bgcolor: 'background.paper',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.divider,
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme.palette.text.disabled,
          },
        }}
      >
        <Box sx={{ 
          p: { xs: 1, sm: 2 }, 
          width: '100%',
          flex: 1,
          minHeight: 0,
        }}>
          {children}
        </Box>
      </MotionBox>
    </MotionBox>
  );
};

export default PageContainer; 