import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PageContainer from '../components/PageContainer';

const MotionCard = motion(Card);

const Reports = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);

  const salesData = {
    daily: [
      { date: '2024-03-15', orders: 145, revenue: 12500, growth: 15 },
      { date: '2024-03-14', orders: 132, revenue: 11200, growth: -5 },
      { date: '2024-03-13', orders: 156, revenue: 13400, growth: 8 },
      { date: '2024-03-12', orders: 142, revenue: 12100, growth: 3 },
      { date: '2024-03-11', orders: 138, revenue: 11800, growth: -2 },
    ],
    weekly: [
      { date: 'Week 11', orders: 980, revenue: 84500, growth: 12 },
      { date: 'Week 10', orders: 875, revenue: 76200, growth: -3 },
      { date: 'Week 9', orders: 902, revenue: 78900, growth: 5 },
      { date: 'Week 8', orders: 858, revenue: 74600, growth: 7 },
      { date: 'Week 7', orders: 801, revenue: 69800, growth: 4 },
    ],
    monthly: [
      { date: 'March 2024', orders: 3850, revenue: 325000, growth: 8 },
      { date: 'February 2024', orders: 3560, revenue: 298000, growth: 6 },
      { date: 'January 2024', orders: 3350, revenue: 282000, growth: -2 },
      { date: 'December 2023', orders: 3420, revenue: 288000, growth: 10 },
      { date: 'November 2023', orders: 3110, revenue: 262000, growth: 5 },
    ],
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const getCurrentData = () => {
    switch (currentTab) {
      case 1:
        return salesData.weekly;
      case 2:
        return salesData.monthly;
      default:
        return salesData.daily;
    }
  };

  const stats = [
    {
      title: 'Total Revenue',
      value: '$325,000',
      change: '+8%',
      positive: true,
    },
    {
      title: 'Total Orders',
      value: '3,850',
      change: '+12%',
      positive: true,
    },
    {
      title: 'Average Order Value',
      value: '$84.42',
      change: '-3%',
      positive: false,
    },
    {
      title: 'Conversion Rate',
      value: '2.8%',
      change: '+5%',
      positive: true,
    },
  ];

  return (
    <PageContainer title="Reports">
      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {stat.value}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {stat.positive ? (
                    <TrendingUpIcon color="success" fontSize="small" />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="small" />
                  )}
                  <Typography
                    variant="body2"
                    color={stat.positive ? 'success.main' : 'error.main'}
                  >
                    {stat.change} this month
                  </Typography>
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs value={currentTab} onChange={handleTabChange}>
                <Tab label="Daily" />
                <Tab label="Weekly" />
                <Tab label="Monthly" />
              </Tabs>
            </Box>
            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    <TableCell align="right">Orders</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Growth</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getCurrentData().map((row) => (
                    <TableRow
                      key={row.date}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {row.date}
                      </TableCell>
                      <TableCell align="right">{row.orders}</TableCell>
                      <TableCell align="right">${row.revenue.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          {row.growth >= 0 ? (
                            <TrendingUpIcon color="success" fontSize="small" />
                          ) : (
                            <TrendingDownIcon color="error" fontSize="small" />
                          )}
                          <Typography
                            variant="body2"
                            color={row.growth >= 0 ? 'success.main' : 'error.main'}
                          >
                            {row.growth}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Export PDF
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Export Excel
            </Button>
            <Button variant="contained" startIcon={<ShareIcon />}>
              Share Report
            </Button>
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Reports;
