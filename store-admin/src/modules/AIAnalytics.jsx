import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TimelineIcon from '@mui/icons-material/Timeline';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import PageContainer from '../components/PageContainer';

const MotionCard = motion(Card);

const AIAnalytics = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('7d');
  const [modelType, setModelType] = useState('all');

  const insights = [
    {
      id: 1,
      type: 'revenue',
      title: 'Revenue Optimization',
      prediction: 'Potential 15% revenue increase by adjusting premium whiskey pricing during peak hours',
      confidence: 89,
      impact: 'high',
      model: 'price-optimization',
    },
    {
      id: 2,
      type: 'inventory',
      title: 'Stock Prediction',
      prediction: 'High demand expected for craft beers next weekend - increase stock by 30%',
      confidence: 92,
      impact: 'high',
      model: 'inventory-forecast',
    },
    {
      id: 3,
      type: 'customer',
      title: 'Customer Preferences',
      prediction: 'Growing interest in local craft spirits - consider expanding selection',
      confidence: 85,
      impact: 'medium',
      model: 'trend-analysis',
    },
    {
      id: 4,
      type: 'marketing',
      title: 'Promotion Strategy',
      prediction: 'Wine tasting event could increase wine sales by 45% next month',
      confidence: 88,
      impact: 'high',
      model: 'campaign-optimizer',
    },
    {
      id: 5,
      type: 'compliance',
      title: 'Compliance Risk',
      prediction: 'Update needed for age verification process to meet new regulations',
      confidence: 95,
      impact: 'high',
      model: 'compliance-monitor',
    },
    {
      id: 6,
      type: 'operations',
      title: 'Staff Scheduling',
      prediction: 'Need 2 additional staff members this Friday between 6-9 PM',
      confidence: 87,
      impact: 'medium',
      model: 'workforce-optimizer',
    }
  ];

  const modelPerformance = [
    {
      name: 'Price Optimization',
      accuracy: 92,
      predictions: 1234,
      improvement: 8,
      description: 'Optimizes pricing based on demand, competition, and inventory levels'
    },
    {
      name: 'Inventory Forecast',
      accuracy: 89,
      predictions: 856,
      improvement: 5,
      description: 'Predicts stock requirements based on historical sales and events'
    },
    {
      name: 'Customer Segmentation',
      accuracy: 87,
      predictions: 2341,
      improvement: 4,
      description: 'Analyzes customer preferences and purchase patterns'
    },
    {
      name: 'Compliance Monitor',
      accuracy: 95,
      predictions: 1567,
      improvement: 6,
      description: 'Ensures adherence to liquor sales regulations'
    },
    {
      name: 'Sales Forecasting',
      accuracy: 90,
      predictions: 1890,
      improvement: 3,
      description: 'Predicts daily and weekly sales volumes'
    }
  ];

  const stats = [
    {
      title: 'Active AI Models',
      value: '8',
      change: '+2 new models',
      icon: <PsychologyIcon />,
    },
    {
      title: 'Predictions Made',
      value: '15.4K',
      change: '+1.2K today',
      icon: <AutoGraphIcon />,
    },
    {
      title: 'Avg. Accuracy',
      value: '89.5%',
      change: '+2.3%',
      icon: <TimelineIcon />,
    },
    {
      title: 'Revenue Impact',
      value: '$12.3K',
      change: '+$2.1K this week',
      icon: <BubbleChartIcon />,
    },
  ];

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.info.main;
    }
  };

  return (
    <PageContainer title="AI Analytics">
      <Typography variant="h4" mb={2}>AI Analytics</Typography>
      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1, bgcolor: 'primary.lighter', borderRadius: 1, mr: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="success.main">
                  {stat.change}
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Model Type</InputLabel>
              <Select
                value={modelType}
                label="Model Type"
                onChange={(e) => setModelType(e.target.value)}
              >
                <MenuItem value="all">All Models</MenuItem>
                <MenuItem value="pricing">Pricing Models</MenuItem>
                <MenuItem value="inventory">Inventory Models</MenuItem>
                <MenuItem value="customer">Customer Models</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              sx={{ minWidth: 100 }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{ minWidth: 100 }}
            >
              Export
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    AI Insights & Recommendations
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>Prediction</TableCell>
                          <TableCell align="center">Confidence</TableCell>
                          <TableCell align="center">Impact</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {insights.map((insight) => (
                          <TableRow key={insight.id}>
                            <TableCell>
                              <Typography variant="subtitle2" color="primary">
                                {insight.title}
                              </Typography>
                            </TableCell>
                            <TableCell>{insight.prediction}</TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  {insight.confidence}%
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={insight.confidence}
                                  sx={{ width: 100 }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={insight.impact}
                                color={
                                  insight.impact === 'high'
                                    ? 'error'
                                    : insight.impact === 'medium'
                                    ? 'warning'
                                    : 'success'
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Model Performance
                  </Typography>
                  {modelPerformance.map((model) => (
                    <Box
                      key={model.name}
                      sx={{
                        mb: 3,
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'background.neutral',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2">{model.name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {model.improvement >= 0 ? (
                            <TrendingUpIcon color="success" fontSize="small" />
                          ) : (
                            <TrendingDownIcon color="error" fontSize="small" />
                          )}
                          <Typography
                            variant="body2"
                            color={model.improvement >= 0 ? 'success.main' : 'error.main'}
                          >
                            {model.improvement}%
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {model.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Accuracy:
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={model.accuracy}
                          sx={{ flexGrow: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {model.accuracy}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {model.predictions.toLocaleString()} predictions made
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default AIAnalytics;
