import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Button,
  Menu,
  MenuItem,
  Badge,
  Divider,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteIcon from '@mui/icons-material/Delete';
import PageContainer from '../components/PageContainer';

const MotionCard = motion(Card);

const NotificationCenter = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      message: 'Order #12345 has been placed for $299.99',
      time: '2 minutes ago',
      status: 'unread',
      priority: 'high',
    },
    {
      id: 2,
      type: 'user',
      title: 'New User Registration',
      message: 'John Doe has created a new account',
      time: '15 minutes ago',
      status: 'read',
      priority: 'medium',
    },
    {
      id: 3,
      type: 'system',
      title: 'System Update',
      message: 'System maintenance scheduled for tonight at 2 AM',
      time: '1 hour ago',
      status: 'unread',
      priority: 'high',
    },
    {
      id: 4,
      type: 'order',
      title: 'Order Cancelled',
      message: 'Order #12342 has been cancelled by the customer',
      time: '2 hours ago',
      status: 'read',
      priority: 'medium',
    },
    {
      id: 5,
      type: 'system',
      title: 'Low Stock Alert',
      message: 'Product ID #789 is running low on stock (5 units remaining)',
      time: '3 hours ago',
      status: 'unread',
      priority: 'high',
    },
  ];

  const stats = [
    {
      title: 'Total Notifications',
      value: '58',
      change: '+12 today',
    },
    {
      title: 'Unread',
      value: '23',
      change: '40% of total',
    },
    {
      title: 'High Priority',
      value: '15',
      change: '8 unread',
    },
    {
      title: 'Response Rate',
      value: '92%',
      change: '+5% this week',
    },
  ];

  const handleOpenMenu = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingCartIcon color="primary" />;
      case 'user':
        return <PersonIcon color="success" />;
      case 'system':
        return <WarningIcon color="warning" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.info.main;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true;
    return notification.status === filter;
  });

  return (
    <PageContainer title="Notification Center">
      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="success.main">
                  {stat.change}
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant={filter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setFilter('all')}
              startIcon={<FilterListIcon />}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'contained' : 'outlined'}
              onClick={() => setFilter('unread')}
              startIcon={
                <Badge badgeContent={notifications.filter(n => n.status === 'unread').length} color="error">
                  <MarkEmailReadIcon />
                </Badge>
              }
            >
              Unread
            </Button>
            <Button
              variant={filter === 'read' ? 'contained' : 'outlined'}
              onClick={() => setFilter('read')}
              startIcon={<CheckCircleIcon />}
            >
              Read
            </Button>
          </Box>

          <Card>
            <List sx={{ width: '100%' }}>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{
                      bgcolor: notification.status === 'unread' ? 'action.hover' : 'inherit',
                    }}
                  >
                    <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{notification.title}</Typography>
                          <Chip
                            label={notification.priority}
                            size="small"
                            sx={{
                              color: getPriorityColor(notification.priority),
                              bgcolor: `${getPriorityColor(notification.priority)}15`,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                          <Typography variant="body2" color="text.primary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notification.time}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(event) => handleOpenMenu(event, notification)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Card>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={handleCloseMenu}>
              <ListItemIcon>
                <MarkEmailReadIcon fontSize="small" />
              </ListItemIcon>
              Mark as {selectedNotification?.status === 'read' ? 'unread' : 'read'}
            </MenuItem>
            <MenuItem onClick={handleCloseMenu} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              Delete
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default NotificationCenter;
