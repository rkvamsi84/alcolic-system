import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Switch,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { DynamicForm, Add, Edit, Delete, History } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';

const mockFields = [
  { id: 1, name: 'ABV', type: 'Number', module: 'Products', status: 'Active' },
  { id: 2, name: 'Customer Notes', type: 'Text', module: 'Orders', status: 'Inactive' },
];

const FIELD_TYPES = ['Text', 'Number', 'Date', 'Boolean', 'Dropdown'];
const MODULES = ['Products', 'Orders', 'Customers', 'Stores'];
const STATUS_COLORS = { Active: 'success', Inactive: 'default' };

function CustomFieldsMetadataManagement() {
  const [fields, setFields] = useState(mockFields);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editField, setEditField] = useState(null);
  const [openLog, setOpenLog] = useState(false);

  const filteredFields = fields.filter((f) =>
    (!search || f.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || f.type === filterType) &&
    (!filterModule || f.module === filterModule) &&
    (!filterStatus || f.status === filterStatus)
  );

  const handleOpenDialog = (field = null) => {
    setEditField(field);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setEditField(null);
    setOpenDialog(false);
  };
  const handleSaveField = () => {
    // Save logic (mock)
    setOpenDialog(false);
  };
  const handleDelete = (id) => {
    setFields(fields.filter((f) => f.id !== id));
  };
  const handleStatusToggle = (id) => {
    setFields(fields.map((f) => f.id === id ? { ...f, status: f.status === 'Active' ? 'Inactive' : 'Active' } : f));
  };
  const handleBulkAction = (action) => {
    if (action === 'activate') {
      setFields(fields.map((f) => selected.includes(f.id) ? { ...f, status: 'Active' } : f));
    } else if (action === 'deactivate') {
      setFields(fields.map((f) => selected.includes(f.id) ? { ...f, status: 'Inactive' } : f));
    } else if (action === 'delete') {
      setFields(fields.filter((f) => !selected.includes(f.id)));
    }
    setSelected([]);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><DynamicForm sx={{ mr: 1 }} />Custom Fields & Metadata Management</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField label="Search name" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select value={filterType} label="Type" onChange={e => setFilterType(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {FIELD_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Module</InputLabel>
          <Select value={filterModule} label="Module" onChange={e => setFilterModule(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {MODULES.map(mod => <MenuItem key={mod} value={mod}>{mod}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Field</Button>
        <Button variant="outlined" color="primary" disabled={selected.length === 0} onClick={() => handleBulkAction('activate')}>Activate</Button>
        <Button variant="outlined" color="warning" disabled={selected.length === 0} onClick={() => handleBulkAction('deactivate')}>Deactivate</Button>
        <Button variant="outlined" color="error" disabled={selected.length === 0} onClick={() => handleBulkAction('delete')}>Delete</Button>
        <Button variant="text" startIcon={<History />} onClick={() => setOpenLog(true)}>Regulatory Logs</Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFields.map((field) => (
              <TableRow key={field.id} selected={selected.includes(field.id)}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(field.id)}
                    onChange={e => {
                      setSelected(e.target.checked
                        ? [...selected, field.id]
                        : selected.filter(id => id !== field.id));
                    }}
                  />
                </TableCell>
                <TableCell>{field.name}</TableCell>
                <TableCell>{field.type}</TableCell>
                <TableCell>{field.module}</TableCell>
                <TableCell>
                  <Switch checked={field.status === 'Active'} onChange={() => handleStatusToggle(field.id)} color="success" />
                  <Chip label={field.status} color={STATUS_COLORS[field.status] || 'default'} size="small" sx={{ ml: 1 }} />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => handleOpenDialog(field)}><Edit fontSize="small" /></Button>
                  <Button size="small" color="error" onClick={() => handleDelete(field.id)}><Delete fontSize="small" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredFields.length === 0 && (
              <TableRow><TableCell colSpan={6}><Typography align="center">No custom fields found.</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Add/Edit Field Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editField ? 'Edit Field' : 'Add Field'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Name" defaultValue={editField?.name || ''} fullWidth size="small" />
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select defaultValue={editField?.type || ''} label="Type">
                {FIELD_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Module</InputLabel>
              <Select defaultValue={editField?.module || ''} label="Module">
                {MODULES.map(mod => <MenuItem key={mod} value={mod}>{mod}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveField} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module="Custom Fields" />
    </Box>
  );
}

export default CustomFieldsMetadataManagement;
