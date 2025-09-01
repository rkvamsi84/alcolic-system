import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  LocalOffer,
  CheckCircle,
  Cancel,
  Discount,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { usePromotion } from '../../contexts/PromotionContext';

const PromotionCodeInput = ({ orderAmount, storeId, onPromotionApplied }) => {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { validatePromotionCode, removeAppliedPromotion, appliedPromotion, loading } = usePromotion();

  const handleApplyCode = async () => {
    if (!code.trim()) {
      return;
    }

    setIsValidating(true);
    const result = await validatePromotionCode(code.trim().toUpperCase(), orderAmount, storeId);
    setIsValidating(false);

    if (result && onPromotionApplied) {
      onPromotionApplied(result);
    }
  };

  const handleRemoveCode = () => {
    removeAppliedPromotion();
    setCode('');
    if (onPromotionApplied) {
      onPromotionApplied(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyCode();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getDiscountText = (promotion) => {
    if (promotion.discountType === 'percentage') {
      return `${promotion.discountValue}% OFF`;
    } else if (promotion.discountType === 'fixed_amount') {
      return `${formatCurrency(promotion.discountValue)} OFF`;
    }
    return 'Discount Applied';
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
          <LocalOffer sx={{ mr: 1, color: 'primary.main' }} />
          Promotion Code
        </Typography>

        {appliedPromotion ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Alert 
              severity="success" 
              icon={<CheckCircle />}
              action={
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={handleRemoveCode}
                >
                  <Cancel />
                </IconButton>
              }
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {appliedPromotion.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getDiscountText(appliedPromotion)} - {appliedPromotion.description}
                </Typography>
              </Box>
            </Alert>

            <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
              <Typography variant="h6" color="success.dark" gutterBottom>
                Savings: {formatCurrency(appliedPromotion.discountAmount)}
              </Typography>
              <Typography variant="body2" color="success.dark">
                Final Amount: {formatCurrency(appliedPromotion.finalAmount)}
              </Typography>
            </Box>
          </motion.div>
        ) : (
          <Box>
            <Box display="flex" gap={1} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter promotion code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading || isValidating}
                InputProps={{
                  startAdornment: <Discount sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <Button
                variant="contained"
                onClick={handleApplyCode}
                disabled={!code.trim() || loading || isValidating}
                sx={{ minWidth: 100 }}
              >
                {isValidating ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Apply'
                )}
              </Button>
            </Box>

            {loading && (
              <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Validating promotion code...
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body2" color="text.secondary">
          <strong>How it works:</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          • Enter your promotion code above and click "Apply"
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Valid codes will be automatically applied to your order
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • You can remove applied promotions at any time
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PromotionCodeInput; 