import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Tabs, Tab, TextField, Snackbar, Alert, InputAdornment, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from '@mui/material';
import RegulatoryLogModal, { addRegulatoryLog } from '../components/Product/RegulatoryLogModal';

const mockDisbursements = [
  { id: 1, type: 'Restaurant', recipient: 'Liquor Mart', amount: 500, date: '2025-06-10', status: 'Completed', details: 'Weekly payout' },
  { id: 2, type: 'Deliveryman', recipient: 'Sam Driver', amount: 120, date: '2025-06-12', status: 'Pending', details: 'Delivery fee' },
  { id: 3, type: 'Restaurant', recipient: 'Bourbon House', amount: 300, date: '2025-06-13', status: 'Completed', details: 'Monthly payout' },
];
const statuses = ['All', 'Completed', 'Pending'];

const DisbursementManagement = () => {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [selected, setSelected] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [detail, setDetail] = useState(null);
  const [logOpen, setLogOpen] = useState(false);

  const filtered = mockDisbursements.filter(d =>
    (tab === 0 || d.status === statuses[tab]) &&
    (d.recipient.toLowerCase().includes(search.toLowerCase()) || d.type.toLowerCase().includes(search.toLowerCase())) &&
    (!dateRange.from || d.date >= dateRange.from) &&
    (!dateRange.to || d.date <= dateRange.to)
  );

  const handleExport = () => {
    const csv = 'ID,Type,Recipient,Amount,Date,Status\n' +
      filtered.map(d => `${d.id},${d.type},${d.recipient},${d.amount},${d.date},${d.status}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'disbursements.csv';
    a.click();
    URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: 'Exported as CSV.', severity: 'success' });
    addRegulatoryLog({
      time: new Date().toLocaleString(),
      action: 'Export Disbursements',
      details: `Count: ${filtered.length}`
    });
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
    <Box>
      <Typography variant="h4" gutterBottom>Disbursement Management</Typography>
      <Paper sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {statuses.map(s => <Tab key={s} label={s} />)}
        </Tabs>
        <TextField
          size="small"
          placeholder="Search by recipient or type"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ ml: 'auto', width: 200 }}
          InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment> }}
        />
        <TextField
          size="small"
          type="date"
          label="From"
          value={dateRange.from}
          onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
          sx={{ width: 140 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          type="date"
          label="To"
          value={dateRange.to}
          onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
          sx={{ width: 140 }}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="outlined" onClick={handleExport}>Export CSV</Button>
        <Button onClick={() => setLogOpen(true)} color="secondary">View Regulatory Logs</Button>
      </Paper>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={() => handleBulkStatus('Completed')} disabled={!selected.length}>Mark Completed</Button>
        <Button variant="outlined" onClick={() => handleBulkStatus('Pending')} disabled={!selected.length}>Mark Pending</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Select</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Recipient</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(d => (
              <TableRow key={d.id}>
                <TableCell>
                  <Checkbox checked={selected.includes(d.id)} onChange={() => handleBulkSelect(d.id)} />
                </TableCell>
                <TableCell>{d.id}</TableCell>
                <TableCell>{d.type}</TableCell>
                <TableCell>{d.recipient}</TableCell>
                <TableCell>${d.amount}</TableCell>
                <TableCell>{d.date}</TableCell>
                <TableCell>{d.status}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => setDetail(d)}>View</Button>
                  {d.status === 'Pending' && <Button size="small" color="success" onClick={() => handleStatusUpdate(d.id, 'Completed')}>Mark Completed</Button>}
                  {d.status === 'Completed' && <Button size="small" color="warning" onClick={() => handleStatusUpdate(d.id, 'Pending')}>Mark Pending</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={!!detail} onClose={() => setDetail(null)}>
        <DialogTitle>Disbursement Details</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={2}>
            <Typography>ID: {detail?.id}</Typography>
            <Typography>Type: {detail?.type}</Typography>
            <Typography>Recipient: {detail?.recipient}</Typography>
            <Typography>Amount: ${detail?.amount}</Typography>
            <Typography>Date: {detail?.date}</Typography>
            <Typography>Status: {detail?.status}</Typography>
            <Typography>Details: {detail?.details}</Typography>
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

export default DisbursementManagement;
