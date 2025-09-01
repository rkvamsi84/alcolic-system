import { Box, Typography, Grid, Card, CardContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Select, MenuItem, FormControl, InputLabel, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, Pagination, IconButton, Tooltip } from "@mui/material";
import { Search, FilterList, Download, Refresh, Visibility } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const getStatusColor = (status) => {
  switch (status) {
    case "paid": return "success";
    case "pending": return "warning";
    case "failed": return "error";
    case "refunded": return "info";
    default: return "default";
  }
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php';

export default function Payments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    successfulCount: 0,
    pendingCount: 0,
    failedCount: 0,
    totalAmount: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Fetch transactions data
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (methodFilter !== 'all') params.append('method', methodFilter);

      const response = await axios.get(`${API_BASE_URL}/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setTransactions(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter, methodFilter]);

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/transactions/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle status filter
  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle method filter
  const handleMethodFilter = (event) => {
    setMethodFilter(event.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Export transactions as CSV
  const handleExport = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (methodFilter !== 'all') params.append('method', methodFilter);

      const response = await axios.get(`${API_BASE_URL}/transactions/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      setError('Failed to export transactions');
    }
  };

  // Open transaction details modal
  const handleViewDetails = async (transaction) => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/transactions/${transaction.orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSelectedTxn(response.data.data);
        setDetailsOpen(true);
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      setError('Failed to fetch transaction details');
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedTxn(null);
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [fetchTransactions]);

  if (loading && transactions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Payments & Transactions</Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={() => { fetchTransactions(); fetchStats(); }} sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Download />} onClick={handleExport}>
            Export
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Transactions</Typography>
              <Typography variant="h4">{stats.totalTransactions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Successful</Typography>
              <Typography variant="h4" color="success.main">{stats.successfulCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Pending</Typography>
              <Typography variant="h4" color="warning.main">{stats.pendingCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Amount</Typography>
              <Typography variant="h4">${stats.totalAmount?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Transactions"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select value={statusFilter} label="Status Filter" onChange={handleStatusFilter}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Method Filter</InputLabel>
              <Select value={methodFilter} label="Method Filter" onChange={handleMethodFilter}>
                <MenuItem value="all">All Methods</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="digital_wallet">Digital Wallet</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button variant="outlined" startIcon={<FilterList />} fullWidth>
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Transactions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell>{txn.id}</TableCell>
                <TableCell>{txn.order}</TableCell>
                <TableCell>{txn.customer}</TableCell>
                <TableCell>
                  <Chip 
                    label={txn.method} 
                    color="primary" 
                    size="small" 
                  />
                </TableCell>
                <TableCell>${txn.amount?.toFixed(2)}</TableCell>
                <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={txn.status} 
                    color={getStatusColor(txn.status)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<Visibility />}
                    onClick={() => handleViewDetails(txn)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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

      {/* Transaction Details Modal */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent dividers>
          {selectedTxn && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1"><b>Transaction ID:</b> {selectedTxn.id}</Typography>
                  <Typography variant="subtitle1"><b>Order ID:</b> {selectedTxn.order}</Typography>
                  <Typography variant="subtitle1"><b>Customer:</b> {selectedTxn.customer}</Typography>
                  <Typography variant="subtitle1"><b>Method:</b> {selectedTxn.method}</Typography>
                  <Typography variant="subtitle1"><b>Amount:</b> ${selectedTxn.amount?.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1"><b>Status:</b> {selectedTxn.status}</Typography>
                  <Typography variant="subtitle1"><b>Date:</b> {new Date(selectedTxn.date).toLocaleString()}</Typography>
                  {selectedTxn.paidAt && (
                    <Typography variant="subtitle1"><b>Paid At:</b> {new Date(selectedTxn.paidAt).toLocaleString()}</Typography>
                  )}
                  {selectedTxn.originalOrder?.store?.name && (
                    <Typography variant="subtitle1"><b>Store:</b> {selectedTxn.originalOrder.store.name}</Typography>
                  )}
                </Grid>
                {selectedTxn.originalOrder?.items && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1"><b>Order Items:</b></Typography>
                    {selectedTxn.originalOrder.items.map((item, index) => (
                      <Typography key={index} variant="body2">
                        • {item.product?.name || 'Unknown Product'} - Qty: {item.quantity} - ${item.total?.toFixed(2)}
                      </Typography>
                    ))}
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}