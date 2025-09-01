import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, useTheme, List, ListItem, ListItemText, ListItemIcon, Chip, Divider, LinearProgress, CircularProgress, Alert } from '@mui/material';
import PageContainer from '../components/PageContainer';
import { motion } from 'framer-motion';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useAuth } from '../auth/AuthContext';
import { analyticsService } from '../api/analyticsService';

const MotionCard = motion(Card);

const StatCard = ({ title, value, color, icon: Icon }) => {
  const theme = useTheme();
  return (
    <MotionCard
      whileHover={{ y: -5, boxShadow: theme.shadows[8] }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{ height: '100%', background: `linear-gradient(135deg, ${color}20, ${color}10)`, backdropFilter: 'blur(8px)' }}
    >
      <CardContent sx={{ p: '12px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Icon sx={{ color: color, mr: 1 }} />
          <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        </Box>
        <Typography variant="h6" sx={{ color: color, fontWeight: 600 }}>{value}</Typography>
      </CardContent>
    </MotionCard>
  );
};

const InventoryAlert = ({ product, stock, threshold, daysLeft }) => {
  const theme = useTheme();
  const severity = daysLeft < 3 ? 'error' : daysLeft < 7 ? 'warning' : 'info';
  
  return (
    <ListItem>
      <ListItemIcon>
        <WarningAmberIcon color={severity} />
      </ListItemIcon>
      <ListItemText
        primary={product}
        secondary={`${stock} units left - ${daysLeft} days of inventory remaining`}
      />
      <Chip
        label={stock <= threshold ? 'Low Stock' : 'Reorder Soon'}
        color={severity}
        size="small"
      />
    </ListItem>
  );
};

const ProductPerformance = ({ product, sales, target, trend }) => {
  const progress = (sales / target) * 100;
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{product}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {trend > 0 ? (
            <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
          ) : (
            <TrendingDownIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
          )}
          <Typography
            variant="body2"
            color={trend > 0 ? 'success.main' : 'error.main'}
          >
            {trend}%
          </Typography>
        </Box>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 6, borderRadius: 1 }}
      />
      <Typography variant="caption" color="text.secondary">
        {sales} of {target} units sold
      </Typography>
    </Box>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🔧 Fetching dashboard analytics...');
        const response = await analyticsService.getDashboard();
        if (!response.success) throw new Error(response.message || 'Failed to fetch dashboard data');
        setStats(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
  }, [token]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!stats) return null;

  const statCards = [
    { title: 'Total Orders', value: stats.orderStats?.totalOrders ?? 0, color: theme.palette.primary.main, icon: AssignmentIcon },
    { title: 'Revenue', value: `$${stats.orderStats?.totalRevenue?.toLocaleString() ?? 0}`, color: theme.palette.success.main, icon: AttachMoneyIcon },
    { title: 'Completed Orders', value: stats.orderStats?.completedOrders ?? 0, color: theme.palette.info.main, icon: GroupIcon },
    { title: 'Cancelled Orders', value: stats.orderStats?.cancelledOrders ?? 0, color: theme.palette.error.main, icon: LocalBarIcon },
  ];

  const inventoryAlerts = [
    { product: 'Premium Vodka', stock: 15, threshold: 20, daysLeft: 2 },
    { product: 'Craft Beer', stock: 45, threshold: 50, daysLeft: 5 },
    { product: 'Red Wine', stock: 28, threshold: 30, daysLeft: 8 },
    { product: 'Whiskey', stock: 12, threshold: 15, daysLeft: 3 },
  ];

  const productPerformance = [
    { product: 'Premium Vodka', sales: 120, target: 150, trend: 8 },
    { product: 'Craft Beer', sales: 180, target: 200, trend: -5 },
    { product: 'Red Wine', sales: 90, target: 100, trend: 12 },
    { product: 'Whiskey', sales: 85, target: 120, trend: 3 },
  ];

  return (
    <PageContainer title="Dashboard">
      <Typography variant="h4" mb={2}>Dashboard</Typography>
      <Grid container spacing={2}>
        {statCards.map((stat, index) => (
          <Grid item xs={6} sm={6} md={3} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}
        
        <Grid item xs={12} md={8}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            sx={{ height: { xs: '300px', md: '350px' } }}
          >
            <CardContent sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Inventory Alerts
              </Typography>
              <List sx={{ height: 'calc(100% - 40px)', overflow: 'auto' }}>
                {inventoryAlerts.map((alert, index) => (
                  <React.Fragment key={alert.product}>
                    <InventoryAlert {...alert} />
                    {index < inventoryAlerts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            sx={{ height: { xs: '300px', md: '350px' } }}
          >
            <CardContent sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Product Performance
              </Typography>
              <Box sx={{ mt: 2 }}>
                {productPerformance.map((product) => (
                  <ProductPerformance key={product.product} {...product} />
                ))}
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Dashboard;
