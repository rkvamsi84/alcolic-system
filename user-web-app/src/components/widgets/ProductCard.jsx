import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Rating,
  Grid,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Add,
  Remove,
  Star,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getProductImageUrl, handleImageError, getPlaceholderImageUrl } from '../../utils/imageUtils';

const ProductCard = ({ 
  product, 
  viewMode = 'grid', 
  onAddToCart, 
  onToggleFavorite, 
  isInFavorites = false,
  showQuantity = false,
  quantity = 1,
  onQuantityChange
}) => {
  const navigate = useNavigate();

  const calculateDiscountedPrice = () => {
    if (!product) return 0;
    const price = parseFloat(product.price) || 0;
    const discount = parseFloat(product.discount) || 0;
    if (discount > 0) {
      return price - (price * discount / 100);
    }
    return price;
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart({
        ...product,
        quantity: quantity
      });
    }
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(product._id);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const discountedPrice = calculateDiscountedPrice();
  const hasDiscount = product.discount && product.discount > 0;
  const productImageUrl = getProductImageUrl(product);

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          sx={{ 
            mb: 2, 
            cursor: 'pointer',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            }
          }}
          onClick={handleCardClick}
        >
          <Grid container>
            {/* Product Image */}
            <Grid item xs={12} sm={3} md={2}>
              <CardMedia
                component="img"
                height="200"
                image={productImageUrl || getPlaceholderImageUrl('product')}
                alt={product.name}
                sx={{ objectFit: 'contain', p: 2 }}
                onError={(e) => handleImageError(e, 'product')}
              />
            </Grid>

            {/* Product Info */}
            <Grid item xs={12} sm={9} md={10}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {product.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {product.subTitle || product.description?.substring(0, 150)}
                    </Typography>

                    {/* Product Details */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Brand: {product.brand || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        SKU: {product.sku || 'N/A'}
                      </Typography>
                      {product.category && (
                        <Chip 
                          label={product.category.name} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      )}
                    </Box>

                    {/* Price and Rating */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          ${discountedPrice.toFixed(2)}
                        </Typography>
                        {hasDiscount && (
                          <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            ${product.price}
                          </Typography>
                        )}
                      </Box>
                      
                      {product.rating && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={product.rating.average || 0} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            ({product.rating.count || 0})
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Stock Status */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Chip 
                        label={product.stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'} 
                        color={product.stockStatus === 'in_stock' ? 'success' : 'error'} 
                        size="small"
                      />
                      {product.inventory && (
                        <Typography variant="body2" color="text.secondary">
                          {product.inventory.quantity} available
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 120 }}>
                    {showQuantity ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onQuantityChange && quantity > 1) {
                              onQuantityChange(quantity - 1);
                            }
                          }}
                        >
                          <Remove />
                        </IconButton>
                        <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                          {quantity}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onQuantityChange) {
                              onQuantityChange(quantity + 1);
                            }
                          }}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<ShoppingCart />}
                        onClick={handleAddToCart}
                        disabled={product.stockStatus !== 'in_stock'}
                        fullWidth
                      >
                        Add to Cart
                      </Button>
                    )}
                    
                    <IconButton
                      onClick={handleToggleFavorite}
                      color={isInFavorites ? "primary" : "default"}
                      size="small"
                    >
                      {isInFavorites ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease'
          }
        }}
        onClick={handleCardClick}
      >
        {/* Product Image */}
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
                            image={productImageUrl || getPlaceholderImageUrl('product')}
            alt={product.name}
            sx={{ objectFit: 'contain', p: 2 }}
            onError={(e) => handleImageError(e, 'product')}
          />
          
          {/* Discount Badge */}
          {hasDiscount && (
            <Chip
              label={`${product.discount}% OFF`}
              color="error"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                fontWeight: 'bold'
              }}
            />
          )}

          {/* Favorite Button */}
          <IconButton
            onClick={handleToggleFavorite}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,1)'
              }
            }}
            size="small"
          >
            {isInFavorites ? (
              <Favorite color="primary" />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>
        </Box>

        {/* Product Info */}
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {product.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
            {product.subTitle || product.description?.substring(0, 100)}
          </Typography>

          {/* Category and Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {product.category && (
              <Chip 
                label={product.category.name} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
            {product.brand && (
              <Chip 
                label={product.brand} 
                size="small" 
                color="secondary" 
                variant="outlined"
              />
            )}
          </Box>

          {/* Price and Rating */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" color="primary" fontWeight="bold">
                ${discountedPrice.toFixed(2)}
              </Typography>
              {hasDiscount && (
                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  ${product.price}
                </Typography>
              )}
            </Box>
            
            {product.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                <Typography variant="body2" color="text.secondary">
                  {product.rating.average?.toFixed(1) || '0.0'}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Stock Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Chip 
              label={product.stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'} 
              color={product.stockStatus === 'in_stock' ? 'success' : 'error'} 
              size="small"
            />
            {product.inventory && (
              <Typography variant="caption" color="text.secondary">
                {product.inventory.quantity} left
              </Typography>
            )}
          </Box>

          {/* Action Button */}
          <Button
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={handleAddToCart}
            disabled={product.stockStatus !== 'in_stock'}
            fullWidth
          >
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;