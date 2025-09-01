import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  LocalShipping as DeliveryIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Map as MapIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  DirectionsCar as CarIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// Helper to get admin token
const getAdminToken = () => localStorage.getItem('admin_token');

const OrderTracking = () => {
  const { token } = useAuth();
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTracking, setSelectedTracking] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [deliveryMen, setDeliveryMen] = useState([]);
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedDeliveryMan, setSelectedDeliveryMan] = useState('');

  const statusColors = {
    pending: 'warning',
    confirmed: 'info',
    preparing: 'primary',
    ready_for_pickup: 'secondary',
    out_for_delivery: 'info',
    delivered: 'success',
    cancelled: 'error',
    failed: 'error'
  };

  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready_for_pickup: 'Ready for Pickup',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    failed: 'Failed'
  };

  useEffect(() => {
    fetchTrackingData();
    fetchStats();
    fetchDeliveryMen();
  }, []);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/orderTracking/admin?search=${searchTerm}&status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTrackingData(data.data || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch tracking data');
      }
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      setError('Failed to fetch tracking data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/orderTracking/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchDeliveryMen = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/admin/delivery-men`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDeliveryMen(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching delivery men:', err);
    }
  };

  const handleStatusUpdate = async (trackingId, newStatus, notes = '') => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/orderTracking/${trackingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, notes })
      });

      if (response.ok) {
        fetchTrackingData();
        fetchStats();
        setOpenDialog(false);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update status');
      }
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleAssignDeliveryMan = async () => {
    if (!selectedDeliveryMan) return;

    try {
      const token = getAdminToken();
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/orderTracking/${selectedTracking._id}/assign`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deliveryManId: selectedDeliveryMan })
      });

      if (response.ok) {
        fetchTrackingData();
        setAssignDialog(false);
        setSelectedDeliveryMan('');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to assign delivery man');
      }
    } catch (err) {
      setError('Failed to assign delivery man');
    }
  };

  const renderStats = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Orders
            </Typography>
            <Typography variant="h4">
              {stats?.totalOrders || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Pending
            </Typography>
            <Typography variant="h4" color="warning.main">
              {stats?.pendingOrders || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Out for Delivery
            </Typography>
            <Typography variant="h4" color="info.main">
              {stats?.outForDeliveryOrders || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Delivered
            </Typography>
            <Typography variant="h4" color="success.main">
              {stats?.deliveredOrders || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTrackingTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tracking Code</TableCell>
            <TableCell>Order</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Store</TableCell>
            <TableCell>Delivery Man</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : trackingData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                No tracking data found
              </TableCell>
            </TableRow>
          ) : (
            trackingData.map((tracking) => (
              <TableRow key={tracking._id}>
                <TableCell>
                  <Typography variant="subtitle2" fontFamily="monospace">
                    {tracking.trackingCode}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">
                    #{tracking.order?.orderNumber}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    ${tracking.order?.totalAmount}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {tracking.customer?.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {tracking.customer?.phone}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <StoreIcon color="primary" />
                    <Typography variant="subtitle2">
                      {tracking.store?.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {tracking.deliveryMan ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        <CarIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {tracking.deliveryMan.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {tracking.deliveryMan.phone}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Chip label="Unassigned" color="warning" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={statusLabels[tracking.status]}
                    color={statusColors[tracking.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {tracking.location ? (
                    <Tooltip title={tracking.location.address}>
                      <IconButton size="small">
                        <LocationIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Typography variant="caption" color="textSecondary">
                      No location
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(tracking.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedTracking(tracking);
                      setOpenDetailsDialog(true);
                    }}
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedTracking(tracking);
                      setOpenDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  {!tracking.deliveryMan && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedTracking(tracking);
                        setAssignDialog(true);
                      }}
                    >
                      <AssignmentIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderStatusUpdateDialog = () => (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Update Tracking Status</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Order: #{selectedTracking?.order?.orderNumber}
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Tracking Code: {selectedTracking?.trackingCode}
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={selectedTracking?.status || ''}
              label="New Status"
              onChange={(e) => setSelectedTracking({
                ...selectedTracking,
                status: e.target.value
              })}
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (optional)"
            sx={{ mt: 2 }}
            placeholder="Add any additional notes about this status update..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => handleStatusUpdate(selectedTracking._id, selectedTracking.status)}
        >
          Update Status
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderDetailsDialog = () => (
    <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>Tracking Details</DialogTitle>
      <DialogContent>
        {selectedTracking && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Order Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Order Number"
                      secondary={`#${selectedTracking.order?.orderNumber}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Total Amount"
                      secondary={`$${selectedTracking.order?.totalAmount}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Tracking Code"
                      secondary={selectedTracking.trackingCode}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip
                          label={statusLabels[selectedTracking.status]}
                          color={statusColors[selectedTracking.status]}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Customer Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={selectedTracking.customer?.name}
                      secondary={selectedTracking.customer?.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <PhoneIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Phone"
                      secondary={selectedTracking.customer?.phone}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Status History
                </Typography>
                <List>
                  {selectedTracking.statusHistory?.map((status, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar>
                          <TimelineIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={statusLabels[status.status]}
                              color={statusColors[status.status]}
                              size="small"
                            />
                            <Typography variant="caption" color="textSecondary">
                              {new Date(status.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        secondary={status.notes}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const renderAssignDialog = () => (
    <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Delivery Man</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Order: #{selectedTracking?.order?.orderNumber}
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Tracking Code: {selectedTracking?.trackingCode}
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Delivery Man</InputLabel>
            <Select
              value={selectedDeliveryMan}
              label="Select Delivery Man"
              onChange={(e) => setSelectedDeliveryMan(e.target.value)}
            >
              {deliveryMen.map((deliveryMan) => (
                <MenuItem key={deliveryMan._id} value={deliveryMan._id}>
                  {deliveryMan.name} - {deliveryMan.phone}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleAssignDeliveryMan}
          disabled={!selectedDeliveryMan}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Order Tracking
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchTrackingData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {stats && renderStats()}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search by tracking code or order number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {renderTrackingTable()}

      {renderStatusUpdateDialog()}
      {renderDetailsDialog()}
      {renderAssignDialog()}
    </Box>
  );
};

export default OrderTracking;