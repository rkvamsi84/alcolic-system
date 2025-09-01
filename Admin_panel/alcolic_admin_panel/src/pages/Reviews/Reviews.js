import { Box, Typography, Grid, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip, Button, TextField, Select, MenuItem, FormControl, InputLabel, Rating, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Switch, FormControlLabel, Tabs, Tab, Alert, CircularProgress, Pagination, useTheme } from "@mui/material";
import { Star, FilterList, Search, Block, Close, Visibility, Gavel, Flag, Check, Refresh } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php';

const getStatusColor = (status) => {
  switch (status) {
    case "published": return "success";
    case "hidden": return "default";
    case "reported": return "error";
    case "pending": return "warning";
    case "rejected": return "error";
    default: return "default";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "published": return "Published";
    case "hidden": return "Hidden";
    case "reported": return "Reported";
    case "pending": return "Pending";
    case "rejected": return "Rejected";
    default: return status;
  }
};

export default function Reviews() {
  const theme = useTheme();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [moderateDialogOpen, setModerateDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [moderateTab, setModerateTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Moderate form states
  const [moderationAction, setModerationAction] = useState("approve");
  const [moderationReason, setModerationReason] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [moderating, setModerating] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
  };

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (ratingFilter !== 'all') params.append('rating', ratingFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`${API_BASE_URL}/reviews/admin?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, typeFilter, ratingFilter, searchTerm]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      await axios.get(`${API_BASE_URL}/reviews/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  // Moderate review
  const handleModerateSubmit = async () => {
    try {
      setModerating(true);
      
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required");
        return;
      }

      await axios.put(`${API_BASE_URL}/reviews/${selectedReview._id}/moderate`, {
        action: moderationAction,
        reason: moderationReason,
        sendEmail,
        emailMessage
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Refresh data
      await fetchReviews();
      await fetchStats();
      
      // Reset form and close dialog
      setModerationAction("approve");
      setModerationReason("");
      setSendEmail(false);
      setEmailMessage("");
      setModerateDialogOpen(false);
      setSelectedReview(null);
      
      // Show success message
      alert("Review moderated successfully!");
    } catch (err) {
      console.error('Error moderating review:', err);
      setError(err.response?.data?.message || 'Failed to moderate review');
    } finally {
      setModerating(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [fetchReviews, fetchStats]);

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
  };

  const handleMoreFilters = () => {
    setFiltersDialogOpen(true);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setRatingFilter("all");
    setDateFilter("");
    setFiltersDialogOpen(false);
  };

  const handleModerate = () => {
    setModerateDialogOpen(true);
  };

  const handleModerateCancel = () => {
    setModerateDialogOpen(false);
    setSelectedReview(null);
    // Reset form
    setModerationAction("approve");
    setModerationReason("");
    setSendEmail(false);
    setEmailMessage("");
  };

  const handleModerateReview = (review) => {
    setSelectedReview(review);
    setModerateDialogOpen(true);
  };

  const pendingReviews = reviews.filter(r => r.status === "pending" || r.status === "reported");
  const publishedReviews = reviews.filter(r => r.status === "published");

  if (loading && reviews.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Reviews & Feedback</Typography>
        <Box display="flex" gap={2}>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={() => {
              fetchReviews();
              fetchStats();
            }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Gavel />}
            onClick={handleModerate}
          >
            Moderate ({pendingReviews.length})
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="Search Reviews" 
              variant="outlined" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              InputProps={{ 
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> 
              }} 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select 
                value={statusFilter} 
                label="Status Filter" 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="hidden">Hidden</MenuItem>
                <MenuItem value="reported">Reported</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              variant="outlined" 
              startIcon={<FilterList />} 
              fullWidth
              onClick={handleMoreFilters}
            >
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <List>
        {reviews.map((r) => (
          <ListItem key={r._id} alignItems="flex-start" sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
            <ListItemAvatar>
              <Avatar><Star /></Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {r.type.charAt(0).toUpperCase() + r.type.slice(1)}: {
                      r.productId?.name || 
                      r.storeId?.name || 
                      r.driverId?.name || 
                      r.orderId?.orderNumber || 
                      'Unknown'
                    }
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {r.reviewer?.name || 'Anonymous'} • {new Date(r.createdAt).toLocaleDateString()}
                  </Typography>
                </>
              }
              secondary={
                <>
                  <Rating value={r.rating} readOnly size="small" />
                  <Typography variant="body2">{r.comment}</Typography>
                </>
              }
            />
            <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
              <Chip label={getStatusLabel(r.status)} color={getStatusColor(r.status)} size="small" />
              {r.reported && <Chip label="Reported" color="error" size="small" icon={<Flag />} />}
              <Box display="flex" gap={1}>
                <Button 
                  size="small" 
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => handleViewReview(r)}
                >
                  View
                </Button>
                {(r.status === "pending" || r.status === "reported") && (
                  <Button 
                    size="small" 
                    variant="outlined"
                    color="warning"
                    startIcon={<Gavel />}
                    onClick={() => handleModerateReview(r)}
                  >
                    Moderate
                  </Button>
                )}
              </Box>
            </Box>
          </ListItem>
        ))}
      </List>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* Review Moderation Dialog */}
      <Dialog open={!!moderateDialogOpen} onClose={handleModerateCancel} maxWidth="md" fullWidth>
        <DialogTitle>
          Review Moderation
          <IconButton
            aria-label="close"
            onClick={handleModerateCancel}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={moderateTab} onChange={(e, newValue) => setModerateTab(newValue)}>
              <Tab label={`Pending (${pendingReviews.length})`} />
              <Tab label={`Published (${publishedReviews.length})`} />
            </Tabs>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            {moderateTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Pending Reviews</Typography>
                {pendingReviews.length === 0 ? (
                  <Typography color="textSecondary">No pending reviews to moderate.</Typography>
                ) : (
                  <List>
                    {pendingReviews.map((review) => (
                      <ListItem key={review._id} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1, mb: 1 }}>
                        <ListItemAvatar>
                          <Avatar><Star /></Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                {review.type.charAt(0).toUpperCase() + review.type.slice(1)}: {
                                  review.productId?.name || 
                                  review.storeId?.name || 
                                  review.driverId?.name || 
                                  review.orderId?.orderNumber || 
                                  'Unknown'
                                }
                              </div>
                              <div style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                                by {review.reviewer?.name || 'Anonymous'} • {new Date(review.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          }
                          secondary={
                            <div>
                              <Rating value={review.rating} readOnly size="small" />
                              <div style={{ fontSize: '0.875rem', marginTop: '4px' }}>{review.comment}</div>
                            </div>
                          }
                        />
                        <Box display="flex" gap={1}>
                          <Button 
                            size="small" 
                            variant="outlined"
                            color="success"
                            startIcon={<Check />}
                            onClick={() => handleModerateReview(review)}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="small" 
                            variant="outlined"
                            color="error"
                            startIcon={<Block />}
                            onClick={() => handleModerateReview(review)}
                          >
                            Reject
                          </Button>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}
            
            {moderateTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>Published Reviews</Typography>
                <List>
                  {publishedReviews.slice(0, 5).map((review) => (
                    <ListItem key={review._id} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1, mb: 1 }}>
                      <ListItemAvatar>
                        <Avatar><Star /></Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                              {review.type.charAt(0).toUpperCase() + review.type.slice(1)}: {
                                review.productId?.name || 
                                review.storeId?.name || 
                                review.driverId?.name || 
                                review.orderId?.orderNumber || 
                                'Unknown'
                              }
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                              by {review.reviewer?.name || 'Anonymous'} • {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        }
                        secondary={
                          <div>
                            <Rating value={review.rating} readOnly size="small" />
                            <div style={{ fontSize: '0.875rem', marginTop: '4px' }}>{review.comment}</div>
                          </div>
                        }
                      />
                      <Button 
                        size="small" 
                        variant="outlined"
                        color="warning"
                        startIcon={<Block />}
                        onClick={() => handleModerateReview(review)}
                      >
                        Hide
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModerateCancel}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Individual Review Moderation Dialog */}
      <Dialog open={!!(selectedReview && moderateDialogOpen)} onClose={handleModerateCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          Moderate Review
          <IconButton
            aria-label="close"
            onClick={handleModerateCancel}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box sx={{ mt: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ mr: 2 }}><Star /></Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">
                    {selectedReview.type.charAt(0).toUpperCase() + selectedReview.type.slice(1)}: {
                      selectedReview.productId?.name || 
                      selectedReview.storeId?.name || 
                      selectedReview.driverId?.name || 
                      selectedReview.orderId?.orderNumber || 
                      'Unknown'
                    }
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    by {selectedReview.reviewer?.name || 'Anonymous'}
                  </Typography>
                </Box>
                <Chip 
                  label={getStatusLabel(selectedReview.status)} 
                  color={getStatusColor(selectedReview.status)} 
                  size="small"
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Rating value={selectedReview.rating} readOnly size="large" />
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {selectedReview.comment}
                </Typography>
              </Box>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Action</InputLabel>
                <Select 
                  value={moderationAction} 
                  label="Action" 
                  onChange={(e) => setModerationAction(e.target.value)}
                >
                  <MenuItem value="approve">Approve & Publish</MenuItem>
                  <MenuItem value="reject">Reject & Delete</MenuItem>
                  <MenuItem value="hide">Hide Review</MenuItem>
                  <MenuItem value="flag">Flag for Review</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Reason (Optional)"
                variant="outlined"
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={sendEmail} 
                    onChange={(e) => setSendEmail(e.target.checked)} 
                  />
                }
                label="Send email notification to reviewer"
                sx={{ mb: 2 }}
              />
              
              {sendEmail && (
                <TextField
                  fullWidth
                  label="Email Message"
                  variant="outlined"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Your review has been moderated..."
                  sx={{ mb: 2 }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModerateCancel}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleModerateSubmit}
            disabled={moderating}
            startIcon={moderating ? <CircularProgress size={20} /> : null}
          >
            {moderating ? 'Moderating...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* More Filters Dialog */}
      <Dialog open={!!filtersDialogOpen} onClose={() => setFiltersDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>More Filters</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Review Type</InputLabel>
              <Select 
                value={typeFilter} 
                label="Review Type" 
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="product">Product</MenuItem>
                <MenuItem value="store">Store</MenuItem>
                <MenuItem value="driver">Driver</MenuItem>
                <MenuItem value="order">Order</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rating</InputLabel>
              <Select 
                value={ratingFilter} 
                label="Rating" 
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <MenuItem value="all">All Ratings</MenuItem>
                <MenuItem value="5">5 Stars</MenuItem>
                <MenuItem value="4">4 Stars</MenuItem>
                <MenuItem value="3">3 Stars</MenuItem>
                <MenuItem value="2">2 Stars</MenuItem>
                <MenuItem value="1">1 Star</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Date Filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearFilters}>Clear All</Button>
          <Button variant="contained" onClick={() => setFiltersDialogOpen(false)}>Apply Filters</Button>
        </DialogActions>
      </Dialog>

      {/* View Review Dialog */}
      <Dialog open={!!viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Review Details
          <IconButton
            aria-label="close"
            onClick={() => setViewDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box sx={{ mt: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ mr: 2 }}><Star /></Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">
                    {selectedReview.type.charAt(0).toUpperCase() + selectedReview.type.slice(1)}: {
                      selectedReview.productId?.name || 
                      selectedReview.storeId?.name || 
                      selectedReview.driverId?.name || 
                      selectedReview.orderId?.orderNumber || 
                      'Unknown'
                    }
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    by {selectedReview.reviewer?.name || 'Anonymous'}
                  </Typography>
                </Box>
                <Chip 
                  label={getStatusLabel(selectedReview.status)} 
                  color={getStatusColor(selectedReview.status)} 
                  size="small"
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Rating value={selectedReview.rating} readOnly size="large" />
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {selectedReview.comment}
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Reviewer</Typography>
                  <Typography variant="body2">{selectedReview.reviewer?.name || 'Anonymous'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                  <Typography variant="body2">{selectedReview.reviewer?.email || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Date</Typography>
                  <Typography variant="body2">{new Date(selectedReview.createdAt).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Rating</Typography>
                  <Typography variant="body2">{selectedReview.rating}/5</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Typography variant="body2">{getStatusLabel(selectedReview.status)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Helpful Votes</Typography>
                  <Typography variant="body2">{selectedReview.helpful}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {(selectedReview?.status === "pending" || selectedReview?.status === "reported") && (
            <Button 
              variant="contained" 
              color="warning"
              startIcon={<Gavel />}
              onClick={() => {
                setViewDialogOpen(false);
                handleModerateReview(selectedReview);
              }}
            >
              Moderate
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}