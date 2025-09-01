import React, { createContext, useContext, useState, useEffect } from 'react';
import supportService from '../services/supportService';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SupportContext = createContext();

export const useSupport = () => {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return context;
};

export const SupportProvider = ({ children }) => {
  const [faqs, setFaqs] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, token } = useAuth();

  // Load FAQs
  const loadFAQs = async (category = null, search = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await supportService.getFAQs(category, search);
      if (response && response.data) {
        setFaqs(response.data);
      } else {
        console.warn('Invalid response structure from getFAQs:', response);
        setFaqs([]);
      }
    } catch (err) {
      console.error('Error loading FAQs:', err);
      setError(err.message || 'Failed to load FAQs');
      
      // Use mock data for development
      if (process.env.NODE_ENV === 'development') {
        setFaqs(supportService.generateMockFAQs());
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load knowledge base
  const loadKnowledgeBase = async (category = null, search = null) => {
    try {
      const response = await supportService.getKnowledgeBaseArticles(category, search);
      if (response && response.data) {
        setKnowledgeBase(response.data);
      } else {
        console.warn('Invalid response structure from getKnowledgeBaseArticles:', response);
        setKnowledgeBase([]);
      }
    } catch (err) {
      console.error('Error loading knowledge base:', err);
      setKnowledgeBase([]);
      throw err;
    }
  };

  // Load tickets
  const loadTickets = async (page = 1, status = null) => {
    // Only allow customer users to load tickets
    if (!user || user.role !== 'customer') {
      console.warn('Support tickets are only available for customer users');
      setTickets([]);
      return { tickets: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    }

    try {
      const response = await supportService.getTickets(page, 20, status);
      if (response && response.data && response.data.tickets) {
        setTickets(response.data.tickets);
        return response.data;
      } else {
        console.warn('Invalid response structure from getTickets:', response);
        setTickets([]);
        return { tickets: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
      }
    } catch (err) {
      console.error('Error loading tickets:', err);
      setTickets([]);
      throw err;
    }
  };

  // Create ticket
  const createTicket = async (ticketData) => {
    // Only allow customer users to create tickets
    if (!user || user.role !== 'customer') {
      toast.error('Support tickets are only available for customer users');
      throw new Error('Unauthorized: Only customer users can create tickets');
    }

    try {
      const response = await supportService.createTicket(ticketData);
      
      // Add to local state
      setTickets(prev => [response.data, ...prev]);
      
      toast.success('Support ticket created successfully!');
      return response.data;
    } catch (err) {
      console.error('Error creating ticket:', err);
      toast.error(err.response?.data?.message || 'Failed to create ticket');
      throw err;
    }
  };

  // Add message to ticket
  const addTicketMessage = async (ticketId, content) => {
    // Only allow customer users to add ticket messages
    if (!user || user.role !== 'customer') {
      toast.error('Support tickets are only available for customer users');
      throw new Error('Unauthorized: Only customer users can add ticket messages');
    }

    try {
      const response = await supportService.addTicketMessage(ticketId, content);
      
      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket._id === ticketId ? response.data : ticket
      ));
      
      toast.success('Message sent successfully!');
      return response.data;
    } catch (err) {
      console.error('Error adding ticket message:', err);
      toast.error(err.response?.data?.message || 'Failed to send message');
      throw err;
    }
  };

  // Mark FAQ as helpful
  const markFAQHelpful = async (faqId) => {
    try {
      await supportService.markFAQHelpful(faqId);
      
      // Update local state
      setFaqs(prev => prev.map(faq => 
        faq._id === faqId 
          ? { ...faq, helpfulCount: faq.helpfulCount + 1 }
          : faq
      ));
      
      toast.success('Thank you for your feedback!');
    } catch (err) {
      console.error('Error marking FAQ as helpful:', err);
      toast.error('Failed to submit feedback');
    }
  };

  // Start chat
  const startChat = async (category = 'general', priority = 'medium') => {
    try {
      const response = await supportService.startChat(category, priority);
      return response.data;
    } catch (err) {
      console.error('Error starting chat:', err);
      throw err;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    return supportService.getPriorityColor(priority);
  };

  // Get status color
  const getStatusColor = (status) => {
    return supportService.getStatusColor(status);
  };

  // Get status text
  const getStatusText = (status) => {
    const statusTexts = {
      open: 'Open',
      in_progress: 'In Progress',
      waiting_for_customer: 'Waiting for Customer',
      resolved: 'Resolved',
      closed: 'Closed'
    };
    return statusTexts[status] || 'Unknown';
  };

  // Get category text
  const getCategoryText = (category) => {
    const categoryTexts = {
      general: 'General',
      order_issue: 'Order Issue',
      payment_issue: 'Payment Issue',
      delivery_issue: 'Delivery Issue',
      product_issue: 'Product Issue',
      account_issue: 'Account Issue',
      technical_issue: 'Technical Issue',
      return_issue: 'Return Issue'
    };
    return categoryTexts[category] || 'General';
  };

  // Format ticket number
  const formatTicketNumber = (ticketNumber) => {
    return ticketNumber || 'N/A';
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if ticket is overdue
  const isTicketOverdue = (ticket) => {
    if (!ticket.createdAt) return false;
    
    const now = new Date();
    const created = new Date(ticket.createdAt);
    const hoursSinceCreation = (now - created) / (1000 * 60 * 60);
    
    switch (ticket.priority) {
      case 'urgent':
        return hoursSinceCreation > 2;
      case 'high':
        return hoursSinceCreation > 24;
      case 'medium':
        return hoursSinceCreation > 72;
      case 'low':
        return hoursSinceCreation > 168; // 1 week
      default:
        return false;
    }
  };

  // Load initial data
  useEffect(() => {
    // Only load support data if user is authenticated
    if (user && token) {
      loadFAQs();
      loadKnowledgeBase();
      // Only load tickets for customer users, not delivery users
      if (user.role === 'customer') {
        loadTickets();
      }
    }
  }, [user, token]);

  const value = {
    // State
    faqs,
    knowledgeBase,
    tickets,
    loading,
    error,
    
    // Actions
    loadFAQs,
    loadKnowledgeBase,
    loadTickets,
    createTicket,
    addTicketMessage,
    markFAQHelpful,
    startChat,
    
    // Utility functions
    getPriorityColor,
    getStatusColor,
    getStatusText,
    getCategoryText,
    formatTicketNumber,
    formatDate,
    isTicketOverdue
  };

  return (
    <SupportContext.Provider value={value}>
      {children}
    </SupportContext.Provider>
  );
};