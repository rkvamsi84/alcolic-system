import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  LocationOn,
  MyLocation,
  Store,
  DirectionsCar,
  AccessTime,
  FlashOn,
  Battery90,
  SignalCellular4Bar,
  ExpandMore,
  Refresh,
  Map,
  GpsFixed,
  LocationSearching,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLocation } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const LocationServicesPage = () => {
  const {
    currentLocation,
    currentZone,
    locationPermission,
    isLoading,
    nearbyStores,
    deliveryZones,
    getCurrentLocation,
    getZoneForLocation,
    getNearbyStores,
    isLocationInDeliveryZone,
    calculateDistance,
    fetchDeliveryZones,
    watchLocation,
    clearLocationWatch,
    getAddressFromCoordinates,
  } = useLocation();

  const { user, token } = useAuth();

  const [watchId, setWatchId] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const [address, setAddress] = useState(null);
  const [expanded, setExpanded] = useState('panel1');

  useEffect(() => {
    // Only fetch delivery zones if user is authenticated
    if (user && token) {
      fetchDeliveryZones();
    }
  }, [fetchDeliveryZones, user, token]);

  useEffect(() => {
    // Get address from current location
    if (currentLocation && currentLocation.lat && currentLocation.lng) {
      getAddressFromCoordinates(currentLocation).then(setAddress);
    }
  }, [currentLocation, getAddressFromCoordinates]);

  const handleGetLocation = async () => {
    const location = await getCurrentLocation({
      highAccuracy: true,
      timeout: 15000,
    });
    
    if (location) {
      // Get zone and nearby stores automatically
      await getZoneForLocation(location);
      await getNearbyStores(location, 2000000, true); // Skip zone check since we already got zone info
    }
  };

  const handleStartWatching = () => {
    const id = watchLocation((newLocation) => {
      console.log('Location updated:', newLocation);
      toast.success('Location updated');
    }, {
      highAccuracy: true,
      timeout: 10000,
    });
    
    setWatchId(id);
    setIsWatching(true);
    toast.success('Location tracking started');
  };

  const handleStopWatching = () => {
    if (watchId) {
      clearLocationWatch(watchId);
      setWatchId(null);
      setIsWatching(false);
      toast.success('Location tracking stopped');
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getPermissionStatusColor = () => {
    switch (locationPermission) {
      case 'granted':
        return 'success';
      case 'denied':
        return 'error';
      case 'prompt':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPermissionStatusText = () => {
    switch (locationPermission) {
      case 'granted':
        return 'Location Access Granted';
      case 'denied':
        return 'Location Access Denied';
      case 'prompt':
        return 'Location Access Pending';
      default:
        return 'Location Access Unknown';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Location Services
        </Typography>

        {/* Permission Status */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <GpsFixed sx={{ mr: 1 }} />
              <Typography variant="h6">Location Permission</Typography>
            </Box>
            <Chip
              label={getPermissionStatusText()}
              color={getPermissionStatusColor()}
              sx={{ mb: 2 }}
            />
            {locationPermission === 'denied' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Location access is required for delivery services. Please enable location access in your browser settings.
              </Alert>
            )}
            <Button
              variant="contained"
              startIcon={<MyLocation />}
              onClick={handleGetLocation}
              disabled={isLoading}
              sx={{ mr: 2 }}
            >
              {isLoading ? 'Getting Location...' : 'Get Current Location'}
            </Button>
            {isWatching ? (
              <Button
                variant="outlined"
                color="error"
                onClick={handleStopWatching}
                startIcon={<FlashOn />}
              >
                Stop Tracking
              </Button>
            ) : (
              <Button
                variant="outlined"
                onClick={handleStartWatching}
                startIcon={<LocationSearching />}
              >
                Start Tracking
              </Button>
            )}
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Current Location */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ mr: 1 }} />
                  <Typography variant="h6">Current Location</Typography>
                </Box>
                
                {currentLocation ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Coordinates
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </Typography>
                    
                    {currentLocation.accuracy && (
                      <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Accuracy
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          ±{Math.round(currentLocation.accuracy)} meters
                        </Typography>
                      </>
                    )}

                    {address && (
                      <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Address
                        </Typography>
                        <Box sx={{ pl: 1 }}>
                          {address.street_number && address.route && (
                            <Typography variant="body1" gutterBottom>
                              <strong>Street:</strong> {address.street_number} {address.route}
                            </Typography>
                          )}
                          {address.locality && (
                            <Typography variant="body1" gutterBottom>
                              <strong>City:</strong> {address.locality}
                            </Typography>
                          )}
                          {address.administrative_area_level_1 && (
                            <Typography variant="body1" gutterBottom>
                              <strong>State:</strong> {address.administrative_area_level_1}
                            </Typography>
                          )}
                          {address.postal_code && (
                            <Typography variant="body1" gutterBottom>
                              <strong>Postal Code:</strong> {address.postal_code}
                            </Typography>
                          )}
                          {address.country && (
                            <Typography variant="body1" gutterBottom>
                              <strong>Country:</strong> {address.country}
                            </Typography>
                          )}
                          {address.formatted_address && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                              Full Address: {address.formatted_address}
                            </Typography>
                          )}
                        </Box>
                      </>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No location detected. Click "Get Current Location" to start.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Current Zone */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Map sx={{ mr: 1 }} />
                  <Typography variant="h6">Delivery Zone</Typography>
                </Box>
                
                {currentZone ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Zone Information
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {currentZone.zone_data?.[0]?.name || 'Unknown Zone'}
                    </Typography>
                    
                    {currentZone.zone_data?.[0] && (
                      <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Shipping Charges
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Min: ${currentZone.zone_data[0].minimum_shipping_charge} | 
                          Per km: ${currentZone.zone_data[0].per_km_shipping_charge}
                        </Typography>
                      </>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No zone information available.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Nearby Stores */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Store sx={{ mr: 1 }} />
                  <Typography variant="h6">Nearby Stores</Typography>
                  <IconButton
                    size="small"
                    onClick={() => currentLocation && getNearbyStores(currentLocation, 2000000, true)}
                    sx={{ ml: 'auto' }}
                  >
                    <Refresh />
                  </IconButton>
                </Box>
                
                {nearbyStores.length > 0 ? (
                  <List>
                    {nearbyStores.map((store, index) => (
                      <React.Fragment key={store._id || index}>
                        <ListItem>
                          <ListItemIcon>
                            <Store />
                          </ListItemIcon>
                          <ListItemText
                            primary={store.name}
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  {store.address}
                                </Typography>
                                {store.distance && (
                                  <Typography variant="body2" color="text.secondary">
                                    {formatDistance(store.distance)} away
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <Chip
                            label={store.isOpen ? 'Open' : 'Closed'}
                            color={store.isOpen ? 'success' : 'error'}
                            size="small"
                          />
                        </ListItem>
                        {index < nearbyStores.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No nearby stores found.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Delivery Zones */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Available Delivery Zones
                </Typography>
                
                {deliveryZones.length > 0 ? (
                  <Accordion
                    expanded={expanded === 'panel1'}
                    onChange={handleAccordionChange('panel1')}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography>View All Zones ({deliveryZones.length})</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {deliveryZones.map((zone) => (
                          <Grid item xs={12} sm={6} md={4} key={zone.id}>
                            <Paper sx={{ p: 2 }}>
                              <Typography variant="subtitle1" gutterBottom>
                                {zone.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Min Shipping: ${zone.minimum_shipping_charge}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Per km: ${zone.per_km_shipping_charge}
                              </Typography>
                              <Chip
                                label={zone.status === 1 ? 'Active' : 'Inactive'}
                                color={zone.status === 1 ? 'success' : 'default'}
                                size="small"
                                sx={{ mt: 1 }}
                              />
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No delivery zones available.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default LocationServicesPage;