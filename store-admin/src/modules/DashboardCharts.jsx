import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { BarChart, PieChart, PointOfSale } from '@mui/icons-material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// Sample data for charts
const salesData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Sales ($)',
      data: [1200, 1500, 1100, 1800, 900, 2000, 1700],
      backgroundColor: '#d32f2f',
    },
  ],
};

const ordersData = {
  labels: ['POS', 'Online', 'Phone'],
  datasets: [
    {
      label: 'Orders',
      data: [320, 210, 70],
      backgroundColor: ['#d32f2f', '#fff', '#111'],
      borderColor: '#d32f2f',
    },
  ],
};

const posAnalysis = [
  { label: 'POS Sales', value: '$8,200' },
  { label: 'POS Orders', value: '210' },
  { label: 'Avg. POS Ticket', value: '$39.05' },
];

export default function DashboardCharts() {
  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" mb={1}><BarChart sx={{ mr: 1 }} />Weekly Sales</Typography>
        <Box style={{ height: 300 }}>
          <Bar data={salesData} options={{ maintainAspectRatio: false }} />
        </Box>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" mb={1}><PieChart sx={{ mr: 1 }} />Order Channels</Typography>
        <Box style={{ height: 300 }}>
          <Pie data={ordersData} options={{ maintainAspectRatio: false }} />
        </Box>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" mb={1}><PointOfSale sx={{ mr: 1 }} />POS System Analysis</Typography>
        {posAnalysis.map((item) => (
          <Typography key={item.label} variant="body1" color="primary">{item.label}: <b>{item.value}</b></Typography>
        ))}
      </Paper>
    </Box>
  );
}
