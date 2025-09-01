import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress
} from "@mui/material";
import { 
  Edit, 
  Delete, 
  Search, 
  FilterList, 
  LocalShipping, 
  CheckCircle, 
  Block, 
  MonetizationOn,
  Close,
  Refresh
} from "@mui/icons-material";
import deliverymanService from "../../api/services/deliverymanService";

const getStatusColor = (status) => {
  switch (status) {
    case "Online": return "success";
    case "Offline": return "default";
    case "Suspended": return "error";
    default: return "default";
  }
};

const getStatusText = (isActive, isAvailable) => {
  if (!isActive) return "Suspended";
  return isAvailable ? "Online" : "Offline";
};

export default function Drivers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    active: 0,
    inactive: 0
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Online");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");

  // Load deliverymen data
  const loadDeliverymen = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get deliverymen data first
      const deliverymenResponse = await deliverymanService.getAllDeliverymen();
      console.log('Deliverymen response:', deliverymenResponse);
      console.log('Loaded drivers:', deliverymenResponse.data);
      
      // Then calculate stats using the same data
      const statsResponse = await deliverymanService.getDeliverymanStats(deliverymenResponse);
      console.log('Stats response:', statsResponse);
      
      setDrivers(deliverymenResponse.data || []);
      setStats(statsResponse);
    } catch (err) {
      console.error('Error loading deliverymen:', err);
      setError('Failed to load deliverymen data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliverymen();
  }, []);

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         driver.phone?.includes(searchTerm) ||
                         driver.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const driverStatus = getStatusText(driver.isActive, driver.isAvailable);
    const matchesStatus = statusFilter === "all" || driverStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Delete deliveryman
  const handleDelete = async (driverId) => {
    try {
      await deliverymanService.deleteDeliveryman(driverId);
      await loadDeliverymen(); // Reload data
    } catch (err) {
      console.error('Error deleting deliveryman:', err);
      setError('Failed to delete deliveryman.');
    }
  };

  // Edit driver
  const handleEdit = (driver) => {
    setEditMode(true);
    setSelectedDriver(driver);
    setName(driver.name || '');
    setPhone(driver.phone || '');
    setEmail(driver.email || '');
    setStatus(getStatusText(driver.isActive, driver.isAvailable));
    setLicenseNumber(driver.licenseNumber || '');
    setVehicleInfo(`${driver.vehicleType || ''} - ${driver.vehicleNumber || ''}`);
    setDialogOpen(true);
  };

  // Save driver changes
  const handleSave = async () => {
    try {
      if (editMode && selectedDriver) {
        const isActive = status === "Online" || status === "Offline";
        
        await deliverymanService.updateDeliverymanStatus(selectedDriver._id, isActive);
        await loadDeliverymen(); // Reload data
      }
      setDialogOpen(false);
    } catch (err) {
      console.error('Error saving deliveryman:', err);
      setError('Failed to save deliveryman changes.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Drivers Management</Typography>
        <Button 
          variant="outlined" 
          startIcon={<Refresh />} 
          onClick={loadDeliverymen}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocalShipping sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Drivers
                  </Typography>
                  <Typography variant="h4">
                    {stats.total}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Online Drivers
                  </Typography>
                  <Typography variant="h4">
                    {stats.online}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Block sx={{ mr: 2, color: 'error.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Suspended
                  </Typography>
                  <Typography variant="h4">
                    {stats.inactive}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MonetizationOn sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Drivers
                  </Typography>
                  <Typography variant="h4">
                    {stats.active}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Drivers"
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
                <MenuItem value="Online">Online</MenuItem>
                <MenuItem value="Offline">Offline</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              fullWidth
              onClick={() => setMoreFiltersOpen(true)}
            >
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Drivers Grid */}
      <Grid container spacing={3}>
        {filteredDrivers.map((driver) => {
          const driverStatus = getStatusText(driver.isActive, driver.isAvailable);
          return (
            <Grid item xs={12} sm={6} md={4} key={driver._id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar 
                      src={driver.profileImage} 
                      sx={{ mr: 2, width: 56, height: 56 }}
                    >
                      {driver.name?.charAt(0) || 'D'}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {driver.name || 'Unknown'}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={driverStatus} 
                          color={getStatusColor(driverStatus)} 
                          size="small" 
                        />
                      </Box>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Phone:</strong> {driver.phone || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Email:</strong> {driver.email || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>License:</strong> {driver.licenseNumber || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Vehicle:</strong> {driver.vehicleType ? `${driver.vehicleType} - ${driver.vehicleNumber}` : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Joined:</strong> {new Date(driver.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<Edit />}
                    onClick={() => handleEdit(driver)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<Delete />} 
                    color="error"
                    onClick={() => handleDelete(driver._id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredDrivers.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No drivers found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No drivers have registered yet'}
          </Typography>
        </Box>
      )}

      {/* Edit Driver Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? "Edit Driver" : "Add New Driver"}
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
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
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                variant="outlined"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
                  <MenuItem value="Online">Online</MenuItem>
                  <MenuItem value="Offline">Offline</MenuItem>
                  <MenuItem value="Suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="License Number"
                variant="outlined"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vehicle Information"
                variant="outlined"
                value={vehicleInfo}
                onChange={e => setVehicleInfo(e.target.value)}
                placeholder="e.g., Toyota Camry - ABC123"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editMode ? "Save Changes" : "Add Driver"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* More Filters Dialog */}
      <Dialog open={moreFiltersOpen} onClose={() => setMoreFiltersOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          More Filters
          <IconButton
            aria-label="close"
            onClick={() => setMoreFiltersOpen(false)}
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
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Min Deliveries"
                type="number"
                variant="outlined"
                placeholder="0"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoreFiltersOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setMoreFiltersOpen(false)}>
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}