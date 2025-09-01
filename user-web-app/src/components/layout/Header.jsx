import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { useCart } from '../../contexts/CartContext';
import { useNotifications } from '../../contexts/NotificationContext';
import LanguageSelector from '../widgets/LanguageSelector';

const Header = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { unreadCount } = useNotifications();

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: 'white',
        color: 'text.primary',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            color: theme.palette.primary.main,
          }}
        >
          Alcolic Delivery
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <LanguageSelector variant="icon" />
          
          <IconButton color="inherit" onClick={() => navigate('/search')}>
            <SearchIcon />
          </IconButton>

          <IconButton color="inherit" onClick={() => navigate('/notifications')}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton color="inherit" onClick={() => navigate('/cart')}>
            <Badge badgeContent={getCartCount()} color="error">
              <CartIcon />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 