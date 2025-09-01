import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { Search, FilterList, Download } from "@mui/icons-material";
import { CircularProgress, Alert } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php';

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
};

const getStatusColor = (status) => {
  switch (status) {
    case "Upcoming": return "info";
    case "Completed": return "success";
    case "Cancelled": return "error";
    default: return "default";
  }
};

export default function ScheduledOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [scheduledOrders, setScheduledOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch scheduled orders from API
  const fetchScheduledOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/admin/orders?scheduled=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Transform API data to match our component structure
        const transformedOrders = response.data.data.map(order => ({
          id: order.orderNumber || order._id,
          customer: order.customer?.name || order.user?.name || 'Unknown Customer',
          phone: order.customer?.phone || order.user?.phone || 'N/A',
          store: order.store?.name || 'Unknown Store',
          items: order.items?.length || 0,
          total: order.payment?.amount?.total || order.totalAmount || 0,
          status: order.status?.current || order.status || 'Unknown',
          scheduledDate: order.scheduledDeliveryTime || order.createdAt,
          driver: order.deliveryMan?.name || 'Pending'
        }));
        setScheduledOrders(transformedOrders);
      } else {
        setError('Failed to fetch scheduled orders');
      }
    } catch (err) {
      console.error('Error fetching scheduled orders:', err);
      setError('Failed to load scheduled orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduledOrders();
  }, [fetchScheduledOrders]);

  const filteredOrders = scheduledOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.name || order.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm);
    const orderStatus = order.status?.current || order.status;
    const matchesStatus = statusFilter === "all" || orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export scheduled orders as CSV
  const handleExport = () => {
    const headers = [
      "Order ID,Customer,Phone,Store,Items,Total,Status,Driver,Scheduled Date"
    ];
    const rows = filteredOrders.map(order =>
      [
        order.id,
        order.customer?.name || order.customer || 'Unknown Customer',
        order.phone,
        order.store,
        order.items,
        order.total,
        order.status?.current || order.status,
        order.driver,
        order.scheduledDate
      ].join(",")
    );
    const csvContent = headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scheduled_orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Open order details modal
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedOrder(null);
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading scheduled orders...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Scheduled Orders
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Scheduled
              </Typography>
              <Typography variant="h4">
                {scheduledOrders.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Upcoming
              </Typography>
              <Typography variant="h4">
                {scheduledOrders.filter(o => (o.status?.current || o.status) === "Upcoming").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4">
                {scheduledOrders.filter(o => (o.status?.current || o.status) === "Completed").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Cancelled
              </Typography>
              <Typography variant="h4">
                {scheduledOrders.filter(o => (o.status?.current || o.status) === "Cancelled").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Scheduled Orders"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Upcoming">Upcoming</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              fullWidth
            >
              More Filters
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              startIcon={<Download />}
              fullWidth
              onClick={handleExport}
            >
              Export
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Scheduled Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Store</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Scheduled Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customer?.name || order.customer || 'Unknown Customer'}</TableCell>
                <TableCell>{order.phone}</TableCell>
                <TableCell>{order.store}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>${order.total}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status?.current || order.status}
                    color={getStatusColor(order.status?.current || order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{order.driver}</TableCell>
                <TableCell>{order.scheduledDate}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => handleViewDetails(order)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Order Details Modal */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle>Scheduled Order Details</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              <Typography variant="subtitle1"><b>Order ID:</b> {selectedOrder.id}</Typography>
              <Typography variant="subtitle1"><b>Customer:</b> {selectedOrder.customer?.name || selectedOrder.customer || 'Unknown Customer'}</Typography>
              <Typography variant="subtitle1"><b>Phone:</b> {selectedOrder.phone}</Typography>
              <Typography variant="subtitle1"><b>Store:</b> {selectedOrder.store}</Typography>
              <Typography variant="subtitle1"><b>Items:</b> {selectedOrder.items}</Typography>
              <Typography variant="subtitle1"><b>Total:</b> ${selectedOrder.total}</Typography>
              <Typography variant="subtitle1"><b>Status:</b> {selectedOrder.status?.current || selectedOrder.status}</Typography>
              <Typography variant="subtitle1"><b>Driver:</b> {selectedOrder.driver}</Typography>
              <Typography variant="subtitle1"><b>Scheduled Date:</b> {selectedOrder.scheduledDate}</Typography>
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