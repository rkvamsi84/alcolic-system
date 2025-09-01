import { Box, Typography, Grid, Card, CardContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Select, MenuItem, FormControl, InputLabel, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, Pagination, IconButton, Tooltip } from "@mui/material";
import { MoneyOff, Search, FilterList, Download, Refresh, Visibility } from "@mui/icons-material";
import { useState, useEffect } from "react";
import axios from "axios";

const getStatusColor = (status) => {
  switch (status) {
    case "Approved": return "success";
    case "Pending": return "warning";
    case "Rejected": return "error";
    case "Processing": return "info";
    case "Completed": return "success";
    default: return "default";
  }
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://alcolic-backend.onrender.com/api/v1';

export default function Refunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    completedCount: 0,
    totalAmount: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Fetch refunds data
  const fetchRefunds = async () => {
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
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await axios.get(`${API_BASE_URL}/refunds?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setRefunds(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch refunds');
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
      setError(error.response?.data?.message || 'Failed to fetch refunds');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/refunds/stats/overview`, {
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

  // Handle type filter
  const handleTypeFilter = (event) => {
    setTypeFilter(event.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Export refunds as CSV
  const handleExport = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await axios.get(`${API_BASE_URL}/refunds/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'refunds.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting refunds:', error);
      setError('Failed to export refunds');
    }
  };

  // Open refund details modal
  const handleViewDetails = async (refund) => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/refunds/${refund._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSelectedRefund(response.data.data);
        setDetailsOpen(true);
      }
    } catch (error) {
      console.error('Error fetching refund details:', error);
      setError('Failed to fetch refund details');
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedRefund(null);
  };

  // Update refund status
  const handleStatusUpdate = async (refundId, newStatus, adminNotes = '') => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.patch(`${API_BASE_URL}/refunds/${refundId}/status`, {
        status: newStatus,
        adminNotes
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Refresh the data
        fetchRefunds();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating refund status:', error);
      setError('Failed to update refund status');
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchRefunds();
    fetchStats();
  }, [pagination.page, searchTerm, statusFilter, typeFilter]);

  if (loading && refunds.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Refunds & Cancellations</Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={() => { fetchRefunds(); fetchStats(); }} sx={{ mr: 1 }}>
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
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Requests</Typography>
              <Typography variant="h4">{stats.totalRequests}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Approved</Typography>
              <Typography variant="h4" color="success.main">{stats.approvedCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Pending</Typography>
              <Typography variant="h4" color="warning.main">{stats.pendingCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Rejected</Typography>
              <Typography variant="h4" color="error.main">{stats.rejectedCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Completed</Typography>
              <Typography variant="h4" color="success.main">{stats.completedCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
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
              label="Search Refunds"
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
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Processing">Processing</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Type Filter</InputLabel>
              <Select value={typeFilter} label="Type Filter" onChange={handleTypeFilter}>
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="refund">Refund</MenuItem>
                <MenuItem value="cancellation">Cancellation</MenuItem>
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

      {/* Refunds Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Refund ID</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Store</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {refunds.map((refund) => (
              <TableRow key={refund._id}>
                <TableCell>{refund.refundId}</TableCell>
                <TableCell>{refund.order?.orderNumber || 'N/A'}</TableCell>
                <TableCell>{refund.customer?.name || 'N/A'}</TableCell>
                <TableCell>{refund.store?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Chip 
                    label={refund.type} 
                    color={refund.type === 'refund' ? 'primary' : 'secondary'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{refund.reason}</TableCell>
                <TableCell>{new Date(refund.requestedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={refund.status} 
                    color={getStatusColor(refund.status)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>${refund.amount?.toFixed(2)}</TableCell>
                <TableCell>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<Visibility />}
                    onClick={() => handleViewDetails(refund)}
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

      {/* Refund Details Modal */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>Refund Details</DialogTitle>
        <DialogContent dividers>
          {selectedRefund && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1"><b>Refund ID:</b> {selectedRefund.refundId}</Typography>
                  <Typography variant="subtitle1"><b>Order ID:</b> {selectedRefund.order?.orderNumber || 'N/A'}</Typography>
                  <Typography variant="subtitle1"><b>Customer:</b> {selectedRefund.customer?.name || 'N/A'}</Typography>
                  <Typography variant="subtitle1"><b>Store:</b> {selectedRefund.store?.name || 'N/A'}</Typography>
                  <Typography variant="subtitle1"><b>Type:</b> {selectedRefund.type}</Typography>
                  <Typography variant="subtitle1"><b>Reason:</b> {selectedRefund.reason}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1"><b>Amount:</b> ${selectedRefund.amount?.toFixed(2)}</Typography>
                  <Typography variant="subtitle1"><b>Status:</b> {selectedRefund.status}</Typography>
                  <Typography variant="subtitle1"><b>Requested By:</b> {selectedRefund.requestedBy?.name || 'N/A'}</Typography>
                  <Typography variant="subtitle1"><b>Requested At:</b> {new Date(selectedRefund.requestedAt).toLocaleString()}</Typography>
                  {selectedRefund.processedBy && (
                    <Typography variant="subtitle1"><b>Processed By:</b> {selectedRefund.processedBy.name}</Typography>
                  )}
                  {selectedRefund.processedAt && (
                    <Typography variant="subtitle1"><b>Processed At:</b> {new Date(selectedRefund.processedAt).toLocaleString()}</Typography>
                  )}
                </Grid>
                {selectedRefund.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1"><b>Description:</b></Typography>
                    <Typography variant="body2">{selectedRefund.description}</Typography>
                  </Grid>
                )}
                {selectedRefund.adminNotes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1"><b>Admin Notes:</b></Typography>
                    <Typography variant="body2">{selectedRefund.adminNotes}</Typography>
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