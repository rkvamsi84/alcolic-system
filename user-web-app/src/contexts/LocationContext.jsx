import React, { createContext, useContext, useState, useEffect } from 'react';
import locationService from '../services/locationService';
import googleMapsService from '../services/googleMapsService';
import { toast } from 'react-hot-toast';
import { apiService } from '../config/api';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentZone, setCurrentZone] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [isLoading, setIsLoading] = useState(false);
  const [nearbyStores, setNearbyStores] = useState([]);
  const [deliveryZones, setDeliveryZones] = useState([]);

  
  // Add debouncing and request deduplication
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  
  // Flag to prevent multiple initializations
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize location services manually
  const initializeLocationServices = () => {
    // Prevent multiple initializations
    if (isInitialized) {
      console.log('LocationContext: Already initialized, skipping...');
      return;
    }
    
    console.log('LocationContext: Manually initializing location services...');
    setIsInitialized(true);
    
    if ('permissions' in navigator) {
      console.log('LocationContext: Permissions API available, querying...');
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        console.log('LocationContext: Permission query result:', result.state);
        setLocationPermission(result.state);
        result.addEventListener('change', () => {
          const newState = result.state;
          console.log('LocationContext: Permission changed to:', newState);
          setLocationPermission(newState);
          
          // Auto-detect location when permission changes to granted
          if (newState === 'granted') {
            console.log('LocationContext: Permission changed to granted, auto-detecting location...');
            getCurrentLocation({ showToast: false });
          }
        });
        
        // Auto-detect location if permission is already granted
        if (result.state === 'granted') {
          console.log('LocationContext: Permission already granted, auto-detecting location...');
          getCurrentLocation({ showToast: false });
        } else if (result.state === 'prompt') {
          console.log('LocationContext: Permission is prompt, attempting location detection...');
          getCurrentLocation({ showToast: false });
        }
      }).catch(error => {
        console.error('LocationContext: Error querying permissions:', error);
        // Fallback: try to get location anyway
        console.log('LocationContext: Falling back to direct location detection...');
        getCurrentLocation({ showToast: false });
      });
    } else {
      // Fallback for browsers without permissions API
      console.log('LocationContext: No permissions API, attempting location detection...');
      getCurrentLocation({ showToast: false });
    }
  };

  // Check location permission status and auto-detect location
  // Only initialize location services when needed
  useEffect(() => {
    // Check if user is authenticated and on a page that needs location
    const token = localStorage.getItem('user_token');
    const isAuthenticated = !!token;
    
    // Only initialize location services if user is authenticated
    if (!isAuthenticated) {
      console.log('LocationContext: User not authenticated, skipping location initialization');
      return;
    }
    
    console.log('LocationContext: User authenticated, initializing location services...');
    initializeLocationServices();
  }, []);

  // Get current location with enhanced error handling
  const getCurrentLocation = async (options = {}) => {
    setIsLoading(true);
    console.log('LocationContext: getCurrentLocation called with options:', options);

    try {
      const location = await googleMapsService.getCurrentLocation(options);
      console.log('LocationContext: Received location from Google Maps service:', location);

      if (!location) {
        toast.error('Failed to get current location via Google Maps service.');
        return null;
      }

      setCurrentLocation(location);
      console.log('LocationContext: Current location set to:', location);
      
      // Get zone information for this location (don't let this fail the main function)
      try {
        console.log('LocationContext: Starting zone coverage check...');
        await checkZoneCoverage(location, true);
      } catch (zoneError) {
        console.warn('LocationContext: Failed to get zone information:', zoneError);
      }
      
      // Get nearby stores (don't let this fail the main function)
      try {
        // Skip zone check since we already did it in checkZoneCoverage
        await getNearbyStores(location, 2000000, true);
      } catch (storesError) {
        console.warn('LocationContext: Failed to get nearby stores:', storesError);
      }
      
      // Only show success toast if user explicitly requested location
      if (options.showToast !== false) {
        toast.success('Location detected successfully');
      }
      return location;
    } catch (error) {
      console.error('LocationContext: Error getting location:', error);
      toast.error(error.message || 'An unknown error occurred while getting location.');
      if (error.code === error.PERMISSION_DENIED) {
        setLocationPermission('denied');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Request location permission and detect location
  const requestLocationPermission = async () => {
    try {
      console.log('LocationContext: Requesting location permission...');
      
      if (locationPermission === 'granted') {
        console.log('LocationContext: Permission already granted, getting location...');
        return await getCurrentLocation();
      }
      
      if (locationPermission === 'denied') {
        toast.error('Location permission denied. Please enable location access in your browser settings.');
        return null;
      }
      
      // Try to get location (this will trigger permission request)
      console.log('LocationContext: Attempting to get location to trigger permission request...');
      const location = await getCurrentLocation();
      
      if (location) {
        setLocationPermission('granted');
      }
      
      return location;
    } catch (error) {
      console.error('LocationContext: Error requesting location permission:', error);
      if (error.message.includes('permission denied')) {
        setLocationPermission('denied');
        toast.error('Location permission denied. Please enable location access.');
      } else {
        toast.error('Failed to get location. Please try again.');
      }
      return null;
    }
  };

  // Get zone information for a location
  const getZoneForLocation = async (location) => {
    try {
      const zoneData = await locationService.getZoneForLocation(location);
      if (zoneData) {
        setCurrentZone(zoneData);
        return zoneData;
      }
    } catch (error) {
      console.error('Error getting zone:', error);
    }
    return null;
  };

  // Check zone coverage for location
  const checkZoneCoverage = async (location, showToast = true) => {
    try {
      console.log('LocationContext: Checking zone coverage for location:', location);
      
      const response = await apiService.post('/zones/check-coverage', {
        lat: location.lat,
        lng: location.lng
      });
      
      console.log('LocationContext: Zone coverage response:', response);
      
             if (response && response.success && response.data.hasCoverage) {
         // Find the covered zone
         const coveredZone = response.data.coverageResults?.find(zone => zone.isCovered);
         if (coveredZone) {
           console.log('LocationContext: Found covered zone:', coveredZone);
           setCurrentZone({
             id: coveredZone.zoneId,
             name: coveredZone.zoneName,
             distance: coveredZone.distance,
             inPolygon: coveredZone.inPolygon,
             inRange: coveredZone.inRange
           });
           if (showToast) {
             if (coveredZone.inRange) {
               toast.success(`You are in ${coveredZone.zoneName}`, { duration: 3000 });
             } else {
               toast(`You are in ${coveredZone.zoneName} but outside delivery range (${coveredZone.distance}km away)`, { 
                 duration: 5000,
                 icon: '⚠️'
               });
             }
           }
         }
       } else {
        console.log('LocationContext: No zone coverage found');
        setCurrentZone(null);
        // Show available zones to user
        const availableZones = response.data?.coverageResults || [];
        if (availableZones.length > 0 && showToast) {
          const nearestZone = availableZones.reduce((nearest, zone) => 
            (!nearest || parseFloat(zone.distance) < parseFloat(nearest.distance)) ? zone : nearest
          );
          toast(`You're outside delivery zones. Nearest zone: ${nearestZone.zoneName} (${nearestZone.distance}km away)`, {
            duration: 5000,
            icon: 'ℹ️'
          });
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('LocationContext: Error checking zone coverage:', error);
      // Fallback: try to detect zone using local calculation
      try {
        console.log('LocationContext: Attempting fallback zone detection');
        const fallbackZone = await detectZoneFallback(location);
        if (fallbackZone) {
          setCurrentZone(fallbackZone);
          if (showToast) {
            toast.success(`Detected zone: ${fallbackZone.name}`, { duration: 3000 });
          }
          return { success: true, hasCoverage: true, coverageResults: [fallbackZone] };
        }
      } catch (fallbackError) {
        console.warn('LocationContext: Fallback zone detection failed:', fallbackError);
      }
      return { success: false, hasCoverage: false };
    }
  };

  // Validate delivery for location
  const validateDelivery = async (location, orderAmount = 0) => {
    try {
      const response = await apiService.post('/zones/validate-delivery', {
        lat: location.lat,
        lng: location.lng,
        orderAmount
      });
      return response.data;
    } catch (error) {
      console.error('Error validating delivery:', error);
      return { success: false, message: 'Delivery validation failed' };
    }
  };

  // Get nearby stores with zone-aware fallback
  const getNearbyStores = async (location, radius = 2000000, skipZoneCheck = false) => {
    console.log('LocationContext: getNearbyStores called with:', location, radius);
    
    // Prevent duplicate requests
    if (isLoadingStores) {
      console.log('LocationContext: Store request already in progress, skipping');
      return nearbyStores;
    }
    
    // Set loading state
    setIsLoadingStores(true);
    
    try {
      let zoneCoverage;
      
      if (skipZoneCheck) {
        // Skip zone check entirely - use existing zone data if available
        if (currentZone) {
          zoneCoverage = {
            success: true,
            data: {
              hasCoverage: true,
              coverageResults: [{
                zoneId: currentZone.id,
                zoneName: currentZone.name,
                isCovered: true
              }]
            }
          };
        } else {
          // No existing zone data, assume no coverage to trigger fallback search
          zoneCoverage = {
            success: true,
            data: {
              hasCoverage: false,
              coverageResults: []
            }
          };
        }
      } else {
         // Check zone coverage (suppress toast to avoid duplicates)
         zoneCoverage = await checkZoneCoverage(location, false);
       }
      
             if (zoneCoverage.success && zoneCoverage.data.hasCoverage) {
         // User is in a delivery zone, get zone-specific stores
         const coveredZone = zoneCoverage.data.coverageResults.find(zone => zone.isCovered);
         if (coveredZone) {
           console.log('LocationContext: User is in zone:', coveredZone.zoneName);
           
           // Check if user is within delivery range
                       if (!coveredZone.inRange) {
              console.log('LocationContext: User is in zone but outside delivery range');
              setNearbyStores([]);
              toast(`You are in ${coveredZone.zoneName} but outside the delivery range (${coveredZone.distance}km away). Please check if delivery is available.`, {
                icon: '⚠️',
                duration: 5000
              });
              return [];
            }
           
           try {
             // Try to get stores for this specific zone
             const zoneStoresResponse = await apiService.get(`/stores/zone/${coveredZone.zoneId}`);
             if (zoneStoresResponse && zoneStoresResponse.success && zoneStoresResponse.data.stores.length > 0) {
               console.log('LocationContext: Found zone-specific stores:', zoneStoresResponse.data.stores);
               setNearbyStores(zoneStoresResponse.data.stores);
               return zoneStoresResponse.data.stores;
             } else {
                               // No stores in this zone, but user is in a valid delivery zone
                console.log('LocationContext: No stores available in this zone');
                setNearbyStores([]);
                toast(`You are in ${coveredZone.zoneName}, but no stores are currently available in this zone.`, {
                  icon: 'ℹ️',
                  duration: 5000
                });
                return [];
             }
           } catch (zoneError) {
             console.log('LocationContext: Zone-specific store fetch failed:', zoneError);
             setNearbyStores([]);
             toast.error('Failed to load stores for your zone. Please try again.');
             return [];
           }
         }
       } else {
        // User is outside delivery zones - only then show nearby stores
        console.log('LocationContext: Location outside delivery zones, using large radius search');
        toast('You are outside our delivery zones. Searching for stores in nearby areas...', { icon: 'ℹ️' });
        
        // Fallback to regular nearby stores search
        const storesData = await locationService.getNearbyStores(location, radius);
        console.log('LocationContext: Received stores data:', storesData);
        
        if (storesData && storesData.length > 0) {
          console.log('LocationContext: Setting nearby stores:', storesData);
          setNearbyStores(storesData);
          
          // Show zone information for found stores
          const storeZones = [...new Set(storesData.map(store => store.zoneId).filter(Boolean))];
          if (storeZones.length > 0) {
            console.log('LocationContext: Stores found in zones:', storeZones);
          }
          
          return storesData;
        } else {
          console.log('LocationContext: No stores found anywhere');
          const deliveryZones = await fetchDeliveryZones();
          if (deliveryZones.length > 0) {
            toast.error('No stores available in your area. Please check our delivery zones.');
          } else {
            toast.error('No stores available at the moment.');
          }
          setNearbyStores([]);
          return [];
        }
      }
    } catch (error) {
      console.error('Error getting nearby stores:', error);
      toast.error('Failed to find nearby stores. Please try again.');
      setNearbyStores([]);
      return [];
    } finally {
      // Always reset loading state
      setIsLoadingStores(false);
    }
  };

  // Check if location is within delivery zone
  const isLocationInDeliveryZone = (location, zone) => {
    if (!location || !zone) return false;
    
    // Simple distance calculation (in a real app, use proper geospatial queries)
    const distance = calculateDistance(
      location.lat, location.lng,
      zone.center?.lat || 0, zone.center?.lng || 0
    );
    
    return distance <= (zone.radius || 5000); // 5km default radius
  };

  // Calculate distance between two points (Haversine formula)
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

  // Get delivery zones from admin panel
  const fetchDeliveryZones = async () => {
    try {
      const response = await apiService.get('/zones');
      if (response && response.success) {
        const zonesData = response.data || [];
        setDeliveryZones(zonesData);
        console.log('LocationContext: Fetched delivery zones:', zonesData);
        return zonesData;
      }
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
    }
    return [];
  };

  // Get all available zones for display
  const getAllZones = async () => {
    try {
      console.log('LocationContext: Making API call to /zones');
      const response = await apiService.get('/zones');
      console.log('LocationContext: getAllZones API response:', response);
      console.log('LocationContext: response.data:', response.data);
      if (response && response.success) {
        console.log('LocationContext: returning zones data:', response.data);
        return response.data || [];
      } else {
        console.error('LocationContext: API response indicates failure or missing data:', response);
        return [];
      }
    } catch (error) {
      console.error('LocationContext: Error fetching all zones:', error);
      console.error('LocationContext: Error details:', error.message, error.response);
    }
    return [];
  };

  // Detect zone from address using Google Maps
  const detectZoneFromAddress = async (address) => {
    try {
      const response = await apiService.post('/zones/detect-zone-from-address', {
        address
      });
      
             if (response && response.success) {
         const { location, hasCoverage, detectedZone } = response.data;
        
        if (hasCoverage && detectedZone) {
          setCurrentZone({
            id: detectedZone.zoneId,
            name: detectedZone.zoneName,
            distance: detectedZone.distance,
            inPolygon: detectedZone.inPolygon,
            inRange: detectedZone.inRange
          });
          setCurrentLocation(location);
          toast.success(`Address is in ${detectedZone.zoneName}`);
          
          // Get stores for this zone (skip zone check since we already detected it)
          await getNearbyStores(location, 2000000, true);
        } else {
          toast.error('Address is outside our delivery zones');
        }
        
        return response.data;
      }
    } catch (error) {
      console.error('Error detecting zone from address:', error);
      toast.error('Failed to detect zone from address');
    }
    return null;
  };

  // Watch location changes
  const watchLocation = (callback, options = {}) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const location = { lat: latitude, lng: longitude, accuracy };
        setCurrentLocation(location);
        callback?.(location);
      },
      (error) => {
        console.error('Error watching location:', error);
        toast.error('Failed to track location changes');
      },
      {
        enableHighAccuracy: options.highAccuracy || true,
        timeout: options.timeout || 10000,
        maximumAge: options.maximumAge || 30000
      }
    );

    return watchId;
  };

  // Clear location watch
  const clearLocationWatch = (watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  };

  // Get address from coordinates (reverse geocoding)
  const getAddressFromCoordinates = async (location) => {
    // Validate location data before making API call
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      console.warn('Invalid location data provided to getAddressFromCoordinates:', location);
      return null;
    }
    
    // Check if coordinates are valid numbers
    if (isNaN(location.lat) || isNaN(location.lng) || !isFinite(location.lat) || !isFinite(location.lng)) {
      console.warn('Invalid coordinate values:', location);
      return null;
    }
    
    try {
      return await locationService.getAddressFromCoordinates(location);
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
    }
    return null;
  };

  // Get coordinates from address (geocoding)
  const getCoordinatesFromAddress = async (address) => {
    try {
      return await locationService.getCoordinatesFromAddress(address);
    } catch (error) {
      console.error('Error getting coordinates from address:', error);
    }
    return null;
  };

  // Fallback zone detection using local calculation
  const detectZoneFallback = async (location) => {
    try {
      console.log('LocationContext: Running fallback zone detection for location:', location);
      
      // Get all zones from the API
      const zones = await getAllZones();
      if (!zones || zones.length === 0) {
        console.log('LocationContext: No zones available for fallback detection');
        return null;
      }

      console.log('LocationContext: Checking location against', zones.length, 'zones');
      
      let bestZone = null;
      let shortestDistance = Infinity;

      for (const zone of zones) {
        if (!zone.center || !zone.center.lat || !zone.center.lng) {
          console.warn('LocationContext: Zone missing center coordinates:', zone);
          continue;
        }

        // Calculate distance to zone center
        const distance = calculateDistance(
          location.lat, 
          location.lng, 
          zone.center.lat, 
          zone.center.lng
        );

        console.log(`LocationContext: Zone ${zone.name}: distance ${distance}m, max distance ${zone.maximum_distance}m`);

        // Check if within maximum distance
        if (distance <= zone.maximum_distance) {
          if (distance < shortestDistance) {
            shortestDistance = distance;
            bestZone = {
              id: zone.id,
              name: zone.name,
              distance: distance,
              inPolygon: false, // We can't determine this without polygon data
              inRange: true
            };
          }
        }
      }

      if (bestZone) {
        console.log('LocationContext: Fallback detection found zone:', bestZone);
        return bestZone;
      } else {
        console.log('LocationContext: Fallback detection: location outside all zones');
        return null;
      }
    } catch (error) {
      console.error('LocationContext: Error in fallback zone detection:', error);
      return null;
    }
  };

  // Validate delivery address and calculate fees
  const validateDeliveryAddress = async (lat, lng, orderAmount = 0) => {
    try {
      return await locationService.validateDeliveryAddress(lat, lng, orderAmount);
    } catch (error) {
      console.error('Error validating delivery address:', error);
    }
    return null;
  };

  // Check delivery coverage for a location
  const checkDeliveryCoverage = async (lat, lng) => {
    try {
      return await locationService.checkDeliveryCoverage(lat, lng);
    } catch (error) {
      console.error('Error checking delivery coverage:', error);
    }
    return null;
  };

  // Get delivery zones information
  const getDeliveryZonesInfo = async () => {
    try {
      return await locationService.getDeliveryZones();
    } catch (error) {
      console.error('Error fetching delivery zones info:', error);
    }
    return [];
  };

  // Get stores for a specific zone
  const getStoresForZone = async (zoneId) => {
    try {
      console.log('LocationContext: Getting stores for zone:', zoneId);
      const response = await apiService.get(`/stores/zone/${zoneId}`);
      if (response && response.success && response.data.stores) {
        const stores = response.data.stores;
        console.log('LocationContext: Found stores for zone:', stores.length);
        setNearbyStores(stores);
        return stores;
      } else {
        console.log('LocationContext: No stores found for zone:', zoneId);
        setNearbyStores([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching stores for zone:', error);
      setNearbyStores([]);
      throw error;
    }
  };

  const value = {
    currentLocation,
    currentZone,
    locationPermission,
    isLoading,
    nearbyStores,
    deliveryZones,
    getCurrentLocation,
    requestLocationPermission,
    getZoneForLocation,
    getNearbyStores,
    checkZoneCoverage,
    validateDelivery,
    isLocationInDeliveryZone,
    calculateDistance,
    fetchDeliveryZones,
    getAllZones,
    detectZoneFromAddress,
    detectZoneFallback,
    watchLocation,
    clearLocationWatch,
    getAddressFromCoordinates,
    getCoordinatesFromAddress,
    validateDeliveryAddress,
    checkDeliveryCoverage,
    getDeliveryZonesInfo,
    getStoresForZone,
    setCurrentLocation,
    setCurrentZone,
    initializeLocationServices
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};