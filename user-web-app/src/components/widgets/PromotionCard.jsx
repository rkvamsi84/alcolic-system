import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  useTheme,
} from '@mui/material';
import {
  LocalOffer as OfferIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getPromotionImageUrl, handleImageError } from '../../utils/imageUtils';

const PromotionCard = ({ promotion, onClick }) => {
  const theme = useTheme();

  const getDiscountText = () => {
    if (promotion.discountType === 'percentage') {
      return `${promotion.discountValue}% OFF`;
    } else if (promotion.discountType === 'fixed') {
      return `$${promotion.discountValue} OFF`;
    } else if (promotion.discountType === 'free_shipping') {
      return 'Free Shipping';
    } else {
      return 'Special Offer';
    }
  };

  const getValidUntil = () => {
    if (promotion.validUntil) {
      const endDate = new Date(promotion.validUntil);
      const now = new Date();
      const diffTime = endDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        if (diffDays === 1) {
          return 'Ends Today';
        } else if (diffDays <= 7) {
          return `${diffDays} days left`;
        } else {
          return 'Active';
        }
      } else {
        return 'Expired';
      }
    }
    return null;
  };

  const promotionImageUrl = getPromotionImageUrl(promotion);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        onClick={onClick}
        sx={{
          height: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': {
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="120"
            image={promotionImageUrl || '/placeholder-promotion.jpg'}
            alt={promotion.title}
            sx={{
              objectFit: 'cover',
              backgroundColor: theme.palette.grey[200],
            }}
            onError={(e) => handleImageError(e, 'promotion')}
          />
          
          {/* Discount Badge */}
          <Chip
            label={getDiscountText()}
            icon={<OfferIcon />}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: theme.palette.error.main,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />

          {/* Time Left Badge */}
          {getValidUntil() && (
            <Chip
              label={getValidUntil()}
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                fontWeight: 500,
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>

        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {promotion.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}>
            {promotion.description}
          </Typography>

          {/* Promotion Details */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {promotion.minimumOrderAmount && (
              <Typography variant="caption" color="text.secondary">
                Min. Order: ${promotion.minimumOrderAmount}
              </Typography>
            )}
            
            {promotion.maximumDiscount && (
              <Typography variant="caption" color="text.secondary">
                Max. Discount: ${promotion.maximumDiscount}
              </Typography>
            )}

            {promotion.usageLimit && (
              <Typography variant="caption" color="text.secondary">
                Usage Limit: {promotion.usageLimit} per customer
              </Typography>
            )}
          </Box>

          {/* Terms and Conditions */}
          {promotion.terms && (
                      <Typography variant="caption" color="text.secondary" sx={{ 
            display: 'block', 
            mt: 1,
            fontStyle: 'italic',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
              Terms: {promotion.terms}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PromotionCard; 