import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Add, Edit, Delete, Save, Cancel, Refresh } from '@mui/icons-material';
import { zoneService } from '../api/zoneService';

// Google Maps API Key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Map component that handles Google Maps integration
function MapComponent({ zones, onZoneCreate, onZoneUpdate, onZoneDelete, selectedZone, setSelectedZone }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [drawingManager, setDrawingManager] = useState(null);
  const [polygons, setPolygons] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map) {
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 19.0760, lng: 72.8777 }, // Mumbai coordinates
        zoom: 11,
        mapTypeId: 'roadmap',
      });
      setMap(googleMap);
    }
  }, [map]);

  // Initialize drawing manager
  useEffect(() => {
    if (map && !drawingManager) {
      const manager = new window.google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
          position: window.google.maps.ControlPosition.TOP_CENTER,
          drawingModes: ['polygon'],
        },
        polygonOptions: {
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          strokeWeight: 2,
          strokeColor: '#FF0000',
          clickable: true,
          editable: true,
          zIndex: 1,
        },
      });
      manager.setMap(map);
      setDrawingManager(manager);

      // Handle polygon completion
      window.google.maps.event.addListener(manager, 'polygoncomplete', (polygon) => {
        setIsDrawing(false);
        const coordinates = polygon.getPath().getArray().map(coord => ({
          lat: coord.lat(),
          lng: coord.lng()
        }));
        
        // Create new zone with polygon coordinates
        const newZone = {
          id: Date.now(),
          name: `Zone ${zones.length + 1}`,
          type: 'delivery',
          coordinates,
          status: true,
          color: '#FF0000'
        };
        
        onZoneCreate(newZone);
        
        // Store polygon reference
        setPolygons(prev => ({ ...prev, [newZone.id]: polygon }));
        
        // Add click listener to polygon
        window.google.maps.event.addListener(polygon, 'click', () => {
          setSelectedZone(newZone.id);
        });
        
        manager.setDrawingMode(null);
      });
    }
  }, [map, drawingManager, zones.length, onZoneCreate, setSelectedZone]);

  // Render existing zones on map
  useEffect(() => {
    if (map && zones.length > 0) {
      // Clear existing polygons
      Object.values(polygons).forEach(polygon => {
        if (polygon.setMap) polygon.setMap(null);
      });
      
      const newPolygons = {};
      
      zones.forEach(zone => {
        if (zone.coordinates && zone.coordinates.length > 0) {
          const polygon = new window.google.maps.Polygon({
            paths: zone.coordinates,
            strokeColor: zone.color || '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: zone.color || '#FF0000',
            fillOpacity: selectedZone === zone.id ? 0.5 : 0.35,
            clickable: true,
            editable: selectedZone === zone.id,
          });
          
          polygon.setMap(map);
          newPolygons[zone.id] = polygon;
          
          // Add click listener
          window.google.maps.event.addListener(polygon, 'click', () => {
            setSelectedZone(zone.id);
          });
          
          // Add path change listener for editing
          if (selectedZone === zone.id) {
            window.google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
              updateZoneCoordinates(zone.id, polygon);
            });
            window.google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
              updateZoneCoordinates(zone.id, polygon);
            });
          }
        }
      });
      
      setPolygons(newPolygons);
    }
  }, [map, zones, selectedZone]);

  const updateZoneCoordinates = (zoneId, polygon) => {
    const coordinates = polygon.getPath().getArray().map(coord => ({
      lat: coord.lat(),
      lng: coord.lng()
    }));
    onZoneUpdate(zoneId, { coordinates });
  };

  const startDrawing = () => {
    if (drawingManager) {
      drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
      setIsDrawing(true);
    }
  };

  const deleteSelectedZone = () => {
    if (selectedZone && polygons[selectedZone]) {
      polygons[selectedZone].setMap(null);
      onZoneDelete(selectedZone);
      setSelectedZone(null);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} mb={2}>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={startDrawing}
          disabled={isDrawing}
        >
          {isDrawing ? 'Drawing...' : 'Draw New Zone'}
        </Button>
        {selectedZone && (
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<Delete />} 
            onClick={deleteSelectedZone}
          >
            Delete Selected Zone
          </Button>
        )}
      </Stack>
      <Paper elevation={3}>
        <div ref={mapRef} style={{ height: '500px', width: '100%' }} />
      </Paper>
    </Box>
  );
}

// Zone properties editor
function ZoneEditor({ zone, onUpdate, onClose, saving }) {
  const [formData, setFormData] = useState({
    name: zone?.name || '',
    type: zone?.type || 'delivery',
    color: zone?.color || '#FF0000',
    status: zone?.status ?? true,
    description: zone?.description || ''
  });

  const handleSave = () => {
    onUpdate(zone.id, formData);
    onClose();
  };

  return (
    <Dialog open={!!zone} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Edit />
          <Typography>Edit Zone: {zone?.name}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={2}>
          <TextField
            label="Zone Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
          />
          
          <FormControl fullWidth>
            <InputLabel>Zone Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              label="Zone Type"
            >
              <MenuItem value="delivery">Delivery Zone</MenuItem>
              <MenuItem value="pickup">Pickup Zone</MenuItem>
              <MenuItem value="restricted">Restricted Zone</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Zone Color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
            fullWidth
          />
          
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            multiline
            rows={3}
            fullWidth
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
              />
            }
            label="Zone Active"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<Cancel />} disabled={saving}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          startIcon={saving ? <CircularProgress size={16} /> : <Save />}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Main Zone Map Manager component
function ZoneMapManager() {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [editingZone, setEditingZone] = useState(null);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [saving, setSaving] = useState(false);

  // Load zones from backend
  const loadZones = useCallback(async () => {
    setLoading(true);
    try {
      const result = await zoneService.getAllZones();
      if (result.success) {
        setZones(result.data);
        setSnackbar({ open: true, message: 'Zones loaded successfully', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: result.message, severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load zones', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleZoneCreate = useCallback(async (newZone) => {
    setSaving(true);
    try {
      const result = await zoneService.createZone(newZone);
      if (result.success) {
        setZones(prev => [...prev, result.data]);
        setSnackbar({ open: true, message: 'Zone created successfully', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: result.message, severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create zone', severity: 'error' });
    } finally {
      setSaving(false);
    }
  }, []);

  const handleZoneUpdate = useCallback(async (zoneId, updates) => {
    setSaving(true);
    try {
      const result = await zoneService.updateZone(zoneId, updates);
      if (result.success) {
        setZones(prev => prev.map(zone => 
          zone.id === zoneId ? { ...zone, ...updates } : zone
        ));
        setSnackbar({ open: true, message: 'Zone updated successfully', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: result.message, severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update zone', severity: 'error' });
    } finally {
      setSaving(false);
    }
  }, []);

  const handleZoneDelete = useCallback(async (zoneId) => {
    setSaving(true);
    try {
      const result = await zoneService.deleteZone(zoneId);
      if (result.success) {
        setZones(prev => prev.filter(zone => zone.id !== zoneId));
        setSelectedZone(null);
        setSnackbar({ open: true, message: 'Zone deleted successfully', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: result.message, severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete zone', severity: 'error' });
    } finally {
      setSaving(false);
    }
  }, []);

  const selectedZoneData = zones.find(zone => zone.id === selectedZone);

  // Load zones on component mount
  useEffect(() => {
    loadZones();
  }, [loadZones]);

  // Check if Google Maps API is loaded
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
      setApiKeyError(true);
    }
  }, []);

  if (apiKeyError) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Google Maps API Key Required</Typography>
          <Typography>
            To use the zone mapping feature, please add your Google Maps API key to the component.
            You'll need to:
          </Typography>
          <ul>
            <li>Get a Google Maps API key from Google Cloud Console</li>
            <li>Enable Maps JavaScript API and Drawing Library</li>
            <li>Replace 'YOUR_GOOGLE_MAPS_API_KEY' in the component</li>
          </ul>
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Loading zones...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Zone Management with Google Maps
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadZones}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Click on zones to select them, use the drawing tools to create new zones, and edit zone properties in the sidebar.
      </Alert>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        {/* Map Section */}
        <Box flex={1}>
          <Wrapper apiKey={GOOGLE_MAPS_API_KEY} libraries={['drawing']}>
            <MapComponent
              zones={zones}
              onZoneCreate={handleZoneCreate}
              onZoneUpdate={handleZoneUpdate}
              onZoneDelete={handleZoneDelete}
              selectedZone={selectedZone}
              setSelectedZone={setSelectedZone}
            />
          </Wrapper>
        </Box>

        {/* Zone List Sidebar */}
        <Box width={{ xs: '100%', lg: '300px' }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Zones ({zones.length})</Typography>
            <Stack spacing={2}>
              {zones.map(zone => (
                <Paper
                  key={zone.id}
                  elevation={selectedZone === zone.id ? 3 : 1}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: selectedZone === zone.id ? '2px solid #1976d2' : 'none',
                    '&:hover': { elevation: 2 }
                  }}
                  onClick={() => setSelectedZone(zone.id)}
                >
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Box
                      width={16}
                      height={16}
                      bgcolor={zone.color}
                      borderRadius={1}
                    />
                    <Typography variant="subtitle2">{zone.name}</Typography>
                    <Chip
                      size="small"
                      label={zone.status ? 'Active' : 'Inactive'}
                      color={zone.status ? 'success' : 'default'}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Type: {zone.type}
                  </Typography>
                  {zone.description && (
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {zone.description}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1} mt={2}>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingZone(zone);
                      }}
                    >
                      Edit
                    </Button>
                  </Stack>
                </Paper>
              ))}
              {zones.length === 0 && (
                <Typography color="text.secondary" textAlign="center">
                  No zones created yet. Use the drawing tool to create your first zone.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Box>
      </Stack>

      {/* Zone Editor Dialog */}
      {editingZone && (
        <ZoneEditor
          zone={editingZone}
          onUpdate={handleZoneUpdate}
          onClose={() => setEditingZone(null)}
          saving={saving}
        />
      )}

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

export default ZoneMapManager;