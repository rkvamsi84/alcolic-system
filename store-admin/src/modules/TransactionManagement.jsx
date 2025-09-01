import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Snackbar, Alert, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Stack, MenuItem, Checkbox } from '@mui/material';
import RegulatoryLogModal, { addRegulatoryLog } from '../components/Product/RegulatoryLogModal';

const tabs = [
  { label: 'Cash Collection', key: 'cash' },
  { label: 'Store Withdrawals', key: 'withdrawals' },
  { label: 'Delivery Payments', key: 'delivery' },
  { label: 'Withdrawal Methods', key: 'methods' },
];

const mockData = {
  cash: [
    { id: 1, date: '2025-06-10', collector: 'Sam Driver', amount: 200, store: 'Liquor Mart' },
  ],
  withdrawals: [
    { id: 1, date: '2025-06-11', store: 'Bourbon House', amount: 300, status: 'Pending', method: 'Bank', details: 'Weekly withdrawal' },
  ],
  delivery: [
    { id: 1, date: '2025-06-12', deliveryman: 'Alex Rider', amount: 120, status: 'Paid', details: 'Delivery payment' },
  ],
  methods: [
    { id: 1, method: 'Bank', details: 'Bank of America', status: 'Active' },
    { id: 2, method: 'PayPal', details: 'paypal@liquor.com', status: 'Inactive' },
  ],
};

const TransactionManagement = () => {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [editMethod, setEditMethod] = useState(null);
  const [methodDetails, setMethodDetails] = useState('');
  const [selected, setSelected] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [detail, setDetail] = useState(null);
  const [logOpen, setLogOpen] = useState(false);

  const data = mockData[tabs[tab].key] || [];
  const filtered = data.filter(row =>
    Object.values(row).some(val => String(val).toLowerCase().includes(search.toLowerCase())) &&
    (!dateRange.from || row.date >= dateRange.from) &&
    (!dateRange.to || row.date <= dateRange.to)
  );

  const handleExport = () => {
    const csv = Object.keys(filtered[0] || {}).join(',') + '\n' +
      filtered.map(row => Object.values(row).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tabs[tab].key}-transactions.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: 'Exported as CSV.', severity: 'success' });
    addRegulatoryLog({
      time: new Date().toLocaleString(),
      action: 'Export CSV',
      details: `Tab: ${tabs[tab].key}, Count: ${filtered.length}`
    });
  };

  const handleEdit = (method) => {
    setEditMethod(method);
    setMethodDetails(method.details);
  };

  const handleSave = () => {
    setSnackbar({ open: true, message: 'Withdrawal method updated.', severity: 'success' });
    addRegulatoryLog({
      time: new Date().toLocaleString(),
      action: 'Edit Withdrawal Method',
      details: `Method: ${editMethod?.method}`
    });
    setEditMethod(null);
    setMethodDetails('');
  };

  const handleStatusUpdate = (id, status) => {
    setSnackbar({ open: true, message: `Status updated to ${status}.`, severity: 'success' });
    addRegulatoryLog({
      time: new Date().toLocaleString(),
      action: 'Status Update',
      details: `ID: ${id}, New Status: ${status}`
    });
  };

  const handleBulkSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkStatus = (status) => {
    setSnackbar({ open: true, message: `Bulk status updated to ${status}.`, severity: 'success' });
    addRegulatoryLog({
      time: new Date().toLocaleString(),
      action: 'Bulk Status Update',
      details: `IDs: ${selected.join(',')}, New Status: ${status}`
    });
    setSelected([]);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Transaction Management</Typography>
      <Paper sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {tabs.map(t => <Tab key={t.key} label={t.label} />)}
        </Tabs>
        <TextField
          size="small"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ ml: 'auto', width: 180 }}
          InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment> }}
        />
        <TextField
          size="small"
          type="date"
          label="From"
          value={dateRange.from}
          onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
          sx={{ width: 120 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          type="date"
          label="To"
          value={dateRange.to}
          onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
          sx={{ width: 120 }}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="outlined" onClick={handleExport}>Export CSV</Button>
        <Button onClick={() => setLogOpen(true)} color="secondary">View Regulatory Logs</Button>
      </Paper>
      {(tab === 1 || tab === 2) && (
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={() => handleBulkStatus(tab === 1 ? 'Paid' : 'Pending')} disabled={!selected.length}>
            Mark {tab === 1 ? 'Paid' : 'Pending'}
          </Button>
        </Box>
      )}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {(tab === 1 || tab === 2) && <TableCell>Select</TableCell>}
              {Object.keys(filtered[0] || {}).map(col => <TableCell key={col}>{col}</TableCell>)}
              {(tab === 1 || tab === 2) && <TableCell>Actions</TableCell>}
              {tab === 3 && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(row => (
              <TableRow key={row.id}>
                {(tab === 1 || tab === 2) && (
                  <TableCell>
                    <Checkbox checked={selected.includes(row.id)} onChange={() => handleBulkSelect(row.id)} />
                  </TableCell>
                )}
                {Object.values(row).map((cell, i) => <TableCell key={i}>{cell}</TableCell>)}
                {(tab === 1 || tab === 2) && (
                  <TableCell>
                    <Button size="small" onClick={() => setDetail(row)}>View</Button>
                    {row.status === 'Pending' && <Button size="small" color="success" onClick={() => handleStatusUpdate(row.id, 'Paid')}>Mark Paid</Button>}
                    {row.status === 'Paid' && <Button size="small" color="warning" onClick={() => handleStatusUpdate(row.id, 'Pending')}>Mark Pending</Button>}
                  </TableCell>
                )}
                {tab === 3 && (
                  <TableCell>
                    <Button size="small" onClick={() => handleEdit(row)}>Edit</Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={!!editMethod} onClose={() => setEditMethod(null)}>
        <DialogTitle>Edit Withdrawal Method</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={2}>
            <TextField label="Method" value={editMethod?.method || ''} fullWidth disabled />
            <TextField label="Details" value={methodDetails} onChange={e => setMethodDetails(e.target.value)} fullWidth />
            <TextField select label="Status" value={editMethod?.status || ''} fullWidth>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMethod(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!detail} onClose={() => setDetail(null)}>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={2}>
            {detail && Object.entries(detail).map(([k, v]) => (
              <Typography key={k}><b>{k}:</b> {v}</Typography>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetail(null)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
      <RegulatoryLogModal open={logOpen} onClose={() => setLogOpen(false)} />
    </Box>
  );
};

export default TransactionManagement;
