import { 
  Box, Typography, Paper, TextField, Select, MenuItem, FormControl, InputLabel, Button, Chip, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress, useTheme
} from "@mui/material";
import { Search, FilterList, Download, LocalShipping } from "@mui/icons-material";
import { useState, useEffect } from "react";
import adminSocketService from '../../services/socketService';

const getStatusColor = (status) => {
  switch (status) {
    case "delivered": return "success";
    case "out_for_delivery": return "primary";
    case "preparing": return "warning";
    case "ready_for_pickup": return "info";
    case "pending": return "info";
    case "confirmed": return "primary";
    case "cancelled": return "error";
    default: return "default";
  }
};

export default function Orders() {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [deliveryMen, setDeliveryMen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [storeFilter, setStoreFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [assignDeliveryOpen, setAssignDeliveryOpen] = useState(false);
  const [selectedDeliveryMan, setSelectedDeliveryMan] = useState("");
  const [assigningDelivery, setAssigningDelivery] = useState(false);

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success) {
          setOrders(data.data);
        } else {
          setError(data.message || 'Failed to fetch orders');
        }
      } catch (err) {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    const fetchDeliveryMen = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/delivery-men`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success) {
          setDeliveryMen(data.data.filter(dm => dm.isActive)); // Only show active deliverymen
        }
      } catch (err) {
        console.error('Failed to fetch delivery men:', err);
      }
    };

    fetchOrders();
    fetchDeliveryMen();
  }, []);

  // Socket setup for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      // Connect to socket
      adminSocketService.connect(token);

      // Handle new orders
      const handleNewOrder = (orderData) => {
        console.log('New order received in admin panel:', orderData);
        setOrders(prevOrders => [orderData, ...prevOrders]);
        setSnackbar({
          open: true,
          message: `New order received: ${orderData.orderNumber}`,
          severity: 'info'
        });
      };

      // Handle order updates
      const handleOrderUpdate = (orderData) => {
        console.log('Order updated in admin panel:', orderData);
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderData._id ? orderData : order
          )
        );
      };

      // Handle order status updates
      const handleOrderStatusUpdate = (data) => {
        console.log('Order status updated in admin panel:', data);
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === data.orderId ? { ...order, status: data.status } : order
          )
        );
      };

      // Add event listeners
      adminSocketService.addListener('new-order', handleNewOrder);
      adminSocketService.addListener('order-updated', handleOrderUpdate);
      adminSocketService.addListener('order-status-update', handleOrderStatusUpdate);

      // Cleanup on unmount
      return () => {
        adminSocketService.removeListener('new-order', handleNewOrder);
        adminSocketService.removeListener('order-updated', handleOrderUpdate);
        adminSocketService.removeListener('order-status-update', handleOrderStatusUpdate);
        adminSocketService.disconnect();
      };
    }
  }, []);

  // Unique stores and drivers for filters
  const stores = [...new Set(orders.map(o => o.store?.name || o.store))].filter(Boolean);
  const drivers = [...new Set(orders.map(o => o.driver?.name || o.driver))].filter(Boolean);

  // Filtering logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.phone && order.customer.phone.toString().toLowerCase().includes(searchTerm.toLowerCase()));
    const orderStatus = order.status?.current || order.status; // Handle both object and string status
    const matchesStatus = statusFilter === "all" || orderStatus === statusFilter;
    const matchesStore = !storeFilter || (order.store?.name || order.store) === storeFilter;
    const matchesDriver = !driverFilter || (order.driver?.name || order.driver) === driverFilter;
    const matchesDateFrom = !dateFrom || order.date >= dateFrom;
    const matchesDateTo = !dateTo || order.date <= dateTo;
    const matchesPriceMin = !priceMin || order.total >= parseFloat(priceMin);
    const matchesPriceMax = !priceMax || order.total <= parseFloat(priceMax);
    return matchesSearch && matchesStatus && matchesStore && matchesDriver && matchesDateFrom && matchesDateTo && matchesPriceMin && matchesPriceMax;
  });

  // Export orders as CSV
  const handleExport = () => {
    const headers = [
      "Order ID,Customer,Phone,Store,Items,Total,Status,Driver,Date"
    ];
    const rows = filteredOrders.map(order =>
      [
        order.orderNumber || order.id,
        order.customer?.name,
        order.customer?.phone,
        order.store?.name || order.store,
        order.items?.length || order.items,
        order.payment?.amount?.total || order.total,
        order.status?.current || order.status,
        order.driver?.name || order.driver,
        new Date(order.createdAt || order.date).toLocaleDateString()
      ].join(",")
    );
    const csvContent = headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Open order details modal
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status?.current || order.status);
    setDetailsOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    setStatusUpdating(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/orders/${selectedOrder._id || selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setOrders(orders => orders.map(o => (o._id || o.id) === (selectedOrder._id || selectedOrder.id) ? { 
          ...o, 
          status: { ...o.status, current: newStatus } 
        } : o));
        setSnackbar({ open: true, message: `🍷 Alcolic order status updated to ${newStatus}`, severity: 'success' });
        setSelectedOrder(o => o ? { ...o, status: { ...o.status, current: newStatus } } : o);
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to update status', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAssignDelivery = async () => {
    if (!selectedOrder || !selectedDeliveryMan) return;
    setAssigningDelivery(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/orders/${selectedOrder._id || selectedOrder.id}/assign-delivery`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deliveryMan: selectedDeliveryMan })
      });
      const data = await response.json();
      if (data.success) {
        const assignedDeliveryMan = deliveryMen.find(dm => dm._id === selectedDeliveryMan);
        setOrders(orders => orders.map(o => (o._id || o.id) === (selectedOrder._id || selectedOrder.id) ? { 
          ...o, 
          deliveryMan: assignedDeliveryMan 
        } : o));
        setSnackbar({ open: true, message: '🍷 Alcolic delivery man assigned successfully', severity: 'success' });
        setSelectedOrder(o => o ? { ...o, deliveryMan: assignedDeliveryMan } : o);
        setAssignDeliveryOpen(false);
        setSelectedDeliveryMan("");
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to assign delivery man', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to assign delivery man', severity: 'error' });
    } finally {
      setAssigningDelivery(false);
    }
  };

  const openAssignDelivery = (order) => {
    setSelectedOrder(order);
    setSelectedDeliveryMan(order.deliveryMan?._id || "");
    setAssignDeliveryOpen(true);
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>;
  }
  if (error) {
    return <Box><Alert severity="error" sx={{ mb: 2 }}>{error}</Alert></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
        Orders Management
      </Typography>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography color="textSecondary" gutterBottom>Total Orders</Typography><Typography variant="h4">{orders.length}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography color="textSecondary" gutterBottom>Pending Orders</Typography><Typography variant="h4">{orders.filter(o => (o.status?.current || o.status) === "pending").length}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography color="textSecondary" gutterBottom>In Progress</Typography><Typography variant="h4">{orders.filter(o => ["confirmed", "preparing", "ready_for_pickup", "out_for_delivery"].includes(o.status?.current || o.status)).length}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Typography color="textSecondary" gutterBottom>Total Revenue</Typography><Typography variant="h4">₹{orders.reduce((sum, order) => sum + (order.payment?.amount?.total || order.total || 0), 0).toFixed(2)}</Typography></CardContent></Card>
        </Grid>
      </Grid>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField label="Search Orders" variant="outlined" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }} sx={{ minWidth: 220 }} />
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select value={statusFilter} label="Status Filter" onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="preparing">Preparing</MenuItem>
            <MenuItem value="ready_for_pickup">Ready for Pickup</MenuItem>
            <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" startIcon={<FilterList />} onClick={() => setMoreFiltersOpen(true)}>More Filters</Button>
        <Button variant="contained" startIcon={<Download />} onClick={handleExport}>Export Orders</Button>
      </Paper>
      {/* Orders Card Grid */}
      <Grid container spacing={3}>
        {filteredOrders.map(order => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, position: 'relative', cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6 } }} onClick={() => handleViewDetails(order)}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" color="textSecondary">{order.orderNumber || order.id}</Typography>
                  <Chip label={order.status?.current || order.status} color={getStatusColor(order.status?.current || order.status)} size="small" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{order.customer?.name || 'Unknown Customer'}</Typography>
                <Typography variant="body2" color="text.secondary">{order.store?.name || 'Unknown Store'}</Typography>
                <Typography variant="body2" color="text.secondary">{new Date(order.createdAt || order.date).toLocaleDateString()}</Typography>
                <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>₹{order.payment?.amount?.total || order.total}</Typography>
                {order.deliveryMan && (
                  <Box mt={1} display="flex" alignItems="center" gap={1}>
                    <LocalShipping sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="caption" color="primary">
                      {order.deliveryMan.name}
                    </Typography>
                  </Box>
                )}
                <Box mt={2} display="flex" gap={1}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => handleViewDetails(order)}
                    sx={{ flex: 1 }}
                  >
                    View
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    startIcon={<LocalShipping />}
                    onClick={() => openAssignDelivery(order)}
                    sx={{ flex: 1 }}
                  >
                    {order.deliveryMan ? 'Reassign' : 'Assign'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              <Typography variant="subtitle1"><b>Order ID:</b> {selectedOrder.orderNumber || selectedOrder.id}</Typography>
              <Typography variant="subtitle1"><b>Customer:</b> {selectedOrder.customer?.name || 'Unknown Customer'}</Typography>
              <Typography variant="subtitle1"><b>Phone:</b> {selectedOrder.customer?.phone || selectedOrder.phone}</Typography>
              <Typography variant="subtitle1"><b>Store:</b> {selectedOrder.store?.name || 'Unknown Store'}</Typography>
              <Typography variant="subtitle1"><b>Items:</b> {selectedOrder.items?.length || selectedOrder.items}</Typography>
              <Typography variant="subtitle1"><b>Total:</b> ₹{selectedOrder.payment?.amount?.total || selectedOrder.total}</Typography>
              <Typography variant="subtitle1"><b>Status:</b> {selectedOrder.status?.current || selectedOrder.status}</Typography>
              <Typography variant="subtitle1">
                <b>Delivery Man:</b> {selectedOrder.deliveryMan?.name || 'Not assigned'}
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select value={newStatus} label="Status" onChange={e => setNewStatus(e.target.value)} disabled={statusUpdating}>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="preparing">Preparing</MenuItem>
                  <MenuItem value="ready_for_pickup">Ready for Pickup</MenuItem>
                  <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} color="primary">Close</Button>
          <Button 
            onClick={() => openAssignDelivery(selectedOrder)} 
            variant="outlined" 
            startIcon={<LocalShipping />}
          >
            {selectedOrder?.deliveryMan ? 'Reassign Delivery' : 'Assign Delivery'}
          </Button>
          <Button onClick={handleStatusUpdate} variant="contained" disabled={statusUpdating || newStatus === (selectedOrder?.status?.current || selectedOrder?.status)}>
            {statusUpdating ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* More Filters Dialog */}
      <Dialog open={moreFiltersOpen} onClose={() => setMoreFiltersOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>More Filters</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Store</InputLabel>
                <Select value={storeFilter} label="Store" onChange={e => setStoreFilter(e.target.value)}>
                  <MenuItem value="">All Stores</MenuItem>
                  {stores.map(store => (
                    <MenuItem key={store} value={store}>{store}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Driver</InputLabel>
                <Select value={driverFilter} label="Driver" onChange={e => setDriverFilter(e.target.value)}>
                  <MenuItem value="">All Drivers</MenuItem>
                  {drivers.map(driver => (
                    <MenuItem key={driver} value={driver}>{driver}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Date From" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Date To" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Min Price" type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Max Price" type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setStoreFilter("");
            setDriverFilter("");
            setDateFrom("");
            setDateTo("");
            setPriceMin("");
            setPriceMax("");
          }}>Clear</Button>
          <Button onClick={() => setMoreFiltersOpen(false)} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
      {/* Delivery Man Assignment Dialog */}
      <Dialog open={assignDeliveryOpen} onClose={() => setAssignDeliveryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Delivery Man</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                <b>Order ID:</b> {selectedOrder.orderNumber || selectedOrder.id}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <b>Customer:</b> {selectedOrder.customer?.name || 'Unknown Customer'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <b>Delivery Address:</b> {selectedOrder.deliveryAddress?.address}
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Delivery Man</InputLabel>
                <Select 
                  value={selectedDeliveryMan} 
                  label="Select Delivery Man" 
                  onChange={e => setSelectedDeliveryMan(e.target.value)}
                  disabled={assigningDelivery}
                >
                  <MenuItem value="">
                    <em>Select a delivery man</em>
                  </MenuItem>
                  {deliveryMen.map(dm => (
                    <MenuItem key={dm._id} value={dm._id}>
                      {dm.name} - {dm.phone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {deliveryMen.length === 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  No active delivery men available. Please add delivery men first.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDeliveryOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleAssignDelivery} 
            variant="contained" 
            disabled={assigningDelivery || !selectedDeliveryMan}
            startIcon={assigningDelivery ? <CircularProgress size={16} /> : <LocalShipping />}
          >
            {assigningDelivery ? 'Assigning...' : 'Assign Delivery Man'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}