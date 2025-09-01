import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Alert,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Divider
} from '@mui/material';
import {
  Help as HelpIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Chat as ChatIcon,
  Article as ArticleIcon,
  Support as SupportIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon,
  Close as CloseIcon,
  PriorityHigh as PriorityHighIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSupport } from '../../contexts/SupportContext';
import toast from 'react-hot-toast';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`support-tabpanel-${index}`}
      aria-labelledby={`support-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// FAQ Component
const FAQSection = () => {
  const { faqs, loading, markFAQHelpful } = useSupport();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Ensure faqs is always an array to prevent filter errors
  const safeFaqs = Array.isArray(faqs) ? faqs : [];
  
  const filteredFAQs = safeFaqs.filter(faq => {
    // Add safety checks for faq properties
    if (!faq || typeof faq !== 'object') return false;
    
    const question = faq.question || '';
    const answer = faq.answer || '';
    const category = faq.category || '';
    
    const matchesSearch = question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'orders', label: 'Orders' },
    { value: 'payments', label: 'Payments' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'products', label: 'Products' },
    { value: 'account', label: 'Account' },
    { value: 'technical', label: 'Technical' },
    { value: 'returns', label: 'Returns' }
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Frequently Asked Questions
      </Typography>
      
      {/* Search and Filter */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} key={item}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
          ))}
        </Grid>
      ) : filteredFAQs.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <HelpIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No FAQs found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or category filter
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredFAQs.map((faq) => (
            <Grid item xs={12} key={faq._id}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{faq.question}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label={faq.category} 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {faq.views} views • {faq.helpfulCount} helpful
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body1" paragraph>
                      {faq.answer}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                        Was this helpful?
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => markFAQHelpful(faq._id)}
                        color="primary"
                      >
                        <ThumbUpIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// Knowledge Base Component
const KnowledgeBaseSection = () => {
  const { knowledgeBase, loadKnowledgeBase, loading } = useSupport();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadKnowledgeBase();
  }, [loadKnowledgeBase]);

  // Ensure knowledgeBase is always an array to prevent filter errors
  const safeKnowledgeBase = Array.isArray(knowledgeBase) ? knowledgeBase : [];
  
  const filteredArticles = safeKnowledgeBase.filter(article => {
    // Add safety checks for article properties
    if (!article || typeof article !== 'object') return false;
    
    const title = article.title || '';
    const content = article.content || '';
    
    return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           content.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Knowledge Base
      </Typography>
      
      <TextField
        fullWidth
        placeholder="Search knowledge base..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
        }}
      />

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={6} key={item}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      ) : filteredArticles.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <ArticleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No articles found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search terms
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredArticles.map((article) => (
            <Grid item xs={12} md={6} key={article._id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {article.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {article.content.substring(0, 150)}...
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {article.views} views
                    </Typography>
                    <Button size="small" variant="outlined">
                      Read More
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// Support Tickets Component
const SupportTicketsSection = () => {
  const { tickets, loading, createTicket, addTicketMessage, getPriorityColor, getStatusColor, getStatusText, getCategoryText, formatTicketNumber, formatDate, isTicketOverdue } = useSupport();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  const [newMessage, setNewMessage] = useState('');

  const handleCreateTicket = async () => {
    try {
      await createTicket(newTicket);
      setCreateDialogOpen(false);
      setNewTicket({
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleAddMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;
    
    try {
      await addTicketMessage(selectedTicket._id, newMessage);
      setMessageDialogOpen(false);
      setNewMessage('');
      setSelectedTicket(null);
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <ErrorIcon color="error" />;
      case 'high':
        return <PriorityHighIcon color="warning" />;
      case 'medium':
        return <ScheduleIcon color="info" />;
      case 'low':
        return <CheckCircleIcon color="success" />;
      default:
        return <InfoIcon />;
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'Urgent';
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'Unknown';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Support Tickets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Ticket
        </Button>
      </Box>

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} key={item}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <SupportIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No support tickets
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Create your first support ticket to get help
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Ticket
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {tickets.map((ticket) => (
            <Grid item xs={12} key={ticket._id}>
              <Card sx={{ 
                border: isTicketOverdue(ticket) ? '2px solid #f44336' : 'none',
                backgroundColor: isTicketOverdue(ticket) ? '#ffebee' : 'inherit'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {ticket.subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {ticket.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getPriorityIcon(ticket.priority)}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Chip 
                      label={getCategoryText(ticket.category)} 
                      size="small"
                    />
                    <Chip 
                      label={getStatusText(ticket.status)} 
                      size="small"
                      sx={{ backgroundColor: getStatusColor(ticket.status), color: 'white' }}
                    />
                    <Chip 
                      label={getPriorityText(ticket.priority)} 
                      size="small"
                      sx={{ backgroundColor: getPriorityColor(ticket.priority), color: 'white' }}
                    />
                    {isTicketOverdue(ticket) && (
                      <Chip 
                        label="Overdue" 
                        size="small"
                        color="error"
                      />
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      #{formatTicketNumber(ticket.ticketNumber)} • {formatDate(ticket.createdAt)}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setMessageDialogOpen(true);
                      }}
                    >
                      Add Message
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Support Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Subject"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    label="Category"
                  >
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="order_issue">Order Issue</MenuItem>
                    <MenuItem value="payment_issue">Payment Issue</MenuItem>
                    <MenuItem value="delivery_issue">Delivery Issue</MenuItem>
                    <MenuItem value="product_issue">Product Issue</MenuItem>
                    <MenuItem value="account_issue">Account Issue</MenuItem>
                    <MenuItem value="technical_issue">Technical Issue</MenuItem>
                    <MenuItem value="return_issue">Return Issue</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    label="Priority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateTicket}
            disabled={!newTicket.subject || !newTicket.description}
          >
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Message Dialog */}
      <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Message to Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddMessage}
            disabled={!newMessage.trim()}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Live Chat Component
const LiveChatSection = () => {
  const { startChat } = useSupport();
  const [chatStarted, setChatStarted] = useState(false);
  const [chatSession, setChatSession] = useState(null);

  const handleStartChat = async () => {
    try {
      const session = await startChat();
      setChatSession(session);
      setChatStarted(true);
      toast.success('Chat session started!');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat session');
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Live Chat Support
      </Typography>
      
      {!chatStarted ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <ChatIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Start a Live Chat
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Connect with our support team in real-time for immediate assistance
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<ChatIcon />}
                onClick={handleStartChat}
              >
                Start Chat
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ChatIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">
                Chat Session Active
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Session ID: {chatSession?.sessionId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status: {chatSession?.status}
            </Typography>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => setChatStarted(false)}
            >
              End Chat
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

// Main Support Dashboard Component
const SupportDashboardPage = () => {
  const { loading, error } = useSupport();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom>
          Customer Support
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Get help with your orders, account, and any other questions you may have
        </Typography>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="FAQs" />
            <Tab label="Knowledge Base" />
            <Tab label="Support Tickets" />
            <Tab label="Live Chat" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <FAQSection />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <KnowledgeBaseSection />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <SupportTicketsSection />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <LiveChatSection />
        </TabPanel>
      </motion.div>
    </Container>
  );
};

export default SupportDashboardPage;