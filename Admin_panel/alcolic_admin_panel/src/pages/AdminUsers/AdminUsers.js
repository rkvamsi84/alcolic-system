import React, { useState } from "react";
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { 
  AdminPanelSettings, 
  Search, 
  FilterList, 
  Add, 
  Edit, 
  Delete
} from "@mui/icons-material";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://alcolic-backend.onrender.com/api/v1';

// Mock data for admin users
const mockAdmins = [
  { 
    id: 1, 
    name: "Super Admin", 
    email: "admin@alcolic.com", 
    role: "Super Admin", 
    lastLogin: "2024-01-15", 
    status: "Active",
    permissions: ["all"],
    department: "Management",
    phone: "+1-555-0101"
  },
  { 
    id: 2, 
    name: "Support Admin", 
    email: "support@alcolic.com", 
    role: "Support Admin", 
    lastLogin: "2024-01-14", 
    status: "Active",
    permissions: ["support", "customers", "orders"],
    department: "Customer Support",
    phone: "+1-555-0102"
  },
  { 
    id: 3, 
    name: "Finance Admin", 
    email: "finance@alcolic.com", 
    role: "Finance Admin", 
    lastLogin: "2024-01-13", 
    status: "Suspended",
    permissions: ["finance", "payments", "refunds"],
    department: "Finance",
    phone: "+1-555-0103"
  },
  { 
    id: 4, 
    name: "Content Admin", 
    email: "content@alcolic.com", 
    role: "Content Admin", 
    lastLogin: "2024-01-12", 
    status: "Active",
    permissions: ["content", "products", "cms"],
    department: "Marketing",
    phone: "+1-555-0104"
  }
];

const getStatusColor = (status) => {
  switch (status) {
    case "Active": return "success";
    case "Suspended": return "error";
    default: return "default";
  }
};

const roles = [
  "Super Admin",
  "Support Admin", 
  "Finance Admin",
  "Content Admin",
  "Operations Admin"
];

const departments = [
  "Management",
  "Customer Support",
  "Finance", 
  "Marketing",
  "Operations",
  "IT"
];

const permissions = [
  "all",
  "dashboard",
  "orders",
  "products", 
  "customers",
  "drivers",
  "stores",
  "finance",
  "payments",
  "refunds",
  "support",
  "content",
  "cms",
  "analytics",
  "settings"
];

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [admins, setAdmins] = useState(mockAdmins);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Active");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || admin.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Add new admin
  const handleAdd = () => {
    setEditMode(false);
    setSelectedAdmin(null);
    setName("");
    setEmail("");
    setRole("");
    setStatus("Active");
    setDepartment("");
    setPhone("");
    setSelectedPermissions([]);
    setDialogOpen(true);
  };

  // Edit admin
  const handleEdit = (admin) => {
    setEditMode(true);
    setSelectedAdmin(admin);
    setName(admin.name);
    setEmail(admin.email);
    setRole(admin.role);
    setStatus(admin.status);
    setDepartment(admin.department);
    setPhone(admin.phone);
    setSelectedPermissions(admin.permissions);
    setDialogOpen(true);
  };

  // Delete admin
  const handleDelete = (adminId) => {
    setAdmins(admins.filter(a => a.id !== adminId));
  };

  // Save admin
  const handleSave = () => {
    if (editMode && selectedAdmin) {
      setAdmins(admins.map(admin =>
        admin.id === selectedAdmin.id ? {
          ...admin,
          name,
          email,
          role,
          status,
          department,
          phone,
          permissions: selectedPermissions
        } : admin
      ));
    } else {
      const newId = Math.max(...admins.map(a => a.id)) + 1;
      const newAdmin = {
        id: newId,
        name,
        email,
        role,
        status,
        department,
        phone,
        permissions: selectedPermissions,
        lastLogin: new Date().toISOString().split('T')[0]
      };
      setAdmins([...admins, newAdmin]);
    }
    setDialogOpen(false);
  };

  const totalAdmins = admins.length;
  const activeAdmins = admins.filter(a => a.status === "Active").length;
  const suspendedAdmins = admins.filter(a => a.status === "Suspended").length;
  const superAdmins = admins.filter(a => a.role === "Super Admin").length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Admin Users & Roles</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
          Add Admin
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AdminPanelSettings sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Admins
                  </Typography>
                  <Typography variant="h4">
                    {totalAdmins}
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
                <AdminPanelSettings sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Admins
                  </Typography>
                  <Typography variant="h4">
                    {activeAdmins}
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
                <AdminPanelSettings sx={{ mr: 2, color: 'error.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Suspended
                  </Typography>
                  <Typography variant="h4">
                    {suspendedAdmins}
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
                <AdminPanelSettings sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Super Admins
                  </Typography>
                  <Typography variant="h4">
                    {superAdmins}
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
              label="Search Admins"
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
              <InputLabel>Role Filter</InputLabel>
              <Select
                value={roleFilter}
                label="Role Filter"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                {roles.map(roleName => (
                  <MenuItem key={roleName} value={roleName}>{roleName}</MenuItem>
                ))}
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

      {/* Admins Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAdmins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.role}</TableCell>
                <TableCell>{admin.department}</TableCell>
                <TableCell>{admin.lastLogin}</TableCell>
                <TableCell>
                  <Chip 
                    label={admin.status} 
                    color={getStatusColor(admin.status)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    size="small" 
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => handleEdit(admin)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDelete(admin.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Admin Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? "Edit Admin User" : "Add New Admin User"}
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
                <InputLabel>Role</InputLabel>
                <Select value={role} label="Role" onChange={e => setRole(e.target.value)}>
                  {roles.map(roleName => (
                    <MenuItem key={roleName} value={roleName}>{roleName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select value={department} label="Department" onChange={e => setDepartment(e.target.value)}>
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              <FormControl fullWidth>
                <InputLabel>Permissions</InputLabel>
                <Select
                  multiple
                  value={selectedPermissions}
                  label="Permissions"
                  onChange={e => setSelectedPermissions(e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {permissions.map((permission) => (
                    <MenuItem key={permission} value={permission}>
                      {permission}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editMode ? "Save Changes" : "Add Admin"}
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
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select value="" label="Department">
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value="" label="Status">
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Login From"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Login To"
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