import { Box, Typography, Grid, Card, CardContent, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Chip, FormControl, InputLabel, Select, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert } from "@mui/material";
import { History, Search, Download, FilterList, Close } from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://alcolic-backend.onrender.com/api/v1';

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
};

const getStatusColor = (status) => {
  switch (status) {
    case "Success": return "success";
    case "Failed": return "error";
    case "Warning": return "warning";
    default: return "default";
  }
};

const getModuleColor = (module) => {
  switch (module) {
    case "Products": return "primary";
    case "Orders": return "success";
    case "Payments": return "info";
    case "Support": return "warning";
    case "Authentication": return "error";
    default: return "default";
  }
};

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch audit logs from API
  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/admin/audit-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Transform API data to match our component structure
        const transformedLogs = response.data.data.map(log => ({
          id: log._id,
          user: log.user?.email || log.userId || 'Unknown User',
          role: log.user?.role || 'Unknown Role',
          action: log.action || 'Unknown Action',
          module: log.module || 'Unknown Module',
          date: new Date(log.timestamp).toISOString().split('T')[0],
          time: new Date(log.timestamp).toLocaleTimeString(),
          details: log.details || log.description || 'No details available',
          ip: log.ipAddress || log.ip || 'Unknown',
          status: log.status || 'Success'
        }));
        setAuditLogs(transformedLogs);
      } else {
        setError('Failed to fetch audit logs');
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === "all" || log.module === moduleFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesDate = !dateFilter || log.date === dateFilter;
    return matchesSearch && matchesModule && matchesStatus && matchesDate;
  });

  const handleExportLogs = () => {
    // Create CSV content
    const headers = ["User", "Role", "Action", "Module", "Date", "Time", "Details", "IP Address", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(log => [
        log.user,
        log.role,
        log.action,
        log.module,
        log.date,
        log.time,
        `"${log.details}"`,
        log.ip,
        log.status
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleMoreFilters = () => {
    setFiltersDialogOpen(true);
  };

  const handleClearFilters = () => {
    setModuleFilter("all");
    setStatusFilter("all");
    setDateFilter("");
    setFiltersDialogOpen(false);
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading audit logs...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Audit Logs</Typography>
        <Button 
          variant="contained" 
          startIcon={<Download />}
          onClick={handleExportLogs}
        >
          Export Logs
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField 
              fullWidth 
              label="Search Logs" 
              variant="outlined" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              InputProps={{ 
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> 
              }} 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              variant="outlined" 
              startIcon={<FilterList />} 
              fullWidth
              onClick={handleMoreFilters}
            >
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {log.user}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {log.role}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {log.action}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={log.module} 
                    color={getModuleColor(log.module)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {log.date}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {log.time}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200 }}>
                    {log.details}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary" fontFamily="monospace">
                    {log.ip}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={log.status} 
                    color={getStatusColor(log.status)} 
                    size="small" 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* More Filters Dialog */}
      <Dialog open={filtersDialogOpen} onClose={() => setFiltersDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Advanced Filters
          <IconButton
            aria-label="close"
            onClick={() => setFiltersDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Module</InputLabel>
              <Select 
                value={moduleFilter} 
                label="Module" 
                onChange={(e) => setModuleFilter(e.target.value)}
              >
                <MenuItem value="all">All Modules</MenuItem>
                <MenuItem value="Products">Products</MenuItem>
                <MenuItem value="Orders">Orders</MenuItem>
                <MenuItem value="Payments">Payments</MenuItem>
                <MenuItem value="Support">Support</MenuItem>
                <MenuItem value="Authentication">Authentication</MenuItem>
                <MenuItem value="CMS">CMS</MenuItem>
                <MenuItem value="Stores">Stores</MenuItem>
                <MenuItem value="Reports">Reports</MenuItem>
                <MenuItem value="Refunds">Refunds</MenuItem>
                <MenuItem value="Admin Users">Admin Users</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select 
                value={statusFilter} 
                label="Status" 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Success">Success</MenuItem>
                <MenuItem value="Failed">Failed</MenuItem>
                <MenuItem value="Warning">Warning</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Date Filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearFilters}>Clear All</Button>
          <Button variant="contained" onClick={() => setFiltersDialogOpen(false)}>Apply Filters</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}