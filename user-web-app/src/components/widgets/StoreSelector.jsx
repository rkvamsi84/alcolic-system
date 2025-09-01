import React, { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Store as StoreIcon,
  LocationOn,
  Schedule,
  Close,
  CheckCircle,
  Refresh,
  MyLocation,
  Map as MapIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useStore } from '../../contexts/StoreContext';
import { useLocation } from '../../contexts/LocationContext';
import { toast } from 'react-hot-toast';
import ZoneSelector from './ZoneSelector';

const StoreSelector = ({ showAsCard = true, compact = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  const [locationWatchId, setLocationWatchId] = useState(null);
  
  const {
    availableStores,
    selectedStore,
    selectStore,
    hasSelectedStore,
    isLoading: storeLoading
  } = useStore();

  const {
    currentLocation,
    getCurrentLocation,
    getNearbyStores,
    currentZone,
    checkZoneCoverage,
    locationPermission,
    watchLocation,
    clearLocationWatch,
    isLoading: locationLoading
  } = useLocation();

  // Automatically request location when component mounts and watch for changes
  useEffect(() => {
    console.log('StoreSelector: useEffect triggered');
    console.log('StoreSelector: hasRequestedLocation:', hasRequestedLocation);
    console.log('StoreSelector: currentLocation:', currentLocation);
    console.log('StoreSelector: locationPermission:', locationPermission);
    console.log('StoreSelector: availableStores.length:', availableStores.length);
    
    const requestLocationOnMount = async () => {
      // Only request if we haven't already requested and don't have location
      if (!hasRequestedLocation && !currentLocation && locationPermission !== 'denied') {
        console.log('StoreSelector: Requesting location for first time');
        setHasRequestedLocation(true);
        try {
          const location = await getCurrentLocation({
            highAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          });
          console.log('StoreSelector: Got location:', location);
          if (location) {
            await getNearbyStores(location); // Don't skip zone check for fresh location // Don't skip zone check for fresh location // Don't skip zone check for fresh location
            
            // Start watching for location changes
            if (watchLocation && !locationWatchId) {
              console.log('StoreSelector: Starting location watch');
              const watchId = watchLocation(async (newLocation) => {
                console.log('StoreSelector: Location changed:', newLocation);
                // Check if location changed significantly (more than 100 meters)
                if (currentLocation) {
                  const distance = calculateDistance(
                    currentLocation.lat, currentLocation.lng,
                    newLocation.lat, newLocation.lng
                  );
                  if (distance > 100) { // 100 meters threshold
                    console.log('StoreSelector: Significant location change detected, updating stores');
                    await getNearbyStores(newLocation); // Don't skip zone check for location changes
                    toast('Location updated - refreshing nearby stores', { icon: '📍' });
                  }
                }
              }, {
                highAccuracy: true,
                timeout: 15000,
                maximumAge: 60000 // 1 minute
              });
              setLocationWatchId(watchId);
            }
          }
        } catch (error) {
          console.log('Location request failed or was denied:', error);
          // Fallback to default location (New York City)
          const fallbackLocation = { lat: 40.7128, lng: -74.0060 };
          console.log('StoreSelector: Using fallback location:', fallbackLocation);
          try {
            await getNearbyStores(fallbackLocation); // Don't skip zone check for fallback location
            toast('Using default location. Enable location services for better results.', { icon: 'ℹ️' });
          } catch (fallbackError) {
            console.error('Fallback location also failed:', fallbackError);
          }
        }
      } else if (currentLocation && availableStores.length === 0) {
        // If we have location but no stores, try to fetch stores
        console.log('StoreSelector: Have location but no stores, fetching...');
        try {
          await getNearbyStores(currentLocation, 2000000, true); // Skip zone check since location is already known
        } catch (error) {
          console.log('Failed to fetch stores with existing location:', error);
        }
      } else if (!hasRequestedLocation && !currentLocation && availableStores.length === 0) {
        // If location is denied or unavailable, use fallback
        console.log('StoreSelector: No location and no stores, using fallback');
        setHasRequestedLocation(true);
        const fallbackLocation = { lat: 40.7128, lng: -74.0060 };
        try {
          await getNearbyStores(fallbackLocation);
          toast('Using default location. Enable location services for personalized results.', { icon: 'ℹ️' });
        } catch (fallbackError) {
          console.error('Fallback location failed:', fallbackError);
        }
      } else {
        console.log('StoreSelector: No action needed - conditions not met');
      }
    };

    requestLocationOnMount();
    
    // Cleanup function to clear location watch
    return () => {
      if (locationWatchId && clearLocationWatch) {
        console.log('StoreSelector: Clearing location watch');
        clearLocationWatch(locationWatchId);
        setLocationWatchId(null);
      }
    };
  }, [hasRequestedLocation, currentLocation, locationPermission, availableStores.length]);

  const handleStoreSelect = (store) => {
    selectStore(store);
    setDialogOpen(false);
  };

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Convert to meters
  };

  const handleRefreshStores = async () => {
    if (currentLocation) {
      await getNearbyStores(currentLocation, 2000000, true); // Skip zone check since location is already known
    } else {
      // Try to get location first
      try {
        const location = await getCurrentLocation({
          highAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // 1 minute
        });
        if (location) {
          await getNearbyStores(location);
        }
      } catch (error) {
        if (locationPermission === 'denied') {
          toast.error('Location access denied. Please enable location services in your browser settings to see nearby stores.');
        } else {
          toast.error('Unable to get your location. Please enable location services to find nearby stores.');
        }
      }
    }
  };

  const handleRequestLocation = async () => {
    try {
      const location = await getCurrentLocation({
        highAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Force fresh location
      });
      if (location) {
        await getNearbyStores(location);
        toast.success('Location enabled! Nearby stores loaded.');
      }
    } catch (error) {
      if (locationPermission === 'denied') {
        toast.error('Location access denied. Please enable location services in your browser settings.');
      } else {
        toast.error('Failed to get location. Please try again.');
      }
    }
  };

  const formatDistance = (distance) => {
    if (!distance) return '';
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const getStoreStatus = (store) => {
    // Simple business hours check (you can enhance this with actual business hours logic)
    const currentHour = new Date().getHours();
    const isOpen = currentHour >= 9 && currentHour <= 22; // Assuming 9 AM to 10 PM
    return isOpen ? 'Open' : 'Closed';
  };

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StoreIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        <Typography variant="body2" color="text.secondary">
          {hasSelectedStore() ? selectedStore.name : 'No store selected'}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={() => setDialogOpen(true)}
          sx={{ ml: 1 }}
        >
          {hasSelectedStore() ? 'Change' : 'Select'}
        </Button>
        
        <StoreSelectionDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onStoreSelect={handleStoreSelect}
          availableStores={availableStores}
          selectedStore={selectedStore}
          onRefresh={handleRefreshStores}
          onRequestLocation={handleRequestLocation}
          isLoading={storeLoading || locationLoading}
          currentLocation={currentLocation}
          locationPermission={locationPermission}
          currentZone={currentZone}
        />
      </Box>
    );
  }

  if (!showAsCard) {
    return (
      <>
        <Button
          variant="outlined"
          startIcon={<StoreIcon />}
          onClick={() => setDialogOpen(true)}
          fullWidth={isMobile}
          sx={{
            justifyContent: 'flex-start',
            textAlign: 'left',
            p: 2,
            borderRadius: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2">
              {hasSelectedStore() ? selectedStore.name : 'Select a Store'}
            </Typography>
            {hasSelectedStore() && (
              <Typography variant="body2" color="text.secondary">
                {typeof selectedStore.address === 'string' 
                  ? selectedStore.address || 'Store location'
                  : selectedStore.address 
                    ? `${selectedStore.address.street || ''}, ${selectedStore.address.city || ''}, ${selectedStore.address.state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Store location'
                    : 'Store location'
                }
              </Typography>
            )}
          </Box>
        </Button>
        
        <StoreSelectionDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onStoreSelect={handleStoreSelect}
          availableStores={availableStores}
          selectedStore={selectedStore}
          onRefresh={handleRefreshStores}
          isLoading={storeLoading || locationLoading}
          currentLocation={currentLocation}
          locationPermission={locationPermission}
          currentZone={currentZone}
        />
      </>
    );
  }

  return (
    <>
      <Card 
        sx={{ 
          mb: 2,
          border: hasSelectedStore() ? '2px solid' : '1px solid',
          borderColor: hasSelectedStore() ? 'primary.main' : 'divider',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 2,
            borderColor: 'primary.main',
          }
        }}
        component={motion.div}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setDialogOpen(true)}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <StoreIcon 
              sx={{ 
                color: hasSelectedStore() ? 'primary.main' : 'text.secondary',
                fontSize: 32 
              }} 
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                {hasSelectedStore() ? selectedStore.name : 'Select Your Store'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {hasSelectedStore() 
                  ? `${typeof selectedStore.address === 'string' 
                      ? selectedStore.address || 'Store location'
                      : selectedStore.address 
                        ? `${selectedStore.address.street || ''}, ${selectedStore.address.city || ''}, ${selectedStore.address.state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Store location'
                        : 'Store location'
                    } • ${formatDistance(selectedStore.distance)} away`
                  : 'Choose from nearby stores for delivery'
                }
              </Typography>
              {/* Zone info will be shown in the main card */}
            </Box>
            {hasSelectedStore() && (
              <Chip
                label={getStoreStatus(selectedStore)}
                color={getStoreStatus(selectedStore) === 'Open' ? 'success' : 'default'}
                size="small"
              />
            )}
          </Box>
        </CardContent>
      </Card>
      
      <StoreSelectionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onStoreSelect={handleStoreSelect}
        availableStores={availableStores}
        selectedStore={selectedStore}
        onRefresh={handleRefreshStores}
        onRequestLocation={handleRequestLocation}
        isLoading={storeLoading || locationLoading}
        currentLocation={currentLocation}
        locationPermission={locationPermission}
        currentZone={currentZone}
      />
    </>
  );
};

const StoreSelectionDialog = ({ 
  open, 
  onClose, 
  onStoreSelect, 
  availableStores, 
  selectedStore, 
  onRefresh, 
  onRequestLocation,
  isLoading,
  currentLocation,
  locationPermission,
  currentZone
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const formatDistance = (distance) => {
    if (!distance) return '';
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const getStoreStatus = (store) => {
    const currentHour = new Date().getHours();
    const isOpen = currentHour >= 9 && currentHour <= 22;
    return isOpen ? 'Open' : 'Closed';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        Select Your Store
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={onRefresh}
            disabled={isLoading}
            size="small"
          >
            {isLoading ? <CircularProgress size={20} /> : <Refresh />}
          </IconButton>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {/* Zone Information in Dialog */}
        {currentZone && (
          <Box sx={{ p: 2, pb: 0 }}>
            <Alert severity="success" icon={<MapIcon />}>
              <Typography variant="subtitle2">
                Current Zone: <strong>{currentZone.name}</strong>
              </Typography>
              {currentZone.distance && (
                <Typography variant="body2">
                  Distance from zone center: {currentZone.distance}km
                </Typography>
              )}
            </Alert>
          </Box>
        )}
        
        {availableStores.length === 0 ? (
          <Box>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              {!currentLocation ? (
                // No location available
                <>
                  <MyLocation sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Location Required
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {locationPermission === 'denied' 
                      ? 'Location access is denied. Please enable location services in your browser settings to see nearby stores.'
                      : 'Enable location services to find stores near you and get faster delivery.'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {locationPermission !== 'denied' && (
                      <Button
                        variant="contained"
                        startIcon={<MyLocation />}
                        onClick={onRequestLocation}
                        disabled={isLoading}
                      >
                        Enable Location
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={onRefresh}
                      disabled={isLoading}
                    >
                      Try Again
                    </Button>
                  </Box>
                </>
              ) : (
                // Has location but no stores found
                <>
                  <StoreIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No stores found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    We couldn't find any stores in your area. Please try refreshing or check back later.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={onRefresh}
                    disabled={isLoading}
                  >
                    Refresh Stores
                  </Button>
                </>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Show Zone Selector when no stores available */}
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Available Delivery Zones
              </Typography>
              <ZoneSelector showAsCard={false} compact={true} />
            </Box>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {availableStores
              .sort((a, b) => (a.distance || 0) - (b.distance || 0))
              .map((store) => {
                const isSelected = selectedStore?._id === store._id;
                const storeStatus = getStoreStatus(store);
                
                return (
                  <ListItem key={store._id} disablePadding>
                    <ListItemButton
                      onClick={() => onStoreSelect(store)}
                      selected={isSelected}
                      sx={{
                        py: 2,
                        px: 3,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&.Mui-selected': {
                          backgroundColor: 'primary.50',
                          borderLeft: '4px solid',
                          borderLeftColor: 'primary.main',
                        }
                      }}
                    >
                      <ListItemIcon>
                        {isSelected ? (
                          <CheckCircle color="primary" />
                        ) : (
                          <StoreIcon color="action" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              {store.name}
                            </Typography>
                            <Chip
                              label={storeStatus}
                              color={storeStatus === 'Open' ? 'success' : 'default'}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {typeof store.address === 'string' 
                                  ? store.address || 'Store location'
                                  : store.address 
                                    ? `${store.address.street || ''}, ${store.address.city || ''}, ${store.address.state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Store location'
                                    : 'Store location'
                                }
                              </Typography>
                            </Box>
                            {store.distance && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {formatDistance(store.distance)} away • Delivery in 30-45 min
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                              {store.distance && (
                                <Chip 
                                  label={formatDistance(store.distance)} 
                                  size="small" 
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                              {store.zoneId && (
                                <Chip 
                                  label={`Zone ${store.zoneId}`} 
                                  size="small" 
                                  color="secondary"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })
            }
          </List>
        )}
      </DialogContent>
      
      {availableStores.length > 0 && (
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Alert severity="info" sx={{ flex: 1, mr: 2 }}>
            <Typography variant="body2">
              Select the store closest to you for faster delivery
            </Typography>
          </Alert>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default StoreSelector;