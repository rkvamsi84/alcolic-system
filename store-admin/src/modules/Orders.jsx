import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Drawer, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, InputAdornment, IconButton, useTheme, CircularProgress } from '@mui/material';
import RegulatoryLogModal, { addRegulatoryLog } from '../components/Product/RegulatoryLogModal';
import PageContainer from '../components/PageContainer';
import { motion } from 'framer-motion';
import Visibility from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import { Checkbox } from '@mui/material';
import FilterList from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '../auth/AuthContext';
import socketService from '../services/socketService';

const orderStatus = [
  { label: 'New', color: 'primary' },
  { label: 'Processing', color: 'info' },
  { label: 'Delivered', color: 'success' },
  { label: 'Canceled', color: 'error' },
  { label: 'Refunded', color: 'warning' },
];

const MotionTableRow = motion(TableRow);

const Orders = () => {
  const theme = useTheme();
  const { user, token } = useAuth();
  const [tab, setTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [logOpen, setLogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const storeId = localStorage.getItem('store_id') || user?.storeId || user?._id;
      if (!storeId) {
        throw new Error('Store ID not found. Please login again.');
      }
      
      console.log('🔄 Fetching orders for store:', storeId);
      console.log('👤 Current user:', user?.email);
      console.log('🏪 User storeId:', user?.storeId);
      console.log('🔑 Token present:', !!token);
      
              const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://alcolic-backend.onrender.com/api/v1'}/store/${storeId}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('📡 API Response status:', response.status);
      
      const data = await response.json();
      if (!data.success) {
        console.error('❌ API Error:', data.message);
        throw new Error(data.message || 'Failed to fetch orders');
      }
      
      console.log('📦 Orders fetched:', data.data.length, 'orders');
      console.log('📋 Orders data:', data.data);
      setOrders(data.data);
    } catch (err) {
      console.error('❌ Fetch orders error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    const fetchDrivers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://alcolic-backend.onrender.com/api/v1'}/users?role=delivery`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setDrivers(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch drivers:', err);
      }
    };

    if (user && token) {
      fetchOrders();
      fetchDrivers();
    }
  }, [user, token]);

  // Socket event listeners for real-time updates
  useEffect(() => {
    const handleNewOrder = (orderData) => {
      console.log('🆕 New order received in Orders component:', orderData);
      console.log('🏪 Order store ID:', orderData.store?._id || orderData.store);
      console.log('🏪 Current store ID:', localStorage.getItem('store_id'));
      console.log('👤 Current user:', user?.email);
      
      // Verify this order belongs to our store
      const currentStoreId = localStorage.getItem('store_id');
      const orderStoreId = orderData.store?._id || orderData.store;
      
      console.log('🔍 Orders component - Store ID comparison:');
      console.log('   Current store ID (localStorage):', currentStoreId);
      console.log('   Order store ID:', orderStoreId);
      console.log('   Types - Current:', typeof currentStoreId, 'Order:', typeof orderStoreId);
      console.log('   Direct comparison:', currentStoreId === orderStoreId);
      console.log('   String comparison:', String(currentStoreId) === String(orderStoreId));
      
      // Use string comparison for more reliable matching
      if (String(currentStoreId) === String(orderStoreId)) {
        console.log('✅ Order belongs to our store - adding to list');
        setOrders(prevOrders => [orderData, ...prevOrders]);
        setSnackbar({
          open: true,
          message: `New order #${orderData.orderNumber || orderData._id} received!`,
          severity: 'success'
        });
      } else {
        console.log('❌ Order does not belong to our store - ignoring');
        console.log('   Expected store ID:', currentStoreId);
        console.log('   Order store ID:', orderStoreId);
      }
    };

    const handleOrderUpdate = (orderData) => {
      console.log('📦 Order updated in Orders component:', orderData);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderData._id ? orderData : order
        )
      );
    };

    // Subscribe to socket events
    socketService.addListener('new-order', handleNewOrder);
    socketService.addListener('order-updated', handleOrderUpdate);
    
    // Debug socket connection
    console.log('🔌 Socket connection status:', socketService.getConnectionStatus());
    const storeId = localStorage.getItem('store_id') || user?.storeId || user?._id;
    console.log('🏪 Store ID for socket room:', storeId);

    // Cleanup listeners on unmount
    return () => {
      socketService.removeListener('new-order', handleNewOrder);
      socketService.removeListener('order-updated', handleOrderUpdate);
    };
  }, [user]);

  const filteredOrders = orders.filter(o =>
    (tab === 0 || o.status?.current === orderStatus[tab - 1]?.label) &&
    (o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || String(o.orderNumber).includes(searchTerm))
  );

  const handleRefund = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://alcolic-backend.onrender.com/api/v1'}/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'refunded',
          note: refundReason
        })
      });

      if (response.ok) {
        setRefundOpen(false);
        setSnackbar({ open: true, message: '🍷 Alcolic order refunded successfully.', severity: 'success' });
        addRegulatoryLog({
          time: new Date().toLocaleString(),
          action: 'Refund',
          details: `Order ID: ${selectedOrder?.id}, Reason: ${refundReason}`
        });
        setRefundReason('');
        // Refresh orders
        window.location.reload();
      } else {
        throw new Error('Failed to refund order');
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to refund order: ' + err.message, severity: 'error' });
    }
  };

  const handleAssign = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://alcolic-backend.onrender.com/api/v1'}/orders/${selectedOrder.id}/assign-delivery`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deliveryMan: selectedDriver
        })
      });

      if (response.ok) {
        setAssignOpen(false);
        setSnackbar({ open: true, message: `🍷 Alcolic driver assigned successfully.`, severity: 'success' });
        setSelectedDriver('');
        // Refresh orders
        window.location.reload();
      } else {
        throw new Error('Failed to assign driver');
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to assign driver: ' + err.message, severity: 'error' });
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://alcolic-backend.onrender.com/api/v1'}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus.toLowerCase(),
          note: `Status updated to ${newStatus}`
        })
      });

      if (response.ok) {
        setSnackbar({ open: true, message: `🍷 Alcolic order status updated to ${newStatus}`, severity: 'success' });
        // Refresh orders
        window.location.reload();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update status: ' + err.message, severity: 'error' });
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return { bg: theme.palette.success.main, color: '#fff' };
      case 'pending':
        return { bg: theme.palette.warning.main, color: '#fff' };
      case 'processing':
        return { bg: theme.palette.info.main, color: '#fff' };
      case 'cancelled':
        return { bg: theme.palette.error.main, color: '#fff' };
      case 'refunded':
        return { bg: theme.palette.warning.main, color: '#fff' };
      default:
        return { bg: theme.palette.grey[500], color: '#fff' };
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <PageContainer title="Orders">
      <Typography variant="h4" mb={2}>Orders</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={handleSearch}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          startIcon={<RefreshIcon fontSize="small" />}
          onClick={fetchOrders}
          disabled={loading}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          startIcon={<FilterList fontSize="small" />}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Filter
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          height: 'calc(100% - 52px)',
          '& .MuiTableCell-root': { py: 1.5, px: 2 },
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedOrders.length > 0 &&
                    selectedOrders.length < filteredOrders.length
                  }
                  checked={
                    filteredOrders.length > 0 &&
                    selectedOrders.length === filteredOrders.length
                  }
                  onChange={(event) =>
                    setSelectedOrders(
                      event.target.checked
                        ? filteredOrders.map((order) => order.id)
                        : []
                    )
                  }
                />
              </TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow
                key={order.id}
                hover
                selected={selectedOrders.includes(order.id)}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => handleSelectOrder(order.id)}
                  />
                </TableCell>
                <TableCell>#{order.orderNumber || order.id.toString().padStart(5, '0')}</TableCell>
                <TableCell>{order.customer?.name || 'N/A'}</TableCell>
                <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell align="right">₹{order.payment?.amount?.total || order.total || 0}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status?.current || 'Pending'}
                    size="small"
                    sx={{
                      color: getStatusColor(order.status?.current || 'pending').color,
                      bgcolor: getStatusColor(order.status?.current || 'pending').bg,
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => setSelectedOrder(order)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                  {order.status?.current === 'delivered' && (
                    <IconButton size="small" color="error" onClick={() => { setSelectedOrder(order); setRefundOpen(true); }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Drawer anchor="right" open={!!selectedOrder} onClose={() => setSelectedOrder(null)}>
        <Box sx={{ width: 350, p: 3 }}>
          <Typography variant="h6">Order Details</Typography>
          {selectedOrder && (
            <Stack spacing={2} mt={2}>
              <Typography>ID: {selectedOrder.orderNumber || selectedOrder.id}</Typography>
              <Typography>Customer: {selectedOrder.customer?.name || 'N/A'}</Typography>
              <Typography>Status: {selectedOrder.status?.current || 'Pending'}</Typography>
              <Typography>Total: ₹{selectedOrder.payment?.amount?.total || selectedOrder.total || 0}</Typography>
              <Typography>Payment Method: {selectedOrder.payment?.method || 'N/A'}</Typography>
              <Typography>Payment Status: {selectedOrder.payment?.status || 'Pending'}</Typography>
              
              <Box>
                <Typography variant="subtitle2">Status Timeline:</Typography>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {selectedOrder.status?.history?.map((t, i) => (
                    <li key={i}>{t.status} - {new Date(t.timestamp).toLocaleString()}</li>
                  )) || <li>No status history</li>}
                </ul>
              </Box>
              
              <Box>
                <Typography variant="subtitle2">Order Items:</Typography>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {selectedOrder.items?.map((item, i) => (
                    <li key={i}>{item.product?.name || 'Unknown Product'} x{item.quantity} - ₹{item.price}</li>
                  )) || <li>No items</li>}
                </ul>
              </Box>
              
              <Box>
                <Typography variant="subtitle2">Update Status:</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
                    <Button
                      key={status}
                      size="small"
                      variant="outlined"
                      onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                      sx={{ mb: 1 }}
                    >
                      {status.replace('_', ' ')}
                    </Button>
                  ))}
                </Stack>
              </Box>
              
              <Button variant="outlined" onClick={() => setAssignOpen(true)}>Assign Driver</Button>
            </Stack>
          )}
        </Box>
      </Drawer>
      
      <Dialog open={refundOpen} onClose={() => setRefundOpen(false)}>
        <DialogTitle>Refund Order</DialogTitle>
        <DialogContent>
          <TextField
            label="Refund Reason"
            fullWidth
            value={refundReason}
            onChange={e => setRefundReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRefund} disabled={!refundReason}>Refund</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)}>
        <DialogTitle>Assign Driver</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Select Driver"
            value={selectedDriver}
            onChange={e => setSelectedDriver(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          >
            {drivers.map(driver => (
              <option key={driver._id} value={driver._id}>{driver.name || driver.email}</option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign} disabled={!selectedDriver}>Assign</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
      <RegulatoryLogModal open={logOpen} onClose={() => setLogOpen(false)} />
    </PageContainer>
  );
};

export default Orders;
