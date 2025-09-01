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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Rating,
  Alert,
  Snackbar,
  CircularProgress
} from "@mui/material";
import { 
  Add, 
  Edit, 
  Delete, 
  Search, 
  FilterList,
  Store,
  CheckCircle,
  Warning,
  Block
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { API_CONFIG, ENDPOINTS } from "../../api/config";

const getStatusColor = (status) => {
  switch (status) {
    case "active": return "success";
    case "pending": return "warning";
    case "suspended": return "error";
    case "inactive": return "default";
    default: return "default";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "active": return <CheckCircle />;
    case "pending": return <Warning />;
    case "suspended": return <Block />;
    case "inactive": return <Block />;
    default: return <Store />;
  }
};

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editingStore, setEditingStore] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);

  // Form states for adding store
  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [status, setStatus] = useState("pending");
  const [selectedZone, setSelectedZone] = useState("");
  const [zones, setZones] = useState([]);
  const [detectingZone, setDetectingZone] = useState(false);
  const [detectedZoneInfo, setDetectedZoneInfo] = useState(null);

  // Fetch stores from API
  const fetchStores = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_CONFIG.baseURL}${ENDPOINTS.stores.getAll}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }

      const data = await response.json();
      setStores(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available zones
  const fetchZones = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_CONFIG.baseURL}/zones/admin/zones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setZones(data.zones || []);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  // Detect zone from address
  const detectZoneFromAddress = async () => {
    if (!street || !city || !state) {
      setSnackbar({ open: true, message: 'Please fill in street, city, and state first', severity: 'warning' });
      return;
    }

    const fullAddress = `${street}, ${city}, ${state}, ${zipCode || ''}`;
    
    try {
      setDetectingZone(true);
      const response = await fetch(`${API_CONFIG.baseURL}/zones/detect-zone-from-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address: fullAddress })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDetectedZoneInfo(data.data);
        if (data.data.detectedZone) {
          setSelectedZone(data.data.detectedZone.zoneId.toString());
          setSnackbar({ 
            open: true, 
            message: `Zone detected: ${data.data.detectedZone.zoneName}`, 
            severity: 'success' 
          });
        } else {
          setSnackbar({ 
            open: true, 
            message: 'No delivery zone found for this address', 
            severity: 'warning' 
          });
        }
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to detect zone', severity: 'error' });
      }
    } catch (error) {
      console.error('Error detecting zone:', error);
      setSnackbar({ open: true, message: 'Failed to detect zone from address', severity: 'error' });
    } finally {
      setDetectingZone(false);
    }
  };

  // Add new store
  const handleAddStore = async () => {
    try {
      // Validate required fields
      if (!storeName || !ownerName || !ownerEmail || !ownerPhone || !storeEmail || !storePhone || !street || !city || !state || !zipCode || !selectedZone) {
        setSnackbar({ open: true, message: 'Please fill in all required fields including zone selection', severity: 'error' });
        return;
      }

      console.log('🔍 Creating store with data:', {
        storeName,
        ownerName,
        ownerEmail,
        ownerPhone,
        storeEmail,
        storePhone,
        street,
        city,
        state,
        zipCode,
        status
      });

      const token = localStorage.getItem('admin_token');

      // First create the store without owner
      const storeData = {
        name: storeName,
        contactInfo: {
          email: storeEmail,
          phone: storePhone
        },
        address: {
          street,
          city,
          state,
          zipCode
        },
        zone: selectedZone,
        status
      };

      // Don't include owner field initially - it will be set after user creation

      console.log('📤 Sending store data to backend:', JSON.stringify(storeData, null, 2));
      console.log('🔑 Admin token present:', !!token);
      console.log('🌐 API URL:', `${API_CONFIG.baseURL}${ENDPOINTS.stores.create}`);

      const storeResponse = await fetch(`${API_CONFIG.baseURL}${ENDPOINTS.stores.create}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(storeData)
      });

      console.log('🏪 Store creation response status:', storeResponse.status);

      if (!storeResponse.ok) {
        const storeError = await storeResponse.json();
        console.log('❌ Store creation error:', storeError);
        const errorMessage = storeError.errors ? 
          storeError.errors.map(err => `${err.param}: ${err.msg}`).join(', ') :
          storeError.message || 'Failed to create store';
        throw new Error(errorMessage);
      }

      const storeDataResponse = await storeResponse.json();
      console.log('✅ Store created successfully:', storeDataResponse);
      const storeId = storeDataResponse.data._id;

      // Now create the user with the storeId
      const userResponse = await fetch(`${API_CONFIG.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: ownerName,
          email: ownerEmail,
          phone: ownerPhone,
          password: 'store123', // Default password
          role: 'store',
          storeId: storeId
        })
      });

      console.log('👤 User creation response status:', userResponse.status);

      if (!userResponse.ok) {
        const userError = await userResponse.json();
        console.log('❌ User creation error:', userError);
        const errorMessage = userError.errors ? 
          userError.errors.map(err => `${err.param}: ${err.msg}`).join(', ') :
          userError.message || 'Failed to create store owner';
        throw new Error(errorMessage);
      }

      const userData = await userResponse.json();
      console.log('✅ User created successfully:', userData);

      // Update the store with the owner
      const updateStoreResponse = await fetch(`${API_CONFIG.baseURL}${ENDPOINTS.stores.update(storeId)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          owner: userData.data.user.id
        })
      });

      if (!updateStoreResponse.ok) {
        console.log('⚠️ Warning: Could not update store with owner, but store and user were created');
      }

      setSnackbar({ open: true, message: 'Store created successfully!', severity: 'success' });
      setOpenDialog(false);
      resetForm();
      fetchStores();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
      console.error('Error creating store:', err);
    }
  };

  // Reset form
  const resetForm = () => {
    setStoreName("");
    setOwnerName("");
    setOwnerEmail("");
    setOwnerPhone("");
    setStoreEmail("");
    setStorePhone("");
    setStreet("");
    setCity("");
    setState("");
    setZipCode("");
    setStatus("pending");
    setSelectedZone("");
    setDetectedZoneInfo(null);
    setEditingStore(null);
  };

  // Update store status
  const handleUpdateStatus = async (storeId, newStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_CONFIG.baseURL}${ENDPOINTS.stores.update(storeId)}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update store status');
      }

      setSnackbar({ open: true, message: 'Store status updated successfully!', severity: 'success' });
      fetchStores();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
      console.error('Error updating store status:', err);
    }
  };

  // Handle edit store
  const handleEditStore = (store) => {
    setEditingStore(store);
    setStoreName(store.name || '');
    setOwnerName(store.owner?.name || '');
    setOwnerEmail(store.owner?.email || '');
    setOwnerPhone(store.owner?.phone || '');
    setStoreEmail(store.contactInfo?.email || '');
    setStorePhone(store.contactInfo?.phone || '');
    setStreet(store.address?.street || '');
    setCity(store.address?.city || '');
    setState(store.address?.state || '');
    setZipCode(store.address?.zipCode || '');
    setSelectedZone(store.zone?.id?.toString() || store.zoneId?.toString() || '');
    setStatus(store.status || 'pending');
    setOpenDialog(true);
  };

  // Handle update store
  const handleUpdateStore = async () => {
    try {
      if (!storeName || !storeEmail || !storePhone || !street || !city || !state || !zipCode || !selectedZone) {
        setSnackbar({ open: true, message: 'Please fill in all required fields including zone selection', severity: 'error' });
        return;
      }

      const token = localStorage.getItem('admin_token');
      const updateData = {
        name: storeName,
        contactInfo: {
          email: storeEmail,
          phone: storePhone
        },
        address: {
          street,
          city,
          state,
          zipCode
        },
        zone: selectedZone,
        status
      };

      const response = await fetch(`${API_CONFIG.baseURL}${ENDPOINTS.stores.update(editingStore._id)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update store');
      }

      setSnackbar({ open: true, message: 'Store updated successfully!', severity: 'success' });
      setOpenDialog(false);
      setEditingStore(null);
      resetForm();
      fetchStores();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
      console.error('Error updating store:', err);
    }
  };

  // Handle delete store
  const handleDeleteStore = (store) => {
    setStoreToDelete(store);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete store
  const confirmDeleteStore = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_CONFIG.baseURL}${ENDPOINTS.stores.delete(storeToDelete._id)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete store');
      }

      setSnackbar({ open: true, message: 'Store deleted successfully!', severity: 'success' });
      setDeleteConfirmOpen(false);
      setStoreToDelete(null);
      fetchStores();
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
      console.error('Error deleting store:', err);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchZones();
  }, []);

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.contactInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || store.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalStores = stores.length;
  const activeStores = stores.filter(s => s.status === "active").length;
  const pendingStores = stores.filter(s => s.status === "pending").length;
  const totalRevenue = stores.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading stores...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchStores} sx={{ mt: 2 }}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Store Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Store
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Store sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Stores
                  </Typography>
                  <Typography variant="h4">
                    {totalStores}
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
                    Active Stores
                  </Typography>
                  <Typography variant="h4">
                    {activeStores}
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
                <Warning sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Approval
                  </Typography>
                  <Typography variant="h4">
                    {pendingStores}
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
                <Store sx={{ mr: 2, color: 'info.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    ${totalRevenue.toLocaleString()}
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
              label="Search Stores"
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
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
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

      {/* Stores Grid */}
      <Grid container spacing={3}>
        {filteredStores.map((store) => (
          <Grid item xs={12} sm={6} md={4} key={store._id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {store.image ? (
                      <img src={store.image} alt={store.name} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Store />
                    )}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h6" gutterBottom>
                      {store.name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getStatusIcon(store.status)}
                      <Chip 
                        label={store.status} 
                        color={getStatusColor(store.status)}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Owner:</strong> {store.owner?.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Email:</strong> {store.contactInfo?.email}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Phone:</strong> {store.contactInfo?.phone}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Address:</strong> {store.address?.street}, {store.address?.city}, {store.address?.state} {store.address?.zipCode}
                </Typography>
                {store.zone && (
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Zone:</strong> {store.zone.name}
                  </Typography>
                )}

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Products: {store.products || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Orders: {store.orders || 0}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h6" color="primary">
                      ${(store.totalRevenue || 0).toLocaleString()}
                    </Typography>
                    <Rating value={store.rating?.average || 0} readOnly size="small" />
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<Edit />} onClick={() => handleEditStore(store)}>
                  Edit
                </Button>
                <Button size="small" startIcon={<Delete />} color="error" onClick={() => handleDeleteStore(store)}>
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Store Dialog */}
      <Dialog open={openDialog} onClose={() => {
        setOpenDialog(false);
        setEditingStore(null);
        resetForm();
      }} maxWidth="md" fullWidth>
        <DialogTitle>{editingStore ? 'Edit Store' : 'Add New Store'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Store Name" variant="outlined" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Owner Name" variant="outlined" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Owner Email" variant="outlined" type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Owner Phone" 
                variant="outlined" 
                value={ownerPhone} 
                onChange={(e) => setOwnerPhone(e.target.value)}
                helperText="Format: +1234567890 or (123) 456-7890"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Store Email" variant="outlined" type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Store Phone" 
                variant="outlined" 
                value={storePhone} 
                onChange={(e) => setStorePhone(e.target.value)}
                helperText="Format: +1234567890 or (123) 456-7890"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Street Address" variant="outlined" value={street} onChange={(e) => setStreet(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="City" variant="outlined" value={city} onChange={(e) => setCity(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="State" variant="outlined" value={state} onChange={(e) => setState(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Zip Code" variant="outlined" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Button 
                  variant="outlined" 
                  onClick={detectZoneFromAddress}
                  disabled={detectingZone || !street || !city || !state}
                  startIcon={detectingZone ? <CircularProgress size={20} /> : null}
                >
                  {detectingZone ? 'Detecting Zone...' : 'Detect Zone from Address'}
                </Button>
                {detectedZoneInfo && (
                  <Chip 
                    label={detectedZoneInfo.detectedZone ? 
                      `Detected: ${detectedZoneInfo.detectedZone.zoneName}` : 
                      'No zone detected'
                    }
                    color={detectedZoneInfo.detectedZone ? 'success' : 'warning'}
                    size="small"
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Delivery Zone</InputLabel>
                <Select 
                  value={selectedZone} 
                  label="Delivery Zone" 
                  onChange={(e) => setSelectedZone(e.target.value)}
                >
                  {zones.map((zone) => (
                    <MenuItem key={zone.id} value={zone.id.toString()}>
                      {zone.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setEditingStore(null);
            resetForm();
          }}>Cancel</Button>
          <Button variant="contained" onClick={editingStore ? handleUpdateStore : handleAddStore}>
            {editingStore ? 'Update Store' : 'Add Store'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* More Filters Dialog */}
      <Dialog open={moreFiltersOpen} onClose={() => setMoreFiltersOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>More Filters</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                Advanced filtering options will be available soon.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoreFiltersOpen(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the store "{storeToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDeleteStore}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}