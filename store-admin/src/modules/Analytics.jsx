import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  BarChart,
  PieChart,
  ShowChart,
  Download,
  AttachMoney,
  ShoppingCart,
  People,
  Store,
  Refresh,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import PageContainer from '../components/PageContainer';
import { motion } from 'framer-motion';
import { analyticsService } from '../api/analyticsService';
import { useAuth } from '../auth/AuthContext';

const MotionCard = motion(Card);

const AnalyticsCard = ({ title, value, icon: Icon, color, loading = false }) => (
  <MotionCard
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    sx={{ height: '100%' }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" color={color} fontWeight="bold">
            {loading ? <CircularProgress size={24} /> : value}
          </Typography>
        </Box>
        <Icon sx={{ fontSize: 40, color: color, opacity: 0.7 }} />
      </Box>
    </CardContent>
  </MotionCard>
);

const Analytics = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Analytics data states
  const [salesData, setSalesData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);

  const fetchAnalyticsData = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔧 Fetching comprehensive analytics data...');
      
      // Fetch all analytics data in parallel
      const [
        salesResponse,
        productResponse,
        customerResponse,
        deliveryResponse,
        financialResponse,
        overviewResponse,
        realtimeResponse
      ] = await Promise.all([
        analyticsService.getSales(),
        analyticsService.getProducts(),
        analyticsService.getCustomers(),
        analyticsService.getDelivery(),
        analyticsService.getFinancial(),
        analyticsService.getOverview(),
        analyticsService.getRealtime()
      ]);

      setSalesData(salesResponse.data);
      setProductData(productResponse.data);
      setCustomerData(customerResponse.data);
      setDeliveryData(deliveryResponse.data);
      setFinancialData(financialResponse.data);
      setOverviewData(overviewResponse.data);
      setRealtimeData(realtimeResponse.data);
      
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [token]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const tabs = [
    { label: 'Overview', icon: <AnalyticsIcon /> },
    { label: 'Sales', icon: <AttachMoney /> },
    { label: 'Products', icon: <ShoppingCart /> },
    { label: 'Customers', icon: <People /> },
    { label: 'Delivery', icon: <Store /> },
    { label: 'Financial', icon: <BarChart /> },
    { label: 'Real-time', icon: <ShowChart /> }
  ];

  if (loading) {
    return (
      <PageContainer title="Analytics">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Analytics">
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Analytics">
      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight="bold">
            Analytics Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Refresh Data
          </Button>
        </Box>
        
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {activeTab === 0 && overviewData && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <AnalyticsCard
              title="Total Orders"
              value={overviewData.totalOrders || 0}
              icon={ShoppingCart}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <AnalyticsCard
              title="Total Revenue"
              value={`$${(overviewData.totalRevenue || 0).toLocaleString()}`}
              icon={AttachMoney}
              color="success.main"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <AnalyticsCard
              title="Active Customers"
              value={overviewData.activeCustomers || 0}
              icon={People}
              color="info.main"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <AnalyticsCard
              title="Delivery Rate"
              value={`${(overviewData.deliveryRate || 0).toFixed(1)}%`}
              icon={Store}
              color="warning.main"
            />
          </Grid>
        </Grid>
      )}

      {/* Sales Tab */}
      {activeTab === 1 && salesData && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MotionCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sales Overview
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Total Orders: {salesData.totalOrders || 0}</Typography>
                  <Typography>Total Revenue: ${(salesData.totalRevenue || 0).toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Delivered: {salesData.deliveredOrders || 0}</Typography>
                  <Typography>Cancelled: {salesData.cancelledOrders || 0}</Typography>
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <MotionCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sales Metrics
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Chip label={`Average Order Value: $${(salesData.averageOrderValue || 0).toFixed(2)}`} color="primary" />
                  <Chip label={`Conversion Rate: ${(salesData.conversionRate || 0).toFixed(1)}%`} color="success" />
                  <Chip label={`Return Rate: ${(salesData.returnRate || 0).toFixed(1)}%`} color="warning" />
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      )}

      {/* Products Tab */}
      {activeTab === 2 && productData && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MotionCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Product Analytics
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Total Products: {productData.totalProducts || 0}</Typography>
                  <Typography>Low Stock: {productData.lowStock || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Out of Stock: {productData.outOfStock || 0}</Typography>
                  <Typography>Top Selling: {productData.topSelling || 0}</Typography>
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <MotionCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Inventory Status
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Chip label={`Stock Level: ${(productData.stockLevel || 0).toFixed(1)}%`} color="primary" />
                  <Chip label={`Reorder Points: ${productData.reorderPoints || 0}`} color="warning" />
                  <Chip label={`Inventory Value: $${(productData.inventoryValue || 0).toLocaleString()}`} color="success" />
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      )}

      {/* Customers Tab */}
      {activeTab === 3 && customerData && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MotionCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Analytics
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Total Customers: {customerData.totalCustomers || 0}</Typography>
                  <Typography>Active Customers: {customerData.activeCustomers || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>New Customers: {customerData.newCustomers || 0}</Typography>
                  <Typography>Returning: {customerData.returningCustomers || 0}</Typography>
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <MotionCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Metrics
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Chip label={`Customer Lifetime Value: $${(customerData.customerLifetimeValue || 0).toFixed(2)}`} color="primary" />
                  <Chip label={`Retention Rate: ${(customerData.retentionRate || 0).toFixed(1)}%`} color="success" />
                  <Chip label={`Churn Rate: ${(customerData.churnRate || 0).toFixed(1)}%`} color="error" />
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      )}

      {/* Delivery Tab */}
      {activeTab === 4 && deliveryData && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MotionCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Delivery Analytics
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Total Deliveries: {deliveryData.totalDeliveries || 0}</Typography>
                  <Typography>Completed: {deliveryData.completedDeliveries || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Active Drivers: {deliveryData.activeDrivers || 0}</Typography>
                  <Typography>Average Time: {deliveryData.averageDeliveryTime || 0} min</Typography>
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <MotionCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Delivery Metrics
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Chip label={`Success Rate: ${(deliveryData.successRate || 0).toFixed(1)}%`} color="success" />
                  <Chip label={`On-Time Rate: ${(deliveryData.onTimeRate || 0).toFixed(1)}%`} color="primary" />
                  <Chip label={`Customer Rating: ${(deliveryData.customerRating || 0).toFixed(1)}/5`} color="warning" />
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      )}

      {/* Financial Tab */}
      {activeTab === 5 && financialData && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MotionCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Financial Overview
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Total Revenue: ${(financialData.totalRevenue || 0).toLocaleString()}</Typography>
                  <Typography>Total Costs: ${(financialData.totalCosts || 0).toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Net Profit: ${(financialData.netProfit || 0).toLocaleString()}</Typography>
                  <Typography>Profit Margin: ${(financialData.profitMargin || 0).toFixed(1)}%</Typography>
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <MotionCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Financial Metrics
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Chip label={`Revenue Growth: ${(financialData.revenueGrowth || 0).toFixed(1)}%`} color="success" />
                  <Chip label={`Cost Ratio: ${(financialData.costRatio || 0).toFixed(1)}%`} color="warning" />
                  <Chip label={`ROI: ${(financialData.roi || 0).toFixed(1)}%`} color="primary" />
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      )}

      {/* Real-time Tab */}
      {activeTab === 6 && realtimeData && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MotionCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Real-time Activity
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Active Orders: {realtimeData.activeOrders || 0}</Typography>
                  <Typography>Online Users: {realtimeData.onlineUsers || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Pending Deliveries: {realtimeData.pendingDeliveries || 0}</Typography>
                  <Typography>System Status: {realtimeData.systemStatus || 'Online'}</Typography>
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <MotionCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Live Metrics
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Chip label={`Orders Today: ${realtimeData.ordersToday || 0}`} color="primary" />
                  <Chip label={`Revenue Today: $${(realtimeData.revenueToday || 0).toLocaleString()}`} color="success" />
                  <Chip label={`Active Drivers: ${realtimeData.activeDrivers || 0}`} color="info" />
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      )}
    </PageContainer>
  );
};

export default Analytics; 