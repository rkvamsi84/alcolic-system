import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG, ENDPOINTS } from '../api/config';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  LinearProgress,
  useTheme,
  CircularProgress,
  Alert,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  Store,
  ShoppingCart,
  AttachMoney,
  People,
  Inventory,
  LocalShipping,
  Assessment,
  Add,
  Visibility,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  Warning,
  Block,
  Search,
  FilterList,
  ExpandMore,
  Dashboard,
  Star,
  LocationOn
} from '@mui/icons-material';

const StorePanel = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedStore, setExpandedStore] = useState(null);
  const [storeAnalytics, setStoreAnalytics] = useState({});
  const [storeOrders, setStoreOrders] = useState({});
  const [storeProducts, setStoreProducts] = useState({});

  // Real-time store stats (will be calculated from actual data)
  const [storeStats, setStoreStats] = useState([
    {
      title: "Total Stores",
      value: "0",
      change: "0%",
      trend: "up",
      icon: <Store />,
      color: "#1976d2",
      subtitle: "All stores"
    },
    {
      title: "Active Stores",
      value: "0",
      change: "0%",
      trend: "up",
      icon: <CheckCircle />,
      color: "#2e7d32",
      subtitle: "Currently active"
    },
    {
      title: "Verified Stores",
      value: "0",
      change: "0%",
      trend: "up",
      icon: <CheckCircle />,
      color: "#ed6c02",
      subtitle: "Verified stores"
    },
    {
      title: "Avg Rating",
      value: "0.0",
      change: "0.0",
      trend: "up",
      icon: <Star />,
      color: "#9c27b0",
      subtitle: "Average rating"
    },
    {
      title: "Delivery Available",
      value: "0",
      change: "0%",
      trend: "up",
      icon: <LocalShipping />,
      color: "#d32f2f",
      subtitle: "With delivery"
    },
    {
      title: "Zones Covered",
      value: "0",
      change: "0%",
      trend: "up",
      icon: <LocationOn />,
      color: "#388e3c",
      subtitle: "Active zones"
    }
  ]);

  const quickActions = [
    { title: "Add Product", icon: <Add />, color: "#1976d2", action: "add-product" },
    { title: "View Orders", icon: <Visibility />, color: "#2e7d32", action: "view-orders" },
    { title: "Generate Report", icon: <Assessment />, color: "#ed6c02", action: "generate-report" },
    { title: "Manage Inventory", icon: <Inventory />, color: "#9c27b0", action: "manage-inventory" }
  ];

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'success';
      case 'processing': return 'info';
      case 'shipped': return 'warning';
      case 'pending': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
  };

  // Fetch stores from API
  const fetchStores = async () => {
    try {
      setLoading(true);
      let token = getAuthToken();
      
      // If no token exists, try to get one by logging in
      if (!token) {
        try {
          const loginResponse = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: 'admin@alcolic.com',
              password: 'admin123',
              role: 'admin'
            })
          });
          
          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            token = loginData.data.token;
            localStorage.setItem('admin_token', token);
          }
        } catch (loginErr) {
          console.error('Auto-login failed:', loginErr);
        }
      }
      
      const response = await fetch(`${API_CONFIG.baseURL}${ENDPOINTS.stores.getAll}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }

      const data = await response.json();
      setStores(data.data || []);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError(err.message);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch store analytics for a specific store
  const fetchStoreAnalytics = async (storeId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_CONFIG.baseURL}${ENDPOINTS.stores.analytics(storeId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStoreAnalytics(prev => ({
          ...prev,
          [storeId]: data.data || {}
        }));
      }
    } catch (err) {
      console.error(`Error fetching analytics for store ${storeId}:`, err);
    }
  };

  // Fetch recent orders for a store
  const fetchStoreOrders = async (storeId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_CONFIG.baseURL}/admin/orders?store=${storeId}&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStoreOrders(prev => ({
          ...prev,
          [storeId]: data.data || []
        }));
      }
    } catch (err) {
      console.error(`Error fetching orders for store ${storeId}:`, err);
    }
  };

  // Fetch top products for a store
  const fetchStoreProducts = async (storeId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_CONFIG.baseURL}${ENDPOINTS.products.byStore(storeId)}?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStoreProducts(prev => ({
          ...prev,
          [storeId]: data.data || []
        }));
      }
    } catch (err) {
      console.error(`Error fetching products for store ${storeId}:`, err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Update store stats when stores data changes
  useEffect(() => {
    if (stores.length > 0) {
      const totalStores = stores.length;
      const activeStores = stores.filter(store => store.status === 'active').length;
      const verifiedStores = stores.filter(store => store.isVerified).length;
      const avgRating = stores.reduce((sum, store) => sum + (store.rating?.average || 0), 0) / stores.length;
      const deliveryAvailable = stores.filter(store => store.deliverySettings?.isDeliveryAvailable).length;
      const zonesCovered = new Set(stores.map(store => store.zoneId).filter(Boolean)).size;

      setStoreStats([
        {
          title: "Total Stores",
          value: totalStores.toString(),
          change: "100%",
          trend: "up",
          icon: <Store />,
          color: "#1976d2",
          subtitle: "All stores"
        },
        {
          title: "Active Stores",
          value: activeStores.toString(),
          change: `${((activeStores / totalStores) * 100).toFixed(0)}%`,
          trend: "up",
          icon: <CheckCircle />,
          color: "#2e7d32",
          subtitle: "Currently active"
        },
        {
          title: "Verified Stores",
          value: verifiedStores.toString(),
          change: `${((verifiedStores / totalStores) * 100).toFixed(0)}%`,
          trend: "up",
          icon: <CheckCircle />,
          color: "#ed6c02",
          subtitle: "Verified stores"
        },
        {
          title: "Avg Rating",
          value: avgRating.toFixed(1),
          change: "+0.0",
          trend: "up",
          icon: <Star />,
          color: "#9c27b0",
          subtitle: "Average rating"
        },
        {
          title: "Delivery Available",
          value: deliveryAvailable.toString(),
          change: `${((deliveryAvailable / totalStores) * 100).toFixed(0)}%`,
          trend: "up",
          icon: <LocalShipping />,
          color: "#d32f2f",
          subtitle: "With delivery"
        },
        {
          title: "Zones Covered",
          value: zonesCovered.toString(),
          change: "100%",
          trend: "up",
          icon: <LocationOn />,
          color: "#388e3c",
          subtitle: "Active zones"
        }
      ]);
    }
  }, [stores]);

  // Calculate overall stats from real data
  const totalStores = stores?.length || 0;
  const activeStores = stores?.filter(store => store.status === 'active').length || 0;
  const verifiedStores = stores?.filter(store => store.isVerified).length || 0;
  const avgRating = stores?.length > 0 
    ? (stores.reduce((sum, store) => sum + (store.rating?.average || 0), 0) / stores.length).toFixed(1)
    : "0.0";

  // Filter stores
  const filteredStores = (stores || []).filter(store => {
    const matchesSearch = store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || store.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Generate stats for each store based on real data
  const generateStoreStats = (store) => {
    const analytics = storeAnalytics[store._id] || {};
    const orders = storeOrders[store._id] || [];
    const products = storeProducts[store._id] || [];

    return [
      {
        title: "Store Rating",
        value: store.rating?.average?.toFixed(1) || "0.0",
        change: "+0.2",
        trend: "up",
        icon: <Store />,
        color: "#1976d2",
        subtitle: `${store.rating?.count || 0} reviews`
      },
      {
        title: "Total Orders",
        value: analytics.totalOrders?.toString() || "0",
        change: "Active",
        trend: "up",
        icon: <ShoppingCart />,
        color: "#2e7d32",
        subtitle: "All time"
      },
      {
        title: "Total Revenue",
        value: `$${(analytics.totalRevenue || 0).toLocaleString()}`,
        change: "Standard",
        trend: "up",
        icon: <AttachMoney />,
        color: "#ed6c02",
        subtitle: "All time"
      },
      {
        title: "Products",
        value: products.length.toString(),
        change: "+0.2",
        trend: "up",
        icon: <Inventory />,
        color: "#9c27b0",
        subtitle: "Active products"
      },
      {
        title: "Delivery Radius",
        value: `${store.deliverySettings?.maxDeliveryRadius || 0} km`,
        change: "-3.2%",
        trend: "down",
        icon: <LocalShipping />,
        color: "#d32f2f",
        subtitle: store.deliverySettings?.isDeliveryAvailable ? "Delivery Available" : "No Delivery"
      },
      {
        title: "Delivery Fee",
        value: `$${store.deliverySettings?.deliveryFee || 0}`,
        change: "-3.2%",
        trend: "down",
        icon: <LocalShipping />,
        color: "#388e3c",
        subtitle: `Free over $${store.deliverySettings?.freeDeliveryThreshold || 0}`
      }
    ];
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "success";
      case "pending": return "warning";
      case "suspended": return "error";
      case "inactive": return "default";
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active": return <CheckCircle />;
      case "pending": return <Warning />;
      case "suspended": return <Block />;
      case "inactive": return <Block />;
      default: return <Store />;
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleAccordionChange = (storeId) => (event, isExpanded) => {
    setExpandedStore(isExpanded ? storeId : null);
    
    // Fetch additional data when store is expanded
    if (isExpanded) {
      fetchStoreAnalytics(storeId);
      fetchStoreOrders(storeId);
      fetchStoreProducts(storeId);
    }
  };

  // Handle quick actions
  const handleQuickAction = (action, storeId, event) => {
    console.log(`Quick action: ${action} for store: ${storeId}`);
    
    // Add visual feedback
    const button = event?.currentTarget;
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 150);
    }

    switch (action) {
      case 'add-product':
        // Navigate to products page with store filter
        navigate(`/products?store=${storeId}`);
        break;
      case 'view-orders':
        // Navigate to orders page with store filter
        navigate(`/orders?store=${storeId}`);
        break;
      case 'generate-report':
        // Navigate to analytics page with store filter
        navigate(`/analytics?store=${storeId}`);
        break;
      case 'manage-inventory':
        // Navigate to products/inventory page with store filter
        navigate(`/products?store=${storeId}&tab=inventory`);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Multi-Store Dashboard
      </Typography>

      {/* Overall Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Store sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Stores
                  </Typography>
                  <Typography variant="h4">
                    {totalStores}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Stores
                  </Typography>
                  <Typography variant="h4">
                    {activeStores}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Warning sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Stores
                  </Typography>
                  <Typography variant="h4">
                    {stores.filter(store => store.status === 'pending').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocalShipping sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Delivery Available
                  </Typography>
                  <Typography variant="h4">
                    {stores.filter(store => store.deliverySettings?.isDeliveryAvailable).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Stores"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              fullWidth
            >
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Stores List with Individual Dashboards */}
      <Box>
        {filteredStores.length === 0 ? (
          <Alert severity="info">No stores found matching your criteria.</Alert>
        ) : (
          filteredStores.map((store) => {
            const storeStats = generateStoreStats(store);
            const storeOrdersData = storeOrders[store._id] || [];
            const storeProductsData = storeProducts[store._id] || [];
            
            return (
              <Accordion 
                key={store._id} 
                expanded={expandedStore === store._id}
                onChange={handleAccordionChange(store._id)}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <Store />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6">
                        {store.name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getStatusIcon(store.status)}
                          <Chip 
                            label={store.status} 
                            color={getStatusColor(store.status)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          Owner: {store.owner?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Products: {storeProductsData.length}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Revenue: ${(storeAnalytics[store._id]?.totalRevenue || 0).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ p: 2 }}>
                    {/* Individual Store Dashboard */}
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      <Dashboard sx={{ mr: 1, verticalAlign: 'middle' }} />
                      {store.name} Dashboard
                    </Typography>

                    {/* Store Stats */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      {storeStats.map((stat, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                            <CardContent sx={{ p: 2 }}>
                              <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                  <Typography color="textSecondary" gutterBottom variant="body2">
                                    {stat.title}
                                  </Typography>
                                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: stat.color }}>
                                    {stat.value}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {stat.subtitle}
                                  </Typography>
                                </Box>
                                <Box sx={{ color: stat.color, opacity: 0.8 }}>
                                  {stat.icon}
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    <Grid container spacing={3}>
                      {/* Store Quick Actions */}
                      <Grid item xs={12} md={4}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Quick Actions
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                              {quickActions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant="outlined"
                                  startIcon={action.icon}
                                  fullWidth
                                  size="small"
                                  onClick={(e) => handleQuickAction(action.action, store._id, e)}
                                  sx={{ 
                                    mb: 1, 
                                    justifyContent: 'flex-start',
                                    borderColor: action.color,
                                    color: action.color,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      backgroundColor: action.color + '10',
                                      transform: 'translateY(-1px)',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }
                                  }}
                                >
                                  {action.title}
                                </Button>
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Store Recent Orders */}
                      <Grid item xs={12} md={4}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Recent Orders
                            </Typography>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {storeOrdersData.length > 0 ? (
                                    storeOrdersData.slice(0, 3).map((order, index) => (
                                      <TableRow key={index}>
                                        <TableCell>{order.orderNumber || order._id}</TableCell>
                                        <TableCell>${order.totalAmount || 0}</TableCell>
                                        <TableCell>
                                          <Chip 
                                            label={order.status?.current || order.status} 
                                            size="small"
                                            color={getOrderStatusColor(order.status?.current || order.status)}
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={3} align="center">
                                        <Typography variant="body2" color="textSecondary">
                                          No recent orders
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Store Top Products */}
                      <Grid item xs={12} md={4}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Top Products
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                              {storeProductsData.length > 0 ? (
                                storeProductsData.slice(0, 3).map((product, index) => (
                                  <Box key={index} sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                      <Box>
                                        <Typography variant="body2" fontWeight="medium">
                                          {product.name}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                          ${product.price} - {product.category?.name || 'No Category'}
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" fontWeight="bold">
                                        {product.isAvailable ? 'Available' : 'Out of Stock'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                ))
                              ) : (
                                <Typography variant="body2" color="textSecondary" align="center">
                                  No products available
                                </Typography>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* Store Contact Info */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>Contact Information:</strong>
                        </Typography>
                        <Typography variant="body2">Email: {store.contactInfo?.email || 'N/A'}</Typography>
                        <Typography variant="body2">Phone: {store.contactInfo?.phone || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>Address:</strong>
                        </Typography>
                        <Typography variant="body2">
                          {store.address?.street || 'N/A'}, {store.address?.city || 'N/A'}, {store.address?.state || 'N/A'} {store.address?.zipCode || 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default StorePanel;