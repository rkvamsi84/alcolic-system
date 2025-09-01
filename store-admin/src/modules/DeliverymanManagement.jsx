import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SpeedIcon from '@mui/icons-material/Speed';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PageContainer from '../components/PageContainer';
import { useAuth } from '../auth/AuthContext';
import { API_CONFIG } from '../api/config';

const MotionCard = motion(Card);

const DeliverymanManagement = () => {
  const theme = useTheme();
  const { token, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDeliveryman, setSelectedDeliveryman] = useState(null);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliverymen, setDeliverymen] = useState([]);
  const [stats, setStats] = useState({
    activeDeliverymen: 0,
    averageRating: 0,
    onTimeDelivery: 0,
    totalEarnings: 0,
  });

  const [newDeliveryman, setNewDeliveryman] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    vehicle: 'Motorcycle',
    status: 'active',
  });

  // Get store ID from user context
  const storeId = user?.storeId;

  console.log('🔍 DeliverymanManagement Debug Info:');
  console.log('   User:', user);
  console.log('   StoreId:', storeId);
  console.log('   Token:', token ? 'Present' : 'Missing');

  // Fetch deliverymen from backend
  const fetchDeliverymen = async () => {
    if (!storeId) {
      console.log('❌ Store ID not found:', storeId);
      setError('Store ID not found');
      setLoading(false);
      return;
    }

    console.log('🔍 Fetching deliverymen for store:', storeId);
    console.log('🔑 Token:', token ? 'Present' : 'Missing');

    try {
      setLoading(true);
      const url = `${API_CONFIG.baseURL}/store/${storeId}/delivery-men`;
      console.log('🌐 API URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        throw new Error('Failed to fetch deliverymen');
      }

      const data = await response.json();
      console.log('✅ API Response data:', data);
      
      setDeliverymen(data.data || []);
      console.log('👥 Set deliverymen:', data.data?.length || 0);
      
      // Calculate stats
      const activeCount = data.data?.filter(d => d.isActive).length || 0;
      const avgRating = data.data?.length > 0 ? 
        (data.data.reduce((sum, d) => sum + (d.rating || 0), 0) / data.data.length).toFixed(1) : 0;
      
      setStats({
        activeDeliverymen: activeCount,
        averageRating: avgRating,
        onTimeDelivery: 95, // Mock data for now
        totalEarnings: data.data?.reduce((sum, d) => sum + (d.totalEarnings || 0), 0) || 0,
      });
      
      console.log('📊 Stats calculated:', {
        activeDeliverymen: activeCount,
        averageRating: avgRating,
      });
    } catch (err) {
      console.error('❌ Error in fetchDeliverymen:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new deliveryman
  const handleAddDeliveryman = async () => {
    if (!storeId) {
      setError('Store ID not found');
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.baseURL}/store/${storeId}/delivery-men`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newDeliveryman.name,
          email: newDeliveryman.email,
          phone: newDeliveryman.phone,
          password: newDeliveryman.password,
          vehicle: newDeliveryman.vehicle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add deliveryman');
      }

      await fetchDeliverymen();
      setOpenAddDialog(false);
      setNewDeliveryman({
        name: '',
        email: '',
        phone: '',
        password: '',
        vehicle: 'Motorcycle',
        status: 'active',
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Update deliveryman status
  const handleUpdateStatus = async (deliverymanId, newStatus) => {
    if (!storeId) {
      setError('Store ID not found');
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.baseURL}/store/${storeId}/delivery-men/${deliverymanId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      await fetchDeliverymen();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete deliveryman
  const handleDeleteDeliveryman = async (deliverymanId) => {
    if (!storeId) {
      setError('Store ID not found');
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.baseURL}/store/${storeId}/delivery-men/${deliverymanId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete deliveryman');
      }

      await fetchDeliverymen();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchDeliverymen();
  }, [storeId]);

  const handleOpenMenu = (event, deliveryman) => {
    setAnchorEl(event.currentTarget);
    setSelectedDeliveryman(deliveryman);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedDeliveryman(null);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'inactive':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  const getVehicleIcon = (vehicle) => {
    switch (vehicle?.toLowerCase()) {
      case 'motorcycle':
        return <DirectionsBikeIcon fontSize="small" />;
      case 'car':
        return <LocalShippingIcon fontSize="small" />;
      default:
        return <LocalShippingIcon fontSize="small" />;
    }
  };

  // Filter deliverymen based on search and status
  const filteredDeliverymen = deliverymen.filter(deliveryman => {
    const matchesSearch = deliveryman.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deliveryman.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deliveryman.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || deliveryman.isActive === (statusFilter === 'active');
    return matchesSearch && matchesStatus;
  });

  const statsCards = [
    {
      title: 'Active Deliverymen',
      value: stats.activeDeliverymen.toString(),
      change: '+3 this month',
      icon: <DirectionsBikeIcon />,
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toString(),
      change: '+0.2 this month',
      icon: <Rating value={parseFloat(stats.averageRating)} readOnly size="small" />,
    },
    {
      title: 'On-Time Delivery',
      value: `${stats.onTimeDelivery}%`,
      change: '+2% this month',
      icon: <SpeedIcon />,
    },
    {
      title: 'Total Earnings',
      value: `$${stats.totalEarnings.toLocaleString()}`,
      change: '+15% this month',
      icon: <LocalShippingIcon />,
    },
  ];

  if (loading) {
    return (
      <PageContainer title="Deliveryman Management">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Deliverymen">
      <Typography variant="h4" mb={2}>Deliverymen</Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      {stat.change}
                    </Typography>
                  </Box>
                  <Box color="primary.main">
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}
      </Grid>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search deliverymen..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)}
              fullWidth
            >
              Add Deliveryman
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Deliverymen Table */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Deliveryman</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Completed Orders</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDeliverymen.map((deliveryman) => (
                <TableRow key={deliveryman._id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2 }}>
                        {deliveryman.name?.charAt(0) || 'D'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {deliveryman.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {deliveryman._id?.slice(-6)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{deliveryman.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {deliveryman.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {getVehicleIcon(deliveryman.vehicle)}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {deliveryman.vehicle || 'Motorcycle'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={deliveryman.isActive ? 'Active' : 'Inactive'}
                      color={deliveryman.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Rating value={deliveryman.rating || 0} readOnly size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {deliveryman.completedOrders || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => handleOpenMenu(e, deliveryman)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </MotionCard>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          if (selectedDeliveryman) {
            handleUpdateStatus(selectedDeliveryman._id, !selectedDeliveryman.isActive);
          }
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          {selectedDeliveryman?.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedDeliveryman) {
            handleDeleteDeliveryman(selectedDeliveryman._id);
          }
          handleCloseMenu();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Add Deliveryman Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Deliveryman</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={newDeliveryman.name}
                onChange={(e) => setNewDeliveryman({ ...newDeliveryman, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newDeliveryman.email}
                onChange={(e) => setNewDeliveryman({ ...newDeliveryman, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={newDeliveryman.phone}
                onChange={(e) => setNewDeliveryman({ ...newDeliveryman, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newDeliveryman.password}
                onChange={(e) => setNewDeliveryman({ ...newDeliveryman, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Vehicle</InputLabel>
                <Select
                  value={newDeliveryman.vehicle}
                  onChange={(e) => setNewDeliveryman({ ...newDeliveryman, vehicle: e.target.value })}
                  label="Vehicle"
                >
                  <MenuItem value="Motorcycle">Motorcycle</MenuItem>
                  <MenuItem value="Car">Car</MenuItem>
                  <MenuItem value="Bicycle">Bicycle</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddDeliveryman} variant="contained">
            Add Deliveryman
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default DeliverymanManagement;
