import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Map as MapIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

// Zone service for API calls
const zoneService = {
  async getAuthHeaders() {
    let token = localStorage.getItem('admin_token');
    
    // If no token exists, try to get one by logging in
    if (!token) {
      try {
        const loginResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
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
    // Transform frontend data to backend format
    const backendData = {
      ...zoneData,
      status: zoneData.isActive,
      shipping_charge: zoneData.deliveryFee,
      minimum_order: zoneData.minOrderAmount
    };
    // Remove frontend-specific properties
    delete backendData.isActive;
    delete backendData.deliveryFee;
    delete backendData.minOrderAmount;
    
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/zones/admin/zones`, {
      method: 'POST',
      headers,
      body: JSON.stringify(backendData)
    });
    if (!response.ok) throw new Error('Failed to create zone');
    return response.json();
  },

  async updateZone(id, zoneData) {
    // Transform frontend data to backend format
    const backendData = {
      ...zoneData,
      status: zoneData.isActive,
      shipping_charge: zoneData.deliveryFee,
      minimum_order: zoneData.minOrderAmount
    };
    // Remove frontend-specific properties
    delete backendData.isActive;
    delete backendData.deliveryFee;
    delete backendData.minOrderAmount;
    
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/zones/admin/zones/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(backendData)
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

// Map component
function MapComponent({ zones, onZoneCreate, onZoneUpdate, onZoneDelete, currentLocation, detectedZones }) {
  const [map, setMap] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [zonePolygons, setZonePolygons] = useState(new Map());
  const [locationMarker, setLocationMarker] = useState(null);

  const mapRef = useCallback((node) => {
    if (node !== null && window.google) {
      const mapInstance = new window.google.maps.Map(node, {
        center: { lat: 19.0760, lng: 72.8777 }, // Mumbai center
        zoom: 11,
        mapTypeId: 'roadmap'
      });
      setMap(mapInstance);

      // Initialize drawing manager
      const drawingManagerInstance = new window.google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
          position: window.google.maps.ControlPosition.TOP_CENTER,
          drawingModes: ['polygon']
        },
        polygonOptions: {
          fillColor: '#2196F3',
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: '#1976D2',
          clickable: true,
          editable: true,
          zIndex: 1
        }
      });
      drawingManagerInstance.setMap(mapInstance);
      setDrawingManager(drawingManagerInstance);

      // Handle polygon completion
      drawingManagerInstance.addListener('polygoncomplete', (polygon) => {
        const coordinates = polygon.getPath().getArray().map(coord => ({
          lat: coord.lat(),
          lng: coord.lng()
        }));
        
        const bounds = new window.google.maps.LatLngBounds();
        coordinates.forEach(coord => bounds.extend(coord));
        const center = bounds.getCenter();

        const newZone = {
          name: `Zone ${zones.length + 1}`,
          description: 'New delivery zone',
          coordinates,
          center: { lat: center.lat(), lng: center.lng() },
          deliveryFee: 5.0,
          minOrderAmount: 25.0,
          isActive: true,
          type: 'delivery'
        };

        setSelectedZone({ ...newZone, polygon });
        setEditDialogOpen(true);
        drawingManagerInstance.setDrawingMode(null);
      });
    }
  }, [zones.length]);

  // Load existing zones on map
  useEffect(() => {
    if (map && zones.length > 0) {
      // Clear existing polygons
      zonePolygons.forEach(polygon => polygon.setMap(null));
      const newPolygons = new Map();

      zones.forEach(zone => {
        if (zone && zone.coordinates && zone.coordinates.length > 0) {
          const isDetected = detectedZones.some(dz => dz.id === zone.id);
          const polygon = new window.google.maps.Polygon({
            paths: zone.coordinates,
            fillColor: isDetected ? '#FF9800' : (zone.isActive ? '#4CAF50' : '#F44336'),
            fillOpacity: isDetected ? 0.5 : 0.3,
            strokeWeight: isDetected ? 3 : 2,
            strokeColor: isDetected ? '#F57C00' : (zone.isActive ? '#2E7D32' : '#C62828'),
            clickable: true,
            editable: false
          });
          
          polygon.setMap(map);
          newPolygons.set(zone.id, polygon);

          // Add click listener
          polygon.addListener('click', () => {
            setSelectedZone({ ...zone, polygon });
            setEditDialogOpen(true);
          });

          // Add info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div>
                <h4>${zone.name || 'Unnamed Zone'} ${isDetected ? '📍' : ''}</h4>
                <p>${zone.description || 'No description'}</p>
                <p><strong>Delivery Fee:</strong> $${zone.deliveryFee || 0}</p>
                <p><strong>Min Order:</strong> $${zone.minOrderAmount || 0}</p>
                <p><strong>Status:</strong> ${zone.isActive ? 'Active' : 'Inactive'}</p>
                ${isDetected ? '<p><strong>🎯 Covers your location</strong></p>' : ''}
              </div>
            `
          });

          polygon.addListener('mouseover', (e) => {
            infoWindow.setPosition(e.latLng);
            infoWindow.open(map);
          });

          polygon.addListener('mouseout', () => {
            infoWindow.close();
          });
        }
      });

      setZonePolygons(newPolygons);
    }
  }, [map, zones, detectedZones]);

  // Add current location marker
  useEffect(() => {
    if (map && currentLocation) {
      // Remove existing marker
      if (locationMarker) {
        locationMarker.setMap(null);
      }

      // Create new marker
      const marker = new window.google.maps.Marker({
        position: currentLocation,
        map: map,
        title: 'Your Current Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#2196F3" stroke="#fff" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="#fff"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12)
        },
        animation: window.google.maps.Animation.DROP
      });

      // Add info window for location marker
      const locationInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div>
            <h4>📍 Your Current Location</h4>
            <p><strong>Latitude:</strong> ${currentLocation.lat.toFixed(6)}</p>
            <p><strong>Longitude:</strong> ${currentLocation.lng.toFixed(6)}</p>
            <p><strong>Zones:</strong> ${detectedZones.length > 0 ? detectedZones.map(z => z.name).join(', ') : 'None'}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        locationInfoWindow.open(map, marker);
      });

      setLocationMarker(marker);

      // Center map on current location
      map.setCenter(currentLocation);
      if (map.getZoom() < 13) {
        map.setZoom(13);
      }
    }
  }, [map, currentLocation, detectedZones]);

  const handleZoneSave = async (zoneData) => {
    try {
      if (selectedZone.id) {
        await onZoneUpdate(selectedZone.id, zoneData);
      } else {
        await onZoneCreate(zoneData);
      }
      
      if (selectedZone.polygon) {
        selectedZone.polygon.setMap(null);
      }
      
      setEditDialogOpen(false);
      setSelectedZone(null);
    } catch (error) {
      console.error('Error saving zone:', error);
    }
  };

  const handleZoneDelete = async () => {
    if (selectedZone.id) {
      try {
        await onZoneDelete(selectedZone.id);
        if (selectedZone.polygon) {
          selectedZone.polygon.setMap(null);
        }
        setEditDialogOpen(false);
        setSelectedZone(null);
      } catch (error) {
        console.error('Error deleting zone:', error);
      }
    }
  };

  return (
    <Box>
      <div ref={mapRef} style={{ width: '100%', height: '500px' }} />
      
      {selectedZone && (
        <ZoneEditor
          open={editDialogOpen}
          zone={selectedZone}
          onSave={handleZoneSave}
          onDelete={handleZoneDelete}
          onClose={() => {
            if (selectedZone.polygon && !selectedZone.id) {
              selectedZone.polygon.setMap(null);
            }
            setEditDialogOpen(false);
            setSelectedZone(null);
          }}
        />
      )}
    </Box>
  );
}

// Zone editor dialog
function ZoneEditor({ open, zone, onSave, onDelete, onClose, saving }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deliveryFee: 5.0,
    minOrderAmount: 25.0,
    isActive: true
  });

  useEffect(() => {
    if (zone) {
      setFormData({
        name: zone.name || '',
        description: zone.description || '',
        deliveryFee: zone.deliveryFee !== undefined && zone.deliveryFee !== null && !isNaN(zone.deliveryFee) ? zone.deliveryFee : 5.0,
        minOrderAmount: zone.minOrderAmount !== undefined && zone.minOrderAmount !== null && !isNaN(zone.minOrderAmount) ? zone.minOrderAmount : 25.0,
        isActive: zone.isActive !== undefined ? zone.isActive : true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        deliveryFee: 5.0,
        minOrderAmount: 25.0,
        isActive: true
      });
    }
  }, [zone]);

  const handleSubmit = () => {
    const zoneData = {
      ...formData,
      coordinates: zone.coordinates,
      center: zone.center,
      type: zone.type || 'delivery'
    };
    onSave(zoneData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {zone?.id ? 'Edit Zone' : 'Create New Zone'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Zone Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Delivery Fee ($)"
              type="number"
              value={formData.deliveryFee}
              onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Min Order Amount ($)"
              type="number"
              value={formData.minOrderAmount}
              onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12}>
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
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        {zone?.id && (
          <Button onClick={onDelete} color="error" disabled={saving}>
            Delete
          </Button>
        )}
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={saving || !formData.name.trim()}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Loading component
function MapLoadingComponent({ status }) {
  if (status === Status.LOADING) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={500}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Google Maps...</Typography>
      </Box>
    );
  }

  if (status === Status.FAILURE) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={500}>
        <Alert severity="error">
          Failed to load Google Maps. Please check your API key configuration.
        </Alert>
      </Box>
    );
  }

  return null;
}

// Main zone map manager component
export default function ZoneMapManager() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [detectedZones, setDetectedZones] = useState([]);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Load zones from backend
  const loadZones = useCallback(async () => {
    try {
      setLoading(true);
      const data = await zoneService.getZones();
      setZones(data.zones || []);
    } catch (error) {
      console.error('Error loading zones:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load zones',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const handleZoneCreate = async (zoneData) => {
    try {
      setSaving(true);
      const response = await zoneService.createZone(zoneData);
      setZones(prev => [...prev, response.zone]);
      setSnackbar({
        open: true,
        message: 'Zone created successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating zone:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create zone',
        severity: 'error'
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleZoneUpdate = async (id, zoneData) => {
    try {
      setSaving(true);
      const response = await zoneService.updateZone(id, zoneData);
      setZones(prev => prev.map(zone => zone.id === id ? response.zone : zone));
      setSnackbar({
        open: true,
        message: 'Zone updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating zone:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update zone',
        severity: 'error'
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleZoneDelete = async (id) => {
    try {
      setSaving(true);
      await zoneService.deleteZone(id);
      setZones(prev => prev.filter(zone => zone.id !== id));
      setSnackbar({
        open: true,
        message: 'Zone deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting zone:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete zone',
        severity: 'error'
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSnackbar({
        open: true,
        message: 'Geolocation is not supported by this browser',
        severity: 'error'
      });
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        detectZonesForLocation(location);
        setLocationLoading(false);
        setSnackbar({
          open: true,
          message: 'Location detected successfully',
          severity: 'success'
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationLoading(false);
        let message = 'Failed to get current location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
          default:
            break;
        }
        setSnackbar({
          open: true,
          message,
          severity: 'error'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Detect zones for a given location
  const detectZonesForLocation = (location) => {
    if (!zones.length || !location) return;

    const detected = zones.filter(zone => {
      if (!zone.coordinates || zone.coordinates.length < 3) return false;
      return isPointInPolygon(location, zone.coordinates);
    });

    setDetectedZones(detected);
    
    if (detected.length > 0) {
      setSnackbar({
        open: true,
        message: `Found ${detected.length} zone(s) covering your location`,
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: 'No delivery zones found for your current location',
        severity: 'warning'
      });
    }
  };

  // Check if point is inside polygon using ray casting algorithm
  const isPointInPolygon = (point, polygon) => {
    const x = point.lat;
    const y = point.lng;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat;
      const yi = polygon[i].lng;
      const xj = polygon[j].lat;
      const yj = polygon[j].lng;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  };

  // Re-detect zones when zones or location changes
  useEffect(() => {
    if (currentLocation && zones.length > 0) {
      detectZonesForLocation(currentLocation);
    }
  }, [zones, currentLocation]);

  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Google Maps API Key Required
          </Typography>
          <Typography>
            Please configure your Google Maps API key in the .env file:
          </Typography>
          <Typography component="pre" sx={{ mt: 1, fontFamily: 'monospace' }}>
            REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
          </Typography>
        </Alert>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <MapIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="h1">
              Zone Management
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              startIcon={<LocationIcon />}
              onClick={getCurrentLocation}
              disabled={locationLoading}
              variant="outlined"
              color="primary"
            >
              {locationLoading ? 'Detecting...' : 'Detect My Location'}
            </Button>
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadZones}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Current Location & Detected Zones */}
        {currentLocation && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Location Detected
            </Typography>
            <Typography variant="body2">
              Latitude: {currentLocation.lat.toFixed(6)}, Longitude: {currentLocation.lng.toFixed(6)}
            </Typography>
            {detectedZones.length > 0 && (
              <Box mt={1}>
                <Typography variant="body2" gutterBottom>
                  <strong>Zones covering your location:</strong>
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {detectedZones.map(zone => (
                    <Chip
                      key={zone.id}
                      label={zone.name}
                      color={zone.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Alert>
        )}

        {/* Zone Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Zones
                </Typography>
                <Typography variant="h4">
                  {zones.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Zones
                </Typography>
                <Typography variant="h4" color="success.main">
                  {zones.filter(z => z && z.isActive).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Zones at Location
                </Typography>
                <Typography variant="h4" color={detectedZones.length > 0 ? 'success.main' : 'text.secondary'}>
                  {currentLocation ? detectedZones.length : '-'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg Delivery Fee
                </Typography>
                <Typography variant="h4">
                  ${zones.length > 0 ? (zones.filter(z => z && z.deliveryFee).reduce((sum, z) => sum + z.deliveryFee, 0) / zones.filter(z => z && z.deliveryFee).length).toFixed(2) : '0.00'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Instructions */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            How to use:
          </Typography>
          <Typography variant="body2">
            • Click the polygon tool in the map to start drawing a delivery zone<br/>
            • Click on existing zones to edit their properties<br/>
            • Use the drawing tools to create custom zone boundaries<br/>
            • Configure delivery fees and minimum order amounts for each zone
          </Typography>
        </Alert>

        {/* Google Maps */}
        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={500}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading zones...</Typography>
            </Box>
          ) : (
            <Wrapper
              apiKey={apiKey}
              render={MapLoadingComponent}
              libraries={['drawing']}
            >
              <MapComponent
                zones={zones}
                onZoneCreate={handleZoneCreate}
                onZoneUpdate={handleZoneUpdate}
                onZoneDelete={handleZoneDelete}
                currentLocation={currentLocation}
                detectedZones={detectedZones}
                saving={saving}
              />
            </Wrapper>
          )}
        </Paper>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}