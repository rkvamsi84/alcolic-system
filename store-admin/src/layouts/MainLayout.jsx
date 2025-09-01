import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import QuickActionFAB from '../components/QuickActionFAB';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const MainLayout = ({ mode, toggleMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'add_product':
        navigate('/products');
        break;
      case 'view_orders':
        navigate('/orders');
        break;
      case 'generate_report':
        navigate('/scheduled-reports');
        break;
      case 'manage_inventory':
        navigate('/products'); // Products page can serve as inventory management
        break;
      default:
        console.log('Action not implemented:', action);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        maxWidth: '100vw',
        overflow: 'hidden',
      }}
    >
      <Sidebar
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${isSidebarOpen ? '240px' : '0px'})`,
          maxWidth: `calc(100% - ${isSidebarOpen ? '240px' : '0px'})`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Header onSidebarToggle={handleSidebarToggle} mode={mode} toggleMode={toggleMode} />
        <Box
          sx={{
            p: 0,
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <Outlet />
        </Box>
        <QuickActionFAB 
          variant={location.pathname === '/store-management' ? 'store' : 'default'}
          onClick={(action) => {
            console.log('Quick action clicked:', action);
            handleQuickAction(action);
          }}
        />
      </Box>
    </Box>
  );
};

export default MainLayout;
