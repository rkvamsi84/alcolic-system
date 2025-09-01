import React, { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  Favorite as FavoriteIcon,
  ShoppingCart as CartIcon,
  Person as ProfileIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import HomePage from '../pages/HomePage';
import FavoritesPage from '../pages/FavoritesPage';
import CartPage from '../pages/CartPage';
import ProfilePage from '../pages/ProfilePage';
import ProductDetailPage from '../pages/ProductDetailPage';
import SearchPage from '../pages/SearchPage';
import AdvancedSearchPage from '../pages/AdvancedSearchPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import OrderDetailPage from '../pages/OrderDetailPage';
import ActiveOrdersPage from '../pages/ActiveOrdersPage';
import EditProfilePage from '../pages/EditProfilePage';
import AddressManagementPage from '../pages/AddressManagementPage';
import AddressVerificationPage from '../pages/AddressVerificationPage';
import NotificationsPage from '../pages/NotificationsPage';
import PaymentHistoryPage from '../pages/PaymentHistoryPage';
import PromotionCodesPage from '../pages/PromotionCodesPage';
import LocationServicesPage from '../pages/LocationServicesPage';
import DeliveryZonesPage from '../pages/DeliveryZonesPage';
import LanguageSettingsPage from '../pages/LanguageSettingsPage';
import SecuritySettingsPage from '../pages/SecuritySettingsPage';
import LoyaltyDashboardPage from '../pages/LoyaltyDashboardPage';
import SupportDashboardPage from '../pages/SupportDashboardPage';
import AnalyticsDashboardPage from '../pages/AnalyticsDashboardPage';
import SettingsPage from '../pages/SettingsPage';

// Components
import Header from './Header';

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine current page based on route
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/home') return 0;
    if (path === '/favorites') return 1;
    if (path === '/cart') return 2;
    if (path === '/profile') return 3;
    return 0;
  };

  const [currentPage, setCurrentPage] = useState(getCurrentPage());

  const handleNavigation = (event, newValue) => {
    setCurrentPage(newValue);
    switch (newValue) {
      case 0:
        navigate('/home');
        break;
      case 1:
        navigate('/favorites');
        break;
      case 2:
        navigate('/cart');
        break;
      case 3:
        navigate('/profile');
        break;
      default:
        navigate('/home');
    }
  };

  const pages = [
    { path: '/home', component: HomePage, label: 'Home' },
    { path: '/favorites', component: FavoritesPage, label: 'Wishlist' },
    { path: '/cart', component: CartPage, label: 'Cart' },
    { path: '/profile', component: ProfilePage, label: 'Profile' },
  ];

  const navigationItems = [
    {
      label: 'Home',
      icon: <HomeIcon />,
      activeIcon: <HomeIcon />,
      path: '/home',
    },
    {
      label: 'Wishlist',
      icon: <FavoriteIcon />,
      activeIcon: <FavoriteIcon />,
      path: '/favorites',
    },
    {
      label: 'Cart',
      icon: <CartIcon />,
      activeIcon: <CartIcon />,
      path: '/cart',
    },
    {
      label: 'Profile',
      icon: <ProfileIcon />,
      activeIcon: <ProfileIcon />,
      path: '/profile',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header - Only show on mobile */}
      {isMobile && <Header />}
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          pb: isMobile ? 8 : 0, // Add bottom padding for mobile navigation
          backgroundColor: '#FAFAFA',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route path="/home" element={<HomePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/product/:productId" element={<ProductDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/advanced-search" element={<AdvancedSearchPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/active-orders" element={<ActiveOrdersPage />} />
              <Route path="/edit-profile" element={<EditProfilePage />} />
              <Route path="/address-verification" element={<AddressVerificationPage />} />
              <Route path="/order/:orderId" element={<OrderDetailPage />} />
              <Route path="/addresses" element={<AddressManagementPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/payment-history" element={<PaymentHistoryPage />} />
              <Route path="/promotion-codes" element={<PromotionCodesPage />} />
              <Route path="/location-services" element={<LocationServicesPage />} />
              <Route path="/delivery-zones" element={<DeliveryZonesPage />} />
              <Route path="/language-settings" element={<LanguageSettingsPage />} />
                              <Route path="/security-settings" element={<SecuritySettingsPage />} />
                <Route path="/loyalty-dashboard" element={<LoyaltyDashboardPage />} />
                <Route path="/support-dashboard" element={<SupportDashboardPage />} />
                <Route path="/analytics-dashboard" element={<AnalyticsDashboardPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              <Route path="/" element={<HomePage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Bottom Navigation - Only show on mobile */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            borderRadius: 0,
            boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
          }}
          elevation={3}
        >
          <BottomNavigation
            value={currentPage}
            onChange={handleNavigation}
            sx={{
              backgroundColor: '#FFFFFF',
              '& .MuiBottomNavigationAction-root': {
                color: theme.palette.grey[400],
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: 500,
                '&.Mui-selected': {
                  fontSize: '0.75rem',
                },
              },
            }}
          >
            {navigationItems.map((item, index) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={currentPage === index ? item.activeIcon : item.icon}
                sx={{
                  '& .MuiBottomNavigationAction-icon': {
                    fontSize: '1.5rem',
                  },
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default MainLayout;