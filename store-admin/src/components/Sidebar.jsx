import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Box,
  Typography,
  ListItemButton,
  Avatar,
  Collapse
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  LocalOffer as LocalOfferIcon,
  People as PeopleIcon,
  LocalShipping as LocalShippingIcon,
  Campaign as CampaignIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  Image as ImageIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Store as StoreIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const menuStructure = [
  {
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard'
  },
  {
    label: 'Orders & Sales',
    icon: <ShoppingCartIcon />,
    children: [
      { label: 'Orders', icon: <ShoppingCartIcon />, path: '/orders' },
      { label: 'POS', icon: <StoreIcon />, path: '/pos' },
      { label: 'Promotions', icon: <LocalOfferIcon />, path: '/promotions' }
    ]
  },
  {
    label: 'Products & Catalog',
    icon: <InventoryIcon />,
    children: [
      { label: 'Products', icon: <InventoryIcon />, path: '/products' }
    ]
  },
  {
    label: 'Customers & Delivery',
    icon: <PeopleIcon />,
    children: [
      { label: 'Customers', icon: <PeopleIcon />, path: '/customers' },
      { label: 'Deliverymen', icon: <LocalShippingIcon />, path: '/deliverymen' }
    ]
  },
  {
    label: 'Store Management',
    icon: <StoreIcon />,
    path: '/store-management'
  },
  {
    label: 'Analytics & Reports',
    icon: <HistoryIcon />,
    children: [
      { label: 'Analytics', icon: <NotificationsIcon />, path: '/analytics' },
      { label: 'Audit Logs', icon: <HistoryIcon />, path: '/audit-logs' }
    ]
  },
  {
    label: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings'
  }
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState({});

  const handleToggle = (label) => {
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Box sx={{
      width: 260,
      minWidth: 260,
      maxWidth: 260,
      background: '#fff',
      height: '100vh',
      color: '#333',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderRight: '1px solid #e0e0e0',
      overflow: 'hidden'
    }}>
      {/* User Profile Section */}
      <Box sx={{
        p: 3,
        borderBottom: '1px solid #e0e0e0',
        background: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Avatar sx={{ bgcolor: '#1976d2', width: 40, height: 40 }}>
          {user?.name ? user.name[0].toUpperCase() : <StoreIcon />}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
            {user?.name || user?.email || 'Store User'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Store Panel
          </Typography>
        </Box>
      </Box>
      {/* Navigation Menu */}
      <List sx={{ pt: 1, flex: 1, px: 1, overflow: 'hidden', overflowY: 'auto' }}>
        {menuStructure.map((item, idx) => (
          <Box key={item.label}>
            {/* Always show section heading */}
            <Typography
              variant="caption"
              sx={{
                color: '#888',
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                pl: 2,
                pt: idx === 0 ? 0 : 2,
                pb: 0.5,
                display: 'block',
                background: 'transparent',
                userSelect: 'none',
              }}
            >
              {item.label}
            </Typography>
            {item.children ? (
              <>
                <ListItemButton
                  onClick={() => handleToggle(item.label)}
                  selected={item.children.some(child => isActive(child.path))}
                  sx={{
                    color: '#555',
                    borderRadius: 1,
                    mb: 0.5,
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    '&.Mui-selected': {
                      background: '#e3f2fd',
                      color: '#1976d2',
                      '&:hover': { background: '#e3f2fd' }
                    },
                    '&:hover': { background: '#f5f5f5', color: '#333' }
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: 'inherit',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  />
                  {open[item.label] ? <ExpandLess sx={{ color: 'inherit' }} /> : <ExpandMore sx={{ color: 'inherit' }} />}
                </ListItemButton>
                <Collapse in={open[item.label]} timeout="auto">
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        component={Link}
                        to={child.path}
                        key={child.label}
                        selected={isActive(child.path)}
                        sx={{
                          pl: 4,
                          color: '#666',
                          borderRadius: 1,
                          mb: 0.5,
                          width: '100%',
                          maxWidth: '100%',
                          overflow: 'hidden',
                          '&.Mui-selected': {
                            background: '#e3f2fd',
                            color: '#1976d2',
                            '&:hover': { background: '#e3f2fd' }
                          },
                          '&:hover': { background: '#f5f5f5', color: '#333' }
                        }}
                      >
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={child.label}
                          primaryTypographyProps={{
                            fontSize: '0.85rem',
                            fontWeight: 'inherit',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive(item.path)}
                sx={{
                  color: '#555',
                  borderRadius: 1,
                  mb: 0.5,
                  width: '100%',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  '&.Mui-selected': {
                    background: '#e3f2fd',
                    color: '#1976d2',
                    '&:hover': { background: '#e3f2fd' }
                  },
                  '&:hover': { background: '#f5f5f5', color: '#333' }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: 'inherit',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                />
              </ListItemButton>
            )}
            {idx === 0 && (
              <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />
            )}
          </Box>
        ))}
      </List>
      {/* Logout section */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', background: '#fafafa' }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            color: '#d32f2f',
            '&:hover': { background: '#ffebee', color: '#b71c1c' }
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}
