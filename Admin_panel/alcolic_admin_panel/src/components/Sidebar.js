import { Link, useLocation } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Collapse,
  Divider,
  Avatar,
  useTheme
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  ExpandLess,
  ExpandMore,
  ShoppingCart,
  Schedule,
  MoneyOff,
  Payment,
  Inventory,
  Category as CategoryIcon,
  LocalOffer,
  Store,
  LocationOn,
  LocalShipping,
  People,
  AdminPanelSettings,
  Notifications,
  Support,
  RateReview,
  Article,
  Analytics,
  History,
  Settings,
  Logout,
  Person,
  Image as ImageIcon,
  CloudUpload,
  UploadFile
} from "@mui/icons-material";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const menuStructure = [
  {
    label: "Dashboard",
    icon: <DashboardIcon />, 
    path: "/"
  },
  {
    label: "Orders & Operations",
    icon: <ShoppingCart />,
    children: [
      { label: "Orders Management", icon: <ShoppingCart />, path: "/orders" },
      { label: "Order Tracking", icon: <LocalShipping />, path: "/order-tracking" },
      { label: "Scheduled Orders", icon: <Schedule />, path: "/scheduled-orders" },
      { label: "Refunds & Cancellations", icon: <MoneyOff />, path: "/refunds" },
      { label: "Payments & Transactions", icon: <Payment />, path: "/payments" }
    ]
  },
  {
    label: "Products & Catalog",
    icon: <Inventory />,
    children: [
      { label: "Products Management", icon: <Inventory />, path: "/products" },
      { label: "Bulk Import", icon: <UploadFile />, path: "/bulk-import" },
      { label: "Category Management", icon: <CategoryIcon />, path: "/categories" },
      { label: "Promotions & Discounts", icon: <LocalOffer />, path: "/promotions" }
    ]
  },
  {
    label: "Stores & Delivery",
    icon: <Store />,
    children: [
      { label: "Store Management", icon: <Store />, path: "/stores" },
      { label: "Store Panel", icon: <AdminPanelSettings />, path: "/store-panel" },
      { label: "Delivery Radius Settings", icon: <LocationOn />, path: "/delivery-radius" },
      { label: "Drivers Management", icon: <LocalShipping />, path: "/drivers" }
    ]
  },
  {
    label: "Customers & Users",
    icon: <People />,
    children: [
      { label: "Customers Management", icon: <People />, path: "/customers" },
      { label: "Admin Users & Roles", icon: <AdminPanelSettings />, path: "/admin-users" }
    ]
  },
  {
    label: "Engagement & Content",
    icon: <Notifications />,
    children: [
      { label: "Notifications", icon: <Notifications />, path: "/notifications" },
      { label: "Support & Live Chat", icon: <Support />, path: "/support" },
      { label: "Reviews & Feedback", icon: <RateReview />, path: "/reviews" },
      { label: "Content Management (CMS)", icon: <Article />, path: "/cms" },
      { label: "Banner Management", icon: <ImageIcon />, path: "/banners" },
      { label: "Notification Management", icon: <Notifications />, path: "/notifications" }
    ]
  },
  {
    label: "Analytics & Logs",
    icon: <Analytics />,
    children: [
      { label: "Analytics Dashboard", icon: <Analytics />, path: "/analytics" },
      { label: "Audit Logs", icon: <History />, path: "/audit-logs" }
    ]
  },
  {
    label: "Settings",
    icon: <Settings />,
    path: "/settings"
  }
];

export default function Sidebar() {
  const theme = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState({});
  const { logout, user } = useAuth();

  const handleToggle = (label) => {
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Box sx={{ 
      width: 260, 
      minWidth: 260,
      maxWidth: 260,
      background: theme.palette.background.paper, 
      height: '100vh', 
      color: theme.palette.text.primary, 
      display: 'flex', 
      flexDirection: 'column', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderRight: `1px solid ${theme.palette.divider}`,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.default
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ 
            bgcolor: theme.palette.primary.main, 
            mr: 2,
            width: 36,
            height: 36
          }}>
            <AdminPanelSettings />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: theme.palette.text.primary,
              fontSize: '1rem'
            }}>
              Admin Panel
            </Typography>
            <Typography variant="caption" sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '0.75rem'
            }}>
              Management Console
            </Typography>
          </Box>
        </Box>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ 
              width: 28, 
              height: 28, 
              mr: 1,
              bgcolor: theme.palette.primary.main
            }}>
              <Person />
            </Avatar>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.primary,
              fontWeight: 500,
              fontSize: '0.8rem'
            }}>
              {user.name || user.email}
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Navigation Menu */}
      <List sx={{ 
        pt: 1, 
        flex: 1, 
        px: 1,
        overflow: 'hidden',
        overflowY: 'auto'
      }}>
        {menuStructure.map((item, idx) => (
          <Box key={item.label}>
            {item.children ? (
              <>
                <ListItem 
                  button 
                  onClick={() => handleToggle(item.label)} 
                  selected={item.children.some(child => isActive(child.path))} 
                  sx={{ 
                    color: theme.palette.text.secondary, 
                    borderRadius: 1,
                    mb: 0.5,
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    '&.Mui-selected': { 
                      background: theme.palette.primary.light, 
                      color: theme.palette.primary.main,
                      '&:hover': {
                        background: theme.palette.primary.light
                      }
                    },
                    '&:hover': {
                      background: theme.palette.action.hover,
                      color: theme.palette.text.primary
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: 'inherit',
                    minWidth: 36
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 'inherit',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  />
                  {open[item.label] ? 
                    <ExpandLess sx={{ color: 'inherit' }} /> : 
                    <ExpandMore sx={{ color: 'inherit' }} />
                  }
                </ListItem>
                <Collapse in={open[item.label]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItem 
                        button 
                        component={Link} 
                        to={child.path} 
                        key={child.label} 
                        selected={isActive(child.path)} 
                        sx={{ 
                          pl: 4, 
                          color: theme.palette.text.secondary, 
                          borderRadius: 1,
                          mb: 0.5,
                          width: '100%',
                          maxWidth: '100%',
                          overflow: 'hidden',
                          '&.Mui-selected': { 
                            background: theme.palette.primary.light, 
                            color: theme.palette.primary.main,
                            '&:hover': {
                              background: theme.palette.primary.light
                            }
                          },
                          '&:hover': {
                            background: theme.palette.action.hover,
                            color: theme.palette.text.primary
                          }
                        }}
                      >
                        <ListItemIcon sx={{ 
                          color: 'inherit',
                          minWidth: 36
                        }}>
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={child.label} 
                          primaryTypographyProps={{
                            fontSize: '0.8rem',
                            fontWeight: 'inherit',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItem 
                button 
                component={Link} 
                to={item.path} 
                selected={isActive(item.path)} 
                sx={{ 
                  color: theme.palette.text.secondary, 
                  borderRadius: 1,
                  mb: 0.5,
                  width: '100%',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  '&.Mui-selected': { 
                    background: theme.palette.primary.light, 
                    color: theme.palette.primary.main,
                    '&:hover': {
                      background: theme.palette.primary.light
                    }
                  },
                  '&:hover': {
                    background: theme.palette.action.hover,
                    color: theme.palette.text.primary
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'inherit',
                  minWidth: 36
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: 'inherit',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                />
              </ListItem>
            )}
            {idx === 0 && (
              <Divider sx={{ 
                my: 2, 
                borderColor: theme.palette.divider
              }} />
            )}
          </Box>
        ))}
      </List>

      {/* Logout section */}
      <Box sx={{ 
        p: 2, 
        borderTop: `1px solid ${theme.palette.divider}`, 
        background: theme.palette.background.default
      }}>
        <ListItem 
          button 
          onClick={handleLogout} 
          sx={{ 
            borderRadius: 1, 
            color: theme.palette.error.main, 
            '&:hover': { 
              background: theme.palette.error.light, 
              color: theme.palette.error.dark
            }
          }}
        >
          <ListItemIcon sx={{ 
            color: 'inherit',
            minWidth: 36
          }}>
            <Logout />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          />
        </ListItem>
      </Box>
    </Box>
  );
}