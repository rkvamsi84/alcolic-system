import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Button,
  TextField,
  MenuItem
} from '@mui/material';
import { BarChart, PieChart, Timeline, Download, History } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';

// TODO: Replace with API calls to fetch real analytics data
// const fetchMetrics = async () => {
//   const response = await fetch('/api/v1/analytics/metrics');
//   return response.json();
// };

// const fetchChartData = async () => {
//   const response = await fetch('/api/v1/analytics/chart-data');
//   return response.json();
// };

const mockMetrics = [
  { label: 'Total Sales', value: '$0' },
  { label: 'Orders', value: '0' },
  { label: 'Active Customers', value: '0' },
  { label: 'Compliance Alerts', value: '0' },
];

const mockChartData = [];

function ActivityDashboardAnalytics() {
  const [dateRange, setDateRange] = useState('2025-06');
  const [openLog, setOpenLog] = useState(false);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><BarChart sx={{ mr: 1 }} />Activity Dashboard & Analytics</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField
          label="Date Range"
          select
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="2025-06">June 2025</MenuItem>
          <MenuItem value="2025-05">May 2025</MenuItem>
        </TextField>
        <Button variant="outlined" startIcon={<Download />}>Export CSV</Button>
        <Button variant="outlined" startIcon={<Download />}>Export PDF</Button>
        <Button variant="text" startIcon={<History />} onClick={() => setOpenLog(true)}>Regulatory Logs</Button>
      </Stack>
      <Grid container spacing={2} mb={2}>
        {mockMetrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.label}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{metric.label}</Typography>
              <Typography variant="h5" color="primary">{metric.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" mb={2}><BarChart sx={{ mr: 1 }} />Sales & Orders (Mock Chart)</Typography>
        <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontStyle: 'italic' }}>
          [Bar chart visualization here]
        </Box>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" mb={2}><PieChart sx={{ mr: 1 }} />Order Distribution (Mock Chart)</Typography>
        <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontStyle: 'italic' }}>
          [Pie chart visualization here]
        </Box>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" mb={2}><Timeline sx={{ mr: 1 }} />Compliance Events (Mock Timeline)</Typography>
        <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontStyle: 'italic' }}>
          [Timeline visualization here]
        </Box>
      </Paper>
      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module="Analytics" />
    </Box>
  );
}

export default ActivityDashboardAnalytics;
