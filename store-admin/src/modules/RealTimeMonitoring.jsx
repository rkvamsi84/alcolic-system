import React, { useState, useEffect } from 'react';
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
  Chip,
  Button,
  LinearProgress,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PageContainer from '../components/PageContainer';

const MotionCard = motion(Card);

const RealTimeMonitoring = () => {
  const theme = useTheme();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Real-time data from API
  const [realtimeData, setRealtimeData] = useState({
    currentSales: 0,
    todayOrders: 0,
    activeCustomers: 0,
    recentTransactions: [],
    hotProducts: []
  });

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls to fetch real-time data
      // const response = await fetch('/api/v1/analytics/realtime');
      // const data = await response.json();
      // setRealtimeData(data);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Refresh every 30 seconds
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      icon: <PointOfSaleIcon />,
      title: "Today's Sales",
      value: `$${realtimeData.currentSales.toFixed(2)}`,
      color: theme.palette.primary.main
    },
    {
      icon: <ShoppingCartIcon />,
      title: 'Orders Today',
      value: realtimeData.todayOrders,
      color: theme.palette.success.main
    },
    {
      icon: <PersonIcon />,
      title: 'Active Customers',
      value: realtimeData.activeCustomers,
      color: theme.palette.info.main
    }
  ];

  return (
    <PageContainer title="Real-Time Monitoring">
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid item xs={12} md={4} key={stat.title}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1, bgcolor: `${stat.color}15`, borderRadius: 1, mr: 2 }}>
                    {React.cloneElement(stat.icon, { sx: { color: stat.color } })}
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <List>
                {realtimeData.recentTransactions.map((transaction) => (
                  <ListItem
                    key={transaction.id}
                    divider
                    secondaryAction={
                      <Chip
                        label={transaction.type}
                        size="small"
                        color={transaction.type === 'Online' ? 'info' : 'success'}
                      />
                    }
                  >
                    <ListItemIcon>
                      <LocalBarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`$${transaction.amount.toFixed(2)}`}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.items.join(', ')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {transaction.time}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hot Products
              </Typography>
              <List>
                {realtimeData.hotProducts.map((product) => (
                  <ListItem key={product.name} divider>
                    <ListItemIcon>
                      <LocalBarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={product.name}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            Sales today: {product.sales}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Stock:
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={(product.inventory / 100) * 100}
                              sx={{ flexGrow: 1 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {product.inventory}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <Chip
                      label={product.trend}
                      size="small"
                      color={product.trend === 'up' ? 'success' : 'warning'}
                      sx={{ ml: 1 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default RealTimeMonitoring;