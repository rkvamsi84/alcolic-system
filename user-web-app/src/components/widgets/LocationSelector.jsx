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
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Divider,
  Collapse,
  Avatar,
} from '@mui/material';
import {
  LocationOn,
  Search,
  MyLocation,
  Store as StoreIcon,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  Warning,
  LocationOff,
} from '@mui/icons-material';

import { useLocation } from '../../contexts/LocationContext';
import { useStore } from '../../contexts/StoreContext';
import { toast } from 'react-hot-toast';

const LocationSelector = ({ showAsCard = true, compact = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [allZones, setAllZones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [zoneStores, setZoneStores] = useState([]);
  const [showStores, setShowStores] = useState(false);
  
  const {
    currentZone,
    getAllZones,
    detectZoneFromAddress,
    requestLocationPermission,
    locationPermission,
    isLoading: locationLoading,
    setCurrentZone,
    getStoresForZone,
    initializeLocationServices
  } = useLocation();

  const {
    selectedStore,
    selectStore,
    hasSelectedStore
  } = useStore();

  // Load all zones on component mount
  const loadAllZones = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('LocationSelector: Starting to load zones...');
      const zones = await getAllZones();
      console.log('LocationSelector: Received zones:', zones);
      setAllZones(zones || []);
      if (!zones || zones.length === 0) {
        console.error('LocationSelector: No zones received from API');
        toast.error('No delivery zones available');
      } else {
        console.log(`LocationSelector: Successfully loaded ${zones.length} zones`);
      }
    } catch (error) {
      console.error('LocationSelector: Error loading zones:', error);
      toast.error('Failed to load delivery zones');
      setAllZones([]);
    } finally {
      setIsLoading(false);
    }
  }, [getAllZones]);

  useEffect(() => {
    loadAllZones();
  }, [loadAllZones]);



  // Auto-detect location when zones are loaded and no zone is selected
  // Only trigger if user has explicitly granted permission and not too frequently
  useEffect(() => {
    // Only auto-detect if user has explicitly granted permission and we have zones but no current zone
    if (allZones.length > 0 && !currentZone && locationPermission === 'granted') {
      console.log('LocationSelector: Zones loaded, no zone selected, auto-detecting location...');
      // Use a timeout to prevent immediate execution and potential loops
      const timer = setTimeout(() => {
        // Only auto-detect if we haven't tried recently
        const lastAttempt = localStorage.getItem('last_location_attempt');
        const now = Date.now();
        if (!lastAttempt || (now - parseInt(lastAttempt)) > 30000) { // 30 seconds cooldown
          localStorage.setItem('last_location_attempt', now.toString());
          requestLocationPermission();
        } else {
          console.log('LocationSelector: Skipping auto-detection due to recent attempt');
        }
      }, 3000); // Increased delay to be less aggressive
      
      return () => clearTimeout(timer);
    }
  }, [allZones, currentZone, locationPermission, requestLocationPermission]);

  // Load stores when a zone is selected
  const loadStoresForZone = useCallback(async (zoneId) => {
    if (!zoneId) return;
    
    setIsLoading(true);
    try {
      const stores = await getStoresForZone(zoneId);
      setZoneStores(stores || []);
      setShowStores(true);
    } catch (error) {
      console.error('Error loading stores for zone:', error);
      toast.error('Failed to load stores for this zone');
      setZoneStores([]);
    } finally {
      setIsLoading(false);
    }
  }, [getStoresForZone]);

  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) {
      toast.error('Please enter an address');
      return;
    }

    setIsLoading(true);
    try {
      await detectZoneFromAddress(searchAddress.trim());
      // After detecting zone, load stores for it
      if (currentZone?.id) {
        await loadStoresForZone(currentZone.id);
      }
    } catch (error) {
      console.error('Error searching address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      // Initialize location services if not already done
      const token = localStorage.getItem('user_token');
      if (token) {
        console.log('LocationSelector: User clicked location button, initializing services...');
        initializeLocationServices();
      }
      
      await requestLocationPermission();
      // After getting location, load stores for detected zone
      if (currentZone?.id) {
        await loadStoresForZone(currentZone.id);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
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
      setSelectedZoneId(zone.id);
      
      // Set the selected zone
      const selectedZone = {
        id: zone.id,
        name: zone.name,
        distance: 0,
        inPolygon: true,
        inRange: true
      };
      
      setCurrentZone(selectedZone);
      
      // Load stores for this zone
      await loadStoresForZone(zone.id);
      
      toast.success(`Selected ${zone.name} as your delivery zone`);
    } catch (error) {
      console.error('Error selecting zone:', error);
      toast.error('Failed to select zone. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreSelect = (store) => {
    selectStore(store);
    toast.success(`Selected ${store.name} for delivery`);
    if (compact) {
      setDialogOpen(false);
    }
  };

  const formatDistance = (distance) => {
    if (!distance) return 'Unknown distance';
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else if (distance < 10000) {
      return `${(distance / 1000).toFixed(1)}km`;
    } else {
      return `${Math.round(distance / 1000)}km`;
    }
  };

  const formatOperatingHours = (hours) => {
    if (!hours || !hours.open || !hours.close) return 'Hours not available';
    return `${hours.open} - ${hours.close}`;
  };

  const isStoreOpen = (hours) => {
    if (!hours || !hours.open || !hours.close) return false;
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(hours.open.replace(':', ''));
    const closeTime = parseInt(hours.close.replace(':', ''));
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const renderLocationSelector = () => (
    <Box>
      {/* Compact Status Display */}
      {currentZone && (
        <Box sx={{ 
          mb: 2, 
          p: 1.5, 
          borderRadius: 1.5,
          backgroundColor: currentZone.inRange ? 'success.50' : 'warning.50',
          border: `1px solid ${currentZone.inRange ? 'success.200' : 'warning.200'}`,
        }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            {currentZone.inRange ? (
              <CheckCircle color="success" fontSize="small" />
            ) : (
              <Warning color="warning" fontSize="small" />
            )}
            <Box>
              <Typography variant="body1" fontWeight={600} color={currentZone.inRange ? 'success.dark' : 'warning.dark'}>
                {currentZone.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentZone.distance && `${formatDistance(currentZone.distance)} away`}
                {!currentZone.inRange && ' • Outside delivery range'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Compact Action Buttons */}
      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="medium"
          startIcon={locationLoading ? <CircularProgress size={16} /> : <MyLocation />}
          onClick={handleGetCurrentLocation}
          disabled={locationLoading || locationPermission === 'denied'}
          sx={{
            py: 1.5,
            fontSize: '0.95rem',
            fontWeight: 600,
            mb: 1.5,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            },
          }}
        >
          {locationPermission === 'denied' 
            ? 'Enable Location Access' 
            : locationLoading
            ? 'Detecting Location...'
            : 'Use My Current Location'
          }
        </Button>

        <Typography variant="caption" color="text.secondary" align="center" sx={{ mb: 1.5, display: 'block' }}>
          OR
        </Typography>

        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Enter your address"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn color="action" fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  size="small"
                  onClick={handleSearchAddress}
                  disabled={isLoading || !searchAddress.trim()}
                  color="primary"
                >
                  {isLoading ? <CircularProgress size={16} /> : <Search fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
      </Box>

      {/* Compact Zone Selection */}
      {allZones.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 1.5 }}>
            Available Zones
          </Typography>
          
          {allZones.map((zone) => {
            const isCurrentZone = currentZone?.id === zone.id;
            const isSelected = selectedZoneId === zone.id;
            
            return (
              <Card 
                key={zone.id} 
                sx={{ 
                  mb: 1, 
                  cursor: 'pointer',
                  border: isSelected ? `2px solid ${theme.palette.primary.main}` : 
                          isCurrentZone ? `2px solid ${theme.palette.success.main}` : 
                          '1px solid #e0e0e0',
                  backgroundColor: isSelected ? 'primary.50' : 
                                 isCurrentZone ? 'success.50' : 
                                 'background.paper',
                  '&:hover': {
                    boxShadow: theme.shadows[2],
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
                onClick={() => handleZoneSelect(zone)}
              >
                <CardContent sx={{ py: 1.5, px: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOn 
                        color={isSelected ? 'primary' : isCurrentZone ? 'success' : 'action'} 
                        fontSize="small"
                        sx={{ mr: 0.5 }} 
                      />
                      <Typography variant="body2" fontWeight={isSelected || isCurrentZone ? 600 : 400}>
                        {zone.name}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {isCurrentZone && (
                        <Chip
                          label="Detected"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      )}
                      {isSelected && (
                        <CheckCircle color="primary" fontSize="small" />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Available Stores */}
      {showStores && zoneStores.length > 0 && (
        <Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6">
              Available Stores ({zoneStores.length})
            </Typography>
            <IconButton onClick={() => setShowStores(!showStores)}>
              {showStores ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          
          <Collapse in={showStores}>
            <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
              {zoneStores.map((store, index) => {
                const isSelected = hasSelectedStore() && selectedStore._id === store._id;
                const storeIsOpen = isStoreOpen(store.operatingHours);
                
                return (
                  <ListItem key={store._id} disablePadding>
                    <ListItemButton
                      onClick={() => handleStoreSelect(store)}
                      selected={isSelected}
                      sx={{
                        border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
                        borderRadius: 1,
                        mb: 1,
                        '&.Mui-selected': {
                          backgroundColor: theme.palette.primary.light + '20',
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                          <StoreIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1" fontWeight={600}>
                              {store.name}
                            </Typography>
                            <Chip
                              label={storeIsOpen ? 'Open' : 'Closed'}
                              color={storeIsOpen ? 'success' : 'error'}
                              size="small"
                            />
                            {isSelected && <CheckCircle color="primary" />}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {typeof store.address === 'string' 
                                ? store.address 
                                : `${store.address?.street || ''}, ${store.address?.city || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Address not available'
                              }
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2} sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                📍 {formatDistance(store.distance)} away
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                🕒 {formatOperatingHours(store.operatingHours)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        </Box>
      )}
    </Box>
  );

  if (compact) {
    return (
      <Box>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LocationOn />}
          onClick={() => setDialogOpen(true)}
          sx={{
            justifyContent: 'flex-start',
            textAlign: 'left',
            py: 1.5,
            borderRadius: 2,
          }}
        >
          <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
            <Typography variant="body2" fontWeight={600}>
              {currentZone ? currentZone.name : 'Select Delivery Location'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {hasSelectedStore() 
                ? `${selectedStore.name} • ${formatDistance(selectedStore.distance)} away`
                : currentZone 
                  ? `${zoneStores.length} stores available`
                  : 'Choose zone and store for delivery'
              }
            </Typography>
          </Box>
        </Button>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Select Delivery Location</Typography>
              <IconButton onClick={() => setDialogOpen(false)}>
                <ExpandLess />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {renderLocationSelector()}
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
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Set Your Delivery Location
          </Typography>
          
          {renderLocationSelector()}
        </CardContent>
      </Card>
    );
  }

  return renderLocationSelector();
};

export default LocationSelector;