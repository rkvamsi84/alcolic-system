import { apiService } from '../config/api';

class SupportService {
  constructor() {
    this.baseURL = '/support';
  }

  // Get all FAQs
  async getFAQs(category = null, search = null, limit = 20) {
    try {
      const params = { limit };
      if (category) params.category = category;
      if (search) params.search = search;
      
      const response = await apiService.get(`${this.baseURL}/faqs`, { params });
      return response;
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      throw error;
    }
  }

  // Get FAQ by ID
  async getFAQById(id) {
    try {
      const response = await apiService.get(`${this.baseURL}/faqs/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      throw error;
    }
  }

  // Mark FAQ as helpful
  async markFAQHelpful(id) {
    try {
      const response = await apiService.post(`${this.baseURL}/faqs/${id}/helpful`);
      return response;
    } catch (error) {
      console.error('Error marking FAQ as helpful:', error);
      throw error;
    }
  }

  // Get knowledge base articles
  async getKnowledgeBaseArticles(category = null, search = null, limit = 20) {
    try {
      const params = { limit };
      if (category) params.category = category;
      if (search) params.search = search;
      
      const response = await apiService.get(`${this.baseURL}/knowledge-base`, { params });
      return response;
    } catch (error) {
      console.error('Error fetching knowledge base articles:', error);
      throw error;
    }
  }

  // Get user's support tickets
  async getTickets(page = 1, limit = 20, status = null) {
    try {
      const params = { page, limit };
      if (status) params.status = status;
      
      const response = await apiService.get(`${this.baseURL}/tickets`, { params });
      return response;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  // Create support ticket
  async createTicket(ticketData) {
    try {
      const response = await apiService.post(`${this.baseURL}/tickets`, ticketData);
      return response.data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  // Get support ticket by ID
  async getTicketById(id) {
    try {
      const response = await apiService.get(`${this.baseURL}/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  }

  // Add message to ticket
  async addTicketMessage(ticketId, content) {
    try {
      const response = await apiService.post(`${this.baseURL}/tickets/${ticketId}/messages`, {
        content
      });
      return response.data;
    } catch (error) {
      console.error('Error adding ticket message:', error);
      throw error;
    }
  }

  // Start chat session
  async startChat(category = 'general', priority = 'medium') {
    try {
      const response = await apiService.post(`${this.baseURL}/chat/start`, {
        category,
        priority
      });
      return response.data;
    } catch (error) {
      console.error('Error starting chat:', error);
      throw error;
    }
  }

  // Get priority color
  getPriorityColor(priority) {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
      urgent: '#9C27B0'
    };
    return colors[priority] || colors.medium;
  }

  // Get status color
  getStatusColor(status) {
    const colors = {
      open: '#2196F3',
      in_progress: '#FF9800',
      waiting_for_customer: '#FFC107',
      resolved: '#4CAF50',
      closed: '#9E9E9E'
    };
    return colors[status] || colors.open;
  }

  // Generate mock FAQs
  generateMockFAQs() {
    return [
      {
        _id: '1',
        question: 'How do I track my order?',
        answer: 'You can track your order by going to the "My Orders" section in your profile.',
        category: 'orders',
        helpfulCount: 45,
        views: 120
      },
      {
        _id: '2',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, PayPal, and cash on delivery.',
        category: 'payments',
        helpfulCount: 32,
        views: 89
      }
    ];
  }
}

const supportService = new SupportService();
export default supportService; 