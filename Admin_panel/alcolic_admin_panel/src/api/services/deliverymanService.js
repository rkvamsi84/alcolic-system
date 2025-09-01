import { apiService } from '../config';

const ENDPOINTS = {
  deliverymen: {
    getAll: '/admin/delivery-men',
    getById: (id) => `/admin/delivery-men/${id}`,
    updateStatus: (id) => `/admin/delivery-men/${id}/status`,
    delete: (id) => `/admin/delivery-men/${id}`,
  }
};

class DeliverymanService {
  // Get all deliverymen
  async getAllDeliverymen() {
    try {
      const response = await apiService.get(ENDPOINTS.deliverymen.getAll);
      return response;
    } catch (error) {
      console.error('Get deliverymen error:', error);
      throw error;
    }
  }

  // Get deliveryman by ID
  async getDeliverymanById(id) {
    try {
      const response = await apiService.get(ENDPOINTS.deliverymen.getById(id));
      return response.data;
    } catch (error) {
      console.error('Get deliveryman error:', error);
      throw error;
    }
  }

  // Update deliveryman status
  async updateDeliverymanStatus(id, isActive) {
    try {
      const response = await apiService.patch(ENDPOINTS.deliverymen.updateStatus(id), {
        isActive
      });
      return response.data;
    } catch (error) {
      console.error('Update deliveryman status error:', error);
      throw error;
    }
  }

  // Delete deliveryman
  async deleteDeliveryman(id) {
    try {
      const response = await apiService.delete(ENDPOINTS.deliverymen.delete(id));
      return response.data;
    } catch (error) {
      console.error('Delete deliveryman error:', error);
      throw error;
    }
  }

  // Get deliveryman statistics
  async getDeliverymanStats(deliverymenData) {
    try {
      // Use the provided data instead of calling getAllDeliverymen again
      const deliverymen = deliverymenData || await this.getAllDeliverymen();
      const data = deliverymen.data || deliverymen;
      
      const stats = {
        total: data.length,
        online: data.filter(dm => dm.isAvailable).length,
        offline: data.filter(dm => !dm.isAvailable).length,
        active: data.filter(dm => dm.isActive).length,
        inactive: data.filter(dm => !dm.isActive).length,
      };
      return stats;
    } catch (error) {
      console.error('Get deliveryman stats error:', error);
      throw error;
    }
  }
}

const deliverymanService = new DeliverymanService();
export default deliverymanService;