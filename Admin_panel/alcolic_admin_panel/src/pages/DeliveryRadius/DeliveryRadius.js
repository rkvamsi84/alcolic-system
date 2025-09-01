import React, { useState, useEffect, useCallback } from "react";
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
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from "@mui/material";
import { 
  Search, 
  FilterList, 
  Download, 
  Add, 
  Edit, 
  Delete,
  LocationOn,
  CheckCircle,
  Warning,
  Block,
  Map as MapIcon,
  TableChart as TableIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import ZoneMapManager from '../../components/ZoneMapManager';

// Zone service for API calls
const zoneService = {
  async getAuthHeaders() {
    let token = localStorage.getItem('admin_token');
    
    // If no token exists, try to get one by logging in
    if (!token) {
      try {
        const loginResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'admin@alcolic.com',
            password: 'admin123',
            role: 'admin'
          })
        });
        
        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          token = loginData.data.token;
          localStorage.setItem('admin_token', token);
          console.log('Auto-login successful, token stored');
        } else {
          console.error('Auto-login failed:', await loginResponse.text());
        }
      } catch (loginErr) {
        console.error('Auto-login error:', loginErr);
      }
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  },

  async getZones() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/zones/admin/zones`, {
      headers
    });
    if (!response.ok) throw new Error('Failed to fetch zones');
    return response.json();
  },

  async createZone(zoneData) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/zones/admin/zones`, {
      method: 'POST',
      headers,
      body: JSON.stringify(zoneData)
    });
    if (!response.ok) throw new Error('Failed to create zone');
    return response.json();
  },

  async updateZone(id, zoneData) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/zones/admin/zones/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(zoneData)
    });
    if (!response.ok) throw new Error('Failed to update zone');
    return response.json();
  },

  async deleteZone(id) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/zones/admin/zones/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) throw new Error('Failed to delete zone');
    return response.json();
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "Active": return "success";
    case "Pending": return "warning";
    case "Suspended": return "error";
    default: return "default";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "Active": return <CheckCircle />;
    case "Pending": return <Warning />;
    case "Suspended": return <Block />;
    default: return <LocationOn />;
  }
};

export default function DeliveryRadius() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [coverageFilter, setCoverageFilter] = useState("all");
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  // Load zones from backend
  const loadZones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await zoneService.getZones();
      // Transform backend data to match table format
      const transformedZones = (data.zones || []).map(zone => ({
        id: zone.id,
        zoneName: zone.name || 'Unnamed Zone',
        store: 'Default Store', // You may want to add store info to backend
        radius: 5, // Default radius since backend uses polygon coordinates
        unit: 'miles',
        status: zone.isActive ? 'Active' : 'Inactive',
        deliveryTime: zone.delivery_time_min && zone.delivery_time_max 
          ? `${zone.delivery_time_min}-${zone.delivery_time_max} min`
          : '30-45 min',
        minOrder: zone.minOrderAmount || zone.minimum_order || 25,
        deliveryFee: zone.deliveryFee || zone.minimum_shipping_charge || 5.0,
        coverage: 'Medium Density', // Default coverage
        description: zone.description,
        coordinates: zone.coordinates,
        type: zone.type
      }));
      setZones(transformedZones);
    } catch (error) {
      console.error('Error loading zones:', error);
      setError('Failed to load zones. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Refresh zones when switching tabs to ensure data consistency
    if (newValue === 0) {
      loadZones();
    }
  };
  
  // Form states
  const [zoneName, setZoneName] = useState("");
  const [store, setStore] = useState("");
  const [radius, setRadius] = useState("");
  const [unit, setUnit] = useState("miles");
  const [status, setStatus] = useState("Active");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [coverage, setCoverage] = useState("Medium Density");

  const stores = [...new Set(zones.map(z => z.store))];
  const coverages = [...new Set(zones.map(z => z.coverage))];

  const filteredZones = zones.filter(zone => {
    const matchesSearch = zone.zoneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.store.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || zone.status === statusFilter;
    const matchesCoverage = coverageFilter === "all" || zone.coverage === coverageFilter;
    return matchesSearch && matchesStatus && matchesCoverage;
  });

  // Add new zone
  const handleAdd = () => {
    setEditMode(false);
    setSelectedZone(null);
    setZoneName("");
    setStore("");
    setRadius("");
    setUnit("miles");
    setStatus("Active");
    setDeliveryTime("");
    setMinOrder("");
    setDeliveryFee("");
    setCoverage("Medium Density");
    setDialogOpen(true);
  };

  // Edit zone
  const handleEdit = (zone) => {
    setEditMode(true);
    setSelectedZone(zone);
    setZoneName(zone.zoneName);
    setStore(zone.store);
    setRadius(zone.radius);
    setUnit(zone.unit);
    setStatus(zone.status);
    setDeliveryTime(zone.deliveryTime);
    setMinOrder(zone.minOrder);
    setDeliveryFee(zone.deliveryFee);
    setCoverage(zone.coverage);
    setDialogOpen(true);
  };

  // Delete zone
  const handleDelete = async (zoneId) => {
    try {
      await zoneService.deleteZone(zoneId);
      setZones(zones.filter(z => z.id !== zoneId));
    } catch (error) {
      console.error('Error deleting zone:', error);
      setError('Failed to delete zone. Please try again.');
    }
  };

  // Save zone
  const handleSave = async () => {
    try {
      const zoneData = {
        name: zoneName,
        description: `${zoneName} delivery zone`,
        type: 'delivery',
        isActive: status === 'Active',
        deliveryFee: parseFloat(deliveryFee),
        minOrderAmount: parseFloat(minOrder),
        coordinates: selectedZone?.coordinates || [],
        color: '#4CAF50'
      };

      if (editMode && selectedZone) {
        await zoneService.updateZone(selectedZone.id, zoneData);
      } else {
        await zoneService.createZone(zoneData);
      }
      
      // Reload zones to get updated data
      await loadZones();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving zone:', error);
      setError('Failed to save zone. Please try again.');
    }
  };

  // Export zones
  const handleExport = () => {
    const headers = [
      "Zone Name,Store,Radius,Unit,Status,Delivery Time,Min Order,Delivery Fee,Coverage"
    ];
    const rows = filteredZones.map(zone =>
      [
        zone.zoneName,
        zone.store,
        zone.radius,
        zone.unit,
        zone.status,
        zone.deliveryTime,
        zone.minOrder,
        zone.deliveryFee,
        zone.coverage
      ].join(",")
    );
    const csvContent = headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "delivery_zones.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalZones = zones.length;
  const activeZones = zones.filter(z => z.status === "Active").length;
  const totalCoverage = zones.reduce((sum, z) => sum + z.radius, 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Delivery Zone Management
      </Typography>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="zone management tabs">
          <Tab 
            icon={<TableIcon />} 
            label="Table View" 
            iconPosition="start"
          />
          <Tab 
            icon={<MapIcon />} 
            label="Map View" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading zones...</Typography>
            </Box>
          ) : (
            <>
              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Zones
                  </Typography>
                  <Typography variant="h4">
                    {totalZones}
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
                    Active Zones
                  </Typography>
                  <Typography variant="h4">
                    {activeZones}
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
                <LocationOn sx={{ mr: 2, color: 'info.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Coverage
                  </Typography>
                  <Typography variant="h4">
                    {totalCoverage} miles
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
                <LocationOn sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Avg Radius
                  </Typography>
                  <Typography variant="h4">
                    {(totalCoverage / totalZones).toFixed(1)} miles
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Zones"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
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
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              fullWidth
              onClick={handleExport}
            >
              Export
            </Button>
          </Grid>
          <Grid item xs={12} md={1.5}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              fullWidth
              onClick={loadZones}
              disabled={loading}
            >
              Refresh
            </Button>
          </Grid>
          <Grid item xs={12} md={1.5}>
            <Button
              variant="contained"
              startIcon={<Add />}
              fullWidth
              onClick={handleAdd}
            >
              Add Zone
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Delivery Zones Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Zone Name</TableCell>
              <TableCell>Store</TableCell>
              <TableCell>Radius</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Delivery Time</TableCell>
              <TableCell>Min Order</TableCell>
              <TableCell>Delivery Fee</TableCell>
              <TableCell>Coverage</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredZones.map((zone) => (
              <TableRow key={zone.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {getStatusIcon(zone.status)}
                    <Typography sx={{ ml: 1 }}>{zone.zoneName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{zone.store}</TableCell>
                <TableCell>{zone.radius} {zone.unit}</TableCell>
                <TableCell>
                  <Chip 
                    label={zone.status} 
                    color={getStatusColor(zone.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{zone.deliveryTime}</TableCell>
                <TableCell>${zone.minOrder}</TableCell>
                <TableCell>${zone.deliveryFee}</TableCell>
                <TableCell>{zone.coverage}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(zone)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(zone.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Zone Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? "Edit Delivery Zone" : "Add Delivery Zone"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Zone Name"
                variant="outlined"
                value={zoneName}
                onChange={e => setZoneName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Store</InputLabel>
                <Select value={store} label="Store" onChange={e => setStore(e.target.value)}>
                  <MenuItem value="Liquor Store Downtown">Liquor Store Downtown</MenuItem>
                  <MenuItem value="Wine & Spirits">Wine & Spirits</MenuItem>
                  <MenuItem value="Beer Garden">Beer Garden</MenuItem>
                  <MenuItem value="Premium Liquors">Premium Liquors</MenuItem>
                  <MenuItem value="Express Liquor">Express Liquor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Radius"
                type="number"
                variant="outlined"
                value={radius}
                onChange={e => setRadius(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select value={unit} label="Unit" onChange={e => setUnit(e.target.value)}>
                  <MenuItem value="miles">Miles</MenuItem>
                  <MenuItem value="km">Kilometers</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Delivery Time"
                variant="outlined"
                value={deliveryTime}
                onChange={e => setDeliveryTime(e.target.value)}
                placeholder="e.g., 30-45 min"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Coverage</InputLabel>
                <Select value={coverage} label="Coverage" onChange={e => setCoverage(e.target.value)}>
                  <MenuItem value="High Density">High Density</MenuItem>
                  <MenuItem value="Medium Density">Medium Density</MenuItem>
                  <MenuItem value="Low Density">Low Density</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Order"
                type="number"
                variant="outlined"
                value={minOrder}
                onChange={e => setMinOrder(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Delivery Fee"
                type="number"
                variant="outlined"
                value={deliveryFee}
                onChange={e => setDeliveryFee(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editMode ? "Save Changes" : "Add Zone"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* More Filters Dialog */}
      <Dialog open={moreFiltersOpen} onClose={() => setMoreFiltersOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>More Filters</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Coverage</InputLabel>
                <Select value={coverageFilter} label="Coverage" onChange={e => setCoverageFilter(e.target.value)}>
                  <MenuItem value="all">All Coverage</MenuItem>
                  {coverages.map(coverage => (
                    <MenuItem key={coverage} value={coverage}>{coverage}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Store</InputLabel>
                <Select value={store} label="Store" onChange={e => setStore(e.target.value)}>
                  <MenuItem value="">All Stores</MenuItem>
                  {stores.map(store => (
                    <MenuItem key={store} value={store}>{store}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCoverageFilter("all");
            setStore("");
          }}>Clear</Button>
          <Button onClick={() => setMoreFiltersOpen(false)} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
            </>
          )}
        </Box>
      )}

      {/* Map View Tab */}
      {tabValue === 1 && (
        <ZoneMapManager />
      )}
    </Box>
  );
}