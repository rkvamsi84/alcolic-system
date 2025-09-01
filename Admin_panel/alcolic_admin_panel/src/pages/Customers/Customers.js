import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Paper,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { 
  Search, 
  FilterList, 
  Edit, 
  Delete, 
  Person, 
  CheckCircle, 
  Block
} from "@mui/icons-material";
import { apiService, ENDPOINTS } from '../../api/config';

const getStatusColor = (status) => {
  switch (status) {
    case "Active": return "success";
    case "Suspended": return "error";
    default: return "default";
  }
};

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Active");
  const [address, setAddress] = useState("");

  // Fetch customers from backend using apiService
  useEffect(() => {
    apiService.get(`${ENDPOINTS.users.getAll}?role=customer`)
      .then(data => {
        setCustomers(data.data || []);
      })
      .catch(err => {
        console.error('Failed to fetch customers:', err);
      });
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         customer.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Edit customer
  const handleEdit = (customer) => {
    setEditMode(true);
    setSelectedCustomer(customer);
    setName(customer.name);
    setEmail(customer.email);
    setPhone(customer.phone);
    setStatus(customer.status);
    setAddress(customer.address);
    setDialogOpen(true);
  };

  // Delete customer
  const handleDelete = (customerId) => {
    setCustomers(customers.filter(c => c.id !== customerId));
  };

  // Save customer
  const handleSave = () => {
    if (editMode && selectedCustomer) {
      setCustomers(customers.map(customer =>
        customer.id === selectedCustomer.id ? {
          ...customer,
          name,
          email,
          phone,
          status,
          address
        } : customer
      ));
    }
    setDialogOpen(false);
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === "Active").length;
  const suspendedCustomers = customers.filter(c => c.status === "Suspended").length;
  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Customers Management</Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Person sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Customers
                  </Typography>
                  <Typography variant="h4">
                    {totalCustomers}
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
                    Active Customers
                  </Typography>
                  <Typography variant="h4">
                    {activeCustomers}
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
                <Block sx={{ mr: 2, color: 'error.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Suspended
                  </Typography>
                  <Typography variant="h4">
                    {suspendedCustomers}
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
                <Person sx={{ mr: 2, color: 'info.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Spent
                  </Typography>
                  <Typography variant="h4">
                    ${totalSpent.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Customers"
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
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              fullWidth
              onClick={() => setMoreFiltersOpen(true)}
            >
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Customers Grid */}
      <Grid container spacing={3}>
        {filteredCustomers.map((customer) => (
          <Grid item xs={12} sm={6} md={4} key={customer.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar src={customer.image} sx={{ mr: 2, width: 56, height: 56 }} />
                  <Box flex={1}>
                    <Typography variant="h6" gutterBottom>
                      {customer.name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip 
                        label={customer.status} 
                        color={getStatusColor(customer.status)} 
                        size="small" 
                      />
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Email:</strong> {customer.email}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Phone:</strong> {customer.phone}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Address:</strong> {customer.address}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Signup:</strong> {customer.signup}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  <strong>Last Active:</strong> {customer.lastActive}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Orders: {customer.orders}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Spent: ${customer.totalSpent}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Rating 
                      value={
                        typeof customer.rating === 'object' && customer.rating !== null
                          ? customer.rating.average || 0
                          : customer.rating || 0
                      } 
                      readOnly 
                      size="small" 
                    />
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<Edit />}
                  onClick={() => handleEdit(customer)}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  startIcon={<Delete />} 
                  color="error"
                  onClick={() => handleDelete(customer.id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit Customer Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit Customer
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                variant="outlined"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                variant="outlined"
                value={address}
                onChange={e => setAddress(e.target.value)}
                multiline
                rows={2}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* More Filters Dialog */}
      <Dialog open={moreFiltersOpen} onClose={() => setMoreFiltersOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          More Filters
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Min Orders"
                type="number"
                variant="outlined"
                placeholder="0"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Min Total Spent"
                type="number"
                variant="outlined"
                placeholder="0"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Signup Date From"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Signup Date To"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoreFiltersOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setMoreFiltersOpen(false)}>
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}