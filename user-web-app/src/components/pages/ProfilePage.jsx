import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  ShoppingCart as OrdersIcon,
  Favorite as FavoritesIcon,
  LocationOn as AddressIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  LocalShipping as ActiveOrdersIcon,
  Receipt as PaymentHistoryIcon,
  LocalOffer as PromotionCodesIcon,
  MyLocation as LocationServicesIcon,
  LocalShipping as DeliveryZonesIcon,
  Language as LanguageSettingsIcon,
  Security as SecuritySettingsIcon,
  Analytics as AnalyticsIcon,
  Loyalty as LoyaltyIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../config/api';

const ProfilePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getFavoritesCount } = useFavorites();
  const { getCartCount } = useCart();
  const { unreadCount } = useNotifications();
  
  // State for profile statistics
  const [profileStats, setProfileStats] = useState({
    ordersCount: 0,
    activeOrdersCount: 0,
    addressesCount: 0,
    paymentHistoryCount: 0,
    promotionCodesCount: 0,
    loading: true
  });

  // Fetch profile statistics
  useEffect(() => {
    const fetchProfileStats = async () => {
      if (!user) return;
      
      try {
        setProfileStats(prev => ({ ...prev, loading: true }));
        
        // Fetch orders count
        const ordersResponse = await apiService.get('/orders/user');
        const ordersCount = ordersResponse?.data?.orders?.length || 0;
        const activeOrdersCount = ordersResponse?.data?.orders?.filter(order => 
          ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status)
        )?.length || 0;
        
        // Fetch user profile to get addresses count
        const profileResponse = await apiService.get('/auth/profile');
        const addressesCount = profileResponse?.data?.addresses?.length || 0;
        
        // Fetch payment history count
        const paymentResponse = await apiService.get('/payment-history');
        const paymentHistoryCount = paymentResponse?.data?.length || 0;
        
        setProfileStats({
          ordersCount,
          activeOrdersCount,
          addressesCount,
          paymentHistoryCount,
          promotionCodesCount: 0, // This would need a specific endpoint
          loading: false
        });
      } catch (error) {
        console.error('Error fetching profile stats:', error);
        setProfileStats(prev => ({ ...prev, loading: false }));
      }
    };
    
    fetchProfileStats();
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    {
      icon: <OrdersIcon />,
      text: 'My Orders',
      count: profileStats.ordersCount,
      action: () => navigate('/orders'),
    },
    {
      icon: <ActiveOrdersIcon />,
      text: 'Active Orders',
      count: profileStats.activeOrdersCount,
      action: () => navigate('/active-orders'),
    },
    {
      icon: <FavoritesIcon />,
      text: 'Favorites',
      count: getFavoritesCount(),
      action: () => navigate('/favorites'),
    },
    {
      icon: <AddressIcon />,
      text: 'Addresses',
      count: profileStats.addressesCount,
      action: () => navigate('/addresses'),
    },
    {
      icon: <NotificationsIcon />,
      text: 'Notifications',
      count: unreadCount,
      action: () => navigate('/notifications'),
    },
    {
      icon: <PaymentHistoryIcon />,
      text: 'Payment History',
      count: profileStats.paymentHistoryCount,
      action: () => navigate('/payment-history'),
    },
    {
      icon: <PromotionCodesIcon />,
      text: 'Promotion Codes',
      count: profileStats.promotionCodesCount,
      action: () => navigate('/promotion-codes'),
    },
    {
      icon: <LocationServicesIcon />,
      text: 'Location Services',
      count: 0,
      action: () => navigate('/location-services'),
    },
    {
      icon: <DeliveryZonesIcon />,
      text: 'Delivery Zones',
      count: 0,
      action: () => navigate('/delivery-zones'),
    },
    {
      icon: <LanguageSettingsIcon />,
      text: 'Language Settings',
      count: 0,
      action: () => navigate('/language-settings'),
    },
    {
      icon: <SecuritySettingsIcon />,
      text: 'Security Settings',
      count: 0,
      action: () => navigate('/security-settings'),
    },
    {
      icon: <AnalyticsIcon />,
      text: 'Analytics Dashboard',
      count: 0,
      action: () => navigate('/analytics-dashboard'),
    },
    {
      icon: <LoyaltyIcon />,
      text: 'Loyalty Program',
      count: 0,
      action: () => navigate('/loyalty-dashboard'),
    },
    {
      icon: <SupportIcon />,
      text: 'Customer Support',
      count: 0,
      action: () => navigate('/support-dashboard'),
    },
    {
      icon: <SettingsIcon />,
      text: 'Settings',
      action: () => navigate('/settings'),
    },
  ];

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="lg">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: theme.palette.primary.main,
                    fontSize: '2rem',
                    mr: 3,
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {user?.name || 'User Name'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {user?.email || 'user@example.com'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.phone || '+1234567890'}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  sx={{ borderRadius: 2 }}
                  onClick={() => navigate('/edit-profile')}
                >
                  Edit
                </Button>
              </Box>

              {/* Quick Stats */}
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      {getCartCount()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cart Items
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      {getFavoritesCount()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Favorites
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      {profileStats.ordersCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Orders
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card sx={{ borderRadius: 3 }}>
            <List sx={{ p: 0 }}>
              {menuItems.map((item, index) => (
                <React.Fragment key={item.text}>
                  <ListItem sx={{ px: 3, py: 2 }}>
                    <ListItemButton
                      onClick={item.action}
                      sx={{ borderRadius: 2 }}
                    >
                      <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: 500,
                        }}
                      />
                      {item.count !== undefined && (
                        <Typography
                          variant="body2"
                          sx={{
                            backgroundColor: theme.palette.primary.main,
                            color: 'white',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                          }}
                        >
                          {item.count}
                        </Typography>
                      )}
                    </ListItemButton>
                  </ListItem>
                  {index < menuItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Card>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card sx={{ mt: 3, borderRadius: 3 }}>
            <List sx={{ p: 0 }}>
              <ListItem sx={{ px: 3, py: 2 }}>
                <ListItemButton
                  onClick={handleLogout}
                  sx={{ borderRadius: 2, color: theme.palette.error.main }}
                >
                  <ListItemIcon sx={{ color: theme.palette.error.main }}>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Logout"
                    primaryTypographyProps={{
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ProfilePage;