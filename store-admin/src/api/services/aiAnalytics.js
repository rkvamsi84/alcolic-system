import axios from 'axios';
import { API_CONFIG, ENDPOINTS, AI_CONFIG, ERROR_MESSAGES } from '../config';
import OpenAI from 'openai';
import vision from '@google-cloud/vision';

class AIAnalyticsService {
  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.baseURL,
      headers: API_CONFIG.headers
    });

    // Initialize OpenAI
    this.openai = new OpenAI({
      apiKey: AI_CONFIG.openai.apiKey
    });

    // Initialize Google Vision
    this.imageClient = new vision.ImageAnnotatorClient({
      keyFilename: AI_CONFIG.googleVision.credentials
    });
  }

  /**
   * Analyze sales patterns and generate insights
   * @param {Object} params - Analysis parameters
   * @returns {Promise<Object>} Sales analysis and recommendations
   */
  async analyzeSales(params = {}) {
    try {
      const response = await this.api.post(ENDPOINTS.ai.analyzeSales, params);
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Predict inventory needs
   * @param {Object} params - Prediction parameters
   * @returns {Promise<Object>} Inventory predictions
   */
  async predictInventory(params = {}) {
    try {
      const response = await this.api.post(ENDPOINTS.ai.predictInventory, params);
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Analyze customer behavior patterns
   * @param {Object} params - Analysis parameters
   * @returns {Promise<Object>} Customer behavior insights
   */
  async analyzeCustomerBehavior(params = {}) {
    try {
      const response = await this.api.post(ENDPOINTS.ai.customerBehavior, params);
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Get AI-powered price optimization suggestions
   * @param {Object} params - Optimization parameters
   * @returns {Promise<Object>} Price optimization recommendations
   */
  async optimizePricing(params = {}) {
    try {
      const response = await this.api.post(ENDPOINTS.ai.priceOptimization, params);
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Analyze product images for quality and compliance
   * @param {string} imageUrl - URL of the image to analyze
   * @returns {Promise<Object>} Image analysis results
   */
  async analyzeProductImage(imageUrl) {
    try {
      const [result] = await this.imageClient.labelDetection(imageUrl);
      const labels = result.labelAnnotations;
      
      // Additional safety checks for alcohol products
      const safetyCheck = await this.imageClient.safeSearch(imageUrl);
      
      return {
        labels: labels.map(label => ({
          description: label.description,
          confidence: label.score
        })),
        safetyCheck: safetyCheck[0].safeSearchAnnotation
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Generate product descriptions using AI
   * @param {Object} productInfo - Basic product information
   * @returns {Promise<Object>} Generated description and metadata
   */
  async generateProductDescription(productInfo) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: AI_CONFIG.openai.model,
        messages: [
          {
            role: "system",
            content: "You are a professional liquor store product description writer. Create engaging, accurate, and compliant product descriptions."
          },
          {
            role: "user",
            content: `Generate a product description for: ${JSON.stringify(productInfo)}`
          }
        ],
        max_tokens: AI_CONFIG.openai.maxTokens
      });

      return {
        description: completion.choices[0].message.content,
        metadata: {
          model: completion.model,
          usage: completion.usage
        }
      };
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Get AI-powered inventory insights
   * @returns {Promise<Object>} Inventory insights and recommendations
   */
  async getInventoryInsights() {
    try {
      const response = await this.api.get(ENDPOINTS.ai.base + '/inventory-insights');
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Get AI-powered sales forecasts
   * @param {Object} params - Forecast parameters
   * @returns {Promise<Object>} Sales forecasts
   */
  async getSalesForecasts(params = {}) {
    try {
      const response = await this.api.post(ENDPOINTS.ai.base + '/sales-forecast', params);
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Get compliance recommendations
   * @returns {Promise<Object>} Compliance insights and recommendations
   */
  async getComplianceRecommendations() {
    try {
      const response = await this.api.get(ENDPOINTS.ai.base + '/compliance-check');
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }

  /**
   * Get personalized customer recommendations
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Personalized recommendations
   */
  async getCustomerRecommendations(customerId) {
    try {
      const response = await this.api.get(
        ENDPOINTS.ai.base + `/customer-recommendations/${customerId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  }
}

export const aiAnalyticsService = new AIAnalyticsService(); 