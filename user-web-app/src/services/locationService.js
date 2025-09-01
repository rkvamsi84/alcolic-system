import { apiService } from '../config/api';

class LocationService {
  constructor() {
    this.baseURL = '/location';
    this.requestQueue = [];
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.minRequestInterval = 2000; // 2 seconds between requests
  }

  // Throttle requests to prevent overwhelming the server
  async throttleRequest() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }

  // Queue requests to prevent overwhelming the server
  async queueRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }
    this.isProcessing = true;
    while (this.requestQueue.length > 0) {
      const { requestFn, resolve, reject } = this.requestQueue.shift();
      try {
        await this.throttleRequest();
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
    this.isProcessing = false;
  }

  // Get zone information for a location
  async getZoneForLocation(location) {
    // Validate location data before making API call
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      console.warn('Invalid location data provided to getZoneForLocation:', location);
      return null;
    }
    
    // Check if coordinates are valid numbers
    if (isNaN(location.lat) || isNaN(location.lng) || !isFinite(location.lat) || !isFinite(location.lng)) {
      console.warn('Invalid coordinate values for zone lookup:', location);
      return null;
    }
    
    try {
      return await this.queueRequest(async () => {
        await this.throttleRequest();
        const response = await apiService.get('/zones/zone', {
          params: {
            lat: location.lat,
            lng: location.lng
          }
        });
        // Extract the zone data from the response
        if (response.data && response.data.success && response.data.zone_data && response.data.zone_data.length > 0) {
          return response.data.zone_data[0]; // Return the first zone data object
        }
        return response.data;
      });
    } catch (error) {
      console.error('Error getting zone for location:', error);
      return null;
    }
  }

  // Get nearby stores
  async getNearbyStores(location, radius = 2000000) {
    try {
      return await this.queueRequest(async () => {
        await this.throttleRequest();
        console.log('🔍 LocationService: Making API call to /stores/nearby with params:', {
          latitude: location.lat,
          longitude: location.lng,
          radius
        });
        
        // Use the API service to fetch nearby stores
        console.log('🔍 LocationService: Using API service to fetch nearby stores');
        const response = await apiService.get('/stores/nearby', {
          params: {
            latitude: location.lat,
            longitude: location.lng,
            radius,
            _t: Date.now() // Cache busting parameter
          }
        });
        console.log('🔍 LocationService: API service response:', response);
        const stores = response.data?.data || response.data || [];
        console.log('🔍 LocationService: API service stores:', stores);
        return stores;
      });
    } catch (error) {
      console.error('Error getting nearby stores:', error);
      return [];
    }
  }

  // Get delivery zones
  async getDeliveryZones() {
    try {
      return await this.queueRequest(async () => {
        await this.throttleRequest();
        const response = await apiService.get('/zones');
        return response.data;
      });
    } catch (error) {
      console.error('Error getting delivery zones:', error);
      return [];
    }
  }

  // Validate delivery address
  async validateDeliveryAddress(lat, lng, orderAmount = 0) {
    try {
      return await this.queueRequest(async () => {
        await this.throttleRequest();
        const response = await apiService.post('/zones/validate-delivery', {
          lat,
          lng,
          orderAmount
        });
        return response.data;
      });
    } catch (error) {
      console.error('Error validating delivery address:', error);
      return null;
    }
  }

  // Check delivery coverage
  async checkDeliveryCoverage(lat, lng) {
    try {
      return await this.queueRequest(async () => {
        await this.throttleRequest();
        const response = await apiService.post('/zones/check-coverage', {
          lat,
          lng
        });
        return response.data;
      });
    } catch (error) {
      console.error('Error checking delivery coverage:', error);
      return null;
    }
  }

  // Get address from coordinates
  async getAddressFromCoordinates(location) {
    // Validate location data before making API call
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      console.warn('Invalid location data provided to getAddressFromCoordinates:', location);
      return null;
    }
    
    // Check if coordinates are valid numbers
    if (isNaN(location.lat) || isNaN(location.lng) || !isFinite(location.lat) || !isFinite(location.lng)) {
      console.warn('Invalid coordinate values for reverse geocoding:', location);
      return null;
    }
    
    try {
      return await this.queueRequest(async () => {
        await this.throttleRequest();
        const response = await apiService.get('/location/reverse-geocode', {
          params: {
            lat: location.lat,
            lng: location.lng
          }
        });
        return response.data;
      });
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
      return null;
    }
  }

  // Get coordinates from address
  async getCoordinatesFromAddress(address) {
    try {
      return await this.queueRequest(async () => {
        await this.throttleRequest();
        const response = await apiService.get('/location/geocode', {
          params: { address }
        });
        return response.data;
      });
    } catch (error) {
      console.error('Error getting coordinates from address:', error);
      return null;
    }
  }
}

export default new LocationService();