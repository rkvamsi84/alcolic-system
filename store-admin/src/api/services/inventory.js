import axios from 'axios';
import { API_CONFIG, ENDPOINTS, ERROR_MESSAGES } from '../config';

class InventoryService {
  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.baseURL,
      headers: API_CONFIG.headers
    });
  }

  /**
   * Get all inventory items
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of inventory items
   */
  async getAllItems(params = {}) {
    try {
      const response = await this.api.get(ENDPOINTS.inventory.getAll, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Get a single inventory item by ID
   * @param {string} id - Item ID
   * @returns {Promise<Object>} Inventory item
   */
  async getItemById(id) {
    try {
      const response = await this.api.get(ENDPOINTS.inventory.getById(id));
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Create a new inventory item
   * @param {Object} itemData - Item data
   * @returns {Promise<Object>} Created item
   */
  async createItem(itemData) {
    try {
      const response = await this.api.post(ENDPOINTS.inventory.create, itemData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Update an existing inventory item
   * @param {string} id - Item ID
   * @param {Object} itemData - Updated item data
   * @returns {Promise<Object>} Updated item
   */
  async updateItem(id, itemData) {
    try {
      const response = await this.api.put(ENDPOINTS.inventory.update(id), itemData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Delete an inventory item
   * @param {string} id - Item ID
   * @returns {Promise<void>}
   */
  async deleteItem(id) {
    try {
      await this.api.delete(ENDPOINTS.inventory.delete(id));
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Search inventory items
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Array>} Search results
   */
  async searchItems(searchParams) {
    try {
      const response = await this.api.get(ENDPOINTS.inventory.search, {
        params: searchParams
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Get inventory categories
   * @returns {Promise<Array>} List of categories
   */
  async getCategories() {
    try {
      const response = await this.api.get(ENDPOINTS.inventory.categories);
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Update stock levels
   * @param {string} id - Item ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated item
   */
  async updateStock(id, quantity) {
    try {
      const response = await this.api.patch(ENDPOINTS.inventory.update(id), {
        quantity
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Get low stock items
   * @param {number} threshold - Low stock threshold
   * @returns {Promise<Array>} List of low stock items
   */
  async getLowStockItems(threshold = 10) {
    try {
      const response = await this.api.get(ENDPOINTS.inventory.search, {
        params: { lowStock: true, threshold }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Bulk update inventory items
   * @param {Array} items - Array of items to update
   * @returns {Promise<Array>} Updated items
   */
  async bulkUpdate(items) {
    try {
      const response = await this.api.put(ENDPOINTS.inventory.base + '/bulk', {
        items
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Get inventory statistics
   * @returns {Promise<Object>} Inventory statistics
   */
  async getStatistics() {
    try {
      const response = await this.api.get(ENDPOINTS.inventory.base + '/statistics');
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }
}

export const inventoryService = new InventoryService(); 