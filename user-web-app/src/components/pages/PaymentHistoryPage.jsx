import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Receipt,
  CreditCard,
  AccountBalance,
  LocalShipping,
  Cancel,
  CheckCircle,
  Error,
  Schedule,
  Visibility,
  FilterList,
  Refresh,
  TrendingUp,
  AttachMoney,
  Payment
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { apiService, ENDPOINTS } from '../../config/api';
import toast from 'react-hot-toast';

const PaymentHistoryPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    method: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // Dialog states
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [refundDialog, setRefundDialog] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);

  // Fetch payment history
  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare query parameters with proper type conversion
      const params = {
        page: parseInt(pagination.page),
        limit: parseInt(pagination.limit)
      };
      
      // Add filters only if they have values
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params[key] = value;
        }
      });
      
      const response = await apiService.get(ENDPOINTS.paymentHistory.getAll, { params });
      
      if (response.success) {
        setPayments(response.data.payments);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch payment history');
      }
    } catch (err) {
      console.error('Payment history error:', err);
      setError('Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment statistics
  const fetchStats = async () => {
    try {
      const response = await apiService.get(ENDPOINTS.paymentHistory.getStats);
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle filter reset
  const handleFilterReset = () => {
    setFilters({
      status: '',
      method: '',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle payment details view
  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  // Handle refund request
  const handleRefundRequest = async () => {
    if (!refundReason.trim()) {
      toast.error('Please provide a refund reason');
      return;
    }

    try {
      setRefundLoading(true);
      // Send reason as query parameter as expected by backend
      const response = await apiService.post(
        `${ENDPOINTS.paymentHistory.refund(selectedPayment.id)}?reason=${encodeURIComponent(refundReason)}`
      );

      if (response.success) {
        toast.success('Refund request submitted successfully');
        setRefundDialog(false);
        setRefundReason('');
        fetchPaymentHistory();
        fetchStats();
      } else {
        toast.error(response.message || 'Failed to submit refund request');
      }
    } catch (err) {
      console.error('Refund error:', err);
      toast.error('Failed to submit refund request');
    } finally {
      setRefundLoading(false);
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return <CreditCard />;
      case 'paypal':
        return <AccountBalance />;
      case 'upi':
        return <AccountBalance />;
      case 'cash':
        return <LocalShipping />;
      default:
        return <Payment />;
    }
  };

  // Get payment status icon and color
  const getPaymentStatusInfo = (status) => {
    switch (status) {
      case 'paid':
        return { icon: <CheckCircle />, color: 'success', label: 'Paid' };
      case 'pending':
        return { icon: <Schedule />, color: 'warning', label: 'Pending' };
      case 'failed':
        return { icon: <Error />, color: 'error', label: 'Failed' };
      case 'refunded':
        return { icon: <Receipt />, color: 'info', label: 'Refunded' };
      case 'cancelled':
        return { icon: <Cancel />, color: 'default', label: 'Cancelled' };
      default:
        return { icon: <Schedule />, color: 'default', label: status };
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchPaymentHistory();
    fetchStats();
  }, [pagination.page, filters]);

  if (loading && payments.length === 0) {
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
          Payment History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your payment transactions
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Payments
                    </Typography>
                    <Typography variant="h4">
                      {stats.overview.totalPayments}
                    </Typography>
                  </Box>
                  <Receipt color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Spent
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(stats.overview.totalAmount)}
                    </Typography>
                  </Box>
                  <AttachMoney color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Successful
                    </Typography>
                    <Typography variant="h4">
                      {stats.overview.successfulPayments}
                    </Typography>
                  </Box>
                  <CheckCircle color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Refunded
                    </Typography>
                    <Typography variant="h4">
                      {stats.overview.refundedPayments}
                    </Typography>
                  </Box>
                  <Cancel color="error" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6" display="flex" alignItems="center">
              <FilterList sx={{ mr: 1 }} />
              Filters
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleFilterReset}
            >
              Reset
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Method</InputLabel>
                <Select
                  value={filters.method}
                  onChange={(e) => handleFilterChange('method', e.target.value)}
                  label="Method"
                >
                  <MenuItem value="">All Methods</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Start Date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="End Date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="createdAt">Date</MenuItem>
                  <MenuItem value="amount.total">Amount</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="method">Method</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort Order</InputLabel>
                <Select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  label="Sort Order"
                >
                  <MenuItem value="desc">Newest First</MenuItem>
                  <MenuItem value="asc">Oldest First</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Payment List */}
      <AnimatePresence>
        {payments.map((payment, index) => {
          const statusInfo = getPaymentStatusInfo(payment.status);
          
          return (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                        {getPaymentMethodIcon(payment.method)}
                        <Typography variant="h6" component="span">
                          Order #{payment.orderNumber}
                        </Typography>
                        <Chip
                          icon={statusInfo.icon}
                          label={statusInfo.label}
                          color={statusInfo.color}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {formatDate(payment.createdAt)}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={2} sx={{ mt: 1 }}>
                        <Typography variant="h6" color="primary">
                          {formatCurrency(payment.amount.total)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          via {payment.method.toUpperCase()}
                        </Typography>
                        {payment.transactionId && (
                          <Typography variant="body2" color="text.secondary">
                            TXN: {payment.transactionId}
                          </Typography>
                        )}
                      </Box>
                      
                      {payment.store && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Store: {payment.store}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(payment)}
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
                      
                      {payment.status === 'paid' && payment.orderStatus === 'delivered' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setRefundDialog(true);
                          }}
                        >
                          Refund
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Empty State */}
      {!loading && payments.length === 0 && (
        <Box textAlign="center" py={4}>
          <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No payments found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your payment history will appear here once you make transactions.
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Payment Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Payment Details
          <IconButton
            onClick={() => setDetailsOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Cancel />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Order Information
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Order Number:</strong> {selectedPayment.orderNumber}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Order Status:</strong> {selectedPayment.orderStatus}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Store:</strong> {selectedPayment.store}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Transaction ID:</strong> {selectedPayment.transactionId}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Payment Information
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Method:</strong> {selectedPayment.method.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Status:</strong> {selectedPayment.status}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Date:</strong> {formatDate(selectedPayment.createdAt)}
                  </Typography>
                  {selectedPayment.paidAt && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Paid At:</strong> {formatDate(selectedPayment.paidAt)}
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Amount Breakdown
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Subtotal: {formatCurrency(selectedPayment.amount.subtotal)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Tax: {formatCurrency(selectedPayment.amount.tax)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Delivery Fee: {formatCurrency(selectedPayment.amount.deliveryFee)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Discount: {formatCurrency(selectedPayment.amount.discount)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary">
                        Total: {formatCurrency(selectedPayment.amount.total)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog
        open={refundDialog}
        onClose={() => setRefundDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request Refund</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Are you sure you want to request a refund for this payment?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Refund Reason"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Please provide a reason for the refund..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRefundRequest}
            variant="contained"
            color="error"
            disabled={refundLoading || !refundReason.trim()}
          >
            {refundLoading ? <CircularProgress size={20} /> : 'Submit Refund'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentHistoryPage;