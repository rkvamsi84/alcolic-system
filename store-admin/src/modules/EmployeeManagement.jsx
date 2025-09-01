import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Snackbar,
  Tooltip,
  Switch,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';

// Demo/mock data
const initialEmployees = [
  {
    id: 1,
    name: 'Jane Doe',
    email: 'jane.doe@retailer.com',
    role: 'Manager',
    status: true,
    lastActive: '2025-06-17',
  },
  {
    id: 2,
    name: 'John Smith',
    email: 'john.smith@retailer.com',
    role: 'Cashier',
    status: false,
    lastActive: '2025-06-15',
  },
];

const roles = ['Manager', 'Cashier', 'Inventory', 'Compliance', 'Admin'];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState('');
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [openLog, setOpenLog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleSearch = (e) => setSearch(e.target.value);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (emp) => {
    setEditData(emp);
    setOpenEdit(true);
  };

  const handleAdd = () => {
    setEditData({ name: '', email: '', role: roles[0], status: true });
    setOpenEdit(true);
  };

  const handleSave = () => {
    if (editData.id) {
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === editData.id ? editData : emp))
      );
      setSnackbar({ open: true, message: 'Employee updated.' });
    } else {
      setEmployees((prev) => [
        ...prev,
        { ...editData, id: Date.now(), lastActive: new Date().toISOString().slice(0, 10) },
      ]);
      setSnackbar({ open: true, message: 'Employee added.' });
    }
    setOpenEdit(false);
  };

  const handleDelete = (id) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    setSnackbar({ open: true, message: 'Employee deleted.' });
  };

  const handleStatusToggle = (emp) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, status: !e.status } : e))
    );
    setSnackbar({ open: true, message: 'Status updated.' });
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Employee Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Employee
        </Button>
      </Box>
      <Box mb={2} display="flex" gap={2}>
        <TextField
          label="Search by name or email"
          value={search}
          onChange={handleSearch}
          size="small"
        />
        <Button
          variant="outlined"
          startIcon={<SecurityIcon />}
          onClick={() => setOpenLog(true)}
        >
          Regulatory Logs
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.name}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.role}</TableCell>
                <TableCell>
                  <Switch
                    checked={emp.status}
                    onChange={() => handleStatusToggle(emp)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>{emp.lastActive}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(emp)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(emp.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredEmployees.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>{editData?.id ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        <DialogContent sx={{ minWidth: 350 }}>
          <TextField
            label="Name"
            value={editData?.name || ''}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            value={editData?.email || ''}
            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={editData?.role || roles[0]}
              label="Role"
              onChange={(e) => setEditData({ ...editData, role: e.target.value })}
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box display="flex" alignItems="center" mt={1}>
            <Typography>Status</Typography>
            <Switch
              checked={editData?.status || false}
              onChange={() => setEditData({ ...editData, status: !editData.status })}
              color="primary"
              sx={{ ml: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module="Employee" />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Box>
  );
}
