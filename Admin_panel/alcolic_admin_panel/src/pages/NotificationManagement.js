import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Notifications,
  Send,
  Add,
  Edit,
  Delete,
  Email,
  Sms,
  PushPin,
  Info,
  Warning,
  Error,
  CheckCircle,
  Schedule,
  People,
  Store,
  LocalShipping,
  Settings
} from '@mui/icons-material';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  
  // Form states for sending notifications
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'system',
    category: 'info',
    priority: 'medium',
    targetType: 'all_users', // all_users, specific_users, by_role, by_store
    targetUsers: [],
    targetRole: '',
    targetStore: '',
    channels: ['in_app'], // in_app, email, sms, push
    scheduledAt: '',
    expiresAt: ''
  });

  // Notification settings
  const [settings, setSettings] = useState({
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    autoSend: false,
    defaultChannels: ['in_app']
  });

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/notifications/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
      }
    } catch (err) {
      setError('Failed to fetch notifications');
    }
  };

  // Send notification
  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      setError('Title and message are required');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php'}/notifications/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationForm)
      });

      if (response.ok) {
        setSuccess('Notification sent successfully!');
        setSendDialogOpen(false);
        resetForm();
        fetchNotifications();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send notification');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setNotificationForm({
      title: '',
      message: '',
      type: 'system',
      category: 'info',
      priority: 'medium',
      targetType: 'all_users',
      targetUsers: [],
      targetRole: '',
      targetStore: '',
      channels: ['in_app'],
      scheduledAt: '',
      expiresAt: ''
    });
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'success': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <Info color="info" />;
    }
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'order': return <Store />;
      case 'delivery': return <LocalShipping />;
      case 'payment': return <CheckCircle />;
      case 'promotion': return <PushPin />;
      default: return <Notifications />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Notification Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Notifications />}
            onClick={() => setHistoryDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Notification History
          </Button>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => setSettingsDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Settings
          </Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => setSendDialogOpen(true)}
          >
            Send Notification
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Sent Today
              </Typography>
              <Typography variant="h4">
                {notifications.filter(n => 
                  new Date(n.createdAt).toDateString() === new Date().toDateString()
                ).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Notifications
              </Typography>
              <Typography variant="h4">
                {notifications.filter(n => !n.sentVia.includes('push')).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Email Success Rate
              </Typography>
              <Typography variant="h4">
                98.5%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Push Success Rate
              </Typography>
              <Typography variant="h4">
                95.2%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Notifications */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Notifications
          </Typography>
          <List>
            {notifications.slice(0, 10).map((notification) => (
              <ListItem key={notification._id}>
                <ListItemIcon>
                  {getCategoryIcon(notification.category)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {notification.message}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={notification.type} 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        <Chip 
                          label={notification.priority} 
                          size="small"
                          color={getPriorityColor(notification.priority)}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {new Date(notification.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Send Notification Dialog */}
      <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={3}
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={notificationForm.type}
                  onChange={(e) => setNotificationForm({...notificationForm, type: e.target.value})}
                >
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="order">Order</MenuItem>
                  <MenuItem value="delivery">Delivery</MenuItem>
                  <MenuItem value="payment">Payment</MenuItem>
                  <MenuItem value="promotion">Promotion</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={notificationForm.category}
                  onChange={(e) => setNotificationForm({...notificationForm, category: e.target.value})}
                >
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={notificationForm.priority}
                  onChange={(e) => setNotificationForm({...notificationForm, priority: e.target.value})}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Target Type</InputLabel>
                <Select
                  value={notificationForm.targetType}
                  onChange={(e) => setNotificationForm({...notificationForm, targetType: e.target.value})}
                >
                  <MenuItem value="all_users">All Users</MenuItem>
                  <MenuItem value="specific_users">Specific Users</MenuItem>
                  <MenuItem value="by_role">By Role</MenuItem>
                  <MenuItem value="by_store">By Store</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationForm.channels.includes('email')}
                    onChange={(e) => {
                      const channels = e.target.checked 
                        ? [...notificationForm.channels, 'email']
                        : notificationForm.channels.filter(c => c !== 'email');
                      setNotificationForm({...notificationForm, channels});
                    }}
                  />
                }
                label="Send via Email"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationForm.channels.includes('sms')}
                    onChange={(e) => {
                      const channels = e.target.checked 
                        ? [...notificationForm.channels, 'sms']
                        : notificationForm.channels.filter(c => c !== 'sms');
                      setNotificationForm({...notificationForm, channels});
                    }}
                  />
                }
                label="Send via SMS"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationForm.channels.includes('push')}
                    onChange={(e) => {
                      const channels = e.target.checked 
                        ? [...notificationForm.channels, 'push']
                        : notificationForm.channels.filter(c => c !== 'push');
                      setNotificationForm({...notificationForm, channels});
                    }}
                  />
                }
                label="Send Push Notification"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSendNotification} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Messages */}
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationManagement;