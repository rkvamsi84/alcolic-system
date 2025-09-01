import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  InputAdornment,
  Menu,
  MenuItem,
  useTheme,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PageContainer from '../components/PageContainer';
import { customersService } from '../api/customersService';
import { useAuth } from '../auth/AuthContext';

const MotionCard = motion(Card);

const CustomerManagement = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isActive: true
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!token) return;
      
      setLoading(true);
      setError(null);
      try {
        console.log('🔧 Fetching customers data...');
        const [customersResponse, statsResponse] = await Promise.all([
          customersService.getCustomers(),
          customersService.getCustomerStats()
        ]);
        
        if (customersResponse.success) {
          setCustomers(customersResponse.data || []);
        }
        
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [token]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         customer.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && customer.isActive) ||
                         (statusFilter === 'inactive' && !customer.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (customer) => {
    setEditMode(true);
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      isActive: customer.isActive
    });
    setDialogOpen(true);
  };

  const handleDelete = async (customerId) => {
    try {
      await customersService.deleteCustomer(customerId);
      setCustomers(customers.filter(c => c._id !== customerId));
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError(err.message);
    }
  };

  const handleSave = async () => {
    try {
      if (editMode && selectedCustomer) {
        await customersService.updateCustomer(selectedCustomer._id, formData);
        setCustomers(customers.map(customer =>
          customer._id === selectedCustomer._id ? { ...customer, ...formData } : customer
        ));
      }
      setDialogOpen(false);
      setEditMode(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error('Error saving customer:', err);
      setError(err.message);
    }
  };

  const handleStatusToggle = async (customerId, currentStatus) => {
    try {
      await customersService.updateCustomerStatus(customerId, !currentStatus);
      setCustomers(customers.map(customer =>
        customer._id === customerId ? { ...customer, isActive: !currentStatus } : customer
      ));
    } catch (err) {
      console.error('Error updating customer status:', err);
      setError(err.message);
    }
  };

  const handleOpenMenu = (event, customer) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case true:
        return theme.palette.success.main;
      case false:
        return theme.palette.warning.main;
      default:
        return theme.palette.info.main;
    }
  };

  if (loading) {
    return (
      <PageContainer title="Customer Management">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Customer Management">
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  const statsCards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      change: '+12%',
    },
    {
      title: 'Active Customers',
      value: stats?.activeCustomers || 0,
      change: '+8%',
    },
    {
      title: 'New Customers',
      value: stats?.newCustomers || 0,
      change: '+5%',
    },
    {
      title: 'Average Orders',
      value: stats?.averageOrdersPerCustomer?.toFixed(1) || 0,
      change: '+3%',
    },
  ];

  return (
    <PageContainer title="Customer Management">
      <Typography variant="h4" mb={2}>Customer Management</Typography>
      <Grid container spacing={2}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="success.main">
                  {stat.change} this month
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              size="small"
              placeholder="Search customers..."
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
              startIcon={<FilterListIcon />}
              sx={{ minWidth: 100 }}
            >
              Filter
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ minWidth: 100 }}
            >
              Add Customer
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Orders</TableCell>
                  <TableCell align="right">Total Spent</TableCell>
                  <TableCell align="right">Last Order</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer._id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {customer.name?.charAt(0) || 'C'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {customer.name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: #{customer._id?.slice(-6)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{customer.email || 'N/A'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {customer.phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={customer.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                          color: getStatusColor(customer.isActive),
                          bgcolor: `${getStatusColor(customer.isActive)}15`,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">{customer.orderCount || 0}</TableCell>
                    <TableCell align="right">
                      ${(customer.totalSpent || 0).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(event) => handleOpenMenu(event, customer)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={() => {
              handleEdit(selectedCustomer);
              handleCloseMenu();
            }}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={() => {
              handleStatusToggle(selectedCustomer._id, selectedCustomer.isActive);
              handleCloseMenu();
            }}>
              <Chip
                label={selectedCustomer?.isActive ? 'Deactivate' : 'Activate'}
                size="small"
                sx={{ mr: 1 }}
              />
              {selectedCustomer?.isActive ? 'Deactivate' : 'Activate'}
            </MenuItem>
            <MenuItem onClick={() => {
              handleDelete(selectedCustomer._id);
              handleCloseMenu();
            }} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>

          {/* Edit Customer Dialog */}
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              {editMode ? 'Edit Customer' : 'Add Customer'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} variant="contained">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default CustomerManagement;
