import { GOOGLE_MAPS_CONFIG } from '../config/maps';

class GoogleMapsService {
  constructor() {
    this.isLoaded = false;
    this.loadPromise = null;
  }

  // Load Google Maps API
  async loadGoogleMaps() {
    if (this.isLoaded) {
      return window.google;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        this.isLoaded = true;
        resolve(window.google);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_CONFIG.API_KEY}&libraries=${GOOGLE_MAPS_CONFIG.LIBRARIES.join(',')}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.isLoaded = true;
        resolve(window.google);
      };
      
      script.onerror = (error) => {
        reject(new Error('Failed to load Google Maps API'));
      };
      
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  // Get current location using browser geolocation with enhanced accuracy
  async getCurrentLocation(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 30000, // Increased timeout to 30 seconds
      maximumAge: 300000 // 5 minutes
    };

    const finalOptions = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      // Add a fallback timeout to prevent hanging
      const fallbackTimeout = setTimeout(() => {
        reject(new Error('Location request timed out after 30 seconds'));
      }, finalOptions.timeout + 5000); // 5 seconds buffer

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(fallbackTimeout);
          const { latitude, longitude, accuracy } = position.coords;
          resolve({
            lat: latitude,
            lng: longitude,
            accuracy: accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          clearTimeout(fallbackTimeout);
          let errorMessage = 'Failed to get current location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please check your device settings.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again or check your connection.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting location.';
          }
          reject(new Error(errorMessage));
        },
        finalOptions
      );
    });
  }

  // Get address from coordinates using Google Maps Geocoding API
  async getAddressFromCoordinates(lat, lng) {
    try {
      await this.loadGoogleMaps();
      const geocoder = new window.google.maps.Geocoder();
      
      return new Promise((resolve, reject) => {
        geocoder.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              const result = results[0];
              resolve({
                formatted_address: result.formatted_address,
                address_components: result.address_components,
                place_id: result.place_id,
                geometry: result.geometry
              });
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });
    } catch (error) {
      throw new Error(`Failed to get address: ${error.message}`);
    }
  }

  // Get coordinates from address using Google Maps Geocoding API
  async getCoordinatesFromAddress(address) {
    try {
      await this.loadGoogleMaps();
      const geocoder = new window.google.maps.Geocoder();
      
      return new Promise((resolve, reject) => {
        geocoder.geocode(
          { address: address },
          (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              const result = results[0];
              const location = result.geometry.location;
              resolve({
                lat: location.lat(),
                lng: location.lng(),
                formatted_address: result.formatted_address,
                address_components: result.address_components,
                place_id: result.place_id,
                geometry: result.geometry
              });
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });
    } catch (error) {
      throw new Error(`Failed to get coordinates: ${error.message}`);
    }
  }

  // Get place predictions for autocomplete
  async getPlacePredictions(input, options = {}) {
    try {
      await this.loadGoogleMaps();
      const service = new window.google.maps.places.AutocompleteService();
      
      const defaultOptions = {
        types: ['address'],
        componentRestrictions: { country: 'in' } // Restrict to India
      };
      
      const finalOptions = { ...defaultOptions, ...options };
      
      return new Promise((resolve, reject) => {
        service.getPlacePredictions(
          { input, ...finalOptions },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              resolve(predictions || []);
            } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              resolve([]);
            } else {
              reject(new Error(`Places service failed: ${status}`));
            }
          }
        );
      });
    } catch (error) {
      throw new Error(`Failed to get place predictions: ${error.message}`);
    }
  }

  // Get place details by place ID
  async getPlaceDetails(placeId) {
    try {
      await this.loadGoogleMaps();
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      return new Promise((resolve, reject) => {
        service.getDetails(
          {
            placeId: placeId,
            fields: ['formatted_address', 'geometry', 'address_components', 'name']
          },
          (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              const location = place.geometry.location;
              resolve({
                lat: location.lat(),
                lng: location.lng(),
                formatted_address: place.formatted_address,
                address_components: place.address_components,
                name: place.name,
                place_id: placeId
              });
            } else {
              reject(new Error(`Place details failed: ${status}`));
            }
          }
        );
      });
    } catch (error) {
      throw new Error(`Failed to get place details: ${error.message}`);
    }
  }

  // Calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Check if a point is inside a polygon
  isPointInPolygon(point, polygon) {
    const { lat, lng } = point;
    const coordinates = polygon.coordinates[0]; // Assuming first ring of polygon
    
    let inside = false;
    for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
      const xi = coordinates[i][1]; // latitude
      const yi = coordinates[i][0]; // longitude
      const xj = coordinates[j][1]; // latitude
      const yj = coordinates[j][0]; // longitude
      
      if (((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }
}

// Export singleton instance
const googleMapsService = new GoogleMapsService();
export default googleMapsService;