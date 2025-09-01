import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocalOffer,
  Search,
  Discount,
  AccessTime,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { usePromotion } from '../../contexts/PromotionContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const PromotionCodesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const { promotions, loading, fetchPromotions, validatePromotionCode } = usePromotion();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [applyingCode, setApplyingCode] = useState(null);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  useEffect(() => {
    const filtered = promotions.filter(promotion => 
      promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPromotions(filtered);
  }, [promotions, searchTerm]);

  const handleApplyCode = async (promotion) => {
    if (!user) {
      toast.error('Please login to apply promotion codes');
      return;
    }

    setApplyingCode(promotion._id);
    try {
      // Simulate order amount for testing
      const orderAmount = 100;
      const result = await validatePromotionCode(promotion.code, orderAmount);
      
      if (result) {
        toast.success(`Promotion "${promotion.title}" applied successfully!`);
      }
    } catch (error) {
      console.error('Error applying promotion:', error);
    } finally {
      setApplyingCode(null);
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
    return 'Special Offer';
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Expires soon';
  };

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  const isActive = (promotion) => {
    const now = new Date();
    return promotion.isActive && 
           new Date(promotion.startDate) <= now && 
           new Date(promotion.endDate) >= now;
  };

  if (loading && promotions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Promotion Codes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover and apply exclusive discounts and offers
        </Typography>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search promotion codes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Promotions Grid */}
      <AnimatePresence>
        {filteredPromotions.length === 0 ? (
          <Box textAlign="center" py={4}>
            <LocalOffer sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm ? 'No promotions found' : 'No promotions available'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new offers'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredPromotions.map((promotion, index) => (
              <Grid item xs={12} sm={6} md={4} key={promotion._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      opacity: isExpired(promotion.endDate) ? 0.6 : 1
                    }}
                  >
                    {/* Status Badge */}
                    <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                      {isExpired(promotion.endDate) ? (
                        <Chip 
                          label="Expired" 
                          color="error" 
                          size="small" 
                          icon={<Cancel />}
                        />
                      ) : isActive(promotion) ? (
                        <Chip 
                          label="Active" 
                          color="success" 
                          size="small" 
                          icon={<CheckCircle />}
                        />
                      ) : (
                        <Chip 
                          label="Upcoming" 
                          color="warning" 
                          size="small" 
                          icon={<AccessTime />}
                        />
                      )}
                    </Box>

                    {/* Promotion Image */}
                    {promotion.imageUrl && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={promotion.imageUrl}
                        alt={promotion.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}

                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Discount Badge */}
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={getDiscountText(promotion)}
                          color="primary"
                          variant="filled"
                          icon={<Discount />}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>

                      {/* Title and Description */}
                      <Typography variant="h6" gutterBottom>
                        {promotion.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                        {promotion.description}
                      </Typography>

                      {/* Code */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Code:
                        </Typography>
                        <Chip
                          label={promotion.code}
                          variant="outlined"
                          sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                        />
                      </Box>

                      {/* Terms */}
                      {promotion.minimumOrderAmount > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Min. order: {formatCurrency(promotion.minimumOrderAmount)}
                        </Typography>
                      )}

                      {promotion.usageLimit && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Limited to {promotion.usageLimit} uses
                        </Typography>
                      )}

                      {/* Time Remaining */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {getTimeRemaining(promotion.endDate)}
                      </Typography>

                      {/* Apply Button */}
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleApplyCode(promotion)}
                        disabled={!isActive(promotion) || applyingCode === promotion._id}
                        startIcon={
                          applyingCode === promotion._id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <LocalOffer />
                          )
                        }
                      >
                        {applyingCode === promotion._id ? 'Applying...' : 'Apply Code'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </AnimatePresence>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>How to use promotion codes:</strong>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          • Browse available promotions above
        </Typography>
        <Typography variant="body2">
          • Click "Apply Code" to use a promotion
        </Typography>
        <Typography variant="body2">
          • Promotions will be applied during checkout
        </Typography>
        <Typography variant="body2">
          • Some promotions may have minimum order requirements
        </Typography>
      </Alert>
    </Box>
  );
};

export default PromotionCodesPage; 