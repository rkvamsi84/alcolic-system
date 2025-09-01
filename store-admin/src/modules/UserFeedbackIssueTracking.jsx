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
  InputLabel
} from '@mui/material';
import { Feedback, Add, Edit, Delete, History, CheckCircle, Cancel } from '@mui/icons-material';
import RegulatoryLogModal from '../components/Product/RegulatoryLogModal';

const mockFeedback = [
  { id: 1, user: 'john.doe', type: 'Bug', message: 'Order status not updating.', status: 'Open', created: '2025-06-15' },
  { id: 2, user: 'jane.smith', type: 'Feedback', message: 'Add more filter options.', status: 'Resolved', created: '2025-06-10' },
];

const FEEDBACK_TYPES = ['Bug', 'Feedback', 'Feature Request'];
const STATUS_COLORS = { Open: 'warning', Resolved: 'success', Closed: 'default' };

function UserFeedbackIssueTracking() {
  const [feedback, setFeedback] = useState(mockFeedback);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [openLog, setOpenLog] = useState(false);

  const filteredFeedback = feedback.filter((f) =>
    (!search || f.message.toLowerCase().includes(search.toLowerCase()) || f.user.toLowerCase().includes(search.toLowerCase())) &&
    (!filterType || f.type === filterType) &&
    (!filterStatus || f.status === filterStatus)
  );

  const handleOpenDialog = (item = null) => {
    setEditItem(item);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setEditItem(null);
    setOpenDialog(false);
  };
  const handleSave = () => {
    // Save logic (mock)
    setOpenDialog(false);
  };
  const handleDelete = (id) => {
    setFeedback(feedback.filter((f) => f.id !== id));
  };
  const handleStatusChange = (id, status) => {
    setFeedback(feedback.map((f) => f.id === id ? { ...f, status } : f));
  };
  const handleBulkAction = (action) => {
    if (action === 'resolve') {
      setFeedback(feedback.map((f) => selected.includes(f.id) ? { ...f, status: 'Resolved' } : f));
    } else if (action === 'close') {
      setFeedback(feedback.map((f) => selected.includes(f.id) ? { ...f, status: 'Closed' } : f));
    } else if (action === 'delete') {
      setFeedback(feedback.filter((f) => !selected.includes(f.id)));
    }
    setSelected([]);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}><Feedback sx={{ mr: 1 }} />User Feedback & Issue Tracking</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField label="Search user/message" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select value={filterType} label="Type" onChange={e => setFilterType(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {FEEDBACK_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="Resolved">Resolved</MenuItem>
            <MenuItem value="Closed">Closed</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add Feedback/Issue</Button>
        <Button variant="outlined" color="success" disabled={selected.length === 0} onClick={() => handleBulkAction('resolve')} startIcon={<CheckCircle />}>Resolve</Button>
        <Button variant="outlined" color="inherit" disabled={selected.length === 0} onClick={() => handleBulkAction('close')} startIcon={<Cancel />}>Close</Button>
        <Button variant="outlined" color="error" disabled={selected.length === 0} onClick={() => handleBulkAction('delete')}>Delete</Button>
        <Button variant="text" startIcon={<History />} onClick={() => setOpenLog(true)}>Regulatory Logs</Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>User</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFeedback.map((item) => (
              <TableRow key={item.id} selected={selected.includes(item.id)}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={e => {
                      setSelected(e.target.checked
                        ? [...selected, item.id]
                        : selected.filter(id => id !== item.id));
                    }}
                  />
                </TableCell>
                <TableCell>{item.user}</TableCell>
                <TableCell><Chip label={item.type} size="small" /></TableCell>
                <TableCell>{item.message}</TableCell>
                <TableCell><Chip label={item.status} color={STATUS_COLORS[item.status] || 'default'} size="small" /></TableCell>
                <TableCell>{item.created}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => handleOpenDialog(item)}><Edit fontSize="small" /></Button>
                  <Button size="small" color="error" onClick={() => handleDelete(item.id)}><Delete fontSize="small" /></Button>
                  {item.status !== 'Resolved' && <Button size="small" color="success" onClick={() => handleStatusChange(item.id, 'Resolved')} startIcon={<CheckCircle fontSize="small" />}>Resolve</Button>}
                  {item.status !== 'Closed' && <Button size="small" color="inherit" onClick={() => handleStatusChange(item.id, 'Closed')} startIcon={<Cancel fontSize="small" />}>Close</Button>}
                </TableCell>
              </TableRow>
            ))}
            {filteredFeedback.length === 0 && (
              <TableRow><TableCell colSpan={7}><Typography align="center">No feedback/issues found.</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Add/Edit Feedback/Issue Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem ? 'Edit Feedback/Issue' : 'Add Feedback/Issue'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="User" defaultValue={editItem?.user || ''} fullWidth size="small" />
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select defaultValue={editItem?.type || ''} label="Type">
                {FEEDBACK_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Message" defaultValue={editItem?.message || ''} fullWidth size="small" multiline rows={3} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Regulatory Log Modal */}
      <RegulatoryLogModal open={openLog} onClose={() => setOpenLog(false)} module="User Feedback & Issues" />
    </Box>
  );
}

export default UserFeedbackIssueTracking;
