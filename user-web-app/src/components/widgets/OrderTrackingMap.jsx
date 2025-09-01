import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LocationOn,
  LocalShipping,
  Store,
  Home,
  Refresh,
  MyLocation,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { GOOGLE_MAPS_CONFIG, MAP_MARKERS, ROUTE_STYLING } from '../../config/maps';

const OrderTrackingMap = ({ 
  orderData, 
  deliveryLocation, 
  storeLocation, 
  customerLocation,
  isLiveTracking = false,
  onLocationUpdate 
}) => {
  const [map, setMap] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [center, setCenter] = useState(GOOGLE_MAPS_CONFIG.DEFAULT_CENTER);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.API_KEY,
    libraries: GOOGLE_MAPS_CONFIG.LIBRARIES,
    preventGoogleFontsLoading: true,
    loadingElement: <div>Loading Maps...</div>,
    version: GOOGLE_MAPS_CONFIG.VERSION
  });

  // Helper function to validate coordinates
  const getValidCoordinates = (location) => {
    if (!location) return null;
    
    const lat = parseFloat(location.latitude || location.lat);
    const lng = parseFloat(location.longitude || location.lng);
    
    if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
      return null;
    }
    
    return { lat, lng };
  };

  // Calculate center based on available locations
  useEffect(() => {
    let validCenter = null;
    
    if (deliveryLocation) {
      validCenter = getValidCoordinates(deliveryLocation);
    }
    if (!validCenter && storeLocation) {
      validCenter = getValidCoordinates(storeLocation);
    }
    if (!validCenter && customerLocation) {
      validCenter = getValidCoordinates(customerLocation);
    }
    
    if (validCenter) {
      setCenter(validCenter);
    }
  }, [deliveryLocation, storeLocation, customerLocation]);

  const onMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  const handleRefreshLocation = () => {
    if (onLocationUpdate) {
      onLocationUpdate();
    }
  };

  const renderMarkers = () => {
    const markers = [];

    // Helper function to create icon with proper size
    const createIcon = (markerConfig) => {
      const icon = {
        url: markerConfig.url
      };
      
      // Only add scaledSize if Google Maps API is loaded
      if (window.google && window.google.maps && window.google.maps.Size) {
        icon.scaledSize = new window.google.maps.Size(
          markerConfig.scaledSize.width, 
          markerConfig.scaledSize.height
        );
      }
      
      return icon;
    };

    // Store marker
    if (storeLocation) {
      const storeCoords = getValidCoordinates(storeLocation);
      if (storeCoords) {
        markers.push({
          id: 'store',
          position: storeCoords,
          icon: createIcon(MAP_MARKERS.STORE),
          title: 'Store Location',
          info: {
            title: 'Store',
            address: storeLocation.address || 'Store location',
            status: 'Preparing your order'
          }
        });
      }
    }

    // Delivery person marker
    if (deliveryLocation) {
      const deliveryCoords = getValidCoordinates(deliveryLocation);
      if (deliveryCoords) {
        markers.push({
          id: 'delivery',
          position: deliveryCoords,
          icon: createIcon(MAP_MARKERS.DELIVERY),
          title: 'Delivery Location',
          info: {
            title: 'Delivery Partner',
            address: deliveryLocation.address || 'Current location',
            status: 'On the way to you',
            name: deliveryLocation.driverName || 'Delivery Partner',
            phone: deliveryLocation.phone || 'Contact available'
          }
        });
      }
    }

    // Customer location marker
    if (customerLocation) {
      const customerCoords = getValidCoordinates(customerLocation);
      if (customerCoords) {
        markers.push({
          id: 'customer',
          position: customerCoords,
          icon: createIcon(MAP_MARKERS.CUSTOMER),
          title: 'Your Location',
          info: {
            title: 'Your Location',
            address: customerLocation.address || 'Delivery address',
            status: 'Delivery destination'
          }
        });
      }
    }

    return markers;
  };

  const renderRoute = () => {
    if (deliveryLocation && customerLocation) {
      const path = [
        {
          lat: deliveryLocation.latitude || deliveryLocation.lat,
          lng: deliveryLocation.longitude || deliveryLocation.lng
        },
        {
          lat: customerLocation.latitude || customerLocation.lat,
          lng: customerLocation.longitude || customerLocation.lng
        }
      ];

      return (
                 <Polyline
           path={path}
           options={ROUTE_STYLING}
         />
      );
    }
    return null;
  };

  if (!isLoaded) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" component="h2">
              Order Tracking
            </Typography>
            <Box display="flex" gap={1}>
              {isLiveTracking && (
                <Chip
                  label="Live Tracking"
                  color="primary"
                  size="small"
                  icon={<LocalShipping />}
                />
              )}
              <Tooltip title="Refresh Location">
                <IconButton onClick={handleRefreshLocation} size="small">
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {loadError ? (
            <Box
              sx={{
                width: '100%',
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
            >
              <Alert severity="error" sx={{ maxWidth: '300px' }}>
                Failed to load Google Maps. Please check your internet connection and try again.
              </Alert>
            </Box>
          ) : !isLoaded ? (
            <Box
              sx={{
                width: '100%',
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px'
              }}
            >
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading Maps...</Typography>
            </Box>
          ) : (
            <GoogleMap
                mapContainerStyle={{
                  width: '100%',
                  height: '400px',
                  borderRadius: '8px'
                }}
                center={center}
                zoom={GOOGLE_MAPS_CONFIG.DEFAULT_ZOOM}
                options={GOOGLE_MAPS_CONFIG.MAP_OPTIONS}
                onLoad={onMapLoad}
                onUnmount={onMapUnmount}
              >
              {renderMarkers().map((marker) => (
                <Marker
                  key={marker.id}
                  position={marker.position}
                  icon={marker.icon}
                  title={marker.title}
                  onClick={() => handleMarkerClick(marker)}
                >
                  {selectedMarker?.id === marker.id && (
                    <InfoWindow
                      onCloseClick={handleInfoWindowClose}
                      position={marker.position}
                    >
                      <Box p={1}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {marker.info.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {typeof marker.info.address === 'string' 
                            ? marker.info.address 
                            : marker.info.address 
                              ? `${marker.info.address.street || ''}, ${marker.info.address.city || ''}, ${marker.info.address.state || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Location not specified'
                              : 'Location not specified'
                          }
                        </Typography>
                        <Typography variant="caption" color="primary">
                          {marker.info.status}
                        </Typography>
                        {marker.info.name && (
                          <Typography variant="caption" display="block">
                            Driver: {marker.info.name}
                          </Typography>
                        )}
                        {marker.info.phone && (
                          <Typography variant="caption" display="block">
                            Phone: {marker.info.phone}
                          </Typography>
                        )}
                      </Box>
                    </InfoWindow>
                  )}
                </Marker>
              ))}
              {renderRoute()}
            </GoogleMap>
          )}

          {orderData && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                Order #{orderData.orderId} • {orderData.status?.current || orderData.status}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrderTrackingMap;