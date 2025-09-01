import { Box, Typography, Grid, Card, CardContent, Paper, List, ListItem, ListItemIcon, ListItemText, Chip, Button, TextField, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Switch, FormControlLabel, CircularProgress, Alert, Pagination, useTheme } from "@mui/material";
import { Notifications, Email, Sms, CheckCircle, Error, FilterList, Search, Close, Visibility, Send, Refresh } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php';

const getStatusColor = (status) => {
  switch (status) {
    case "read": return "success";
    case "unread": return "warning";
    default: return "default";
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case "order": return <Notifications />;
    case "delivery": return <Sms />;
    case "payment": return <Email />;
    case "system": return <Notifications />;
    case "promotion": return <Notifications />;
    case "refund": return <Notifications />;
    default: return <Notifications />;
  }
};

export default function NotificationsPage() {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [sendNotificationDialogOpen, setSendNotificationDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  
  // Send notification form states
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [notificationType, setNotificationType] = useState("push");
  const [notificationCategory, setNotificationCategory] = useState("system");
  const [notificationPriority, setNotificationPriority] = useState("medium");
  const [targetRole, setTargetRole] = useState("customers");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });

      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await axios.get(`${API_BASE_URL}/notifications/admin/all?${params}`, { headers });

      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setPagination(response.data.data.pagination);
      } else {
        setError('Failed to fetch notifications');
      }

    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, typeFilter, categoryFilter]);

  // Fetch notification statistics
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const response = await axios.get(`${API_BASE_URL}/notifications/admin/stats`, { headers });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  }, []);

  // Send notification
  const handleSendNotificationSubmit = async () => {
    try {
      setSendingNotification(true);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const notificationData = {
        title: notificationTitle,
        message: notificationBody,
        type: notificationType,
        category: notificationCategory,
        priority: notificationPriority,
        role: targetRole,
        scheduledTime: isScheduled ? scheduledTime : null
      };

      const response = await axios.post(`${API_BASE_URL}/notifications/send`, notificationData, { headers });

      if (response.data.success) {
        // Reset form and close dialog
        setNotificationTitle("");
        setNotificationBody("");
        setNotificationType("push");
        setNotificationCategory("system");
        setNotificationPriority("medium");
        setTargetRole("customers");
        setScheduledTime("");
        setIsScheduled(false);
        setSendNotificationDialogOpen(false);
        
        // Refresh notifications
        fetchNotifications();
        fetchStats();
        
        alert("Notification sent successfully!");
      } else {
        setError('Failed to send notification');
      }

    } catch (error) {
      console.error('Error sending notification:', error);
      setError(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setSendingNotification(false);
    }
  };

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setViewDialogOpen(true);
  };

  const handleMoreFilters = () => {
    setFiltersDialogOpen(true);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setCategoryFilter("all");
    setDateFilter("");
    setFiltersDialogOpen(false);
  };

  const handleSendNotification = () => {
    setSendNotificationDialogOpen(true);
  };

  const handleSendNotificationCancel = () => {
    setSendNotificationDialogOpen(false);
    // Reset form
    setNotificationTitle("");
    setNotificationBody("");
    setNotificationType("push");
    setNotificationCategory("system");
    setNotificationPriority("medium");
    setTargetRole("customers");
    setScheduledTime("");
    setIsScheduled(false);
  };

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         n.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || n.isRead === (statusFilter === "read");
    const matchesType = typeFilter === "all" || n.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || n.category === categoryFilter;
    const matchesDate = !dateFilter || new Date(n.createdAt).toISOString().split('T')[0] === dateFilter;
    return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesDate;
  });

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [fetchNotifications, fetchStats]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Notifications</Typography>
        <Box display="flex" gap={2}>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={() => {
              fetchNotifications();
              fetchStats();
            }}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Send />}
            onClick={handleSendNotification}
          >
            Send Notification
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Notifications
              </Typography>
              <Typography variant="h4">
                {stats.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Unread
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.unread || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Read
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.read || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Success Rate
              </Typography>
              <Typography variant="h4" color="primary.main">
                {stats.total > 0 ? Math.round(((stats.total - (stats.failed || 0)) / stats.total) * 100) : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="Search Notifications" 
              variant="outlined" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              InputProps={{ 
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> 
              }} 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select 
                value={statusFilter} 
                label="Status Filter" 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="read">Read</MenuItem>
                <MenuItem value="unread">Unread</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              variant="outlined" 
              startIcon={<FilterList />} 
              fullWidth
              onClick={handleMoreFilters}
            >
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <List>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        ) : filteredNotifications.length === 0 ? (
          <Typography variant="body1" align="center" p={4}>No notifications found.</Typography>
        ) : (
          filteredNotifications.map((n) => (
            <ListItem key={n._id} alignItems="flex-start" sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
              <ListItemIcon>{getTypeIcon(n.type)}</ListItemIcon>
              <ListItemText
                primary={
                  <>
                    <Typography variant="subtitle1" fontWeight="bold">{n.title}</Typography>
                    <Typography variant="body2" color="textSecondary">{n.message}</Typography>
                  </>
                }
                secondary={
                  <>
                    <Typography variant="caption">{n.role} • {new Date(n.createdAt).toLocaleDateString()}</Typography>
                  </>
                }
              />
              <Chip label={n.isRead ? "Read" : "Unread"} color={getStatusColor(n.isRead ? "read" : "unread")} size="small" sx={{ mr: 2 }} />
              <Button 
                size="small" 
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => handleViewNotification(n)}
              >
                View
              </Button>
            </ListItem>
          ))
        )}
      </List>

      {pagination.total > pagination.limit && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={Math.ceil(pagination.total / pagination.limit)}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Send Notification Dialog */}
      <Dialog open={sendNotificationDialogOpen} onClose={handleSendNotificationCancel} maxWidth="md" fullWidth>
        <DialogTitle>
          Send New Notification
          <IconButton
            aria-label="close"
            onClick={handleSendNotificationCancel}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Notification Title"
              variant="outlined"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            
            <TextField
              fullWidth
              label="Notification Body"
              variant="outlined"
              value={notificationBody}
              onChange={(e) => setNotificationBody(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 2 }}
              required
            />
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Notification Type</InputLabel>
                  <Select 
                    value={notificationType} 
                    label="Notification Type" 
                    onChange={(e) => setNotificationType(e.target.value)}
                  >
                    <MenuItem value="order">Order Updates</MenuItem>
                    <MenuItem value="delivery">Delivery</MenuItem>
                    <MenuItem value="payment">Payment</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                    <MenuItem value="promotion">Promotion</MenuItem>
                    <MenuItem value="refund">Refund</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select 
                    value={notificationCategory} 
                    label="Category" 
                    onChange={(e) => setNotificationCategory(e.target.value)}
                  >
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select 
                    value={notificationPriority} 
                    label="Priority" 
                    onChange={(e) => setNotificationPriority(e.target.value)}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Target Role</InputLabel>
                  <Select 
                    value={targetRole} 
                    label="Target Role" 
                    onChange={(e) => setTargetRole(e.target.value)}
                  >
                    <MenuItem value="customers">Customers</MenuItem>
                    <MenuItem value="store_owners">Store Owners</MenuItem>
                    <MenuItem value="drivers">Drivers</MenuItem>
                    <MenuItem value="admin_users">Admin Users</MenuItem>
                    <MenuItem value="all_users">All Users</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={isScheduled} 
                      onChange={(e) => setIsScheduled(e.target.checked)} 
                    />
                  }
                  label="Schedule for later"
                />
              </Grid>
            </Grid>
            
            {isScheduled && (
              <TextField
                fullWidth
                label="Schedule Time"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSendNotificationCancel}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSendNotificationSubmit}
            disabled={!notificationTitle || !notificationBody || sendingNotification}
            startIcon={sendingNotification ? <CircularProgress size={20} /> : <Send />}
          >
            {sendingNotification ? "Sending..." : (isScheduled ? "Schedule Notification" : "Send Now")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* More Filters Dialog */}
      <Dialog open={filtersDialogOpen} onClose={() => setFiltersDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Advanced Filters
          <IconButton
            aria-label="close"
            onClick={() => setFiltersDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Notification Type</InputLabel>
              <Select 
                value={typeFilter} 
                label="Notification Type" 
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="order">Order Updates</MenuItem>
                <MenuItem value="delivery">Delivery</MenuItem>
                <MenuItem value="payment">Payment</MenuItem>
                <MenuItem value="system">System</MenuItem>
                <MenuItem value="promotion">Promotion</MenuItem>
                <MenuItem value="refund">Refund</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Audience</InputLabel>
              <Select 
                value={categoryFilter} 
                label="Category" 
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Date Filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearFilters}>Clear All</Button>
          <Button variant="contained" onClick={() => setFiltersDialogOpen(false)}>Apply Filters</Button>
        </DialogActions>
      </Dialog>

      {/* View Notification Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Notification Details
          <IconButton
            aria-label="close"
            onClick={() => setViewDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box sx={{ mt: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                {getTypeIcon(selectedNotification.type)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {selectedNotification.title}
                </Typography>
                <Chip 
                  label={selectedNotification.isRead ? "Read" : "Unread"} 
                  color={getStatusColor(selectedNotification.isRead ? "read" : "unread")} 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              </Box>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedNotification.message}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Type</Typography>
                  <Typography variant="body2">{selectedNotification.type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Category</Typography>
                  <Typography variant="body2">{selectedNotification.category}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Date</Typography>
                  <Typography variant="body2">{new Date(selectedNotification.createdAt).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Created</Typography>
                  <Typography variant="body2">{new Date(selectedNotification.createdAt).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Priority</Typography>
                  <Typography variant="body2">{selectedNotification.priority}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Typography variant="body2">{selectedNotification.isRead ? "Read" : "Unread"}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}