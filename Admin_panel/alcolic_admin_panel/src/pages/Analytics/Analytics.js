import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert
} from "@mui/material";
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
  Refresh
} from "@mui/icons-material";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://alcohol.gnritservices.com/api.php';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("6months");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for real-time data
  const [stats, setStats] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [customerSegments, setCustomerSegments] = useState([]);
  const [deliveryMetrics, setDeliveryMetrics] = useState([]);

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      // Use the comprehensive endpoint to get all data in one request
      const response = await axios.get(`${API_BASE_URL}/analytics/comprehensive?timeRange=${timeRange}`, { headers });

      if (response.data.success) {
        const data = response.data.data;
        setStats(data.stats || []);
        setSalesData(data.salesData || []);
        setTopProducts(data.topProducts || []);
        setTopStores(data.topStores || []);
        setCustomerSegments(data.customerSegments || []);
        setDeliveryMetrics(data.deliveryMetrics || []);
      } else {
        setError('Failed to fetch analytics data');
      }

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError(error.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  // Handle export report
  const handleExportReport = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/analytics/export?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      setError('Failed to export report');
    }
  };

  // Fetch data on component mount and when time range changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const renderChartPlaceholder = (title, data, type = "line") => {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box 
            sx={{ 
              height: 200, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'grey.100',
              borderRadius: 1
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {type === "line" ? <ShowChart /> : type === "bar" ? <BarChart /> : <PieChart />}
              <br />
              Chart placeholder for {title}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Analytics & Reports</Typography>
        <Box display="flex" gap={2}>
          <IconButton onClick={fetchAnalyticsData} title="Refresh">
            <Refresh />
          </IconButton>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="3months">Last 3 Months</MenuItem>
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="1year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            startIcon={<Download />}
            onClick={handleExportReport}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats && stats.length > 0 ? stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: stat.change && stat.change.startsWith('+') ? 'success.main' : 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      <TrendingUp sx={{ fontSize: 16 }} />
                      {stat.change || '0%'}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon === "AttachMoney" && <AttachMoney />}
                    {stat.icon === "ShoppingCart" && <ShoppingCart />}
                    {stat.icon === "People" && <People />}
                    {stat.icon === "Store" && <Store />}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )) : (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" textAlign="center">
                  No analytics data available
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          {renderChartPlaceholder("Sales Overview", salesData, "line")}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderChartPlaceholder("Customer Segments", customerSegments, "pie")}
        </Grid>
      </Grid>

      {/* Top Products and Stores */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Products
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Sales</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Rating</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProducts && topProducts.length > 0 ? topProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.name || 'Unknown Product'}</TableCell>
                        <TableCell align="right">{product.sales && typeof product.sales === 'number' ? product.sales : 0}</TableCell>
                        <TableCell align="right">${product.revenue && typeof product.revenue === 'number' ? product.revenue.toFixed(2) : '0.00'}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={
                              product.rating 
                                ? (typeof product.rating === 'object' && product.rating !== null
                                    ? (product.rating.average || 0).toFixed(1)
                                    : typeof product.rating === 'number' 
                                      ? product.rating.toFixed(1) 
                                      : 'N/A'
                                  )
                                : 'N/A'
                            } 
                            size="small" 
                            color="primary" 
                          />
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No products data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Stores
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Store</TableCell>
                      <TableCell align="right">Orders</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Rating</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topStores && topStores.length > 0 ? topStores.map((store, index) => (
                      <TableRow key={index}>
                        <TableCell>{store.name || 'Unknown Store'}</TableCell>
                        <TableCell align="right">{store.orders && typeof store.orders === 'number' ? store.orders : 0}</TableCell>
                        <TableCell align="right">${store.revenue && typeof store.revenue === 'number' ? store.revenue.toFixed(2) : '0.00'}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={
                              store.rating 
                                ? (typeof store.rating === 'object' && store.rating !== null
                                    ? (store.rating.average || 0).toFixed(1)
                                    : typeof store.rating === 'number' 
                                      ? store.rating.toFixed(1) 
                                      : 'N/A'
                                  )
                                : 'N/A'
                            } 
                            size="small" 
                            color="primary" 
                          />
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No stores data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delivery Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Delivery Performance
              </Typography>
              <Grid container spacing={2}>
                {deliveryMetrics && deliveryMetrics.length > 0 ? deliveryMetrics.map((metric, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {metric.value || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {metric.metric || 'Unknown Metric'}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: metric.change && metric.change.startsWith('+') ? 'success.main' : 'error.main' 
                        }}
                      >
                        {metric.change || '0%'}
                      </Typography>
                    </Box>
                  </Grid>
                )) : (
                  <Grid item xs={12}>
                    <Typography variant="h6" textAlign="center">
                      No delivery metrics available
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}