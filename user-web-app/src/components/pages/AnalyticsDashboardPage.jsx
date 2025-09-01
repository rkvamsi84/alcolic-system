import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as VisibilityIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
  Error as ErrorIcon,
  FlashOn as SpeedIcon,
  People as PeopleIcon,
  MonetizationOn as MonetizationOnIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const AnalyticsDashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    analyticsData,
    conversionFunnel,
    performanceMetrics,
    errorAnalytics,
    businessMetrics,
    loading,
    dateRange,
    loadAnalyticsData,
    loadConversionFunnel,
    loadPerformanceMetrics,
    loadErrorAnalytics,
    loadBusinessMetrics,
    updateDateRange,
    getAnalyticsSummary,
    getConversionFunnelData,
    getPerformanceSummary,
    getErrorSummary,
  } = useAnalytics();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  useEffect(() => {
    loadAnalyticsData();
    loadConversionFunnel();
    loadPerformanceMetrics();
    loadErrorAnalytics();
    loadBusinessMetrics();
  }, [dateRange]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDateRangeChange = () => {
    updateDateRange(selectedDateRange.startDate, selectedDateRange.endDate);
  };

  const analyticsSummary = getAnalyticsSummary();
  const conversionFunnelData = getConversionFunnelData();
  const performanceSummary = getPerformanceSummary();
  const errorSummary = getErrorSummary();

  // Chart colors
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  // Format percentage
  const formatPercentage = (num) => {
    return `${(num * 100).toFixed(1)}%`;
  };

  // Format time in milliseconds
  const formatTime = (ms) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Calculate change percentage
  const calculateChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const StatCard = ({ title, value, change, icon, color = 'primary' }) => (
    <Card
      component={motion.div}
      whileHover={{ scale: 1.02 }}
      sx={{ height: '100%' }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: theme.palette[color].light,
              color: theme.palette[color].main,
              borderRadius: 2,
              p: 1,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {value}
        </Typography>
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {change >= 0 ? (
              <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} />
            ) : (
              <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5 }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: change >= 0 ? 'success.main' : 'error.main',
                fontWeight: 600,
              }}
            >
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const MetricCard = ({ title, value, subtitle, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette[color].main }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Track your app performance, user behavior, and business metrics
            </Typography>

            {/* Date Range Picker */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Date Range:
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={selectedDateRange.startDate}
                    onChange={(newValue) =>
                      setSelectedDateRange(prev => ({ ...prev, startDate: newValue }))
                    }
                    renderInput={(params) => <TextField {...params} size="small" />}
                  />
                  <DatePicker
                    label="End Date"
                    value={selectedDateRange.endDate}
                    onChange={(newValue) =>
                      setSelectedDateRange(prev => ({ ...prev, endDate: newValue }))
                    }
                    renderInput={(params) => <TextField {...params} size="small" />}
                  />
                </LocalizationProvider>
                <Button
                  variant="contained"
                  onClick={handleDateRangeChange}
                  startIcon={<FilterIcon />}
                >
                  Apply Filter
                </Button>
              </Box>
            </Paper>
          </Box>
        </motion.div>

        {/* Summary Stats */}
        {analyticsSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Events"
                  value={formatNumber(analyticsSummary.totalEvents)}
                  change={5.2}
                  icon={<VisibilityIcon />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Unique Users"
                  value={formatNumber(analyticsSummary.uniqueUsers)}
                  change={12.8}
                  icon={<PeopleIcon />}
                  color="secondary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Sessions"
                  value={formatNumber(analyticsSummary.totalSessions)}
                  change={-2.1}
                  icon={<TrendingUpIcon />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Conversion Rate"
                  value={formatPercentage(analyticsSummary.conversionRate)}
                  change={8.5}
                  icon={<MonetizationOnIcon />}
                  color="warning"
                />
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'fullWidth'}
              scrollButtons={isMobile ? 'auto' : false}
            >
              <Tab label="Overview" />
              <Tab label="Conversion Funnel" />
              <Tab label="Performance" />
              <Tab label="Errors" />
              <Tab label="Business Metrics" />
            </Tabs>
          </Paper>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Device Breakdown */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Device Breakdown
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(analyticsSummary?.deviceBreakdown || {}).map(([key, value], index) => ({
                            name: key,
                            value,
                            fill: colors[index % colors.length],
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Browser Breakdown */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Browser Breakdown
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={Object.entries(analyticsSummary?.browserBreakdown || {}).map(([key, value]) => ({
                        browser: key,
                        users: value,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="browser" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="users" fill={theme.palette.primary.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Top Events */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Top Events
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {analyticsSummary?.topEvents?.slice(0, 5).map((event, index) => (
                        <Box key={event._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip
                              label={event._id}
                              size="small"
                              sx={{ mr: 2 }}
                            />
                            <Typography variant="body2">
                              {formatNumber(event.count)} events
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatNumber(event.uniqueUserCount)} users
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && conversionFunnelData && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Conversion Funnel
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={conversionFunnelData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="step" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill={theme.palette.primary.main} name="Total Events" />
                        <Bar dataKey="uniqueUsers" fill={theme.palette.secondary.main} name="Unique Users" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Conversion Rates */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Conversion Rates
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {conversionFunnelData.map((step, index) => {
                        const nextStep = conversionFunnelData[index + 1];
                        const rate = nextStep ? (nextStep.count / step.count) * 100 : 0;
                        
                        return (
                          <Box key={step.step}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                {step.step.replace('_', ' ')}
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {rate.toFixed(1)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={rate}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 2 && performanceSummary && (
            <Grid container spacing={3}>
              {/* Performance Metrics */}
              <Grid item xs={12} md={6}>
                <MetricCard
                  title="Average Load Time"
                  value={formatTime(performanceSummary.averageLoadTime)}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MetricCard
                  title="Average Render Time"
                  value={formatTime(performanceSummary.averageRenderTime)}
                  color="secondary"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MetricCard
                  title="First Contentful Paint"
                  value={formatTime(performanceSummary.averageFirstContentfulPaint)}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MetricCard
                  title="Largest Contentful Paint"
                  value={formatTime(performanceSummary.averageLargestContentfulPaint)}
                  color="warning"
                />
              </Grid>

              {/* Performance Chart */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Page Performance
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={performanceMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="avgLoadTime"
                          stackId="1"
                          stroke={theme.palette.primary.main}
                          fill={theme.palette.primary.main}
                          name="Load Time"
                        />
                        <Area
                          type="monotone"
                          dataKey="avgRenderTime"
                          stackId="1"
                          stroke={theme.palette.secondary.main}
                          fill={theme.palette.secondary.main}
                          name="Render Time"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 3 && errorSummary && (
            <Grid container spacing={3}>
              {/* Error Summary */}
              <Grid item xs={12} md={6}>
                <MetricCard
                  title="Total Errors"
                  value={formatNumber(errorSummary.totalErrors)}
                  color="error"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MetricCard
                  title="Affected Users"
                  value={formatNumber(errorSummary.uniqueUsers)}
                  color="warning"
                />
              </Grid>

              {/* Error Types */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Error Types
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(errorSummary.errorTypes).map(([key, value], index) => ({
                            name: key,
                            value,
                            fill: colors[index % colors.length],
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Severity Breakdown */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Error Severity
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {Object.entries(errorSummary.severityBreakdown).map(([severity, count]) => (
                        <Box key={severity}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {severity}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatNumber(count)}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(count / errorSummary.totalErrors) * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: theme.palette.grey[200],
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: theme.palette[severity === 'critical' ? 'error' : severity === 'high' ? 'warning' : 'success'].main,
                              },
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 4 && businessMetrics && (
            <Grid container spacing={3}>
              {/* Business Metrics Chart */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Business Metrics
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={businessMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id.eventType" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke={theme.palette.primary.main}
                          name="Event Count"
                        />
                        <Line
                          type="monotone"
                          dataKey="totalValue"
                          stroke={theme.palette.secondary.main}
                          name="Total Value"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default AnalyticsDashboardPage; 