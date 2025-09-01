import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Divider,
  Grid,
} from '@mui/material';
import {
  LocationOn,
  Search,
  MyLocation,
  Info,
  CheckCircle,
  Refresh,
  Map as MapIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLocation } from '../../contexts/LocationContext';
import { toast } from 'react-hot-toast';

const ZoneSelector = ({ showAsCard = true, compact = false }) => {
  console.log('🔍 ZoneSelector: Component rendering...');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [allZones, setAllZones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    currentLocation,
    currentZone,
    getAllZones,
    detectZoneFromAddress,
    getCurrentLocation,

    locationPermission,
    isLoading: locationLoading,
    setCurrentZone,
    getNearbyStores,
    getStoresForZone
  } = useLocation();

  // Load all zones on component mount
  const loadAllZones = useCallback(async () => {
    console.log('🔍 ZoneSelector: loadAllZones called');
    setIsLoading(true);
    try {
      const zones = await getAllZones();
      console.log('🔍 ZoneSelector: Received zones:', zones);
      setAllZones(zones || []);
      if (!zones || zones.length === 0) {
        toast.error('No delivery zones available');
      }
    } catch (error) {
      console.error('Error loading zones:', error);
      toast.error('Failed to load delivery zones');
      setAllZones([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('🔍 ZoneSelector: Component mounted, loading zones...');
    console.log('🔍 ZoneSelector: useLocation context:', { currentLocation, currentZone });
    loadAllZones();
  }, [loadAllZones]);



  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) {
      toast.error('Please enter an address');
      return;
    }

    setIsLoading(true);
    try {
      await detectZoneFromAddress(searchAddress.trim());
    } catch (error) {
      console.error('Error searching address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      // getCurrentLocation already calls getZoneForLocation and getNearbyStores internally
      // No need to call checkZoneCoverage again as it would conflict with the zone detection
      if (location) {
        toast.success('Location detected and zone assigned successfully');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      toast.error('Failed to get current location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchAddress();
    }
  };

  const handleZoneSelect = async (zone) => {
    try {
      setIsLoading(true);
      
      // Set the selected zone
      const selectedZone = {
        id: zone.id,
        name: zone.name,
        distance: 0, // User manually selected, so distance is not relevant
        inPolygon: true,
        inRange: true
      };
      
      setCurrentZone(selectedZone);
      
      // Get stores for this specific zone
      try {
        const stores = await getStoresForZone(zone.id);
        console.log(`Found ${stores.length} stores in ${zone.name}`);
      } catch (storeError) {
        console.error('Error fetching zone stores:', storeError);
        toast.error('Failed to load stores for selected zone');
      }
      
      toast.success(`Selected ${zone.name} as your delivery zone`);
      
      // Close dialog if in compact mode
      if (compact) {
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Error selecting zone:', error);
      toast.error('Failed to select zone. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ZoneCard = ({ zone, isCurrentZone = false, onZoneSelect }) => (
    <Card 
      variant={isCurrentZone ? "elevation" : "outlined"}
      sx={{ 
        mb: 2, 
        border: isCurrentZone ? `2px solid ${theme.palette.primary.main}` : undefined,
        backgroundColor: isCurrentZone ? theme.palette.primary.light + '10' : undefined
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h6" component="div">
            {zone.name}
            {isCurrentZone && (
              <Chip 
                label="Your Zone" 
                color="primary" 
                size="small" 
                sx={{ ml: 1 }}
                icon={<CheckCircle />}
              />
            )}
          </Typography>
          <Chip 
            label={zone.status === 1 ? 'Active' : 'Inactive'}
            color={zone.status === 1 ? 'success' : 'default'}
            size="small"
          />
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Delivery Time:</strong> {zone.delivery_time_min}-{zone.delivery_time_max} mins
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Min Order:</strong> ₹{zone.minimum_order}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Delivery Fee:</strong> ₹{zone.minimum_shipping_charge} + ₹{zone.per_km_shipping_charge}/km
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Max Distance:</strong> {zone.maximum_distance}km
            </Typography>
          </Grid>
        </Grid>
        
        {isCurrentZone && currentLocation && (
          <Box mt={2}>
            <Alert severity="success" icon={<LocationOn />}>
              You are currently in this delivery zone
            </Alert>
          </Box>
        )}
        
        {/* Zone Selection Button */}
        <Box mt={2}>
          <Button
            fullWidth
            variant={isCurrentZone ? "outlined" : "contained"}
            color="primary"
            onClick={() => onZoneSelect(zone)}
            disabled={isLoading || (isCurrentZone && currentLocation)}
            startIcon={isCurrentZone ? <CheckCircle /> : <LocationOn />}
          >
            {isCurrentZone && currentLocation 
              ? 'Current Zone' 
              : isCurrentZone 
                ? 'Select This Zone'
                : 'Select Zone'
            }
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const content = (
    <Box>
      {/* Current Zone Status */}
      {currentZone ? (
        <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircle />}>
          <Typography variant="subtitle2">
            Current Zone: <strong>{currentZone.name}</strong>
          </Typography>
          {currentZone.distance && (
            <Typography variant="body2">
              Distance from zone center: {currentZone.distance}km
            </Typography>
          )}
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }} icon={<Info />}>
          <Typography variant="subtitle2">
            No zone detected. Search by address or enable location services.
          </Typography>
        </Alert>
      )}

      {/* Address Search */}
      <Box mb={3}>
        <TextField
          fullWidth
          label="Search by Address"
          placeholder="Enter your address to find delivery zone"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={handleSearchAddress}
                  disabled={isLoading || !searchAddress.trim()}
                >
                  {isLoading ? <CircularProgress size={20} /> : <Search />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Location Button */}
      <Box mb={3}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={locationLoading ? <CircularProgress size={20} /> : <MyLocation />}
          onClick={handleGetCurrentLocation}
          disabled={locationLoading || locationPermission === 'denied'}
        >
          {locationPermission === 'denied' 
            ? 'Location Access Denied' 
            : 'Use Current Location'
          }
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Available Zones */}
      <Typography variant="h6" gutterBottom>
        Available Delivery Zones
      </Typography>
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : allZones.length > 0 ? (
        <Box>
          {allZones.map((zone) => (
            <ZoneCard 
              key={zone.id} 
              zone={zone} 
              isCurrentZone={currentZone?.id === zone.id}
              onZoneSelect={handleZoneSelect}
            />
          ))}
        </Box>
      ) : (
        <Alert severity="warning">
          No delivery zones available at the moment.
        </Alert>
      )}

      {/* Refresh Button */}
      <Box mt={2}>
        <Button
          fullWidth
          variant="text"
          startIcon={<Refresh />}
          onClick={loadAllZones}
          disabled={isLoading}
        >
          Refresh Zones
        </Button>
      </Box>
    </Box>
  );

  if (compact) {
    return (
      <Box>
        <Button
          variant="outlined"
          startIcon={<MapIcon />}
          onClick={() => setDialogOpen(true)}
          fullWidth={isMobile}
        >
          {currentZone ? `Zone: ${currentZone.name}` : 'Select Delivery Zone'}
        </Button>
        
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            Delivery Zones
          </DialogTitle>
          <DialogContent>
            {content}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  if (showAsCard) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom display="flex" alignItems="center">
              <MapIcon sx={{ mr: 1 }} />
              Delivery Zones
            </Typography>
            {content}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return content;
};

export default ZoneSelector;