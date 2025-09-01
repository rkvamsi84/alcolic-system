import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton
} from '@mui/material';
import {
  ArrowBack,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  LocationOn as LocationIcon,
  LocalShipping as DeliveryIcon,
  Analytics as AnalyticsIcon,
  Support as SupportIcon,
  ChevronRight as ChevronRightIcon,
  Person as PersonIcon,
  PrivacyTip as PrivacyIcon,
  Palette as ThemeIcon,
  VolumeUp as SoundIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SettingsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();

  const settingsCategories = [
    {
      title: 'Account Settings',
      items: [
        {
          icon: <PersonIcon />,
          text: 'Edit Profile',
          description: 'Update your personal information',
          action: () => navigate('/edit-profile'),
        },
        {
          icon: <SecurityIcon />,
          text: 'Security Settings',
          description: 'Password, 2FA, and security preferences',
          action: () => navigate('/security-settings'),
        },
        {
          icon: <PrivacyIcon />,
          text: 'Privacy Settings',
          description: 'Control your privacy and data sharing',
          action: () => navigate('/privacy-settings'),
        },
      ],
    },
    {
      title: 'App Preferences',
      items: [
        {
          icon: <LanguageIcon />,
          text: 'Language Settings',
          description: 'Change app language and region',
          action: () => navigate('/language-settings'),
        },
        {
          icon: <NotificationsIcon />,
          text: 'Notifications',
          description: 'Manage notification preferences',
          action: () => navigate('/notifications'),
        },
        {
          icon: <ThemeIcon />,
          text: 'Theme & Display',
          description: 'Customize app appearance',
          action: () => navigate('/theme-settings'),
        },
        {
          icon: <SoundIcon />,
          text: 'Sound Settings',
          description: 'Configure app sounds and alerts',
          action: () => navigate('/sound-settings'),
        },
      ],
    },
    {
      title: 'Location & Delivery',
      items: [
        {
          icon: <LocationIcon />,
          text: 'Location Services',
          description: 'Manage location permissions',
          action: () => navigate('/location-services'),
        },
        {
          icon: <DeliveryIcon />,
          text: 'Delivery Zones',
          description: 'View available delivery areas',
          action: () => navigate('/delivery-zones'),
        },
      ],
    },
    {
      title: 'Analytics & Support',
      items: [
        {
          icon: <AnalyticsIcon />,
          text: 'Analytics Dashboard',
          description: 'View your usage statistics',
          action: () => navigate('/analytics-dashboard'),
        },
        {
          icon: <SupportIcon />,
          text: 'Customer Support',
          description: 'Get help and contact support',
          action: () => navigate('/support-dashboard'),
        },
      ],
    },
  ];

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton
              onClick={() => navigate('/profile')}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" fontWeight="bold">
              Settings
            </Typography>
          </Box>
        </motion.div>

        {/* Settings Categories */}
        {settingsCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
          >
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    p: 3,
                    pb: 1,
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                  }}
                >
                  {category.title}
                </Typography>
                <List sx={{ p: 0 }}>
                  {category.items.map((item, itemIndex) => (
                    <React.Fragment key={item.text}>
                      <ListItem sx={{ px: 3, py: 0 }}>
                        <ListItemButton
                          onClick={item.action}
                          sx={{
                            borderRadius: 2,
                            py: 2,
                            '&:hover': {
                              backgroundColor: theme.palette.action.hover,
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              color: theme.palette.primary.main,
                              minWidth: 48,
                            }}
                          >
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.text}
                            secondary={item.description}
                            primaryTypographyProps={{
                              fontWeight: 500,
                              fontSize: '1rem',
                            }}
                            secondaryTypographyProps={{
                              fontSize: '0.875rem',
                              color: theme.palette.text.secondary,
                            }}
                          />
                          <ChevronRightIcon
                            sx={{ color: theme.palette.text.secondary }}
                          />
                        </ListItemButton>
                      </ListItem>
                      {itemIndex < category.items.length - 1 && (
                        <Divider sx={{ mx: 3 }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Container>
    </Box>
  );
};

export default SettingsPage;