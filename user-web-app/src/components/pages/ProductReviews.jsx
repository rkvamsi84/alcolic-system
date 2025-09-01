import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Rating, 
  TextField, 
  Avatar, 
  Chip, 
  Divider, 
  IconButton, 
  Alert, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Star, 
  StarBorder, 
  StarHalf, 
  Edit, 
  Delete, 
  ThumbUp, 
  ThumbDown, 
  Reply, 
  MoreVert,
  Verified,
  PhotoCamera,
  AttachFile
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../config/api';

const ProductReviews = ({ productId, onReviewSubmitted }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  // Review form state
  const [reviewData, setReviewData] = useState({
    rating: 0,
    title: '',
    comment: '',
    pros: '',
    cons: '',
    recommend: true,
    anonymous: false
  });

  // Filter and sort state
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState('recent');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  
  // Confirmation dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/products/${productId}/reviews`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.slice(0, 5); // Limit to 5 images
    setSelectedImages(prev => [...prev, ...newImages]);

    // Create preview URLs
    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    if (reviewData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!reviewData.title.trim() || !reviewData.comment.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('rating', reviewData.rating);
      formData.append('title', reviewData.title);
      formData.append('comment', reviewData.comment);
      formData.append('pros', reviewData.pros);
      formData.append('cons', reviewData.cons);
      formData.append('recommend', reviewData.recommend);
      formData.append('anonymous', reviewData.anonymous);

      selectedImages.forEach((image, index) => {
        formData.append('images', image);
      });

      const endpoint = editingReview 
        ? `/reviews/${editingReview._id}` 
        : `/products/${productId}/reviews`;

      const method = editingReview ? 'PUT' : 'POST';
      
      const response = await apiService.request({
        method,
        url: endpoint,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(editingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
      
      // Reset form
      setReviewData({
        rating: 0,
        title: '',
        comment: '',
        pros: '',
        cons: '',
        recommend: true,
        anonymous: false
      });
      setSelectedImages([]);
      setImagePreview([]);
      setShowReviewForm(false);
      setEditingReview(null);

      // Refresh reviews
      await fetchReviews();
      
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data.review);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewData({
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      pros: review.pros || '',
      cons: review.cons || '',
      recommend: review.recommend,
      anonymous: review.anonymous
    });
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await apiService.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted successfully!');
      await fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const handleLikeReview = async (reviewId, action) => {
    try {
      await apiService.post(`/reviews/${reviewId}/${action}`);
      await fetchReviews(); // Refresh to get updated like counts
    } catch (error) {
      console.error(`Error ${action}ing review:`, error);
      toast.error(`Failed to ${action} review`);
    }
  };

  const handleMenuOpen = (event, review) => {
    setAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReview(null);
  };

  const filteredAndSortedReviews = reviews
    .filter(review => {
      if (filterRating > 0 && review.rating !== filterRating) return false;
      if (showVerifiedOnly && !review.verified) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'rating':
          return b.rating - a.rating;
        case 'helpful':
          return (b.likes - b.dislikes) - (a.likes - a.dislikes);
        default:
          return 0;
      }
    });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0
  }));

  const renderStars = (rating, size = 'small') => {
    return (
      <Rating
        value={rating}
        readOnly
        size={size}
        precision={0.5}
        emptyIcon={<StarBorder />}
        icon={<Star />}
      />
    );
  };

  const renderReviewForm = () => (
    <Dialog 
      open={showReviewForm} 
      onClose={() => setShowReviewForm(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {editingReview ? 'Edit Review' : 'Write a Review'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Overall Rating *
          </Typography>
          <Rating
            value={reviewData.rating}
            onChange={(event, newValue) => {
              setReviewData(prev => ({ ...prev, rating: newValue }));
            }}
            size="large"
            precision={1}
          />

          <TextField
            fullWidth
            label="Review Title *"
            value={reviewData.title}
            onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Your Review *"
            value={reviewData.comment}
            onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
            margin="normal"
            multiline
            rows={4}
            required
          />

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="What you liked"
                value={reviewData.pros}
                onChange={(e) => setReviewData(prev => ({ ...prev, pros: e.target.value }))}
                margin="normal"
                placeholder="e.g., Great quality, fast delivery"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="What you didn't like"
                value={reviewData.cons}
                onChange={(e) => setReviewData(prev => ({ ...prev, cons: e.target.value }))}
                margin="normal"
                placeholder="e.g., Expensive, slow shipping"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Add Photos (Optional)
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              multiple
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoCamera />}
              >
                Upload Images
              </Button>
            </label>
            
            {imagePreview.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {imagePreview.map((preview, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white' }}
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={reviewData.recommend}
                  onChange={(e) => setReviewData(prev => ({ ...prev, recommend: e.target.checked }))}
                />
              }
              label="I recommend this product"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={reviewData.anonymous}
                  onChange={(e) => setReviewData(prev => ({ ...prev, anonymous: e.target.checked }))}
                />
              }
              label="Submit anonymously"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowReviewForm(false)}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmitReview}
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          {submitting ? 'Submitting...' : (editingReview ? 'Update Review' : 'Submit Review')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderReviewCard = (review) => (
    <motion.div
      key={review._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={review.user?.avatar}>
                {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {review.anonymous ? 'Anonymous User' : review.user?.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {renderStars(review.rating)}
                  {review.verified && (
                    <Chip 
                      icon={<Verified />} 
                      label="Verified Purchase" 
                      size="small" 
                      color="success" 
                    />
                  )}
                </Box>
              </Box>
            </Box>
            
            <IconButton onClick={(e) => handleMenuOpen(e, review)}>
              <MoreVert />
            </IconButton>
          </Box>

          <Typography variant="h6" gutterBottom>
            {review.title}
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            {review.comment}
          </Typography>

          {(review.pros || review.cons) && (
            <Box sx={{ mb: 2 }}>
              {review.pros && (
                <Typography variant="body2" sx={{ color: 'success.main', mb: 1 }}>
                  <strong>Pros:</strong> {review.pros}
                </Typography>
              )}
              {review.cons && (
                <Typography variant="body2" sx={{ color: 'error.main', mb: 1 }}>
                  <strong>Cons:</strong> {review.cons}
                </Typography>
              )}
            </Box>
          )}

          {review.images && review.images.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review image ${index + 1}`}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                  onClick={() => window.open(image, '_blank')}
                />
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<ThumbUp />}
                onClick={() => handleLikeReview(review._id, 'like')}
                color={review.userLiked ? 'primary' : 'default'}
              >
                {review.likes || 0}
              </Button>
              <Button
                size="small"
                startIcon={<ThumbDown />}
                onClick={() => handleLikeReview(review._id, 'dislike')}
                color={review.userDisliked ? 'primary' : 'default'}
              >
                {review.dislikes || 0}
              </Button>
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              {new Date(review.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2">
          Customer Reviews
        </Typography>
        {user && (
          <Button
            variant="contained"
            onClick={() => setShowReviewForm(true)}
            startIcon={<Edit />}
          >
            Write a Review
          </Button>
        )}
      </Box>

      {/* Review Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {averageRating.toFixed(1)}
                </Typography>
                {renderStars(averageRating, 'large')}
                <Typography variant="body2" color="text.secondary">
                  Based on {reviews.length} reviews
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Rating Distribution
              </Typography>
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 60 }}>
                    {rating} stars
                  </Typography>
                  <Box sx={{ flex: 1, mx: 2 }}>
                    <Box
                      sx={{
                        height: 8,
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          bgcolor: 'primary.main',
                          width: `${percentage}%`
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ minWidth: 40 }}>
                    {count}
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography variant="subtitle1">Filter by:</Typography>
            </Grid>
            <Grid item>
              <Rating
                value={filterRating}
                onChange={(event, newValue) => setFilterRating(newValue)}
                size="small"
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showVerifiedOnly}
                    onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                  />
                }
                label="Verified purchases only"
              />
            </Grid>
            <Grid item xs />
            <Grid item>
              <TextField
                select
                label="Sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                size="small"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="recent">Most Recent</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="helpful">Most Helpful</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {filteredAndSortedReviews.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No reviews found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to review this product!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {filteredAndSortedReviews.map(renderReviewCard)}
        </Box>
      )}

      {/* Review Form Dialog */}
      {renderReviewForm()}

      {/* Review Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedReview && selectedReview.user?._id === user?._id && (
          <>
            <MenuItem onClick={() => {
              handleEditReview(selectedReview);
              handleMenuClose();
            }}>
              <Edit sx={{ mr: 1 }} />
              Edit Review
            </MenuItem>
            <MenuItem 
              onClick={() => {
                handleDeleteReview(selectedReview._id);
                handleMenuClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Delete sx={{ mr: 1 }} />
              Delete Review
            </MenuItem>
          </>
        )}
        <MenuItem onClick={handleMenuClose}>
          Report Review
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default ProductReviews;