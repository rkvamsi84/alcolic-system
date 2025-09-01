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
import { Campaign, Add, Edit, Delete, History } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';

const mockMessages = [
  { id: 1, title: 'System Maintenance', message: 'Scheduled maintenance on June 20th.', recipients: 'All Staff', status: 'Active', date: '2025-06-18' },
  { id: 2, title: 'Policy Update', message: 'Updated return policy effective July 1st.', recipients: 'All Users', status: 'Inactive', date: '2025-06-10' },
];

const STATUS_COLORS = { Active: 'success', Inactive: 'default', Scheduled: 'warning' };
const RECIPIENTS = ['All Staff', 'All Users', 'Managers', 'Drivers'];

function InternalMessagingAnnouncements() {
  const [messages, setMessages] = useState(mockMessages);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMsg, setEditMsg] = useState(null);
  const [openLog, setOpenLog] = useState(false);

  const filteredMessages = messages.filter((m) =>
    (!search || m.title.toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || m.status === filterStatus)
  );

  const handleOpenDialog = (msg = null) => {
    setEditMsg(msg);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setEditMsg(null);
    setOpenDialog(false);
  };
  const handleSaveMsg = () => {
    // Save logic (mock)
    setOpenDialog(false);
  };
  const handleDelete = (id) => {
    setMessages(messages.filter((m) => m.id !== id));
  };
  const handleStatusToggle = (id) => {
    setMessages(messages.map((m) => m.id === id ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m));
  };
  const handleBulkAction = (action) => {
    if (action === 'activate') {
      setMessages(messages.map((m) => selected.includes(m.id) ? { ...m, status: 'Active' } : m));
    } else if (action === 'deactivate') {
      setMessages(messages.map((m) => selected.includes(m.id) ? { ...m, status: 'Inactive' } : m));
    } else if (action === 'delete') {
      setMessages(messages.filter((m) => !selected.includes(m.id)));
    }
    setSelected([]);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><Campaign sx={{ mr: 1 }} />Internal Messaging & Announcements</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField label="Search title" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
            <MenuItem value="Scheduled">Scheduled</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Message</Button>
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
              <TableCell>Title</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Recipients</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMessages.map((msg) => (
              <TableRow key={msg.id} selected={selected.includes(msg.id)}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(msg.id)}
                    onChange={e => {
                      setSelected(e.target.checked
                        ? [...selected, msg.id]
                        : selected.filter(id => id !== msg.id));
                    }}
                  />
                </TableCell>
                <TableCell>{msg.title}</TableCell>
                <TableCell>{msg.message}</TableCell>
                <TableCell>{msg.recipients}</TableCell>
                <TableCell>
                  <Switch checked={msg.status === 'Active'} onChange={() => handleStatusToggle(msg.id)} color="success" />
                  <Chip label={msg.status} color={STATUS_COLORS[msg.status] || 'default'} size="small" sx={{ ml: 1 }} />
                </TableCell>
                <TableCell>{msg.date}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => handleOpenDialog(msg)}><Edit fontSize="small" /></Button>
                  <Button size="small" color="error" onClick={() => handleDelete(msg.id)}><Delete fontSize="small" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredMessages.length === 0 && (
              <TableRow><TableCell colSpan={7}><Typography align="center">No messages found.</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Add/Edit Message Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMsg ? 'Edit Message' : 'Add Message'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Title" defaultValue={editMsg?.title || ''} fullWidth size="small" />
            <TextField label="Message" defaultValue={editMsg?.message || ''} fullWidth size="small" multiline rows={3} />
            <FormControl size="small" fullWidth>
              <InputLabel>Recipients</InputLabel>
              <Select defaultValue={editMsg?.recipients || ''} label="Recipients">
                {RECIPIENTS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Date" type="date" defaultValue={editMsg?.date || ''} fullWidth size="small" InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveMsg} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module="Internal Messaging" />
    </Box>
  );
}

export default InternalMessagingAnnouncements;
