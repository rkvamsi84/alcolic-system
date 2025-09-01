import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import FilterList from '@mui/icons-material/FilterList';
import Download from '@mui/icons-material/Download';
import Visibility from '@mui/icons-material/Visibility';
import PageContainer from '../components/PageContainer';

const MotionCard = motion(Card);

const AuditLogs = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const auditLogs = [
    {
      id: 1,
      action: 'User Login',
      user: 'john.doe@example.com',
      timestamp: '2024-03-15 10:30:45',
      ip: '192.168.1.100',
      status: 'success',
      details: 'Successful login from Chrome browser',
    },
    {
      id: 2,
      action: 'Product Update',
      user: 'admin@example.com',
      timestamp: '2024-03-15 10:25:30',
      ip: '192.168.1.101',
      status: 'success',
      details: 'Updated product inventory for SKU-123',
    },
    {
      id: 3,
      action: 'Order Creation',
      user: 'sales@example.com',
      timestamp: '2024-03-15 10:20:15',
      ip: '192.168.1.102',
      status: 'success',
      details: 'Created new order #12345',
    },
    {
      id: 4,
      action: 'Failed Login',
      user: 'unknown@example.com',
      timestamp: '2024-03-15 10:15:00',
      ip: '192.168.1.103',
      status: 'error',
      details: 'Invalid credentials provided',
    },
    {
      id: 5,
      action: 'Settings Change',
      user: 'admin@example.com',
      timestamp: '2024-03-15 10:10:45',
      ip: '192.168.1.101',
      status: 'warning',
      details: 'Modified system email settings',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      default:
        return theme.palette.info.main;
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleExport = () => {
    console.log('Exporting logs...');
  };

  const handleViewDetails = (logId) => {
    console.log('Viewing details for log:', logId);
  };

  return (
    <PageContainer title="Audit Logs">
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              size="small"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={handleSearch}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              sx={{ minWidth: 100 }}
            >
              Filter
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExport}
              sx={{ minWidth: 100 }}
            >
              Export
            </Button>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Logs
                  </Typography>
                  <Typography variant="h4">1,234</Typography>
                </CardContent>
              </MotionCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'success.main' }}>98.5%</Typography>
                </CardContent>
              </MotionCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Error Rate
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'error.main' }}>1.5%</Typography>
                </CardContent>
              </MotionCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Active Users
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'info.main' }}>45</Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          </Grid>

          <TableContainer
            component={Paper}
            sx={{
              height: 'calc(100vh - 380px)',
              '& .MuiTableCell-root': { py: 1.5, px: 2 },
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.timestamp}</TableCell>
                    <TableCell>{log.ip}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.status}
                        size="small"
                        sx={{
                          color: getStatusColor(log.status),
                          bgcolor: `${getStatusColor(log.status)}15`,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(log.id)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default AuditLogs;
