import axios from 'axios';
import { API_CONFIG } from './config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const zoneService = {
  // Get all zones for admin management
  async getAllZones() {
    try {
      const response = await api.get('/zones/admin/zones');
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching zones:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch zones'
      };
    }
  },

  // Create a new zone
  async createZone(zoneData) {
    try {
      const response = await api.post('/zones/admin/zones', zoneData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error creating zone:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to create zone',
        errors: error.response?.data?.errors
      };
    }
  },

  // Update an existing zone
  async updateZone(zoneId, updates) {
    try {
      const response = await api.put(`/zones/admin/zones/${zoneId}`, updates);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error updating zone:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to update zone',
        errors: error.response?.data?.errors
      };
    }
  },

  // Delete a zone
  async deleteZone(zoneId) {
    try {
      const response = await api.delete(`/zones/admin/zones/${zoneId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error deleting zone:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to delete zone'
      };
    }
  },

  // Check zone coverage for a location
  async checkCoverage(lat, lng) {
    try {
      const response = await api.post('/zones/check-coverage', { lat, lng });
      return {
        success: true,
        data: response.data,
        message: 'Coverage checked successfully'
      };
    } catch (error) {
      console.error('Error checking coverage:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to check coverage'
      };
    }
  },

  // Validate delivery for a location
  async validateDelivery(lat, lng) {
    try {
      const response = await api.post('/zones/validate-delivery', { lat, lng });
      return {
        success: true,
        data: response.data,
        message: 'Delivery validation completed'
      };
    } catch (error) {
      console.error('Error validating delivery:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to validate delivery'
      };
    }
  }
};

export default zoneService;