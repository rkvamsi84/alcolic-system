import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Chat as ChatIcon,
  Support as SupportIcon,
  QuestionAnswer as FAQIcon,
  People as PeopleIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Notifications as NotificationsIcon,
  OnlinePrediction as OnlineIcon,
  OfflineBolt as OfflineIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const SupportManagement = () => {
  const { token } = useAuth();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [onlineAgents, setOnlineAgents] = useState([]);
  const [chatStats, setChatStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    resolved: 0
  });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // WebSocket connection for real-time chat
  const [ws, setWs] = useState(null);

  useEffect(() => {
    fetchChats();
    fetchAgents();
    fetchFaqs();
    fetchTickets();
    fetchChatStats();
    setupWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupWebSocket = () => {
    const websocket = new WebSocket(`wss://alcohol.gnritservices.com/chat`);
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message' && selectedChat && data.chatId === selectedChat._id) {
        setMessages(prev => [...prev, data.message]);
      } else if (data.type === 'chat_update') {
        fetchChats();
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/chat/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setChats(data.data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/admin/support-agents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setAgents(data.data);
        setOnlineAgents(data.data.filter(agent => agent.isOnline));
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchFaqs = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/admin/faqs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setFaqs(data.data);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/admin/support-tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchChatStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/admin/chat-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setChatStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching chat stats:', error);
    }
  };

  const selectChat = async (chat) => {
    setSelectedChat(chat);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/chat/${chat._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/chat/${selectedChat._id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage,
          type: 'text'
        })
      });
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        fetchChats(); // Refresh chat list to update last message
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedChat) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/chat/${selectedChat._id}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        fetchChats();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'resolved': return 'info';
      default: return 'default';
    }
  };

  const getChatTypeIcon = (type) => {
    switch (type) {
      case 'support': return <SupportIcon />;
      case 'customer_store': return <ChatIcon />;
      case 'customer_delivery': return <ChatIcon />;
      default: return <ChatIcon />;
    }
  };

  const renderChatList = () => (
    <Paper sx={{ height: '70vh', overflow: 'auto' }}>
      <List>
        {chats.map((chat) => (
          <ListItem
            key={chat._id}
            button
            selected={selectedChat?._id === chat._id}
            onClick={() => selectChat(chat)}
            sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
          >
            <ListItemAvatar>
              <Badge
                badgeContent={chat.unreadCount?.get(chat.participants[0]?._id) || 0}
                color="error"
              >
                <Avatar>
                  {getChatTypeIcon(chat.type)}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle2" component="span">
                    {chat.participants.find(p => p._id !== 'admin')?.name || 'Customer'}
                  </Typography>
                  <Chip
                    label={chat.type}
                    size="small"
                    color={getStatusColor(chat.type)}
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="textSecondary" noWrap component="span">
                    {chat.lastMessage?.content || 'No messages yet'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" component="span">
                    {new Date(chat.lastMessage?.timestamp || chat.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  const renderChatInterface = () => (
    <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
      {selectedChat ? (
        <>
          {/* Chat Header */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar>
              {getChatTypeIcon(selectedChat.type)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="subtitle1">
                {selectedChat.participants.find(p => p._id !== 'admin')?.name || 'Customer'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {selectedChat.type} • {selectedChat.isActive ? 'Active' : 'Inactive'}
              </Typography>
            </Box>
            <IconButton onClick={() => setSelectedChat(null)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'admin' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Paper
                  sx={{
                    p: 1,
                    maxWidth: '70%',
                    backgroundColor: message.sender === 'admin' ? 'primary.main' : 'grey.100',
                    color: message.sender === 'admin' ? 'white' : 'text.primary'
                  }}
                >
                  <Typography variant="body2">
                    {message.content}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Message Input */}
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Box display="flex" gap={1}>
              <IconButton onClick={() => fileInputRef.current?.click()}>
                <AttachFileIcon />
              </IconButton>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <IconButton onClick={sendMessage} color="primary">
                <SendIcon />
              </IconButton>
            </Box>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </Box>
        </>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="h6" color="textSecondary">
            Select a chat to start messaging
          </Typography>
        </Box>
      )}
    </Paper>
  );

  const renderDashboard = () => (
    <Grid container spacing={3}>
      {/* Stats Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Chats
            </Typography>
            <Typography variant="h4">
              {chatStats.total}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Active Chats
            </Typography>
            <Typography variant="h4" color="success.main">
              {chatStats.active}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Pending
            </Typography>
            <Typography variant="h4" color="warning.main">
              {chatStats.pending}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Online Agents
            </Typography>
            <Typography variant="h4" color="info.main">
              {onlineAgents.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Online Agents */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Online Agents
            </Typography>
            <List>
              {onlineAgents.map((agent) => (
                <ListItem key={agent._id}>
                  <ListItemAvatar>
                    <Avatar>
                      <OnlineIcon color="success" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={agent.name}
                    secondary={`${agent.activeChats} active chats`}
                  />
                  <Chip label="Online" color="success" size="small" />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {chats.slice(0, 5).map((chat) => (
                <ListItem key={chat._id}>
                  <ListItemText
                    primary={`${chat.participants.find(p => p._id !== 'admin')?.name || 'Customer'} - ${chat.type}`}
                    secondary={new Date(chat.lastMessage?.timestamp || chat.createdAt).toLocaleString()}
                  />
                  <Chip
                    label={chat.isActive ? 'Active' : 'Inactive'}
                    color={chat.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTickets = () => (
    <Grid container spacing={3}>
      {tickets.map((ticket) => (
        <Grid item xs={12} md={6} key={ticket._id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  #{ticket.ticketNumber}
                </Typography>
                <Chip
                  label={ticket.status}
                  color={getStatusColor(ticket.status)}
                />
              </Box>
              <Typography variant="subtitle1" gutterBottom>
                {ticket.subject}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {ticket.description}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="textSecondary">
                  {ticket.customer?.name} • {new Date(ticket.createdAt).toLocaleDateString()}
                </Typography>
                <Button size="small" variant="outlined">
                  View Details
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderFAQs = () => (
    <Grid container spacing={3}>
      {faqs.map((faq) => (
        <Grid item xs={12} md={6} key={faq._id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {faq.question}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {faq.answer}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Chip label={faq.category} size="small" />
                <Box>
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderAgents = () => (
    <Grid container spacing={3}>
      {agents.map((agent) => (
        <Grid item xs={12} md={4} key={agent._id}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar>
                  {agent.isOnline ? <OnlineIcon color="success" /> : <OfflineIcon />}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {agent.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {agent.role}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">
                  {agent.activeChats} active chats
                </Typography>
                <Chip
                  label={agent.isOnline ? 'Online' : 'Offline'}
                  color={agent.isOnline ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Support & Live Chat
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchChats}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Dashboard" icon={<SupportIcon />} />
        <Tab label="Live Chat" icon={<ChatIcon />} />
        <Tab label="Tickets" icon={<SupportIcon />} />
        <Tab label="FAQs" icon={<FAQIcon />} />
        <Tab label="Agents" icon={<PeopleIcon />} />
      </Tabs>

      {activeTab === 0 && renderDashboard()}
      
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            {renderChatList()}
          </Grid>
          <Grid item xs={12} md={8}>
            {renderChatInterface()}
          </Grid>
        </Grid>
      )}
      
      {activeTab === 2 && renderTickets()}
      {activeTab === 3 && renderFAQs()}
      {activeTab === 4 && renderAgents()}
    </Box>
  );
};

export default SupportManagement;