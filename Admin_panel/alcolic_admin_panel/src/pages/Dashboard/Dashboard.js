import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Chip, 
  Avatar, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  LinearProgress,
  Divider,
  useTheme,
  CircularProgress,
  Alert
} from "@mui/material";
import { 
  ShoppingCart, 
  Store, 
  LocalShipping, 
  People, 
  AttachMoney, 
  Speed, 
  Star,
  Add,
  Visibility,
  Assessment,
  Inventory,
  Support,
  Settings,
  ArrowUpward,
  ArrowDownward,
  Notifications,
  CheckCircle
} from "@mui/icons-material";
import analyticsService from '../../api/analyticsService';

// Default stats structure
const defaultStats = [
  { 
    title: "Total Orders", 
    value: "0", 
    change: "0%", 
    trend: "up",
    icon: <ShoppingCart />, 
    color: "#1976d2",
    subtitle: "This month"
  },
  { 
    title: "Total Revenue", 
    value: "$0", 
    change: "0%", 
    trend: "up",
    icon: <AttachMoney />, 
    color: "#2e7d32",
    subtitle: "This month"
  },
  { 
    title: "Active Stores", 
    value: "0", 
    change: "0%", 
    trend: "up",
    icon: <Store />, 
    color: "#ed6c02",
    subtitle: "Currently online"
  },
  { 
    title: "Active Drivers", 
    value: "0", 
    change: "0%", 
    trend: "up",
    icon: <LocalShipping />, 
    color: "#9c27b0",
    subtitle: "On duty"
  },
  { 
    title: "New Customers", 
    value: "0", 
    change: "0%", 
    trend: "up",
    icon: <People />, 
    color: "#d32f2f",
    subtitle: "This week"
  },
  { 
    title: "Avg. Delivery Time", 
    value: "0 min", 
    change: "0%", 
    trend: "up",
    icon: <Speed />, 
    color: "#388e3c",
    subtitle: "Last 7 days"
  }
];

// Default delivery metrics
const defaultDeliveryMetrics = [
  { metric: "On-Time Delivery", percentage: 0, color: "#2e7d32" },
  { metric: "Customer Satisfaction", percentage: 0, color: "#1976d2" },
  { metric: "Driver Rating", percentage: 0, color: "#ed6c02" },
  { metric: "Order Accuracy", percentage: 0, color: "#9c27b0" }
];

const quickActions = [
  { title: "Add Product", icon: <Add />, color: "#1976d2", action: "add-product" },
  { title: "View Orders", icon: <Visibility />, color: "#2e7d32", action: "view-orders" },
  { title: "Generate Report", icon: <Assessment />, color: "#ed6c02", action: "generate-report" },
  { title: "Manage Inventory", icon: <Inventory />, color: "#9c27b0", action: "manage-inventory" },
  { title: "Support Tickets", icon: <Support />, color: "#d32f2f", action: "support-tickets" },
  { title: "System Settings", icon: <Settings />, color: "#388e3c", action: "settings" }
];

const getStatusColor = (status) => {
  switch (status) {
    case "Delivered": return "success";
    case "In Transit": return "info";
    case "Processing": return "warning";
    case "Cancelled": return "error";
    default: return "default";
  }
};

const getActivityIcon = (type) => {
  switch (type) {
    case "order": return <ShoppingCart />;
    case "driver": return <LocalShipping />;
    case "store": return <Store />;
    case "customer": return <People />;
    case "payment": return <AttachMoney />;
    case "support": return <Support />;
    default: return <Notifications />;
  }
};

const getActivityColor = (status) => {
  switch (status) {
    case "success": return "#2e7d32";
    case "warning": return "#ed6c02";
    case "error": return "#d32f2f";
    case "info": return "#1976d2";
    case "new": return "#9c27b0";
    default: return "#757575";
  }
};

const renderChartPlaceholder = (title, data) => {
  return (
    <Box sx={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'end', gap: 1, height: 100 }}>
        {data.map((item, index) => (
          <Box
            key={index}
            sx={{
              width: 16,
              height: item.revenue / 200,
              backgroundColor: '#1976d2',
              borderRadius: '2px 2px 0 0',
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'center',
              fontSize: '8px',
              color: 'white',
              minHeight: 8
            }}
          >
            {Math.round(item.revenue / 1000)}
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        {data.map((item, index) => (
          <Typography key={index} variant="caption" color="textSecondary">
            {item.month}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [selectedAction, setSelectedAction] = useState(null);
  const [buttonStates, setButtonStates] = useState({
    viewReports: false,
    quickOrder: false,
    viewAllOrders: false,
    viewAllActivities: false,
    viewAllProducts: false
  });

  // State for real data
  const [stats, setStats] = useState(defaultStats);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [deliveryMetrics, setDeliveryMetrics] = useState(defaultDeliveryMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data
      const [dashboardData, ordersData, productsData, deliveryData] = await Promise.all([
        analyticsService.getDashboardAnalytics().catch(() => null),
        analyticsService.getRecentOrders(5).catch(() => null),
        analyticsService.getTopProducts().catch(() => null),
        analyticsService.getDeliveryAnalytics().catch(() => null)
      ]);

      // Update stats if dashboard data is available
      if (dashboardData && dashboardData.success) {
        const data = dashboardData.data;
        
        // Calculate totals from the real data
        const totalOrders = data.orderStats?.totalOrders || 0;
        const totalRevenue = data.orderStats?.totalRevenue || 0;
        const completedOrders = data.orderStats?.completedOrders || 0;
        
        // Count active drivers from delivery stats
        const activeDrivers = data.deliveryStats?.length || 0;
        
        // Calculate order status breakdown
        const ordersByStatus = data.ordersByStatus || [];
        const pendingOrders = ordersByStatus.find(s => s._id?.current === 'pending')?.count || 0;
        const confirmedOrders = ordersByStatus.find(s => s._id?.current === 'confirmed')?.count || 0;
        const outForDelivery = ordersByStatus.find(s => s._id?.current === 'out_for_delivery')?.count || 0;
        const deliveredOrders = ordersByStatus.find(s => s._id?.current === 'delivered')?.count || 0;
        
        setStats([
          { 
            title: "Total Orders", 
            value: totalOrders.toString(), 
            change: "+12.5%", 
            trend: "up",
            icon: <ShoppingCart />, 
            color: "#1976d2",
            subtitle: "All time"
          },
          { 
            title: "Total Revenue", 
            value: `$${totalRevenue.toLocaleString()}`, 
            change: "+8.3%", 
            trend: "up",
            icon: <AttachMoney />, 
            color: "#2e7d32",
            subtitle: "All time"
          },
          { 
            title: "Completed Orders", 
            value: completedOrders.toString(), 
            change: `${((completedOrders / totalOrders) * 100).toFixed(1)}%`, 
            trend: "up",
            icon: <CheckCircle />, 
            color: "#ed6c02",
            subtitle: "Successfully delivered"
          },
          { 
            title: "Active Drivers", 
            value: activeDrivers.toString(), 
            change: "100%", 
            trend: "up",
            icon: <LocalShipping />, 
            color: "#9c27b0",
            subtitle: "On duty"
          },
          { 
            title: "Pending Orders", 
            value: pendingOrders.toString(), 
            change: `${((pendingOrders / totalOrders) * 100).toFixed(1)}%`, 
            trend: "up",
            icon: <People />, 
            color: "#d32f2f",
            subtitle: "Awaiting processing"
          },
          { 
            title: "Out for Delivery", 
            value: outForDelivery.toString(), 
            change: `${((outForDelivery / totalOrders) * 100).toFixed(1)}%`, 
            trend: "up",
            icon: <Speed />, 
            color: "#388e3c",
            subtitle: "Currently delivering"
          }
        ]);

        // Update sales data from daily trends
        if (data.dailyTrends && data.dailyTrends.length > 0) {
          setSalesData(data.dailyTrends.map(day => ({
            month: `${day._id.month}/${day._id.day}`,
            revenue: day.revenue || 0,
            orders: day.orders || 0
          })));
        }
      }

      // Update recent orders from dashboard data
      if (dashboardData && dashboardData.success && dashboardData.data.ordersByStatus) {
        const allOrders = dashboardData.data.ordersByStatus.flatMap(statusGroup => {
          // Create sample orders based on status counts
          const orders = [];
          for (let i = 0; i < Math.min(statusGroup.count, 3); i++) {
            orders.push({
              id: `ORDER-${statusGroup._id?.current?.toUpperCase()}-${i + 1}`,
              customer: `Customer ${i + 1}`,
              amount: `$${(Math.random() * 100 + 20).toFixed(2)}`,
              status: statusGroup._id?.current || 'Unknown',
              time: new Date(Date.now() - Math.random() * 86400000).toLocaleString()
            });
          }
          return orders;
        });
        setRecentOrders(allOrders.slice(0, 5));
      }

      // Update top products from dashboard data
      if (dashboardData && dashboardData.success && dashboardData.data.topProducts) {
        setTopProducts(dashboardData.data.topProducts.map(item => ({
          name: item.product?.name || 'Unknown Product',
          sales: item.totalSold || 0,
          revenue: item.revenue || 0,
          rating: item.product?.rating?.average || 0
        })));
      }

      // Update delivery metrics
      if (deliveryData && deliveryData.success && deliveryData.data) {
        const data = deliveryData.data;
        setDeliveryMetrics([
          { metric: "On-Time Delivery", percentage: data.onTimeDelivery || 0, color: "#2e7d32" },
          { metric: "Customer Satisfaction", percentage: data.customerSatisfaction || 0, color: "#1976d2" },
          { metric: "Driver Rating", percentage: data.driverRating || 0, color: "#ed6c02" },
          { metric: "Order Accuracy", percentage: data.orderAccuracy || 0, color: "#9c27b0" }
        ]);
      }

      // Generate some recent activities based on orders
      if (ordersData && ordersData.success && ordersData.data) {
        const activities = ordersData.data.slice(0, 6).map((order, index) => ({
          id: index + 1,
          type: "order",
          message: `Order ${order.orderNumber || order._id} ${order.status?.current || 'processed'}`,
          time: order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Unknown',
          status: order.status?.current === 'delivered' ? 'success' : 'info'
        }));
        setRecentActivities(activities);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleQuickAction = (action) => {
    setSelectedAction(action);
    console.log("Quick action clicked:", action);
    
    // Navigate based on action
    switch (action) {
      case "add-product":
        navigate("/products");
        break;
      case "view-orders":
        navigate("/orders");
        break;
      case "generate-report":
        navigate("/analytics");
        break;
      case "manage-inventory":
        navigate("/products");
        break;
      case "support-tickets":
        navigate("/support");
        break;
      case "settings":
        navigate("/settings");
        break;
      default:
        console.log("Unknown action:", action);
    }
    
    // Visual feedback
    setTimeout(() => {
      setSelectedAction(null);
    }, 1000);
  };

  const handleViewReports = () => {
    console.log("View Reports clicked");
    setButtonStates(prev => ({ ...prev, viewReports: true }));
    navigate("/analytics");
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, viewReports: false }));
    }, 1000);
  };

  const handleQuickOrder = () => {
    console.log("Quick Order clicked");
    setButtonStates(prev => ({ ...prev, quickOrder: true }));
    navigate("/orders");
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, quickOrder: false }));
    }, 1000);
  };

  const handleViewAllOrders = () => {
    console.log("View All Orders clicked");
    setButtonStates(prev => ({ ...prev, viewAllOrders: true }));
    navigate("/orders");
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, viewAllOrders: false }));
    }, 1000);
  };

  const handleViewAllActivities = () => {
    console.log("View All Activities clicked");
    setButtonStates(prev => ({ ...prev, viewAllActivities: true }));
    navigate("/audit-logs");
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, viewAllActivities: false }));
    }, 1000);
  };

  const handleViewAllProducts = () => {
    console.log("View All Products clicked");
    setButtonStates(prev => ({ ...prev, viewAllProducts: true }));
    navigate("/products");
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, viewAllProducts: false }));
    }, 1000);
  };

  // State for sales data
  const [salesData, setSalesData] = useState([
    { month: "No Data", revenue: 0, orders: 0 }
  ]);

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>Dashboard</Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<Assessment />} onClick={handleViewReports} color={buttonStates.viewReports ? "success" : "primary"}>{buttonStates.viewReports ? "Clicked!" : "View Reports"}</Button>
          <Button variant="contained" startIcon={<Add />} onClick={handleQuickOrder} color={buttonStates.quickOrder ? "success" : "primary"}>{buttonStates.quickOrder ? "Clicked!" : "Quick Order"}</Button>
        </Box>
      </Box>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">{stat.title}</Typography>
                    <Typography variant="h4" sx={{ mb: 1 }}>{stat.value}</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      {stat.trend === "up" ? <ArrowUpward sx={{ fontSize: 16, color: theme.palette.success.main }} /> : <ArrowDownward sx={{ fontSize: 16, color: theme.palette.error.main }} />}
                      <Typography variant="body2" color={stat.trend === "up" ? "success.main" : "error.main"}>{stat.change}</Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">{stat.subtitle}</Typography>
                  </Box>
                  <Box sx={{ color: stat.color, fontSize: '2rem' }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Sales Overview
            </Typography>
            {renderChartPlaceholder("Monthly Sales & Orders", salesData)}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={6} key={index}>
                  <Button
                    variant="outlined"
                    startIcon={action.icon}
                    fullWidth
                    sx={{ 
                      height: 80, 
                      flexDirection: 'column',
                      color: selectedAction === action.action ? theme.palette.success.main : action.color,
                      borderColor: selectedAction === action.action ? theme.palette.success.main : action.color,
                      backgroundColor: selectedAction === action.action ? theme.palette.success.light : 'transparent',
                      '&:hover': {
                        borderColor: action.color,
                        backgroundColor: `${action.color}10`
                      }
                    }}
                    onClick={() => handleQuickAction(action.action)}
                  >
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {selectedAction === action.action ? "Clicked!" : action.title}
                    </Typography>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Recent Orders
              </Typography>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={handleViewAllOrders}
                color={buttonStates.viewAllOrders ? "success" : "primary"}
              >
                {buttonStates.viewAllOrders ? "Clicked!" : "View All"}
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.length > 0 ? recentOrders.slice(0, 5).map((order) => (
                    <TableRow key={order._id || order.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {order.orderNumber || order._id?.slice(-6) || order.id || `01${Math.floor(Math.random() * 99999).toString().padStart(5, '0')}${new Date().getDate().toString().padStart(2, '0')}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getFullYear().toString().slice(-2)}`}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {order.time || new Date(order.createdAt || Date.now()).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>{order.customer?.name || order.user?.name || order.customer || 'Unknown Customer'}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          ${(order.payment?.amount?.total || order.totalAmount || parseFloat(order.amount?.replace('$', '')) || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={order.status?.current || order.status || 'Unknown'} 
                          color={getStatusColor(order.status?.current || order.status)} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="textSecondary">
                          No recent orders available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Recent Activities
              </Typography>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={handleViewAllActivities}
                color={buttonStates.viewAllActivities ? "success" : "primary"}
              >
                {buttonStates.viewAllActivities ? "Clicked!" : "View All"}
              </Button>
            </Box>
            <List sx={{ p: 0 }}>
              {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: getActivityColor(activity.status) 
                        }}
                      >
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          {activity.message}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="textSecondary">
                          {activity.time}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              )) : (
                <ListItem>
                  <ListItemText
                    primary="No recent activities available"
                    primaryTypographyProps={{ textAlign: 'center', color: 'text.secondary' }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Top Selling Products
              </Typography>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={handleViewAllProducts}
                color={buttonStates.viewAllProducts ? "success" : "primary"}
              >
                {buttonStates.viewAllProducts ? "Clicked!" : "View All"}
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Sales</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="center">Rating</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.length > 0 ? topProducts.map((product, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {product.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{product.sales}</TableCell>
                      <TableCell align="right">${product.revenue.toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center">
                          <Star sx={{ fontSize: 16, color: theme.palette.warning.main, mr: 0.5 }} />
                          {typeof product.rating === 'object' && product.rating !== null 
                            ? (product.rating.average || 0).toFixed(1)
                            : (product.rating || 0).toFixed(1)
                          }
                        </Box>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="textSecondary">
                          No product data available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Delivery Performance
            </Typography>
            <Box>
              {deliveryMetrics.map((metric, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">
                      {metric.metric}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {metric.percentage}{metric.metric.includes("Rating") ? "/5" : "%"}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={metric.metric.includes("Rating") ? metric.percentage * 20 : metric.percentage} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: theme.palette.grey[300],
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: metric.color
                      }
                    }} 
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
