import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  Rating,
  IconButton,
  Tabs,
  Tab,
  Avatar,
  TextField,
  useTheme,
  Skeleton,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  ArrowBack,
  Share,
  WineBar,
  Info,
  Description,
  Reviews,
  Remove,
  Add,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiService, ENDPOINTS } from '../../config/api';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import toast from 'react-hot-toast';
import { getProductImageUrl, getProductImageUrls, handleImageError } from '../../utils/imageUtils';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { cartItems } = useCart();
  const { favorites } = useFavorites();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Fetch product details
  const {
    data: product,
    isLoading,
    error,
  } = useQuery(
    ['product', productId],
    () => apiService.get(ENDPOINTS.products.getById(productId)),
    {
      enabled: !!productId,
    }
  );

  // Fetch product reviews
  const {
    data: reviews,
    isLoading: reviewsLoading,
  } = useQuery(
    ['product-reviews', productId],
    () => apiService.get(ENDPOINTS.reviews.getByProduct(productId)),
    {
      enabled: !!productId,
    }
  );

  // Add to cart mutation
  const addToCartMutation = useMutation(
    (data) => apiService.post(ENDPOINTS.cart.addItem, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['cart']);
        toast.success('Product added to cart!');
        setShowSnackbar(true);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to add to cart');
      },
    }
  );

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation(
    (productId) => apiService.post(ENDPOINTS.favorites.toggle, { productId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['favorites']);
        queryClient.invalidateQueries(['product', productId]);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update favorites');
      },
    }
  );

  useEffect(() => {
    if (product?.data) {
      const productImages = getProductImageUrls(product.data);
      if (productImages.length > 0) {
        setSelectedImage(0);
      }
    }
  }, [product]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={30} />
            <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error.message || 'Failed to load product details'}
        </Alert>
      </Container>
    );
  }

  if (!product?.data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Product not found</Alert>
      </Container>
    );
  }

  const productData = product.data;
  const productImages = getProductImageUrls(productData);
  const currentImageUrl = productImages[selectedImage] || getProductImageUrl(productData);
  const isInFavorites = favorites.some(fav => fav._id === productData._id);
  const cartItem = cartItems.find(item => item._id === productData._id);

  const calculateDiscountedPrice = () => {
    const price = parseFloat(productData.price?.regular || productData.price || 0);
    const discount = parseFloat(productData.discount || 0);
    if (discount > 0) {
      return price - (price * discount / 100);
    }
    return price;
  };

  const discountedPrice = calculateDiscountedPrice();
  const hasDiscount = productData.discount && productData.discount > 0;

  const handleAddToCart = () => {
    addToCartMutation.mutate({
      productId: productData._id,
      quantity: quantity,
    });
  };

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate(productData._id);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (productData.inventory?.quantity || 999)) {
      setQuantity(newQuantity);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
      </Box>

      {/* Product Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Product Details
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleToggleFavorite} color={isInFavorites ? 'primary' : 'default'}>
            {isInFavorites ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
          <IconButton>
            <Share />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #8D1443 0%, #B91C5C 100%)',
                color: 'white',
                borderRadius: 3,
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {currentImageUrl ? (
                <Box
                  component="img"
                  src={currentImageUrl}
                  alt={productData.name}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    objectFit: 'contain',
                    borderRadius: 2,
                  }}
                  onError={(e) => handleImageError(e, 'product')}
                />
              ) : (
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                  }}
                >
                  <WineBar sx={{ fontSize: 80, opacity: 0.5 }} />
                </Box>
              )}
            </Paper>

            {/* Image Gallery */}
            {productImages.length > 1 && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
                {productImages.map((imageUrl, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={imageUrl}
                    alt={`${productData.name} ${index + 1}`}
                    sx={{
                      width: 60,
                      height: 60,
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: selectedImage === index ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      opacity: selectedImage === index ? 1 : 0.7,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        opacity: 1,
                      },
                    }}
                    onClick={() => setSelectedImage(index)}
                    onError={(e) => handleImageError(e, 'product')}
                  />
                ))}
              </Box>
            )}
          </motion.div>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {productData.name}
            </Typography>
            
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {productData.subTitle || productData.description?.substring(0, 100)}
            </Typography>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Rating value={productData.rating?.average || 0} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                ({productData.rating?.count || 0} reviews)
              </Typography>
            </Box>

            {/* Price */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h3" color="primary" fontWeight="bold">
                ${discountedPrice.toFixed(2)}
              </Typography>
              {hasDiscount && (
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ textDecoration: 'line-through' }}
                >
                  ${(productData.price?.regular || productData.price || 0).toFixed(2)}
                </Typography>
              )}
              {hasDiscount && (
                <Chip
                  label={`${productData.discount}% OFF`}
                  color="error"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>

            {/* Stock Status */}
            <Box sx={{ mb: 3 }}>
              <Chip
                label={productData.stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                color={productData.stockStatus === 'in_stock' ? 'success' : 'error'}
                size="small"
                sx={{ mr: 1 }}
              />
              {productData.inventory && (
                <Typography variant="body2" color="text.secondary" component="span">
                  {productData.inventory.quantity} available
                </Typography>
              )}
            </Box>

            {/* Quantity Selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="body1" fontWeight="bold">
                Quantity:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  size="small"
                >
                  <Remove />
                </IconButton>
                <TextField
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1) {
                      handleQuantityChange(value);
                    }
                  }}
                  size="small"
                  sx={{ width: 80 }}
                  inputProps={{ min: 1, style: { textAlign: 'center' } }}
                />
                <IconButton
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= (productData.inventory?.quantity || 999)}
                  size="small"
                >
                  <Add />
                </IconButton>
              </Box>
            </Box>

            {/* Add to Cart Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              disabled={productData.stockStatus !== 'in_stock' || addToCartMutation.isLoading}
              fullWidth
              sx={{ mb: 2 }}
            >
              {addToCartMutation.isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                `Add to Cart - $${(discountedPrice * quantity).toFixed(2)}`
              )}
            </Button>

            {/* Product Details */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Product Details
              </Typography>
              
              <Grid container spacing={2}>
                {productData.brand && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Brand: {productData.brand}
                    </Typography>
                  </Grid>
                )}
                {productData.sku && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      SKU: {productData.sku}
                    </Typography>
                  </Grid>
                )}
                {productData.category && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Category: {productData.category.name}
                    </Typography>
                  </Grid>
                )}
                {productData.specifications?.volume && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Volume: {productData.specifications.volume} {productData.specifications.volumeUnit}
                    </Typography>
                  </Grid>
                )}
                {productData.specifications?.alcoholContent && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Alcohol: {productData.specifications.alcoholContent}%
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </motion.div>
        </Grid>
      </Grid>

      {/* Product Tabs */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Description" icon={<Description />} />
          <Tab label="Reviews" icon={<Reviews />} />
          <Tab label="Details" icon={<Info />} />
        </Tabs>

        {/* Tab Content */}
        {selectedTab === 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {productData.description || 'No description available.'}
            </Typography>
          </Paper>
        )}

        {selectedTab === 1 && (
          <Paper sx={{ p: 3 }}>
            {reviewsLoading ? (
              <CircularProgress />
            ) : reviews?.data?.length > 0 ? (
              <Box>
                {reviews.data.map((review, index) => (
                  <Box key={review._id || index} sx={{ mb: 3, pb: 3, borderBottom: index < reviews.data.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar>{review.user?.name?.charAt(0) || 'U'}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {review.user?.name || 'Anonymous'}
                        </Typography>
                        <Rating value={review.rating} readOnly size="small" />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {review.comment}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No reviews yet. Be the first to review this product!
              </Typography>
            )}
          </Paper>
        )}

        {selectedTab === 2 && (
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Product Specifications
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {productData.specifications && Object.entries(productData.specifications).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Legal Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {productData.legal && Object.entries(productData.legal).map(([key, value]) => (
                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message="Product added to cart successfully!"
      />
    </Container>
  );
};

export default ProductDetailPage;