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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch
} from '@mui/material';
import { MonetizationOn, Add, Edit, Delete, History } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';

const mockTaxes = [
  { id: 1, name: 'State Sales Tax', type: 'Percentage', rate: 8.5, jurisdiction: 'CA', status: true },
  { id: 2, name: 'Bottle Deposit', type: 'Fixed', rate: 0.10, jurisdiction: 'NY', status: false },
];

const TAX_TYPES = ['Percentage', 'Fixed', 'Surcharge'];

function TaxFeeManagement() {
  const [taxes, setTaxes] = useState(mockTaxes);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editTax, setEditTax] = useState(null);
  const [openLog, setOpenLog] = useState(false);

  const filteredTaxes = taxes.filter((t) =>
    (!search || t.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || t.type === filterType) &&
    (!filterStatus || (filterStatus === 'active' ? t.status : !t.status))
  );

  const handleOpenDialog = (tax = null) => {
    setEditTax(tax);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setEditTax(null);
    setOpenDialog(false);
  };
  const handleSaveTax = () => {
    // Save logic (mock)
    setOpenDialog(false);
  };
  const handleDelete = (id) => {
    setTaxes(taxes.filter((t) => t.id !== id));
  };
  const handleStatusToggle = (id) => {
    setTaxes(taxes.map((t) => t.id === id ? { ...t, status: !t.status } : t));
  };
  const handleBulkAction = (action) => {
    if (action === 'activate') {
      setTaxes(taxes.map((t) => selected.includes(t.id) ? { ...t, status: true } : t));
    } else if (action === 'deactivate') {
      setTaxes(taxes.map((t) => selected.includes(t.id) ? { ...t, status: false } : t));
    } else if (action === 'delete') {
      setTaxes(taxes.filter((t) => !selected.includes(t.id)));
    }
    setSelected([]);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><MonetizationOn sx={{ mr: 1 }} />Tax & Fee Management</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField label="Search" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select value={filterType} label="Type" onChange={e => setFilterType(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {TAX_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Tax/Fee</Button>
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
              <TableCell>Rate/Amount</TableCell>
              <TableCell>Jurisdiction</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTaxes.map((tax) => (
              <TableRow key={tax.id} selected={selected.includes(tax.id)}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(tax.id)}
                    onChange={e => {
                      setSelected(e.target.checked
                        ? [...selected, tax.id]
                        : selected.filter(id => id !== tax.id));
                    }}
                  />
                </TableCell>
                <TableCell>{tax.name}</TableCell>
                <TableCell><Chip label={tax.type} size="small" /></TableCell>
                <TableCell>{tax.type === 'Percentage' ? `${tax.rate}%` : `$${tax.rate}`}</TableCell>
                <TableCell>{tax.jurisdiction}</TableCell>
                <TableCell>
                  <Switch checked={tax.status} onChange={() => handleStatusToggle(tax.id)} color="success" />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => handleOpenDialog(tax)}><Edit fontSize="small" /></Button>
                  <Button size="small" color="error" onClick={() => handleDelete(tax.id)}><Delete fontSize="small" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredTaxes.length === 0 && (
              <TableRow><TableCell colSpan={7}><Typography align="center">No taxes/fees found.</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Add/Edit Tax/Fee Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editTax ? 'Edit Tax/Fee' : 'Add Tax/Fee'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Name" defaultValue={editTax?.name || ''} fullWidth size="small" />
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select defaultValue={editTax?.type || ''} label="Type">
                {TAX_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Rate/Amount" defaultValue={editTax?.rate || ''} fullWidth size="small" type="number" />
            <TextField label="Jurisdiction" defaultValue={editTax?.jurisdiction || ''} fullWidth size="small" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveTax} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module="Taxes & Fees" />
    </Box>
  );
}

export default TaxFeeManagement;
